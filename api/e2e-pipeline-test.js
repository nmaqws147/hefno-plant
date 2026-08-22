/* E2E pipeline test against live production (https://hefnoplant.site) */
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const admin = require('firebase-admin');
const { getDb } = require('./_lib/firebaseAdmin');

const BASE = 'https://hefnoplant.site';
const WEB_API_KEY = 'AIzaSyCURFXkspCxhvYWj66r4fFldTyBgFqxEdI';

const TEST_EMAIL = `pipeline-${Date.now()}@test.com`;
const TEST_PASS = 'TestPass123!';
let results = [];
let uid;

function check(name, ok, detail = '') {
  results.push({ name, ok, detail });
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${detail ? '  — ' + detail : ''}`);
}

async function firebaseSignIn() {
  const res = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${WEB_API_KEY}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: TEST_EMAIL, password: TEST_PASS, returnSecureToken: true }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error('signIn failed: ' + JSON.stringify(data));
  return data.idToken;
}

async function apiCall(method, path, token, body) {
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  let json = null;
  try { json = JSON.parse(text); } catch {}
  return { status: res.status, json };
}

(async () => {
  try {
    const db = getDb();
    if (!db) throw new Error('Firebase Admin not initialized — check env');

    // 1. Create a fresh test user
    const user = await admin.auth().createUser({ email: TEST_EMAIL, password: TEST_PASS, displayName: 'Pipeline Test' });
    uid = user.uid;
    check('Test user created', !!uid, TEST_EMAIL);

    // 2. Sign in to get a real ID token
    let token;
    try {
      token = await firebaseSignIn();
      check('Sign-in + real ID token', !!token);
    } catch (e) {
      check('Sign-in + real ID token', false, e.message);
      throw e;
    }

    // 3. Unauthenticated should fail
    const noAuth = await apiCall('POST', '/api/vodafone-cash/confirm', null, { plan: 'premium', billingCycle: 'monthly' });
    check('Unauth confirm rejected', noAuth.status === 401, `status=${noAuth.status}`);

    // 4. Initiate (user)
    const init = await apiCall('POST', '/api/vodafone-cash/initiate', token, { plan: 'premium', billingCycle: 'monthly' });
    check('Initiate returns phone+amount', init.status === 200 && init.json?.phoneNumber === '01004653117' && init.json?.amount === 50,
      `status=${init.status} phone=${init.json?.phoneNumber} amount=${init.json?.amount}`);

    // 5. Confirm (user) -> creates pending
    const confirm = await apiCall('POST', '/api/vodafone-cash/confirm', token, { plan: 'premium', billingCycle: 'monthly', reference: 'E2E-REF-1' });
    const paymentId = confirm.json?.paymentId;
    check('Confirm creates pending payment', confirm.status === 200 && confirm.json?.status === 'pending', `paymentId=${paymentId}`);
    if (!paymentId) throw new Error('no paymentId');

    // 6. Verify NOT activated yet (subscription should not exist / not premium)
    const subBefore = await apiCall('GET', '/api/subscription', token);
    const notActivated = !subBefore.json || subBefore.json?.plan !== 'premium';
    check('Not activated before admin', notActivated, JSON.stringify(subBefore.json));

    // 7. Non-admin cannot activate
    const nonAdminActivate = await apiCall('POST', '/api/vodafone-cash/activate', token, { paymentId });
    check('Non-admin activate blocked', nonAdminActivate.status === 403, `status=${nonAdminActivate.status}`);

    // 8. Make the test user an admin
    await db.collection('users').doc(uid).set({ role: 'admin', email: TEST_EMAIL }, { merge: true });
    check('Test user promoted to admin', true);

    // 9. Sign in again (fresh token) + activate as admin
    const adminToken = await firebaseSignIn();
    const activate = await apiCall('POST', '/api/vodafone-cash/activate', adminToken, { paymentId });
    check('Admin activate succeeds', activate.status === 200 && activate.json?.success === true, `status=${activate.status}`);

    // 10. Payment now paid
    const payments = await apiCall('GET', `/api/billing/payments?status=paid`, adminToken);
    const paid = payments.json?.payments?.find((p) => p.id === paymentId);
    check('Payment marked paid', paid?.status === 'paid', `status=${paid?.status}`);

    // 11. Subscription active for user
    const subAfter = await apiCall('GET', '/api/subscription', token);
    check('Subscription active after admin', subAfter.json?.plan === 'premium' && subAfter.json?.status === 'active',
      JSON.stringify({ plan: subAfter.json?.plan, status: subAfter.json?.status }));

    // 12. Reject flow on a second payment
    const confirm2 = await apiCall('POST', '/api/vodafone-cash/confirm', token, { plan: 'elite', billingCycle: 'monthly' });
    const paymentId2 = confirm2.json?.paymentId;
    const reject = await apiCall('POST', '/api/vodafone-cash/reject', adminToken, { paymentId: paymentId2 });
    check('Admin reject succeeds', reject.status === 200 && reject.json?.status === 'failed', `status=${reject.status}`);
    const payments2 = await apiCall('GET', '/api/billing/payments?status=failed', adminToken);
    const failed = payments2.json?.payments?.find((p) => p.id === paymentId2);
    check('Rejected payment marked failed', failed?.status === 'failed');

    // 13. Idempotent activation (second activate -> alreadyActivated)
    const dup = await apiCall('POST', '/api/vodafone-cash/activate', adminToken, { paymentId });
    check('Duplicate activation idempotent', dup.status === 200 && dup.json?.alreadyActivated === true, `status=${dup.status}`);
  } catch (err) {
    console.error('\nERROR:', err.message);
  } finally {
    // Cleanup: delete test user + payment docs
    try {
      if (uid) {
        const db = getDb();
        const snaps = await db.collection('payments').where('userId', '==', uid).get();
        for (const d of snaps.docs) await d.ref.delete();
        await db.collection('users').doc(uid).delete().catch(() => {});
        await admin.auth().deleteUser(uid);
        console.log('Cleanup: test user + payments removed');
      }
    } catch (e) {
      console.log('Cleanup warning:', e.message);
    }

    const passed = results.filter((r) => r.ok).length;
    console.log(`\n=== ${passed}/${results.length} checks passed ===`);
    process.exit(passed === results.length ? 0 : 1);
  }
})();

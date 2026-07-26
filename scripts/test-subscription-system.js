const { getDb } = require('../api/_lib/firebaseAdmin');

if (!process.env.FIREBASE_PROJECT_ID) {
  console.log('Skipping tests — Firebase not configured');
  process.exit(0);
}

const db = getDb();
if (!db) {
  console.log('Skipping tests — no Firestore instance');
  process.exit(0);
}

const TEST_USER_ID = 'test-user-' + Date.now();
let passed = 0;
let failed = 0;

async function assert(condition, label) {
  if (condition) { passed++; console.log(`  ✓ ${label}`); }
  else { failed++; console.error(`  ✗ ${label}`); }
}

async function testSubscriptionService() {
  console.log('\n🧪 Testing Subscription Service...\n');

  const { activateSubscription, expireSubscription, cancelAtPeriodEnd, getSubscription, consumePackageQuota } = require('../api/_lib/subscriptionService');

  console.log('--- Premium Monthly Activation ---');
  const sub1 = await activateSubscription({ userId: TEST_USER_ID, plan: 'premium', billingCycle: 'monthly', paymentProvider: 'stripe' });
  await assert(sub1.status === 'active', 'status is active');
  await assert(sub1.plan === 'premium', 'plan is premium');
  await assert(sub1.packageQuotas.ai_chatbot.total === 100, 'chatbot quota total is 100');
  await assert(sub1.packageQuotas.ai_chatbot.remaining === 100, 'chatbot remaining starts at 100');
  await assert(sub1.packageQuotas.knowledge_base.total === 70, 'KB quota total is 70');
  await assert(sub1.packageQuotas.disease_diagnosis.total === 2, 'diagnosis quota total is 2');

  console.log('\n--- Package Quota Consumption ---');
  const r1 = await consumePackageQuota(TEST_USER_ID, 'ai_chatbot');
  await assert(r1.allowed === true, 'first consumption allowed');
  await assert(r1.remaining === 99, 'remaining decremented to 99');

  const r2 = await consumePackageQuota(TEST_USER_ID, 'ai_chatbot');
  await assert(r2.remaining === 98, 'remaining decremented to 98');

  for (let i = 0; i < 98; i++) await consumePackageQuota(TEST_USER_ID, 'ai_chatbot');
  const rExhausted = await consumePackageQuota(TEST_USER_ID, 'ai_chatbot');
  await assert(rExhausted.allowed === false, 'exhausted quota returns allowed=false');
  await assert(rExhausted.reason === 'quota_exhausted', 'exhausted reason is quota_exhausted');

  console.log('\n--- Yearly Quota Calculation ---');
  const subYearly = await activateSubscription({ userId: TEST_USER_ID + '-yearly', plan: 'premium', billingCycle: 'yearly', paymentProvider: 'stripe' });
  await assert(subYearly.packageQuotas.ai_chatbot.total === 1200, 'yearly chatbot = 100 x 12 = 1200');
  await assert(subYearly.packageQuotas.knowledge_base.total === 840, 'yearly KB = 70 x 12 = 840');
  await assert(subYearly.packageQuotas.disease_diagnosis.total === 24, 'yearly diagnosis = 2 x 12 = 24');

  console.log('\n--- Get Subscription ---');
  const fetched = await getSubscription(TEST_USER_ID);
  await assert(fetched !== null, 'subscription exists');
  await assert(fetched.plan === 'premium', 'fetched plan matches');

  console.log('\n--- Cancellation ---');
  await cancelAtPeriodEnd(TEST_USER_ID);
  const cancelled = await getSubscription(TEST_USER_ID);
  await assert(cancelled.status === 'cancelled', 'status changed to cancelled');

  console.log('\n--- Expiration ---');
  await expireSubscription(TEST_USER_ID);
  const expired = await getSubscription(TEST_USER_ID);
  await assert(expired.status === 'expired', 'status changed to expired');
  await assert(expired.plan === 'free', 'plan reverted to free');
  await assert(expired.packageQuotas === null, 'package quotas cleared');

  console.log('\n--- Elite Plan ---');
  const subElite = await activateSubscription({ userId: TEST_USER_ID + '-elite', plan: 'elite', billingCycle: 'monthly', paymentProvider: 'stripe' });
  await assert(subElite.plan === 'elite', 'elite plan set');
  await assert(subElite.packageQuotas === null, 'elite has no package quotas');

  // Cleanup
  await db.collection('subscriptions').doc(TEST_USER_ID).delete().catch(() => {});
  await db.collection('subscriptions').doc(TEST_USER_ID + '-yearly').delete().catch(() => {});
  await db.collection('subscriptions').doc(TEST_USER_ID + '-elite').delete().catch(() => {});
}

async function testQuotaStrategies() {
  console.log('\n🧪 Testing Quota Strategies...\n');
  const { checkQuota } = require('../api/_lib/checkQuota');
  const result = await checkQuota({ featureId: 'ai_chatbot', userId: null, guestId: null, isPremium: false, incrementIfAllowed: false });
  await assert(result !== undefined, 'checkQuota returns result');
  console.log('\n  (Full strategy testing requires Firestore feature docs + Redis)');
}

async function run() {
  console.log('========================================');
  console.log('  Subscription & Payment System Tests');
  console.log('========================================');
  console.log('  Test user ID:', TEST_USER_ID);
  await testSubscriptionService();
  await testQuotaStrategies();
  console.log('\n========================================');
  console.log('  Results:', passed, 'passed,', failed, 'failed');
  console.log('========================================\n');
  process.exit(failed > 0 ? 1 : 0);
}

run().catch(err => { console.error('Test error:', err); process.exit(1); });

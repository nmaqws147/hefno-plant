const { verifyToken, getDb, isAdmin } = require('./_lib/firebaseAdmin');
const { getSubscription, checkQuota: checkQuotaService, expireSubscription } = require('./_lib/subscriptionService');
const { createPayment, handleWebhook } = require('./_lib/payments/provider');
require('./_lib/payments/paymob');
const { checkQuota } = require('./_lib/checkQuota');

function parseUrl(req) {
  return new URL(req.url, `http://${req.headers.host || 'localhost'}`);
}

async function handleGetSubscription(req, res) {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) return res.status(401).json({ error: 'Authentication required' });
  const decoded = await verifyToken(authHeader.slice(7));
  const sub = await getSubscription(decoded.uid);
  if (!sub) return res.status(200).json({ plan: 'free', status: 'active', packageQuotas: null });
  return res.status(200).json(sub);
}

async function handleCheckQuota(req, res) {
  const { featureId, increment } = req.body;
  if (!featureId) return res.status(400).json({ error: 'featureId required' });
  const authHeader = req.headers.authorization;
  let userId = null;
  let isPremium = false;
  if (authHeader?.startsWith('Bearer ')) {
    try {
      const decoded = await verifyToken(authHeader.slice(7));
      userId = decoded.uid;
    } catch (_) {}
  }
  const guestId = req.headers['x-guest-id'] || null;
  const result = await checkQuota({ featureId, userId, guestId, isPremium, incrementIfAllowed: !!increment });
  return res.status(result.allowed ? 200 : 429).json(result);
}

async function handleCheckExpired(req, res) {
  const authHeader = req.headers.authorization;
  if (authHeader?.startsWith('Bearer ')) {
    const decoded = await verifyToken(authHeader.slice(7));
    if (decoded?.uid) {
      const db2 = getDb();
      const userSnap = await db2.collection('users').doc(decoded.uid).get();
      const role = userSnap.data()?.role;
      if (role !== 'admin' && role !== 'super_admin') return res.status(403).json({ error: 'Admin access required' });
    }
  } else if (process.env.CRON_SECRET && req.headers['x-cron-secret'] !== process.env.CRON_SECRET) {
    return res.status(401).json({ error: 'Authentication required' });
  } else if (!process.env.CRON_SECRET && !authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  const db = getDb();
  const now = new Date();
  let count = 0;
  const expired = await db.collection('subscriptions').where('status', '==', 'active').where('expirationDate', '<', now).get();
  for (const doc of expired.docs) { await expireSubscription(doc.id); count++; }
  const cancelledExpired = await db.collection('subscriptions').where('status', '==', 'cancelled').where('expirationDate', '<', now).get();
  for (const doc of cancelledExpired.docs) { await expireSubscription(doc.id); count++; }
  return res.status(200).json({ expired: count });
}

async function handlePaymobIntent(req, res) {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) return res.status(401).json({ error: 'Authentication required' });
  const decoded = await verifyToken(authHeader.slice(7));
  const { plan, billingCycle } = req.body;
  if (!plan || !['premium', 'elite'].includes(plan)) return res.status(400).json({ error: 'Invalid plan' });
  if (!billingCycle || !['monthly', 'yearly'].includes(billingCycle)) return res.status(400).json({ error: 'Invalid billing cycle' });
  const result = await createPayment({
    provider: 'paymob',
    plan,
    billingCycle,
    userId: decoded.uid,
    customerEmail: decoded.firebase?.identities?.email?.[0] || req.body.email,
  });
  return res.status(200).json(result);
}

async function handlePaymobWebhook(req, res) {
  const chunks = [];
  await new Promise((resolve, reject) => {
    req.on('data', (c) => chunks.push(c));
    req.on('end', () => {
      req.rawBody = Buffer.concat(chunks).toString('utf8');
      try { req.body = JSON.parse(req.rawBody); } catch { req.body = {}; }
      resolve();
    });
    req.on('error', reject);
  });

  const { event, data } = await handleWebhook({ provider: 'paymob', req });

  if (event === 'invalid_hmac') return res.status(400).json({ error: 'Invalid HMAC' });
  if (event === 'invalid_merchant') return res.status(400).json({ error: 'Invalid merchant' });
  if (event === 'invalid_integration') return res.status(400).json({ error: 'Invalid integration' });
  if (event === 'invalid_payload') return res.status(400).json({ error: 'Invalid payload' });
  if (event === 'order_not_found') return res.status(400).json({ error: 'Order not found' });
  if (event === 'amount_mismatch') return res.status(400).json({ error: 'Amount mismatch' });
  if (event === 'currency_mismatch') return res.status(400).json({ error: 'Currency mismatch' });
  if (event === 'duplicate') return res.status(200).json({ received: true, duplicate: true });
  if (event === 'payment_failed') {
    await require('./_lib/subscriptionService').logEvent({
      userId: data?.userId || 'unknown', event: 'payment_failed',
      plan: null, billingCycle: null, paymentProvider: 'paymob',
      details: { transactionId: data?.id, orderId: data?.order?.id },
    });
    return res.status(200).json({ received: true, status: 'failed' });
  }

  if (event === 'checkout.session.completed') {
    const { userId, plan, billingCycle, transactionId, orderId, amountCents, currency } = data;
    const sub = await require('./_lib/subscriptionService').activateSubscription({
      userId, plan, billingCycle, paymentProvider: 'paymob',
    });

    const db = getDb();
    await db.collection('payments').doc(transactionId).set({
      userId, transactionId, orderId, plan, billingCycle,
      amount: amountCents / 100, currency,
      status: 'paid', paymentMethod: 'paymob',
      provider: 'paymob', createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    await db.collection('payment_events').doc(transactionId).set({
      event: 'subscription_activated',
      processedAt: new Date().toISOString(),
    }, { merge: true });

    await require('./_lib/subscriptionService').logEvent({
      userId, event: 'subscription_activated', plan, billingCycle,
      paymentProvider: 'paymob',
      details: { transactionId, orderId, amount: amountCents / 100, currency },
    });

    return res.status(200).json({ received: true, status: 'activated' });
  }

  return res.status(200).json({ received: true });
}

async function handlePaymobPayments(req, res) {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) return res.status(401).json({ error: 'Authentication required' });

  const url = parseUrl(req);
  const searchUserId = url.searchParams.get('userId');
  const status = url.searchParams.get('status');
  const page = Math.max(1, parseInt(url.searchParams.get('page')) || 1);
  const limit = Math.min(parseInt(url.searchParams.get('limit')) || 20, 100);

  const decoded = await verifyToken(authHeader.slice(7));
  const isAdminUser = await isAdmin(authHeader.slice(7));

  if (searchUserId && searchUserId !== decoded.uid && !isAdminUser) {
    return res.status(403).json({ error: 'Forbidden' });
  }

  const targetUserId = searchUserId || (isAdminUser ? null : decoded.uid);

  const db = getDb();
  let query = db.collection('payments').orderBy('createdAt', 'desc');

  if (targetUserId) query = query.where('userId', '==', targetUserId);
  if (status) query = query.where('status', '==', status);

  const snap = await query.limit(limit).offset((page - 1) * limit).get();
  const payments = [];
  snap.forEach((d) => payments.push({ id: d.id, ...d.data() }));

  let countQuery = db.collection('payments');
  if (targetUserId) countQuery = countQuery.where('userId', '==', targetUserId);
  if (status) countQuery = countQuery.where('status', '==', status);
  const countSnap = await countQuery.get();
  const total = countSnap.size;

  return res.status(200).json({ payments, total, page, limit });
}

module.exports = async (req, res) => {
  try {
    const url = parseUrl(req);
    const path = url.pathname;

    if (path === '/api/billing' || path === '/api/subscription') {
      if (req.method === 'GET') return await handleGetSubscription(req, res);
      return res.status(405).json({ error: 'Method not allowed' });
    }
    if (path === '/api/check-quota' || path === '/api/billing/quota') {
      if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
      return await handleCheckQuota(req, res);
    }
    if (path === '/api/check-expired' || path === '/api/billing/expired') {
      if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });
      return await handleCheckExpired(req, res);
    }
    if (path === '/api/paymob/intent') {
      if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
      return await handlePaymobIntent(req, res);
    }
    if (path === '/api/paymob/webhook') {
      if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
      return await handlePaymobWebhook(req, res);
    }
    if (path === '/api/paymob/payments') {
      if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });
      return await handlePaymobPayments(req, res);
    }

    return res.status(404).json({ error: 'Not found' });
  } catch (err) {
    console.error('Billing handler error:', err);
    return res.status(500).json({ error: err.message || 'Internal server error' });
  }
};
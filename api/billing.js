const { verifyToken, getDb, isAdmin } = require('./_lib/firebaseAdmin');
const { getSubscription, checkQuota: checkQuotaService, expireSubscription } = require('./_lib/subscriptionService');
const { createPayment, handleWebhook } = require('./_lib/payments/provider');
require('./_lib/payments/stripe');
require('./_lib/payments/vodafoneCash');
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

async function handleCreateCheckoutSession(req, res) {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) return res.status(401).json({ error: 'Authentication required' });
  const decoded = await verifyToken(authHeader.slice(7));
  const userId = decoded.uid;
  const { plan, billingCycle, paymentProvider } = req.body;
  if (!plan || !['premium', 'elite'].includes(plan)) return res.status(400).json({ error: 'Invalid plan' });
  if (!billingCycle || !['monthly', 'yearly'].includes(billingCycle)) return res.status(400).json({ error: 'Invalid billing cycle' });
  const provider = paymentProvider || 'stripe';
  const result = await createPayment({
    provider,
    plan,
    billingCycle,
    userId,
    customerEmail: decoded.firebase?.identities?.email?.[0] || req.body.email,
  });
  return res.status(200).json(result);
}

async function handleStripeWebhook(req, res) {
  const db = getDb();
  const { event, data } = await handleWebhook({ provider: 'stripe', req });
  switch (event) {
    case 'checkout.session.completed': {
      const session = data;
      if (session.payment_status === 'paid' && session.metadata?.userId) {
        const userId = session.metadata.userId;
        const plan = session.metadata.plan;
        const billingCycle = session.metadata.billingCycle;
        await require('./_lib/subscriptionService').activateSubscription({ userId, plan, billingCycle, paymentProvider: 'stripe' });
        await db.collection('subscriptions').doc(userId).update({ stripeCustomerId: session.customer, stripeSubscriptionId: session.subscription });
      }
      break;
    }
    case 'invoice.payment_succeeded': {
      const invoice = data;
      if (invoice.subscription && invoice.metadata?.userId) {
        const userId = invoice.metadata.userId;
        const sub = await db.collection('subscriptions').doc(userId).get();
        if (sub.exists) {
          const subData = sub.data();
          if (subData.plan && subData.billingCycle) {
            await require('./_lib/subscriptionService').activateSubscription({ userId, plan: subData.plan, billingCycle: subData.billingCycle, paymentProvider: 'stripe' });
            await require('./_lib/subscriptionService').logEvent({ userId, event: 'subscription_renewed', plan: subData.plan, billingCycle: subData.billingCycle, paymentProvider: 'stripe' });
          }
        }
      }
      break;
    }
    case 'customer.subscription.deleted': {
      const subscription = data;
      if (subscription.metadata?.userId) {
        await require('./_lib/subscriptionService').cancelAtPeriodEnd(subscription.metadata.userId);
      }
      break;
    }
  }
  return res.status(200).json({ received: true });
}

async function handleCheckQuota(req, res) {
  const { featureId } = req.body;
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
  const result = await checkQuota({ featureId, userId, guestId, isPremium, incrementIfAllowed: false });
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

async function handleVodafoneInitiate(req, res) {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) return res.status(401).json({ error: 'Authentication required' });
  const decoded = await verifyToken(authHeader.slice(7));
  const { plan, billingCycle } = req.body;
  if (!plan || !['premium', 'elite'].includes(plan)) return res.status(400).json({ error: 'Invalid plan' });
  if (!billingCycle || !['monthly', 'yearly'].includes(billingCycle)) return res.status(400).json({ error: 'Invalid billing cycle' });
  const result = await createPayment({ provider: 'vodafone_cash', plan, billingCycle, userId: decoded.uid });
  return res.status(200).json(result);
}

async function handleVodafoneVerify(req, res) {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) return res.status(401).json({ error: 'Authentication required' });
  if (!(await isAdmin(authHeader.slice(7)))) return res.status(403).json({ error: 'Admin access required' });
  const { paymentReference } = req.body;
  if (!paymentReference) return res.status(400).json({ error: 'paymentReference required' });
  const { verifyPayment } = require('./_lib/payments/provider');
  const result = await verifyPayment({ provider: 'vodafone_cash', paymentId: paymentReference, data: {} });
  if (!result.verified) return res.status(400).json({ error: 'Payment not found or already verified' });
  const details = result.paymentDetails;
  const sub = await require('./_lib/subscriptionService').activateSubscription({ userId: details.userId, plan: details.plan, billingCycle: details.billingCycle, paymentProvider: 'vodafone_cash' });
  return res.status(200).json({ success: true, subscription: sub });
}

module.exports = async (req, res) => {
  try {
    const url = parseUrl(req);
    const path = url.pathname;

    if (path === '/api/billing' || path === '/api/subscription') {
      if (req.method === 'GET') return await handleGetSubscription(req, res);
      return res.status(405).json({ error: 'Method not allowed' });
    }
    if (path === '/api/create-checkout-session' || path === '/api/billing/checkout') {
      if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
      return await handleCreateCheckoutSession(req, res);
    }
    if (path === '/api/stripe-webhook' || path === '/api/billing/webhook') {
      if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
      return await handleStripeWebhook(req, res);
    }
    if (path === '/api/check-quota' || path === '/api/billing/quota') {
      if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
      return await handleCheckQuota(req, res);
    }
    if (path === '/api/check-expired' || path === '/api/billing/expired') {
      if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });
      return await handleCheckExpired(req, res);
    }
    if (path === '/api/vodafone-cash/initiate' || path === '/api/billing/vodafone/initiate') {
      if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
      return await handleVodafoneInitiate(req, res);
    }
    if (path === '/api/vodafone-cash/verify' || path === '/api/billing/vodafone/verify') {
      if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
      return await handleVodafoneVerify(req, res);
    }

    return res.status(404).json({ error: 'Not found' });
  } catch (err) {
    console.error('Billing handler error:', err);
    return res.status(500).json({ error: err.message || 'Internal server error' });
  }
};
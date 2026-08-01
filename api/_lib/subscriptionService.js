const { getDb } = require('./firebaseAdmin');

const PREMIUM_MONTHLY_QUOTAS = {
  ai_chatbot: 100,
  knowledge_base: 70,
  disease_diagnosis: 14,
};

function calcYearlyQuotas() {
  const q = {};
  for (const [key, val] of Object.entries(PREMIUM_MONTHLY_QUOTAS)) {
    if (key === 'disease_diagnosis') continue;
    q[key] = val * 12;
  }
  return q;
}

function getPackageQuotas(plan, billingCycle) {
  if (plan !== 'premium') return null;
  const quotas = billingCycle === 'yearly' ? calcYearlyQuotas() : { ...PREMIUM_MONTHLY_QUOTAS };
  const now = new Date();
  const pkg = {};
  for (const [key, total] of Object.entries(quotas)) {
    pkg[key] = { total, remaining: total, resetDate: now };
  }
  const diagEnd = new Date(now);
  diagEnd.setMonth(diagEnd.getMonth() + 1);
  pkg.disease_diagnosis = {
    total: PREMIUM_MONTHLY_QUOTAS.disease_diagnosis,
    remaining: PREMIUM_MONTHLY_QUOTAS.disease_diagnosis,
    resetDate: now,
    monthlyDiagnosisLimit: PREMIUM_MONTHLY_QUOTAS.disease_diagnosis,
    diagnosisUsedThisMonth: 0,
    diagnosisRemaining: PREMIUM_MONTHLY_QUOTAS.disease_diagnosis,
    billingCycleStart: now,
    billingCycleEnd: diagEnd,
    lastResetDate: now,
  };
  return pkg;
}

function calcExpiration(billingCycle) {
  const d = new Date();
  if (billingCycle === 'yearly') d.setFullYear(d.getFullYear() + 1);
  else d.setMonth(d.getMonth() + 1);
  return d;
}

async function activateSubscription({ userId, plan, billingCycle, paymentProvider, paymentStatus = 'paid' }) {
  const db = getDb();
  const now = new Date();
  const expirationDate = calcExpiration(billingCycle);
  const pkgQuotas = getPackageQuotas(plan, billingCycle);

  const subData = {
    plan,
    status: 'active',
    billingCycle,
    paymentProvider,
    paymentStatus,
    startDate: now,
    expirationDate,
    renewalDate: expirationDate,
    packageQuotas: pkgQuotas,
    createdAt: now,
    updatedAt: now,
  };

  await db.collection('subscriptions').doc(userId).set(subData, { merge: true });
  await logEvent({ userId, event: 'subscription_created', plan, billingCycle, paymentProvider, details: { paymentStatus } });
  return subData;
}

async function expireSubscription(userId) {
  const db = getDb();
  await db.collection('subscriptions').doc(userId).update({
    status: 'expired',
    plan: 'free',
    packageQuotas: null,
    updatedAt: new Date(),
  });
  await logEvent({ userId, event: 'subscription_expired', plan: 'free', billingCycle: null, paymentProvider: null });
}

async function cancelAtPeriodEnd(userId) {
  const db = getDb();
  const sub = await getSubscription(userId);
  if (!sub || sub.status !== 'active') return;
  await db.collection('subscriptions').doc(userId).update({
    status: 'cancelled',
    updatedAt: new Date(),
  });
  await logEvent({ userId, event: 'subscription_cancelled', plan: sub.plan, billingCycle: sub.billingCycle, paymentProvider: sub.paymentProvider, details: { expiresAt: sub.expirationDate } });
}

async function getSubscription(userId) {
  const db = getDb();
  const snap = await db.collection('subscriptions').doc(userId).get();
  return snap.exists ? { id: snap.id, ...snap.data() } : null;
}

async function consumePackageQuota(userId, featureId) {
  const db = getDb();
  const subRef = db.collection('subscriptions').doc(userId);

  try {
    return await db.runTransaction(async (transaction) => {
      const snap = await transaction.get(subRef);
      if (!snap.exists) return { allowed: false, reason: 'no_active_premium' };

      const sub = snap.data();
      if (sub.plan !== 'premium' || sub.status !== 'active' || !sub.packageQuotas) {
        return { allowed: false, reason: 'no_active_premium' };
      }

      const quota = sub.packageQuotas[featureId];
      if (!quota) return { allowed: false, reason: 'feature_not_in_package' };
      if (quota.remaining <= 0) return { allowed: false, reason: 'quota_exhausted', total: quota.total, remaining: 0 };

      const remaining = quota.remaining - 1;
      transaction.update(subRef, {
        [`packageQuotas.${featureId}.remaining`]: remaining,
        updatedAt: new Date(),
      });
      return { allowed: true, remaining, total: quota.total };
    });
  } catch (err) {
    console.error('consumePackageQuota transaction failed:', err);
    return { allowed: false, reason: 'transaction_failed' };
  }
}

async function logEvent({ userId, event, plan, billingCycle, paymentProvider, details = {} }) {
  try {
    const db = getDb();
    await db.collection('subscriptionLogs').add({
      userId,
      event,
      plan: plan || null,
      billingCycle: billingCycle || null,
      paymentProvider: paymentProvider || null,
      details,
      timestamp: new Date(),
    });
  } catch (err) {
    console.error('Failed to log subscription event:', err);
  }
}

module.exports = {
  activateSubscription,
  expireSubscription,
  cancelAtPeriodEnd,
  getSubscription,
  consumePackageQuota,
  logEvent,
  PREMIUM_MONTHLY_QUOTAS,
  getPackageQuotas,
};

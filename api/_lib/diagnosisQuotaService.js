const { getDb } = require('./firebaseAdmin');

const MONTHLY_DIAGNOSIS_LIMIT = 14;
const QUOTA_KEY = 'disease_diagnosis';

function toDate(val) {
  if (val == null) return null;
  if (typeof val === 'number') return new Date(val);
  if (typeof val === 'string') return new Date(val);
  if (val.toDate) return val.toDate();
  if (val instanceof Date) return val;
  return null;
}

function addMonths(d, n) {
  const day = d.getUTCDate();
  const res = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + n, 1));
  const lastDay = new Date(Date.UTC(res.getUTCFullYear(), res.getUTCMonth() + 1, 0)).getUTCDate();
  res.setUTCDate(Math.min(day, lastDay));
  res.setUTCHours(d.getUTCHours(), d.getUTCMinutes(), d.getUTCSeconds(), d.getUTCMilliseconds());
  return res;
}

function cycleWindow(anchor, now) {
  const a = toDate(anchor) || now;
  let months = (now.getUTCFullYear() - a.getUTCFullYear()) * 12 + (now.getUTCMonth() - a.getUTCMonth());
  if (months < 0) months = 0;
  let start = addMonths(a, months);
  let end = addMonths(start, 1);
  while (now >= end) {
    start = end;
    end = addMonths(start, 1);
  }
  return { start, end };
}

function buildState({ quota, anchor, now }) {
  const legacy = !quota || !toDate(quota.billingCycleStart) || !toDate(quota.billingCycleEnd) || quota.total !== MONTHLY_DIAGNOSIS_LIMIT;
  const { start, end } = cycleWindow(anchor, now);
  if (legacy) {
    return {
      monthlyDiagnosisLimit: MONTHLY_DIAGNOSIS_LIMIT,
      diagnosisUsedThisMonth: 0,
      diagnosisRemaining: MONTHLY_DIAGNOSIS_LIMIT,
      billingCycleStart: start,
      billingCycleEnd: end,
      lastResetDate: now,
      total: MONTHLY_DIAGNOSIS_LIMIT,
      remaining: MONTHLY_DIAGNOSIS_LIMIT,
    };
  }
  const used = quota.diagnosisUsedThisMonth != null ? quota.diagnosisUsedThisMonth : MONTHLY_DIAGNOSIS_LIMIT - (quota.remaining || 0);
  const inCycle = now < toDate(quota.billingCycleEnd);
  return {
    monthlyDiagnosisLimit: MONTHLY_DIAGNOSIS_LIMIT,
    diagnosisUsedThisMonth: inCycle ? used : 0,
    diagnosisRemaining: inCycle ? MONTHLY_DIAGNOSIS_LIMIT - used : MONTHLY_DIAGNOSIS_LIMIT,
    billingCycleStart: start,
    billingCycleEnd: end,
    lastResetDate: inCycle ? toDate(quota.lastResetDate) || toDate(quota.billingCycleStart) : now,
    total: MONTHLY_DIAGNOSIS_LIMIT,
    remaining: inCycle ? MONTHLY_DIAGNOSIS_LIMIT - used : MONTHLY_DIAGNOSIS_LIMIT,
  };
}

function canUsePremium(sub, now) {
  if (!sub || sub.plan !== 'premium') return false;
  if (sub.status === 'active') return true;
  if (sub.status === 'expired' || sub.status === 'cancelled') {
    const exp = toDate(sub.expirationDate);
    return exp != null && now < exp;
  }
  return false;
}

function anchorOf(sub) {
  return toDate(sub.startDate) || toDate(sub.createdAt) || new Date();
}

async function getDiagnosisQuota(userId) {
  const db = getDb();
  const snap = await db.collection('subscriptions').doc(userId).get();
  const sub = snap.exists ? snap.data() : null;
  const now = new Date();
  if (!canUsePremium(sub, now)) {
    return { allowed: false, remaining: 0, limit: 0, usedThisMonth: 0, isPremium: false };
  }
  const state = buildState({ quota: sub.packageQuotas?.[QUOTA_KEY], anchor: anchorOf(sub), now });
  return {
    allowed: state.diagnosisRemaining > 0,
    remaining: state.diagnosisRemaining,
    limit: state.monthlyDiagnosisLimit,
    usedThisMonth: state.diagnosisUsedThisMonth,
    billingCycleStart: state.billingCycleStart,
    billingCycleEnd: state.billingCycleEnd,
    lastResetDate: state.lastResetDate,
    resetAt: state.billingCycleEnd,
    isPremium: true,
  };
}

async function consumeDiagnosis(userId) {
  const db = getDb();
  const subRef = db.collection('subscriptions').doc(userId);
  try {
    return await db.runTransaction(async (transaction) => {
      const snap = await transaction.get(subRef);
      const sub = snap.exists ? snap.data() : null;
      const now = new Date();
      if (!canUsePremium(sub, now)) {
        return { allowed: false, reason: 'no_active_premium', remaining: 0, limit: 0 };
      }
      const state = buildState({ quota: sub.packageQuotas?.[QUOTA_KEY], anchor: anchorOf(sub), now });
      if (state.diagnosisRemaining <= 0) {
        return {
          allowed: false,
          reason: 'quota_exhausted',
          remaining: 0,
          limit: state.monthlyDiagnosisLimit,
          usedThisMonth: state.monthlyDiagnosisLimit,
          resetAt: state.billingCycleEnd,
        };
      }
      const next = {
        ...state,
        diagnosisUsedThisMonth: state.diagnosisUsedThisMonth + 1,
        diagnosisRemaining: state.diagnosisRemaining - 1,
        remaining: state.remaining - 1,
        lastResetDate: state.lastResetDate,
        updatedAt: now,
      };
      transaction.update(subRef, {
        [`packageQuotas.${QUOTA_KEY}`]: next,
        updatedAt: now,
      });
      return {
        allowed: true,
        remaining: next.diagnosisRemaining,
        limit: next.monthlyDiagnosisLimit,
        usedThisMonth: next.diagnosisUsedThisMonth,
        resetAt: next.billingCycleEnd,
      };
    });
  } catch (err) {
    console.error('consumeDiagnosis transaction failed:', err);
    return { allowed: false, reason: 'transaction_failed', remaining: 0, limit: 0 };
  }
}

async function refundDiagnosis(userId) {
  const db = getDb();
  const subRef = db.collection('subscriptions').doc(userId);
  try {
    return await db.runTransaction(async (transaction) => {
      const snap = await transaction.get(subRef);
      const sub = snap.exists ? snap.data() : null;
      const now = new Date();
      if (!canUsePremium(sub, now)) return { refunded: false };
      const state = buildState({ quota: sub.packageQuotas?.[QUOTA_KEY], anchor: anchorOf(sub), now });
      if (state.diagnosisUsedThisMonth <= 0) return { refunded: false };
      const next = {
        ...state,
        diagnosisUsedThisMonth: state.diagnosisUsedThisMonth - 1,
        diagnosisRemaining: Math.min(state.monthlyDiagnosisLimit, state.diagnosisRemaining + 1),
        remaining: Math.min(state.total, state.remaining + 1),
        updatedAt: now,
      };
      transaction.update(subRef, {
        [`packageQuotas.${QUOTA_KEY}`]: next,
        updatedAt: now,
      });
      return { refunded: true, remaining: next.diagnosisRemaining };
    });
  } catch (err) {
    console.error('refundDiagnosis transaction failed:', err);
    return { refunded: false };
  }
}

module.exports = {
  MONTHLY_DIAGNOSIS_LIMIT,
  QUOTA_KEY,
  getDiagnosisQuota,
  consumeDiagnosis,
  refundDiagnosis,
  buildState,
  cycleWindow,
};

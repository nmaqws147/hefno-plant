const { loadFeature } = require('./loadFeatures');
const { getDb } = require('./firebaseAdmin');

let redis = null;
try {
  const { Redis } = require('@upstash/redis');
  if (process.env.REDIS_URL && process.env.TOKEN) {
    redis = new Redis({ url: process.env.REDIS_URL, token: process.env.TOKEN });
  }
} catch (_) {}

const db = getDb();

const UUID_V4_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function fmtDate(d) {
  return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
}

function getWeekStart(date) {
  const d = new Date(date);
  const day = d.getDay();
  d.setDate(d.getDate() - day + (day === 0 ? -6 : 1));
  d.setHours(0, 0, 0, 0);
  return fmtDate(d);
}

async function checkQuota({ featureId, userId, guestId, isPremium, incrementIfAllowed = false }) {
  const feature = await loadFeature(featureId);
  if (!feature || feature.isEnabled === false) {
    return { allowed: false, error: 'feature_unavailable' };
  }
  if (feature.isPublic) {
    return { allowed: true, remaining: Infinity, limit: Infinity };
  }
  if (isPremium && feature.premiumUnlimited) {
    return { allowed: true, remaining: Infinity, limit: Infinity };
  }

  if (userId) {
    try {
      const userSnap = await db.collection('users').doc(userId).get();
      if (userSnap.exists && userSnap.data().role === 'admin') {
        return { allowed: true, remaining: Infinity, limit: Infinity };
      }
    } catch (_) {}
  }

  const hasDaily = feature.dailyLimit != null;
  const hasWeekly = feature.weeklyLimit != null;
  const now = new Date();
  const today = fmtDate(now);
  const weekStart = getWeekStart(now);

  if (userId) {
    const ref = db.collection('usage').doc(userId).collection('features').doc(featureId);
    const snap = await ref.get();
    const data = snap.exists ? snap.data() : {};

    let dailyUsed = data.dailyUsed || 0;
    let weeklyUsed = data.weeklyUsed || 0;
    let dailyDate = data.dailyDate || null;
    let weeklyDate = data.weeklyDate || null;

    if (hasDaily && dailyDate !== today) { dailyUsed = 0; dailyDate = today; }
    if (hasWeekly && weeklyDate !== weekStart) { weeklyUsed = 0; weeklyDate = weekStart; }

    if (hasDaily && dailyUsed >= feature.dailyLimit) {
      const nextReset = dailyDate ? new Date(new Date(dailyDate).getTime() + 86400000).toISOString() : new Date(Date.now() + 86400000).toISOString();
      return { allowed: false, remaining: 0, limit: feature.dailyLimit, error: 'quota_exhausted', resetDate: nextReset };
    }
    if (hasWeekly && weeklyUsed >= feature.weeklyLimit) {
      const nextReset = weeklyDate ? new Date(new Date(weeklyDate).getTime() + 604800000).toISOString() : new Date(Date.now() + 604800000).toISOString();
      return { allowed: false, remaining: 0, limit: feature.weeklyLimit, error: 'quota_exhausted', resetDate: nextReset };
    }

    if (incrementIfAllowed) {
      const update = { updatedAt: new Date().toISOString() };
      if (hasDaily) { update.dailyUsed = dailyUsed + 1; update.dailyDate = today; }
      if (hasWeekly) { update.weeklyUsed = weeklyUsed + 1; update.weeklyDate = weekStart; }
      await ref.set(update, { merge: true });
    }

    const limit = hasDaily ? feature.dailyLimit : hasWeekly ? feature.weeklyLimit : Infinity;
    const used = hasDaily ? dailyUsed : hasWeekly ? weeklyUsed : 0;
    return { allowed: true, remaining: Math.max(0, limit - used - (incrementIfAllowed ? 1 : 0)), limit };

  } else if (guestId) {
    if (!UUID_V4_REGEX.test(guestId)) {
      return { allowed: false, error: 'invalid_guest_id' };
    }
    if (!redis) {
      return { allowed: false, error: 'quota_unavailable' };
    }
    const key = `guest:${guestId}:usage`;
    const usage = (await redis.hgetall(key)) || {};

    let dailyUsed = 0;
    let weeklyUsed = 0;

    if (hasDaily) {
      dailyUsed = parseInt(usage[`${featureId}_daily`] || '0', 10);
      if (usage[`${featureId}_daily_date`] !== today) dailyUsed = 0;
    }
    if (hasWeekly) {
      weeklyUsed = parseInt(usage[`${featureId}_weekly`] || '0', 10);
      if (usage[`${featureId}_weekly_start`] !== weekStart) weeklyUsed = 0;
    }

    if (hasDaily && dailyUsed >= feature.dailyLimit) {
      return { allowed: false, remaining: 0, limit: feature.dailyLimit, error: 'quota_exhausted', resetDate: new Date(Date.now() + 86400000).toISOString() };
    }
    if (hasWeekly && weeklyUsed >= feature.weeklyLimit) {
      return { allowed: false, remaining: 0, limit: feature.weeklyLimit, error: 'quota_exhausted', resetDate: new Date(Date.now() + 604800000).toISOString() };
    }

    if (incrementIfAllowed) {
      const updates = {};
      if (hasDaily) { updates[`${featureId}_daily`] = String(dailyUsed + 1); updates[`${featureId}_daily_date`] = today; }
      if (hasWeekly) { updates[`${featureId}_weekly`] = String(weeklyUsed + 1); updates[`${featureId}_weekly_start`] = weekStart; }
      await redis.hset(key, updates);
      await redis.expire(key, 604800);
    }

    const limit = hasDaily ? feature.dailyLimit : hasWeekly ? feature.weeklyLimit : Infinity;
    const used = hasDaily ? dailyUsed : hasWeekly ? weeklyUsed : 0;
    return { allowed: true, remaining: Math.max(0, limit - used - (incrementIfAllowed ? 1 : 0)), limit };
  }

  return { allowed: false, error: 'user_unidentified' };
}

module.exports = { checkQuota };

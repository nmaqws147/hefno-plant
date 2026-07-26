const { Redis } = require('@upstash/redis');
const { loadFeature } = require('./loadFeatures');
const { db } = require('./firebaseAdmin');

const redis = new Redis({
  url: process.env.REDIS_URL,
  token: process.env.TOKEN,
});

const UUID_V4_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function fmtDate(d) {
  return d.toISOString().split('T')[0];
}

function getWeekStart(date) {
  const d = new Date(date);
  const day = d.getDay();
  d.setDate(d.getDate() - day + (day === 0 ? -6 : 1));
  d.setHours(0, 0, 0, 0);
  return fmtDate(d);
}

function resetDate(fromDate, hours) {
  if (!fromDate) return new Date(Date.now() + hours * 3600000).toISOString();
  return new Date(new Date(fromDate).getTime() + hours * 3600000).toISOString();
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
    let dailyReset = data.dailyResetAt?.toDate ? data.dailyResetAt.toDate() : null;
    let weeklyReset = data.weeklyResetAt?.toDate ? data.weeklyResetAt.toDate() : null;

    if (hasDaily && dailyReset) {
      const hoursElapsed = (now - dailyReset) / 3600000;
      if (hoursElapsed >= 24) { dailyUsed = 0; dailyReset = now; }
    }
    if (hasWeekly && weeklyReset) {
      const daysElapsed = (now - weeklyReset) / 86400000;
      if (daysElapsed >= 7) { weeklyUsed = 0; weeklyReset = now; }
    }

    if (hasDaily && dailyUsed >= feature.dailyLimit) {
      return { allowed: false, remaining: 0, limit: feature.dailyLimit, error: 'quota_exhausted', resetDate: resetDate(dailyReset, 24) };
    }
    if (hasWeekly && weeklyUsed >= feature.weeklyLimit) {
      return { allowed: false, remaining: 0, limit: feature.weeklyLimit, error: 'quota_exhausted', resetDate: resetDate(weeklyReset, 168) };
    }

    if (incrementIfAllowed) {
      const update = { updatedAt: now };
      if (hasDaily) { update.dailyUsed = dailyUsed + 1; update.dailyResetAt = dailyReset || now; }
      if (hasWeekly) { update.weeklyUsed = weeklyUsed + 1; update.weeklyResetAt = weeklyReset || now; }
      await ref.set(update, { merge: true });
    }

    const limit = hasDaily ? feature.dailyLimit : hasWeekly ? feature.weeklyLimit : Infinity;
    const used = hasDaily ? dailyUsed : hasWeekly ? weeklyUsed : 0;
    return { allowed: true, remaining: Math.max(0, limit - used - (incrementIfAllowed ? 1 : 0)), limit };

  } else if (guestId) {
    if (!UUID_V4_REGEX.test(guestId)) {
      return { allowed: false, error: 'invalid_guest_id' };
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
      return { allowed: false, remaining: 0, limit: feature.dailyLimit, error: 'quota_exhausted' };
    }
    if (hasWeekly && weeklyUsed >= feature.weeklyLimit) {
      return { allowed: false, remaining: 0, limit: feature.weeklyLimit, error: 'quota_exhausted' };
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

/**
 * Comprehensive Quota System Test Suite
 * Tests all user types, features, limits, resets, isolation, and security.
 */

let passed = 0;
let failed = 0;
const failures = [];

function assert(condition, msg) {
  if (condition) { passed++; return; }
  failed++;
  failures.push(msg);
  console.error(`  FAIL: ${msg}`);
}

function assertEq(actual, expected, msg) {
  if (actual === expected) { passed++; return; }
  failed++;
  failures.push(`${msg}: expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`);
  console.error(`  FAIL: ${msg} (expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)})`);
}

// ========== IN-MEMORY STORES ==========
const featureStore = {};
const userStore = {};
const subscriptionStore = {};

class MockRedis {
  constructor() { this.store = {}; }
  async hgetall(key) { return this.store[key] || null; }
  async hset(key, fields) {
    if (!this.store[key]) this.store[key] = {};
    Object.assign(this.store[key], fields);
  }
  async expire() {}
  _reset() { this.store = {}; }
}

class MockDoc {
  constructor(data) { this._exists = !!data; this._data = data || {}; }
  get exists() { return this._exists; }
  data() { return this._data; }
}

// Firestore-like access for usage/{userId}/features/{featureId}
const usageStore = {};

function usageDoc(userId, featureId) {
  const coll = usageStore[userId];
  if (!coll || !coll[featureId]) return new MockDoc(null);
  return new MockDoc(coll[featureId]);
}

async function usageSet(userId, featureId, data) {
  if (!usageStore[userId]) usageStore[userId] = {};
  usageStore[userId][featureId] = data;
}

function resetAll() {
  // DO NOT clear features — they are the permanent configuration.
  // Only clear runtime user and usage data.
  Object.keys(userStore).forEach(k => delete userStore[k]);
  Object.keys(usageStore).forEach(k => delete usageStore[k]);
  Object.keys(subscriptionStore).forEach(k => delete subscriptionStore[k]);
}

// ========== FEATURE CONFIG ==========
async function seedFeature(id, cfg) {
  featureStore[id] = { id, ...cfg };
}

async function getFeature(id) {
  return featureStore[id] || null;
}

// ========== PURCHASED LOGIC (same as checkQuota.js) ==========
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

async function testCheckQuota({ featureId, userId, guestId, isPremium, incrementIfAllowed = false }, redisClient, overrideToday, overrideWeekStart) {
  const feature = await getFeature(featureId);
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
    const userData = userStore[userId];
    const subData = subscriptionStore[userId];
    if (userData && userData.role === 'admin') {
      return { allowed: true, remaining: Infinity, limit: Infinity };
    }
    if (!isPremium && subData && subData.status === 'active' && subData.plan === 'premium') {
      isPremium = true;
    }
    if (isPremium && feature.premiumUnlimited) {
      return { allowed: true, remaining: Infinity, limit: Infinity };
    }
  }

  const hasDaily = feature.dailyLimit != null;
  const hasWeekly = feature.weeklyLimit != null;
  const now = new Date();
  const today = overrideToday || fmtDate(now);
  const weekStart = overrideWeekStart || (overrideToday ? getWeekStart(new Date(overrideToday + 'T12:00:00')) : getWeekStart(now));

  if (userId) {
    const data = usageDoc(userId, featureId).data();
    let dailyUsed = data.dailyUsed || 0;
    let weeklyUsed = data.weeklyUsed || 0;
    let dailyDate = data.dailyDate || null;
    let weeklyDate = data.weeklyDate || null;

    if (hasDaily && dailyDate !== today) { dailyUsed = 0; dailyDate = today; }
    if (hasWeekly && weeklyDate !== weekStart) { weeklyUsed = 0; weeklyDate = weekStart; }

    if (hasDaily && dailyUsed >= feature.dailyLimit) {
      return { allowed: false, remaining: 0, limit: feature.dailyLimit, error: 'quota_exhausted', resetDate: new Date(Date.now() + 86400000).toISOString() };
    }
    if (hasWeekly && weeklyUsed >= feature.weeklyLimit) {
      return { allowed: false, remaining: 0, limit: feature.weeklyLimit, error: 'quota_exhausted', resetDate: new Date(Date.now() + 604800000).toISOString() };
    }

    if (incrementIfAllowed) {
      const update = { updatedAt: now.toISOString() };
      if (hasDaily) { update.dailyUsed = dailyUsed + 1; update.dailyDate = today; }
      if (hasWeekly) { update.weeklyUsed = weeklyUsed + 1; update.weeklyDate = weekStart; }
      await usageSet(userId, featureId, update);
    }

    const limit = hasDaily ? feature.dailyLimit : hasWeekly ? feature.weeklyLimit : Infinity;
    const used = hasDaily ? dailyUsed : hasWeekly ? weeklyUsed : 0;
    return { allowed: true, remaining: Math.max(0, limit - used - (incrementIfAllowed ? 1 : 0)), limit };

  } else if (guestId) {
    if (!/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(guestId)) {
      return { allowed: false, error: 'invalid_guest_id' };
    }
    if (!redisClient) {
      return { allowed: false, error: 'quota_unavailable' };
    }
    const key = `guest:${guestId}:usage`;
    const usage = (await redisClient.hgetall(key)) || {};

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
      await redisClient.hset(key, updates);
    }

    const limit = hasDaily ? feature.dailyLimit : hasWeekly ? feature.weeklyLimit : Infinity;
    const used = hasDaily ? dailyUsed : hasWeekly ? weeklyUsed : 0;
    return { allowed: true, remaining: Math.max(0, limit - used - (incrementIfAllowed ? 1 : 0)), limit };
  }

  return { allowed: false, error: 'user_unidentified' };
}

// ========== TEST SUITE ==========
async function runTests() {
  console.log('\n========================================');
  console.log('  QUOTA SYSTEM — COMPREHENSIVE TEST SUITE');
  console.log('========================================\n');

  const mockRedis = new MockRedis();
  const guestId = '550e8400-e29b-41d4-a716-446655440000';
  const authUserId = 'test-user-123';
  const premiumUserId = 'premium-user-456';
  const adminUserId = 'admin-user-789';

  // Setup — seed all features
  await seedFeature('ai_chatbot', { dailyLimit: 5, weeklyLimit: null, premiumUnlimited: true, isEnabled: true, isPublic: false });
  await seedFeature('knowledge_base', { dailyLimit: null, weeklyLimit: 5, premiumUnlimited: true, isEnabled: true, isPublic: false });
  await seedFeature('disease_diagnosis', { dailyLimit: null, weeklyLimit: 1, premiumUnlimited: true, isEnabled: true, isPublic: false });
  await seedFeature('weather', { dailyLimit: null, weeklyLimit: null, premiumUnlimited: false, isEnabled: true, isPublic: true });

  // ---- SECTION 1: PUBLIC FEATURES ----
  console.log('--- 1. PUBLIC FEATURES ---');
  {
    resetAll();
    const r = await testCheckQuota({ featureId: 'weather', incrementIfAllowed: true }, mockRedis);
    assertEq(r.allowed, true, 'Public feature allows access without auth');
    assertEq(r.remaining, Infinity, 'Public feature has unlimited remaining');
  }

  // ---- SECTION 2: AI CHATBOT (GUEST) ----
  console.log('\n--- 2. AI CHATBOT — GUEST USER ---');
  {
    resetAll(); mockRedis._reset();
    for (let i = 1; i <= 5; i++) {
      const r = await testCheckQuota({ featureId: 'ai_chatbot', guestId, incrementIfAllowed: true }, mockRedis);
      assertEq(r.allowed, true, `Guest chatbot request ${i}/5 is allowed`);
      assertEq(r.remaining, 5 - i, `Guest chatbot remaining after ${i} requests is ${5 - i}`);
    }
    const r6 = await testCheckQuota({ featureId: 'ai_chatbot', guestId, incrementIfAllowed: true }, mockRedis);
    assertEq(r6.allowed, false, 'Guest chatbot 6th request is blocked');
    assertEq(r6.error, 'quota_exhausted', 'Guest chatbot blocked with quota_exhausted error');
    assertEq(typeof r6.resetDate, 'string', 'Guest chatbot exhausted response includes resetDate');
  }

  // ---- SECTION 3: AI CHATBOT (FREE AUTH USER) ----
  console.log('\n--- 3. AI CHATBOT — FREE AUTH USER ---');
  {
    resetAll(); mockRedis._reset();
    userStore[authUserId] = { role: 'user' };
    for (let i = 1; i <= 5; i++) {
      const r = await testCheckQuota({ featureId: 'ai_chatbot', userId: authUserId, incrementIfAllowed: true }, mockRedis);
      assertEq(r.allowed, true, `Free auth chatbot request ${i}/5 is allowed`);
      assertEq(r.remaining, 5 - i, `Free auth chatbot remaining after ${i} requests is ${5 - i}`);
    }
    const r6 = await testCheckQuota({ featureId: 'ai_chatbot', userId: authUserId, incrementIfAllowed: true }, mockRedis);
    assertEq(r6.allowed, false, 'Free auth chatbot 6th request is blocked');
    assertEq(r6.error, 'quota_exhausted', 'Free auth chatbot blocked with quota_exhausted');
  }

  // ---- SECTION 4: AI CHATBOT (PREMIUM USER) ----
  console.log('\n--- 4. AI CHATBOT — PREMIUM USER ---');
  {
    for (let i = 1; i <= 10; i++) {
      const r = await testCheckQuota({ featureId: 'ai_chatbot', userId: premiumUserId, isPremium: true, incrementIfAllowed: true }, mockRedis);
      assertEq(r.allowed, true, `Premium chatbot request ${i} is allowed`);
      assertEq(r.remaining, Infinity, `Premium chatbot remaining is Infinity`);
    }
  }

  // ---- SECTION 5: KNOWLEDGE BASE (GUEST) ----
  console.log('\n--- 5. KNOWLEDGE BASE — GUEST USER ---');
  {
    resetAll(); mockRedis._reset();
    for (let i = 1; i <= 5; i++) {
      const r = await testCheckQuota({ featureId: 'knowledge_base', guestId, incrementIfAllowed: true }, mockRedis);
      assertEq(r.allowed, true, `Guest KB search ${i}/5 is allowed`);
      assertEq(r.remaining, 5 - i, `Guest KB remaining after ${i} searches is ${5 - i}`);
    }
    const r6 = await testCheckQuota({ featureId: 'knowledge_base', guestId, incrementIfAllowed: true }, mockRedis);
    assertEq(r6.allowed, false, 'Guest KB 6th search is blocked');
    assertEq(r6.error, 'quota_exhausted', 'Guest KB blocked with quota_exhausted');
    assertEq(typeof r6.resetDate, 'string', 'Guest KB exhausted response includes resetDate');
  }

  // ---- SECTION 6: KNOWLEDGE BASE (FREE AUTH USER) ----
  console.log('\n--- 6. KNOWLEDGE BASE — FREE AUTH USER ---');
  {
    resetAll(); mockRedis._reset();
    userStore[authUserId] = { role: 'user' };
    for (let i = 1; i <= 5; i++) {
      const r = await testCheckQuota({ featureId: 'knowledge_base', userId: authUserId, incrementIfAllowed: true }, mockRedis);
      assertEq(r.allowed, true, `Free auth KB search ${i}/5 is allowed`);
      assertEq(r.remaining, 5 - i, `Free auth KB remaining after ${i} searches is ${5 - i}`);
    }
    const r6 = await testCheckQuota({ featureId: 'knowledge_base', userId: authUserId, incrementIfAllowed: true }, mockRedis);
    assertEq(r6.allowed, false, 'Free auth KB 6th search is blocked');
  }

  // ---- SECTION 7: KNOWLEDGE BASE (PREMIUM USER) ----
  console.log('\n--- 7. KNOWLEDGE BASE — PREMIUM USER ---');
  {
    for (let i = 1; i <= 10; i++) {
      const r = await testCheckQuota({ featureId: 'knowledge_base', userId: premiumUserId, isPremium: true, incrementIfAllowed: true }, mockRedis);
      assertEq(r.allowed, true, `Premium KB search ${i} is allowed`);
      assertEq(r.remaining, Infinity, `Premium KB remaining is Infinity`);
    }
  }

  // ---- SECTION 8: DISEASE DIAGNOSIS (GUEST) ----
  console.log('\n--- 8. DISEASE DIAGNOSIS — GUEST USER ---');
  {
    resetAll(); mockRedis._reset();
    const r1 = await testCheckQuota({ featureId: 'disease_diagnosis', guestId, incrementIfAllowed: true }, mockRedis);
    assertEq(r1.allowed, true, 'Guest diagnosis 1/1 is allowed');
    assertEq(r1.remaining, 0, 'Guest diagnosis remaining after 1 use is 0');
    const r2 = await testCheckQuota({ featureId: 'disease_diagnosis', guestId, incrementIfAllowed: true }, mockRedis);
    assertEq(r2.allowed, false, 'Guest diagnosis 2nd attempt is blocked');
    assertEq(r2.error, 'quota_exhausted', 'Guest diagnosis blocked with quota_exhausted');
    assertEq(typeof r2.resetDate, 'string', 'Guest diagnosis exhausted response includes resetDate');
  }

  // ---- SECTION 9: DISEASE DIAGNOSIS (FREE AUTH USER) ----
  console.log('\n--- 9. DISEASE DIAGNOSIS — FREE AUTH USER ---');
  {
    resetAll(); mockRedis._reset();
    userStore[authUserId] = { role: 'user' };
    const r1 = await testCheckQuota({ featureId: 'disease_diagnosis', userId: authUserId, incrementIfAllowed: true }, mockRedis);
    assertEq(r1.allowed, true, 'Free auth diagnosis 1/1 is allowed');
    assertEq(r1.remaining, 0, 'Free auth diagnosis remaining after 1 use is 0');
    const r2 = await testCheckQuota({ featureId: 'disease_diagnosis', userId: authUserId, incrementIfAllowed: true }, mockRedis);
    assertEq(r2.allowed, false, 'Free auth diagnosis 2nd attempt is blocked');
  }

  // ---- SECTION 10: DISEASE DIAGNOSIS (PREMIUM USER) ----
  console.log('\n--- 10. DISEASE DIAGNOSIS — PREMIUM USER ---');
  {
    for (let i = 1; i <= 10; i++) {
      const r = await testCheckQuota({ featureId: 'disease_diagnosis', userId: premiumUserId, isPremium: true, incrementIfAllowed: true }, mockRedis);
      assertEq(r.allowed, true, `Premium diagnosis ${i} is allowed`);
      assertEq(r.remaining, Infinity, `Premium diagnosis remaining is Infinity`);
    }
  }

  // ---- SECTION 11: FEATURE ISOLATION (AUTH) ----
  console.log('\n--- 11. FEATURE ISOLATION (AUTH USER) ---');
  {
    resetAll(); mockRedis._reset();
    userStore[authUserId] = { role: 'user' };
    for (let i = 0; i < 5; i++)
      await testCheckQuota({ featureId: 'ai_chatbot', userId: authUserId, incrementIfAllowed: true }, mockRedis);

    const kb = await testCheckQuota({ featureId: 'knowledge_base', userId: authUserId, incrementIfAllowed: false }, mockRedis);
    assertEq(kb.remaining, 5, 'KB remaining is 5 after chatbot exhausted');

    const diag = await testCheckQuota({ featureId: 'disease_diagnosis', userId: authUserId, incrementIfAllowed: false }, mockRedis);
    assertEq(diag.remaining, 1, 'Diagnosis remaining is 1 after chatbot exhausted');

    for (let i = 0; i < 5; i++)
      await testCheckQuota({ featureId: 'knowledge_base', userId: authUserId, incrementIfAllowed: true }, mockRedis);

    const cb2 = await testCheckQuota({ featureId: 'ai_chatbot', userId: authUserId, incrementIfAllowed: false }, mockRedis);
    assertEq(cb2.allowed, false, 'Chatbot still exhausted after KB usage');
    assertEq(cb2.remaining, 0, 'Chatbot remaining is 0');
  }

  // ---- SECTION 12: FEATURE ISOLATION (GUEST) ----
  console.log('\n--- 12. FEATURE ISOLATION (GUEST) ---');
  {
    resetAll(); mockRedis._reset();
    for (let i = 0; i < 5; i++)
      await testCheckQuota({ featureId: 'ai_chatbot', guestId, incrementIfAllowed: true }, mockRedis);

    const kb = await testCheckQuota({ featureId: 'knowledge_base', guestId, incrementIfAllowed: false }, mockRedis);
    assertEq(kb.remaining, 5, 'Guest KB remaining is 5 after chatbot exhausted');

    const diag = await testCheckQuota({ featureId: 'disease_diagnosis', guestId, incrementIfAllowed: false }, mockRedis);
    assertEq(diag.remaining, 1, 'Guest diagnosis remaining is 1 after chatbot exhausted');
  }

  // ---- SECTION 13: ADMIN BYPASS ----
  console.log('\n--- 13. ADMIN BYPASS ---');
  {
    resetAll(); mockRedis._reset();
    userStore[adminUserId] = { role: 'admin' };
    for (let i = 1; i <= 20; i++) {
      const r = await testCheckQuota({ featureId: 'ai_chatbot', userId: adminUserId, incrementIfAllowed: true }, mockRedis);
      assertEq(r.allowed, true, `Admin chatbot ${i} is allowed`);
      assertEq(r.remaining, Infinity, `Admin chatbot remaining is Infinity`);
    }
    for (let i = 1; i <= 20; i++) {
      const r = await testCheckQuota({ featureId: 'disease_diagnosis', userId: adminUserId, incrementIfAllowed: true }, mockRedis);
      assertEq(r.allowed, true, `Admin diagnosis ${i} is allowed`);
      assertEq(r.remaining, Infinity, `Admin diagnosis remaining is Infinity`);
    }
  }

  // ---- SECTION 14: PREMIUM BYPASS (via isPremium param) ----
  console.log('\n--- 14. PREMIUM BYPASS (param) ---');
  {
    const r = await testCheckQuota({ featureId: 'ai_chatbot', userId: premiumUserId, isPremium: true, incrementIfAllowed: true }, mockRedis);
    assertEq(r.allowed, true, 'Premium bypass works for chatbot');
    assertEq(r.remaining, Infinity, 'Premium bypass returns Infinity');
    const r2 = await testCheckQuota({ featureId: 'disease_diagnosis', userId: premiumUserId, isPremium: true, incrementIfAllowed: true }, mockRedis);
    assertEq(r2.allowed, true, 'Premium bypass works for diagnosis');
    assertEq(r2.remaining, Infinity, 'Premium bypass returns Infinity');
  }

  // ---- SECTION 14b: PREMIUM AUTO-DETECTION (subscription doc) ----
  console.log('\n--- 14b. PREMIUM AUTO-DETECTION ---');
  {
    resetAll(); mockRedis._reset();
    subscriptionStore[premiumUserId] = { status: 'active', plan: 'premium', startDate: new Date().toISOString() };
    const r = await testCheckQuota({ featureId: 'ai_chatbot', userId: premiumUserId, incrementIfAllowed: true }, mockRedis);
    assertEq(r.allowed, true, 'Premium auto-detection works without isPremium param');
    assertEq(r.remaining, Infinity, 'Premium auto-detection returns Infinity');

    const r2 = await testCheckQuota({ featureId: 'disease_diagnosis', userId: premiumUserId, incrementIfAllowed: true }, mockRedis);
    assertEq(r2.allowed, true, 'Premium auto-detection works for diagnosis');
    assertEq(r2.remaining, Infinity, 'Premium auto-detection returns Infinity');
  }

  // ---- SECTION 14c: EXPIRED SUBSCRIPTION ----
  console.log('\n--- 14c. EXPIRED SUBSCRIPTION ---');
  {
    resetAll(); mockRedis._reset();
    userStore[authUserId] = { role: 'user' };
    subscriptionStore[authUserId] = { status: 'expired', plan: 'premium', endDate: new Date().toISOString() };
    for (let i = 1; i <= 5; i++) {
      const r = await testCheckQuota({ featureId: 'ai_chatbot', userId: authUserId, incrementIfAllowed: true }, mockRedis);
      assertEq(r.allowed, true, `Expired sub user can use chatbot ${i}/5`);
      assertEq(r.remaining, 5 - i, `Expired sub user has ${5 - i} remaining after ${i} uses`);
    }
    const r6 = await testCheckQuota({ featureId: 'ai_chatbot', userId: authUserId, incrementIfAllowed: true }, mockRedis);
    assertEq(r6.allowed, false, 'Expired sub user blocked after 5 uses');
  }

  // ---- SECTION 15: UNIDENTIFIED USER ----
  console.log('\n--- 15. UNIDENTIFIED USER ---');
  {
    const r = await testCheckQuota({ featureId: 'ai_chatbot', incrementIfAllowed: true }, mockRedis);
    assertEq(r.allowed, false, 'No user/guest returns user_unidentified');
    assertEq(r.error, 'user_unidentified', 'No user/guest returns correct error');
  }

  // ---- SECTION 16: INVALID GUEST ID ----
  console.log('\n--- 16. INVALID GUEST ID ---');
  {
    const r = await testCheckQuota({ featureId: 'ai_chatbot', guestId: 'not-a-uuid', incrementIfAllowed: true }, mockRedis);
    assertEq(r.allowed, false, 'Invalid guest ID returns false');
    assertEq(r.error, 'invalid_guest_id', 'Invalid guest ID returns correct error');
  }

  // ---- SECTION 17: NO REDIS FOR GUEST ----
  console.log('\n--- 17. NO REDIS AVAILABLE ---');
  {
    const r = await testCheckQuota({ featureId: 'ai_chatbot', guestId, incrementIfAllowed: true }, null);
    assertEq(r.allowed, false, 'No Redis returns quota_unavailable');
    assertEq(r.error, 'quota_unavailable', 'No Redis returns correct error');
  }

  // ---- SECTION 18: DAILY RESET (GUEST, calendar-based) ----
  console.log('\n--- 18. DAILY RESET — GUEST ---');
  {
    resetAll(); mockRedis._reset();
    const today = '2026-07-26';
    const tomorrow = '2026-07-27';
    for (let i = 0; i < 5; i++)
      await testCheckQuota({ featureId: 'ai_chatbot', guestId, incrementIfAllowed: true }, mockRedis, today);

    const re = await testCheckQuota({ featureId: 'ai_chatbot', guestId, incrementIfAllowed: false }, mockRedis, today);
    assertEq(re.allowed, false, 'Guest chatbot exhausted today');

    const rNext = await testCheckQuota({ featureId: 'ai_chatbot', guestId, incrementIfAllowed: true }, mockRedis, tomorrow);
    assertEq(rNext.allowed, true, 'Guest chatbot resets next day');
    assertEq(rNext.remaining, 4, 'Guest chatbot has 4 after reset+1');
  }

  // ---- SECTION 19: DAILY RESET (AUTH, calendar-based = same as guest) ----
  console.log('\n--- 19. DAILY RESET — AUTH USER ---');
  {
    resetAll(); mockRedis._reset();
    userStore[authUserId] = { role: 'user' };
    const today = '2026-07-26';
    const tomorrow = '2026-07-27';
    for (let i = 0; i < 5; i++)
      await testCheckQuota({ featureId: 'ai_chatbot', userId: authUserId, incrementIfAllowed: true }, mockRedis, today);

    const re = await testCheckQuota({ featureId: 'ai_chatbot', userId: authUserId, incrementIfAllowed: false }, mockRedis, today);
    assertEq(re.allowed, false, 'Auth chatbot exhausted today');

    const rNext = await testCheckQuota({ featureId: 'ai_chatbot', userId: authUserId, incrementIfAllowed: true }, mockRedis, tomorrow);
    assertEq(rNext.allowed, true, 'Auth chatbot resets next day');
    assertEq(rNext.remaining, 4, 'Auth chatbot has 4 after reset+1');
  }

  // ---- SECTION 20: WEEKLY RESET (GUEST, Monday-based) ----
  console.log('\n--- 20. WEEKLY RESET — GUEST ---');
  {
    resetAll(); mockRedis._reset();
    const sunday = '2026-07-26';
    const nextMonday = '2026-08-03';
    const weekStartSun = getWeekStart(new Date(sunday + 'T12:00:00'));
    const weekStartNext = getWeekStart(new Date(nextMonday + 'T12:00:00'));
    assertEq(weekStartSun, '2026-07-20', 'Week start for Sunday is Mon July 20');
    assertEq(weekStartNext, '2026-08-03', 'Week start for Mon Aug 3 is Mon Aug 3');

    for (let i = 0; i < 5; i++)
      await testCheckQuota({ featureId: 'knowledge_base', guestId, incrementIfAllowed: true }, mockRedis, sunday);

    const re = await testCheckQuota({ featureId: 'knowledge_base', guestId, incrementIfAllowed: false }, mockRedis, sunday);
    assertEq(re.allowed, false, 'Guest KB exhausted on Sunday');

    const rNew = await testCheckQuota({ featureId: 'knowledge_base', guestId, incrementIfAllowed: true }, mockRedis, nextMonday);
    assertEq(rNew.allowed, true, 'Guest KB resets on Monday');
  }

  // ---- SECTION 21: WEEKLY RESET (AUTH, Monday-based = same as guest) ----
  console.log('\n--- 21. WEEKLY RESET — AUTH USER ---');
  {
    resetAll(); mockRedis._reset();
    userStore[authUserId] = { role: 'user' };
    const sunday = '2026-07-26';
    const nextMonday = '2026-08-03';

    await testCheckQuota({ featureId: 'disease_diagnosis', userId: authUserId, incrementIfAllowed: true }, mockRedis, sunday);
    const re = await testCheckQuota({ featureId: 'disease_diagnosis', userId: authUserId, incrementIfAllowed: false }, mockRedis, sunday);
    assertEq(re.allowed, false, 'Auth diagnosis exhausted on Sunday');

    const rNew = await testCheckQuota({ featureId: 'disease_diagnosis', userId: authUserId, incrementIfAllowed: true }, mockRedis, nextMonday);
    assertEq(rNew.allowed, true, 'Auth diagnosis resets on Monday');
  }

  // ---- SECTION 22: AUTH USER ISOLATION (no shared quotas) ----
  console.log('\n--- 22. AUTH USER ISOLATION ---');
  {
    resetAll(); mockRedis._reset();
    const userA = 'user-a';
    const userB = 'user-b';
    userStore[userA] = { role: 'user' };
    userStore[userB] = { role: 'user' };

    for (let i = 0; i < 3; i++)
      await testCheckQuota({ featureId: 'ai_chatbot', userId: userA, incrementIfAllowed: true }, mockRedis);

    const rB = await testCheckQuota({ featureId: 'ai_chatbot', userId: userB, incrementIfAllowed: true }, mockRedis);
    assertEq(rB.allowed, true, 'User B starts fresh');
    assertEq(rB.remaining, 4, 'User B has 4 after first use');

    const rA = await testCheckQuota({ featureId: 'ai_chatbot', userId: userA, incrementIfAllowed: false }, mockRedis);
    assertEq(rA.remaining, 2, 'User A has 2 after 3 uses');
  }

  // ---- SECTION 23: READ-ONLY CHECK (incrementIfAllowed: false) ----
  console.log('\n--- 23. READ-ONLY CHECK ---');
  {
    resetAll(); mockRedis._reset();
    userStore[authUserId] = { role: 'user' };

    for (let i = 0; i < 10; i++) {
      const r = await testCheckQuota({ featureId: 'ai_chatbot', userId: authUserId, incrementIfAllowed: false }, mockRedis);
      assertEq(r.allowed, true, `Auth read-only ${i+1} returns allowed`);
      assertEq(r.remaining, 5, `Auth read-only ${i+1} stays at 5`);
    }

    for (let i = 0; i < 10; i++) {
      const r = await testCheckQuota({ featureId: 'ai_chatbot', guestId, incrementIfAllowed: false }, mockRedis);
      assertEq(r.allowed, true, `Guest read-only ${i+1} returns allowed`);
      assertEq(r.remaining, 5, `Guest read-only ${i+1} stays at 5`);
    }
  }

  // ---- SECTION 24: COUNTER ACCURACY ----
  console.log('\n--- 24. COUNTER ACCURACY ---');
  {
    resetAll(); mockRedis._reset();
    userStore[authUserId] = { role: 'user' };
    const expected = [4, 3, 2, 1, 0];
    for (let i = 0; i < 5; i++) {
      const r = await testCheckQuota({ featureId: 'ai_chatbot', userId: authUserId, incrementIfAllowed: true }, mockRedis);
      assertEq(r.remaining, expected[i], `Remaining after use ${i+1}: expected ${expected[i]}`);
    }
  }

  // ---- SECTION 25: DISABLED FEATURE ----
  console.log('\n--- 25. DISABLED FEATURE ---');
  {
    resetAll(); mockRedis._reset();
    const r = await testCheckQuota({ featureId: 'nonexistent', guestId, incrementIfAllowed: true }, mockRedis);
    assertEq(r.allowed, false, 'Nonexistent feature returns false');
    assertEq(r.error, 'feature_unavailable', 'Nonexistent feature returns feature_unavailable');

    featureStore.ai_chatbot.isEnabled = false;
    const rd = await testCheckQuota({ featureId: 'ai_chatbot', guestId, incrementIfAllowed: true }, mockRedis);
    assertEq(rd.allowed, false, 'Disabled feature returns false');
    assertEq(rd.error, 'feature_unavailable', 'Disabled feature returns feature_unavailable');

    featureStore.ai_chatbot.isEnabled = true;
  }

  // ========== SUMMARY ==========
  console.log('\n========================================');
  console.log('  TEST RESULTS');
  console.log('========================================');
  console.log(`  Passed: ${passed}`);
  console.log(`  Failed: ${failed}`);
  if (failures.length > 0) {
    console.log('\n  FAILURES:');
    failures.forEach(f => console.log(`    - ${f}`));
  }
  console.log('========================================\n');

  return failed === 0;
}

runTests().then(success => {
  process.exit(success ? 0 : 1);
});

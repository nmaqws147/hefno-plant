# Quota & Access Control System — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement a three-tier (Guest/Free/Premium) per-feature quota system enforced server-side with Firestore feature configs, Redis guest tracking, centralized middleware, and frontend hooks/components.

**Architecture:** Firestore `features/{featureId}` docs define per-feature limits. `usage/{userId}/features/{featureId}` docs track authenticated usage. Redis `guest:{guestId}:usage` hashes track guest usage with 7-day TTL. A single `checkQuota()` middleware function validates every protected API request. Frontend hooks/QuotaModal provide UX.

**Tech Stack:** Firebase Firestore (feature configs + auth user quotas), Upstash Redis (guest quotas), Firebase Admin SDK (server-side auth), Vercel serverless functions (API layer)

## Global Constraints

- All quota checks happen server-side — frontend validation is UX only
- Guest and Free users share the same limit values (5/day chatbot, 5/week KB, 1/week diagnosis)
- Premium users are unlimited on all features
- Guest counters and auth counters live in separate storage (Redis vs Firestore)
- Resets checked on every request by comparing dates — no cron dependency
- Feature IDs used throughout: `ai_chatbot`, `knowledge_base`, `disease_diagnosis`
- `api/_lib/firebaseAdmin.js` provides `db` (Firestore) and `verifyToken()` already
- `@upstash/redis` is already a dependency in `api/package.json`

---

### Task 1: Feature Config Loader (`api/_lib/loadFeatures.js`)

**Files:**
- Create: `api/_lib/loadFeatures.js`

**Interfaces:**
- Produces: `loadFeature(featureId: string) => Promise<object|null>`, `loadAllFeatures() => Promise<object>`, `clearCache() => void`

- [ ] **Step 1: Create `api/_lib/loadFeatures.js`**

```js
const { db } = require('./firebaseAdmin');

let cache = null;
let cacheTime = 0;
const CACHE_TTL = 60000;

async function loadFeature(featureId) {
  const now = Date.now();
  if (cache && now - cacheTime < CACHE_TTL && cache[featureId]) {
    return cache[featureId];
  }
  const doc = await db.collection('features').doc(featureId).get();
  if (!doc.exists) return null;
  const feature = { id: doc.id, ...doc.data() };
  if (!cache) cache = {};
  cache[featureId] = feature;
  cacheTime = now;
  return feature;
}

async function loadAllFeatures() {
  const now = Date.now();
  if (cache && now - cacheTime < CACHE_TTL) return cache;
  const snapshot = await db.collection('features').get();
  cache = {};
  snapshot.forEach(doc => { cache[doc.id] = { id: doc.id, ...doc.data() }; });
  cacheTime = now;
  return cache;
}

function clearCache() { cache = null; cacheTime = 0; }

module.exports = { loadFeature, loadAllFeatures, clearCache };
```

- [ ] **Step 2: Verify no syntax errors**

Run: `node -e "require('./api/_lib/loadFeatures')"` from project root
Expected: no output (module loads successfully)

- [ ] **Step 3: Commit**

```bash
git add api/_lib/loadFeatures.js
git commit -m "feat: add feature config loader with 60s cache"
```

---

### Task 2: Seed Firestore Feature Configs (`scripts/seed-features.js`)

**Files:**
- Create: `scripts/seed-features.js`
- Depends on: Task 1 (loadFeatures.js pattern)

**Interfaces:**
- Produces: 3 Firestore documents in `features/` collection

- [ ] **Step 1: Create `scripts/seed-features.js`**

```js
const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
require('dotenv').config({ path: require('path').join(__dirname, '..', 'api', '.env') });

const app = initializeApp({
  credential: cert({
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
  }),
});
const db = getFirestore(app);

const FEATURES = [
  {
    id: 'ai_chatbot',
    displayName: 'AI Chatbot',
    order: 1,
    dailyLimit: 5,
    weeklyLimit: null,
    monthlyLimit: null,
    premiumUnlimited: true,
    isPublic: false,
    isEnabled: true,
  },
  {
    id: 'knowledge_base',
    displayName: 'Knowledge Base',
    order: 2,
    dailyLimit: null,
    weeklyLimit: 5,
    monthlyLimit: null,
    premiumUnlimited: true,
    isPublic: false,
    isEnabled: true,
  },
  {
    id: 'disease_diagnosis',
    displayName: 'AI Disease Diagnosis',
    order: 3,
    dailyLimit: null,
    weeklyLimit: 1,
    monthlyLimit: null,
    premiumUnlimited: true,
    isPublic: false,
    isEnabled: true,
  },
];

async function seed() {
  for (const feat of FEATURES) {
    await db.collection('features').doc(feat.id).set({
      ...feat,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    console.log(`Seeded: ${feat.id}`);
  }
  console.log('Done');
  process.exit(0);
}

seed().catch(err => { console.error(err); process.exit(1); });
```

- [ ] **Step 2: Run the seed script**

Run: `node scripts/seed-features.js`
Expected: "Seeded: ai_chatbot", "Seeded: knowledge_base", "Seeded: disease_diagnosis", "Done"

- [ ] **Step 3: Commit**

```bash
git add scripts/seed-features.js
git commit -m "feat: add feature seed script and seed Firestore with 3 features"
```

---

### Task 3: Quota Middleware (`api/_lib/checkQuota.js`)

**Files:**
- Create: `api/_lib/checkQuota.js`
- Depends on: Task 1 (loadFeature)

**Interfaces:**
- Produces: `checkQuota({ featureId, userId, guestId, isPremium, incrementIfAllowed }) => Promise<{ allowed, remaining, limit, error?, resetDate? }>`

- [ ] **Step 1: Create `api/_lib/checkQuota.js`**

```js
const { db } = require('./firebaseAdmin');
const { Redis } = require('@upstash/redis');
const { loadFeature } = require('./loadFeatures');

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN,
});

const UUID_V4_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function fmtDate(d) { return d.toISOString().split('T')[0]; }

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

  const hasDaily = feature.dailyLimit != null;
  const hasWeekly = feature.weeklyLimit != null;
  const now = new Date();
  const today = fmtDate(now);
  const weekStart = getWeekStart(now);

  if (userId) {
    const ref = db.collection('usage').doc(userId).collection('features').doc(featureId);
    const snap = await ref.get();
    let data = snap.exists ? snap.data() : {};

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
    return { allowed: true, remaining: limit - used - (incrementIfAllowed ? 1 : 0), limit };

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
    return { allowed: true, remaining: limit - used - (incrementIfAllowed ? 1 : 0), limit };
  }

  return { allowed: false, error: 'user_unidentified' };
}

module.exports = { checkQuota };
```

- [ ] **Step 2: Verify syntax**

Run: `node -e "require('./api/_lib/checkQuota')"`
Expected: no errors (module loads)

- [ ] **Step 3: Commit**

```bash
git add api/_lib/checkQuota.js
git commit -m "feat: add centralized quota middleware with Firestore + Redis support"
```

---

### Task 4: Read-Only Quota Check API (`api/check-quota.js`)

**Files:**
- Create: `api/check-quota.js`
- Depends on: Task 3

- [ ] **Step 1: Create `api/check-quota.js`**

```js
const { checkQuota } = require('./_lib/checkQuota');

module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { featureId } = req.body;
  if (!featureId) return res.status(400).json({ error: 'featureId required' });

  const authHeader = req.headers.authorization;
  let userId = null;
  let isPremium = false;

  if (authHeader?.startsWith('Bearer ')) {
    try {
      const { verifyToken } = require('./_lib/firebaseAdmin');
      const decoded = await verifyToken(authHeader.slice(7));
      userId = decoded.uid;
      // Future: check subscriptions/{uid} for isPremium
    } catch (_) {}
  }

  const guestId = req.headers['x-guest-id'] || null;

  const result = await checkQuota({ featureId, userId, guestId, isPremium, incrementIfAllowed: false });
  return res.json(result);
};
```

- [ ] **Step 2: Verify syntax**

Run: `node -e "require('./api/check-quota')"`
Expected: no errors

- [ ] **Step 3: Commit**

```bash
git add api/check-quota.js
git commit -m "feat: add read-only quota check API endpoint"
```

---

### Task 5: Knowledge Base Search API (`api/knowledge-base.js`)

**Files:**
- Create: `api/knowledge-base.js`
- Depends on: Task 3

- [ ] **Step 1: Create `api/knowledge-base.js`**

```js
const path = require('path');
const fs = require('fs');
const { checkQuota } = require('./_lib/checkQuota');

let dataCache = null;
function loadData() {
  if (dataCache) return dataCache;
  dataCache = JSON.parse(fs.readFileSync(path.join(__dirname, 'json-data', 'data.json'), 'utf-8'));
  return dataCache;
}

module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { query, category } = req.body;
  if (!query || typeof query !== 'string' || !query.trim()) {
    return res.status(400).json({ error: 'Query is required' });
  }

  const authHeader = req.headers.authorization;
  let userId = null;
  let isPremium = false;
  if (authHeader?.startsWith('Bearer ')) {
    try {
      const { verifyToken } = require('./_lib/firebaseAdmin');
      const decoded = await verifyToken(authHeader.slice(7));
      userId = decoded.uid;
    } catch (_) {}
  }
  const guestId = req.headers['x-guest-id'] || null;

  const quota = await checkQuota({ featureId: 'knowledge_base', userId, guestId, isPremium, incrementIfAllowed: true });
  if (!quota.allowed) {
    return res.status(429).json({ error: quota.error, remaining: 0, limit: quota.limit });
  }

  const data = loadData();
  const q = query.trim().toLowerCase();
  const results = data.filter(item => {
    const text = [
      item.name, item.scientific_name, item.description,
      item.symptoms, item.treatment, item.category, item.type,
      item.host_crops, item.conditions, item.prevention,
    ].filter(Boolean).join(' ').toLowerCase();
    return text.includes(q);
  }).slice(0, 20);

  res.json({
    allowed: true,
    remaining: quota.remaining,
    limit: quota.limit,
    count: results.length,
    results,
  });
};
```

- [ ] **Step 2: Verify syntax**

Run: `node -e "require('./api/knowledge-base')"`
Expected: no errors

- [ ] **Step 3: Commit**

```bash
git add api/knowledge-base.js
git commit -m "feat: add Knowledge Base search API with quota check"
```

---

### Task 6: Add Quota Check to Existing APIs (`api/ai.js` + `api/analyze-image.js`)

**Files:**
- Modify: `api/ai.js`, `api/analyze-image.js`
- Depends on: Task 3

- [ ] **Step 1: Add quota check to `api/ai.js`**

Insert at the top of the route handler (after the `module.exports` function starts, before the existing rate limit check):

```js
const { checkQuota } = require('./_lib/checkQuota');

// Determine user
const authHeader = req.headers.authorization;
let userId = null;
let isPremium = false;
if (authHeader?.startsWith('Bearer ')) {
  try {
    const { verifyToken } = require('./_lib/firebaseAdmin');
    const decoded = await verifyToken(authHeader.slice(7));
    userId = decoded.uid;
  } catch (_) {}
}
const guestId = req.headers['x-guest-id'] || null;

const quota = await checkQuota({ featureId: 'ai_chatbot', userId, guestId, isPremium, incrementIfAllowed: true });
if (!quota.allowed) {
  return res.status(429).json({
    error: 'quota_exhausted',
    message: 'You have used all your free conversations for today.',
    remaining: 0,
    limit: quota.limit,
  });
}
```

Remove the old IP-based rate limit code (the Redis rate limit at the top).

- [ ] **Step 2: Add quota check to `api/analyze-image.js`**

Same pattern — insert at top of handler:

```js
const { checkQuota } = require('./_lib/checkQuota');

const authHeader = req.headers.authorization;
let userId = null;
let isPremium = false;
if (authHeader?.startsWith('Bearer ')) {
  try {
    const { verifyToken } = require('./_lib/firebaseAdmin');
    const decoded = await verifyToken(authHeader.slice(7));
    userId = decoded.uid;
  } catch (_) {}
}
const guestId = req.headers['x-guest-id'] || null;

const quota = await checkQuota({ featureId: 'disease_diagnosis', userId, guestId, isPremium, incrementIfAllowed: true });
if (!quota.allowed) {
  return res.status(429).json({
    error: 'quota_exhausted',
    message: 'You have used all your free diagnoses for this week.',
    remaining: 0,
    limit: quota.limit,
  });
}
```

Remove the old IP-based rate limit code.

- [ ] **Step 3: Verify no syntax errors**

Run: `node -e "require('./api/ai')" && node -e "require('./api/analyze-image')"`
Expected: no errors

- [ ] **Step 4: Commit**

```bash
git add api/ai.js api/analyze-image.js
git commit -m "feat: add quota middleware to chatbot and diagnosis APIs"
```

---

### Task 7: Guest ID Service (`src/services/guestId.js`)

**Files:**
- Create: `src/services/guestId.js`

**Interfaces:**
- Produces: `getGuestId() => string`, `getGuestIdHeader() => object`

- [ ] **Step 1: Create `src/services/guestId.js`**

```js
const GUEST_KEY = 'hefno_guest_id';

function generateUUID() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
    const r = Math.random() * 16 | 0;
    return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
  });
}

export function getGuestId() {
  let id = localStorage.getItem(GUEST_KEY);
  if (!id) {
    id = generateUUID();
    localStorage.setItem(GUEST_KEY, id);
  }
  return id;
}

export function getGuestIdHeader() {
  return { 'X-Guest-Id': getGuestId() };
}
```

- [ ] **Step 2: Verify file loads in browser build**

Run: `npm run build`
Expected: Compiled successfully

- [ ] **Step 3: Commit**

```bash
git add src/services/guestId.js
git commit -m "feat: add guest UUID service with localStorage persistence"
```

---

### Task 8: Client-Side Quota Service (`src/services/quotaService.js`)

**Files:**
- Create: `src/services/quotaService.js`
- Depends on: Task 7

**Interfaces:**
- Produces: `checkFeatureAccess(featureId) => Promise<{ allowed, remaining, limit }>`, `searchKnowledgeBase(query, category?) => Promise<{ allowed, remaining, results }>`

- [ ] **Step 1: Create `src/services/quotaService.js`**

```js
import { getGuestIdHeader } from './guestId';

const API_BASE = '/api';

async function apiPost(path, body) {
  const headers = {
    'Content-Type': 'application/json',
    ...getGuestIdHeader(),
  };
  const token = localStorage.getItem('firebaseToken');
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  const res = await fetch(`${API_BASE}${path}`, {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
  });
  return res.json();
}

export async function checkFeatureAccess(featureId) {
  return apiPost('/check-quota', { featureId });
}

export async function searchKnowledgeBase(query, category) {
  return apiPost('/knowledge-base', { query, category });
}

export function formatRemaining(count, limit, period) {
  if (limit === Infinity) return 'Unlimited';
  const remaining = limit - count;
  return `${remaining} of ${limit} ${period} remaining`;
}
```

- [ ] **Step 2: Verify build**

Run: `npm run build`
Expected: Compiled successfully

- [ ] **Step 3: Commit**

```bash
git add src/services/quotaService.js
git commit -m "feat: add client-side quota service with API helpers"
```

---

### Task 9: AuthContext Premium Support (`src/context/AuthContext.jsx`)

**Files:**
- Modify: `src/context/AuthContext.jsx`
- Depends on: understanding current AuthContext structure

- [ ] **Step 1: Read current AuthContext**

Open `src/context/AuthContext.jsx` to understand current shape.

- [ ] **Step 2: Add `isPremium` and `subscription` to context value**

Add derived fields to the context value object:

```js
const subscription = userProfile?.subscription || null;
const isPremium = subscription && subscription.plan !== 'free';

// In the provider value:
value={{
  user,
  userProfile,
  loading,
  role,
  isAdmin,
  isPremium,
  subscription,
  login,
  signup,
  logout,
}}
```

- [ ] **Step 3: Verify build**

Run: `npm run build`
Expected: Compiled successfully

- [ ] **Step 4: Commit**

```bash
git add src/context/AuthContext.jsx
git commit -m "feat: add isPremium and subscription to auth context"
```

---

### Task 10: Feature Access Hook (`src/hooks/useFeatureAccess.js`)

**Files:**
- Create: `src/hooks/useFeatureAccess.js`
- Depends on: Task 8, Task 9

**Interfaces:**
- Produces: `useFeatureAccess(featureId) => { allowed, remaining, limit, isLoading, error, checkAccess }`

- [ ] **Step 1: Create `src/hooks/useFeatureAccess.js`**

```js
import { useState, useCallback } from 'react';
import { checkFeatureAccess } from '../services/quotaService';
import { useAuth } from '../context/AuthContext';

export function useFeatureAccess(featureId) {
  const { isPremium } = useAuth();
  const [quota, setQuota] = useState({ allowed: null, remaining: 0, limit: 0 });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const checkAccess = useCallback(async () => {
    if (isPremium) {
      setQuota({ allowed: true, remaining: Infinity, limit: Infinity });
      return { allowed: true, remaining: Infinity, limit: Infinity };
    }
    setIsLoading(true);
    setError(null);
    try {
      const result = await checkFeatureAccess(featureId);
      if (result.error) {
        setError(result.error);
        setQuota({ allowed: false, remaining: 0, limit: result.limit || 0 });
        return result;
      }
      setQuota({ allowed: result.allowed, remaining: result.remaining, limit: result.limit });
      return result;
    } catch (err) {
      setError(err.message);
      setQuota({ allowed: false, remaining: 0, limit: 0 });
      return { allowed: false, error: err.message };
    } finally {
      setIsLoading(false);
    }
  }, [featureId, isPremium]);

  return { ...quota, isLoading, error, checkAccess };
}
```

- [ ] **Step 2: Verify build**

Run: `npm run build`
Expected: Compiled successfully

- [ ] **Step 3: Commit**

```bash
git add src/hooks/useFeatureAccess.js
git commit -m "feat: add useFeatureAccess hook for quota checks"
```

---

### Task 11: Quota Display Hook (`src/hooks/useQuotaDisplay.js`)

**Files:**
- Create: `src/hooks/useQuotaDisplay.js`

**Interfaces:**
- Produces: `useQuotaDisplay(featureId) => { text, remaining, limit, isUnlimited }`

- [ ] **Step 1: Create `src/hooks/useQuotaDisplay.js`**

```js
import { useEffect, useState } from 'react';
import { checkFeatureAccess, formatRemaining } from '../services/quotaService';
import { useAuth } from '../context/AuthContext';

const LABELS = {
  ai_chatbot: { period: 'today', unit: 'conversations' },
  knowledge_base: { period: 'this week', unit: 'searches' },
  disease_diagnosis: { period: 'this week', unit: 'diagnoses' },
};

export function useQuotaDisplay(featureId) {
  const { isPremium } = useAuth();
  const [remaining, setRemaining] = useState(0);
  const [limit, setLimit] = useState(0);

  useEffect(() => {
    if (isPremium) {
      setRemaining(Infinity);
      setLimit(Infinity);
      return;
    }
    checkFeatureAccess(featureId).then(res => {
      setRemaining(res.remaining ?? 0);
      setLimit(res.limit ?? 0);
    });
  }, [featureId, isPremium]);

  const label = LABELS[featureId] || { period: '', unit: 'uses' };

  if (isPremium || limit === Infinity) {
    return { text: 'Unlimited', remaining: Infinity, limit: Infinity, isUnlimited: true };
  }

  const used = limit - remaining;
  const text = `${used} of ${limit} ${label.unit} ${label.period}`;
  return { text, remaining, limit, isUnlimited: false };
}
```

- [ ] **Step 2: Verify build**

Run: `npm run build`
Expected: Compiled successfully

- [ ] **Step 3: Commit**

```bash
git add src/hooks/useQuotaDisplay.js
git commit -m "feat: add useQuotaDisplay hook for formatted quota text"
```

---

### Task 12: Quota Components (`QuotaModal.jsx` + `QuotaBadge.jsx`)

**Files:**
- Create: `src/component/QuotaModal.jsx`
- Create: `src/component/QuotaBadge.jsx`
- Depends on: Task 9 (AuthContext)

- [ ] **Step 1: Create `src/component/QuotaModal.jsx`**

```jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const QuotaModal = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const navigate = useNavigate();

  if (!isOpen) return null;

  const isGuest = !user;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4" onClick={onClose}>
      <div
        className="bg-white dark:bg-[#1d1d1d] rounded-2xl p-8 max-w-md w-full shadow-2xl border border-[#e8e3d8] dark:border-[#2a2a2a]"
        onClick={e => e.stopPropagation()}
      >
        <div className="w-14 h-14 mx-auto mb-5 rounded-2xl bg-amber-50 dark:bg-amber-900/20 flex items-center justify-center">
          <svg className="w-7 h-7 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>

        {isGuest ? (
          <>
            <h2 className="text-xl font-bold text-center text-[#2d2a24] dark:text-white mb-2">
              Free Usage Limit Reached
            </h2>
            <p className="text-sm text-center text-[#8a8580] dark:text-[#a1a1aa] mb-6">
              You have reached your free usage limit. Create a free account to continue using HefnoPlant.
            </p>
            <div className="flex flex-col gap-3">
              <button
                onClick={() => navigate('/login')}
                className="w-full py-2.5 rounded-xl bg-[#4a7c59] hover:bg-[#3d6b4b] text-white text-sm font-medium transition-colors"
              >
                Sign In
              </button>
              <button
                onClick={() => navigate('/signup')}
                className="w-full py-2.5 rounded-xl bg-white dark:bg-[#2a2a2a] border border-[#e8e3d8] dark:border-[#333] text-[#2d2a24] dark:text-white text-sm font-medium transition-colors hover:border-[#4a7c59]/30"
              >
                Create Account
              </button>
              <button
                onClick={onClose}
                className="w-full py-2 text-xs text-[#8a8580] dark:text-[#6b7280] hover:text-[#2d2a24] dark:hover:text-white transition-colors"
              >
                Cancel
              </button>
            </div>
          </>
        ) : (
          <>
            <h2 className="text-xl font-bold text-center text-[#2d2a24] dark:text-white mb-2">
              Weekly Limit Reached
            </h2>
            <p className="text-sm text-center text-[#8a8580] dark:text-[#a1a1aa] mb-6">
              You have reached your free plan limit. Upgrade to Premium for unlimited access.
            </p>
            <div className="flex flex-col gap-3">
              <button
                onClick={() => {/* Future: navigate to /pricing */}}
                className="w-full py-2.5 rounded-xl bg-[#4a7c59] hover:bg-[#3d6b4b] text-white text-sm font-medium transition-colors"
              >
                Upgrade Now
              </button>
              <button
                onClick={onClose}
                className="w-full py-2.5 rounded-xl bg-white dark:bg-[#2a2a2a] border border-[#e8e3d8] dark:border-[#333] text-[#2d2a24] dark:text-white text-sm font-medium transition-colors"
              >
                Maybe Later
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default QuotaModal;
```

- [ ] **Step 2: Create `src/component/QuotaBadge.jsx`**

```jsx
import { useQuotaDisplay } from '../hooks/useQuotaDisplay';

const QuotaBadge = ({ featureId, className = '' }) => {
  const { text, isUnlimited } = useQuotaDisplay(featureId);

  return (
    <span className={`inline-flex items-center gap-1.5 text-xs ${isUnlimited ? 'text-emerald-600 dark:text-emerald-400' : 'text-[#8a8580] dark:text-[#a1a1aa]'} ${className}`}>
      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>
      {text}
    </span>
  );
};

export default QuotaBadge;
```

- [ ] **Step 3: Verify build**

Run: `npm run build`
Expected: Compiled successfully

- [ ] **Step 4: Commit**

```bash
git add src/component/QuotaModal.jsx src/component/QuotaBadge.jsx
git commit -m "feat: add QuotaModal and QuotaBadge components"
```

---

### Task 13: Integrate into Chatbot (`src/component/ChatWidget.jsx`)

**Files:**
- Modify: `src/component/ChatWidget.jsx`
- Depends on: Task 10, Task 12

- [ ] **Step 1: Read current ChatWidget.jsx** to understand the structure.

- [ ] **Step 2: Add quota check before processing messages**

```jsx
import { useFeatureAccess } from '../../hooks/useFeatureAccess';
import QuotaModal from './QuotaModal';
import QuotaBadge from './QuotaBadge';

// Inside component:
const { allowed, remaining, checkAccess } = useFeatureAccess('ai_chatbot');
const [showQuotaModal, setShowQuotaModal] = useState(false);

// Before sending message:
const handleSend = async () => {
  if (!input.trim()) return;
  
  const access = await checkAccess();
  if (!access.allowed) {
    setShowQuotaModal(true);
    return;
  }
  
  // existing send logic...
};
```

Add `<QuotaBadge featureId="ai_chatbot" />` near the chat input area.
Add `<QuotaModal isOpen={showQuotaModal} onClose={() => setShowQuotaModal(false)} />` in the JSX.

- [ ] **Step 3: Verify build**

Run: `npm run build`
Expected: Compiled successfully

- [ ] **Step 4: Commit**

```bash
git add src/component/ChatWidget.jsx
git commit -m "feat: integrate quota system into chat widget"
```

---

### Task 14: Integrate into Diagnose Page (`src/pages/DiagnosePage.jsx`)

**Files:**
- Modify: `src/pages/DiagnosePage.jsx`
- Depends on: Task 10, Task 12

- [ ] **Step 1: Read DiagnosePage.jsx** to understand the analyze flow.

- [ ] **Step 2: Add quota check before analysis + quota badge + modal**

```jsx
import { useFeatureAccess } from '../hooks/useFeatureAccess';
import QuotaModal from '../component/QuotaModal';
import QuotaBadge from '../component/QuotaBadge';

// Inside component:
const { checkAccess } = useFeatureAccess('disease_diagnosis');
const [showQuotaModal, setShowQuotaModal] = useState(false);

// Before calling analyze API:
const handleAnalyze = async () => {
  const access = await checkAccess();
  if (!access.allowed) {
    setShowQuotaModal(true);
    return;
  }
  // existing analyze logic...
};
```

Add `<QuotaBadge featureId="disease_diagnosis" />` near the upload area.
Add `<QuotaModal isOpen={showQuotaModal} onClose={() => setShowQuotaModal(false)} />`.

- [ ] **Step 3: Verify build**

Run: `npm run build`
Expected: Compiled successfully

- [ ] **Step 4: Commit**

```bash
git add src/pages/DiagnosePage.jsx
git commit -m "feat: integrate quota system into disease diagnosis page"
```

---

### Task 15: Integrate into Knowledge Base (`src/component/knowledge.jsx` + `src/pages/knowledge-layer.js`)

**Files:**
- Modify: `src/component/knowledge.jsx`
- Modify: `src/pages/knowledge-layer.js`
- Depends on: Task 8 (quotaService), Task 12 (QuotaBadge)

- [ ] **Step 1: Add search bar to `src/component/knowledge.jsx`** that calls the KB API

```jsx
import { useState } from 'react';
import QuotaBadge from './QuotaBadge';
import { searchKnowledgeBase } from '../services/quotaService';

// Inside component:
const [searchQuery, setSearchQuery] = useState('');
const [searchResults, setSearchResults] = useState(null);
const [searching, setSearching] = useState(false);

const handleSearch = async (e) => {
  e.preventDefault();
  if (!searchQuery.trim()) return;
  setSearching(true);
  try {
    const result = await searchKnowledgeBase(searchQuery.trim());
    if (result.allowed === false) {
      // Show quota modal
      return;
    }
    setSearchResults(result.results);
  } catch (err) {
    console.error('Search failed:', err);
  } finally {
    setSearching(false);
  }
};

// Add search bar JSX (after the hero section, before the category grid):
<form onSubmit={handleSearch} className="max-w-2xl mx-auto mb-12">
  <div className="relative">
    <input
      type="text"
      value={searchQuery}
      onChange={e => setSearchQuery(e.target.value)}
      placeholder="Search the knowledge base..."
      className="w-full px-5 py-3.5 pr-12 rounded-xl bg-white dark:bg-[#1d1d1d] border border-[#e8e3d8] dark:border-[#2a2a2a] text-[#2d2a24] dark:text-white placeholder-[#8a8580] dark:placeholder-[#6b7280] focus:outline-none focus:border-[#4a7c59] dark:focus:border-[#6da07b] transition-colors text-sm"
    />
    <button type="submit" className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8a8580] dark:text-[#6b7280] hover:text-[#4a7c59] dark:hover:text-[#6da07b] transition-colors">
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
    </button>
  </div>
  <div className="mt-2 flex justify-center">
    <QuotaBadge featureId="knowledge_base" />
  </div>
</form>
```

Add search results display below the form (conditionally rendered).

- [ ] **Step 2: Add `QuotaBadge` to `src/pages/knowledge-layer.js`** for global visibility

```jsx
import QuotaBadge from '../component/QuotaBadge';

// In the layout, near the header/SEO section:
<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-end gap-4">
  <QuotaBadge featureId="knowledge_base" />
</div>
```

- [ ] **Step 3: Verify build**

Run: `npm run build`
Expected: Compiled successfully

- [ ] **Step 4: Commit**

```bash
git add src/component/knowledge.jsx src/pages/knowledge-layer.js
git commit -m "feat: integrate quota system into knowledge base"
```

---

### Task 16: Build Verification & Deploy

**Files:** None (verification only)

- [ ] **Step 1: Full production build**

Run: `npm run build`
Expected: Compiled successfully (0 errors, 0 warnings)

- [ ] **Step 2: Deploy to Vercel**

Run: `npx vercel --prod --yes`
Expected: Deployment completes, aliased to hefnoplant.site

- [ ] **Step 3: API verification (curl)**

```bash
# Test check-quota endpoint (unauthenticated/guest)
curl -s -X POST https://hefnoplant.site/api/check-quota \
  -H 'Content-Type: application/json' \
  -H 'X-Guest-Id: a1b2c3d4-e5f6-4789-abcd-ef1234567890' \
  -d '{"featureId":"ai_chatbot"}' | head -c 200

# Expected: {"allowed":true,"remaining":5,"limit":5}
```

- [ ] **Step 4: Commit final state**

```bash
git add -A
git commit -m "feat: complete quota system implementation"
```

---

### Verification Checklist (Final)

Run through each:
1. Visit `/weather` → loads without login ✓
2. Visit `/blog` → loads without login ✓
3. Visit `/` → loads without login ✓
4. Send 5 messages in chatbot as guest → 6th shows "Free Usage Limit Reached"
5. Send 5 messages as logged-in free user → 6th shows "Weekly Limit Reached"
6. Premium user → never sees quota modal, shows "Unlimited"
7. Perform 5 KB searches → 6th shows quota modal
8. Perform 1 diagnosis → 2nd shows quota modal
9. Guest counters and auth counters are independent
10. Quota badges show correct remaining counts

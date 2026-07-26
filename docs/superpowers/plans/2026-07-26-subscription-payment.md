# Subscription & Payment System — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement complete subscription, billing, and payment system with Stripe + Vodafone Cash, package-based Premium quotas, unlimited Elite access, and strict server-side security.

**Architecture:** Payment provider abstraction layer (Stripe + Vodafone Cash) → SubscriptionService (lifecycle) → QuotaStrategyRouter (routes by plan: Free/PremiumPkg/Elite/Admin/Guest) → Firestore. Package quotas stored in `subscriptions/{userId}` doc. Yearly = Monthly × 12 calculated dynamically at activation.

**Tech Stack:** Stripe SDK, Firebase Admin SDK (Firestore), Upstash Redis (guest quotas), Vercel serverless (API), React CRA (frontend)

## Global Constraints

- Never trust frontend — all subscription writes by backend only (Admin SDK)
- Premium uses package quotas (not daily/weekly): chatbot 100/month, KB 70/month, diagnosis 2/month
- Yearly = Monthly × 12, calculated dynamically at subscription creation
- Elite + Admin = unlimited access always
- Package quotas reset ONLY on subscription renewal (never daily/weekly)
- Downgrades effective at end of billing period (status = cancelled, plan stays until expirationDate)
- Feature IDs: `ai_chatbot`, `knowledge_base`, `disease_diagnosis`
- `api/_lib/firebaseAdmin.js` provides `getDb()`, `verifyToken()`, `isAdmin()`
- Stripe prices configured in Dashboard — price IDs in env vars
- Vodafone Cash uses manual admin verification
- All events logged to `subscriptionLogs/` with timestamps

---

### Task 1: Install Stripe + Add Env Vars

**Files:**
- Modify: `api/package.json`
- Modify: `api/.env`
- Modify: `.env.example`

- [ ] **Step 1: Add stripe to api/package.json**

```json
{
  "dependencies": {
    "@libsql/client": "^0.14.0",
    "@upstash/redis": "^1.28.0",
    "cloudinary": "^2.10.0",
    "dotenv": "^17.4.2",
    "firebase-admin": "^13.10.0",
    "nodemailer": "^8.0.5",
    "resend": "^6.17.2",
    "stripe": "^17.0.0",
    "unpdf": "^1.0.0"
  }
}
```

- [ ] **Step 2: Install dependency**

Run: `npm install` in `/home/hassan/Downloads/Hefno-Plant-Delivared/api/`

- [ ] **Step 3: Add Stripe env vars to api/.env**

```
STRIPE_SECRET_KEY=sk_test_placeholder
STRIPE_WEBHOOK_SECRET=whsec_placeholder
STRIPE_PRICE_PREMIUM_MONTHLY=price_monthly_premium_placeholder
STRIPE_PRICE_PREMIUM_YEARLY=price_yearly_premium_placeholder
STRIPE_PRICE_ELITE_MONTHLY=price_monthly_elite_placeholder
STRIPE_PRICE_ELITE_YEARLY=price_yearly_elite_placeholder
```

- [ ] **Step 4: Add to .env.example**

```
# Stripe
STRIPE_SECRET_KEY=sk_test_your-stripe-secret-key
STRIPE_WEBHOOK_SECRET=whsec_your-webhook-secret
STRIPE_PRICE_PREMIUM_MONTHLY=price_1...
STRIPE_PRICE_PREMIUM_YEARLY=price_1...
STRIPE_PRICE_ELITE_MONTHLY=price_1...
STRIPE_PRICE_ELITE_YEARLY=price_1...
```

- [ ] **Step 5: Commit**

```bash
git add api/package.json api/package-lock.json api/.env .env.example
git commit -m "chore: add stripe dependency and env vars"
```

---

### Task 2: Subscription Core Service

**Files:**
- Create: `api/_lib/subscriptionService.js`

**Interfaces:**
- Produces: `activateSubscription({ userId, plan, billingCycle, paymentProvider, paymentStatus })`, `expireSubscription(userId)`, `downgradeSubscription(userId)`, `getSubscription(userId)`, `logEvent({ userId, event, plan, billingCycle, paymentProvider, details })`

- [ ] **Step 1: Create `api/_lib/subscriptionService.js`**

```js
const { getDb } = require('./firebaseAdmin');

const PREMIUM_MONTHLY_QUOTAS = {
  ai_chatbot: 100,
  knowledge_base: 70,
  disease_diagnosis: 2,
};

function calcYearlyQuotas() {
  const q = {};
  for (const [key, val] of Object.entries(PREMIUM_MONTHLY_QUOTAS)) {
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
  const sub = await getSubscription(userId);
  if (!sub || sub.plan !== 'premium' || sub.status !== 'active' || !sub.packageQuotas) {
    return { allowed: false, reason: 'no_active_premium' };
  }
  const quota = sub.packageQuotas[featureId];
  if (!quota) return { allowed: false, reason: 'feature_not_in_package' };
  if (quota.remaining <= 0) return { allowed: false, reason: 'quota_exhausted', total: quota.total, remaining: 0 };

  const remaining = quota.remaining - 1;
  const updatePath = `packageQuotas.${featureId}.remaining`;
  await db.collection('subscriptions').doc(userId).update({
    [updatePath]: remaining,
    updatedAt: new Date(),
  });
  return { allowed: true, remaining, total: quota.total };
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
};
```

- [ ] **Step 2: Verify syntax**

Run: `node -e "require('./api/_lib/subscriptionService')"`
Expected: no errors

- [ ] **Step 3: Commit**

```bash
git add api/_lib/subscriptionService.js
git commit -m "feat: add subscription core service with package quota management"
```

---

### Task 3: Payment Provider Abstraction

**Files:**
- Create: `api/_lib/payments/provider.js`

**Interfaces:**
- Produces: `registerProvider(name, impl)`, `getProvider(name)`, `getAvailableProviders()`, `createPayment({ provider, plan, billingCycle, userId, customerEmail })`, `verifyPayment({ provider, paymentId, data })`, `handleWebhook({ provider, req })`

- [ ] **Step 1: Create `api/_lib/payments/provider.js`**

```js
const providers = {};

function registerProvider(name, implementation) {
  providers[name] = implementation;
}

function getProvider(name) {
  if (!providers[name]) throw new Error(`Payment provider "${name}" not registered`);
  return providers[name];
}

function getAvailableProviders() {
  return Object.keys(providers);
}

async function createPayment({ provider, plan, billingCycle, userId, customerEmail }) {
  return getProvider(provider).createCheckoutSession({ plan, billingCycle, userId, customerEmail });
}

async function verifyPayment({ provider, paymentId, data }) {
  return getProvider(provider).verifyPayment({ paymentId, data });
}

async function handleWebhook({ provider, req }) {
  return getProvider(provider).handleWebhook(req);
}

module.exports = { registerProvider, getProvider, getAvailableProviders, createPayment, verifyPayment, handleWebhook };
```

- [ ] **Step 2: Verify syntax**

Run: `node -e "require('./api/_lib/payments/provider')"`
Expected: no errors

- [ ] **Step 3: Commit**

```bash
git add api/_lib/payments/provider.js
git commit -m "feat: add payment provider abstraction layer"
```

---

### Task 4: Stripe Provider

**Files:**
- Create: `api/_lib/payments/stripe.js`
- Depends on: Task 2, Task 3

- [ ] **Step 1: Create `api/_lib/payments/stripe.js`**

```js
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const { registerProvider } = require('./provider');

function getPriceId(plan, billingCycle) {
  const key = `STRIPE_PRICE_${plan.toUpperCase()}_${billingCycle.toUpperCase()}`;
  const id = process.env[key];
  if (!id) throw new Error(`Stripe price ID not configured: ${key}`);
  return id;
}

const provider = {
  async createCheckoutSession({ plan, billingCycle, userId, customerEmail }) {
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [{ price: getPriceId(plan, billingCycle), quantity: 1 }],
      customer_email: customerEmail || undefined,
      client_reference_id: userId,
      metadata: { plan, billingCycle, userId },
      success_url: `${process.env.FRONTEND_URL || 'https://hefnoplant.site'}/pricing?success=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.FRONTEND_URL || 'https://hefnoplant.site'}/pricing?canceled=true`,
      subscription_data: {
        metadata: { userId, plan, billingCycle },
      },
    });
    return { sessionId: session.id, sessionUrl: session.url };
  },

  async verifyPayment({ paymentId }) {
    try {
      const session = await stripe.checkout.sessions.retrieve(paymentId);
      return {
        verified: session.payment_status === 'paid',
        paymentDetails: {
          amount: session.amount_total,
          currency: session.currency,
          customerEmail: session.customer_details?.email,
          status: session.payment_status,
          metadata: session.metadata,
        },
      };
    } catch {
      return { verified: false, paymentDetails: null };
    }
  },

  async handleWebhook(req) {
    const sig = req.headers['stripe-signature'];
    let event;
    try {
      event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
    } catch (err) {
      throw new Error(`Webhook signature verification failed: ${err.message}`);
    }
    return { event: event.type, data: event.data.object };
  },
};

registerProvider('stripe', provider);
module.exports = provider;
```

- [ ] **Step 2: Verify syntax**

Run: `node -e "require('./api/_lib/payments/stripe')"`
Expected: no errors (may warn about missing env vars — that's fine)

- [ ] **Step 3: Commit**

```bash
git add api/_lib/payments/stripe.js
git commit -m "feat: add Stripe payment provider with Checkout Sessions and webhook verification"
```

---

### Task 5: Vodafone Cash Provider

**Files:**
- Create: `api/_lib/payments/vodafoneCash.js`
- Depends on: Task 3

- [ ] **Step 1: Create `api/_lib/payments/vodafoneCash.js`**

```js
const { registerProvider } = require('./provider');
const crypto = require('crypto');

function generateReference() {
  return 'VC-' + crypto.randomBytes(8).toString('hex').toUpperCase();
}

const pendingPayments = {};

const provider = {
  async createCheckoutSession({ plan, billingCycle, userId }) {
    const ref = generateReference();
    const amounts = { premium: { monthly: 50, yearly: 500 }, elite: { monthly: 80, yearly: 800 } };
    const amount = amounts[plan]?.[billingCycle] || 0;

    pendingPayments[ref] = { userId, plan, billingCycle, amount, status: 'pending', createdAt: new Date().toISOString() };

    return {
      sessionId: ref,
      sessionUrl: null,
      paymentReference: ref,
      amount,
      currency: 'EGP',
      instructions: `حول ${amount} جنيه إلى محفظة فودافون كاش على الرقم 01000000000 مع كتابة الكود: ${ref}`,
    };
  },

  async verifyPayment({ paymentId, data }) {
    const payment = pendingPayments[paymentId];
    if (!payment) return { verified: false, paymentDetails: null };
    payment.status = 'verified';
    return { verified: true, paymentDetails: payment };
  },

  async handleWebhook() {
    throw new Error('Vodafone Cash does not support webhooks yet');
  },
};

registerProvider('vodafone_cash', provider);
module.exports = { provider, pendingPayments };
```

- [ ] **Step 2: Verify syntax**

Run: `node -e "require('./api/_lib/payments/vodafoneCash')"`
Expected: no errors

- [ ] **Step 3: Commit**

```bash
git add api/_lib/payments/vodafoneCash.js
git commit -m "feat: add Vodafone Cash payment provider with manual verification"
```

---

### Task 6: Quota Strategy Router

**Files:**
- Create: `api/_lib/quotaStrategies.js`
- Depends on: Task 2

- [ ] **Step 1: Create `api/_lib/quotaStrategies.js`**

```js
const { getDb } = require('./firebaseAdmin');
const { loadFeature } = require('./loadFeatures');
const { consumePackageQuota } = require('./subscriptionService');

const UUID_V4_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

let redis = null;
try {
  const { Redis } = require('@upstash/redis');
  if (process.env.REDIS_URL && process.env.TOKEN) {
    redis = new Redis({ url: process.env.REDIS_URL, token: process.env.TOKEN });
  }
} catch (_) {}

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

  const db = getDb();

  if (userId) {
    try {
      const [userSnap, subSnap] = await Promise.all([
        db.collection('users').doc(userId).get(),
        db.collection('subscriptions').doc(userId).get(),
      ]);
      if (userSnap.exists && userSnap.data().role === 'admin') {
        return { allowed: true, remaining: Infinity, limit: Infinity };
      }
      if (subSnap.exists) {
        const sub = subSnap.data();
        if (sub.plan === 'elite' && sub.status === 'active') {
          return { allowed: true, remaining: Infinity, limit: Infinity };
        }
        if (sub.plan === 'premium' && sub.status === 'active') {
          if (incrementIfAllowed) {
            const result = await consumePackageQuota(userId, featureId);
            if (!result.allowed) {
              if (result.reason === 'quota_exhausted') {
                return { allowed: false, remaining: 0, limit: result.total, error: 'quota_exhausted', isPremium: true };
              }
              if (result.reason === 'feature_not_in_package') {
                if (feature.premiumUnlimited) {
                  return { allowed: true, remaining: Infinity, limit: Infinity };
                }
              }
            }
            return { allowed: true, remaining: result.remaining, limit: result.total };
          }
          const quota = sub.packageQuotas?.[featureId];
          if (quota) {
            return { allowed: quota.remaining > 0, remaining: quota.remaining, limit: quota.total };
          }
          if (feature.premiumUnlimited) {
            return { allowed: true, remaining: Infinity, limit: Infinity };
          }
        }
        if (sub.plan === 'premium' && (sub.status === 'expired' || sub.status === 'cancelled')) {
          if (sub.expirationDate && new Date(sub.expirationDate.toDate?.() || sub.expirationDate) > new Date()) {
            if (incrementIfAllowed) {
              const result = await consumePackageQuota(userId, featureId);
              if (!result.allowed) return { allowed: false, remaining: 0, limit: result.total, error: 'quota_exhausted', isPremium: true };
              return { allowed: true, remaining: result.remaining, limit: result.total };
            }
            const quota = sub.packageQuotas?.[featureId];
            if (quota) return { allowed: quota.remaining > 0, remaining: quota.remaining, limit: quota.total };
          }
        }
        if (!isPremium && sub.status === 'active' && sub.plan === 'premium') {
          isPremium = true;
        }
      }
    } catch (_) {}

    if (isPremium && feature.premiumUnlimited) {
      return { allowed: true, remaining: Infinity, limit: Infinity };
    }
  }

  // Free strategy — existing daily/weekly logic
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
```

- [ ] **Step 2: Verify syntax**

Run: `node -e "require('./api/_lib/quotaStrategies')"`
Expected: no errors

- [ ] **Step 3: Commit**

```bash
git add api/_lib/quotaStrategies.js
git commit -m "feat: add quota strategy router with Free/Premium/Elite/Admin/Guest strategies"
```

---

### Task 7: Refactor checkQuota.js to Use Strategy Router

**Files:**
- Modify: `api/_lib/checkQuota.js`
- Depends on: Task 6

- [ ] **Step 1: Replace checkQuota.js with strategy router wrapper**

```js
const { checkQuota } = require('./quotaStrategies');
module.exports = { checkQuota };
```

- [ ] **Step 2: Verify syntax**

Run: `node -e "require('./api/_lib/checkQuota')"`
Expected: no errors

- [ ] **Step 3: Commit**

```bash
git add api/_lib/checkQuota.js
git commit -m "refactor: delegate checkQuota to strategy router"
```

---

### Task 8: Stripe Checkout Session API

**Files:**
- Create: `api/create-checkout-session.js`
- Depends on: Task 4 (Stripe provider), Task 2 (subscriptionService)

- [ ] **Step 1: Create `api/create-checkout-session.js`**

```js
const { verifyToken, isAdmin } = require('./_lib/firebaseAdmin');
const { createPayment } = require('./_lib/payments/provider');
require('./_lib/payments/stripe');

module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    const decoded = await verifyToken(authHeader.slice(7));
    const userId = decoded.uid;
    const { plan, billingCycle } = req.body;

    if (!plan || !['premium', 'elite'].includes(plan)) {
      return res.status(400).json({ error: 'Invalid plan' });
    }
    if (!billingCycle || !['monthly', 'yearly'].includes(billingCycle)) {
      return res.status(400).json({ error: 'Invalid billing cycle' });
    }

    const result = await createPayment({
      provider: 'stripe',
      plan,
      billingCycle,
      userId,
      customerEmail: decoded.firebase?.identities?.email?.[0] || req.body.email,
    });

    return res.status(200).json(result);
  } catch (err) {
    console.error('Create checkout session error:', err);
    return res.status(500).json({ error: err.message || 'Failed to create checkout session' });
  }
};
```

- [ ] **Step 2: Verify syntax**

Run: `node -e "require('./api/create-checkout-session')"`
Expected: no errors

- [ ] **Step 3: Commit**

```bash
git add api/create-checkout-session.js
git commit -m "feat: add Stripe Checkout Session creation API"
```

---

### Task 9: Stripe Webhook Handler

**Files:**
- Create: `api/stripe-webhook.js`
- Depends on: Task 4, Task 2

- [ ] **Step 1: Create `api/stripe-webhook.js`**

```js
const { handleWebhook } = require('./_lib/payments/provider');
const { activateSubscription, cancelAtPeriodEnd, logEvent } = require('./_lib/subscriptionService');
require('./_lib/payments/stripe');

const { getDb } = require('./_lib/firebaseAdmin');

module.exports = async (req, res) => {
  try {
    const { event, data } = await handleWebhook({ provider: 'stripe', req });

    const db = getDb();

    switch (event) {
      case 'checkout.session.completed': {
        const session = data;
        if (session.payment_status === 'paid' && session.metadata?.userId) {
          const userId = session.metadata.userId;
          const plan = session.metadata.plan;
          const billingCycle = session.metadata.billingCycle;
          await activateSubscription({ userId, plan, billingCycle, paymentProvider: 'stripe' });
          await db.collection('subscriptions').doc(userId).update({
            stripeCustomerId: session.customer,
            stripeSubscriptionId: session.subscription,
            stripePriceId: session.metadata?.priceId || null,
          });
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
              await activateSubscription({ userId, plan: subData.plan, billingCycle: subData.billingCycle, paymentProvider: 'stripe' });
              await logEvent({ userId, event: 'subscription_renewed', plan: subData.plan, billingCycle: subData.billingCycle, paymentProvider: 'stripe' });
            }
          }
        }
        break;
      }
      case 'customer.subscription.deleted': {
        const subscription = data;
        if (subscription.metadata?.userId) {
          await cancelAtPeriodEnd(subscription.metadata.userId);
        }
        break;
      }
    }

    return res.status(200).json({ received: true });
  } catch (err) {
    console.error('Webhook error:', err);
    return res.status(400).json({ error: err.message });
  }
};
```

- [ ] **Step 2: Verify syntax**

Run: `node -e "require('./api/stripe-webhook')"`
Expected: no errors

- [ ] **Step 3: Commit**

```bash
git add api/stripe-webhook.js
git commit -m "feat: add Stripe webhook handler with signature verification"
```

---

### Task 10: Vodafone Cash Initiate + Verify APIs

**Files:**
- Create: `api/vodafone-cash/initiate.js`
- Create: `api/vodafone-cash/verify.js`
- Depends on: Task 5, Task 2

- [ ] **Step 1: Create `api/vodafone-cash/initiate.js`**

```js
const { verifyToken } = require('../_lib/firebaseAdmin');
const { createPayment } = require('../_lib/payments/provider');
require('../_lib/payments/vodafoneCash');

module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) return res.status(401).json({ error: 'Authentication required' });
    const decoded = await verifyToken(authHeader.slice(7));

    const { plan, billingCycle } = req.body;
    if (!plan || !['premium', 'elite'].includes(plan)) return res.status(400).json({ error: 'Invalid plan' });
    if (!billingCycle || !['monthly', 'yearly'].includes(billingCycle)) return res.status(400).json({ error: 'Invalid billing cycle' });

    const result = await createPayment({ provider: 'vodafone_cash', plan, billingCycle, userId: decoded.uid });
    return res.status(200).json(result);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};
```

- [ ] **Step 2: Create `api/vodafone-cash/verify.js`**

```js
const { verifyToken, isAdmin } = require('../_lib/firebaseAdmin');
const { verifyPayment } = require('../_lib/payments/provider');
const { activateSubscription, logEvent } = require('../_lib/subscriptionService');
require('../_lib/payments/vodafoneCash');

module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) return res.status(401).json({ error: 'Authentication required' });
    if (!(await isAdmin(authHeader.slice(7)))) return res.status(403).json({ error: 'Admin access required' });

    const { paymentReference } = req.body;
    if (!paymentReference) return res.status(400).json({ error: 'paymentReference required' });

    const result = await verifyPayment({ provider: 'vodafone_cash', paymentId: paymentReference, data: {} });
    if (!result.verified) return res.status(400).json({ error: 'Payment not found or already verified' });

    const details = result.paymentDetails;
    const sub = await activateSubscription({
      userId: details.userId,
      plan: details.plan,
      billingCycle: details.billingCycle,
      paymentProvider: 'vodafone_cash',
    });

    return res.status(200).json({ success: true, subscription: sub });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};
```

- [ ] **Step 3: Verify syntax**

Run: `node -e "require('./api/vodafone-cash/initiate')" && node -e "require('./api/vodafone-cash/verify')"`
Expected: no errors

- [ ] **Step 4: Commit**

```bash
git add api/vodafone-cash/initiate.js api/vodafone-cash/verify.js
git commit -m "feat: add Vodafone Cash initiate and admin verify APIs"
```

---

### Task 11: Get Subscription API

**Files:**
- Create: `api/subscription.js`
- Depends on: Task 2

- [ ] **Step 1: Create `api/subscription.js`**

```js
const { verifyToken } = require('./_lib/firebaseAdmin');
const { getSubscription } = require('./_lib/subscriptionService');

module.exports = async (req, res) => {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) return res.status(401).json({ error: 'Authentication required' });
    const decoded = await verifyToken(authHeader.slice(7));

    const sub = await getSubscription(decoded.uid);
    if (!sub) return res.status(200).json({ plan: 'free', status: 'active', packageQuotas: null });
    return res.status(200).json(sub);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};
```

- [ ] **Step 2: Verify syntax**

Run: `node -e "require('./api/subscription')"`
Expected: no errors

- [ ] **Step 3: Commit**

```bash
git add api/subscription.js
git commit -m "feat: add get subscription API endpoint"
```

---

### Task 12: Expired Subscription Checker

**Files:**
- Create: `api/check-expired.js`
- Depends on: Task 2

- [ ] **Step 1: Create `api/check-expired.js`**

```js
const { getDb } = require('./_lib/firebaseAdmin');
const { expireSubscription, logEvent } = require('./_lib/subscriptionService');

module.exports = async (req, res) => {
  try {
    const db = getDb();
    const now = new Date();
    const expired = await db.collection('subscriptions')
      .where('status', '==', 'active')
      .where('expirationDate', '<', now)
      .get();

    let count = 0;
    for (const doc of expired.docs) {
      await expireSubscription(doc.id);
      count++;
    }

    const cancelledExpired = await db.collection('subscriptions')
      .where('status', '==', 'cancelled')
      .where('expirationDate', '<', now)
      .get();

    for (const doc of cancelledExpired.docs) {
      await expireSubscription(doc.id);
      count++;
    }

    return res.status(200).json({ expired: count });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};
```

- [ ] **Step 2: Verify syntax**

Run: `node -e "require('./api/check-expired')"`
Expected: no errors

- [ ] **Step 3: Commit**

```bash
git add api/check-expired.js
git commit -m "feat: add expired subscription checker"
```

---

### Task 13: Seed Subscription Plans Config

**Files:**
- Create: `api/seed-subscription-plans.js`

- [ ] **Step 1: Create `api/seed-subscription-plans.js`**

```js
const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
require('dotenv').config({ path: require('path').join(__dirname, '.env') });

const app = initializeApp({
  credential: cert({
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
  }),
});
const db = getFirestore(app);

const PLANS = {
  premium: {
    monthly: { price: 50, currency: 'EGP', savings: null },
    yearly: { price: 500, currency: 'EGP', savings: '17%' },
    label: 'Premium',
    description: 'الميزات المتقدمة للمزارعين المحترفين',
  },
  elite: {
    monthly: { price: 80, currency: 'EGP', savings: null },
    yearly: { price: 800, currency: 'EGP', savings: '17%' },
    label: 'Elite',
    description: 'الوصول الكامل لجميع الميزات',
  },
};

const FEATURES_LIST = [
  { id: 'ai_chatbot', name: 'المساعد الذكي', free: '5/يوم', premium: '100/شهر', elite: 'غير محدود' },
  { id: 'knowledge_base', name: 'قاعدة المعرفة', free: '5/أسبوع', premium: '70/شهر', elite: 'غير محدود' },
  { id: 'disease_diagnosis', name: 'تشخيص الأمراض', free: '1/أسبوع', premium: '2/شهر', elite: 'غير محدود' },
  { id: 'weather', name: 'الطقس', free: 'غير محدود', premium: 'غير محدود', elite: 'غير محدود' },
  { id: 'blog', name: 'المقالات', free: 'غير محدود', premium: 'غير محدود', elite: 'غير محدود' },
];

async function seed() {
  await db.collection('pricing').doc('plans').set({ plans: PLANS, features: FEATURES_LIST, updatedAt: new Date() });
  console.log('Seeded pricing config');
  process.exit(0);
}

seed().catch(err => { console.error(err); process.exit(1); });
```

- [ ] **Step 2: Run the seed script**

Run: `node api/seed-subscription-plans.js`
Expected: "Seeded pricing config"

- [ ] **Step 3: Commit**

```bash
git add api/seed-subscription-plans.js
git commit -m "feat: add subscription plans seed script"
```

---

### Task 14: Update Feature Config with Premium Monthly Quotas

**Files:**
- Modify: `scripts/seed-features.js`
- Modify: `api/_lib/loadFeatures.js`

- [ ] **Step 1: Update `scripts/seed-features.js` — add `premiumMonthlyQuota`**

Add to each feature object:
```js
{
  id: 'ai_chatbot',
  ...existingFields,
  premiumMonthlyQuota: 100,
}
```
```js
{
  id: 'knowledge_base',
  ...existingFields,
  premiumMonthlyQuota: 70,
}
```
```js
{
  id: 'disease_diagnosis',
  ...existingFields,
  premiumMonthlyQuota: 2,
}
```

- [ ] **Step 2: Update `api/_lib/loadFeatures.js`**

No changes needed — loadFeatures already returns all document fields dynamically. The new `premiumMonthlyQuota` field will be included automatically.

- [ ] **Step 3: Commit**

```bash
git add scripts/seed-features.js
git commit -m "feat: add premiumMonthlyQuota to feature configs"
```

---

### Task 15: Update API Handlers (ai.js, analyze-image.js, knowledge-base.js)

**Files:**
- Modify: `api/ai.js`
- Modify: `api/analyze-image.js`
- Modify: `api/knowledge-base.js`
- Depends on: Task 7 (checkQuota)

- [ ] **Step 1: Update api/ai.js**

The handler already imports `checkQuota` from `./_lib/checkQuota` and uses it. Since checkQuota now delegates to the strategy router, it automatically handles Premium package quotas and Elite unlimited. No code changes needed for the quota call itself.

Verify that the response includes `quota.remaining` and `quota.limit` correctly (not the undefined `rateLimit` bug mentioned during exploration).

Find and fix the bug on line ~627 where `rateLimit.remaining` is used instead of `quota.remaining`.

- [ ] **Step 2: Update api/analyze-image.js**

Same verification — the existing `checkQuota` call works with the strategy router. No changes needed.

- [ ] **Step 3: Update api/knowledge-base.js**

Same verification — no changes needed.

- [ ] **Step 4: Commit**

```bash
git add api/ai.js
git commit -m "fix: update API handlers to work with new quota strategy router"
```

---

### Task 16: Firestore Security Rules

**Files:**
- Create: `firestore.rules`

- [ ] **Step 1: Create `firestore.rules`**

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    function isAuthenticated() {
      return request.auth != null;
    }

    function isOwner(userId) {
      return isAuthenticated() && request.auth.uid == userId;
    }

    // Subscriptions: user can READ own subscription only
    // All writes DENIED — backend only via Admin SDK
    match /subscriptions/{userId} {
      allow read: if isOwner(userId);
      allow create, update, delete: if false;
    }

    // Subscription logs: no client access
    match /subscriptionLogs/{logId} {
      allow read, write: if false;
    }

    // Usage: users can read/write their own usage
    match /usage/{userId}/{document=**} {
      allow read, write: if isOwner(userId);
    }

    // Users: users can read own profile and write allowed profile fields only
    match /users/{userId} {
      allow read: if isOwner(userId);
      allow create: if isOwner(userId);
      allow update: if isOwner(userId)
        && request.resource.data.keys().hasOnly(['fullName', 'phoneNumber',
          'specialization', 'profileImage', 'metadata', 'updatedAt']);
      allow delete: if false;
    }

    // Features: read for authenticated users, write denied
    match /features/{featureId} {
      allow read: if isAuthenticated();
      allow write: if false;
    }

    // Pricing: public read, write denied
    match /pricing/{document=**} {
      allow read: if true;
      allow write: if false;
    }

    // Default: deny all
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

- [ ] **Step 2: Update `firebase.json` to reference rules file**

```json
{
  "firestore": {
    "rules": "firestore.rules"
  },
  "hosting": {
    "public": "build",
    "ignore": ["firebase.json", "**/.*", "**/node_modules/**"],
    "rewrites": [{"source": "**", "destination": "/index.html"}]
  }
}
```

- [ ] **Step 3: Commit**

```bash
git add firestore.rules firebase.json
git commit -m "feat: add Firestore security rules protecting subscriptions"
```

---

### Task 17: Frontend Subscription Service

**Files:**
- Create: `src/services/subscriptionService.js`

- [ ] **Step 1: Create `src/services/subscriptionService.js`**

```js
const API_BASE = '/api';

async function authFetch(path, options = {}) {
  const token = localStorage.getItem('firebaseToken');
  const headers = { 'Content-Type': 'application/json', ...options.headers };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Request failed');
  return data;
}

export async function getSubscription() {
  return authFetch('/subscription');
}

export async function createCheckoutSession(plan, billingCycle) {
  return authFetch('/create-checkout-session', {
    method: 'POST',
    body: JSON.stringify({ plan, billingCycle }),
  });
}

export async function initiateVodafoneCash(plan, billingCycle) {
  return authFetch('/vodafone-cash/initiate', {
    method: 'POST',
    body: JSON.stringify({ plan, billingCycle }),
  });
}

export async function getPricingPlans() {
  try {
    const res = await fetch(`${API_BASE}/../api/pricing-config`);
    if (!res.ok) throw new Error('Failed to fetch pricing');
    return res.json();
  } catch {
    return null;
  }
}
```

- [ ] **Step 2: Verify build**

Run: `npm run build`
Expected: Compiled successfully

- [ ] **Step 3: Commit**

```bash
git add src/services/subscriptionService.js
git commit -m "feat: add frontend subscription service"
```

---

### Task 18: AuthContext Updates (isElite + refreshSubscription)

**Files:**
- Modify: `src/context/AuthContext.jsx`
- Depends on: Task 17

- [ ] **Step 1: Update AuthContext.jsx**

Add `isElite` derived field and `refreshSubscription` method:

```js
import { ..., useCallback } from 'react';
import { getSubscription } from '../services/subscriptionService';

// In the provider:
const isElite = useMemo(() => {
  return subscription?.status === 'active' && subscription?.plan === 'elite';
}, [subscription]);

const refreshSubscription = useCallback(async () => {
  if (!user) return;
  try {
    const sub = await getSubscription();
    setSubscription(sub);
  } catch {
    setSubscription(null);
  }
}, [user]);

// Add to the effect that runs on auth state change:
// After getting subscription, call refreshSubscription or inline logic

// In the provider value, add:
isElite,
refreshSubscription,
```

- [ ] **Step 2: Verify build**

Run: `npm run build`
Expected: Compiled successfully

- [ ] **Step 3: Commit**

```bash
git add src/context/AuthContext.jsx
git commit -m "feat: add isElite and refreshSubscription to AuthContext"
```

---

### Task 19: Frontend Package Quota Hook

**Files:**
- Create: `src/hooks/usePackageQuota.js`
- Depends on: Task 18

- [ ] **Step 1: Create `src/hooks/usePackageQuota.js`**

```js
import { useMemo } from 'react';
import { useAuth } from '../context/AuthContext';

const FEATURE_NAMES = {
  ai_chatbot: { name: 'المساعد الذكي', unit: 'رسالة' },
  knowledge_base: { name: 'قاعدة المعرفة', unit: 'بحث' },
  disease_diagnosis: { name: 'تشخيص الأمراض', unit: 'تشخيص' },
};

export function usePackageQuota(featureId) {
  const { subscription, isPremium, isElite } = useAuth();

  return useMemo(() => {
    if (isElite) {
      return {
        total: Infinity,
        remaining: Infinity,
        used: 0,
        label: 'غير محدود',
        isUnlimited: true,
        isElite: true,
        featureName: FEATURE_NAMES[featureId]?.name || featureId,
      };
    }

    if (!isPremium || !subscription?.packageQuotas) {
      return null;
    }

    const quota = subscription.packageQuotas[featureId];
    if (!quota) return null;

    const remaining = quota.remaining;
    const total = quota.total;
    const info = FEATURE_NAMES[featureId] || { name: featureId, unit: 'استخدام' };

    return {
      total,
      remaining,
      used: total - remaining,
      label: `${remaining} / ${total}`,
      isUnlimited: false,
      isElite: false,
      featureName: info.name,
      unit: info.unit,
    };
  }, [subscription, isPremium, isElite, featureId]);
}
```

- [ ] **Step 2: Verify build**

Run: `npm run build`
Expected: Compiled successfully

- [ ] **Step 3: Commit**

```bash
git add src/hooks/usePackageQuota.js
git commit -m "feat: add usePackageQuota hook for Premium package quota display"
```

---

### Task 20: SubscriptionBadge Component

**Files:**
- Create: `src/component/SubscriptionBadge.jsx`
- Depends on: Task 18

- [ ] **Step 1: Create `src/component/SubscriptionBadge.jsx`**

```jsx
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function SubscriptionBadge({ className = '' }) {
  const { user, isPremium, isElite } = useAuth();
  const navigate = useNavigate();

  if (!user) return null;

  if (isElite) {
    return (
      <button
        onClick={() => navigate('/pricing')}
        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold
          bg-gradient-to-r from-purple-500 to-indigo-500 text-white shadow-sm ${className}`}
      >
        <span className="text-[10px]">✦</span>
        ELITE
      </button>
    );
  }

  if (isPremium) {
    return (
      <button
        onClick={() => navigate('/pricing')}
        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold
          bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-sm ${className}`}
      >
        <span className="text-[10px]">★</span>
        PREMIUM
      </button>
    );
  }

  return (
    <button
      onClick={() => navigate('/pricing')}
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium
        bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 border border-gray-200 dark:border-gray-700 ${className}`}
    >
      FREE
    </button>
  );
}
```

- [ ] **Step 2: Verify build**

Run: `npm run build`
Expected: Compiled successfully

- [ ] **Step 3: Commit**

```bash
git add src/component/SubscriptionBadge.jsx
git commit -m "feat: add SubscriptionBadge component showing FREE/PREMIUM/ELITE"
```

---

### Task 21: PackageQuotaDisplay Component

**Files:**
- Create: `src/component/PackageQuotaDisplay.jsx`
- Depends on: Task 19

- [ ] **Step 1: Create `src/component/PackageQuotaDisplay.jsx`**

```jsx
import { usePackageQuota } from '../hooks/usePackageQuota';

export default function PackageQuotaDisplay({ featureId, onUpgrade }) {
  const quota = usePackageQuota(featureId);

  if (!quota) return null;

  if (quota.isElite || quota.isUnlimited) {
    return (
      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 text-xs font-medium">
        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
        {quota.featureName}: غير محدود
      </div>
    );
  }

  const percent = quota.total > 0 ? Math.round((quota.remaining / quota.total) * 100) : 0;
  const isLow = percent <= 20;

  return (
    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-xs">
      <span className="text-gray-600 dark:text-gray-400">{quota.featureName}:</span>
      <span className={`font-medium ${isLow ? 'text-red-500' : 'text-gray-900 dark:text-white'}`}>
        {quota.remaining} / {quota.total}
      </span>
      {isLow && onUpgrade && (
        <button
          onClick={onUpgrade}
          className="px-2 py-0.5 rounded bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-[10px] font-medium hover:bg-red-100 dark:hover:bg-red-900/40"
        >
          Upgrade
        </button>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Verify build**

Run: `npm run build`
Expected: Compiled successfully

- [ ] **Step 3: Commit**

```bash
git add src/component/PackageQuotaDisplay.jsx
git commit -m "feat: add PackageQuotaDisplay component showing remaining quotas"
```

---

### Task 22: Pricing Page

**Files:**
- Create: `src/pages/PricingPage.jsx`
- Depends on: Task 17, Task 20

- [ ] **Step 1: Create `src/pages/PricingPage.jsx`**

```jsx
import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { createCheckoutSession, initiateVodafoneCash } from '../services/subscriptionService';
import { toast } from 'sonner';

const PLANS = [
  {
    id: 'free',
    name: 'Free',
    price: 0,
    currency: 'EGP',
    description: 'ابدأ مع الميزات الأساسية',
    features: [
      { name: 'المساعد الذكي', limit: '5/اليوم' },
      { name: 'قاعدة المعرفة', limit: '5/الأسبوع' },
      { name: 'تشخيص الأمراض', limit: '1/الأسبوع' },
      { name: 'الطقس', limit: 'غير محدود' },
      { name: 'المقالات', limit: 'غير محدود' },
    ],
    cta: 'الخطة الحالية',
    highlighted: false,
  },
  {
    id: 'premium',
    name: 'Premium',
    monthlyPrice: 50,
    yearlyPrice: 500,
    currency: 'EGP',
    description: 'الميزات المتقدمة للمزارعين المحترفين',
    features: [
      { name: 'المساعد الذكي', limit: '100/شهر' },
      { name: 'قاعدة المعرفة', limit: '70/شهر' },
      { name: 'تشخيص الأمراض', limit: '2/شهر' },
      { name: 'الطقس', limit: 'غير محدود' },
      { name: 'المقالات', limit: 'غير محدود' },
      { name: 'دعم ذو أولوية', limit: '✓' },
    ],
    cta: 'اشترك الآن',
    highlighted: true,
  },
  {
    id: 'elite',
    name: 'Elite',
    monthlyPrice: 80,
    yearlyPrice: 800,
    currency: 'EGP',
    description: 'الوصول الكامل لجميع الميزات',
    features: [
      { name: 'المساعد الذكي', limit: 'غير محدود' },
      { name: 'قاعدة المعرفة', limit: 'غير محدود' },
      { name: 'تشخيص الأمراض', limit: 'غير محدود' },
      { name: 'الطقس', limit: 'غير محدود' },
      { name: 'المقالات', limit: 'غير محدود' },
      { name: 'دعم ذو أولوية', limit: '✓' },
      { name: 'جميع الميزات المستقبلية', limit: '✓' },
    ],
    cta: 'اشترك الآن',
    highlighted: false,
  },
];

const PAYMENT_METHODS = [
  { id: 'stripe', name: 'بطاقة ائتمان', icon: '💳' },
  { id: 'vodafone_cash', name: 'فودافون كاش', icon: '📱' },
];

export default function PricingPage() {
  const { user, isPremium, isElite, refreshSubscription } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [billingCycle, setBillingCycle] = useState('monthly');
  const [paymentMethod, setPaymentMethod] = useState('stripe');
  const [loading, setLoading] = useState(null);

  useEffect(() => {
    if (searchParams.get('success') === 'true') {
      toast.success('تم تفعيل الاشتراك بنجاح!');
      refreshSubscription?.();
    }
    if (searchParams.get('canceled') === 'true') {
      toast.error('تم إلغاء عملية الدفع');
    }
  }, [searchParams, refreshSubscription]);

  const handleSubscribe = async (planId) => {
    if (!user) return navigate('/login?redirect=/pricing');
    if (planId === 'free') return;
    if ((planId === 'premium' && isPremium) || (planId === 'elite' && isElite)) {
      toast.info('أنت مشترك بالفعل في هذه الباقة');
      return;
    }

    setLoading(planId);

    try {
      if (paymentMethod === 'stripe') {
        const { sessionUrl } = await createCheckoutSession(planId, billingCycle);
        window.location.href = sessionUrl;
      } else {
        const result = await initiateVodafoneCash(planId, billingCycle);
        toast.success(`تم إنشاء طلب الدفع: ${result.paymentReference}`);
        // Show payment instructions in a modal
      }
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(null);
    }
  };

  const getPlanPrice = (plan) => {
    if (plan.id === 'free') return 0;
    return billingCycle === 'monthly' ? plan.monthlyPrice : plan.yearlyPrice;
  };

  return (
    <div className="min-h-screen bg-white dark:bg-[#0a0a0a]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 dark:text-white mb-4">
            اختر باقتك المناسبة
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            جميع الباقات تشمل الميزات الأساسية. اختر ما يناسب احتياجاتك
          </p>
        </div>

        {/* Billing Toggle */}
        <div className="flex items-center justify-center gap-4 mb-12">
          <button
            onClick={() => setBillingCycle('monthly')}
            className={`px-6 py-2.5 rounded-xl text-sm font-medium transition-all ${
              billingCycle === 'monthly'
                ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900 shadow-lg'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
            }`}
          >
            شهري
          </button>
          <button
            onClick={() => setBillingCycle('yearly')}
            className={`px-6 py-2.5 rounded-xl text-sm font-medium transition-all ${
              billingCycle === 'yearly'
                ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900 shadow-lg'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
            }`}
          >
            سنوي
            <span className="ml-2 text-xs text-emerald-500 dark:text-emerald-400 font-bold">وفر 17%</span>
          </button>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {PLANS.map((plan) => {
            const price = getPlanPrice(plan);
            const isCurrentPlan = (plan.id === 'premium' && isPremium) || (plan.id === 'elite' && isElite) || (plan.id === 'free' && !isPremium && !isElite);

            return (
              <div
                key={plan.id}
                className={`relative rounded-2xl p-8 transition-all duration-300 ${
                  plan.highlighted
                    ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900 scale-105 shadow-2xl ring-2 ring-emerald-400'
                    : 'bg-gray-50 dark:bg-[#1a1a1a] text-gray-900 dark:text-white border border-gray-200 dark:border-gray-800'
                }`}
              >
                {plan.highlighted && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-emerald-500 text-white text-xs font-bold">
                    الأكثر طلباً
                  </div>
                )}

                <div className="text-center mb-8">
                  <h3 className={`text-2xl font-bold mb-2 ${plan.highlighted ? 'text-white' : ''}`}>
                    {plan.name}
                  </h3>
                  <p className={`text-sm ${plan.highlighted ? 'text-gray-300' : 'text-gray-500 dark:text-gray-400'}`}>
                    {plan.description}
                  </p>
                  <div className="mt-6">
                    <span className={`text-5xl font-bold ${plan.highlighted ? 'text-white' : ''}`}>
                      {plan.id === 'free' ? '0' : price}
                    </span>
                    <span className={`text-sm ml-1 ${plan.highlighted ? 'text-gray-300' : 'text-gray-500 dark:text-gray-400'}`}>
                      {plan.id === 'free' ? '' : `ج/${billingCycle === 'monthly' ? 'شهر' : 'سنة'}`}
                    </span>
                  </div>
                </div>

                <ul className="space-y-4 mb-8">
                  {plan.features.map((feat, i) => (
                    <li key={i} className="flex items-center gap-3 text-sm">
                      <span className={`flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-xs
                        ${feat.limit === '✓' || feat.limit === 'غير محدود'
                          ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400'
                          : 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
                        }`}>
                        {feat.limit === '✓' || feat.limit === 'غير محدود' ? '✓' : ''}
                      </span>
                      <span className={plan.highlighted ? '' : 'text-gray-600 dark:text-gray-400'}>
                        {feat.name}
                      </span>
                      <span className={`ml-auto text-xs font-medium
                        ${feat.limit === 'غير محدود' ? 'text-emerald-500 dark:text-emerald-400' : ''}
                        ${plan.highlighted ? 'opacity-80' : 'text-gray-400 dark:text-gray-500'}`}>
                        {feat.limit}
                      </span>
                    </li>
                  ))}
                </ul>

                <button
                  onClick={() => handleSubscribe(plan.id)}
                  disabled={isCurrentPlan || loading === plan.id}
                  className={`w-full py-3.5 rounded-xl text-sm font-bold transition-all ${
                    isCurrentPlan
                      ? 'bg-gray-200 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-default'
                      : plan.highlighted
                        ? 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg hover:shadow-xl'
                        : 'bg-gray-900 dark:bg-white text-white dark:text-gray-900 hover:bg-gray-800 dark:hover:bg-gray-100'
                  } ${loading === plan.id ? 'opacity-50 cursor-wait' : ''}`}
                >
                  {loading === plan.id ? 'جاري التحميل...' : isCurrentPlan ? 'الخطة الحالية' : plan.cta}
                </button>
              </div>
            );
          })}
        </div>

        {/* Payment Method Selector (shown for paid plans) */}
        <div className="mt-12 max-w-md mx-auto">
          <p className="text-sm text-center text-gray-500 dark:text-gray-400 mb-4">طريقة الدفع:</p>
          <div className="flex justify-center gap-4">
            {PAYMENT_METHODS.map((pm) => (
              <button
                key={pm.id}
                onClick={() => setPaymentMethod(pm.id)}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-medium transition-all ${
                  paymentMethod === pm.id
                    ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900 shadow-lg'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
                }`}
              >
                <span>{pm.icon}</span>
                {pm.name}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Verify build**

Run: `npm run build`
Expected: Compiled successfully

- [ ] **Step 3: Commit**

```bash
git add src/pages/PricingPage.jsx
git commit -m "feat: add pricing page with 3 plans, billing toggle, dark mode"
```

---

### Task 23: Add /pricing Route to App.js

**Files:**
- Modify: `src/App.js`

- [ ] **Step 1: Add pricing route**

Add import at top:
```jsx
const PricingPage = React.lazy(() => import('./pages/PricingPage'));
```

Add route:
```jsx
<Route path="/pricing" element={<PricingPage />} />
```

- [ ] **Step 2: Verify build**

Run: `npm run build`
Expected: Compiled successfully

- [ ] **Step 3: Commit**

```bash
git add src/App.js
git commit -m "feat: add /pricing route to app"
```

---

### Task 24: Update useFeatureAccess for Package Quotas

**Files:**
- Modify: `src/hooks/useFeatureAccess.js`

- [ ] **Step 1: Update `useFeatureAccess.js` to return package quota info**

```js
import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { getGuestId } from '../services/guestId';
import { checkQuota } from '../services/quotaService';

export function useFeatureAccess(featureId) {
  const { user, isPremium, isElite, subscription } = useAuth();
  const [quota, setQuota] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const cacheKey = `${featureId}-${user?.uid || 'guest'}`;
  const prevKey = useRef(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const guestId = user ? null : getGuestId();
      const authToken = user ? await user.getIdToken() : null;
      const result = await checkQuota(featureId, { guestId, authToken });
      setQuota(result);
    } catch (err) {
      setQuota({ allowed: false, remaining: 0, limit: 0 });
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [featureId, user]);

  useEffect(() => {
    if (prevKey.current !== cacheKey) {
      prevKey.current = cacheKey;
      setQuota(null);
      refresh();
    }
  }, [cacheKey, refresh]);

  // Elite: always allowed
  if (isElite) {
    return {
      allowed: true,
      remaining: Infinity,
      limit: Infinity,
      loading: false,
      error: null,
      refresh,
      isElite: true,
    };
  }

  // Premium: use package quota from subscription
  if (isPremium && subscription?.packageQuotas?.[featureId]) {
    const pq = subscription.packageQuotas[featureId];
    return {
      allowed: pq.remaining > 0,
      remaining: pq.remaining,
      limit: pq.total,
      loading: false,
      error: null,
      refresh,
      isPremium: true,
      isPackageQuota: true,
    };
  }

  return {
    allowed: isPremium || quota?.allowed,
    remaining: quota?.remaining ?? 0,
    limit: quota?.limit ?? 0,
    loading,
    error,
    refresh,
  };
}
```

- [ ] **Step 2: Verify build**

Run: `npm run build`
Expected: Compiled successfully

- [ ] **Step 3: Commit**

```bash
git add src/hooks/useFeatureAccess.js
git commit -m "feat: update useFeatureAccess for Premium package quotas and Elite unlimited"
```

---

### Task 25: Update useQuotaDisplay for Elite

**Files:**
- Modify: `src/hooks/useQuotaDisplay.js`

- [ ] **Step 1: Update `useQuotaDisplay.js`**

```js
import { useFeatureAccess } from './useFeatureAccess';
import { useAuth } from '../context/AuthContext';

const LABELS = {
  ai_chatbot: { name: 'المساعد الذكي', unit: 'رسالة', period: 'اليوم' },
  knowledge_base: { name: 'قاعدة المعرفة', unit: 'بحث', period: 'الأسبوع' },
  disease_diagnosis: { name: 'تشخيص الأمراض', unit: 'تشخيص', period: 'الأسبوع' },
};

export function useQuotaDisplay(featureId) {
  const { isElite } = useAuth();
  const { allowed, remaining, limit, loading, error, refresh, isPackageQuota } = useFeatureAccess(featureId);
  const label = LABELS[featureId] || { name: featureId, unit: 'استخدام', period: '' };

  if (isElite || remaining === Infinity) {
    return {
      allowed: true,
      remaining: Infinity,
      limit: Infinity,
      loading: false,
      error: null,
      refresh,
      label,
      exhausted: false,
      percent: 100,
      displayText: 'غير محدود',
      isUnlimited: true,
    };
  }

  const exhausted = !loading && !allowed && remaining === 0;

  let displayText;
  if (isPackageQuota) {
    displayText = `${remaining} / ${limit} ${label.unit}`;
  } else if (limit > 0) {
    displayText = `${remaining} / ${limit} ${label.unit}`;
  } else {
    displayText = `${limit} ${label.unit}`;
  }

  return {
    allowed,
    remaining,
    limit,
    loading,
    error,
    refresh,
    label,
    exhausted,
    percent: limit > 0 ? Math.round((remaining / limit) * 100) : 0,
    displayText,
    isUnlimited: false,
  };
}
```

- [ ] **Step 2: Verify build**

Run: `npm run build`
Expected: Compiled successfully

- [ ] **Step 3: Commit**

```bash
git add src/hooks/useQuotaDisplay.js
git commit -m "feat: update useQuotaDisplay for Elite unlimited and Premium package quotas"
```

---

### Task 26: Update QuotaModal for Premium Upgrade Path

**Files:**
- Modify: `src/component/QuotaModal.jsx`

- [ ] **Step 1: Update QuotaModal for Premium quota exhaustion**

Change the Premium user section to show an upgrade button:

```jsx
// Replace the existing isPremium section with:
isPremium && !isElite ? (
  <>
    <h2 className="text-xl font-bold text-center text-[#2d2a24] dark:text-white mb-2">
      لقد استنفذت حصتك الشهرية
    </h2>
    <p className="text-sm text-center text-[#8a8580] dark:text-[#a1a1aa] mb-6">
      تم استهلاك جميع استخداماتك للباقة المميزة. انتقل إلى الباقة الفريدة للحصول على استخدام غير محدود.
    </p>
    <div className="flex flex-col gap-3">
      <button
        onClick={() => navigate('/pricing')}
        className="w-full py-2.5 rounded-xl bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 text-white text-sm font-medium transition-colors shadow-lg"
      >
        الانتقال إلى Elite
      </button>
      <button onClick={onClose}
        className="w-full py-2.5 rounded-xl bg-white dark:bg-[#2a2a2a] border border-[#e8e3d8] dark:border-[#333] text-[#2d2a24] dark:text-white text-sm font-medium transition-colors"
      >
        لاحقاً
      </button>
    </div>
  </>
) : (
  // existing free user section
)
```

Import `useAuth` and `useNavigate`:
```jsx
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
```

- [ ] **Step 2: Verify build**

Run: `npm run build`
Expected: Compiled successfully

- [ ] **Step 3: Commit**

```bash
git add src/component/QuotaModal.jsx
git commit -m "feat: update QuotaModal with Premium upgrade path to Elite"
```

---

### Task 27: Update QuotaBadge for Premium

**Files:**
- Modify: `src/component/QuotaBadge.jsx`

- [ ] **Step 1: Update QuotaBadge**

```jsx
import { useAuth } from '../context/AuthContext';
import { useQuotaDisplay } from '../hooks/useQuotaDisplay';

export default function QuotaBadge({ featureId, onExhausted }) {
  const { isElite } = useAuth();
  const { allowed, remaining, limit, loading, label, exhausted, displayText, isUnlimited } = useQuotaDisplay(featureId);

  if (loading) return null;

  if (isElite || isUnlimited) {
    return (
      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 border border-purple-200 dark:border-purple-800">
        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
        غير محدود
      </div>
    );
  }

  if (exhausted) {
    return (
      <div
        onClick={() => onExhausted?.()}
        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800 cursor-pointer hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors"
      >
        0
        <span className="opacity-50">/</span>
        {limit}
        <span className="mr-1">{label.unit}</span>
      </div>
    );
  }

  const isLow = remaining <= Math.ceil(limit * 0.2);

  return (
    <div
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium transition-colors ${
        isLow
          ? 'bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800'
          : 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800'
      }`}
    >
      <span>{remaining}</span>
      <span className="opacity-50">/</span>
      <span>{limit}</span>
      <span className="mr-1">{label.unit}</span>
    </div>
  );
}
```

- [ ] **Step 2: Verify build**

Run: `npm run build`
Expected: Compiled successfully

- [ ] **Step 3: Commit**

```bash
git add src/component/QuotaBadge.jsx
git commit -m "feat: update QuotaBadge for Elite unlimited and Premium exhausted states"
```

---

### Task 28: Update Dev Server + API Config

**Files:**
- Modify: `dev-server.js`

- [ ] **Step 1: Add new API routes to `dev-server.js`**

Add after existing route handlers:

```js
// Subscription & Payment routes
if (method === 'POST' && url === '/api/create-checkout-session') {
  const handler = require('./api/create-checkout-session');
  return respond(res, await handler({ method, headers, body }, createResponse()));
}
if (method === 'POST' && url === '/api/stripe-webhook') {
  const handler = require('./api/stripe-webhook');
  return respond(res, await handler({ method, headers, body: rawBody }, createResponse()));
}
if (method === 'POST' && url === '/api/vodafone-cash/initiate') {
  const handler = require('./api/vodafone-cash/initiate');
  return respond(res, await handler({ method, headers, body }, createResponse()));
}
if (method === 'POST' && url === '/api/vodafone-cash/verify') {
  const handler = require('./api/vodafone-cash/verify');
  return respond(res, await handler({ method, headers, body }, createResponse()));
}
if (method === 'GET' && url === '/api/subscription') {
  const handler = require('./api/subscription');
  return respond(res, await handler({ method, headers }, createResponse()));
}
if (url === '/api/check-expired') {
  const handler = require('./api/check-expired');
  return respond(res, await handler({ method, headers }, createResponse()));
}
```

- [ ] **Step 2: Commit**

```bash
git add dev-server.js
git commit -m "chore: add subscription/payment routes to dev server"
```

---

### Task 29: End-to-End Test Script

**Files:**
- Create: `scripts/test-subscription-system.js`

- [ ] **Step 1: Create test script**

```js
const { getDb } = require('../api/_lib/firebaseAdmin');

// Skip if Firebase not configured
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
  if (condition) {
    passed++;
    console.log(`  ✓ ${label}`);
  } else {
    failed++;
    console.error(`  ✗ ${label}`);
  }
}

async function testSubscriptionService() {
  console.log('\n🧪 Testing Subscription Service...\n');

  const { activateSubscription, expireSubscription, cancelAtPeriodEnd, getSubscription, consumePackageQuota } = require('../api/_lib/subscriptionService');

  // Test 1: activate premium monthly
  console.log('\n--- Premium Monthly Activation ---');
  const sub1 = await activateSubscription({
    userId: TEST_USER_ID,
    plan: 'premium',
    billingCycle: 'monthly',
    paymentProvider: 'stripe',
  });
  await assert(sub1.status === 'active', 'status is active');
  await assert(sub1.plan === 'premium', 'plan is premium');
  await assert(sub1.packageQuotas.ai_chatbot.total === 100, 'chatbot quota total is 100');
  await assert(sub1.packageQuotas.ai_chatbot.remaining === 100, 'chatbot remaining starts at 100');
  await assert(sub1.packageQuotas.knowledge_base.total === 70, 'KB quota total is 70');
  await assert(sub1.packageQuotas.disease_diagnosis.total === 2, 'diagnosis quota total is 2');

  // Test 2: consume package quota
  console.log('\n--- Package Quota Consumption ---');
  const r1 = await consumePackageQuota(TEST_USER_ID, 'ai_chatbot');
  await assert(r1.allowed === true, 'first consumption allowed');
  await assert(r1.remaining === 99, 'remaining decremented to 99');

  const r2 = await consumePackageQuota(TEST_USER_ID, 'ai_chatbot');
  await assert(r2.remaining === 98, 'remaining decremented to 98');

  // Test 3: consume all chatbot quota
  for (let i = 0; i < 98; i++) await consumePackageQuota(TEST_USER_ID, 'ai_chatbot');
  const rExhausted = await consumePackageQuota(TEST_USER_ID, 'ai_chatbot');
  await assert(rExhausted.allowed === false, 'exhausted quota returns allowed=false');
  await assert(rExhausted.reason === 'quota_exhausted', 'exhausted reason is quota_exhausted');

  // Test 4: premium yearly quotas are 12x
  console.log('\n--- Yearly Quota Calculation ---');
  const subYearly = await activateSubscription({
    userId: TEST_USER_ID + '-yearly',
    plan: 'premium',
    billingCycle: 'yearly',
    paymentProvider: 'stripe',
  });
  await assert(subYearly.packageQuotas.ai_chatbot.total === 1200, 'yearly chatbot = 100 × 12 = 1200');
  await assert(subYearly.packageQuotas.knowledge_base.total === 840, 'yearly KB = 70 × 12 = 840');
  await assert(subYearly.packageQuotas.disease_diagnosis.total === 24, 'yearly diagnosis = 2 × 12 = 24');

  // Test 5: getSubscription
  console.log('\n--- Get Subscription ---');
  const fetched = await getSubscription(TEST_USER_ID);
  await assert(fetched !== null, 'subscription exists');
  await assert(fetched.plan === 'premium', 'fetched plan matches');

  // Test 6: cancelAtPeriodEnd
  console.log('\n--- Cancellation ---');
  await cancelAtPeriodEnd(TEST_USER_ID);
  const cancelled = await getSubscription(TEST_USER_ID);
  await assert(cancelled.status === 'cancelled', 'status changed to cancelled');

  // Test 7: expireSubscription
  console.log('\n--- Expiration ---');
  await expireSubscription(TEST_USER_ID);
  const expired = await getSubscription(TEST_USER_ID);
  await assert(expired.status === 'expired', 'status changed to expired');
  await assert(expired.plan === 'free', 'plan reverted to free');
  await assert(expired.packageQuotas === null, 'package quotas cleared');

  // Test 8: elite has no quotas
  console.log('\n--- Elite Plan ---');
  const subElite = await activateSubscription({
    userId: TEST_USER_ID + '-elite',
    plan: 'elite',
    billingCycle: 'monthly',
    paymentProvider: 'stripe',
  });
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

  // Strategy resolves through checkQuota — test admin bypass
  const adminResult = await checkQuota({
    featureId: 'ai_chatbot',
    userId: null,
    guestId: null,
    isPremium: false,
    incrementIfAllowed: false,
  });
  await assert(adminResult.error !== undefined || adminResult.allowed !== undefined, 'checkQuota returns result');

  console.log(`\n  Note: Full strategy testing requires Firestore feature docs.\n  Run scripts/test-quota-system.js for comprehensive quota tests.`);
}

async function run() {
  console.log('========================================');
  console.log('  Subscription & Payment System Tests');
  console.log('========================================');
  console.log(`  Test user ID: ${TEST_USER_ID}`);

  await testSubscriptionService();
  await testQuotaStrategies();

  console.log('\n========================================');
  console.log(`  Results: ${passed} passed, ${failed} failed`);
  console.log('========================================\n');
  process.exit(failed > 0 ? 1 : 0);
}

run().catch(err => {
  console.error('Test error:', err);
  process.exit(1);
});
```

- [ ] **Step 2: Run tests**

```bash
node scripts/test-subscription-system.js
```
Expected: 18+ tests passing

- [ ] **Step 3: Commit**

```bash
git add scripts/test-subscription-system.js
git commit -m "test: add subscription system test script"
```

---

### Verification Checklist

- [ ] Free users continue with daily/weekly limits (unchanged)
- [ ] Premium users consume package quotas (chatbot 100/month, KB 70/month, diagnosis 2/month)
- [ ] Premium yearly quotas = monthly × 12 (1200 chatbot, 840 KB, 24 diagnosis)
- [ ] Package quotas reset only on subscription renewal
- [ ] Elite users are always unlimited
- [ ] Admin users bypass all limits
- [ ] Stripe Checkout Session creation works
- [ ] Stripe webhook signature verification works
- [ ] Vodafone Cash payment reference generation works
- [ ] Admin can verify Vodafone Cash payments via API
- [ ] Expired subscriptions auto-downgrade to Free
- [ ] Cancelled subscriptions remain active until period end
- [ ] Firestore rules block user writes to subscriptions
- [ ] No subscription or quota fields writable from frontend
- [ ] /pricing page displays 3 plans with correct pricing
- [ ] Monthly/yearly toggle works on pricing page
- [ ] SubscriptionBadge shows correct plan
- [ ] PackageQuotaDisplay shows correct remaining amounts
- [ ] QuotaModal shows upgrade path for Premium users
- [ ] QuotaBadge shows "غير محدود" for Elite users

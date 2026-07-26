# Subscription & Payment System — Design Spec

## Overview

Build a complete subscription and payment system on top of the existing quota foundation. Three plans (Free / Premium / Elite), two billing cycles (monthly / yearly), two payment providers (Stripe / Vodafone Cash), package-based quotas for Premium, unlimited access for Elite, and strict server-side security.

## Plans

### Free Plan

Price: Free

| Feature | Limit |
|---------|-------|
| AI Chatbot | 5/day |
| Knowledge Base | 5/week |
| Disease Diagnosis | 1/week |
| Weather, Blog, Articles, Home, Dashboard | Unlimited |

### Premium Plan

Price: 50 EGP/month — 500 EGP/year

Package quotas (reset only on renewal):

| Feature | Monthly | Yearly (Monthly × 12) |
|---------|---------|----------------------|
| AI Chatbot | 100 | 1200 |
| Knowledge Base | 70 | 840 |
| Disease Diagnosis | 2 | 24 |

Yearly quotas are calculated dynamically at subscription creation: `premiumMonthlyQuota × 12`. Never hardcoded.

### Elite Plan

Price: 80 EGP/month — 800 EGP/year

Unlimited access to all features. Never consumes quotas. Display "Unlimited" everywhere.

## Architecture

```
Payment Providers (abstraction layer)
  StripeProvider          → VodafoneCashProvider
       │                          │
       └──────────┬───────────────┘
                  │
       SubscriptionService
       (activate, renew, expire, upgrade, downgrade)
                  │
       QuotaStrategyRouter
       ├── FreeStrategy          (daily/weekly usage counters)
       ├── PremiumPkgStrategy    (package quotas from subscription doc)
       ├── EliteStrategy         (Infinity)
       ├── AdminStrategy         (Infinity)
       └── GuestStrategy         (Redis-based)
                  │
       Firestore (source of truth)
       features / subscriptions / usage / users
```

### Payment Provider Interface

```js
interface PaymentProvider {
  createCheckoutSession({ plan, billingCycle, userId, customerEmail })
    → { sessionId, sessionUrl }
  verifyPayment({ paymentId, providerData })
    → { verified: boolean, paymentDetails: object }
  handleWebhook(req)
    → { event: string, data: object }
  cancelSubscription({ providerSubscriptionId })
    → boolean
}
```

### Stripe Implementation

- Stripe Checkout Sessions with price IDs from environment variables
- Webhook handler with `stripe-signature` verification (endpoint secret)
- Idempotency via webhook event ID tracking in Firestore (`processedWebhooks/{eventId}`)
- Stripe Subscriptions for auto-renewal (monthly/yearly)
- Products and prices configured in Stripe Dashboard (no hardcoded price amounts in code)

### Vodafone Cash Implementation

- Payment reference generated server-side, stored in pending subscription
- User shown reference + instructions to send amount
- Admin verifies payment via `/api/vodafone-cash/verify` endpoint
- On verification: subscription activated, quotas set
- Future: swap `VodafoneCashProvider` implementation with official provider API — no business logic changes needed

## Data Model

### Subscription Document — `subscriptions/{userId}`

```js
{
  plan: "premium",                    // "premium" | "elite"
  status: "active",                   // "pending" | "active" | "expired" | "cancelled"
  billingCycle: "monthly",            // "monthly" | "yearly"
  paymentProvider: "stripe",          // "stripe" | "vodafone_cash"
  paymentStatus: "paid",              // "pending" | "paid" | "failed" | "refunded"
  startDate: Timestamp,
  expirationDate: Timestamp,
  renewalDate: Timestamp,
  packageQuotas: {
    ai_chatbot: { total: 100, remaining: 87, resetDate: Timestamp },
    knowledge_base: { total: 70, remaining: 70, resetDate: Timestamp },
    disease_diagnosis: { total: 2, remaining: 2, resetDate: Timestamp }
  },
  stripeCustomerId: "cus_xxx",
  stripeSubscriptionId: "sub_xxx",
  stripePriceId: "price_xxx",
  vodafoneTransactionId: "TXN123",
  vodafonePhoneNumber: "+201234567890",
  createdAt: Timestamp,
  updatedAt: Timestamp
}
```

### Subscription Logs — `subscriptionLogs/{autoId}`

```js
{
  userId: "abc123",
  event: "subscription_created",    // created | renewed | expired | upgraded |
                                    // downgraded | cancelled | payment_started |
                                    // payment_completed | payment_failed | refunded
  plan: "premium",
  billingCycle: "monthly",
  paymentProvider: "stripe",
  details: {},                      // event-specific data
  timestamp: Timestamp
}
```

### Enhanced Feature Document — `features/{featureId}`

```js
{
  ...existingFields,                 // dailyLimit, weeklyLimit, premiumUnlimited, etc.
  premiumMonthlyQuota: 100,         // reference quota for Premium monthly (yearly = ×12)
  eliteUnlimited: true              // explicitly marks Elite-unlimited features
}
```

### Pricing Config — `pricing/plans`

```js
{
  premium: {
    monthly: { price: 50, currency: "EGP", priceId: "price_monthly_premium_xxx" },
    yearly: { price: 500, currency: "EGP", priceId: "price_yearly_premium_xxx", savings: "17%" }
  },
  elite: {
    monthly: { price: 80, currency: "EGP", priceId: "price_monthly_elite_xxx" },
    yearly: { price: 800, currency: "EGP", priceId: "price_yearly_elite_xxx", savings: "17%" }
  },
  features: { ... }
}
```

## API Endpoints

### New Backend Endpoints

| Method | Endpoint | File | Purpose |
|--------|----------|------|---------|
| POST | `/api/create-checkout-session` | `api/create-checkout-session.js` | Creates Stripe Checkout Session, returns URL |
| POST | `/api/stripe-webhook` | `api/stripe-webhook.js` | Stripe webhook handler (signature verified) |
| POST | `/api/vodafone-cash/initiate` | `api/vodafone-cash/initiate.js` | Creates pending subscription, returns reference |
| POST | `/api/vodafone-cash/verify` | `api/vodafone-cash/verify.js` | Admin confirms Vodafone Cash payment |
| GET | `/api/subscription` | `api/subscription.js` | Returns current user's subscription + quotas |
| POST | `/api/seed-subscription-plans` | `api/seed-subscription-plans.js` | Seeds pricing config to Firestore |
| GET | `/api/check-expired` | `api/check-expired.js` | Scans for expired subscriptions, downgrades them |

### Modified Backend Files

| File | Change |
|------|--------|
| `api/_lib/checkQuota.js` | Add `QuotaStrategyRouter` — routes to correct strategy by plan |
| `api/_lib/loadFeatures.js` | Add `premiumMonthlyQuota` to feature loading |
| `api/ai.js` | Updated context for Premium package quota consumption |
| `api/analyze-image.js` | Updated context for Premium package quota consumption |
| `api/knowledge-base.js` | Updated context for Premium package quota consumption |
| `api/package.json` | Add `stripe` dependency |

### New Library Files

| File | Purpose |
|------|---------|
| `api/_lib/subscriptionService.js` | Subscription lifecycle management |
| `api/_lib/quotaStrategies.js` | Strategy router + all quota strategies |
| `api/_lib/payments/provider.js` | Payment provider interface/registry |
| `api/_lib/payments/stripe.js` | Stripe provider implementation |
| `api/_lib/payments/vodafoneCash.js` | Vodafone Cash provider implementation |

## Frontend

### New Components & Pages

| File | Purpose |
|------|---------|
| `src/pages/PricingPage.jsx` | 3 pricing cards, monthly/yearly toggle, dark mode, Most Popular badge |
| `src/component/SubscriptionBadge.jsx` | Shows current plan (FREE / PREMIUM / ELITE) with styling |
| `src/component/PackageQuotaDisplay.jsx` | Shows remaining package quotas for Premium users |
| `src/hooks/usePackageQuota.js` | Reads package quotas from AuthContext subscription |
| `src/services/subscriptionService.js` | Frontend service for subscription API calls |

### Modified Frontend Files

| File | Change |
|------|--------|
| `src/App.js` | Add `/pricing` route, lazy-load `PricingPage` |
| `src/context/AuthContext.jsx` | Add `isElite`, `refreshSubscription()` |
| `src/component/QuotaModal.jsx` | Show upgrade link when Premium quota exhausted |
| `src/component/QuotaBadge.jsx` | Show "0 — Upgrade" for exhausted Premium quotas |
| `src/hooks/useFeatureAccess.js` | Return package quota info for Premium users |
| `src/hooks/useQuotaDisplay.js` | Show "Unlimited" for Elite users |

## Security

### Firestore Security Rules

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // Subscriptions: users can READ their own, NO user writes
    match /subscriptions/{userId} {
      allow read: if request.auth != null && request.auth.uid == userId;
      allow create, update, delete: if false;  // backend only
    }

    // Subscription logs: no user access
    match /subscriptionLogs/{logId} {
      allow read, write: if false;  // backend only
    }

    // Usage: authenticated users can read/write their own usage
    match /usage/{userId}/{document=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }

    // Users: read own profile, write controlled fields only
    match /users/{userId} {
      allow read: if request.auth != null && request.auth.uid == userId;
      allow write: if request.auth != null && request.auth.uid == userId
                    && request.resource.data.keys().hasOnly(['fullName', 'phoneNumber',
                      'specialization', 'profileImage', 'updatedAt']);
      // role, email, createdAt, etc. are write-protected
    }

    // Features: read for all authenticated, write backend only
    match /features/{featureId} {
      allow read: if request.auth != null;
      allow write: if false;
    }

    // Pricing: read for all, write backend only
    match /pricing/{document=**} {
      allow read: if true;
      allow write: if false;
    }
  }
}
```

### Backend-Only Writes

- Subscription activation, plan changes, quota updates — all via Firebase Admin SDK
- Service account key in environment variables (already configured)
- Stripe webhook verification via `stripe-signature` header + endpoint secret
- Vodafone Cash verification requires admin authentication (`isAdmin` check)

### Payment Security

- Never trust frontend payment confirmations
- Stripe: verify webhook signature, reject duplicate events, idempotency keys
- Vodafone Cash: manual admin verification — no auto-activation
- All subscription writes: backend only, never from client SDK

## Quota Integration

### Strategy Router (`api/_lib/quotaStrategies.js`)

```js
async function checkQuota({ featureId, userId, guestId, subscription, incrementIfAllowed }) {
  // 1. Load feature config
  // 2. isPublic → allow
  // 3. if subscription:
  //    a. plan === 'elite' → allow unlimited
  //    b. plan === 'premium' → check package quotas from subscription.packageQuotas
  // 4. Check admin role from users/{userId}
  // 5. Free user → existing daily/weekly logic
  // 6. Guest → existing Redis logic
}
```

### Package Quota Consumption (Premium)

```
User sends request → middleware checks subscription
  → plan = premium, feature = ai_chatbot
  → read packageQuotas.ai_chatbot.remaining from subscription doc
  → if remaining > 0: decrement, update Firestore, allow
  → if remaining = 0: deny with upgrade suggestion
```

### Yearly Quota Calculation

Calculated once at subscription activation:
```
monthlyQuota × 12 = yearlyQuota
  100 × 12 = 1200 (chatbot)
  70 × 12 = 840 (knowledge_base)
  2 × 12 = 24 (diagnosis)
```

Stored in `packageQuotas` at activation. Never recalculated mid-cycle.

### Quota Reset

| User Type | Reset Mechanism | Reset Time |
|-----------|----------------|-------------|
| Free | Date comparison on each request | Daily / Weekly |
| Guest | Date comparison on each request + Redis TTL | Daily / Weekly |
| Premium | Package quotas in subscription doc | On renewal only |
| Elite | Never (always unlimited) | N/A |

## Subscription Lifecycle

### Create Subscription

```
1. User selects plan + billing cycle + payment method
2. Frontend calls appropriate payment endpoint
   a. Stripe: create-checkout-session → redirect to Stripe Checkout
   b. VC: initiate → show payment reference
3. Backend creates subscription with status "pending"
4. Payment verified → subscriptionService.activate()
   a. Set status = "active", paymentStatus = "paid"
   b. Calculate package quotas (yearly = monthly × 12 if yearly)
   c. Store packageQuotas in subscription doc
   d. Log event
```

### Renew

- Stripe: automatic via Stripe Subscriptions (webhook `invoice.payment_succeeded`)
- Vodafone Cash: manual — user pays again, admin verifies
- On renewal: reset package quotas to full amount

### Upgrade

```
Free → Premium / Elite: immediate activation
Premium → Elite: immediate activation
  - Calculate prorated credit for remaining Premium time
  - Apply to Elite billing if applicable
Monthly → Yearly: immediate, prorate remaining month
```

### Downgrade

```
Elite → Premium: effective at end of billing period
Premium → Free: effective at end of billing period
Elite → Free: effective at end of billing period
```

Status set to `cancelled` immediately, plan stays until `expirationDate` reached.

### Expiration

- Daily check: `GET /api/check-expired` finds subscriptions where `expirationDate < now && status === 'active'`
- Also checked inline: each quota check verifies subscription expiry
- On expiry: status → `expired`, `paymentStatus` kept as `paid`, package quotas cleared, quotas revert to Free limits

## Event Logging

All lifecycle events logged to `subscriptionLogs/`:

| Event | Trigger |
|-------|---------|
| `subscription_created` | Payment verified, subscription activated |
| `subscription_renewed` | Renewal processed |
| `subscription_expired` | Expiration detected |
| `subscription_upgraded` | Plan upgrade |
| `subscription_downgraded` | Downgrade scheduled/effective |
| `subscription_cancelled` | User/admin cancels |
| `payment_started` | Checkout session created / VC initiated |
| `payment_completed` | Payment confirmed |
| `payment_failed` | Payment declined / failed |
| `payment_refunded` | Refund processed |
| `webhook_received` | Stripe webhook received |
| `webhook_verified` | Webhook signature verified |
| `quota_updated` | Package quota decremented |
| `quota_exhausted` | Package quota reached 0 |

Each log entry includes a `timestamp` (Firestore Timestamp server value).

## Implementation Order

1. **Core backend library**: `subscriptionService.js`, `quotaStrategies.js`, payment provider abstraction
2. **Feature config update**: Add `premiumMonthlyQuota` to seed script + loadFeatures
3. **checkQuota.js refactor**: Integrate strategy router
4. **Stripe provider**: `stripe.js`, `create-checkout-session.js`, `stripe-webhook.js`
5. **Vodafone Cash provider**: `vodafoneCash.js`, `initiate.js`, `verify.js`
6. **Subscription API**: `subscription.js`, `check-expired.js`
7. **Price seeding**: `seed-subscription-plans.js`
8. **API handler updates**: `ai.js`, `analyze-image.js`, `knowledge-base.js`
9. **Firestore security rules**: `firestore.rules`
10. **Frontend pricing page**: `PricingPage.jsx`
11. **Frontend subscription display**: `SubscriptionBadge`, `PackageQuotaDisplay`, `usePackageQuota`
12. **Frontend integration**: `AuthContext`, `QuotaModal`, `QuotaBadge`, route
13. **Dev server + config**: Update `dev-server.js`, `api/package.json`, `.env`
14. **Testing**: End-to-end tests covering all flows

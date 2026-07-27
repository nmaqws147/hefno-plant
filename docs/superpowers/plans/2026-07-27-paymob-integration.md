# Paymob Integration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax.

**Goal:** Replace Stripe + VodafoneCash with Paymob as the sole payment provider, with full webhook HMAC verification, idempotency, admin dashboard, and user payment history.

**Architecture:** Paymob provider in `api/_lib/payments/paymob.js` registers into the existing provider pattern. Vercel routes map endpoints to `api/billing.js`. Frontend redirects to Paymob checkout. Admin panel and profile page consume REST endpoints.

**Tech Stack:** CRA + react-router-dom, Vercel serverless (api/), Firebase Admin SDK, Firestore, Paymob Accept API.

## Global Constraints
- No Stripe or VodafoneCash code remains after cleanup
- Paymob is the sole payment provider
- All webhooks verify HMAC before processing
- Every transaction checked for idempotency
- No subscription activation from frontend
- Arabic RTL UI throughout

---

### Task 1: Paymob Provider Module

**Files:**
- Create: `api/_lib/payments/paymob.js`

**Interfaces:**
- Consumes: `api/_lib/payments/provider.js` (registerProvider), `api/_lib/firebaseAdmin.js` (getDb), `api/_lib/subscriptionService.js` (activateSubscription, logEvent)
- Produces: Registered `'paymob'` provider with `createCheckoutSession`, `handleWebhook`, `verifyPayment` methods

**Implementation:**
- `createCheckoutSession`: calls Paymob auth token endpoint → creates order → gets payment key → returns iframe URL
- `handleWebhook`: parses raw body, calculates HMAC SHA-512 with PAYMOB_HMAC_SECRET, compares against `hmac` header, validates amount/currency/merchant/integration, checks idempotency in payment_events, returns event type + data
- `verifyPayment`: webhook-driven, checks payment_events for subscription_activated event
- PRICES: premium 50 EGP monthly / 500 EGP yearly, elite 80 EGP monthly / 800 EGP yearly
- All amounts in cents (x100)

---

### Task 2: Billing.js — Paymob Routes

**Files:**
- Modify: `api/billing.js`

**Implementation:**
- Import paymob provider: `require('./_lib/payments/paymob');`
- Raw body capture for webhook: on POST /api/paymob/webhook, buffer chunks before JSON parse
- `handlePaymobIntent`: auth → validate plan/billingCycle → `createPayment({ provider: 'paymob', ... })` → return result
- `handlePaymobWebhook`: call `handleWebhook({ provider: 'paymob', req })` → handle each event type (invalid_hmac → 400, duplicate → 200, checkout.session.completed → activate subscription, save payment doc, save payment_events, log → 200)
- `handlePaymobPayments`: auth → if admin with search params return filtered, if user return own → query payments collection → return paginated
- Routes: `/api/paymob/intent` POST, `/api/paymob/webhook` POST, `/api/paymob/payments` GET

---

### Task 3: Vercel Config + Env

**Files:**
- Modify: `vercel.json`, `api/.env`

**Implementation:**
- Add route: `/api/paymob/(intent|webhook|payments)(/.*)?` → `api/billing.js`
- Update billing route pattern to include paymob paths
- Replace Stripe/VC env vars with Paymob: PAYMOB_API_KEY, PAYMOB_INTEGRATION_ID, PAYMOB_IFRAME_ID, PAYMOB_HMAC_SECRET, PAYMOB_MERCHANT_ID
- Remove VODAFONE_CASH_NUMBER, all STRIPE_* vars

---

### Task 4: Cleanup Old Payment Providers

**Files:**
- Delete: `api/_lib/payments/stripe.js`, `api/_lib/payments/vodafoneCash.js`, `api/stripe-webhook.js`, `api/create-checkout-session.js`, `api/vodafone-cash/` (directory)
- Modify: `api/billing.js` — remove Stripe/VC imports, remove handleStripeWebhook, handleVodafoneInitiate, handleVodafoneVerify handlers, remove their route blocks

---

### Task 5: Firestore Rules

**Files:**
- Modify: `firestore.rules`

**Implementation:**
```
match /payments/{paymentId} {
  allow read: if isOwner(resource.data.userId);
  allow write: if false;
}
match /payment_events/{eventId} {
  allow read, write: if false;
}
```

---

### Task 6: Frontend Subscription Service

**Files:**
- Modify: `src/services/subscriptionService.js`

**Implementation:**
- Replace `createCheckoutSession` and `initiateVodafoneCash` with `createPaymobIntent(plan, billingCycle)`
- Add `getPayments(params)` function — GET /api/paymob/payments with query params
- Keep `getSubscription()`

---

### Task 7: Pricing Page Update

**Files:**
- Modify: `src/pages/PricingPage.jsx`

**Implementation:**
- Replace `createCheckoutSession`/`initiateVodafoneCash` imports with `createPaymobIntent`
- Update PAYMENT_METHODS to single Paymob entry
- Update TRUST_ITEMS desc
- Update FAQ Q3 text to mention Paymob
- Replace handleSubscribe logic to call createPaymobIntent and redirect
- Remove PaymentSelector component and its state

---

### Task 8: Admin Panel Payments Tab

**Files:**
- Modify: `src/pages/AdminPanel.jsx`

**Implementation:**
- Add `PaymentsPanel` component with: stats bar (revenue, success count, failed count), status filter dropdown, search input, payments table with columns (transaction ID, user, plan, amount, status, date)
- Add pagination
- Add relevant Lucide icons
- Integrate as a new tab

---

### Task 9: Profile Page Updates

**Files:**
- Modify: `src/pages/ProfilePage.jsx`

**Implementation:**
- Add subscription card: plan name with icon, status badge, renewal date, billing cycle, upgrade button for free users
- Add payment history section: list of last 10 payments with plan, date, amount, status
- Fetch subscription via `getSubscription()` and payments via `getPayments({ limit: 10 })`

---

### Task 10: Verify Build and Deploy

**Files:**
- Global check

**Implementation:**
- Run frontend build: `DISABLE_ESLINT_PLUGIN=true CI=false npx react-scripts build`
- Fix any compilation errors
- Git commit all changes
- Deploy to Vercel: `npx vercel deploy --prod --yes`

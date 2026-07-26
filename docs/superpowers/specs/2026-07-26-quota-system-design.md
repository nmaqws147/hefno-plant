# Quota & Access Control System — Design Spec

## Overview

Redesign HefnoPlant's access control from a flat public/auth model to a three-tier
system (Guest / Free / Premium) with per-feature quotas enforced server-side.

## User Tiers

| Tier   | Auth Required | Chatbot   | Knowledge Base | Disease Diagnosis | Public Pages |
|--------|---------------|-----------|----------------|-------------------|--------------|
| Guest  | No            | 5/day     | 5/week         | 1/week            | Unlimited    |
| Free   | Yes           | 5/day     | 5/week         | 1/week            | Unlimited    |
| Premium| Yes           | Unlimited | Unlimited      | Unlimited         | Unlimited    |

## Feature Config (Firestore Collection `features`)

Each feature is a document keyed by `featureId`:

```js
{
  id: "ai_chatbot",
  displayName: "AI Chatbot",
  order: 1,
  dailyLimit: 5,           // null = no daily limit
  weeklyLimit: null,       // null = no weekly limit
  monthlyLimit: null,
  premiumUnlimited: true,
  isPublic: false,
  isEnabled: true,
  createdAt: Timestamp,
  updatedAt: Timestamp
}
```

Three seed documents:

| featureId         | dailyLimit | weeklyLimit | premiumUnlimited | isPublic |
|-------------------|------------|-------------|------------------|----------|
| ai_chatbot        | 5          | null        | true             | false    |
| knowledge_base    | null       | 5           | true             | false    |
| disease_diagnosis | null       | 1           | true             | false    |

Guest and free users share the same limit values. Premium users skip all checks.

## Usage Tracking

### Authenticated Users (Firestore)

Path: `usage/{userId}/features/{featureId}`

```js
{
  dailyUsed: 3,             // counter for daily period
  weeklyUsed: 2,            // counter for weekly period
  dailyResetAt: Timestamp,  // start of current daily period
  weeklyResetAt: Timestamp, // start of current weekly period
  updatedAt: Timestamp
}
```

Reset is checked at read time: if current time exceeds `dailyResetAt + 24h`,
reset `dailyUsed` to 0 and update `dailyResetAt`. Same logic for weekly
(`weeklyResetAt + 7d`).

### Guest Users (Redis)

Key: `guest:{guestId}:usage` (Redis Hash)

```redis
HSET guest:a1b2c3:usage \
  ai_chatbot_daily 3 \
  ai_chatbot_daily_date 2026-07-26 \
  knowledge_base_weekly 2 \
  knowledge_base_weekly_start 2026-07-21 \
  disease_diagnosis_weekly 0 \
  disease_diagnosis_weekly_start 2026-07-21

EXPIRE guest:a1b2c3:usage 604800  # 7-day TTL for automatic cleanup
```

Guest ID is a V4 UUID generated on first visit, stored in localStorage as
`hefno_guest_id`, sent as `X-Guest-Id` header on every API request.

### Knowledge Base Quota Scope

Knowledge Base quota counts **explicit search actions only**. Browsing static category
pages (Diseases, Insects, Pesticides, etc.) does NOT consume quota. A search action is
defined as: user types a query in a KB search bar and submits it. The current KB has no
search bar — one will be added that calls `POST /api/knowledge-base` instead of
filtering client-side.

## Middleware

File: `api/_lib/checkQuota.js`

```js
async function checkQuota({ featureId, userId, guestId, isPremium, incrementIfAllowed }) {
  // 1. Load feature config (cached in-memory, 60s TTL)
  // 2. If not isEnabled → error
  // 3. If isPublic → allow immediately
  // 4. If premium + premiumUnlimited → allow immediately
  // 5. Determine limits (daily for chatbot, weekly for KB/diagnosis)
  // 6. Load current usage (Firestore for auth, Redis for guest)
  // 7. Check reset dates, reset counters if period expired
  // 8. If quota exhausted → return { allowed: false, remaining: 0 }
  // 9. If incrementIfAllowed → increment counter + update reset dates
  // 10. Return { allowed: true, remaining, limit }
}
```

Return value:

```js
// Success
{ allowed: true, remaining: 4, limit: 5, resetDate: "2026-07-27T00:00:00Z" }

// Exhausted
{ allowed: false, remaining: 0, limit: 5, error: "quota_exhausted", resetDate: "..." }
```

## API Changes

| Endpoint | Change |
|----------|--------|
| `POST /api/ai` | Add `checkQuota("ai_chatbot")` at start; remove old IP-based rate limit |
| `POST /api/analyze-image` | Add `checkQuota("disease_diagnosis")` at start; remove old IP-based rate limit |
| `POST /api/knowledge-base` | **New** — receives `{ query, category }`, checks `knowledge_base` quota, filters `api/json-data/data.json`, returns results |
| `POST /api/check-quota` | **New** — read-only quota check (no increment) for frontend badge display |

### Quota-Exhausted Response

```json
HTTP 429
{
  "error": "quota_exhausted",
  "feature": "ai_chatbot",
  "message": "You have used all your free conversations for today.",
  "remaining": 0,
  "limit": 5,
  "resetDate": "2026-07-27T00:00:00Z",
  "isPremium": false
}
```

## Frontend

### Guest ID (`src/services/guestId.js`)

```js
function getGuestId() {
  let id = localStorage.getItem('hefno_guest_id');
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem('hefno_guest_id', id);
  }
  return id;
}
```

Attached to every fetch call via header: `X-Guest-Id: <uuid>`.

Fallback for environments without `crypto.randomUUID()`: use a manual
`xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx` pattern with `Math.random`.

### Hooks

**`useFeatureAccess(featureId)`**
```js
const { allowed, remaining, limit, isLoading, checkAccess } = useFeatureAccess("ai_chatbot");
// checkAccess() → POST /api/check-quota (read-only)
// checkAccess({ increment: true }) → on parent API (handled by the API itself)
```

**`useQuotaDisplay(featureId)`**
```js
const { text } = useQuotaDisplay("knowledge_base");
// "2 of 5 searches remaining this week"
// "Unlimited" for premium
```

### Components

**`QuotaModal.jsx`** — renders based on user type:

| User | Title | Message | Buttons |
|------|-------|---------|---------|
| Guest | "Free Usage Limit Reached" | "Create a free account to continue" | Sign In / Create Account / Cancel |
| Free | "Weekly Limit Reached" | "Upgrade to Premium for unlimited" | Upgrade Now / Maybe Later |
| Premium | never shown | — | — |

**`QuotaBadge.jsx`** — inline badge showing remaining quota.

### AuthContext Changes

Add to `src/context/AuthContext.jsx`:

```js
{
  isPremium: false,  // derived from userProfile.subscription?.plan !== 'free'
  subscription: null // future: { plan, status, periodEnd }
}
```

## Auth Flow: Permission Check

```
User clicks "Diagnose" button
  ↓
Frontend: POST /api/check-quota { featureId: "disease_diagnosis" }
  ↓
Server: checkQuota() — read only (incrementIfAllowed: false)
  ↓
Server: feature not public, user=guest, weeklyLimit=1, weeklyUsed=0
  ↓
Server: returns { allowed: true, remaining: 1 }
  ↓
Frontend: navigates to /diagnose
  ↓
User uploads image, clicks Analyze
  ↓
Frontend: POST /api/analyze-image { image, guestId }
  ↓
Server: checkQuota("disease_diagnosis", incrementIfAllowed: true)
  ↓
Server: weeklyUsed=0, limit=1 → weeklyUsed=1, return allowed
  ↓
Server: processes image with Gemini, returns diagnosis
```

### Cold Start Optimization

The `data.json` file (8458 lines) is loaded by `api/knowledge-base.js` on each
cold start. To mitigate this, use a module-level cache variable that persists
across invocations in the same V8 context:

```js
let dataCache = null;
async function loadData() {
  if (dataCache) return dataCache;
  dataCache = JSON.parse(fs.readFileSync('./json-data/data.json', 'utf-8'));
  return dataCache;
}
```

## Security

- All quota checks happen server-side. Frontend validation is UX only.
- Guest ID is validated as UUID v4 format on the server.
- Feature configs cached server-side with 60s TTL — cannot be manipulated by clients.
- Resets checked on every request (comparing dates) — no cron dependency.
- Redis for guest data has 7-day TTL, auto-cleanup.
- Old IP-based rate limits removed in favor of per-user/per-guest limits.

## Payment Preparation

The `subscriptions/{userId}` collection is prepared (not implemented):

```js
{
  plan: "free",            // free | premium_monthly | premium_yearly | student | enterprise
  status: "active",        // active | canceled | past_due
  currentPeriodStart: Timestamp,
  currentPeriodEnd: Timestamp,
  // Future: stripeCustomerId, stripeSubscriptionId, paymentMethod
}
```

When payment is implemented, changing a user's `plan` from `free` to any premium
value automatically grants unlimited access — no code changes needed.

## Files to Create/Modify

### New Files

| File | Purpose |
|------|---------|
| `api/_lib/checkQuota.js` | Centralized quota middleware |
| `api/_lib/loadFeatures.js` | Feature config loader with caching |
| `api/knowledge-base.js` | Knowledge Base search API with quota |
| `api/check-quota.js` | Lightweight read-only quota check |
| `src/services/guestId.js` | Guest UUID generation |
| `src/services/quotaService.js` | Client-side quota API calls |
| `src/hooks/useFeatureAccess.js` | Feature access hook |
| `src/hooks/useQuotaDisplay.js` | Quota display formatting hook |
| `src/component/QuotaModal.jsx` | Limit-reached modal |
| `src/component/QuotaBadge.jsx` | Remaining quota badge |
| `scripts/seed-features.js` | Seed Firestore with feature configs |

### Modified Files

| File | Change |
|------|--------|
| `api/ai.js` | Add `checkQuota("ai_chatbot")` at top |
| `api/analyze-image.js` | Add `checkQuota("disease_diagnosis")` at top |
| `src/context/AuthContext.jsx` | Add `isPremium`, `subscription` |
| `src/component/ChatWidget.jsx` | Use `useFeatureAccess` before showing chat |
| `src/pages/knowledge-layer.jsx` | Wrap with `useFeatureAccess` for KB sections |
| `src/pages/DiagnosePage.jsx` | Show `QuotaBadge`, handle quota on analysis |
| `src/component/knowledge.jsx` | Show `QuotaBadge`, wrap search with quota |

## Verification Checklist

- [ ] Weather, blog, articles, public pages work without login
- [ ] Chatbot: guest 5/day, free 5/day, premium unlimited
- [ ] Knowledge Base: guest 5/week, free 5/week, premium unlimited
- [ ] Disease Diagnosis: guest 1/week, free 1/week, premium unlimited
- [ ] Each feature has its own counter (using diagnosis doesn't reduce chatbot)
- [ ] Guest counters and auth counters are completely separate
- [ ] Daily reset works automatically (comparing dates)
- [ ] Weekly reset works automatically
- [ ] Remaining quota displayed to users via QuotaBadge
- [ ] Middleware validates every request
- [ ] Quota-exhausted modals show correct content per user type
- [ ] Premium users never see quota modals
- [ ] Guest ID is generated once and persisted in localStorage
- [ ] Server rejects invalid guest UUIDs

# Forgot Password — Design

**Date:** 2026-07-31
**Status:** Approved
**Stack:** React 19 (CRA), Firebase Auth (email/password only), Vercel serverless (Node), Redis (Upstash), Resend→Gmail email

## Overview

Add a complete, secure, production-ready forgot-password flow:

1. `/forgot-password` — user enters email → server generates a Firebase password-reset link and sends a branded Arabic email.
2. User clicks the link in the email → lands on `/reset-password?oobCode=...&mode=resetPassword`.
3. User sets a new password (strong validation, show/hide toggles) → Firebase confirms the reset → redirect to `/login`.

**Approach (chosen):** Firebase Admin generates the reset link server-side (`generatePasswordResetLink`), the email is sent through the existing Resend→Gmail infra with a fully branded RTL Arabic template, and the client completes the reset using Firebase Auth's official `confirmPasswordReset()`. This satisfies the "use Firebase's official flow" requirement while allowing a custom-branded email.

## Architecture

```
ForgotPasswordPage (/forgot-password)
  └─ POST /api/forgot-password  { email }
       ├─ Redis rate limit: forgot_cooldown:{email} (60s) + forgot_hour:{email} (5/hr, TTL 3600)
       ├─ admin.auth().generatePasswordResetLink(email, { url: 'https://hefnoplant.site/reset-password' })
       └─ sendEmail() via Resend → Gmail fallback (branded Arabic template)
       └─ Always returns generic success: "if an account exists, a link was sent"

ResetPasswordPage (/reset-password?oobCode=...&mode=resetPassword)
  ├─ verifyPasswordResetCode(auth, oobCode) on mount → invalid/expired state
  └─ confirmPasswordReset(auth, oobCode, newPassword)
       └─ success view → auto-redirect to /login after ~3s + manual button
```

## Backend — consolidated into `api/otp.js` (the auth-email module)

**Constraint:** Vercel Hobby plan allows 12 serverless functions and `vercel.json` already lists 12 function builds. Adding a new `api/forgot-password.js` build would exceed the limit. Instead the `/api/forgot-password` handler is added **inside the existing `api/otp.js`** (already the auth-email module, already has `sendEmail`, `buildOtpEmail`, Redis infra). Route `/api/forgot-password` → `api/otp.js` in `vercel.json` (no new build). Email template lives in a new pure CommonJS helper `api/_lib/resetEmail.js` (`buildForgotEmail`, `RESET_URL`) so it is unit-testable with `npx jest` without Vercel.

Dependencies (already installed in `api/`): `@upstash/redis`, `firebase-admin`, `nodemailer`, `resend`. `api/otp.js` imports `admin` from `./_lib/firebaseAdmin.js` (ESM default-imports the CJS module).

### Handler flow
1. `OPTIONS` → 204. Non-POST → 405.
2. Validate `email` (trim, `lowercase`, `VALID_EMAIL` regex) → 400 `{ success:false, message:'البريد الإلكتروني غير صالح' }`.
3. Redis rate limit:
   - `forgot_cooldown:{email}` TTL 60 → if remaining > 0, 429 `{ success:false, message:'انتظر X ثانية قبل طلب رابط جديد' }`.
   - `forgot_hour:{email}` counter, TTL 3600, `INCR` → if count > 5, 429 `{ success:false, message:'لقد تجاوزت الحد المسموح، حاول لاحقاً' }`.
4. Generate link via `admin.auth().generatePasswordResetLink(email, { url: RESET_URL, handleCodeInApp: false })` inside a try/catch — it throws for unknown emails; catch and swallow (no enumeration).
5. Send branded email via Resend→Gmail fallback (reuse the send pattern from `api/otp.js` / `api/contact.js`).
6. Always return `200 { success:true }` — never reveal whether the email exists.

### Email template
Reuse the `buildOtpEmail` design language from `api/otp.js` (Cairo font, `direction:rtl`, max-width 480px, logo `https://hefnoplant.site/images/logo.webp`, brand colors forest/emerald/gold). Contents:
- Greeting "مرحباً بك في Hefno-Plant"
- "إعادة تعيين كلمة المرور" button linking to the generated reset URL
- Plain-text fallback link (same URL)
- Expiry notice: link valid for ~1 hour
- Security notice: "إذا لم تطلب إعادة التعيين، تجاهل هذه الرسالة بأمان"

### Response codes
| Code | Meaning |
|---|---|
| 200 | Accepted (always, even if email unknown) |
| 400 | Invalid email format / missing email |
| 405 | Non-POST |
| 429 | Cooldown or hourly cap exceeded |

## Frontend

### `src/utils/passwordRules.js` (new)
Pure validator, reusable:
```js
validatePassword(password) → { valid, errors: { length, upper, lower, digit, special } }
```
Rules: min 8 chars, ≥1 uppercase, ≥1 lowercase, ≥1 digit, ≥1 special char.

### `src/component/PasswordInput.jsx` (new)
Reusable password field with show/hide toggle (Eye/EyeOff icons), label, error message, focus ring. Used by `ResetPasswordPage`.

### `src/pages/ForgotPasswordPage.jsx` (new)
Mirrors `LoginPage` design (champagne bg, animated card, forest/emerald + gold, Arabic RTL, `dark:` variants, framer-motion stagger/fadeUp, inline SVG icons).
- State: `email`, `error`, `loading`, `focusedField`, `success`, `resendCooldown`.
- Validation (client): required, valid email format, trim whitespace.
- On submit: `POST /api/forgot-password`. On 429, show message + start 60s resend cooldown (mirror SignUp pattern). On success: show generic success view — "إذا كان هناك حساب مرتبط بهذا البريد، سيصلك رابط إعادة تعيين كلمة المرور" + "العودة إلى تسجيل الدخول" link to `/login`.
- Disabled button + spinner during request.

### `src/pages/ResetPasswordPage.jsx` (new)
Same visual chrome as Login/SignUp.
- Reads `oobCode` and `mode` from URL search params via `useSearchParams`.
- On mount: `verifyPasswordResetCode(auth, oobCode)` → if it throws (`auth/invalid-action-code`, `auth/expired-action-code`) show invalid/expired-link state (message + "طلب رابط جديد" → `/forgot-password`).
- Form: New Password + Confirm Password, each with show/hide toggle.
- Real-time strong-password validation via `passwordRules.js`; confirm-match inline error.
- On submit: `confirmPasswordReset(auth, oobCode, password)` → success view → auto-redirect `/login` after ~3s + "الذهاب إلى تسجيل الدخول" button.
- No-cache: set `Cache-Control: no-store, no-cache` meta (small effect) to prevent caching the page.

### Routing — `src/App.js`
- Add lazy imports + routes inside `<Routes>`:
  - `/forgot-password` → `PublicRoute` → `ForgotPasswordPage`
  - `/reset-password` → `PublicRoute` → `ResetPasswordPage`
- `PublicRoute` bounces authenticated users to `/` (consistent with login/signup).

### `src/pages/LoginPage.jsx`
- Add "نسيت كلمة المرور؟" link in the form footer → `/forgot-password`.

### `src/utils/firebaseErrors.js`
- Add `auth/missing-email` and `auth/missing-password` Arabic messages (already has `auth/invalid-action-code` / `auth/expired-action-code`).

## API wiring

### `vercel.json`
- **No new build entry** (12-function Hobby limit). `api/otp.js` is already built.
- Add explicit route `/api/forgot-password` → `api/otp.js` before the generic `/api/([^/]+)` catch-all (mirroring the `/api/send-otp` route).

### `dev-server.js`
- Add `/api/forgot-password` to the OTP require block (route → `api/otp.js`).

## Security
- Generic success message always returned — no email-existence leak.
- No reset tokens stored in Firestore/Redis (oobCode lives only in Firebase's signed link).
- Redis rate limiting: 60s per-email cooldown + 5/hr cap.
- All links HTTPS; reset page sets no-cache; inputs trimmed + validated.
- Server never logs the reset link or oobCode.

## Error handling (user-facing, Arabic)
| Case | Message |
|---|---|
| Invalid email format | البريد الإلكتروني غير صالح |
| Cooldown active | انتظر X ثانية قبل طلب رابط جديد |
| Hourly cap | لقد تجاوزت الحد المسموح، حاول لاحقاً |
| Generic success | إذا كان هناك حساب مرتبط بهذا البريد، سيصلك رابط إعادة تعيين كلمة المرور |
| Invalid/expired reset link | رابط إعادة التعيين غير صالح أو منتهي الصلاحية |
| Weak password | inline rule errors |
| Confirm mismatch | كلمتا المرور غير متطابقتين |
| Network/server error | عبر getFirebaseErrorMessage + fallback 'حدث خطأ غير متوقع' |

## Testing
- **Unit (jest):** `passwordRules.js` validator (valid/invalid cases). Possibly a small rate-limit helper test.
- **API (curl):** generic 200 for known & unknown emails; 429 on cooldown and after 5/hr; 400 invalid email.
- **E2E manual:** request → receive email → click link → set new password → login with new password; also test invalid/expired oobCode, weak password, mismatched confirm, wrong-email generic message.

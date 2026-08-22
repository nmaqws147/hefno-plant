# Forgot Password Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a complete forgot-password flow (request page → branded Arabic email → reset page → Firebase `confirmPasswordReset`) to the HefnoPlant React + Firebase + Vercel app.

**Architecture:** `POST /api/forgot-password` (handled inside existing `api/otp.js` — the auth-email module — to respect Vercel's 12-function Hobby cap) validates the email, applies Redis rate limits (60s cooldown + 5/hr cap), calls Firebase Admin `generatePasswordResetLink`, and sends a branded RTL Arabic email via the existing Resend→Gmail infra. The client reset page reads the `oobCode` from the URL and completes the reset with Firebase Auth's official `verifyPasswordResetCode`/`confirmPasswordReset`.

**Tech Stack:** React 19 (CRA, react-scripts 5), React Router v7, Firebase Auth/Admin v12/v13, Tailwind v3.4, framer-motion, lucide-react, `@upstash/redis`, nodemailer, resend. Testing: jest 27 (react-scripts) for frontend, `npx jest` for API helpers.

## Global Constraints

- **Vercel Hobby = 12 serverless functions max.** `vercel.json` already lists 12 function builds. **Do NOT add a new `api/*.js` build entry.** The `/api/forgot-password` handler MUST live inside existing `api/otp.js`.
- API route module is ESM (`import`/`export default`); `api/_lib/*` helpers are CommonJS (`require`/`module.exports`) for `npx jest` compatibility.
- Email must be fully branded: Cairo font, `direction:rtl`, max-width 480px, logo `https://hefnoplant.site/images/logo.webp`, forest/emerald/gold colors, Arabic copy, plain-text fallback link, expiry + security notices.
- Server must **always** return generic `200 {success:true}` for existing AND unknown emails (no account enumeration). Never log the reset link or oobCode.
- Reset page must use Firebase official client APIs: `verifyPasswordResetCode`, `confirmPasswordReset`.
- Frontend pages: `bg-champagne dark:bg-[#111827]`, white/dark card, `rounded-3xl`, `h-2 w-full bg-gradient-to-l from-forest via-emerald-500 to-gold`, logo `src/images/logo-removebg-preview.webp`, framer-motion `stagger`/`fadeUp`, Arabic RTL, `dark:` variants. Copy is Arabic throughout.
- Password rules (shared): min 8 chars, ≥1 uppercase, ≥1 lowercase, ≥1 digit, ≥1 special char.
- No code comments unless required by existing file conventions.
- Test infra: frontend tests run with `CI=true npx react-scripts test --watchAll=false <path>` (must live under `src/`); API helper tests run with `npx jest api/_lib/...`. `react-scripts` test only matches files under `src/`.

---

### Task 1: `src/utils/passwordRules.js` + unit tests

**Files:**
- Create: `src/utils/passwordRules.js`
- Test: `src/utils/__tests__/passwordRules.test.js`

**Interfaces:**
- Produces: `validatePassword(password) → { valid: boolean, failed: string[] }` where `failed` is an array of rule keys not satisfied: `'length' | 'upper' | 'lower' | 'digit' | 'special'`.

- [ ] **Step 1: Write the failing test**

Create `src/utils/__tests__/passwordRules.test.js`:

```js
import { validatePassword } from '../passwordRules';

describe('validatePassword', () => {
  test('accepts a strong password', () => {
    const result = validatePassword('Abcdefg1!');
    expect(result.valid).toBe(true);
    expect(result.failed).toEqual([]);
  });

  test.each([
    ['too short', 'Ab1!'],
    ['no uppercase', 'abcdefg1!'],
    ['no lowercase', 'ABCDEFG1!'],
    ['no digit', 'Abcdefg!'],
    ['no special', 'Abcdefg1'],
    ['empty', ''],
  ])('rejects password missing requirement: %s', (_label, password) => {
    const result = validatePassword(password);
    expect(result.valid).toBe(false);
    expect(result.failed.length).toBeGreaterThan(0);
  });

  test('reports all failed rules', () => {
    const result = validatePassword('a');
    expect(result.failed.sort()).toEqual(['digit', 'length', 'special', 'upper'].sort());
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `CI=true npx react-scripts test --watchAll=false src/utils/__tests__/passwordRules.test.js`
Expected: FAIL — `Cannot find module '../passwordRules'`.

- [ ] **Step 3: Write minimal implementation**

Create `src/utils/passwordRules.js`:

```js
export const PASSWORD_RULES = [
  { key: 'length', label: '8 أحرف على الأقل', test: (p) => p.length >= 8 },
  { key: 'upper', label: 'حرف كبير واحد على الأقل', test: (p) => /[A-Z]/.test(p) },
  { key: 'lower', label: 'حرف صغير واحد على الأقل', test: (p) => /[a-z]/.test(p) },
  { key: 'digit', label: 'رقم واحد على الأقل', test: (p) => /\d/.test(p) },
  { key: 'special', label: 'رمز خاص واحد على الأقل', test: (p) => /[^A-Za-z0-9]/.test(p) },
];

export const validatePassword = (password) => {
  const value = password || '';
  const failed = PASSWORD_RULES.filter((rule) => !rule.test(value)).map((rule) => rule.key);
  return { valid: failed.length === 0, failed };
};
```

- [ ] **Step 4: Run test to verify it passes**

Run: `CI=true npx react-scripts test --watchAll=false src/utils/__tests__/passwordRules.test.js`
Expected: PASS — 3 tests.

- [ ] **Step 5: Commit**

```bash
git add src/utils/passwordRules.js src/utils/__tests__/passwordRules.test.js
git commit -m "feat: add shared password validation rules"
```

---

### Task 2: `api/_lib/resetEmail.js` branded email builder + tests

**Files:**
- Create: `api/_lib/resetEmail.js`
- Test: `api/_lib/__tests__/resetEmail.test.js`

**Interfaces:**
- Produces: `buildForgotEmail(resetLink) → string` (HTML), `RESET_URL = 'https://hefnoplant.site/reset-password'` (exported const).

**Note:** Do NOT reuse `otp.js`'s `buildOtpEmail` — that file is ESM; this helper must be CommonJS so `npx jest` can test it directly.

- [ ] **Step 1: Write the failing test**

Create `api/_lib/__tests__/resetEmail.test.js`:

```js
const { buildForgotEmail, RESET_URL } = require('../resetEmail');

describe('buildForgotEmail', () => {
  const LINK = `${RESET_URL}?mode=resetPassword&oobCode=abc123&apiKey=key&lang=ar`;

  test('exports RESET_URL as the reset page', () => {
    expect(RESET_URL).toBe('https://hefnoplant.site/reset-password');
  });

  test('renders a branded RTL Arabic layout', () => {
    const html = buildForgotEmail(LINK);
    expect(html).toContain('direction:rtl');
    expect(html).toContain('Cairo,sans-serif');
    expect(html).toContain('https://hefnoplant.site/images/logo.webp');
    expect(html).toContain('إعادة تعيين كلمة المرور');
    expect(html).toContain('مرحباً بك في Hefno-Plant');
  });

  test('embeds the reset link as a clickable button and plain-text fallback', () => {
    const html = buildForgotEmail(LINK);
    expect(html).toContain(`href="${LINK}"`);
    expect(html).toContain(LINK);
  });

  test('includes expiry and security notices', () => {
    const html = buildForgotEmail(LINK);
    expect(html).toContain('الرابط صالح لمدة ساعة واحدة');
    expect(html).toContain('إذا لم تطلب إعادة التعيين، تجاهل هذه الرسالة بأمان');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx jest api/_lib/__tests__/resetEmail.test.js`
Expected: FAIL — `Cannot find module '../resetEmail'`.

- [ ] **Step 3: Write minimal implementation**

Create `api/_lib/resetEmail.js`:

```js
const RESET_URL = 'https://hefnoplant.site/reset-password';

function buildForgotEmail(resetLink) {
  return `<div style="font-family:Cairo,sans-serif;direction:rtl;max-width:480px;margin:0 auto;padding:32px 24px;background:#f9fafb;border-radius:16px;">
    <div style="text-align:center;margin-bottom:24px;"><div style="background:#fff;border-radius:12px;padding:12px;display:inline-block;">
    <img src="https://hefnoplant.site/images/logo.webp" alt="Hefno-Plant" style="width:120px;height:auto;display:block"/></div></div>
    <h1 style="font-size:20px;color:#1e352f;text-align:center;margin:0 0 8px;">إعادة تعيين كلمة المرور</h1>
    <p style="font-size:14px;color:#6b7280;text-align:center;margin:0 0 24px;">مرحباً بك في Hefno-Plant</p>
    <div style="background:#fff;border-radius:12px;padding:24px;text-align:center;border:1px solid #e5e7eb;">
    <p style="font-size:13px;color:#6b7280;margin:0 0 16px;">اضغط على الزر أدناه لإعادة تعيين كلمة المرور</p>
    <a href="${resetLink}" style="display:inline-block;background:#059669;color:#ffffff;text-decoration:none;font-weight:700;padding:12px 32px;border-radius:12px;">إعادة تعيين كلمة المرور</a>
    <p style="font-size:12px;color:#9ca3af;margin:16px 0 0;">الرابط صالح لمدة ساعة واحدة</p></div>
    <p style="font-size:12px;color:#9ca3af;text-align:center;margin:16px 0 0;word-break:break-all;direction:ltr;">${resetLink}</p>
    <p style="font-size:12px;color:#9ca3af;text-align:center;margin:24px 0 0;">إذا لم تطلب إعادة التعيين، تجاهل هذه الرسالة بأمان.</p></div>`;
}

module.exports = { buildForgotEmail, RESET_URL };
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx jest api/_lib/__tests__/resetEmail.test.js`
Expected: PASS — 4 tests.

- [ ] **Step 5: Commit**

```bash
git add api/_lib/resetEmail.js api/_lib/__tests__/resetEmail.test.js
git commit -m "feat: add branded Arabic password reset email template"
```

---

### Task 3: `/api/forgot-password` handler inside `api/otp.js`

**Files:**
- Modify: `api/otp.js` (add `handleForgotPassword`, wire route)

**Interfaces:**
- Consumes: `buildForgotEmail`, `RESET_URL` from `./_lib/resetEmail.js`; `admin` from `./_lib/firebaseAdmin.js`.
- Produces: handler `POST /api/forgot-password`:
  - `400 { success:false, message:'البريد الإلكتروني غير صالح' }` — invalid email
  - `429 { success:false, message:'انتظر {n} ثانية قبل طلب رابط جديد' }` — 60s cooldown
  - `429 { success:false, message:'لقد تجاوزت الحد المسموح، حاول لاحقاً' }` — >5/hr
  - `200 { success:true }` — always for valid requests (even unknown email)
  - `405 { error:'Method Not Allowed' }` — non-POST
- Redis keys: `forgot_cooldown:{email}` (TTL 60), `forgot_hour:{email}` (INCR, TTL 3600).

- [ ] **Step 1: Add the import of the email builder and Firebase Admin**

In `api/otp.js`, after the existing `import` lines (keep the existing `Redis`, `nodemailer`, `Resend` imports untouched), add:

```js
import { buildForgotEmail, RESET_URL } from './_lib/resetEmail.js';
import firebaseAdmin from './_lib/firebaseAdmin.js';
```

`firebaseAdmin.js` is CommonJS (`module.exports = { init, verifyToken, isAdmin, admin, getDb }`). The **default import** (`import firebaseAdmin from ...`) is used, then access `firebaseAdmin.admin.auth()`, because default-import interop is the most robust across Vercel's `@vercel/node` bundler and Node ESM/CJS interop. The firebaseAdmin init happens lazily via `admin.apps`/`initializeApp` using env vars — same env the existing billing.js relies on.

- [ ] **Step 2: Add constants and the handler function**

After `buildOtpEmail` (before `handleSend`), add:

```js
const FORGOT_COOLDOWN_TTL = 60;
const FORGOT_HOURLY_TTL = 3600;
const FORGOT_HOURLY_LIMIT = 5;

async function handleForgotPassword(req, res) {
  const { email } = req.body;
  if (!email || !VALID_EMAIL.test(email)) {
    return res.status(400).json({ success: false, message: 'البريد الإلكتروني غير صالح' });
  }
  const normalizedEmail = email.toLowerCase().trim();

  const remaining = await redis.ttl(`forgot_cooldown:${normalizedEmail}`);
  if (remaining > 0) {
    return res.status(429).json({ success: false, message: `انتظر ${remaining} ثانية قبل طلب رابط جديد` });
  }

  const hourCount = await redis.incr(`forgot_hour:${normalizedEmail}`);
  if (hourCount === 1) await redis.expire(`forgot_hour:${normalizedEmail}`, FORGOT_HOURLY_TTL);
  if (hourCount > FORGOT_HOURLY_LIMIT) {
    return res.status(429).json({ success: false, message: 'لقد تجاوزت الحد المسموح، حاول لاحقاً' });
  }

  try {
    const resetLink = await firebaseAdmin.admin.auth().generatePasswordResetLink(normalizedEmail, {
      url: RESET_URL,
      handleCodeInApp: false,
    });
    await sendEmail(normalizedEmail, 'إعادة تعيين كلمة المرور - Hefno-Plant', buildForgotEmail(resetLink));
  } catch (err) {
    log('forgot_link_failed', { to: normalizedEmail, error: err.message });
  }

  await redis.set(`forgot_cooldown:${normalizedEmail}`, '1', { ex: FORGOT_COOLDOWN_TTL });
  return res.status(200).json({ success: true });
}
```

- [ ] **Step 3: Wire the route**

In the `handler` function's path branching, before the `if (path === '/api/send-otp' ...)` line, add:

```js
if (path === '/api/forgot-password') {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });
  return await handleForgotPassword(req, res);
}
```

- [ ] **Step 4: Verify the file bundles (syntax/import check)**

Note: `api/package.json` is `"type": "commonjs"` and `api/otp.js` uses ESM syntax, so plain `node api/otp.js` will fail locally. Vercel's `@vercel/node` builder uses esbuild, so verify with esbuild the same way:

Run: `npx esbuild api/otp.js --bundle --platform=node --format=cjs --external:firebase-admin --outfile=/tmp/opencode/otp_bundle_check.js`
Expected: `⚡ Done` with exit 0 (no import/syntax errors).

- [ ] **Step 5: Commit**

```bash
git add api/otp.js
git commit -m "feat: add forgot-password endpoint to api/otp.js"
```

---

### Task 4: Wire routes in `vercel.json` and `dev-server.js`

**Files:**
- Modify: `vercel.json` (routes array)
- Modify: `dev-server.js` (route block)

**Interfaces:**
- Produces: `POST https://hefnoplant.site/api/forgot-password` → handled by `api/otp.js`.

- [ ] **Step 1: Add explicit route in `vercel.json`**

In `vercel.json`, in the `routes` array, insert this entry immediately before the existing `{ "src": "/api/send-otp", "dest": "api/otp.js" }` block:

```json
{
  "src": "/api/forgot-password",
  "dest": "api/otp.js"
},
```

(No `builds` change — `api/otp.js` is already built. Ordering before the generic `/api/([^/]+)` catch-all ensures this route wins.)

- [ ] **Step 2: Add route in `dev-server.js`**

In `dev-server.js`, change the existing OTP route condition (line 55) to include the new path:

```js
if (path === '/api/send-otp' || path === '/api/verify-otp' || path === '/api/forgot-password') {
  const h = require('./api/otp');
  return h(req, wr);
}
```

- [ ] **Step 3: Verify JSON is valid**

Run: `node -e "const v = require('./vercel.json'); const r = v.routes.find(x => x.src === '/api/forgot-password'); if (!r) { console.error('route missing'); process.exit(1); } console.log(r);"`
Expected: prints `{ src: '/api/forgot-password', dest: 'api/otp.js' }`.

- [ ] **Step 4: Commit**

```bash
git add vercel.json dev-server.js
git commit -m "feat: route /api/forgot-password to otp handler"
```

---

### Task 5: `src/component/PasswordInput.jsx` reusable password field

**Files:**
- Create: `src/component/PasswordInput.jsx`

**Interfaces:**
- Produces: default-export `PasswordInput` with props `{ label, value, onChange, onFocus, onBlur, focused, error, placeholder, disabled }`; renders a password input with show/hide toggle (lucide `Eye`/`EyeOff`), inline `LockIcon`, and an optional error `<p>` under the field.

- [ ] **Step 1: Write the component**

Create `src/component/PasswordInput.jsx`:

```jsx
import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

const LockIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>
);

const PasswordInput = ({
  label,
  value,
  onChange,
  onFocus,
  onBlur,
  focused,
  error,
  placeholder = '••••••••',
  disabled = false,
}) => {
  const [visible, setVisible] = useState(false);

  return (
    <div className="relative">
      <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5 mr-1">
        {label}
      </label>
      <div className="relative">
        <div className={`absolute right-3.5 top-1/2 -translate-y-1/2 transition-colors duration-300 ${focused ? 'text-emerald-500' : 'text-[#8a8580] dark:text-gray-500'}`}>
          <LockIcon />
        </div>
        <input
          type={visible ? 'text' : 'password'}
          value={value}
          onChange={onChange}
          onFocus={onFocus}
          onBlur={onBlur}
          required
          disabled={disabled}
          className="w-full bg-forest/[0.03] dark:bg-gray-800 border border-forest/15 dark:border-gray-600 rounded-xl px-4 py-3.5 pr-11 pl-12 text-sm text-right text-gray-900 dark:text-gray-100 placeholder:text-[#8a8580]/60 dark:placeholder:text-gray-500 focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 focus:shadow-lg focus:shadow-emerald-500/10 outline-none transition-all duration-300 disabled:opacity-60"
          placeholder={placeholder}
        />
        <button
          type="button"
          tabIndex={-1}
          onClick={() => setVisible((v) => !v)}
          aria-label={visible ? 'إخفاء كلمة المرور' : 'إظهار كلمة المرور'}
          className={`absolute left-3.5 top-1/2 -translate-y-1/2 transition-colors duration-300 ${focused ? 'text-emerald-500' : 'text-[#8a8580] dark:text-gray-500'} hover:text-emerald-500`}
        >
          {visible ? <Eye size={18} /> : <EyeOff size={18} />}
        </button>
      </div>
      {error && <p className="mt-1.5 mr-1 text-xs text-red-500 dark:text-red-400">{error}</p>}
    </div>
  );
};

export default PasswordInput;
```

- [ ] **Step 2: Verify it builds**

Run: `DISABLE_ESLINT_PLUGIN=true CI=false npx react-scripts build 2>&1 | tail -5`
Expected: `Compiled successfully.` (full build also verifies later tasks are not yet wired; if build fails here, fix before continuing).

- [ ] **Step 3: Commit**

```bash
git add src/component/PasswordInput.jsx
git commit -m "feat: add reusable password input with visibility toggle"
```

---

### Task 6: `src/pages/ForgotPasswordPage.jsx`

**Files:**
- Create: `src/pages/ForgotPasswordPage.jsx`

**Interfaces:**
- Consumes: `/api/forgot-password` (POST `{ email }`), `SEO`, `logoImage`, framer-motion.
- Produces: default-export page with email form → generic success state; 60s resend cooldown on 429/success; "العودة إلى تسجيل الدخول" link; "العودة إلى الرئيسية" link.

- [ ] **Step 1: Write the page**

Create `src/pages/ForgotPasswordPage.jsx`:

```jsx
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import SEO from '../component/SEO';
import logoImage from '../images/logo-removebg-preview.webp';

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1, delayChildren: 0.2 } },
};

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } },
};

const MailIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="4" width="20" height="16" rx="2" />
    <path d="M22 4L12 13L2 4" />
  </svg>
);

const SpinnerIcon = () => (
  <svg className="animate-spin" width="18" height="18" viewBox="0 0 24 24" fill="none">
    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" opacity="0.25" />
    <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
  </svg>
);

const CheckIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [focusedField, setFocusedField] = useState(null);
  const [success, setSuccess] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  useEffect(() => {
    if (resendCooldown <= 0) return;
    const t = setTimeout(() => setResendCooldown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [resendCooldown]);

  const handleResend = async () => {
    if (resendCooldown > 0 || loading) return;
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() }),
      });
      const data = await res.json();
      if (!data.success) {
        setError(data.message || 'حدث خطأ غير متوقع');
        return;
      }
      setResendCooldown(60);
    } catch (_) {
      setError('حدث خطأ غير متوقع، حاول مرة أخرى');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!email.trim()) { setError('الرجاء إدخال البريد الإلكتروني'); return; }
    setLoading(true);
    try {
      const res = await fetch('/api/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() }),
      });
      const data = await res.json();
      if (!data.success) {
        setError(data.message || 'حدث خطأ غير متوقع');
        setResendCooldown(60);
        return;
      }
      setSuccess(true);
      setResendCooldown(60);
    } catch (_) {
      setError('حدث خطأ غير متوقع، حاول مرة أخرى');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-champagne dark:bg-[#111827] flex items-center justify-center px-4 py-8 sm:py-12 relative" dir="rtl">
      <SEO title="استعادة كلمة المرور" description="استعادة كلمة المرور لحسابك في Hefno-Plant" />

      <div className="absolute inset-0" style={{
        backgroundImage: 'radial-gradient(circle, rgba(30,53,47,0.06) 1px, transparent 1px)',
        backgroundSize: '40px 40px',
      }} />

      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-gradient-radial from-forest/10 via-transparent to-transparent blur-3xl pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-sm sm:max-w-md lg:max-w-lg relative z-10"
      >
        <div className="bg-white dark:bg-gray-900 rounded-3xl border border-forest/10 dark:border-gray-700 shadow-2xl shadow-forest/5 dark:shadow-black/30 overflow-hidden">
          <div className="h-2 w-full bg-gradient-to-l from-forest via-emerald-500 to-gold" />

          <div className="pt-10 pb-2 sm:pt-12 sm:pb-4 text-center">
            <img
              src={logoImage}
              alt="HEFNOPLANT"
              className="w-20 h-20 sm:w-24 sm:h-24 lg:w-28 lg:h-28 object-contain mx-auto"
            />
          </div>

          <div className="px-6 sm:px-8 pb-8 sm:pb-10 pt-4">
            <AnimatePresence mode="wait">
              {error && (
                <motion.div
                  key="error"
                  initial={{ opacity: 0, y: -10, height: 0 }}
                  animate={{ opacity: 1, y: 0, height: 'auto' }}
                  exit={{ opacity: 0, y: -10, height: 0 }}
                  transition={{ duration: 0.3 }}
                  className="mb-5 p-3 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-sm text-red-600 dark:text-red-400 text-center"
                >
                  {error}
                </motion.div>
              )}
            </AnimatePresence>

            {!success ? (
              <motion.form
                key="form"
                variants={stagger}
                initial="hidden"
                animate="visible"
                onSubmit={handleSubmit}
                className="space-y-5"
              >
                <motion.div variants={fadeUp}>
                  <h2 className="text-center text-base font-bold text-gray-900 dark:text-white mb-1">
                    نسيت كلمة المرور؟
                  </h2>
                  <p className="text-center text-xs text-[#8a8580] dark:text-gray-400 leading-relaxed">
                    أدخل بريدك الإلكتروني وسنرسل لك رابطاً لإعادة تعيين كلمة المرور
                  </p>
                </motion.div>

                <motion.div variants={fadeUp} className="relative">
                  <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5 mr-1">
                    البريد الإلكتروني
                  </label>
                  <div className="relative">
                    <div className={`absolute right-3.5 top-1/2 -translate-y-1/2 transition-colors duration-300 ${focusedField === 'email' ? 'text-emerald-500' : 'text-[#8a8580] dark:text-gray-500'}`}>
                      <MailIcon />
                    </div>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      onFocus={() => setFocusedField('email')}
                      onBlur={() => setFocusedField(null)}
                      required
                      disabled={loading}
                      className="w-full bg-forest/[0.03] dark:bg-gray-800 border border-forest/15 dark:border-gray-600 rounded-xl px-4 py-3.5 pr-11 text-sm text-right text-gray-900 dark:text-gray-100 placeholder:text-[#8a8580]/60 dark:placeholder:text-gray-500 focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 focus:shadow-lg focus:shadow-emerald-500/10 outline-none transition-all duration-300 disabled:opacity-60"
                      placeholder="your@email.com"
                    />
                  </div>
                </motion.div>

                <motion.div variants={fadeUp}>
                  <button
                    type="submit"
                    disabled={loading}
                    className="relative w-full py-3 rounded-xl bg-emerald-600 text-white text-sm font-bold shadow-lg shadow-emerald-600/20 dark:shadow-emerald-600/10 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-emerald-600/30 hover:scale-[1.01] active:scale-[0.98] transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed overflow-hidden group"
                  >
                    <span className={`inline-flex items-center justify-center gap-2 ${loading ? 'opacity-0' : 'opacity-100'} transition-opacity`}>
                      إرسال رابط إعادة التعيين
                    </span>
                    {loading && (
                      <span className="absolute inset-0 flex items-center justify-center gap-2">
                        <SpinnerIcon />
                        جاري الإرسال...
                      </span>
                    )}
                    <span className="absolute inset-0 rounded-xl bg-white/0 group-hover:bg-white/[0.06] transition-colors duration-300" />
                  </button>
                </motion.div>
              </motion.form>
            ) : (
              <motion.div
                key="success"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                className="text-center"
              >
                <div className="size-14 rounded-2xl bg-emerald-50 dark:bg-emerald-900/30 border-2 border-emerald-200 dark:border-emerald-800 grid place-items-center mx-auto mb-3">
                  <CheckIcon />
                </div>
                <h3 className="text-sm font-bold text-gray-900 dark:text-white">تم الإرسال</h3>
                <p className="text-xs text-[#8a8580] dark:text-gray-400 mt-1 px-2 leading-relaxed">
                  إذا كان هناك حساب مرتبط بهذا البريد، سيصلك رابط إعادة تعيين كلمة المرور
                </p>
                <Link
                  to="/login"
                  className="mt-5 inline-block text-xs text-emerald-600 dark:text-emerald-400 hover:underline transition-colors"
                >
                  العودة إلى تسجيل الدخول
                </Link>

                <button
                  type="button"
                  onClick={handleResend}
                  disabled={resendCooldown > 0 || loading}
                  className="mt-3 block w-full text-center text-xs text-[#8a8580] dark:text-gray-500 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors disabled:text-[#8a8580]/50 disabled:cursor-not-allowed"
                >
                  {resendCooldown > 0
                    ? `إعادة الإرسال بعد ${resendCooldown} ثانية`
                    : 'إعادة إرسال الرابط'}
                </button>
              </motion.div>
            )}

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.55, duration: 0.4 }}
              className="mt-6 text-center"
            >
              <Link to="/" className="text-xs text-[#8a8580] dark:text-gray-500 hover:text-gold transition-colors">
                &larr; العودة إلى الرئيسية
              </Link>
            </motion.div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default ForgotPasswordPage;
```

- [ ] **Step 2: Build check**

Run: `DISABLE_ESLINT_PLUGIN=true CI=false npx react-scripts build 2>&1 | tail -5`
Expected: `Compiled successfully.` (page not yet routed, so no runtime effect).

- [ ] **Step 3: Commit**

```bash
git add src/pages/ForgotPasswordPage.jsx
git commit -m "feat: add forgot password request page"
```

---

### Task 7: `src/pages/ResetPasswordPage.jsx`

**Files:**
- Create: `src/pages/ResetPasswordPage.jsx`

**Interfaces:**
- Consumes: `verifyPasswordResetCode`, `confirmPasswordReset` from `firebase/auth`; `validatePassword` from `../utils/passwordRules`; `PasswordInput` from `../component/PasswordInput`; `getFirebaseErrorMessage` from `../utils/firebaseErrors`; URL search params `oobCode`, `mode`.
- Produces: default-export page with states `verifying | invalid | ready | success`; on success auto-redirects to `/login` after ~3s.

- [ ] **Step 1: Write the page**

Create `src/pages/ResetPasswordPage.jsx`:

```jsx
import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { verifyPasswordResetCode, confirmPasswordReset } from 'firebase/auth';
import { auth } from '../firebase';
import { validatePassword, PASSWORD_RULES } from '../utils/passwordRules';
import { getFirebaseErrorMessage } from '../utils/firebaseErrors';
import SEO from '../component/SEO';
import PasswordInput from '../component/PasswordInput';
import logoImage from '../images/logo-removebg-preview.webp';

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } },
};

const SpinnerIcon = () => (
  <svg className="animate-spin" width="18" height="18" viewBox="0 0 24 24" fill="none">
    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" opacity="0.25" />
    <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
  </svg>
);

const CheckIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

const XIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

const ResetPasswordPage = () => {
  const [status, setStatus] = useState('verifying');
  const [newPassword, setNewPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [focusedField, setFocusedField] = useState(null);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const oobCode = searchParams.get('oobCode');
  const mode = searchParams.get('mode');

  useEffect(() => {
    const meta = document.createElement('meta');
    meta.setAttribute('http-equiv', 'Cache-Control');
    meta.setAttribute('content', 'no-store, no-cache, must-revalidate');
    document.head.appendChild(meta);
    return () => document.head.removeChild(meta);
  }, []);

  useEffect(() => {
    if (!oobCode || mode !== 'resetPassword') {
      setStatus('invalid');
      return;
    }
    let active = true;
    (async () => {
      try {
        await verifyPasswordResetCode(auth, oobCode);
        if (active) setStatus('ready');
      } catch (_) {
        if (active) setStatus('invalid');
      }
    })();
    return () => { active = false; };
  }, [oobCode, mode]);

  const passwordResult = validatePassword(newPassword);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!passwordResult.valid) { setError('يرجى استيفاء جميع شروط كلمة المرور'); return; }
    if (newPassword !== confirm) { setError('كلمتا المرور غير متطابقتين'); return; }
    setLoading(true);
    try {
      await confirmPasswordReset(auth, oobCode, newPassword);
      setStatus('success');
      setTimeout(() => navigate('/login'), 3000);
    } catch (err) {
      setError(getFirebaseErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-champagne dark:bg-[#111827] flex items-center justify-center px-4 py-8 sm:py-12 relative" dir="rtl">
      <SEO title="إعادة تعيين كلمة المرور" description="إعادة تعيين كلمة المرور في Hefno-Plant" noindex />

      <div className="absolute inset-0" style={{
        backgroundImage: 'radial-gradient(circle, rgba(30,53,47,0.06) 1px, transparent 1px)',
        backgroundSize: '40px 40px',
      }} />

      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-gradient-radial from-forest/10 via-transparent to-transparent blur-3xl pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-sm sm:max-w-md lg:max-w-lg relative z-10"
      >
        <div className="bg-white dark:bg-gray-900 rounded-3xl border border-forest/10 dark:border-gray-700 shadow-2xl shadow-forest/5 dark:shadow-black/30 overflow-hidden">
          <div className="h-2 w-full bg-gradient-to-l from-forest via-emerald-500 to-gold" />

          <div className="pt-10 pb-2 sm:pt-12 sm:pb-4 text-center">
            <img
              src={logoImage}
              alt="HEFNOPLANT"
              className="w-20 h-20 sm:w-24 sm:h-24 lg:w-28 lg:h-28 object-contain mx-auto"
            />
          </div>

          <div className="px-6 sm:px-8 pb-8 sm:pb-10 pt-4">
            <AnimatePresence mode="wait">
              {status === 'verifying' && (
                <motion.div key="verifying" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="py-10 text-center">
                  <SpinnerIcon />
                  <p className="mt-4 text-sm text-[#8a8580] dark:text-gray-400">جاري التحقق من الرابط...</p>
                </motion.div>
              )}

              {status === 'invalid' && (
                <motion.div key="invalid" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center">
                  <div className="size-14 rounded-2xl bg-red-50 dark:bg-red-900/30 border-2 border-red-200 dark:border-red-800 grid place-items-center mx-auto mb-3">
                    <XIcon />
                  </div>
                  <h3 className="text-sm font-bold text-gray-900 dark:text-white">رابط غير صالح</h3>
                  <p className="text-xs text-[#8a8580] dark:text-gray-400 mt-2 px-2 leading-relaxed">
                    رابط إعادة التعيين غير صالح أو منتهي الصلاحية
                  </p>
                  <Link
                    to="/forgot-password"
                    className="mt-5 inline-block text-xs text-emerald-600 dark:text-emerald-400 hover:underline transition-colors"
                  >
                    طلب رابط جديد
                  </Link>
                </motion.div>
              )}

              {status === 'success' && (
                <motion.div key="success" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center">
                  <div className="size-14 rounded-2xl bg-emerald-50 dark:bg-emerald-900/30 border-2 border-emerald-200 dark:border-emerald-800 grid place-items-center mx-auto mb-3">
                    <CheckIcon />
                  </div>
                  <h3 className="text-sm font-bold text-gray-900 dark:text-white">تم إعادة التعيين بنجاح</h3>
                  <p className="text-xs text-[#8a8580] dark:text-gray-400 mt-1 px-2">
                    جاري تحويلك إلى صفحة تسجيل الدخول...
                  </p>
                  <Link
                    to="/login"
                    className="mt-5 inline-block text-xs text-emerald-600 dark:text-emerald-400 hover:underline transition-colors"
                  >
                    الذهاب إلى تسجيل الدخول
                  </Link>
                </motion.div>
              )}

              {status === 'ready' && (
                <motion.form
                  key="form"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                  onSubmit={handleSubmit}
                  className="space-y-5"
                >
                  <motion.div variants={fadeUp}>
                    <h2 className="text-center text-base font-bold text-gray-900 dark:text-white mb-1">
                      إعادة تعيين كلمة المرور
                    </h2>
                    <p className="text-center text-xs text-[#8a8580] dark:text-gray-400 leading-relaxed">
                      اختر كلمة مرور جديدة قوية لحسابك
                    </p>
                  </motion.div>

                  <AnimatePresence>
                    {error && (
                      <motion.div
                        initial={{ opacity: 0, y: -10, height: 0 }}
                        animate={{ opacity: 1, y: 0, height: 'auto' }}
                        exit={{ opacity: 0, y: -10, height: 0 }}
                        transition={{ duration: 0.3 }}
                        className="p-3 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-sm text-red-600 dark:text-red-400 text-center"
                      >
                        {error}
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <motion.div variants={fadeUp}>
                    <PasswordInput
                      label="كلمة المرور الجديدة"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      onFocus={() => setFocusedField('newPassword')}
                      onBlur={() => setFocusedField(null)}
                      focused={focusedField === 'newPassword'}
                      disabled={loading}
                    />
                    <div className="mt-3 grid grid-cols-1 gap-1.5">
                      {PASSWORD_RULES.map((rule) => {
                        const passed = newPassword.length > 0 && !passwordResult.failed.includes(rule.key);
                        return (
                          <div key={rule.key} className="flex items-center gap-2">
                            <span className={`size-1.5 rounded-full ${passed ? 'bg-emerald-500' : 'bg-[#8a8580]/40 dark:bg-gray-600'}`} />
                            <span className={`text-[11px] ${passed ? 'text-emerald-600 dark:text-emerald-400' : 'text-[#8a8580] dark:text-gray-500'}`}>
                              {rule.label}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </motion.div>

                  <motion.div variants={fadeUp}>
                    <PasswordInput
                      label="تأكيد كلمة المرور"
                      value={confirm}
                      onChange={(e) => setConfirm(e.target.value)}
                      onFocus={() => setFocusedField('confirm')}
                      onBlur={() => setFocusedField(null)}
                      focused={focusedField === 'confirm'}
                      disabled={loading}
                    />
                    {confirm && confirm !== newPassword && (
                      <p className="mt-1.5 mr-1 text-xs text-red-500 dark:text-red-400">كلمتا المرور غير متطابقتين</p>
                    )}
                  </motion.div>

                  <motion.div variants={fadeUp}>
                    <button
                      type="submit"
                      disabled={loading}
                      className="relative w-full py-3 rounded-xl bg-emerald-600 text-white text-sm font-bold shadow-lg shadow-emerald-600/20 dark:shadow-emerald-600/10 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-emerald-600/30 hover:scale-[1.01] active:scale-[0.98] transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed overflow-hidden group"
                    >
                      <span className={`inline-flex items-center justify-center gap-2 ${loading ? 'opacity-0' : 'opacity-100'} transition-opacity`}>
                        إعادة تعيين كلمة المرور
                      </span>
                      {loading && (
                        <span className="absolute inset-0 flex items-center justify-center gap-2">
                          <SpinnerIcon />
                          جاري الحفظ...
                        </span>
                      )}
                      <span className="absolute inset-0 rounded-xl bg-white/0 group-hover:bg-white/[0.06] transition-colors duration-300" />
                    </button>
                  </motion.div>
                </motion.form>
              )}
            </AnimatePresence>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.55, duration: 0.4 }}
              className="mt-6 text-center"
            >
              <Link to="/" className="text-xs text-[#8a8580] dark:text-gray-500 hover:text-gold transition-colors">
                &larr; العودة إلى الرئيسية
              </Link>
            </motion.div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default ResetPasswordPage;
```

- [ ] **Step 2: Build check**

Run: `DISABLE_ESLINT_PLUGIN=true CI=false npx react-scripts build 2>&1 | tail -5`
Expected: `Compiled successfully.`

- [ ] **Step 3: Commit**

```bash
git add src/pages/ResetPasswordPage.jsx
git commit -m "feat: add password reset page with validation and confirm"
```

---

### Task 8: Wire routes in `src/App.js`, add LoginPage link, extend firebaseErrors

**Files:**
- Modify: `src/App.js` (lazy imports + routes)
- Modify: `src/pages/LoginPage.jsx` (forgot-password link)
- Modify: `src/utils/firebaseErrors.js` (missing-email/missing-password)

**Interfaces:**
- Produces: `/forgot-password` and `/reset-password` routes behind `PublicRoute`; LoginPage link to `/forgot-password`.

- [ ] **Step 1: Add lazy imports in `src/App.js`**

In `src/App.js`, after the `const SignUpPage = lazy(() => import('./pages/SignUpPage'));` line (line 75), add:

```js
const ForgotPasswordPage = lazy(() => import('./pages/ForgotPasswordPage'));
const ResetPasswordPage = lazy(() => import('./pages/ResetPasswordPage'));
```

- [ ] **Step 2: Add routes**

In the `<Routes>` block, immediately after the existing `/signup` route line (line 161), add:

```jsx
<Route path="/forgot-password" element={<PublicRoute><ForgotPasswordPage /></PublicRoute>} />
<Route path="/reset-password" element={<PublicRoute><ResetPasswordPage /></PublicRoute>} />
```

- [ ] **Step 3: Add forgot-password link in `src/pages/LoginPage.jsx`**

In `LoginPage.jsx`, after the password `motion.div` field block and before the submit-button `motion.div` (between the block ending at line 165 and the button at line 167), insert:

```jsx
<motion.div variants={fadeUp} className="text-left">
  <Link to="/forgot-password" className="text-xs text-emerald-600 dark:text-emerald-400 hover:underline transition-colors">
    نسيت كلمة المرور؟
  </Link>
</motion.div>
```

- [ ] **Step 4: Extend `src/utils/firebaseErrors.js`**

Add to the `errorMap` object (after the `auth/expired-action-code` line):

```js
'auth/missing-email': 'البريد الإلكتروني مطلوب',
'auth/missing-password': 'كلمة المرور مطلوبة',
```

- [ ] **Step 5: Build + test**

Run: `DISABLE_ESLINT_PLUGIN=true CI=false npx react-scripts build 2>&1 | tail -5` and `CI=true npx react-scripts test --watchAll=false src/utils/__tests__/passwordRules.test.js`
Expected: `Compiled successfully.` and `PASS`.

- [ ] **Step 6: Commit**

```bash
git add src/App.js src/pages/LoginPage.jsx src/utils/firebaseErrors.js
git commit -m "feat: route forgot/reset pages, add login link and auth error messages"
```

---

### Task 9: Deploy to Vercel and verify live

**Files:**
- None (deployment + verification)

**Interfaces:**
- Verifies: `/api/forgot-password` behavior end-to-end; new routes served.

- [ ] **Step 1: Build production bundle**

Run: `DISABLE_ESLINT_PLUGIN=true CI=false npx react-scripts build`
Expected: `Compiled successfully.` (generates `build/`).

- [ ] **Step 2: Deploy**

Run: `npx vercel deploy --prod --yes`
Expected: deployment URL, then production live at `https://hefnoplant.site`.

- [ ] **Step 3: Test unknown-email generic success**

Run:
```bash
curl -s -w "\nHTTP %{http_code}\n" -X POST https://hefnoplant.site/api/forgot-password \
  -H 'Content-Type: application/json' \
  -d '{"email":"nonexistent@example.com"}'
```
Expected: `{"success":true}` with HTTP 200 (unknown email must NOT leak existence).

- [ ] **Step 4: Test rate limiting**

Run the same curl immediately again (within 60s). Expected: HTTP 429 with `انتظر ... ثانية قبل طلب رابط جديد`.

- [ ] **Step 5: Test invalid email**

Run:
```bash
curl -s -w "\nHTTP %{http_code}\n" -X POST https://hefnoplant.site/api/forgot-password \
  -H 'Content-Type: application/json' \
  -d '{"email":"not-an-email"}'
```
Expected: HTTP 400 with `البريد الإلكتروني غير صالح`.

- [ ] **Step 6: Test full E2E with a real registered account**

Use an existing user email (e.g. the site owner's). Request `/api/forgot-password`, open the delivered email, click the branded reset link. Expected: lands on `https://hefnoplant.site/reset-password?oobCode=...&mode=resetPassword&apiKey=...&lang=ar`, shows the reset form, then:
- Enter matching strong passwords → success view → auto-redirect to `/login`.
- Log in with the new password → success.
- Log out, request another reset link, open the OLD link (or reuse a stale oobCode) → invalid/expired state with "طلب رابط جديد".

- [ ] **Step 7: Run full frontend test suite once more**

Run: `CI=true npx react-scripts test --watchAll=false`
Expected: all tests PASS.

---

## Self-Review Notes

- **12-function Vercel cap:** honored — no new `builds` entry; handler added to existing `api/otp.js`. `vercel.json` route maps `/api/forgot-password` → `api/otp.js`.
- **ESM/CJS:** `api/otp.js` stays ESM; new pure helper `api/_lib/resetEmail.js` is CommonJS for `npx jest` compatibility (verified the paymob tests use this same pattern).
- **Security:** generic 200 always; oobCode never logged; no-cache meta on reset page; rate limits 60s + 5/hr; `noindex` on reset page.
- **Branding:** reset email reuses logo + Cairo + rtl + brand colors; plain-text fallback link included.
- **Official Firebase flow:** client uses `verifyPasswordResetCode` + `confirmPasswordReset`; server uses Admin `generatePasswordResetLink`.
- **Type consistency:** `validatePassword` returns `{ valid, failed: string[] }`; `PASSWORD_RULES` exports `{ key, label, test }`; `PasswordInput` props match usage in `ResetPasswordPage`; `buildForgotEmail`/`RESET_URL` names match between Task 2 and Task 3.

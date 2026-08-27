# Optional Pricing Access + Public Route Protection

**Date:** 2026-08-27
**Status:** Approved

## Summary

Three coordinated changes to auth/routing/subscription flow:
1. Post-auth redirect to Pricing page (optional, skippable)
2. Centralized route protection (whitelist public routes)
3. Enhanced PricingPage with subscription-aware display

## Changes

### 1. Post-Auth Redirect
- **LoginPage**: After login, navigate to `/pricing` (was `/?redirect=...`)
- **SignUpPage**: After OTP verification + signup, navigate to `/pricing` (was `/subscription-offer`)
- **Delete** `SubscriptionOfferPage.jsx` and its route

### 2. Route Protection (AppRouteGuard)
- New component: `src/component/AppRouteGuard.jsx`
- Wraps entire `<Routes>` tree in `App.js`
- Public routes: `/`, `/blog`, `/blog/:slug`, `/login`, `/signup`, `/forgot-password`, `/reset-password`, `/pricing`, `/privacy`, `/terms`, `/about`
- All other routes require authentication
- Unauthenticated visitors → redirect to `/login?redirect=<path>`
- Keep `<ProtectedRoute adminOnly>` for `/admin-panel`

### 3. PricingPage Enhancement
- **Not logged in**: Show plans with "Sign Up"/"Login" CTAs
- **Free user**: Show plans, Free=disabled "current", paid=subscribe buttons
- **Active subscription**: Show current plan highlight, upgrade options
- **Expired subscription**: Show renewal options
- Add "Continue to Platform" button (visible when logged in)

### 4. Header Updates
- When NOT logged in: only show "الرئيسية" and "المقالات"
- When logged in: show all nav links

## Files
- Create: `src/component/AppRouteGuard.jsx`
- Modify: `src/App.js`, `src/pages/LoginPage.jsx`, `src/pages/SignUpPage.jsx`, `src/pages/PricingPage.jsx`, `src/component/header.jsx`
- Delete: `src/pages/SubscriptionOfferPage.jsx`

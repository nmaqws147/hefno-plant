// Single source of truth for displayed plan prices (EGP).
// Mirrors api/_lib/payments/prices.js — the backend always determines the
// actual charged amount; these values are for UI display only.
export const PLAN_PRICES = {
  premium: { monthly: 25, yearly: 250 },
  elite: { monthly: 50, yearly: 500 },
};

export const CURRENCY = 'EGP';

export const BILLING_CYCLE_LABELS = {
  monthly: 'شهري',
  yearly: 'سنوي',
};

export function getPlanPrice(planId, billingCycle) {
  return PLAN_PRICES[planId]?.[billingCycle] ?? 0;
}

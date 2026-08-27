const VALID_PLANS = ['premium', 'elite'];
const VALID_CYCLES = ['monthly', 'yearly'];

// Prices in EGP. Single source of truth for the payment system.
// Yearly = exactly 10 × monthly.
const PRICES_EGP = {
  premium: { monthly: 25, yearly: 250 },
  elite: { monthly: 50, yearly: 350 },
};

// Cents (Paymob amounts) derived from EGP values.
const PRICES = {
  premium: { monthly: 2500, yearly: 25000 },
  elite: { monthly: 5000, yearly: 35000 },
};

function getPriceEgp(plan, billingCycle) {
  const amount = PRICES_EGP[plan]?.[billingCycle];
  if (!amount) throw new Error(`Invalid plan/billingCycle: ${plan}/${billingCycle}`);
  return amount;
}

function getAmountCents(plan, billingCycle) {
  return getPriceEgp(plan, billingCycle) * 100;
}

function isValidPlan(plan) {
  return VALID_PLANS.includes(plan);
}

function isValidBillingCycle(billingCycle) {
  return VALID_CYCLES.includes(billingCycle);
}

module.exports = { PRICES, PRICES_EGP, getAmountCents, getPriceEgp, isValidPlan, isValidBillingCycle, VALID_PLANS, VALID_CYCLES };

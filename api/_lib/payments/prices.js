const PRICES = {
  premium: { monthly: 5000, yearly: 50000 },
  elite: { monthly: 8000, yearly: 80000 },
};

function getAmountCents(plan, billingCycle) {
  const amount = PRICES[plan]?.[billingCycle];
  if (!amount) throw new Error(`Invalid plan/billingCycle: ${plan}/${billingCycle}`);
  return amount;
}

module.exports = { PRICES, getAmountCents };

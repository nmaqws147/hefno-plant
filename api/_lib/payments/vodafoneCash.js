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

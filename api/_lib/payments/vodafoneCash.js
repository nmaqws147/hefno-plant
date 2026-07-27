const { registerProvider } = require('./provider');
const { getDb } = require('../firebaseAdmin');
const crypto = require('crypto');

const VC_NUMBER = () => process.env.VODAFONE_CASH_NUMBER || '01000000000';

function generateReference() {
  return 'VC-' + crypto.randomBytes(8).toString('hex').toUpperCase();
}

const CODES = {
  premium: { monthly: 50, yearly: 500 },
  elite: { monthly: 80, yearly: 800 },
};

const provider = {
  async createCheckoutSession({ plan, billingCycle, userId }) {
    const ref = generateReference();
    const amount = CODES[plan]?.[billingCycle] || 0;
    const now = new Date().toISOString();

    const db = getDb();
    await db.collection('vodafone_payments').doc(ref).set({
      userId,
      plan,
      billingCycle,
      amount,
      status: 'pending',
      createdAt: now,
      updatedAt: now,
    });

    return {
      sessionId: ref,
      sessionUrl: null,
      paymentReference: ref,
      amount,
      currency: 'EGP',
      instructions: `حول ${amount} جنيه إلى محفظة فودافون كاش على الرقم ${VC_NUMBER()} مع كتابة الكود: ${ref}`,
    };
  },

  async verifyPayment({ paymentId, data }) {
    const db = getDb();
    const snap = await db.collection('vodafone_payments').doc(paymentId).get();
    if (!snap.exists) return { verified: false, paymentDetails: null };
    const payment = snap.data();
    if (payment.status === 'verified') return { verified: false, paymentDetails: null };

    await db.collection('vodafone_payments').doc(paymentId).update({
      status: 'verified',
      verifiedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    return { verified: true, paymentDetails: payment };
  },

  async handleWebhook() {
    throw new Error('Vodafone Cash does not support webhooks yet');
  },
};

registerProvider('vodafone_cash', provider);
module.exports = { provider };

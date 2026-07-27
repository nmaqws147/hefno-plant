const { registerProvider } = require('./provider');
const { getDb } = require('../firebaseAdmin');
const crypto = require('crypto');

const REQUIRED_ENV_VARS = ['PAYMOB_API_KEY', 'PAYMOB_INTEGRATION_ID', 'PAYMOB_IFRAME_ID', 'PAYMOB_HMAC_SECRET', 'PAYMOB_MERCHANT_ID'];
for (const v of REQUIRED_ENV_VARS) {
  if (!process.env[v]) {
    console.warn(`Paymob: missing env var ${v} — provider will fail at runtime`);
  }
}

const PRICES = {
  premium: { monthly: 5000, yearly: 50000 },
  elite: { monthly: 8000, yearly: 80000 },
};

function getAmountCents(plan, billingCycle) {
  const amount = PRICES[plan]?.[billingCycle];
  if (!amount) throw new Error(`Invalid plan/billingCycle: ${plan}/${billingCycle}`);
  return amount;
}

const provider = {
  async createCheckoutSession({ plan, billingCycle, userId, customerEmail }) {
    try {
      const amountCents = getAmountCents(plan, billingCycle);

      const authRes = await fetch('https://accept.paymob.com/api/auth/tokens', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ api_key: process.env.PAYMOB_API_KEY }),
      });
      const authData = await authRes.json();
      if (!authRes.ok) {
        throw new Error(`Paymob auth failed: ${authData.message || authRes.statusText}`);
      }
      const authToken = authData.token;

      const orderRes = await fetch('https://accept.paymob.com/api/ecommerce/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          auth_token: authToken,
          delivery_needed: false,
          amount_cents: amountCents,
          currency: 'EGP',
          items: [],
        }),
      });
      const orderData = await orderRes.json();
      if (!orderRes.ok) {
        throw new Error(`Paymob order creation failed: ${orderData.message || orderRes.statusText}`);
      }

      const billingData = {
        apartment: 'N/A',
        email: customerEmail || 'N/A',
        floor: 'N/A',
        first_name: userId || 'N/A',
        street: 'N/A',
        building: 'N/A',
        phone_number: 'N/A',
        shipping_method: 'N/A',
        postal_code: 'N/A',
        city: 'N/A',
        country: 'N/A',
        last_name: 'N/A',
        state: 'N/A',
      };

      const paymentKeyRes = await fetch('https://accept.paymob.com/api/acceptance/payments_keys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          auth_token: authToken,
          amount_cents: amountCents,
          expiration: 3600,
          order_id: orderData.id,
          billing_data: billingData,
          currency: 'EGP',
          integration_id: parseInt(process.env.PAYMOB_INTEGRATION_ID),
          lock_order_when_paid: true,
        }),
      });
      const paymentKeyData = await paymentKeyRes.json();
      if (!paymentKeyRes.ok) {
        throw new Error(`Paymob payment key failed: ${paymentKeyData.message || paymentKeyRes.statusText}`);
      }

    const db = getDb();
    const orderId = String(orderData.id);
    await db.collection('payment_events').doc(orderId).set({
      event: 'checkout_created',
      userId,
      plan,
      billingCycle,
      orderId,
      amountCents,
      currency: 'EGP',
      timestamp: new Date().toISOString(),
    });

    const iframeUrl = `https://accept.paymob.com/api/acceptance/iframes/${process.env.PAYMOB_IFRAME_ID}?payment_token=${paymentKeyData.token}`;

    return {
      sessionId: orderId,
      sessionUrl: iframeUrl,
      paymentReference: orderId,
      amount: amountCents,
      currency: 'EGP',
    };
    } catch (err) {
      throw new Error(`Paymob createCheckoutSession failed: ${err.message}`);
    }
  },

  async handleWebhook(req) {
    try {
      const rawBody = req.rawBody || (typeof req.body === 'string' ? req.body : JSON.stringify(req.body));
      const body = typeof rawBody === 'string' ? JSON.parse(rawBody) : rawBody;

      const calculatedHmac = crypto.createHmac('sha512', process.env.PAYMOB_HMAC_SECRET)
        .update(JSON.stringify(body))
        .digest('hex');
      const receivedHmac = req.headers['hmac'];

      if (calculatedHmac !== receivedHmac) {
        return { event: 'invalid_hmac', data: null };
      }

      if (!body || !body.id || !body.order || !body.order.id) {
        return { event: 'invalid_payload', data: null };
      }

      if (body.merchant_id && String(body.merchant_id) !== String(process.env.PAYMOB_MERCHANT_ID)) {
        return { event: 'invalid_merchant', data: null };
      }

      if (body.integration_id && String(body.integration_id) !== String(process.env.PAYMOB_INTEGRATION_ID)) {
        return { event: 'invalid_integration', data: null };
      }

      if (!body.success || body.is_refund) {
        const transactionId = String(body.id);
        const db = getDb();
        await db.collection('payment_events').doc(transactionId).set({
          event: 'payment_failed',
          transactionId,
          orderId: String(body.order.id),
          amountCents: body.amount_cents,
          currency: body.currency,
          sourceType: body.source_data?.type,
          timestamp: new Date().toISOString(),
        });
        return { event: 'payment_failed', data: body };
      }

      const transactionId = String(body.id);
      const orderId = String(body.order.id);

      const db = getDb();
      const existingSnap = await db.collection('payment_events').doc(transactionId).get();
      if (existingSnap.exists) {
        return { event: 'duplicate', data: body };
      }

      const orderSnap = await db.collection('payment_events').doc(orderId).get();
      if (!orderSnap.exists) {
        return { event: 'order_not_found', data: body };
      }

      const orderData = orderSnap.data();

      if (body.amount_cents !== orderData.amountCents) {
        return { event: 'amount_mismatch', data: body };
      }

      if (body.currency !== orderData.currency) {
        return { event: 'currency_mismatch', data: body };
      }

      await db.collection('payment_events').doc(transactionId).set({
        event: 'checkout.session.completed',
        orderId,
        transactionId,
        userId: orderData.userId,
        plan: orderData.plan,
        billingCycle: orderData.billingCycle,
        amountCents: body.amount_cents,
        currency: body.currency,
        sourceType: body.source_data?.type,
        timestamp: new Date().toISOString(),
      });

      return {
        event: 'checkout.session.completed',
        data: {
          userId: orderData.userId,
          plan: orderData.plan,
          billingCycle: orderData.billingCycle,
          transactionId,
          orderId,
          amountCents: body.amount_cents,
          currency: body.currency,
        },
      };
    } catch (err) {
      console.error('Paymob webhook error:', err);
      return { event: 'invalid_payload', data: null };
    }
  },

  async verifyPayment({ paymentId, data }) {
    if (!paymentId) return { verified: false, paymentDetails: null };
    try {
      const db = getDb();
      const snap = await db.collection('payment_events').doc(String(paymentId)).get();
      if (!snap.exists) return { verified: false, paymentDetails: null };
      const payment = snap.data();
      if (payment.event === 'checkout.session.completed' || payment.event === 'subscription_activated') {
        return { verified: true, paymentDetails: payment };
      }
      return { verified: false, paymentDetails: null };
    } catch {
      return { verified: false, paymentDetails: null };
    }
  },
};

registerProvider('paymob', provider);
module.exports = { provider, PRICES };

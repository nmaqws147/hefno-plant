const { registerProvider } = require('./provider');
const { getDb } = require('../firebaseAdmin');
const { getAmountCents } = require('./prices');
const crypto = require('crypto');

const REQUIRED_ENV_VARS = ['PAYMOB_API_KEY', 'PAYMOB_INTEGRATION_ID', 'PAYMOB_IFRAME_ID', 'PAYMOB_HMAC_SECRET', 'PAYMOB_MERCHANT_ID'];
for (const v of REQUIRED_ENV_VARS) {
  if (!process.env[v]) {
    console.warn(`Paymob: missing env var ${v} — provider will fail at runtime`);
  }
}
if (!process.env.PAYMOB_WALLET_INTEGRATION_ID) {
  console.warn('Paymob: missing env var PAYMOB_WALLET_INTEGRATION_ID — Vodafone Cash / wallet payments will fail at runtime');
}

const PRICES = require('./prices').PRICES;

function getBaseUrl() {
  return process.env.PAYMOB_BASE_URL || 'https://accept.paymob.com';
}

const HMAC_FIELDS = [
  'amount_cents',
  'created_at',
  'currency',
  'error_occured',
  'has_parent_transaction',
  'id',
  'integration_id',
  'is_3d_secure',
  'is_auth',
  'is_capture',
  'is_refunded',
  'is_standalone_payment',
  'is_voided',
  'order.id',
  'owner',
  'pending',
  'source_data.pan',
  'source_data.sub_type',
  'source_data.type',
  'success',
];

function resolvePath(obj, path) {
  return path.split('.').reduce((acc, key) => (acc == null ? acc : acc[key]), obj);
}

function computeTransactionHmac(obj, secret) {
  const str = HMAC_FIELDS.map((field) => {
    const val = resolvePath(obj, field);
    if (val === undefined || val === null) return '';
    return String(val);
  }).join('');
  return crypto.createHmac('sha512', secret).update(str).digest('hex');
}

async function createOrderAndPaymentKey({ amountCents, integrationId, orderId, customerEmail, phoneNumber }) {
  const authRes = await fetch(`${getBaseUrl()}/api/auth/tokens`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ api_key: process.env.PAYMOB_API_KEY }),
  });
  const authData = await authRes.json();
  if (!authRes.ok) {
    throw new Error(`Paymob auth failed: ${authData.message || authRes.statusText}`);
  }
  const authToken = authData.token;

  let paymobOrderId = orderId;
  if (!paymobOrderId) {
    const orderRes = await fetch(`${getBaseUrl()}/api/ecommerce/orders`, {
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
    paymobOrderId = orderData.id;
  }

  const billingData = {
    apartment: 'N/A',
    email: customerEmail || 'N/A',
    floor: 'N/A',
    first_name: 'HefnoPlant',
    street: 'N/A',
    building: 'N/A',
    phone_number: phoneNumber || 'N/A',
    shipping_method: 'N/A',
    postal_code: 'N/A',
    city: 'N/A',
    country: 'N/A',
    last_name: 'User',
    state: 'N/A',
  };

  const paymentKeyRes = await fetch(`${getBaseUrl()}/api/acceptance/payment_keys`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      auth_token: authToken,
      amount_cents: amountCents,
      expiration: 3600,
      order_id: paymobOrderId,
      billing_data: billingData,
      currency: 'EGP',
      integration_id: parseInt(integrationId),
      lock_order_when_paid: true,
      redirect_url: process.env.PAYMOB_REDIRECT_URL || 'https://hefnoplant.site/pricing?success=true',
    }),
  });
  const paymentKeyData = await paymentKeyRes.json();
  if (!paymentKeyRes.ok) {
    throw new Error(`Paymob payment key failed: ${paymentKeyData.message || paymentKeyRes.statusText}`);
  }

  return { authToken, paymobOrderId, paymentToken: paymentKeyData.token, billingData };
}

const provider = {
  async createCheckoutSession({ plan, billingCycle, userId, customerEmail }) {
    try {
      const amountCents = getAmountCents(plan, billingCycle);

      const { paymobOrderId, paymentToken } = await createOrderAndPaymentKey({
        amountCents,
        integrationId: process.env.PAYMOB_INTEGRATION_ID,
        customerEmail,
      });

    const db = getDb();
    const orderId = String(paymobOrderId);
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

    const iframeUrl = `${getBaseUrl()}/api/acceptance/iframes/${process.env.PAYMOB_IFRAME_ID}?payment_token=${paymentToken}`;

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

  async createWalletSession({ plan, billingCycle, userId, customerEmail, phoneNumber }) {
    try {
      const amountCents = getAmountCents(plan, billingCycle);
      const walletIntegrationId = process.env.PAYMOB_WALLET_INTEGRATION_ID;
      if (!walletIntegrationId) {
        throw new Error('PAYMOB_WALLET_INTEGRATION_ID is not configured');
      }

      const { paymobOrderId, paymentToken } = await createOrderAndPaymentKey({
        amountCents,
        integrationId: walletIntegrationId,
        customerEmail,
        phoneNumber,
      });

      const payRes = await fetch(`${getBaseUrl()}/api/acceptance/payments/pay`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          source: {
            identifier: phoneNumber,
            subtype: 'WALLET',
          },
          payment_token: paymentToken,
        }),
      });
      const payData = await payRes.json();
      if (!payRes.ok) {
        throw new Error(`Paymob wallet payment failed: ${payData.message || payRes.statusText}`);
      }

      const db = getDb();
      const orderId = String(paymobOrderId);
      await db.collection('payment_events').doc(orderId).set({
        event: 'checkout_created',
        userId,
        plan,
        billingCycle,
        orderId,
        amountCents,
        currency: 'EGP',
        paymentMethod: 'vodafone_cash',
        phoneNumber,
        timestamp: new Date().toISOString(),
      });

      const redirectUrl = payData.redirect_url || payData.redirection_url || null;
      if (!redirectUrl) {
        throw new Error(`Paymob wallet payment returned no redirect URL: ${JSON.stringify(payData)}`);
      }

      return {
        sessionId: orderId,
        sessionUrl: redirectUrl,
        paymentReference: orderId,
        amount: amountCents,
        currency: 'EGP',
        paymentMethod: 'vodafone_cash',
      };
    } catch (err) {
      throw new Error(`Paymob createWalletSession failed: ${err.message}`);
    }
  },

  async handleWebhook(req) {
    try {
      const rawBody = req.rawBody || (typeof req.body === 'string' ? req.body : JSON.stringify(req.body));
      let parsed = {};
      try { parsed = typeof rawBody === 'string' ? JSON.parse(rawBody) : rawBody; } catch { parsed = {}; }
      const body = parsed.obj && typeof parsed.obj === 'object' ? parsed.obj : parsed;

      const url = req.url ? new URL(req.url, 'https://hefnoplant.site') : null;
      const receivedHmac = url?.searchParams.get('hmac') || req.headers['hmac'];
      const calculatedHmac = computeTransactionHmac(body, process.env.PAYMOB_HMAC_SECRET);

      if (!receivedHmac || calculatedHmac !== receivedHmac) {
        console.error('Paymob webhook: invalid_hmac', { receivedHmac, calculatedHmac, body: JSON.stringify(body) });
        return { event: 'invalid_hmac', data: null };
      }

      if (!body || !body.id || !body.order || !body.order.id) {
        console.error('Paymob webhook: invalid_payload', JSON.stringify(body));
        return { event: 'invalid_payload', data: null };
      }

      if (body.order.merchant?.id && String(body.order.merchant.id) !== String(process.env.PAYMOB_MERCHANT_ID)) {
        console.error('Paymob webhook: invalid_merchant', { received: body.order.merchant.id, expected: process.env.PAYMOB_MERCHANT_ID });
        return { event: 'invalid_merchant', data: null };
      }

      if (body.integration_id) {
        const validIntegrations = [process.env.PAYMOB_INTEGRATION_ID, process.env.PAYMOB_WALLET_INTEGRATION_ID]
          .filter(Boolean)
          .map((id) => String(id));
        if (!validIntegrations.includes(String(body.integration_id))) {
          console.error('Paymob webhook: invalid_integration', { received: body.integration_id, expected: validIntegrations });
          return { event: 'invalid_integration', data: null };
        }
      }

      if (!body.success || body.is_refunded || body.is_refund) {
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
        console.error('Paymob webhook: order_not_found', { orderId });
        return { event: 'order_not_found', data: body };
      }

      const orderData = orderSnap.data();

      if (body.amount_cents !== orderData.amountCents) {
        console.error('Paymob webhook: amount_mismatch', { received: body.amount_cents, expected: orderData.amountCents });
        return { event: 'amount_mismatch', data: body };
      }

      if (body.currency !== orderData.currency) {
        console.error('Paymob webhook: currency_mismatch', { received: body.currency, expected: orderData.currency });
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
module.exports = { provider, PRICES, computeTransactionHmac };

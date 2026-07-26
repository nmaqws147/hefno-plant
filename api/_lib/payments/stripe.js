const stripe = process.env.STRIPE_SECRET_KEY ? require('stripe')(process.env.STRIPE_SECRET_KEY) : null;
const { registerProvider } = require('./provider');

function getPriceId(plan, billingCycle) {
  const key = `STRIPE_PRICE_${plan.toUpperCase()}_${billingCycle.toUpperCase()}`;
  const id = process.env[key];
  if (!id) throw new Error(`Stripe price ID not configured: ${key}`);
  return id;
}

const provider = {
  async createCheckoutSession({ plan, billingCycle, userId, customerEmail }) {
    if (!stripe) throw new Error('Stripe not configured — missing STRIPE_SECRET_KEY');
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [{ price: getPriceId(plan, billingCycle), quantity: 1 }],
      customer_email: customerEmail || undefined,
      client_reference_id: userId,
      metadata: { plan, billingCycle, userId },
      success_url: `${process.env.FRONTEND_URL || 'https://hefnoplant.site'}/pricing?success=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.FRONTEND_URL || 'https://hefnoplant.site'}/pricing?canceled=true`,
      subscription_data: {
        metadata: { userId, plan, billingCycle },
      },
    });
    return { sessionId: session.id, sessionUrl: session.url };
  },

  async verifyPayment({ paymentId }) {
    if (!stripe) return { verified: false, paymentDetails: null };
    try {
      const session = await stripe.checkout.sessions.retrieve(paymentId);
      return {
        verified: session.payment_status === 'paid',
        paymentDetails: {
          amount: session.amount_total,
          currency: session.currency,
          customerEmail: session.customer_details?.email,
          status: session.payment_status,
          metadata: session.metadata,
        },
      };
    } catch {
      return { verified: false, paymentDetails: null };
    }
  },

  async handleWebhook(req) {
    const sig = req.headers['stripe-signature'];
    let event;
    try {
      event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
    } catch (err) {
      throw new Error(`Webhook signature verification failed: ${err.message}`);
    }
    return { event: event.type, data: event.data.object };
  },
};

registerProvider('stripe', provider);
module.exports = provider;

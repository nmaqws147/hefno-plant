const { handleWebhook } = require('./_lib/payments/provider');
const { activateSubscription, cancelAtPeriodEnd, logEvent } = require('./_lib/subscriptionService');
require('./_lib/payments/stripe');

const { getDb } = require('./_lib/firebaseAdmin');

module.exports = async (req, res) => {
  try {
    const { event, data } = await handleWebhook({ provider: 'stripe', req });

    const db = getDb();

    switch (event) {
      case 'checkout.session.completed': {
        const session = data;
        if (session.payment_status === 'paid' && session.metadata?.userId) {
          const userId = session.metadata.userId;
          const plan = session.metadata.plan;
          const billingCycle = session.metadata.billingCycle;
          await activateSubscription({ userId, plan, billingCycle, paymentProvider: 'stripe' });
          await db.collection('subscriptions').doc(userId).update({
            stripeCustomerId: session.customer,
            stripeSubscriptionId: session.subscription,
          });
        }
        break;
      }
      case 'invoice.payment_succeeded': {
        const invoice = data;
        if (invoice.subscription && invoice.metadata?.userId) {
          const userId = invoice.metadata.userId;
          const sub = await db.collection('subscriptions').doc(userId).get();
          if (sub.exists) {
            const subData = sub.data();
            if (subData.plan && subData.billingCycle) {
              await activateSubscription({ userId, plan: subData.plan, billingCycle: subData.billingCycle, paymentProvider: 'stripe' });
              await logEvent({ userId, event: 'subscription_renewed', plan: subData.plan, billingCycle: subData.billingCycle, paymentProvider: 'stripe' });
            }
          }
        }
        break;
      }
      case 'customer.subscription.deleted': {
        const subscription = data;
        if (subscription.metadata?.userId) {
          await cancelAtPeriodEnd(subscription.metadata.userId);
        }
        break;
      }
    }

    return res.status(200).json({ received: true });
  } catch (err) {
    console.error('Webhook error:', err);
    return res.status(400).json({ error: err.message });
  }
};

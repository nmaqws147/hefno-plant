const { verifyToken, isAdmin } = require('../_lib/firebaseAdmin');
const { verifyPayment } = require('../_lib/payments/provider');
const { activateSubscription, logEvent } = require('../_lib/subscriptionService');
require('../_lib/payments/vodafoneCash');

module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) return res.status(401).json({ error: 'Authentication required' });
    if (!(await isAdmin(authHeader.slice(7)))) return res.status(403).json({ error: 'Admin access required' });

    const { paymentReference } = req.body;
    if (!paymentReference) return res.status(400).json({ error: 'paymentReference required' });

    const result = await verifyPayment({ provider: 'vodafone_cash', paymentId: paymentReference, data: {} });
    if (!result.verified) return res.status(400).json({ error: 'Payment not found or already verified' });

    const details = result.paymentDetails;
    const sub = await activateSubscription({
      userId: details.userId,
      plan: details.plan,
      billingCycle: details.billingCycle,
      paymentProvider: 'vodafone_cash',
    });

    return res.status(200).json({ success: true, subscription: sub });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

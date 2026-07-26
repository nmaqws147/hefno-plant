const { verifyToken } = require('./_lib/firebaseAdmin');
const { createPayment } = require('./_lib/payments/provider');
require('./_lib/payments/stripe');

module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    const decoded = await verifyToken(authHeader.slice(7));
    const userId = decoded.uid;
    const { plan, billingCycle } = req.body;

    if (!plan || !['premium', 'elite'].includes(plan)) {
      return res.status(400).json({ error: 'Invalid plan' });
    }
    if (!billingCycle || !['monthly', 'yearly'].includes(billingCycle)) {
      return res.status(400).json({ error: 'Invalid billing cycle' });
    }

    const result = await createPayment({
      provider: 'stripe',
      plan,
      billingCycle,
      userId,
      customerEmail: decoded.firebase?.identities?.email?.[0] || req.body.email,
    });

    return res.status(200).json(result);
  } catch (err) {
    console.error('Create checkout session error:', err);
    return res.status(500).json({ error: err.message || 'Failed to create checkout session' });
  }
};

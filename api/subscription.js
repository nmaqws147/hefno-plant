const { verifyToken } = require('./_lib/firebaseAdmin');
const { getSubscription } = require('./_lib/subscriptionService');

module.exports = async (req, res) => {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) return res.status(401).json({ error: 'Authentication required' });
    const decoded = await verifyToken(authHeader.slice(7));

    const sub = await getSubscription(decoded.uid);
    if (!sub) return res.status(200).json({ plan: 'free', status: 'active', packageQuotas: null });
    return res.status(200).json(sub);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

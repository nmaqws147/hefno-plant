const { checkQuota } = require('./_lib/checkQuota');

module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { featureId, increment } = req.body;
  if (!featureId) return res.status(400).json({ error: 'featureId required' });

  const authHeader = req.headers.authorization;
  let userId = null;
  let isPremium = false;

  if (authHeader?.startsWith('Bearer ')) {
    try {
      const { verifyToken } = require('./_lib/firebaseAdmin');
      const decoded = await verifyToken(authHeader.slice(7));
      userId = decoded.uid;
    } catch (_) {}
  }

  const guestId = req.headers['x-guest-id'] || null;

  const result = await checkQuota({ featureId, userId, guestId, isPremium, incrementIfAllowed: !!increment });
  return res.status(result.allowed ? 200 : 429).json(result);
};

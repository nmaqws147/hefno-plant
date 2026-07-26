const { getDb, verifyToken } = require('./_lib/firebaseAdmin');
const { expireSubscription } = require('./_lib/subscriptionService');

module.exports = async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (authHeader?.startsWith('Bearer ')) {
      const decoded = await verifyToken(authHeader.slice(7));
      if (decoded?.uid) {
        const db2 = getDb();
        const userSnap = await db2.collection('users').doc(decoded.uid).get();
        const role = userSnap.data()?.role;
        if (role !== 'admin' && role !== 'super_admin') {
          return res.status(403).json({ error: 'Admin access required' });
        }
      }
    } else if (process.env.CRON_SECRET && req.headers['x-cron-secret'] !== process.env.CRON_SECRET) {
      return res.status(401).json({ error: 'Authentication required' });
    } else if (!process.env.CRON_SECRET && !authHeader?.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const db = getDb();
    const now = new Date();
    let count = 0;

    const expired = await db.collection('subscriptions')
      .where('status', '==', 'active')
      .where('expirationDate', '<', now)
      .get();

    for (const doc of expired.docs) {
      await expireSubscription(doc.id);
      count++;
    }

    const cancelledExpired = await db.collection('subscriptions')
      .where('status', '==', 'cancelled')
      .where('expirationDate', '<', now)
      .get();

    for (const doc of cancelledExpired.docs) {
      await expireSubscription(doc.id);
      count++;
    }

    return res.status(200).json({ expired: count });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

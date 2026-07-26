const { getDb } = require('./_lib/firebaseAdmin');
const { expireSubscription } = require('./_lib/subscriptionService');

module.exports = async (req, res) => {
  try {
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

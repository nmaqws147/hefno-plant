const path = require('path');
const fs = require('fs');
const { checkQuota } = require('./_lib/checkQuota');

let dataCache = null;
function loadData() {
  if (dataCache) return dataCache;
  dataCache = JSON.parse(fs.readFileSync(path.join(__dirname, 'json-data', 'data.json'), 'utf-8'));
  return dataCache;
}

module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { query } = req.body;
  if (!query || typeof query !== 'string' || !query.trim()) {
    return res.status(400).json({ error: 'Query is required' });
  }

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

  const quota = await checkQuota({
    featureId: 'knowledge_base',
    userId,
    guestId,
    isPremium,
    incrementIfAllowed: true,
  });

  if (!quota.allowed) {
    return res.status(429).json({
      error: quota.error,
      remaining: 0,
      limit: quota.limit,
      results: [],
    });
  }

  const data = loadData();
  const q = query.trim().toLowerCase();
  const results = data.filter(item => {
    const text = [
      item.name, item.scientific_name, item.description,
      item.symptoms, item.treatment, item.category, item.type,
      item.host_crops, item.conditions, item.prevention,
    ].filter(Boolean).join(' ').toLowerCase();
    return text.includes(q);
  }).slice(0, 20);

  res.json({
    allowed: true,
    remaining: quota.remaining,
    limit: quota.limit,
    count: results.length,
    results,
  });
};

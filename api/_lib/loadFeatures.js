const { db } = require('./firebaseAdmin');

let cache = null;
let cacheTime = 0;
const CACHE_TTL = 60000;

async function loadFeature(featureId) {
  const now = Date.now();
  if (cache && now - cacheTime < CACHE_TTL && cache[featureId]) {
    return cache[featureId];
  }
  const doc = await db.collection('features').doc(featureId).get();
  if (!doc.exists) return null;
  const feature = { id: doc.id, ...doc.data() };
  if (!cache) cache = {};
  cache[featureId] = feature;
  cacheTime = now;
  return feature;
}

async function loadAllFeatures() {
  const now = Date.now();
  if (cache && now - cacheTime < CACHE_TTL) return cache;
  const snapshot = await db.collection('features').get();
  cache = {};
  snapshot.forEach(doc => { cache[doc.id] = { id: doc.id, ...doc.data() }; });
  cacheTime = now;
  return cache;
}

function clearCache() { cache = null; cacheTime = 0; }

module.exports = { loadFeature, loadAllFeatures, clearCache };
const admin = require('firebase-admin');

function init() {
  if (admin.apps.length) return admin;

  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY
    ? process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n')
    : undefined;

  if (!projectId || !clientEmail || !privateKey) {
    console.warn('Firebase Admin: missing credentials — admin features disabled');
    return null;
  }

  admin.initializeApp({
    credential: admin.credential.cert({
      projectId,
      clientEmail,
      privateKey,
    }),
    databaseURL: `https://${projectId}.firebaseio.com`,
  });

  return admin;
}

async function verifyToken(token) {
  const fb = init();
  if (!fb) throw new Error('Firebase Admin not initialized');
  try {
    const decoded = await fb.auth().verifyIdToken(token);
    return decoded;
  } catch (err) {
    throw new Error('Invalid token: ' + err.message);
  }
}

async function isAdmin(token) {
  const fb = init();
  if (!fb) return false;
  try {
    const decoded = await verifyToken(token);
    const db = fb.firestore();
    const doc = await db.collection('users').doc(decoded.uid).get();
    if (!doc.exists) return false;
    return doc.data().role === 'admin' || doc.data().role === 'super_admin';
  } catch {
    return false;
  }
}

module.exports = { init, verifyToken, isAdmin, admin };

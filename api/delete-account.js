import { verifyToken, getDb } from './_lib/firebaseAdmin.js';
import { getAuth } from 'firebase-admin/auth';

export default async function handler(req, res) {
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, message: 'غير مصرح' });
    }

    const token = authHeader.split('Bearer ')[1];
    const decoded = await verifyToken(token);
    const uid = decoded.uid;
    const db = getDb();

    const batch = db.batch();

    batch.delete(db.collection('users').doc(uid));
    batch.delete(db.collection('subscriptions').doc(uid));

    const usageSnap = await db.collection('usage').doc(uid).collection('features').get();
    usageSnap.docs.forEach((doc) => batch.delete(doc.ref));
    batch.delete(db.collection('usage').doc(uid));

    await batch.commit();

    await getAuth().deleteUser(uid);

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('delete-account error:', error);
    return res.status(500).json({ success: false, message: 'حدث خطأ أثناء حذف الحساب' });
  }
}

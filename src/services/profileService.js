import { doc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';

const PROTECTED_FIELDS = ['uid', 'email', 'createdAt', 'provider', 'role'];

export const getProfile = async (uid) => {
  const snap = await getDoc(doc(db, 'users', uid));
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() };
};

export const updateProfile = async (uid, data) => {
  const safe = { ...data };
  for (const field of PROTECTED_FIELDS) {
    delete safe[field];
  }
  safe.updatedAt = serverTimestamp();
  await updateDoc(doc(db, 'users', uid), safe);
};
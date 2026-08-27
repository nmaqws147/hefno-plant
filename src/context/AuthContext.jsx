import { createContext, useContext, useEffect, useState, useMemo, useCallback } from 'react';
import { onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from 'firebase/auth';
import { doc, setDoc, updateDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../firebase';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [subscription, setSubscription] = useState(null);
  const [loading, setLoading] = useState(true);

  const isPremium = useMemo(() => {
    return subscription?.status === 'active' && subscription?.plan === 'premium';
  }, [subscription]);

  const isElite = useMemo(() => {
    return subscription?.status === 'active' && subscription?.plan === 'elite';
  }, [subscription]);

  const refreshSubscription = useCallback(async () => {
    if (!user) return;
    try {
      const { getSubscription } = await import('../services/subscriptionService');
      const sub = await getSubscription();
      setSubscription(sub);
    } catch {
      setSubscription(null);
    }
  }, [user]);

  useEffect(() => {
    const unsubAuth = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);

      if (firebaseUser) {
        const [userSnap, subSnap] = await Promise.all([
          getDoc(doc(db, 'users', firebaseUser.uid)).catch(() => null),
          getDoc(doc(db, 'subscriptions', firebaseUser.uid)).catch(() => null),
        ]);
        if (userSnap?.exists && userSnap.exists()) {
          setUserProfile(userSnap.data());
        } else {
          setUserProfile({ role: 'user', uid: firebaseUser.uid });
        }
        setSubscription(subSnap?.exists && subSnap.exists() ? subSnap.data() : null);
      } else {
        setUserProfile(null);
        setSubscription(null);
      }

      setLoading(false);
    });

    return () => unsubAuth();
  }, []);

  const role = userProfile?.role || 'user';
  const isAdmin = role === 'admin';

  const login = async (email, password) => {
    const cred = await signInWithEmailAndPassword(auth, email, password);
    const userRef = doc(db, 'users', cred.user.uid);
    await updateDoc(userRef, { lastLoginAt: serverTimestamp() }).catch(() => {});
    const [userSnap, subSnap] = await Promise.all([
      getDoc(userRef).catch(() => null),
      getDoc(doc(db, 'subscriptions', cred.user.uid)).catch(() => null),
    ]);
    if (userSnap?.exists && userSnap.exists()) setUserProfile(userSnap.data());
    setSubscription(subSnap?.exists && subSnap.exists() ? subSnap.data() : null);
    return cred;
  };

  const signup = async (email, password, fullName, phoneNumber, specialization) => {
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    const now = serverTimestamp();
    const userData = {
      uid: cred.user.uid,
      fullName,
      email: email.toLowerCase().trim(),
      phoneNumber: phoneNumber || '',
      specialization: specialization || '',
      profileImage: null,
      provider: 'email',
      role: 'user',
      status: 'active',
      emailVerified: false,
      onboardingCompleted: false,
      createdAt: now,
      updatedAt: now,
      lastLoginAt: now,
    };
    await setDoc(doc(db, 'users', cred.user.uid), userData);
    setUserProfile(userData);
    setSubscription(null);
    return cred;
  };

  const logout = () => {
    setUserProfile(null);
    setSubscription(null);
    return signOut(auth);
  };

  return (
    <AuthContext.Provider value={{ user, userProfile, role, isAdmin, loading, login, signup, logout, isPremium, isElite, subscription, refreshSubscription }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

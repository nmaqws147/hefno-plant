import { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from 'firebase/auth';
import { doc, setDoc, updateDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../firebase';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let unsubProfile = null;

    const unsubAuth = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);

      if (firebaseUser) {
        try {
          const docSnap = await getDoc(doc(db, 'users', firebaseUser.uid));
          if (docSnap.exists()) {
            setUserProfile(docSnap.data());
          } else {
            setUserProfile({ role: 'user', uid: firebaseUser.uid });
          }
        } catch {
          setUserProfile({ role: 'user', uid: firebaseUser.uid });
        }
      } else {
        setUserProfile(null);
      }

      setLoading(false);
    });

    return () => {
      unsubAuth();
      if (unsubProfile) unsubProfile();
    };
  }, []);

  const role = userProfile?.role || 'user';
  const isAdmin = role === 'admin';

  const login = async (email, password) => {
    const cred = await signInWithEmailAndPassword(auth, email, password);
    const userRef = doc(db, 'users', cred.user.uid);
    await updateDoc(userRef, { lastLoginAt: serverTimestamp() }).catch(() => {});
    const docSnap = await getDoc(userRef);
    if (docSnap.exists()) setUserProfile(docSnap.data());
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
      createdAt: now,
      updatedAt: now,
      lastLoginAt: now,
    };
    await setDoc(doc(db, 'users', cred.user.uid), userData);
    setUserProfile(userData);
    return cred;
  };

  const logout = () => {
    setUserProfile(null);
    return signOut(auth);
  };

  return (
    <AuthContext.Provider value={{ user, userProfile, role, isAdmin, loading, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

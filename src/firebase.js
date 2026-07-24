import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyCURFXkspCxhvYWj66r4fFldTyBgFqxEdI",
  authDomain: "hefno-plant.firebaseapp.com",
  projectId: "hefno-plant",
  storageBucket: "hefno-plant.firebasestorage.app",
  messagingSenderId: "570609602809",
  appId: "1:570609602809:web:87d30e5a935c3fd3ba1228",
  measurementId: "G-KF3WT6D1CJ"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export default app;

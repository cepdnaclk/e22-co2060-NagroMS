// ============================================================
// frontend/src/utils/firebase.js — merged conflict resolution
// ============================================================

import { initializeApp } from 'firebase/app';
import { getFirestore, enableIndexedDbPersistence } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  FacebookAuthProvider,
  sendPasswordResetEmail,
  signOut,
} from 'firebase/auth';

// Use env vars when available (keeps CI/local differences flexible)
const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

// Enable offline persistence where supported
if (typeof window !== 'undefined') {
  enableIndexedDbPersistence(db).catch((err) => {
    if (err.code === 'failed-precondition') {
      console.warn('Persistence failed (multiple tabs open)');
    } else if (err.code === 'unimplemented') {
      console.warn('Persistence not supported by browser');
    }
  });
}

const googleProvider = new GoogleAuthProvider();
const facebookProvider = new FacebookAuthProvider();
const API = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Helper — generate a fake email for phone/NIC-only users
function generateFakeEmail(formData) {
  if (formData.email && formData.email.trim() !== '') return formData.email.trim();
  if (formData.phone && formData.phone.trim() !== '') {
    const cleaned = formData.phone.replace(/\D/g, '');
    return `phone_${cleaned}@nagroms.local`;
  }
  if (formData.nic && formData.nic.trim() !== '') {
    const cleaned = formData.nic.replace(/\s/g, '').toLowerCase();
    return `nic_${cleaned}@nagroms.local`;
  }
  throw new Error('Please provide email, phone or NIC to register.');
}

// Register (supports email, phone, NIC)
export async function registerWithEmail(formData) {
  const emailForAuth = generateFakeEmail(formData);
  const credential = await createUserWithEmailAndPassword(auth, emailForAuth, formData.password);
  const idToken = await credential.user.getIdToken();

 
  const res = await fetch(`${API}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ idToken, ...formData, emailForAuth }),
  });
  const data = await res.json();
 

  if (!res.ok) {
    await credential.user.delete();
    throw new Error(data.message || 'Registration failed');
  }

  localStorage.setItem('nagroms_token', idToken);
  localStorage.setItem('userRoles', JSON.stringify(data.user.roles));
  localStorage.setItem('userEmail', emailForAuth);
  if (data.user.fullName) localStorage.setItem('userName', data.user.fullName);
  if (data.user.businessName) localStorage.setItem('businessName', data.user.businessName);
  return data;
}

// Login with email
export async function loginWithEmail(email, password) {
  const credential = await signInWithEmailAndPassword(auth, email, password);
  const idToken = await credential.user.getIdToken();

  const res = await fetch(`${API}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ idToken }),
  });
  const data = await res.json();

  if (!res.ok) throw new Error(data.message || 'Login failed');

  localStorage.setItem('nagroms_token', idToken);
  localStorage.setItem('userRoles', JSON.stringify(data.user.roles));
  localStorage.setItem('userEmail', email);
  if (data.user.fullName) localStorage.setItem('userName', data.user.fullName);
  if (data.user.businessName) localStorage.setItem('businessName', data.user.businessName);

  return data;
}

// Google login
export async function loginWithGoogle() {
  const credential = await signInWithPopup(auth, googleProvider);
  const idToken = await credential.user.getIdToken();

  const res = await fetch(`${API}/auth/social-login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ idToken }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Google login failed');

  localStorage.setItem('nagroms_token', idToken);
  localStorage.setItem('userRoles', JSON.stringify(data.user.roles));
  localStorage.setItem('userEmail', data.user.email);
  return data;
}

// Facebook login
export async function loginWithFacebook() {
  const credential = await signInWithPopup(auth, facebookProvider);
  const idToken = await credential.user.getIdToken();

  const res = await fetch(`${API}/auth/social-login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ idToken }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Facebook login failed');

  localStorage.setItem('nagroms_token', idToken);
  localStorage.setItem('userRoles', JSON.stringify(data.user.roles));
  localStorage.setItem('userEmail', data.user.email);
  return data;
}

// Forgot password (send reset email)
export async function forgotPassword(email) {
  await sendPasswordResetEmail(auth, email);
  return { success: true };
}

export async function logout() {
  await signOut(auth);
  localStorage.removeItem('nagroms_token');
  localStorage.removeItem('nagroms_uid');
  localStorage.removeItem('userRoles');
  localStorage.removeItem('userEmail');
  localStorage.removeItem('userName');
  localStorage.removeItem('businessName');
  localStorage.removeItem('serviceProviderType');
}

export default app;

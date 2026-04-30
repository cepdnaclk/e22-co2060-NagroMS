// ============================================================
// frontend/src/utils/firebase.js
// ============================================================

import { initializeApp } from 'firebase/app';
import { getFirestore, enableIndexedDbPersistence } from 'firebase/firestore';
import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  FacebookAuthProvider,
  signInWithPopup,
  signOut,
} from 'firebase/auth';

// ── Your Firebase config (keep your existing values) ────────
const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

// Enable offline persistence
if (typeof window !== 'undefined') {
  enableIndexedDbPersistence(db).catch((err) => {
    if (err.code === 'failed-precondition') {
      console.warn('Persistence failed (multiple tabs open)');
    } else if (err.code === 'unimplemented') {
      console.warn('Persistence not supported by browser');
    }
  });
}

const BACKEND = process.env.REACT_APP_BACKEND_URL || 'http://localhost:5000';
const API = `${BACKEND}/api`;

// ============================================================
// LOGIN WITH EMAIL
// ============================================================
export async function loginWithEmail(email, password) {
  // Step 1: Firebase Auth
  const userCredential = await signInWithEmailAndPassword(auth, email, password);
  const idToken = await userCredential.user.getIdToken();

  // Step 2: Backend verifies token + returns role & dashboardRoute
  const res = await fetch(`${API}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ idToken }),
  });

  const data = await res.json();

  if (!res.ok || !data.success) {
    throw new Error(data.message || 'Login failed.');
  }

  // Set persistence
  localStorage.setItem('nagroms_token', idToken);
  localStorage.setItem('userRoles', JSON.stringify(data.user.roles));
  localStorage.setItem('userEmail', email);

  return data; // { success, user, dashboardRoute }
}

// ============================================================
// REGISTER WITH EMAIL
// ============================================================
export async function registerWithEmail(formData) {
  const usingPhone = !formData.email;
  const emailForAuth = formData.email
    ? formData.email
    : `${formData.phone.replace(/\s+/g, '')}@nagro.lk`;
  const password = formData.password || 'TemporaryPassword123!';

  let credential;
  try {
    // Step 1: Firebase Auth — create user
    credential = await createUserWithEmailAndPassword(auth, emailForAuth, password);
  } catch (firebaseErr) {
    // Give a clear, specific message based on what was entered
    if (firebaseErr.code === 'auth/email-already-in-use') {
      if (usingPhone) {
        throw Object.assign(
          new Error(`This phone number (${formData.phone}) is already registered. Please use a different phone number or sign in.`),
          { code: 'auth/email-already-in-use' }
        );
      } else {
        throw Object.assign(
          new Error(`This email address (${formData.email}) is already registered. Please use a different email or sign in.`),
          { code: 'auth/email-already-in-use' }
        );
      }
    }
    throw firebaseErr;
  }

  const idToken = await credential.user.getIdToken();

  let res;
  let data;
  try {
    // Step 2: Send to backend
    res = await fetch(`${API}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        idToken,
        ...formData,
        emailForAuth,
      }),
    });
    
    data = await res.json();
  } catch (err) {
    // Network error (e.g., Failed to fetch) or invalid JSON
    await credential.user.delete();
    throw new Error('Network error: Could not connect to the server.');
  }

  if (!res.ok) {
    await credential.user.delete(); // cleanup Firebase if backend fails
    throw new Error(data?.message || 'Registration failed');
  }

  localStorage.setItem('nagroms_token', idToken);
  localStorage.setItem('userRoles', JSON.stringify(data.user.roles));
  localStorage.setItem('userEmail', emailForAuth);

  return data;
}

// ============================================================
// GOOGLE LOGIN
// ============================================================
export async function loginWithGoogle() {
  const provider = new GoogleAuthProvider();
  const userCredential = await signInWithPopup(auth, provider);
  const idToken = await userCredential.user.getIdToken();

  const res = await fetch(`${BACKEND}/api/auth/social-login`, {
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

// ============================================================
// FACEBOOK LOGIN
// ============================================================
export async function loginWithFacebook() {
  const provider = new FacebookAuthProvider();
  const userCredential = await signInWithPopup(auth, provider);
  const idToken = await userCredential.user.getIdToken();

  const res = await fetch(`${BACKEND}/api/auth/social-login`, {
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

export async function logout() {
  await signOut(auth);
  localStorage.removeItem('nagroms_token');
  localStorage.removeItem('userRoles');
  localStorage.removeItem('userEmail');
}

export default app;

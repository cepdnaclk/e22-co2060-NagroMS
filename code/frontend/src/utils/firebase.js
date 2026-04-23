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
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: "nagromsnew.firebaseapp.com",
  projectId: "nagromsnew",
  storageBucket: "nagromsnew.firebasestorage.app",
  messagingSenderId: "28463182267",
  appId: "1:28463182267:web:b76a1f04988a35f3ce149e"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

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

// ============================================================
// LOGIN WITH EMAIL
// Step 1: Firebase Auth login → get idToken
// Step 2: Send idToken to backend → get role + dashboardRoute
// ============================================================
export async function loginWithEmail(email, password) {
  // Step 1: Firebase Auth
  const userCredential = await signInWithEmailAndPassword(auth, email, password);
  const idToken = await userCredential.user.getIdToken();

  // Step 2: Backend verifies token + returns role & dashboardRoute
  const res = await fetch(`${BACKEND}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ idToken }),
  });

  const data = await res.json();

  if (!res.ok || !data.success) {
    // If backend says "Profile not found. Please register."
    throw new Error(data.message || 'Login failed.');
  }

  // data.dashboardRoute = "farmer-dashboard" | "expert-dashboard" | etc.
  return data; // { success, user, dashboardRoute }
}

// ============================================================
// REGISTER WITH EMAIL
// Step 1: Firebase Auth createUser → get idToken
// Step 2: Send idToken + form data to backend → saves to Firestore
// ============================================================
export async function registerWithEmail(formData) {
  const emailForAuth = formData.email || `${formData.phone.replace(/\s+/g, '')}@nagro.lk`;

  // Send to backend — include the emailForAuth so backend stores it
  const res = await fetch(`${API}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      idToken,
      ...formData,
      emailForAuth, // backend saves this as the login email
    }),
  });
  const data = await res.json();

  if (!res.ok) {
    await credential.user.delete(); // cleanup Firebase if backend fails
    throw new Error(data.message || 'Registration failed');
  }

  localStorage.setItem('nagroms_token', idToken);
  localStorage.setItem('userRoles', JSON.stringify(data.user.roles));
  localStorage.setItem('userEmail', emailForAuth);

  return data;
}

// ================================================================
// FUNCTION 2 — Login with email
// ================================================================
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
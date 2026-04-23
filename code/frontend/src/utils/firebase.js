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
  appId: process.env.REACT_APP_FIREBASE_APP_ID,
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

  // Step 1: Pre-check availability with backend to give precise error
  const checkRes = await fetch(`${BACKEND}/api/auth/check-availability`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: formData.email, // only check user's actual email, if provided
      phone: formData.phone,
      nic: formData.nic,
    }),
  });
  
  const checkData = await checkRes.json();
  if (!checkRes.ok || !checkData.success) {
    throw new Error(checkData.message || 'Registration failed due to existing data.');
  }

  // Step 2: Create user in Firebase Auth
  const userCredential = await createUserWithEmailAndPassword(
    auth,
    emailForAuth,
    formData.password
  );
  const idToken = await userCredential.user.getIdToken();

  try {
    // Step 3: Save to Firestore via backend
    const res = await fetch(`${BACKEND}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        idToken,
        roles: formData.roles,
        accountType: formData.accountType,
        fullName: formData.fullName,
        nic: formData.nic,
        district: formData.district,
        phone: formData.phone,
        email: formData.email,
        businessName: formData.businessName,
        businessRegistrationNumber: formData.businessRegistrationNumber,
        contactPersonName: formData.contactPersonName,
      }),
    });

    const data = await res.json();

    if (!res.ok || !data.success) {
      throw new Error(data.message || 'Registration failed.');
    }

    return data;
  } catch (error) {
    // Delete the Auth user if Firestore save failed (including network errors)
    // so they can try again cleanly
    await userCredential.user.delete();
    throw error;
  }
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
  if (!res.ok || !data.success) throw new Error(data.message || 'Google login failed.');
  return data; // { success, user, dashboardRoute, isNewUser }
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
  if (!res.ok || !data.success) throw new Error(data.message || 'Facebook login failed.');
  return data;
}

export async function logout() {
  await signOut(auth);
}

export { auth, db };
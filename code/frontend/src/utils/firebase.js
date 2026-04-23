// ================================================================
// src/utils/firebase.js
// ================================================================

import { initializeApp } from "firebase/app";
import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  FacebookAuthProvider,
  sendPasswordResetEmail,
  signOut,
} from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBXHf7t9L_NFwR-eM9YN_0_Vcf4EfX4e9I",
  authDomain: "nagromsnew.firebaseapp.com",
  projectId: "nagromsnew",
  storageBucket: "nagromsnew.firebasestorage.app",
  messagingSenderId: "28463182267",
  appId:             "1:28463182267:web:b76a1f04988a35f3ce149e"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db   = getFirestore(app);

const googleProvider   = new GoogleAuthProvider();
const facebookProvider = new FacebookAuthProvider();
const API = "http://localhost:5000/api";

// ================================================================
// HELPER — generate a fake email for users without email
// Firebase Auth requires an email, so we create one from phone/NIC
// e.g. phone: 0771234567 → phone_0771234567@nagroms.local
//      NIC:   200012345678 → nic_200012345678@nagroms.local
// ================================================================
function generateFakeEmail(formData) {
  if (formData.email && formData.email.trim() !== '') {
    return formData.email.trim();
  }
  if (formData.phone && formData.phone.trim() !== '') {
    const cleaned = formData.phone.replace(/\D/g, '');
    return `phone_${cleaned}@nagroms.local`;
  }
  if (formData.nic && formData.nic.trim() !== '') {
    const cleaned = formData.nic.replace(/\s/g, '').toLowerCase();
    return `nic_${cleaned}@nagroms.local`;
  }
  throw new Error('Please provide at least an email, phone number, or NIC to register.');
}

// ================================================================
// FUNCTION 1 — Register
// Works with email, phone-only, or NIC-only users
// ================================================================
export async function registerWithEmail(formData) {
  // Generate email (real or fake) for Firebase Auth
  const emailForAuth = generateFakeEmail(formData);

  // Create Firebase Auth account
  const credential = await createUserWithEmailAndPassword(
    auth, emailForAuth, formData.password
  );

  const idToken = await credential.user.getIdToken();

  // Send to backend — include the emailForAuth so backend stores it
  const res = await fetch(`${API}/auth/register`, {
    method:  'POST',
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
  localStorage.setItem('userRoles',     JSON.stringify(data.user.roles));
  localStorage.setItem('userEmail',     emailForAuth);

  return data;
}

// ================================================================
// FUNCTION 2 — Login with email
// ================================================================
export async function loginWithEmail(email, password) {
  const credential = await signInWithEmailAndPassword(auth, email, password);
  const idToken    = await credential.user.getIdToken();

  const res  = await fetch(`${API}/auth/login`, {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ idToken }),
  });
  const data = await res.json();

  if (!res.ok) throw new Error(data.message || 'Login failed');

  localStorage.setItem('nagroms_token', idToken);
  localStorage.setItem('userRoles',     JSON.stringify(data.user.roles));
  localStorage.setItem('userEmail',     email);

  return data;
}

// ================================================================
// FUNCTION 3 — Google login
// ================================================================
export async function loginWithGoogle() {
  const credential = await signInWithPopup(auth, googleProvider);
  const idToken    = await credential.user.getIdToken();

  const res  = await fetch(`${API}/auth/social-login`, {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ idToken }),
  });
  const data = await res.json();

  if (!res.ok) throw new Error(data.message || 'Google login failed');

  localStorage.setItem('nagroms_token', idToken);
  localStorage.setItem('userRoles',     JSON.stringify(data.user.roles));
  localStorage.setItem('userEmail',     data.user.email);

  return data;
}

// ================================================================
// FUNCTION 4 — Facebook login
// ================================================================
export async function loginWithFacebook() {
  const credential = await signInWithPopup(auth, facebookProvider);
  const idToken    = await credential.user.getIdToken();

  const res  = await fetch(`${API}/auth/social-login`, {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ idToken }),
  });
  const data = await res.json();

  if (!res.ok) throw new Error(data.message || 'Facebook login failed');

  localStorage.setItem('nagroms_token', idToken);
  localStorage.setItem('userRoles',     JSON.stringify(data.user.roles));
  localStorage.setItem('userEmail',     data.user.email);

  return data;
}

// ================================================================
// FUNCTION 5 — Forgot password
// ================================================================
export async function forgotPassword(email) {
  await sendPasswordResetEmail(auth, email);
  return { success: true };
}

// ================================================================
// FUNCTION 6 — Logout
// ================================================================
export async function logout() {
  await signOut(auth);
  localStorage.removeItem('nagroms_token');
  localStorage.removeItem('userRoles');
  localStorage.removeItem('userEmail');
}

export default app;
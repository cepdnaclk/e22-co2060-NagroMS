import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: "nagromsnew.firebaseapp.com",
  projectId: "nagromsnew",
  storageBucket: "nagromsnew.firebasestorage.app",
  messagingSenderId: "28463182267",
  appId: "1:28463182267:web:b76a1f04988a35f3ce149e"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Export services
export const auth = getAuth(app);
export const db = getFirestore(app);
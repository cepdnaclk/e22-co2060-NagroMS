import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyAYbskUuo_Iy1DljdoHxmk3qKCbLzmE5To",
  authDomain: "nagromsnew.firebaseapp.com",
  projectId: "nagromsnew.firebasestorage.app",
  storageBucket: "nagromsnew.firebasestorage.app",
  messagingSenderId: "28463182267",
  appId: "1:28463182267:web:b76a1f04988a35f3ce149e"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
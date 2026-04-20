// ============================================================
// NagroMS — config/firebase.js
// Initialize Firebase Admin SDK using environment variables
// ============================================================

const admin = require('firebase-admin');

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId:    process.env.FIREBASE_PROJECT_ID,
      privateKeyId: process.env.FIREBASE_PRIVATE_KEY_ID,
      // The private key is stored in .env with \n escaped — restore actual newlines
      privateKey:   process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      clientEmail:  process.env.FIREBASE_CLIENT_EMAIL,
      clientId:     process.env.FIREBASE_CLIENT_ID,
      authUri:      process.env.FIREBASE_AUTH_URI,
      tokenUri:     process.env.FIREBASE_TOKEN_URI,
    }),
  });
}

const db   = admin.firestore();
const auth = admin.auth();

module.exports = { admin, db, auth };

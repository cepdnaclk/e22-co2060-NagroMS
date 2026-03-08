// ============================================================
// NagroMS — config/firebase.js
// Firebase Admin SDK initialisation using .env variables
// (avoids committing serviceAccountKey.json to git)
// ============================================================

const admin = require('firebase-admin');

const serviceAccount = {
  type: 'service_account',
  project_id: process.env.FIREBASE_PROJECT_ID,
  private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
  private_key: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  client_email: process.env.FIREBASE_CLIENT_EMAIL,
  client_id: process.env.FIREBASE_CLIENT_ID,
  auth_uri: process.env.FIREBASE_AUTH_URI,
  token_uri: process.env.FIREBASE_TOKEN_URI,
};

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
  console.log('✅ Firebase Admin SDK initialised');
}

const auth = admin.auth();
const db = admin.firestore();
const adminApp = admin;

module.exports = { admin: adminApp, auth, db };

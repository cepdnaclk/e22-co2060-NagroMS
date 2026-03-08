// ============================================================
// NagroMS — config/firebase.js
// Firebase Admin SDK initialisation
// Used for: verifying ID tokens, managing users server-side,
//           reading/writing Firestore (user profiles & roles)
// ============================================================

const admin = require('firebase-admin');

// Build the service account object from .env variables
// (avoids committing the serviceAccountKey.json file to git)
const serviceAccount = {
  type: 'service_account',
  project_id:                process.env.FIREBASE_PROJECT_ID,
  private_key_id:            process.env.FIREBASE_PRIVATE_KEY_ID,
  // .env stores \n as literal text — replace back to real newlines
  private_key:               process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  client_email:              process.env.FIREBASE_CLIENT_EMAIL,
  client_id:                 process.env.FIREBASE_CLIENT_ID,
  auth_uri:                  process.env.FIREBASE_AUTH_URI,
  token_uri:                 process.env.FIREBASE_TOKEN_URI,
};

// Only initialise once (safe for hot-reload in dev)
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
  console.log('✅ Firebase Admin SDK initialised');
}

// Shorthand exports used throughout the app
const auth      = admin.auth();       // Firebase Authentication
const db        = admin.firestore();  // Firestore database
const adminApp  = admin;

module.exports = { admin: adminApp, auth, db };
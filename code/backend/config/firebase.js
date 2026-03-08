const { initializeApp, cert } = require("firebase-admin/app");
const { getFirestore }        = require("firebase-admin/firestore");
const { getAuth }             = require("firebase-admin/auth");

// Download this from Firebase Console →
// Project Settings → Service Accounts → Generate New Private Key
const serviceAccount = require("./serviceAccountKey.json");

const app = initializeApp({
  credential: cert(serviceAccount),
});

const db   = getFirestore(app);
const auth = getAuth(app);

module.exports = { db, auth };
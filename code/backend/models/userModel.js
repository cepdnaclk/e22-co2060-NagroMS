// ============================================================
// NagroMS — models/userModel.js
// Firestore user document structure + CRUD helpers
//
// Firestore collection: "users"
// Document ID: Firebase Auth UID
// ============================================================

const { db } = require('../config/firebase');

const COLLECTION = 'users';

// ── Valid roles in the system ────────────────────────────────
const VALID_ROLES = ['farmer', 'customer', 'service-provider', 'expert'];

// ── Valid account types ──────────────────────────────────────
const VALID_ACCOUNT_TYPES = ['individual', 'business'];

// ──────────────────────────────────────────────────────────────
// buildUserDocument
// Returns the Firestore document object for a new user
// ──────────────────────────────────────────────────────────────
function buildUserDocument(uid, data) {
  const now = new Date().toISOString();

  const base = {
    uid,
    email:        data.email        || '',
    phone:        data.phone        || '',
    roles:        data.roles        || [],
    accountType:  data.accountType  || 'individual',  // 'individual' | 'business'
    district:     data.district     || '',
    isActive:     true,
    emailVerified: data.emailVerified || false,
    createdAt:    now,
    updatedAt:    now,
    lastLoginAt:  null,
    provider:     data.provider     || 'email',       // 'email' | 'google' | 'facebook'
  };

  // Individual-specific fields
  if (data.accountType === 'individual' || !data.accountType) {
    base.fullName = data.fullName || '';
    base.nic      = data.nic      || '';
  }

  // Business-specific fields
  if (data.accountType === 'business') {
    base.businessName               = data.businessName               || '';
    base.businessRegistrationNumber = data.businessRegistrationNumber || '';
    base.contactPersonName          = data.contactPersonName          || '';
  }

  return base;
}

// ──────────────────────────────────────────────────────────────
// createUser — save new user document to Firestore
// ──────────────────────────────────────────────────────────────
async function createUser(uid, data) {
  const doc = buildUserDocument(uid, data);
  await db.collection(COLLECTION).doc(uid).set(doc);
  return doc;
}

// ──────────────────────────────────────────────────────────────
// getUserById — get user document by UID
// ──────────────────────────────────────────────────────────────
async function getUserById(uid) {
  const snap = await db.collection(COLLECTION).doc(uid).get();
  if (!snap.exists) return null;
  return { id: snap.id, ...snap.data() };
}

// ──────────────────────────────────────────────────────────────
// getUserByEmail — query by email field
// ──────────────────────────────────────────────────────────────
async function getUserByEmail(email) {
  const snap = await db
    .collection(COLLECTION)
    .where('email', '==', email)
    .limit(1)
    .get();
  if (snap.empty) return null;
  const doc = snap.docs[0];
  return { id: doc.id, ...doc.data() };
}

// ──────────────────────────────────────────────────────────────
// updateUser — partial update a user document
// ──────────────────────────────────────────────────────────────
async function updateUser(uid, updates) {
  const payload = { ...updates, updatedAt: new Date().toISOString() };
  await db.collection(COLLECTION).doc(uid).update(payload);
  return getUserById(uid);
}

// ──────────────────────────────────────────────────────────────
// updateLastLogin — stamp last login time
// ──────────────────────────────────────────────────────────────
async function updateLastLogin(uid) {
  await db.collection(COLLECTION).doc(uid).update({
    lastLoginAt: new Date().toISOString(),
    updatedAt:   new Date().toISOString(),
  });
}

// ──────────────────────────────────────────────────────────────
// updateRoles — replace user's roles array
// ──────────────────────────────────────────────────────────────
async function updateRoles(uid, roles) {
  // Validate all roles
  const invalid = roles.filter(r => !VALID_ROLES.includes(r));
  if (invalid.length > 0) {
    throw new Error(`Invalid roles: ${invalid.join(', ')}`);
  }
  return updateUser(uid, { roles });
}

// ──────────────────────────────────────────────────────────────
// userExists — check if a user document exists
// ──────────────────────────────────────────────────────────────
async function userExists(uid) {
  const snap = await db.collection(COLLECTION).doc(uid).get();
  return snap.exists;
}

module.exports = {
  VALID_ROLES,
  VALID_ACCOUNT_TYPES,
  createUser,
  getUserById,
  getUserByEmail,
  updateUser,
  updateLastLogin,
  updateRoles,
  userExists,
};
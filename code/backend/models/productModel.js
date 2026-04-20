// ============================================================
// NagroMS — models/productModel.js
// Firestore product document structure + CRUD helpers
// ============================================================

const { db } = require('../config/firebase');

const COLLECTION = 'products';

/**
 * Create a new product
 */
async function createProduct(data) {
  const now = new Date().toISOString();
  const docRef = db.collection(COLLECTION).doc();
  const product = {
    id: docRef.id,
    farmerId: data.farmerId,
    name: data.name,
    image: data.image || '',
    quantity: data.quantity || 0,
    price: data.price || 0,
    status: data.status || 'In Stock',
    category: data.category || 'vegetable',
    createdAt: now,
    updatedAt: now,
  };
  await docRef.set(product);
  return product;
}

/**
 * Get all products for a specific farmer
 */
async function getProductsByFarmer(farmerId) {
  const snapshot = await db.collection(COLLECTION).where('farmerId', '==', farmerId).get();
  if (snapshot.empty) return [];
  return snapshot.docs.map(doc => doc.data());
}

/**
 * Get a single product by ID
 */
async function getProductById(productId) {
  const doc = await db.collection(COLLECTION).doc(productId).get();
  if (!doc.exists) return null;
  return doc.data();
}

/**
 * Update a product
 */
async function updateProduct(productId, updates) {
  const now = new Date().toISOString();
  const payload = { ...updates, updatedAt: now };
  await db.collection(COLLECTION).doc(productId).update(payload);
  const updatedDoc = await db.collection(COLLECTION).doc(productId).get();
  return updatedDoc.data();
}

/**
 * Delete a product
 */
async function deleteProduct(productId) {
  await db.collection(COLLECTION).doc(productId).delete();
  return true;
}

module.exports = {
  createProduct,
  getProductsByFarmer,
  getProductById,
  updateProduct,
  deleteProduct,
};


// ============================================================
// NagroMS — models/saleModel.js
// ============================================================

const { db } = require('../config/firebase');

const COLLECTION = 'sales';

async function getSalesByFarmer(farmerId) {
  const snapshot = await db.collection(COLLECTION).where('farmerId', '==', farmerId).get();
  if (snapshot.empty) return [];
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

async function createSale(data) {
  const now = new Date().toISOString();
  const docRef = db.collection(COLLECTION).doc();
  const sale = {
    id: docRef.id,
    ...data,
    createdAt: now,
  };
  await docRef.set(sale);
  return sale;
}

module.exports = {
  getSalesByFarmer,
  createSale,
};

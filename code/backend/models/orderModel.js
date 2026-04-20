// ============================================================
// NagroMS — models/orderModel.js
// ============================================================

const { db } = require('../config/firebase');

const COLLECTION = 'orders';

async function getOrdersByFarmer(farmerId) {
  const snapshot = await db.collection(COLLECTION).where('farmerId', '==', farmerId).get();
  if (snapshot.empty) return [];
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

async function updateOrderStatus(orderId, status) {
  await db.collection(COLLECTION).doc(orderId).update({
    status,
    updatedAt: new Date().toISOString(),
  });
  return true;
}

module.exports = {
  getOrdersByFarmer,
  updateOrderStatus,
};

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

async function createOrder(data) {
  const docRef = db.collection(COLLECTION).doc();
  const order = {
    id: docRef.id,
    ...data,
    status: data.status || 'pending',
    orderDate: new Date().toISOString(),
    createdAt: new Date().toISOString(),
  };
  await docRef.set(order);
  return order;
}

async function deleteOrder(orderId) {
  await db.collection(COLLECTION).doc(orderId).delete();
  return true;
}

module.exports = {
  getOrdersByFarmer,
  updateOrderStatus,
  createOrder,
  deleteOrder,
};

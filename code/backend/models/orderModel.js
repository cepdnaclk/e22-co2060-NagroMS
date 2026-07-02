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

async function updateOrderStatus(orderId, status, productId = null) {
  const docRef = db.collection(COLLECTION).doc(orderId);
  const doc = await docRef.get();
  
  if (!doc.exists) return false;
  const data = doc.data();
  let products = data.products || [];
  
  if (productId) {
    products = products.map(p => p.id === productId ? { ...p, status } : p);
  } else if (status === 'completed') {
    products = products.map(p => ({ ...p, status: 'completed' }));
  }

  // Check if all products are completed to update overall status
  const allCompleted = products.every(p => p.status === 'completed');
  const overallStatus = allCompleted ? 'completed' : (products.some(p => p.status === 'completed') ? 'partially_completed' : 'pending');

  await docRef.update({
    products,
    status: overallStatus,
    updatedAt: new Date().toISOString(),
  });
  return true;
}

module.exports = {
  getOrdersByFarmer,
  updateOrderStatus,
};

const { db } = require('../config/firebase');

async function getInventoryByFarmerId(farmerId) {
  const snapshot = await db.collection('inventories').where('farmerId', '==', farmerId).get();
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

async function getInventoryById(id) {
  const doc = await db.collection('inventories').doc(id).get();
  return doc.exists ? { id, ...doc.data() } : null;
}

async function createInventory(data) {
  const docRef = await db.collection('inventories').add({
    ...data,
    createdAt: new Date().toISOString()
  });
  const doc = await docRef.get();
  return { id: doc.id, ...doc.data() };
}

async function updateInventory(id, data) {
  await db.collection('inventories').doc(id).update({
    ...data,
    updatedAt: new Date().toISOString()
  });
  return getInventoryById(id);
}

async function deleteInventory(id) {
  await db.collection('inventories').doc(id).delete();
  return { success: true };
}

module.exports = {
  getInventoryByFarmerId,
  getInventoryById,
  createInventory,
  updateInventory,
  deleteInventory
};

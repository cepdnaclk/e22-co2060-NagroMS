const { db } = require('../config/firebase');

async function getEquipmentByFarmerId(farmerId) {
  const snapshot = await db.collection('equipment').where('farmerId', '==', farmerId).get();
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

async function getEquipmentById(id) {
  const doc = await db.collection('equipment').doc(id).get();
  return doc.exists ? { id, ...doc.data() } : null;
}

async function createEquipment(data) {
  const docRef = await db.collection('equipment').add({
    ...data,
    createdAt: new Date().toISOString()
  });
  const doc = await docRef.get();
  return { id: doc.id, ...doc.data() };
}

async function updateEquipment(id, data) {
  await db.collection('equipment').doc(id).update({
    ...data,
    updatedAt: new Date().toISOString()
  });
  return getEquipmentById(id);
}

async function deleteEquipment(id) {
  await db.collection('equipment').doc(id).delete();
  return { success: true };
}

module.exports = {
  getEquipmentByFarmerId,
  getEquipmentById,
  createEquipment,
  updateEquipment,
  deleteEquipment
};

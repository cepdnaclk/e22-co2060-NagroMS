const { db } = require('../config/firebase');

const COLLECTION = 'farmerUpdates';

async function getUpdatesByFarmer(farmerId) {
  const snapshot = await db.collection(COLLECTION).where('farmerId', '==', farmerId).get();
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

async function createUpdate(data) {
  const docRef = db.collection(COLLECTION).doc();
  const updateData = {
    id: docRef.id,
    ...data,
    createdAt: new Date().toISOString()
  };
  await docRef.set(updateData);
  return updateData;
}

module.exports = { getUpdatesByFarmer, createUpdate };

const { db } = require('../config/firebase');

const COLLECTION = 'income';

async function getIncomeByFarmer(farmerId) {
  const snapshot = await db.collection(COLLECTION).where('farmerId', '==', farmerId).get();
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

async function createIncome(data) {
  const docRef = db.collection(COLLECTION).doc();
  const income = {
    id: docRef.id,
    ...data,
    date: data.date || new Date().toISOString().split('T')[0],
    createdAt: new Date().toISOString()
  };
  await docRef.set(income);
  return income;
}

async function deleteIncome(incomeId) {
  await db.collection(COLLECTION).doc(incomeId).delete();
  return true;
}

module.exports = { getIncomeByFarmer, createIncome, deleteIncome };

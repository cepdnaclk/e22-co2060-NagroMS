// ============================================================
// NagroMS — models/expenseModel.js
// ============================================================
const { db } = require('../config/firebase');

const COLLECTION = 'expenses';

async function getExpensesByFarmer(farmerId) {
  const snapshot = await db.collection(COLLECTION).where('farmerId', '==', farmerId).get();
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

async function createExpense(data) {
  const docRef = db.collection(COLLECTION).doc();
  const expense = {
    id: docRef.id,
    ...data,
    date: data.date || new Date().toISOString().split('T')[0],
    createdAt: new Date().toISOString()
  };
  await docRef.set(expense);
  return expense;
}

async function deleteExpense(expenseId) {
  await db.collection(COLLECTION).doc(expenseId).delete();
  return true;
}

module.exports = { getExpensesByFarmer, createExpense, deleteExpense };

// ============================================================
// NagroMS — models/loanModel.js
// ============================================================
const { db } = require('../config/firebase');

const COLLECTION = 'loans';

async function getLoansByFarmer(farmerId) {
  const snapshot = await db.collection(COLLECTION).where('farmerId', '==', farmerId).get();
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

async function createLoan(data) {
  const docRef = db.collection(COLLECTION).doc();
  const loan = {
    id: docRef.id,
    ...data,
    createdAt: new Date().toISOString(),
    status: data.status || 'Active'
  };
  await docRef.set(loan);
  return loan;
}

async function updateLoan(loanId, updates) {
  await db.collection(COLLECTION).doc(loanId).update({
    ...updates,
    updatedAt: new Date().toISOString()
  });
  const doc = await db.collection(COLLECTION).doc(loanId).get();
  return { id: doc.id, ...doc.data() };
}

async function deleteLoan(loanId) {
  await db.collection(COLLECTION).doc(loanId).delete();
  return true;
}

module.exports = { getLoansByFarmer, createLoan, updateLoan, deleteLoan };

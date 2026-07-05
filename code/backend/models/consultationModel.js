const { db } = require('../config/firebase');

const COLLECTION = 'consultationRequests';

async function createConsultationRequest(data) {
  const docRef = db.collection(COLLECTION).doc();
  const request = {
    id: docRef.id,
    ...data,
    status: 'pending',
    createdAt: new Date().toISOString()
  };
  await docRef.set(request);
  return request;
}

module.exports = { createConsultationRequest };

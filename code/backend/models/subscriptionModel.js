const { db } = require('../config/firebase');

const COLLECTION = 'subscriptions';

async function getSubscriptionsByFarmer(farmerId) {
  const snapshot = await db.collection(COLLECTION).where('farmerId', '==', farmerId).get();
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

module.exports = { getSubscriptionsByFarmer };

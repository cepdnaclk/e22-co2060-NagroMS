const { db } = require('../config/firebase');

const COLLECTION = 'notifications';

async function createNotification(data) {
  const docRef = db.collection(COLLECTION).doc();
  const notification = {
    id: docRef.id,
    ...data,
    read: false,
    createdAt: new Date().toISOString()
  };
  await docRef.set(notification);
  return notification;
}

async function markAsRead(notificationId) {
  await db.collection(COLLECTION).doc(notificationId).update({ read: true });
  return true;
}

module.exports = { createNotification, markAsRead };

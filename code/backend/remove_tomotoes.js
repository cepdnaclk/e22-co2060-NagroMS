require('dotenv').config();
const { db } = require('./config/firebase');

async function removeTomotoes() {
  try {
    const snapshot = await db.collection('products').where('productName', '==', 'tomotoes').get();
    const batch = db.batch();
    snapshot.docs.forEach(doc => batch.delete(doc.ref));
    await batch.commit();
    console.log(`Deleted ${snapshot.size} tomotoes products.`);

    const snapshot2 = await db.collection('products').where('name', '==', 'tomotoes').get();
    const batch2 = db.batch();
    snapshot2.docs.forEach(doc => batch2.delete(doc.ref));
    await batch2.commit();
    console.log(`Deleted ${snapshot2.size} tomotoes products (name field).`);

    process.exit(0);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
}
removeTomotoes();

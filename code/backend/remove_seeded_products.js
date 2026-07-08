require('dotenv').config();
const { db } = require('./config/firebase');

const seededNames = ['Red Rice (Samba)', 'Organic Tomatoes', 'Carrots (Nuwara Eliya)', 'Green Beans', 'Sweet Corn'];

async function cleanupSeededProducts() {
  try {
    console.log('Searching for seeded products...');
    const snapshot = await db.collection('products').where('name', 'in', seededNames).get();
    
    if (snapshot.empty) {
      console.log('No seeded products found.');
    } else {
      const batch = db.batch();
      snapshot.docs.forEach((doc) => {
        console.log(`Deleting seeded product: ${doc.id}`);
        batch.delete(doc.ref);
      });
      await batch.commit();
      console.log(`Successfully deleted ${snapshot.size} seeded products.`);
    }

    // Also check for 'productName' field in case it was stored under that key
    const snapshot2 = await db.collection('products').where('productName', 'in', seededNames).get();
    if (snapshot2.empty) {
      console.log('No seeded productName products found.');
    } else {
      const batch2 = db.batch();
      snapshot2.docs.forEach((doc) => {
        console.log(`Deleting seeded product: ${doc.id}`);
        batch2.delete(doc.ref);
      });
      await batch2.commit();
      console.log(`Successfully deleted ${snapshot2.size} seeded productName products.`);
    }

    process.exit(0);
  } catch (error) {
    console.error('Error cleaning up products:', error);
    process.exit(1);
  }
}

cleanupSeededProducts();

require('dotenv').config();
const { db } = require('./config/firebase');

async function checkProducts() {
  try {
    const snapshot = await db.collection('products').get();
    console.log('Total products in Firestore:', snapshot.size);
    snapshot.forEach(doc => {
      const data = doc.data();
      console.log('---');
      console.log('ID:', doc.id);
      console.log('Name:', data.name);
      console.log('Farmer:', data.farmer);
      console.log('FarmerId:', data.farmerId);
      console.log('Price:', data.price);
    });
  } catch (error) {
    console.error('Error checking products:', error);
  } finally {
    process.exit();
  }
}

checkProducts();

require('dotenv').config();
const { db } = require('./config/firebase');

async function checkOrders() {
  try {
    const snapshot = await db.collection('orders').orderBy('createdAt', 'desc').limit(5).get();
    console.log('Recent 5 orders:');
    snapshot.forEach(doc => {
      const data = doc.data();
      console.log('---');
      console.log('ID:', doc.id);
      console.log('Farmer:', data.farmerId);
      console.log('Customer:', data.customerId);
      console.log('Status:', data.status);
      console.log('Created At:', data.createdAt);
      console.log('Products:', (data.products || []).map(p => p.productName).join(', '));
    });
  } catch (error) {
    console.error('Error checking orders:', error);
  } finally {
    process.exit();
  }
}

checkOrders();

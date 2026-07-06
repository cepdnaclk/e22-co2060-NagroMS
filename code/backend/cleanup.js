const { db } = require('./config/firebase');

async function cleanupDummyOrders() {
  try {
    const dummyNames = ['Self Market', 'Colombo Market', 'Kandy Grocers'];
    console.log('Searching for dummy orders...');
    
    const snapshot = await db.collection('orders').where('customerName', 'in', dummyNames).get();
    
    if (snapshot.empty) {
      console.log('No dummy orders found.');
      return;
    }

    const batch = db.batch();
    snapshot.docs.forEach((doc) => {
      console.log(`Deleting dummy order: ${doc.id}`);
      batch.delete(doc.ref);
    });

    await batch.commit();
    console.log('Successfully deleted dummy orders.');
    process.exit(0);
  } catch (error) {
    console.error('Error cleaning up dummy orders:', error);
    process.exit(1);
  }
}

cleanupDummyOrders();

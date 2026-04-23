// Seed script to add realistic data for all farmers
require('dotenv').config();
const { db } = require('./config/firebase');

const productsToSeed = [
  { name: 'Red Rice (Samba)', quantity: 450, price: 210, category: 'Grain', status: 'In Stock' },
  { name: 'Organic Tomatoes', quantity: 85, price: 180, category: 'Vegetable', status: 'In Stock' },
  { name: 'Carrots (Nuwara Eliya)', quantity: 120, price: 320, category: 'Vegetable', status: 'In Stock' },
  { name: 'Green Beans', quantity: 60, price: 240, category: 'Vegetable', status: 'In Stock' },
  { name: 'Sweet Corn', quantity: 200, price: 90, category: 'Vegetable', status: 'In Stock' }
];

const inventoryToSeed = [
  { name: 'Urea Fertilizer', quantity: 15, status: 'In Stock' },
  { name: 'Organic Compost', quantity: 50, status: 'In Stock' },
  { name: 'Paddy Seeds', quantity: 100, status: 'In Stock' },
  { name: 'Diesel Fuel', quantity: 40, status: 'In Stock' }
];

const equipmentToSeed = [
  { name: 'Mahindra Tractor', price: 4500, available: true },
  { name: 'Hand Cultivator', price: 1200, available: true },
  { name: 'Water Pump', price: 800, available: true }
];

async function seedData() {
  try {
    console.log('--- STARTING REAL DATA SEEDING ---');
    const userSnapshot = await db.collection('users').get();
    
    if (userSnapshot.empty) {
      console.log('No users found to seed data for.');
      return;
    }

    const farmers = [];
    userSnapshot.forEach(doc => {
      const data = doc.data();
      if (data.roles && data.roles.includes('farmer')) {
        farmers.push({ id: doc.id, ...data });
      }
    });

    if (farmers.length === 0) {
      console.log('No farmers found in the database.');
      return;
    }

    console.log(`Found ${farmers.length} farmers. Adding data to each...`);

    for (const farmer of farmers) {
      console.log(`\nProcessing Farmer: ${farmer.fullName || farmer.id} (ID: ${farmer.id})`);

      // ── Products ─────────────
      for (const p of productsToSeed) {
        const docRef = db.collection('products').doc();
        await docRef.set({
          id: docRef.id,
          farmerId: farmer.id,
          ...p,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        });
      }
      console.log(`  ✅ Added ${productsToSeed.length} products`);

      // ── Inventory ───────────
      for (const i of inventoryToSeed) {
        const docRef = db.collection('inventories').doc();
        await docRef.set({
          id: docRef.id,
          farmerId: farmer.id,
          resource: i.name, // inventory use 'resource' field for name
          amount: i.quantity,
          ...i,
          createdAt: new Date().toISOString()
        });
      }
      console.log(`  ✅ Added ${inventoryToSeed.length} inventory items`);

      // ── Equipment ───────────
      for (const e of equipmentToSeed) {
        const docRef = db.collection('equipment').doc();
        await docRef.set({
          id: docRef.id,
          farmerId: farmer.id,
          ...e,
          createdAt: new Date().toISOString()
        });
      }
      console.log(`  ✅ Added ${equipmentToSeed.length} equipment pieces`);

      // ── Orders ──────────────
      const sampleOrders = [
        { customerName: 'Colombo Market', items: ['Rice'], total: 5000, status: 'pending' },
        { customerName: 'Kandy Grocers', items: ['Tomatoes', 'Beans'], total: 3200, status: 'shipped' },
        { customerName: 'Self Market', items: ['Carrots'], total: 1200, status: 'completed' }
      ];
      for (const o of sampleOrders) {
        const docRef = db.collection('orders').doc();
        await docRef.set({
          id: docRef.id,
          farmerId: farmer.id,
          ...o,
          orderDate: new Date().toISOString(),
          createdAt: new Date().toISOString()
        });
      }
      console.log(`  ✅ Added ${sampleOrders.length} orders`);
    }

    console.log('\n--- SEEDING COMPLETED SUCCESSFULLY ---');
    process.exit(0);
  } catch (error) {
    console.error('❌ SEEDING FAILED:', error.message);
    process.exit(1);
  }
}

seedData();

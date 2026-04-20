// Script to test Firebase connection
require('dotenv').config();
const { db } = require('./config/firebase');

async function testConnection() {
  try {
    console.log('Testing connection to Firebase Firestore...');
    // Attempting to read a single document or collection
    const snapshot = await db.collection('test_connection').limit(1).get();
    console.log('✅ DATABASE CONNECTION SUCCESSFUL!');
    console.log('✅ Firebase initialized and able to query Firestore.');
    process.exit(0);
  } catch (error) {
    console.error('❌ DATABASE CONNECTION FAILED!');
    console.error(error.message);
    process.exit(1);
  }
}

testConnection();

// Script to check existing users
require('dotenv').config();
const { db } = require('./config/firebase');

async function checkUsers() {
  try {
    console.log('Checking existing users...');
    const snapshot = await db.collection('users').get();
    if (snapshot.empty) {
      console.log('No users found.');
    } else {
      console.log(`Found ${snapshot.size} users:`);
      snapshot.forEach(doc => {
        const data = doc.data();
        console.log(`- ID: ${doc.id}, Name: ${data.fullName}, Roles: ${data.roles}`);
      });
    }
    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

checkUsers();

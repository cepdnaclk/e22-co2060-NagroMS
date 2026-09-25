const admin = require('./config/firebase');
const { auth, db } = require('./config/firebase');

async function seedAdmin() {
  const email = 'admin@nagroms.com';
  const password = 'admin123';
  
  try {
    let userRecord;
    try {
      userRecord = await auth.getUserByEmail(email);
      console.log('Admin user already exists in Auth');
    } catch (e) {
      if (e.code === 'auth/user-not-found') {
        userRecord = await auth.createUser({
          email,
          password,
          displayName: 'System Admin',
        });
        console.log('Admin user created in Auth');
      } else {
        throw e;
      }
    }

    const docRef = db.collection('users').doc(userRecord.uid);
    const docSnap = await docRef.get();
    if (!docSnap.exists) {
      await docRef.set({
        uid: userRecord.uid,
        email,
        roles: ['admin'],
        fullName: 'System Admin',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        isActive: true,
      });
      console.log('Admin user document created in Firestore');
    } else {
      console.log('Admin user document already exists in Firestore');
    }
  } catch (err) {
    console.error('Error seeding admin:', err);
  }
}

seedAdmin();

const { db, auth } = require('./config/firebase');

async function seed() {
    const email = 'e22260@eng.pdn.ac.lk';
    
    // Find the user by email
    let providerId = 'mock-provider-id';
    try {
        const userRecord = await auth.getUserByEmail(email);
        providerId = userRecord.uid;
        console.log('Found user with UID:', providerId);
    } catch (e) {
        console.log('User not found in Auth, looking in users collection...');
        const usersSnap = await db.collection('users').where('email', '==', email).get();
        if (!usersSnap.empty) {
            providerId = usersSnap.docs[0].id;
            console.log('Found user in collection with UID:', providerId);
        } else {
            console.warn('Could not find user, using fallback UID');
        }
    }

    const equipment = [
        { emoji: '🚜', name: 'Mahindra 575 DI Tractor', category: 'Tractors', dailyRate: 5500, weeklyRate: 32000, monthlyRate: 115000, condition: 'Excellent', status: 'Available', location: 'Anuradhapura', lastMaintenance: '2026-06-15', totalRentals: 48, utilization: 78, providerId, providerEmail: email },
        { emoji: '🌾', name: 'Kubota DC-70 Harvester', category: 'Harvesters', dailyRate: 8500, weeklyRate: 55000, monthlyRate: 195000, condition: 'Good', status: 'Rented', location: 'Polonnaruwa', lastMaintenance: '2026-05-20', totalRentals: 31, utilization: 65, providerId, providerEmail: email },
        { emoji: '💧', name: 'Honda WB30 Water Pump', category: 'Irrigation', dailyRate: 1800, weeklyRate: 10500, monthlyRate: 38000, condition: 'Good', status: 'Available', location: 'Kurunegala', lastMaintenance: '2026-06-28', totalRentals: 92, utilization: 89, providerId, providerEmail: email },
        { emoji: '🌿', name: 'Yamaha KF150 Sprayer', category: 'Crop Care', dailyRate: 950, weeklyRate: 5800, monthlyRate: 21000, condition: 'Excellent', status: 'Available', location: 'Kandy', lastMaintenance: '2026-07-01', totalRentals: 67, utilization: 71, providerId, providerEmail: email }
    ];

    console.log('Inserting equipment...');
    const eqRefs = [];
    for (const eq of equipment) {
        const ref = await db.collection('equipmentFleet').add(eq);
        eqRefs.push(ref.id);
        console.log('Added EQ:', ref.id);
    }

    const requests = [
        { farmerName: 'Sunil Perera', farmerPhone: '077 123 4567', requirement: 'Mahindra 575 DI Tractor', durationDays: 7, requiredDate: '2026-07-08', proposedCost: 32000, status: 'pending', district: 'Anuradhapura', providerId, providerEmail: email, serviceType: 'equipment' },
        { farmerName: 'Kamala Silva', farmerPhone: '081 222 3344', requirement: 'Honda WB30 Water Pump', durationDays: 14, requiredDate: '2026-07-06', proposedCost: 21000, status: 'accepted', district: 'Kandy', providerId, providerEmail: email, serviceType: 'equipment' }
    ];

    console.log('Inserting requests...');
    for (const req of requests) {
        const ref = await db.collection('serviceBookings').add(req);
        console.log('Added Req:', ref.id);
    }

    console.log('Seeding complete!');
    process.exit(0);
}

seed().catch(console.error);

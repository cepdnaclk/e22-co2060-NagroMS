const { db } = require("../config/firebase");
const { FieldValue } = require("firebase-admin/firestore");

async function seed() {
    const expertId = "TEST_EXPERT_ID"; // You might need to change this to your actual UID
    console.log(`🌱 Seeding data for expert: ${expertId}`);

    try {
        // 1. Seed Consultations
        const consultations = [
            {
                expertId,
                farmerId: "farmer_1",
                farmerName: "Sumapala Perera",
                topic: "Paddy disease identification",
                type: "video",
                status: "confirmed",
                scheduledAt: new Date(Date.now() + 86400000), // tomorrow
            },
            {
                expertId,
                farmerId: "farmer_2",
                farmerName: "Nimal Silva",
                topic: "Fertilizer recommendations",
                type: "chat",
                status: "pending",
                scheduledAt: new Date(Date.now() + 172800000), // in 2 days
            }
        ];

        for (const c of consultations) {
            const docRef = await db.collection("consultations").add(c);
            console.log(`✅ Added consultation: ${docRef.id}`);
        }

        // 2. Seed Questions
        const questions = [
            {
                farmerId: "farmer_3",
                farmerName: "Anula Kumari",
                question: "Why are my tomato leaves turning yellow?",
                replyCount: 0,
                createdAt: FieldValue.serverTimestamp(),
            },
            {
                farmerId: "farmer_1",
                farmerName: "Sumapala Perera",
                question: "Is it the right time for pesticide application?",
                replyCount: 1,
                createdAt: FieldValue.serverTimestamp(),
            }
        ];

        for (const q of questions) {
            const docRef = await db.collection("questions").add(q);
            console.log(`✅ Added question: ${docRef.id}`);
        }

        console.log("✨ Seeding completed successfully!");
        process.exit(0);
    } catch (err) {
        console.error("❌ Seeding failed:", err);
        process.exit(1);
    }
}

seed();

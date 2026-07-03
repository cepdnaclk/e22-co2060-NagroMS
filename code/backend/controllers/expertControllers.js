const { db } = require("../config/firebase");

// ─── Dashboard Stats ─────────────────────────────────────────────────────────
async function getDashboardStats(req, res) {
  const expertId = req.user.uid;
  try {
    const consultSnap = await db
      .collection("consultations")
      .where("expertId", "==", expertId)
      .get();

    const allConsultations = consultSnap.docs.map((d) => ({ id: d.id, ...d.data() }));

    const now = new Date();
    const thisMonth = allConsultations.filter((c) => {
      const date = c.scheduledAt?.toDate?.();
      return (
        date &&
        date.getMonth()    === now.getMonth() &&
        date.getFullYear() === now.getFullYear()
      );
    });

    const upcoming = allConsultations
      .filter((c) => {
        const date = c.scheduledAt?.toDate?.();
        return date && date > now && ["pending", "confirmed"].includes(c.status);
      })
      .sort((a, b) => a.scheduledAt?.toDate() - b.scheduledAt?.toDate())
      .slice(0, 3);

    const uniqueFarmers = new Set(allConsultations.map((c) => c.farmerId)).size;

    // Recent questions
    const qSnap = await db
      .collection("questions")
      .orderBy("createdAt", "desc")
      .limit(3)
      .get();

    const recentQuestions = qSnap.docs.map((d) => ({ id: d.id, ...d.data() }));

    res.json({
      stats: {
        totalConsultations: allConsultations.length,
        thisMonth:          thisMonth.length,
        rating:             4.9,
        activeFarmers:      uniqueFarmers,
      },
      upcomingConsultations: upcoming,
      recentQuestions,
    });
  } catch (err) {
    console.error("getDashboardStats error:", err);
    res.status(500).json({ error: "Failed to fetch dashboard stats" });
  }
}

// ─── Consultations ────────────────────────────────────────────────────────────
async function getConsultations(req, res) {
  const expertId = req.user.uid;
  try {
    const snap = await db
      .collection("consultations")
      .where("expertId", "==", expertId)
      .orderBy("scheduledAt", "asc")
      .get();

    res.json(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
  } catch (err) {
    console.error("getConsultations error:", err);
    res.status(500).json({ error: "Failed to fetch consultations" });
  }
}

async function updateConsultationStatus(req, res) {
  const { id }     = req.params;
  const { status } = req.body;

  const allowed = ["confirmed", "declined", "rescheduled"];
  if (!allowed.includes(status)) {
    return res.status(400).json({ error: `Invalid status. Must be one of: ${allowed.join(", ")}` });
  }

  try {
    await db.collection("consultations").doc(id).update({ status });
    res.json({ message: "Consultation status updated", id, status });
  } catch (err) {
    console.error("updateConsultationStatus error:", err);
    res.status(500).json({ error: "Failed to update consultation status" });
  }
}

// ─── Q&A Forum ────────────────────────────────────────────────────────────────
async function getQuestions(req, res) {
  try {
    const snap = await db
      .collection("questions")
      .orderBy("createdAt", "desc")
      .get();

    res.json(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
  } catch (err) {
    console.error("getQuestions error:", err);
    res.status(500).json({ error: "Failed to fetch questions" });
  }
}

async function replyToQuestion(req, res) {
  const { id }   = req.params;
  const { text } = req.body;

  if (!text?.trim()) {
    return res.status(400).json({ error: "Reply text is required" });
  }

  try {
    const { FieldValue } = require("firebase-admin/firestore");

    // Add reply to sub-collection
    const replyRef = await db
      .collection("questions")
      .doc(id)
      .collection("replies")
      .add({
        text,
        expertId:   req.user.uid,
        expertName: req.user.email,
        createdAt:  FieldValue.serverTimestamp(),
      });

    // Increment reply count
    await db
      .collection("questions")
      .doc(id)
      .update({ replyCount: FieldValue.increment(1) });

    res.json({ message: "Reply submitted", replyId: replyRef.id });
  } catch (err) {
    console.error("replyToQuestion error:", err);
    res.status(500).json({ error: "Failed to submit reply" });
  }
}

// ─── Knowledge Base ───────────────────────────────────────────────────────────
async function getArticles(req, res) {
  const expertId = req.user.uid;
  try {
    const snap = await db
      .collection("articles")
      .where("expertId", "==", expertId)
      .orderBy("createdAt", "desc")
      .get();

    res.json(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
  } catch (err) {
    console.error("getArticles error:", err);
    res.status(500).json({ error: "Failed to fetch articles" });
  }
}

async function createArticle(req, res) {
  const { title, content, category } = req.body;

  if (!title?.trim() || !content?.trim()) {
    return res.status(400).json({ error: "Title and content are required" });
  }

  try {
    const { FieldValue } = require("firebase-admin/firestore");

    const docRef = await db.collection("articles").add({
      title,
      content,
      category:   category || "",
      expertId:   req.user.uid,
      expertName: req.user.email,
      createdAt:  FieldValue.serverTimestamp(),
      views:      0,
      likes:      0,
    });

    res.status(201).json({ message: "Article created", id: docRef.id });
  } catch (err) {
    console.error("createArticle error:", err);
    res.status(500).json({ error: "Failed to create article" });
  }
}

async function updateArticle(req, res) {
  const { id }               = req.params;
  const { title, content, category } = req.body;

  try {
    const { FieldValue } = require("firebase-admin/firestore");

    await db.collection("articles").doc(id).update({
      title, content, category,
      updatedAt: FieldValue.serverTimestamp(),
    });

    res.json({ message: "Article updated", id });
  } catch (err) {
    console.error("updateArticle error:", err);
    res.status(500).json({ error: "Failed to update article" });
  }
}

async function deleteArticle(req, res) {
  const { id } = req.params;
  try {
    await db.collection("articles").doc(id).delete();
    res.json({ message: "Article deleted", id });
  } catch (err) {
    console.error("deleteArticle error:", err);
    res.status(500).json({ error: "Failed to delete article" });
  }
}

// ─── Expert Profile / Settings ────────────────────────────────────────────────
async function getProfile(req, res) {
  const expertId = req.user.uid;
  try {
    const docSnap = await db.collection("users").doc(expertId).get();
    if (!docSnap.exists) {
      return res.status(404).json({ error: "Expert profile not found" });
    }
    res.json({ id: docSnap.id, ...docSnap.data() });
  } catch (err) {
    console.error("getProfile error:", err);
    res.status(500).json({ error: "Failed to fetch profile" });
  }
}

async function updateProfile(req, res) {
  const expertId = req.user.uid;
  const {
    name, specialization, yearsOfExperience,
    bio, availableVideo, availablePhone, availableChat,
  } = req.body;

  try {
    await db.collection("users").doc(expertId).update({
      name,
      specialization,
      yearsOfExperience: Number(yearsOfExperience),
      bio,
      availableVideo,
      availablePhone,
      availableChat,
    });
    res.json({ message: "Profile updated successfully" });
  } catch (err) {
    console.error("updateProfile error:", err);
    res.status(500).json({ error: "Failed to update profile" });
  }
}

module.exports = {
  getDashboardStats,
  getConsultations,
  updateConsultationStatus,
  getQuestions,
  replyToQuestion,
  getArticles,
  createArticle,
  updateArticle,
  deleteArticle,
  getProfile,
  updateProfile,
};
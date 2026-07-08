const express    = require("express");
const router     = express.Router();
const { authMiddleware, requireRole } = require("../middleware/authMiddleware");
const {
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
} = require("../controllers/expertControllers");

// All expert routes require login + expert role
router.use(authMiddleware);
router.use(requireRole("expert"));

// ── Dashboard ────────────────────────────────────────
// GET /api/expert/dashboard
router.get("/dashboard", getDashboardStats);

// ── Consultations ─────────────────────────────────────
// GET  /api/expert/consultations
// PUT  /api/expert/consultations/:id/status
router.get("/consultations",              getConsultations);
router.put("/consultations/:id/status",   updateConsultationStatus);

// ── Q&A Forum ─────────────────────────────────────────
// GET  /api/expert/questions
// POST /api/expert/questions/:id/reply
router.get("/questions",                  getQuestions);
router.post("/questions/:id/reply",       replyToQuestion);

// ── Knowledge Base ────────────────────────────────────
// GET    /api/expert/articles
// POST   /api/expert/articles
// PUT    /api/expert/articles/:id
// DELETE /api/expert/articles/:id
router.get("/articles",                   getArticles);
router.post("/articles",                  createArticle);
router.put("/articles/:id",               updateArticle);
router.delete("/articles/:id",            deleteArticle);

// ── Profile / Settings ────────────────────────────────
// GET /api/expert/profile
// PUT /api/expert/profile
router.get("/profile",                    getProfile);
router.put("/profile",                    updateProfile);

module.exports = router;
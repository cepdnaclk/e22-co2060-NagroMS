// ============================================================
// NagroMS — routes/authRoutes.js
// ============================================================

const express = require('express');
const router  = express.Router();

const {
  register, loginVerify, socialLogin,
  sendOTP, verifyOTP, resetPassword, findUser,
  getProfile, updateUserRoles,
} = require('../controllers/authcontroller');

const { verifyToken, requireRole } = require('../middleware/authMiddleware');

// ── Public routes ────────────────────────────────────────────
router.post('/register',        register);
router.post('/find-user',         findUser);
router.post('/login',           loginVerify);
router.post('/social-login',    socialLogin);

// OTP password reset (3 steps)
router.post('/send-otp',        sendOTP);        // Step 1: send OTP to email
router.post('/verify-otp',      verifyOTP);      // Step 2: verify OTP
router.post('/reset-password',  resetPassword);  // Step 3: set new password

// ── Protected routes ─────────────────────────────────────────
router.get('/profile',          verifyToken, getProfile);
router.put('/roles',            verifyToken, updateUserRoles);

module.exports = router;
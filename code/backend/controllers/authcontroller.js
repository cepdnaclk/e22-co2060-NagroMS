// ============================================================
// NagroMS — controllers/authcontroller.js
// Handles register, login, OTP, password reset, and profile
// ============================================================

const { auth, db } = require('../config/firebase');
const { createUser, getUserById, getUserByEmail, updateUser, updateLastLogin, updateRoles } = require('../models/userModel');
const nodemailer = require('nodemailer');

// In-memory OTP store (use Redis in production)
const otpStore = {};

// ── Email transporter ────────────────────────────────────────
function createTransporter() {
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
}

// ──────────────────────────────────────────────────────────────
// register — create user in Firebase Auth + Firestore
// ──────────────────────────────────────────────────────────────
exports.register = async (req, res) => {
  try {
    const {
      email, password, fullName, phone, nic,
      accountType, businessName, businessRegistrationNumber,
      contactPersonName, district, roles,
    } = req.body;

    // Create user in Firebase Auth
    const userRecord = await auth.createUser({
      email,
      password,
      displayName: fullName || businessName || '',
    });

    // Save user document in Firestore
    const userDoc = await createUser(userRecord.uid, {
      email, phone, nic, fullName, accountType,
      businessName, businessRegistrationNumber,
      contactPersonName, district,
      roles: roles || [],
      provider: 'email',
      emailVerified: false,
    });

    res.status(201).json({
      success: true,
      message: 'Account created successfully.',
      data: { uid: userRecord.uid, email },
    });
  } catch (error) {
    console.error('Register error:', error);
    if (error.code === 'auth/email-already-exists') {
      return res.status(409).json({ success: false, message: 'Email already registered.' });
    }
    res.status(500).json({ success: false, message: error.message });
  }
};

// ──────────────────────────────────────────────────────────────
// loginVerify — verify Firebase ID token from client login
// ──────────────────────────────────────────────────────────────
exports.loginVerify = async (req, res) => {
  try {
    const { idToken } = req.body;

    if (!idToken) {
      return res.status(400).json({ success: false, message: 'ID token is required.' });
    }

    const decodedToken = await auth.verifyIdToken(idToken);
    const user = await getUserById(decodedToken.uid);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found. Please register first.' });
    }

    if (!user.isActive) {
      return res.status(403).json({ success: false, message: 'Account is deactivated.' });
    }

    await updateLastLogin(decodedToken.uid);

    res.status(200).json({
      success: true,
      message: 'Login verified.',
      data: {
        uid:         user.uid,
        email:       user.email,
        fullName:    user.fullName || user.businessName || '',
        roles:       user.roles,
        accountType: user.accountType,
        district:    user.district,
        phone:       user.phone,
        nic:         user.nic || '',
      },
    });
  } catch (error) {
    console.error('Login verify error:', error);
    res.status(401).json({ success: false, message: 'Token verification failed.' });
  }
};

// ──────────────────────────────────────────────────────────────
// socialLogin — Google / Facebook OAuth
// ──────────────────────────────────────────────────────────────
exports.socialLogin = async (req, res) => {
  try {
    const { idToken, provider } = req.body;

    const decodedToken = await auth.verifyIdToken(idToken);
    let user = await getUserById(decodedToken.uid);

    // Auto-create Firestore document on first social login
    if (!user) {
      user = await createUser(decodedToken.uid, {
        email:         decodedToken.email || '',
        fullName:      decodedToken.name  || '',
        provider,
        roles:         [],
        emailVerified: true,
      });
    }

    await updateLastLogin(decodedToken.uid);

    res.status(200).json({
      success: true,
      message: 'Social login successful.',
      data: {
        uid:      user.uid,
        email:    user.email,
        fullName: user.fullName || '',
        roles:    user.roles,
      },
    });
  } catch (error) {
    console.error('Social login error:', error);
    res.status(401).json({ success: false, message: 'Social login failed.' });
  }
};

// ──────────────────────────────────────────────────────────────
// findUser — check if email exists (used before login)
// ──────────────────────────────────────────────────────────────
exports.findUser = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await getUserByEmail(email);

    res.status(200).json({
      success: true,
      exists: !!user,
      provider: user?.provider || null,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ──────────────────────────────────────────────────────────────
// sendOTP — Step 1 of password reset
// ──────────────────────────────────────────────────────────────
exports.sendOTP = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await getUserByEmail(email);

    if (!user) {
      return res.status(404).json({ success: false, message: 'No account found with this email.' });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    otpStore[email] = { otp, expiresAt: Date.now() + 10 * 60 * 1000 }; // 10 min

    const transporter = createTransporter();
    await transporter.sendMail({
      from:    process.env.EMAIL_USER,
      to:      email,
      subject: 'NagroMS — Password Reset OTP',
      html:    `<h2>🌾 NagroMS</h2><p>Your OTP is: <strong>${otp}</strong></p><p>Expires in 10 minutes.</p>`,
    });

    res.status(200).json({ success: true, message: 'OTP sent to your email.' });
  } catch (error) {
    console.error('Send OTP error:', error);
    res.status(500).json({ success: false, message: 'Failed to send OTP.' });
  }
};

// ──────────────────────────────────────────────────────────────
// verifyOTP — Step 2 of password reset
// ──────────────────────────────────────────────────────────────
exports.verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;
    const record = otpStore[email];

    if (!record) {
      return res.status(400).json({ success: false, message: 'No OTP requested for this email.' });
    }
    if (Date.now() > record.expiresAt) {
      delete otpStore[email];
      return res.status(400).json({ success: false, message: 'OTP has expired. Request a new one.' });
    }
    if (record.otp !== otp) {
      return res.status(400).json({ success: false, message: 'Incorrect OTP.' });
    }

    // Mark OTP as verified (allow password reset)
    otpStore[email].verified = true;
    res.status(200).json({ success: true, message: 'OTP verified.' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ──────────────────────────────────────────────────────────────
// resetPassword — Step 3 of password reset
// ──────────────────────────────────────────────────────────────
exports.resetPassword = async (req, res) => {
  try {
    const { email, newPassword } = req.body;
    const record = otpStore[email];

    if (!record || !record.verified) {
      return res.status(400).json({ success: false, message: 'Please verify OTP first.' });
    }

    const user = await getUserByEmail(email);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    await auth.updateUser(user.uid, { password: newPassword });
    delete otpStore[email];

    res.status(200).json({ success: true, message: 'Password reset successfully.' });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ──────────────────────────────────────────────────────────────
// getProfile — returns the logged-in user's Firestore profile
// ──────────────────────────────────────────────────────────────
exports.getProfile = async (req, res) => {
  try {
    const user = await getUserById(req.user.uid);
    if (!user) {
      return res.status(404).json({ success: false, message: 'Profile not found.' });
    }
    res.status(200).json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ──────────────────────────────────────────────────────────────
// updateUserRoles — assign roles to a user
// ──────────────────────────────────────────────────────────────
exports.updateUserRoles = async (req, res) => {
  try {
    const { roles } = req.body;
    if (!Array.isArray(roles)) {
      return res.status(400).json({ success: false, message: 'Roles must be an array.' });
    }
    const updated = await updateRoles(req.user.uid, roles);
    res.status(200).json({ success: true, data: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

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
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Helper to generate OTP
function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Helper to sanitize user data for response
function sanitizeUser(user) {
  if (!user) return null;
  const { nic, ...safe } = user;
  return safe;
}

// Helper to get dashboard route based on roles
function getDashboardRoute(roles) {
  if (!roles || roles.length === 0) return 'login';
  if (roles.includes('expert')) return 'expert-dashboard';
  if (roles.includes('service-provider')) return 'service-provider-dashboard';
  if (roles.includes('customer')) return 'customer-dashboard';
  if (roles.includes('farmer')) return 'farmer-dashboard';
  return 'login';
}

const VALID_ROLES = ['expert', 'farmer', 'customer', 'service-provider'];

// ──────────────────────────────────────────────────────────────
// register — save user profile to Firestore after client-side
//            Firebase Auth creation (idToken proves the user exists)
// ──────────────────────────────────────────────────────────────
async function register(req, res) {
  try {
    const {
      idToken,
      fullName, phone, nic,
      accountType, businessName, businessRegistrationNumber,
      contactPersonName, district, roles, emailForAuth,
    } = req.body;

    // Verify the ID token from the client — this proves the Firebase
    // user was already created successfully by the frontend SDK.
    if (!idToken) {
      return res.status(400).json({ success: false, message: 'ID token is required.' });
    }
    const decodedToken = await auth.verifyIdToken(idToken);
    const uid = decodedToken.uid;

    // Check if a Firestore profile already exists for this UID
    const existing = await getUserById(uid);
    if (existing) {
      return res.status(409).json({ success: false, message: 'An account profile already exists for this user.' });
    }

    // Save user document in Firestore
    const userDoc = await createUser(uid, {
      email: emailForAuth || decodedToken.email || '',
      phone: phone || '',
      nic: nic || '',
      fullName: fullName || '',
      accountType: accountType || 'individual',
      businessName: businessName || '',
      businessRegistrationNumber: businessRegistrationNumber || '',
      contactPersonName: contactPersonName || '',
      district: district || '',
      roles: roles || [],
      provider: 'email',
      emailVerified: decodedToken.email_verified || false,
    });

    // Set custom claims for roles
    await auth.setCustomUserClaims(uid, { roles: roles || [] });

    return res.status(201).json({
      success: true,
      message: 'Account created successfully.',
      user: sanitizeUser(userDoc),
      dashboardRoute: getDashboardRoute(roles || []),
    });
  } catch (error) {
    console.error('Register error:', error);
    if (error.code === 'auth/argument-error' || error.code === 'auth/id-token-expired') {
      return res.status(401).json({ success: false, message: 'Invalid or expired session. Please try again.' });
    }
    res.status(500).json({ success: false, message: error.message });
  }
}

// ──────────────────────────────────────────────────────────────
// loginVerify — verify Firebase ID token from client login
// ──────────────────────────────────────────────────────────────
async function loginVerify(req, res) {
  try {
    const { idToken } = req.body;
    if (!idToken) return res.status(400).json({ success: false, message: 'ID token is required.' });

    const decodedToken = await auth.verifyIdToken(idToken);
    const user = await getUserById(decodedToken.uid);

    if (!user) return res.status(404).json({ success: false, message: 'User not found. Please register first.' });
    if (!user.isActive) return res.status(403).json({ success: false, message: 'Account is deactivated.' });

    await updateLastLogin(decodedToken.uid);

    return res.status(200).json({
      success: true,
      message: 'Login verified.',
      user: sanitizeUser(user),
      dashboardRoute: getDashboardRoute(user.roles),
    });
  } catch (error) {
    console.error('Login verify error:', error);
    res.status(401).json({ success: false, message: 'Token verification failed.' });
  }
}

// ──────────────────────────────────────────────────────────────
// socialLogin — Google / Facebook OAuth
// ──────────────────────────────────────────────────────────────
async function socialLogin(req, res) {
  try {
    const { idToken, provider } = req.body;
    const decodedToken = await auth.verifyIdToken(idToken);
    let user = await getUserById(decodedToken.uid);

    if (!user) {
      user = await createUser(decodedToken.uid, {
        email: decodedToken.email || '',
        fullName: decodedToken.name || '',
        provider,
        roles: [],
        emailVerified: true,
      });
    }

    await updateLastLogin(decodedToken.uid);

    return res.status(200).json({
      success: true,
      message: 'Social login successful.',
      user: sanitizeUser(user),
      dashboardRoute: getDashboardRoute(user.roles),
    });
  } catch (error) {
    console.error('Social login error:', error);
    res.status(401).json({ success: false, message: 'Social login failed.' });
  }
}

// ──────────────────────────────────────────────────────────────
// OTP Functions
// ──────────────────────────────────────────────────────────────
async function sendOTP(req, res) {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ success: false, message: 'Email is required.' });

    // Check user exists (to prevent sending OTP to non-existent users)
    const user = await getUserByEmail(email);
    if (!user) return res.status(404).json({ success: false, message: 'No account found with this email.' });

    const otp = generateOTP();
    otpStore[email] = { otp, expiresAt: Date.now() + 10 * 60 * 1000 };

    await transporter.sendMail({
      from: `"NagroMS" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'NagroMS — Password Reset OTP',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 32px; background: #f0fdf4; border-radius: 12px;">
          <h1 style="color: #16a34a; font-size: 24px; text-align: center;">🌾 NagroMS</h1>
          <div style="background: white; border-radius: 12px; padding: 28px; text-align: center; margin-top: 20px;">
            <h2 style="color: #1a3a1a;">Password Reset OTP</h2>
            <p style="color: #6b7280;">Use this code to reset your password. It expires in 10 minutes.</p>
            <div style="background: #f0fdf4; border: 2px dashed #16a34a; border-radius: 12px; padding: 20px; margin: 24px 0;">
              <span style="font-size: 42px; font-weight: 800; letter-spacing: 12px; color: #16a34a;">${otp}</span>
            </div>
          </div>
        </div>
      `,
    });

    return res.status(200).json({ success: true, message: 'OTP sent to your email.' });
  } catch (error) {
    console.error('Send OTP error:', error);
    return res.status(500).json({ success: false, message: 'Failed to send OTP.' });
  }
}

async function verifyOTP(req, res) {
  try {
    const { email, otp } = req.body;
    const record = otpStore[email];

    if (!record) return res.status(400).json({ success: false, message: 'No OTP requested for this email.' });
    if (Date.now() > record.expiresAt) {
      delete otpStore[email];
      return res.status(400).json({ success: false, message: 'OTP has expired.' });
    }
    if (record.otp !== otp.toString()) return res.status(400).json({ success: false, message: 'Incorrect OTP.' });

    otpStore[email].verified = true;
    return res.status(200).json({ success: true, message: 'OTP verified.' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}

async function resetPassword(req, res) {
  try {
    const { email, newPassword } = req.body;
    const record = otpStore[email];

    if (!record || !record.verified) return res.status(400).json({ success: false, message: 'Please verify OTP first.' });

    const firebaseUser = await auth.getUserByEmail(email);
    await auth.updateUser(firebaseUser.uid, { password: newPassword });
    delete otpStore[email];

    return res.status(200).json({ success: true, message: 'Password reset successfully.' });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
}

// ──────────────────────────────────────────────────────────────
// User Profile & Roles
// ──────────────────────────────────────────────────────────────
async function getProfile(req, res) {
  try {
    const user = await getUserById(req.user.uid);
    if (!user) return res.status(404).json({ success: false, message: 'Profile not found.' });
    return res.status(200).json({ success: true, user: sanitizeUser(user) });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}

async function updateUserRoles(req, res) {
  try {
    const { roles } = req.body;
    if (!Array.isArray(roles)) return res.status(400).json({ success: false, message: 'Roles must be an array.' });

    const updated = await updateRoles(req.user.uid, roles);
    await auth.setCustomUserClaims(req.user.uid, { roles });

    return res.status(200).json({ success: true, user: sanitizeUser(updated) });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}

// ──────────────────────────────────────────────────────────────
// Utility Functions
// ──────────────────────────────────────────────────────────────
async function findUser(req, res) {
  try {
    const { email } = req.body;
    const user = await getUserByEmail(email);
    return res.status(200).json({
      success: true,
      exists: !!user,
      provider: user?.provider || null,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}

async function checkAvailability(req, res) {
  try {
    const { email, phone, nic } = req.body;
    if (email) {
      const snap = await db.collection('users').where('email', '==', email).limit(1).get();
      if (!snap.empty) return res.status(409).json({ success: false, message: 'Email already in use.' });
    }
    if (phone) {
      const snap = await db.collection('users').where('phone', '==', phone).limit(1).get();
      if (!snap.empty) return res.status(409).json({ success: false, message: 'Phone already registered.' });
    }
    if (nic) {
      const snap = await db.collection('users').where('nic', '==', nic).limit(1).get();
      if (!snap.empty) return res.status(409).json({ success: false, message: 'NIC already registered.' });
    }
    return res.status(200).json({ success: true, message: 'Available' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}

module.exports = {
  register, loginVerify, socialLogin, findUser, checkAvailability,
  sendOTP, verifyOTP, resetPassword,
  getProfile, updateUserRoles,
};

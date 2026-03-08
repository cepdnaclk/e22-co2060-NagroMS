// ============================================================
// NagroMS — controllers/authController.js
// ============================================================

const { auth, db } = require('../config/firebase');
const nodemailer = require('nodemailer');
const {
  createUser, getUserById, getUserByEmail,
  updateUser, updateLastLogin, updateRoles,
  userExists, VALID_ROLES, VALID_ACCOUNT_TYPES,
} = require('../models/userModel');

// ── In-memory OTP store (uid -> { otp, expiry }) ────────────
const otpStore = {};

// ── Email transporter (Gmail) ───────────────────────────────
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});

// ── Generate 6-digit OTP ────────────────────────────────────
function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// ============================================================
// REGISTER
// POST /api/auth/register
// ============================================================
async function register(req, res) {
  try {
    const {
      idToken, roles, accountType, fullName, nic, district,
      phone, email, businessName, businessRegistrationNumber, contactPersonName,
    } = req.body;
    const emailForAuth = req.body.emailForAuth;

    if (!idToken)
      return res.status(400).json({ success: false, message: 'idToken is required.' });
    if (!roles || !Array.isArray(roles) || roles.length === 0)
      return res.status(400).json({ success: false, message: 'At least one role is required.' });

    const invalidRoles = roles.filter(r => !VALID_ROLES.includes(r));
    if (invalidRoles.length > 0)
      return res.status(400).json({ success: false, message: `Invalid roles: ${invalidRoles.join(', ')}` });

    let decodedToken;
    try { decodedToken = await auth.verifyIdToken(idToken); }
    catch { return res.status(401).json({ success: false, message: 'Invalid or expired token.' }); }

    const uid = decodedToken.uid;
    if (await userExists(uid))
      return res.status(409).json({ success: false, message: 'User already exists. Please log in.' });

    const provider = decodedToken.firebase?.sign_in_provider || 'password';
    const providerLabel = provider === 'google.com' ? 'google' : provider === 'facebook.com' ? 'facebook' : 'email';

    const userData = {
      email: req.body.emailForAuth || email || decodedToken.email || '',
      phone: phone || '',
      roles, accountType: accountType || 'individual',
      district: district || '',
      emailVerified: decodedToken.email_verified || false,
      provider: providerLabel,
      fullName: fullName || decodedToken.name || '',
      nic: nic || '',
      businessName: businessName || '',
      businessRegistrationNumber: businessRegistrationNumber || '',
      contactPersonName: contactPersonName || '',
    };

    const userDoc = await createUser(uid, userData);
    await auth.setCustomUserClaims(uid, { roles });

    return res.status(201).json({ success: true, message: 'Account created.', user: sanitizeUser(userDoc) });
  } catch (error) {
    console.error('Register error:', error);
    return res.status(500).json({ success: false, message: 'Registration failed.' });
  }
}

// ============================================================
// LOGIN VERIFY
// POST /api/auth/login
// ============================================================
async function loginVerify(req, res) {
  try {
    const { idToken } = req.body;
    const emailForAuth = req.body.emailForAuth;
    if (!idToken)
      return res.status(400).json({ success: false, message: 'idToken is required.' });

    let decodedToken;
    try { decodedToken = await auth.verifyIdToken(idToken); }
    catch { return res.status(401).json({ success: false, message: 'Invalid or expired token.' }); }

    const userProfile = await getUserById(decodedToken.uid);
    if (!userProfile)
      return res.status(404).json({ success: false, message: 'Profile not found. Please register.' });
    if (!userProfile.isActive)
      return res.status(403).json({ success: false, message: 'Account deactivated.' });

    await updateLastLogin(decodedToken.uid);

    return res.status(200).json({
      success: true,
      message: 'Login successful.',
      user: sanitizeUser(userProfile),
      dashboardRoute: getDashboardRoute(userProfile.roles),
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ success: false, message: 'Login failed.' });
  }
}

// ============================================================
// SOCIAL LOGIN
// POST /api/auth/social-login
// ============================================================
async function socialLogin(req, res) {
  try {
    const { idToken, roles } = req.body;
    const emailForAuth = req.body.emailForAuth;
    if (!idToken)
      return res.status(400).json({ success: false, message: 'idToken is required.' });

    let decodedToken;
    try { decodedToken = await auth.verifyIdToken(idToken); }
    catch { return res.status(401).json({ success: false, message: 'Invalid token.' }); }

    const uid = decodedToken.uid;
    const existingUser = await getUserById(uid);
    if (existingUser) {
      await updateLastLogin(uid);
      return res.status(200).json({
        success: true, message: 'Login successful.',
        user: sanitizeUser(existingUser), isNewUser: false,
        dashboardRoute: getDashboardRoute(existingUser.roles),
      });
    }

    const provider = decodedToken.firebase?.sign_in_provider || 'google.com';
    const assignedRoles = (roles && roles.length > 0)
      ? roles.filter(r => VALID_ROLES.includes(r)) : ['customer'];

    const userData = {
      email: decodedToken.email || '', phone: '',
      fullName: decodedToken.name || '', roles: assignedRoles,
      accountType: 'individual', emailVerified: decodedToken.email_verified || false,
      provider: provider === 'facebook.com' ? 'facebook' : 'google',
    };

    const newUser = await createUser(uid, userData);
    await auth.setCustomUserClaims(uid, { roles: assignedRoles });

    return res.status(201).json({
      success: true, message: 'Account created.',
      user: sanitizeUser(newUser), isNewUser: true,
      dashboardRoute: getDashboardRoute(assignedRoles),
    });
  } catch (error) {
    console.error('Social login error:', error);
    return res.status(500).json({ success: false, message: 'Social login failed.' });
  }
}

// ============================================================
// SEND OTP — POST /api/auth/send-otp
// Body: { email }
// ============================================================
async function sendOTP(req, res) {
  try {
    const { email } = req.body;
    const emailForAuth = req.body.emailForAuth;
    if (!email)
      return res.status(400).json({ success: false, message: 'Email is required.' });

    // Check user exists in Firebase Auth
    let firebaseUser;
    try { firebaseUser = await auth.getUserByEmail(email); }
    catch {
      // Don't reveal if email exists — just return success
      return res.status(200).json({ success: true, message: 'If this email is registered, an OTP has been sent.' });
    }

    // Generate OTP and store with 10-minute expiry
    const otp    = generateOTP();
    const expiry = Date.now() + 10 * 60 * 1000; // 10 minutes
    otpStore[email] = { otp, expiry };

    console.log(`OTP for ${email}: ${otp}`); // visible in backend terminal (dev only)

    // Send email
    await transporter.sendMail({
      from:    `"NagroMS" <${process.env.GMAIL_USER}>`,
      to:      email,
      subject: 'NagroMS — Your Password Reset OTP',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 32px; background: #f0fdf4; border-radius: 12px;">
          <div style="text-align: center; margin-bottom: 24px;">
            <h1 style="color: #16a34a; font-size: 24px; margin: 0;">🌾 NagroMS</h1>
            <p style="color: #6b7280; font-size: 14px;">Agro Management System</p>
          </div>
          <div style="background: white; border-radius: 12px; padding: 28px; text-align: center;">
            <h2 style="color: #1a3a1a; margin-bottom: 8px;">Password Reset OTP</h2>
            <p style="color: #6b7280; margin-bottom: 24px;">Use this code to reset your password. It expires in <strong>10 minutes</strong>.</p>
            <div style="background: #f0fdf4; border: 2px dashed #16a34a; border-radius: 12px; padding: 20px; margin-bottom: 24px;">
              <span style="font-size: 42px; font-weight: 800; letter-spacing: 12px; color: #16a34a;">${otp}</span>
            </div>
            <p style="color: #9ca3af; font-size: 13px;">If you did not request this, please ignore this email.</p>
          </div>
          <p style="text-align: center; color: #9ca3af; font-size: 12px; margin-top: 20px;">© NagroMS · Sri Lanka</p>
        </div>
      `,
    });

    return res.status(200).json({ success: true, message: 'OTP sent to your email.' });
  } catch (error) {
    console.error('Send OTP error:', error);
    return res.status(500).json({ success: false, message: 'Failed to send OTP. Check Gmail config.' });
  }
}

// ============================================================
// VERIFY OTP — POST /api/auth/verify-otp
// Body: { email, otp }
// ============================================================
async function verifyOTP(req, res) {
  try {
    const { email, otp } = req.body;
    const emailForAuth = req.body.emailForAuth;
    if (!email || !otp)
      return res.status(400).json({ success: false, message: 'Email and OTP are required.' });

    const stored = otpStore[email];
    if (!stored)
      return res.status(400).json({ success: false, message: 'No OTP found. Please request a new one.' });

    if (Date.now() > stored.expiry) {
      delete otpStore[email];
      return res.status(400).json({ success: false, message: 'OTP expired. Please request a new one.' });
    }

    if (stored.otp !== otp.toString())
      return res.status(400).json({ success: false, message: 'Incorrect OTP. Please try again.' });

    // OTP is valid — delete it so it can't be reused
    delete otpStore[email];

    // Generate a Firebase password reset link to return to frontend
    const resetLink = await auth.generatePasswordResetLink(email);

    return res.status(200).json({
      success: true,
      message: 'OTP verified.',
      resetLink, // frontend opens this link or uses it
    });
  } catch (error) {
    console.error('Verify OTP error:', error);
    return res.status(500).json({ success: false, message: 'OTP verification failed.' });
  }
}

// ============================================================
// RESET PASSWORD — POST /api/auth/reset-password
// Body: { email, newPassword }
// Uses Firebase Admin to update password directly
// ============================================================
async function resetPassword(req, res) {
  try {
    const { email, newPassword } = req.body;
    const emailForAuth = req.body.emailForAuth;
    if (!email || !newPassword)
      return res.status(400).json({ success: false, message: 'Email and new password are required.' });
    if (newPassword.length < 6)
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters.' });

    // Get Firebase user by email
    const firebaseUser = await auth.getUserByEmail(email);

    // Update password via Admin SDK
    await auth.updateUser(firebaseUser.uid, { password: newPassword });

    return res.status(200).json({ success: true, message: 'Password updated successfully.' });
  } catch (error) {
    console.error('Reset password error:', error);
    if (error.code === 'auth/user-not-found')
      return res.status(404).json({ success: false, message: 'User not found.' });
    return res.status(500).json({ success: false, message: 'Failed to reset password.' });
  }
}

// ============================================================
// GET PROFILE — GET /api/auth/profile
// ============================================================
async function getProfile(req, res) {
  try {
    const userProfile = await getUserById(req.user.uid);
    if (!userProfile)
      return res.status(404).json({ success: false, message: 'Profile not found.' });
    return res.status(200).json({ success: true, user: sanitizeUser(userProfile) });
  } catch (error) {
    console.error('Get profile error:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch profile.' });
  }
}

// ============================================================
// UPDATE ROLES — PUT /api/auth/roles
// ============================================================
async function updateUserRoles(req, res) {
  try {
    const { roles } = req.body;
    const emailForAuth = req.body.emailForAuth;
    if (!roles || !Array.isArray(roles) || roles.length === 0)
      return res.status(400).json({ success: false, message: 'roles array is required.' });

    const invalidRoles = roles.filter(r => !VALID_ROLES.includes(r));
    if (invalidRoles.length > 0)
      return res.status(400).json({ success: false, message: `Invalid roles: ${invalidRoles.join(', ')}` });

    const updatedUser = await updateRoles(req.user.uid, roles);
    await auth.setCustomUserClaims(req.user.uid, { roles });

    return res.status(200).json({ success: true, message: 'Roles updated.', user: sanitizeUser(updatedUser) });
  } catch (error) {
    console.error('Update roles error:', error);
    return res.status(500).json({ success: false, message: 'Failed to update roles.' });
  }
}

// ── Helpers ──────────────────────────────────────────────────
function sanitizeUser(user) {
  if (!user) return null;
  const { nic, ...safe } = user;
  return safe;
}

function getDashboardRoute(roles) {
  if (!roles || roles.length === 0) return 'login';
  const map = {
    'farmer':           'farmer-dashboard',
    'customer':         'customer-dashboard',
    'service-provider': 'service-provider-dashboard',
    'expert':           'expert-dashboard',
  };
  return map[roles[0]] || 'login';
}

// NOTE: findUser added above
module.exports = {
  register, loginVerify, socialLogin, findUser,
  sendOTP, verifyOTP, resetPassword,
  getProfile, updateUserRoles,
};

// ============================================================
// FIND USER BY PHONE OR NIC
// POST /api/auth/find-user
// Used by: LoginPage when user logs in with phone or NIC
// Body: { phone } OR { nic }
// Returns: { email } so frontend can call Firebase with email
// ============================================================
async function findUser(req, res) {
  try {
    const { phone, nic } = req.body;
    const emailForAuth = req.body.emailForAuth;

    if (!phone && !nic)
      return res.status(400).json({ success: false, message: 'Phone or NIC is required.' });

    let snap;
    if (phone) {
      snap = await db.collection('users').where('phone', '==', phone).limit(1).get();
    } else {
      // Support both old (123456789V) and new (200012345678) NIC formats
      snap = await db.collection('users').where('nic', '==', nic).limit(1).get();
    }

    if (snap.empty)
      return res.status(404).json({ success: false, message: 'No account found.' });

    const userData = snap.docs[0].data();
    if (!userData.email)
      return res.status(404).json({ success: false, message: 'This account has no email. Please contact support.' });

    return res.status(200).json({ success: true, email: userData.email });
  } catch (error) {
    console.error('Find user error:', error);
    return res.status(500).json({ success: false, message: 'Lookup failed.' });
  }
}
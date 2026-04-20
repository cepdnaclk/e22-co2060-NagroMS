// ============================================================
// NagroMS — middleware/authMiddleware.js
// Firebase ID Token verification + role-based access control
// ============================================================

const { auth } = require('../config/firebase');
const { getUserById, createUser } = require('../models/userModel');

// ──────────────────────────────────────────────────────────────
// verifyToken
// Extracts Bearer token from Authorization header,
// verifies it with Firebase Admin, attaches decoded user to req
// ──────────────────────────────────────────────────────────────
async function verifyToken(req, res, next) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. No token provided.',
      });
    }

    const idToken = authHeader.split('Bearer ')[1];

    // Verify the Firebase ID token
    const decodedToken = await auth.verifyIdToken(idToken);

    // Fetch full user profile from Firestore
    let userProfile = await getUserById(decodedToken.uid);

    if (!userProfile) {
      // Auto-create profile if missing (resiliency)
      console.log(`Auto-creating missing Firestore profile for UID: ${decodedToken.uid}`);
      userProfile = await createUser(decodedToken.uid, {
        email: decodedToken.email || '',
        fullName: decodedToken.name || '',
        roles: ['farmer'], // Default to farmer for now since they are in the dashboard
        isActive: true,
        provider: 'auto-created'
      });
    }

    if (!userProfile.isActive) {
      return res.status(403).json({
        success: false,
        message: 'Your account has been deactivated. Contact support.',
      });
    }

    // Attach both decoded token and Firestore profile to request
    req.user = {
      uid:         decodedToken.uid,
      email:       decodedToken.email,
      roles:       userProfile.roles || [],
      accountType: userProfile.accountType,
      profile:     userProfile,
    };

    next();
  } catch (error) {
    console.error('Token verification error:', error.code, error.message);

    if (error.code === 'auth/id-token-expired') {
      return res.status(401).json({
        success: false,
        message: 'Session expired. Please log in again.',
      });
    }
    if (error.code === 'auth/argument-error' ||
        error.code === 'auth/id-token-revoked') {
      return res.status(401).json({
        success: false,
        message: 'Invalid token. Please log in again.',
      });
    }

    return res.status(401).json({
      success: false,
      message: 'Authentication failed.',
    });
  }
}

// ──────────────────────────────────────────────────────────────
// requireRole(...roles)
// Usage: router.get('/farmers', verifyToken, requireRole('farmer'), ...)
// Accepts one or more roles — user must have AT LEAST ONE
// ──────────────────────────────────────────────────────────────
function requireRole(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Not authenticated.',
      });
    }

    const userRoles = req.user.roles || [];
    const hasRole = allowedRoles.some(role => userRoles.includes(role));

    if (!hasRole) {
      return res.status(403).json({
        success: false,
        message: `Access denied. Required role(s): ${allowedRoles.join(', ')}`,
        yourRoles: userRoles,
      });
    }

    next();
  };
}

// ──────────────────────────────────────────────────────────────
// requireAllRoles(...roles)
// User must have ALL of the specified roles
// ──────────────────────────────────────────────────────────────
function requireAllRoles(...requiredRoles) {
  return (req, res, next) => {
    const userRoles = req.user?.roles || [];
    const hasAll = requiredRoles.every(role => userRoles.includes(role));

    if (!hasAll) {
      return res.status(403).json({
        success: false,
        message: 'Insufficient permissions.',
      });
    }
    next();
  };
}

module.exports = { verifyToken, requireRole, requireAllRoles };
// ============================================================
// NagroMS — middleware/authMiddleware.js
// Firebase ID Token verification + role-based access control
// ============================================================

const { auth } = require('../config/firebase');
const { getUserById, createUser } = require('../models/userModel');

// ──────────────────────────────────────────────────────────────
// verifyToken — verify Firebase Bearer token
// ──────────────────────────────────────────────────────────────
async function verifyToken(req, res, next) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, message: 'Access denied. No token provided.' });
    }

    const idToken = authHeader.split('Bearer ')[1];
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
      uid: decodedToken.uid,
      email: decodedToken.email,
      roles: decodedToken.roles || [],
    };

    next();
  } catch (error) {
    console.error('Token verification error:', error.code, error.message);

    if (error.code === 'auth/id-token-expired') {
      return res.status(401).json({ success: false, message: 'Session expired. Please log in again.' });
    }
    return res.status(401).json({ success: false, message: 'Authentication failed.' });
  }
}

// Alias for backward compatibility
const authMiddleware = verifyToken;

// ──────────────────────────────────────────────────────────────
// requireRole(...roles) — user must have at least one role
// ──────────────────────────────────────────────────────────────
function requireRole(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) return res.status(401).json({ success: false, message: 'Not authenticated.' });

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

module.exports = { verifyToken, authMiddleware, requireRole };

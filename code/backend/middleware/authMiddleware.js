// ============================================================
// NagroMS — middleware/authMiddleware.js
// Firebase ID Token verification + role-based access control
// ============================================================

const { auth } = require('../config/firebase');

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

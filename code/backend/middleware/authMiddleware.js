const { auth, db } = require("../config/firebase");

/**
 * Verifies Firebase ID token sent in Authorization header.
 * Attaches req.user = { uid, email, role } for use in controllers.
 *
 * Frontend must send:
 *   Authorization: Bearer <idToken>
 */
async function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Unauthorized — no token provided" });
  }

  const idToken = authHeader.split("Bearer ")[1];

  try {
    // Verify the token with Firebase Admin
    const decoded = await auth.verifyIdToken(idToken);

    // Get user role from Firestore users collection
    const userDoc = await db.collection("users").doc(decoded.uid).get();
    const roles = userDoc.exists ? (userDoc.data().roles || []) : [];
    req.user = {
         uid: decoded.uid, 
         email: decoded.email, 
         roles };

    next();
  } catch (err) {
    console.error("Auth middleware error:", err.message);
    return res.status(401).json({ error: "Unauthorized — invalid token" });
  }
}

/**
 * Role guard — use after authMiddleware
 * Usage: requireRole("expert")
 */
function requireRole(role) {
  return (req, res, next) => {
    if (!req.user?.roles?.includes(role)) {
      return res.status(403).json({ error: `Forbidden — requires role: ${role}` });
    }
    next();
  };
}

module.exports = { authMiddleware, requireRole };
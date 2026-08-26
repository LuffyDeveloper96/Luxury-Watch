import jwt from 'jsonwebtoken';
import { db } from '../config/db.js';

const JWT_SECRET = process.env.JWT_SECRET || 'luxury_watch_geneva_master_jwt_secret_2026';

/**
 * Generate signed JWT token
 */
export const generateToken = (payload, expiresIn = '7d') => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn });
};

/**
 * Require valid JWT authentication for any registered user
 */
export const requireAuth = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Authentication token required. Please sign in.'
      });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired session token. Please sign in again.'
    });
  }
};

/**
 * Strict Single Administrator Guard
 * Verifies that the authenticated session strictly belongs to the single designated Master Administrator account.
 */
export const requireAdmin = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Master Admin authorization required.'
      });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET);

    const authorizedEmail = (
      db.getMeta('authorizedAdminGmail') ||
      process.env.AUTHORIZED_ADMIN_GMAIL ||
      process.env.ADMIN_EMAIL ||
      'admin@luxurywatch.com'
    ).trim().toLowerCase();

    if (!decoded.email || decoded.email.trim().toLowerCase() !== authorizedEmail) {
      return res.status(403).json({
        success: false,
        message: 'Access Denied: Only the single designated Master Administrator account has access.'
      });
    }

    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({
      success: false,
      message: 'Admin authorization session expired. Please re-authenticate.'
    });
  }
};

export default {
  generateToken,
  requireAuth,
  requireAdmin
};

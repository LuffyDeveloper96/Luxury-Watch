import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';

/**
 * Generate signed JWT token
 */
export const generateToken = (payload, expiresIn = '7d') => {
  const jwtSecret = env.JWT_SECRET || process.env.JWT_SECRET;
  if (!jwtSecret) {
    throw new Error('JWT Secret is not configured.');
  }
  return jwt.sign(payload, jwtSecret, { expiresIn });
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
    const jwtSecret = env.JWT_SECRET || process.env.JWT_SECRET;
    if (!jwtSecret) {
      return res.status(500).json({
        success: false,
        message: 'Authentication service configuration error.'
      });
    }

    const decoded = jwt.verify(token, jwtSecret);
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
    const jwtSecret = env.JWT_SECRET || process.env.JWT_SECRET;
    if (!jwtSecret) {
      return res.status(500).json({
        success: false,
        message: 'Authentication service configuration error.'
      });
    }

    const decoded = jwt.verify(token, jwtSecret);

    const authorizedEmail = (
      env.ADMIN_EMAIL ||
      process.env.ADMIN_EMAIL ||
      process.env.AUTHORIZED_ADMIN_GMAIL ||
      ''
    ).trim().toLowerCase();

    if (!authorizedEmail || !decoded.email || decoded.email.trim().toLowerCase() !== authorizedEmail) {
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

import bcrypt from 'bcryptjs';
import { generateToken } from '../middleware/auth.js';
import { db } from '../config/db.js';
import { env } from '../config/env.js';

export const adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Admin email and password are required.'
      });
    }

    const cleanEmail = (email || '').trim().toLowerCase();
    const authorizedEmail = (
      env.ADMIN_EMAIL ||
      process.env.ADMIN_EMAIL ||
      process.env.AUTHORIZED_ADMIN_GMAIL ||
      db.getMeta('authorizedAdminGmail') ||
      ''
    ).trim().toLowerCase();

    // Strict Single Master Admin Email Check
    if (!authorizedEmail || cleanEmail !== authorizedEmail) {
      return res.status(403).json({
        success: false,
        message: 'Access Denied: Only the designated Master Administrator is authorized to access the Admin Panel.'
      });
    }

    const adminHash = env.ADMIN_PASSWORD_HASH || process.env.ADMIN_PASSWORD_HASH;
    if (!adminHash) {
      return res.status(500).json({
        success: false,
        message: 'Admin authentication is not configured on the server.'
      });
    }

    const isMatch = await bcrypt.compare(password, adminHash);

    if (isMatch) {
      const userPayload = {
        email: cleanEmail,
        role: 'Grand Horologist / Master Administrator',
        sessionId: `LW-SESS-${Date.now()}`
      };

      const token = generateToken(userPayload);

      // Log admin login to activity log (without passwords or secrets)
      db.insert('activityLog', {
        id: `act-${Date.now()}`,
        text: `Master Admin authenticated session #${userPayload.sessionId.slice(-6)}`,
        time: 'Just now',
        type: 'admin'
      });

      return res.json({
        success: true,
        message: 'Master Admin authenticated successfully.',
        token,
        user: {
          ...userPayload,
          loginTime: new Date().toLocaleTimeString()
        }
      });
    }

    return res.status(401).json({
      success: false,
      message: 'Invalid Master Security Password.'
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Authentication error occurred.' });
  }
};

export const adminVerify = (req, res) => {
  return res.json({
    success: true,
    user: req.user
  });
};

export default {
  adminLogin,
  adminVerify
};

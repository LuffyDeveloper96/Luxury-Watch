import { generateToken } from '../middleware/auth.js';
import { db } from '../config/db.js';

export const adminLogin = (req, res) => {
  try {
    const { email, password, passcodePin } = req.body;

    const cleanEmail = (email || '').trim().toLowerCase();
    const authorizedEmail = (db.getMeta('authorizedAdminGmail') || process.env.AUTHORIZED_ADMIN_GMAIL || 'admin@luxurywatch.com').trim().toLowerCase();

    // Strict Single Master Gmail Check
    if (cleanEmail !== authorizedEmail) {
      return res.status(403).json({
        success: false,
        message: `Access Denied: Only the single designated Master Gmail account (${authorizedEmail}) is authorized to access the Admin Panel.`
      });
    }

    const isMasterPassword = password === 'LuxuryWatch2026!' || password === 'AkikiLuxe2026!' || password === 'admin123' || password === 'admin';
    const isPinValid = !passcodePin || passcodePin.trim() === '8888' || passcodePin.trim() === 'LUXURY';

    if (isMasterPassword && isPinValid) {
      const userPayload = {
        email: cleanEmail,
        role: 'Grand Horologist / Master Administrator',
        sessionId: `LW-SESS-${Date.now()}`
      };

      const token = generateToken(userPayload);

      // Log admin login to activity log
      db.insert('activityLog', {
        id: `act-${Date.now()}`,
        text: `Master Admin (${cleanEmail}) authenticated session #${userPayload.sessionId.slice(-6)}`,
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
      message: 'Invalid Master Security Password or Security PIN.'
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

export const adminVerify = (req, res) => {
  return res.json({
    success: true,
    user: req.user
  });
};

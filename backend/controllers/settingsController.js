import { db } from '../config/db.js';

// Default Merchant Payment Gateway Setup
const DEFAULT_PAYMENT_SETTINGS = {
  merchantName: 'Luxury Watch Haute Horlogerie',
  upiId: 'luxurywatch@okhdfcbank',
  bankName: 'HDFC Bank Ltd.',
  accountHolder: 'LUXURY WATCH INDIA PRIVATE LIMITED',
  accountNumber: '50200088991122',
  ifscCode: 'HDFC0000060',
  branch: 'Bandra Kurla Complex (BKC), Mumbai',
  qrCodeUrl: '', // Optional custom QR
  enableUpi: true,
  enableCard: true,
  enableNetbanking: true,
  paymentNotes: 'Please complete payment and enter the 12-digit UPI UTR / Bank Reference Number to verify your order.'
};

export const getPaymentSettings = (req, res) => {
  try {
    const settings = db.getMeta('paymentSettings') || DEFAULT_PAYMENT_SETTINGS;
    return res.json({
      success: true,
      settings
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

export const updatePaymentSettings = (req, res) => {
  try {
    const current = db.getMeta('paymentSettings') || DEFAULT_PAYMENT_SETTINGS;
    const updated = {
      ...current,
      ...req.body,
      updatedAt: new Date().toISOString()
    };

    db.setMeta('paymentSettings', updated);

    // Log to activity
    db.insert('activityLog', {
      id: `act-${Date.now()}`,
      text: `Master Administrator updated Merchant Payment Gateway & UPI settings`,
      time: 'Just now',
      type: 'settings'
    });

    return res.json({
      success: true,
      message: 'Merchant payment gateway details updated successfully.',
      settings: updated
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

export const getAdminSecuritySettings = (req, res) => {
  try {
    const authorizedEmail = db.getMeta('authorizedAdminGmail') || process.env.AUTHORIZED_ADMIN_GMAIL || 'admin@luxurywatch.com';
    return res.json({
      success: true,
      authorizedEmail
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

export const updateAdminSecuritySettings = (req, res) => {
  try {
    const { authorizedEmail } = req.body;
    if (!authorizedEmail || !authorizedEmail.includes('@')) {
      return res.status(400).json({ success: false, message: 'Please provide a valid Gmail / Email address.' });
    }

    const cleanEmail = authorizedEmail.trim().toLowerCase();
    db.setMeta('authorizedAdminGmail', cleanEmail);

    db.insert('activityLog', {
      id: `act-${Date.now()}`,
      text: `Designated Master Admin Gmail updated to ${cleanEmail}`,
      time: 'Just now',
      type: 'security'
    });

    return res.json({
      success: true,
      message: `Master Admin authorization successfully locked to ${cleanEmail}`,
      authorizedEmail: cleanEmail
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

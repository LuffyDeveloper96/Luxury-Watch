import { db } from '../config/db.js';

// Default Merchant Payment Settings
const DEFAULT_PAYMENT_SETTINGS = {
  merchantName: 'Luxury Watch Haute Horlogerie',
  upiId: 'luxurywatch@okhdfcbank',
  bankName: 'HDFC Bank Ltd.',
  accountHolder: 'LUXURY WATCH INDIA PRIVATE LIMITED',
  accountNumber: '50200088991122',
  ifscCode: 'HDFC0000060',
  branch: 'Bandra Kurla Complex (BKC), Mumbai',
  qrCodeUrl: '',
  enableUpi: true,
  enableRazorpay: true,
  enableCard: true,
  enableNetbanking: true,
  paymentGatewayMode: 'test',
  razorpayKeyId: 'rzp_test_luxurywatch2026',
  razorpayKeySecret: 'luxury_secret_test_key_9988',
  paymentNotes: 'Please complete payment and enter the 12-digit UPI UTR / Bank Reference Number to verify your order.'
};

export const getPaymentSettings = (req, res) => {
  try {
    const raw = db.getMeta('paymentSettings') || DEFAULT_PAYMENT_SETTINGS;
    const sanitized = {
      ...raw,
      isSecretConfigured: Boolean(raw.razorpayKeySecret)
    };
    delete sanitized.razorpayKeySecret;
    return res.json({ success: true, settings: sanitized });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

export const updatePaymentSettings = (req, res) => {
  try {
    const current = db.getMeta('paymentSettings') || DEFAULT_PAYMENT_SETTINGS;
    const { razorpayKeySecret, ...restUpdates } = req.body;

    const updated = {
      ...current,
      ...restUpdates,
      updatedAt: new Date().toISOString()
    };

    // Only update secret key if non-masked new value is sent
    if (razorpayKeySecret && !razorpayKeySecret.includes('••••')) {
      updated.razorpayKeySecret = razorpayKeySecret;
    }

    db.setMeta('paymentSettings', updated);

    db.insert('activityLog', {
      id: `act-${Date.now()}`,
      text: `Master Administrator updated Merchant Payment Gateway & Razorpay credentials`,
      time: 'Just now',
      type: 'settings'
    });

    const sanitized = {
      ...updated,
      razorpayKeySecret: updated.razorpayKeySecret ? '••••••••••••••••' : ''
    };

    return res.json({
      success: true,
      message: 'Payment gateway configuration updated securely.',
      settings: sanitized
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

export const getStoreSettings = (req, res) => {
  try {
    const settings = db.getMeta('storeSettings') || {
      storeName: 'LUXURY WATCH',
      tagline: 'TIMELESS WATCHES. EXCEPTIONAL VALUE.',
      supportEmail: 'concierge@luxurywatch.com',
      supportPhone: '+91 22 6940 8800',
      address: 'Level 12, The Capital, Bandra Kurla Complex (BKC), Mumbai 400051',
      currency: 'INR',
      freeShippingThreshold: 999,
      standardShippingFee: 0,
      expressShippingFee: 499,
      returnWindowDays: 10
    };
    return res.json({ success: true, settings });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

export const updateStoreSettings = (req, res) => {
  try {
    const current = db.getMeta('storeSettings') || {};
    const updated = {
      ...current,
      ...req.body,
      updatedAt: new Date().toISOString()
    };

    db.setMeta('storeSettings', updated);

    db.insert('activityLog', {
      id: `act-${Date.now()}`,
      text: `Master Administrator updated general store policy and shipping rules`,
      time: 'Just now',
      type: 'settings'
    });

    return res.json({
      success: true,
      message: 'Store settings updated successfully.',
      settings: updated
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

export const getAdminSecuritySettings = (req, res) => {
  try {
    const authorizedEmail = (
      db.getMeta('authorizedAdminGmail') ||
      process.env.AUTHORIZED_ADMIN_GMAIL ||
      'admin@luxurywatch.com'
    ).trim().toLowerCase();

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
      return res.status(400).json({ success: false, message: 'Please provide a valid email address.' });
    }

    const cleanEmail = authorizedEmail.trim().toLowerCase();
    db.setMeta('authorizedAdminGmail', cleanEmail);

    db.insert('activityLog', {
      id: `act-${Date.now()}`,
      text: `Designated Master Admin Email updated to ${cleanEmail}`,
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

export default {
  getPaymentSettings,
  updatePaymentSettings,
  getStoreSettings,
  updateStoreSettings,
  getAdminSecuritySettings,
  updateAdminSecuritySettings
};

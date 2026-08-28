import { StoreSettings, ActivityLog } from '../models/index.js';
import { env } from '../config/env.js';

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
  razorpayKeyId: env.RAZORPAY_KEY_ID || process.env.RAZORPAY_KEY_ID || '',
  razorpayKeySecret: env.RAZORPAY_KEY_SECRET || process.env.RAZORPAY_KEY_SECRET || '',
  paymentNotes: 'Please complete payment and enter the 12-digit UPI UTR / Bank Reference Number to verify your order.'
};

const DEFAULT_STORE_SETTINGS = {
  key: 'global_settings',
  storeName: 'LUXURY WATCH',
  tagline: 'TIMELESS WATCHES. EXCEPTIONAL VALUE.',
  supportEmail: 'concierge@luxurywatch.com',
  supportPhone: '+91 22 6940 8800',
  address: 'Level 12, The Capital, Bandra Kurla Complex (BKC), Mumbai 400051',
  currency: 'INR',
  currencySymbol: '₹',
  freeShippingThreshold: 999,
  standardShippingFee: 0,
  expressShippingFee: 499,
  taxPercent: 18,
  returnWindowDays: 10,
  enableUpi: true,
  enableRazorpay: true,
  enableCard: true,
  enableNetbanking: true,
  paymentGatewayMode: 'test',
  razorpayKeyIdConfigured: Boolean(env.RAZORPAY_KEY_ID),
  razorpaySecretConfigured: Boolean(env.RAZORPAY_KEY_SECRET)
};

export const getPaymentSettings = async (req, res) => {
  try {
    const doc = await StoreSettings.findOne({ key: 'global_settings' }).lean();
    const raw = doc?.paymentSettings || DEFAULT_PAYMENT_SETTINGS;
    const hasSecret = Boolean(raw.razorpayKeySecret || env.RAZORPAY_KEY_SECRET);

    const sanitized = {
      ...raw,
      razorpayKeyId: raw.razorpayKeyId || env.RAZORPAY_KEY_ID || '',
      isSecretConfigured: hasSecret
    };
    delete sanitized.razorpayKeySecret;
    return res.json({ success: true, settings: sanitized });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

export const updatePaymentSettings = async (req, res) => {
  try {
    const doc = await StoreSettings.findOne({ key: 'global_settings' });
    const current = doc?.paymentSettings ? (doc.paymentSettings.toObject ? doc.paymentSettings.toObject() : doc.paymentSettings) : DEFAULT_PAYMENT_SETTINGS;
    const { razorpayKeySecret, ...restUpdates } = req.body;

    const updatedPaymentSettings = {
      ...current,
      ...restUpdates
    };

    // Only update secret key if non-masked new value is sent
    if (razorpayKeySecret && !razorpayKeySecret.includes('••••')) {
      updatedPaymentSettings.razorpayKeySecret = razorpayKeySecret;
    }

    const updatedDoc = await StoreSettings.findOneAndUpdate(
      { key: 'global_settings' },
      {
        $set: {
          paymentSettings: updatedPaymentSettings,
          updatedAt: new Date()
        }
      },
      { upsert: true, returnDocument: 'after' }
    );

    await ActivityLog.create({
      id: `act-${Date.now()}`,
      text: `Master Administrator updated Merchant Payment Gateway & Razorpay credentials`,
      time: 'Just now',
      type: 'settings'
    });

    const sanitized = {
      ...updatedPaymentSettings,
      razorpayKeySecret: updatedPaymentSettings.razorpayKeySecret ? '••••••••••••••••' : ''
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

export const getStoreSettings = async (req, res) => {
  try {
    const doc = await StoreSettings.findOne({ key: 'global_settings' }).lean();
    const settings = doc || DEFAULT_STORE_SETTINGS;
    return res.json({ success: true, settings });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

export const updateStoreSettings = async (req, res) => {
  try {
    const updates = { ...req.body };
    delete updates.adminEmail;
    delete updates.adminPassword;
    delete updates.adminPasswordHash;
    delete updates.authorizedAdminGmail;
    delete updates.key;

    const updatedDoc = await StoreSettings.findOneAndUpdate(
      { key: 'global_settings' },
      {
        $set: {
          ...updates,
          updatedAt: new Date()
        }
      },
      { upsert: true, returnDocument: 'after' }
    );

    await ActivityLog.create({
      id: `act-${Date.now()}`,
      text: `Master Administrator updated general store policy and shipping rules`,
      time: 'Just now',
      type: 'settings'
    });

    return res.json({
      success: true,
      message: 'Store settings updated successfully.',
      settings: updatedDoc
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

export const getAdminSecuritySettings = (req, res) => {
  try {
    const authorizedEmail = (env.ADMIN_EMAIL || process.env.ADMIN_EMAIL || '').trim().toLowerCase();

    return res.json({
      success: true,
      authorizedEmail
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

export const updateAdminSecuritySettings = async (req, res) => {
  try {
    const { authorizedEmail } = req.body;
    if (!authorizedEmail || !authorizedEmail.includes('@')) {
      return res.status(400).json({ success: false, message: 'Please provide a valid email address.' });
    }

    const cleanEmail = authorizedEmail.trim().toLowerCase();
    const currentAdmin = (env.ADMIN_EMAIL || process.env.ADMIN_EMAIL || '').trim().toLowerCase();

    await ActivityLog.create({
      id: `act-${Date.now()}`,
      text: `Designated Master Admin Email noted as ${cleanEmail}`,
      time: 'Just now',
      type: 'security'
    });

    return res.json({
      success: true,
      message: `Master Admin authorization is managed via environment configuration (Current: ${currentAdmin})`,
      authorizedEmail: currentAdmin || cleanEmail
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

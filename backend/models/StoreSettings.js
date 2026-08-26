import mongoose from 'mongoose';

const storeSettingsSchema = new mongoose.Schema({
  key: { type: String, required: true, unique: true, default: 'global_settings' },
  storeName: { type: String, default: 'LUXURY WATCH' },
  tagline: { type: String, default: 'TIMELESS WATCHES. EXCEPTIONAL VALUE.' },
  supportEmail: { type: String, default: 'concierge@luxurywatch.com' },
  supportPhone: { type: String, default: '+91 22 6940 8800' },
  address: { type: String, default: 'Level 12, The Capital, Bandra Kurla Complex (BKC), Mumbai 400051' },
  currency: { type: String, default: 'INR' },
  currencySymbol: { type: String, default: '₹' },
  freeShippingThreshold: { type: Number, default: 999 },
  standardShippingFee: { type: Number, default: 0 },
  expressShippingFee: { type: Number, default: 499 },
  taxPercent: { type: Number, default: 18 },
  returnWindowDays: { type: Number, default: 10 },
  enableUpi: { type: Boolean, default: true },
  enableRazorpay: { type: Boolean, default: true },
  enableCard: { type: Boolean, default: true },
  enableNetbanking: { type: Boolean, default: true },
  paymentGatewayMode: { type: String, enum: ['test', 'live'], default: 'test' },
  razorpayKeyIdConfigured: { type: Boolean, default: true },
  razorpaySecretConfigured: { type: Boolean, default: true },
  emailSmtpConfigured: { type: Boolean, default: false },
  metaTitle: { type: String, default: 'Luxury Watch — Timeless Watches. Exceptional Value.' },
  metaDescription: { type: String, default: 'Discover authentic branded luxury watches. Rolex, Omega, Patek Philippe, Audemars Piguet, Cartier, Breitling, TAG Heuer & Tissot.' },
  updatedAt: { type: Date, default: Date.now }
});

export const StoreSettings = mongoose.models.StoreSettings || mongoose.model('StoreSettings', storeSettingsSchema);
export default StoreSettings;

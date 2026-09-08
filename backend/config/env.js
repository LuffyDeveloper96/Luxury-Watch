import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env from backend directory first, then workspace root as fallback
dotenv.config({ path: path.resolve(__dirname, '../.env') });
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const NODE_ENV = process.env.NODE_ENV || 'development';
const isProduction = NODE_ENV === 'production';
const isDevelopment = NODE_ENV === 'development';

// Fail fast in production if mandatory variables are missing
if (isProduction) {
  const missing = [];
  if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) missing.push('JWT_SECRET (min 32 chars)');
  if (!process.env.ADMIN_EMAIL && !process.env.AUTHORIZED_ADMIN_GMAIL) missing.push('ADMIN_EMAIL');
  if (!process.env.ADMIN_PASSWORD_HASH) missing.push('ADMIN_PASSWORD_HASH');
  if (!process.env.MONGODB_URI) missing.push('MONGODB_URI');
  if (!process.env.RAZORPAY_KEY_ID) missing.push('RAZORPAY_KEY_ID');
  if (!process.env.RAZORPAY_KEY_SECRET) missing.push('RAZORPAY_KEY_SECRET');
  if (!process.env.FRONTEND_URL && !process.env.FRONTEND_URLS) missing.push('FRONTEND_URL');

  if (missing.length > 0) {
    throw new Error(
      `[FATAL CONFIG ERROR] Missing mandatory production environment variables: ${missing.join(', ')}. Server startup aborted.`
    );
  }
}

export const env = {
  NODE_ENV,
  isProduction,
  isDevelopment,
  PORT: parseInt(process.env.PORT || '5000', 10),
  MONGODB_URI: process.env.MONGODB_URI || '',
  JWT_SECRET: process.env.JWT_SECRET || '',
  ADMIN_EMAIL: (process.env.ADMIN_EMAIL || process.env.AUTHORIZED_ADMIN_GMAIL || '').trim().toLowerCase(),
  ADMIN_PASSWORD_HASH: process.env.ADMIN_PASSWORD_HASH || '',
  RAZORPAY_KEY_ID: process.env.RAZORPAY_KEY_ID || '',
  RAZORPAY_KEY_SECRET: process.env.RAZORPAY_KEY_SECRET || '',
  RAZORPAY_WEBHOOK_SECRET: process.env.RAZORPAY_WEBHOOK_SECRET || '',
  EMAIL_HOST: process.env.EMAIL_HOST || '',
  EMAIL_PORT: parseInt(process.env.EMAIL_PORT || '587', 10),
  EMAIL_USER: process.env.EMAIL_USER || '',
  EMAIL_PASSWORD: process.env.EMAIL_PASSWORD || '',
  EMAIL_FROM: process.env.EMAIL_FROM || '"LUXURY WATCH Concierge" <concierge@luxurywatch.com>',
  CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME || '',
  CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY || '',
  CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET || '',
  FRONTEND_URL: process.env.FRONTEND_URL || 'https://luxurywatch2020.netlify.app',
  FRONTEND_URLS: process.env.FRONTEND_URLS || ''
};

export default env;

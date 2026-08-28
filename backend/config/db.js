import dns from 'dns';
import mongoose from 'mongoose';
import { env } from './env.js';
import {
  User,
  Product,
  Brand,
  Category,
  Order,
  Cart,
  Coupon,
  Review,
  Payment,
  StoreSettings,
  HomepageContent,
  Return,
  ActivityLog,
  Contact
} from '../models/index.js';

// Fix Windows SRV DNS resolution for MongoDB Atlas if needed
try {
  dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1']);
} catch (e) {
  // Ignore if cannot override DNS servers
}

let isMongoConnected = false;
let mongoConnectionError = null;

/**
 * Connect to MongoDB Atlas / cluster
 */
export const connectMongoDB = async (customUri) => {
  const uri = customUri !== undefined ? customUri : (env.MONGODB_URI || process.env.MONGODB_URI || '');
  if (!uri) {
    console.warn('⚠️ [Database] MONGODB_URI is not configured. Real database persistence requires a valid MONGODB_URI.');
    isMongoConnected = false;
    mongoConnectionError = new Error('MONGODB_URI is not configured.');
    return false;
  }

  if (isMongoConnected && mongoose.connection.readyState === 1) {
    return true;
  }

  try {
    const maskedUri = uri.replace(/:([^:@]+)@/, ':***@');
    console.log(`[Database] Connecting to MongoDB: ${maskedUri}...`);

    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 3000
    });

    isMongoConnected = true;
    mongoConnectionError = null;
    console.log(`✅ [Database] MongoDB Connected Successfully! DB: "${mongoose.connection.name}"`);
    return true;
  } catch (err) {
    // In development mode, if remote Atlas fails (e.g. IP whitelist), attempt local MongoDB instance
    if (process.env.NODE_ENV !== 'production' && (uri.includes('mongodb+srv://') || uri.includes('mongodb.net'))) {
      const localUri = process.env.LOCAL_MONGODB_URI || 'mongodb://127.0.0.1:27017/luxurywatch';
      try {
        console.warn(`⚠️ [Database] Remote Atlas connection note: ${err.message}. Attempting local development MongoDB (${localUri})...`);
        try { await mongoose.disconnect(); } catch (discErr) {}
        await mongoose.connect(localUri, { serverSelectionTimeoutMS: 3000 });
        isMongoConnected = true;
        mongoConnectionError = null;
        console.log(`✅ [Database] Local MongoDB Connected Successfully! DB: "${mongoose.connection.name}"`);
        return true;
      } catch (localErr) {
        // Fall through to strict error throwing
      }
    }

    isMongoConnected = false;
    mongoConnectionError = err;
    console.error('❌ [Database Connection Error] Failed to connect to MongoDB:');
    console.error(`   ${err.message}`);
    console.error('❌ [Database] Local storage fallback is strictly disabled.');
    throw new Error(`[Database Connection Error] MongoDB connection failed: ${err.message}`);
  }
};

/**
 * Disconnect from MongoDB
 */
export const disconnectMongoDB = async () => {
  try {
    await mongoose.disconnect();
  } catch (e) {}
  isMongoConnected = false;
  mongoConnectionError = null;
};

export const isDbConnected = () => {
  return isMongoConnected && mongoose.connection.readyState === 1;
};

export const getDbConnectionError = () => {
  return mongoConnectionError;
};

// Monitor Mongoose connection events
mongoose.connection.on('connected', () => {
  isMongoConnected = true;
  mongoConnectionError = null;
});

mongoose.connection.on('disconnected', () => {
  isMongoConnected = false;
});

mongoose.connection.on('error', (err) => {
  isMongoConnected = false;
  mongoConnectionError = err;
  console.error('⚠️ [MongoDB Runtime Error]:', err.message);
});

// Auto-connect if MONGODB_URI is configured
const initialUri = env.MONGODB_URI || process.env.MONGODB_URI || '';
if (initialUri) {
  connectMongoDB().catch(() => {
    // Initial error logged cleanly inside connectMongoDB
  });
}

// Export models and database utilities
export {
  mongoose,
  User,
  Product,
  Brand,
  Category,
  Order,
  Cart,
  Coupon,
  Review,
  Payment,
  StoreSettings,
  HomepageContent,
  Return,
  ActivityLog,
  Contact
};

export default {
  connectMongoDB,
  disconnectMongoDB,
  isDbConnected,
  getDbConnectionError,
  isMongo: () => isMongoConnected,
  getConnectionError: () => mongoConnectionError,
  mongoose,
  User,
  Product,
  Brand,
  Category,
  Order,
  Cart,
  Coupon,
  Review,
  Payment,
  StoreSettings,
  HomepageContent,
  Return,
  ActivityLog,
  Contact
};

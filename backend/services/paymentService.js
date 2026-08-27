import crypto from 'crypto';
import Razorpay from 'razorpay';
import { db } from '../config/db.js';
import { env } from '../config/env.js';

// Configuration keys from environment or saved settings
const getRazorpayCredentials = () => {
  const settings = db.getMeta('paymentSettings') || {};
  const keyId = env.RAZORPAY_KEY_ID || process.env.RAZORPAY_KEY_ID || settings.razorpayKeyId || '';
  const keySecret = env.RAZORPAY_KEY_SECRET || process.env.RAZORPAY_KEY_SECRET || settings.razorpayKeySecret || '';
  return { keyId, keySecret };
};

/**
 * Initialize Razorpay SDK instance
 */
export const getRazorpayInstance = () => {
  const { keyId, keySecret } = getRazorpayCredentials();
  if (!keyId || !keySecret) return null;
  try {
    return new Razorpay({
      key_id: keyId,
      key_secret: keySecret
    });
  } catch (err) {
    console.warn('[Razorpay] SDK Init Note:', err.message);
    return null;
  }
};

/**
 * Payment Service Abstraction
 */
export const paymentService = {
  /**
   * Create Gateway Order (Razorpay)
   */
  createOrder: async ({ amount, currency = 'INR', receipt, notes = {} }) => {
    const { keyId, keySecret } = getRazorpayCredentials();
    const amountInPaise = Math.round(Number(amount) * 100);

    if (process.env.NODE_ENV === 'production') {
      const razorpay = getRazorpayInstance();
      if (!razorpay || !keyId || !keySecret) {
        return {
          success: false,
          message: 'Payment gateway is not configured for production.'
        };
      }
      try {
        const order = await razorpay.orders.create({
          amount: amountInPaise,
          currency,
          receipt: receipt || `rcpt_${Date.now()}`,
          notes
        });
        return {
          success: true,
          provider: 'razorpay',
          gatewayOrderId: order.id,
          amount: order.amount,
          currency: order.currency,
          keyId
        };
      } catch (sdkError) {
        console.error('[Razorpay SDK] Order creation error:', sdkError.message);
        return {
          success: false,
          message: 'Failed to create payment order with gateway.'
        };
      }
    }

    // High-fidelity fallback / Sandbox order generation (DEVELOPMENT ONLY)
    const mockGatewayOrderId = `order_LW_${Date.now()}_${Math.floor(1000 + Math.random() * 9000)}`;
    return {
      success: true,
      provider: 'razorpay',
      gatewayOrderId: mockGatewayOrderId,
      amount: amountInPaise,
      currency,
      keyId: keyId || '',
      isSandbox: true
    };
  },

  /**
   * Verify Gateway Payment Signature Server-Side
   */
  verifySignature: ({ gatewayOrderId, paymentId, signature }) => {
    if (!gatewayOrderId || !paymentId || !signature) {
      return { success: false, message: 'Missing gateway order ID, payment ID, or signature.' };
    }

    const isMock = signature === 'mock_verified_signature' || (typeof gatewayOrderId === 'string' && gatewayOrderId.startsWith('order_LW_'));

    // Strict Production Protection: Reject mock payments in production
    if (process.env.NODE_ENV === 'production') {
      if (isMock) {
        return { success: false, message: 'Mock payment verification is prohibited in production mode.' };
      }
    } else if (isMock) {
      // In development mode only
      return { success: true, message: 'Sandbox payment verified (development mode only).' };
    }

    const { keySecret } = getRazorpayCredentials();
    if (!keySecret) {
      return { success: false, message: 'Payment signature or key secret is missing.' };
    }

    try {
      const payload = `${gatewayOrderId}|${paymentId}`;
      const expectedSignature = crypto
        .createHmac('sha256', keySecret)
        .update(payload)
        .digest('hex');

      const expectedBuf = Buffer.from(expectedSignature, 'utf8');
      const signatureBuf = Buffer.from(signature, 'utf8');

      if (expectedBuf.length !== signatureBuf.length) {
        return {
          success: false,
          message: 'Invalid cryptographic signature. Payment verification failed.'
        };
      }

      const isValid = crypto.timingSafeEqual(expectedBuf, signatureBuf);
      if (!isValid) {
        return {
          success: false,
          message: 'Invalid cryptographic signature. Payment verification failed.'
        };
      }

      return {
        success: true,
        message: 'Payment signature verified successfully.'
      };
    } catch (err) {
      return {
        success: false,
        message: 'Signature verification failed.'
      };
    }
  },

  /**
   * Record transaction log in Database
   */
  recordTransaction: (paymentData) => {
    try {
      const transaction = {
        transactionId: `TXN-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`,
        createdAt: new Date().toISOString(),
        ...paymentData
      };
      db.insert('payments', transaction);
      return transaction;
    } catch (err) {
      console.error('[Payment Log Error]:', err.message);
      return null;
    }
  }
};

export default paymentService;

import crypto from 'crypto';
import Razorpay from 'razorpay';
import { Payment } from '../models/index.js';
import { env } from '../config/env.js';

/**
 * Razorpay Credentials strictly from environment variables
 */
const getRazorpayCredentials = () => {
  const keyId = env.RAZORPAY_KEY_ID || process.env.RAZORPAY_KEY_ID || '';
  const keySecret = env.RAZORPAY_KEY_SECRET || process.env.RAZORPAY_KEY_SECRET || '';
  const webhookSecret = env.RAZORPAY_WEBHOOK_SECRET || process.env.RAZORPAY_WEBHOOK_SECRET || '';
  return { keyId, keySecret, webhookSecret };
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
   * Verify Gateway Payment Signature Server-Side (Order Payment Verification)
   */
  verifySignature: async ({ gatewayOrderId, paymentId, signature }) => {
    if (!gatewayOrderId || !paymentId || !signature) {
      return { success: false, message: 'Missing gateway order ID, payment ID, or signature.' };
    }

    const isMock = signature === 'mock_verified_signature';

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
   * Verify Webhook Signature Server-Side
   */
  verifyWebhookSignature: ({ rawBody, signature }) => {
    if (!signature) {
      return { success: false, message: 'Missing X-Razorpay-Signature header.' };
    }

    const { webhookSecret } = getRazorpayCredentials();
    if (!webhookSecret) {
      // In development if webhook secret is not set, reject or require configured secret
      if (process.env.NODE_ENV === 'production') {
        return { success: false, message: 'Webhook secret is not configured on the server.' };
      }
    }

    try {
      const secret = webhookSecret || 'default_webhook_secret_dev';
      const bodyToDigest = Buffer.isBuffer(rawBody)
        ? rawBody
        : typeof rawBody === 'string'
          ? Buffer.from(rawBody, 'utf8')
          : Buffer.from(JSON.stringify(rawBody || {}), 'utf8');

      const expectedSignature = crypto
        .createHmac('sha256', secret)
        .update(bodyToDigest)
        .digest('hex');

      const expectedBuf = Buffer.from(expectedSignature, 'utf8');
      const signatureBuf = Buffer.from(signature, 'utf8');

      if (expectedBuf.length !== signatureBuf.length) {
        return { success: false, message: 'Invalid webhook signature length.' };
      }

      const isValid = crypto.timingSafeEqual(expectedBuf, signatureBuf);
      if (!isValid) {
        return { success: false, message: 'Invalid webhook signature.' };
      }

      return { success: true, message: 'Webhook signature verified.' };
    } catch (err) {
      return { success: false, message: `Webhook signature verification failed: ${err.message}` };
    }
  },

  /**
   * Record transaction log in MongoDB
   */
  recordTransaction: async (paymentData) => {
    try {
      const transaction = {
        transactionId: `TXN-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`,
        createdAt: new Date(),
        ...paymentData
      };
      const created = await Payment.create(transaction);
      return created;
    } catch (err) {
      console.error('[Payment Log Error]:', err.message);
      return null;
    }
  }
};

export default paymentService;

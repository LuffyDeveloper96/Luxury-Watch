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
  createOrder: async ({ amount, amountInPaise, currency = 'INR', receipt, notes = {} }) => {
    const { keyId, keySecret } = getRazorpayCredentials();

    let finalAmountInPaise;
    if (amountInPaise !== undefined) {
      finalAmountInPaise = Number(amountInPaise);
    } else if (amount !== undefined) {
      // If amount appears to be in paise (integer >= 100 and no decimal part for direct order calls)
      // or rupees from cart calculation
      finalAmountInPaise = Number(amount);
    } else {
      return {
        success: false,
        status: 400,
        message: 'Order amount is required.'
      };
    }

    if (!Number.isFinite(finalAmountInPaise) || finalAmountInPaise < 100) {
      return {
        success: false,
        status: 400,
        message: 'Amount must be at least 100 paise (₹1.00).'
      };
    }

    const razorpay = getRazorpayInstance();
    if (!razorpay || !keyId || !keySecret) {
      return {
        success: false,
        status: 401,
        message: 'Razorpay API credentials (KEY_ID / KEY_SECRET) are missing or unconfigured.'
      };
    }

    try {
      const order = await razorpay.orders.create({
        amount: Math.round(finalAmountInPaise),
        currency: currency || 'INR',
        receipt: receipt || `rcpt_${Date.now()}`,
        notes: notes || {}
      });

      return {
        success: true,
        provider: 'razorpay',
        order_id: order.id,
        gatewayOrderId: order.id,
        amount: order.amount,
        currency: order.currency,
        keyId
      };
    } catch (sdkError) {
      console.error('[Razorpay SDK] Order creation error:', sdkError.message || sdkError);
      
      // In development mode, if amount exceeds test account limit or hits API rate limits, create sandbox order reference
      if (process.env.NODE_ENV !== 'production' && (
        sdkError.statusCode === 429 ||
        sdkError.error?.description?.includes('Amount exceeds maximum') ||
        sdkError.error?.description?.toLowerCase().includes('too many requests')
      )) {
        console.warn('[Razorpay Test Mode Notice] Handling gateway response in development mode. Creating sandbox order reference.');
        const mockGatewayOrderId = `order_LW_${Date.now()}_${Math.floor(1000 + Math.random() * 9000)}`;
        return {
          success: true,
          provider: 'razorpay',
          order_id: mockGatewayOrderId,
          gatewayOrderId: mockGatewayOrderId,
          amount: Math.round(finalAmountInPaise),
          currency: currency || 'INR',
          keyId,
          isSandbox: true
        };
      }

      const isAuthError = sdkError.statusCode === 401 ||
        (sdkError.error && (sdkError.error.code === 'BAD_REQUEST_ERROR' || sdkError.error.code === 'GATEWAY_ERROR') &&
         sdkError.error.description?.toLowerCase().includes('auth'));

      return {
        success: false,
        status: isAuthError ? 401 : (sdkError.statusCode || 500),
        message: sdkError.error?.description || sdkError.message || 'Failed to create payment order with Razorpay.'
      };
    }
  },

  /**
   * Verify Gateway Payment Signature Server-Side (Order Payment Verification)
   * Algorithm: HMAC-SHA256(order_id + "|" + payment_id, KEY_SECRET)
   */
  verifySignature: async ({ gatewayOrderId, order_id, paymentId, payment_id, signature, razorpay_signature }) => {
    const finalOrderId = order_id || gatewayOrderId;
    const finalPaymentId = payment_id || paymentId;
    const finalSignature = razorpay_signature || signature;

    if (!finalOrderId || !finalPaymentId || !finalSignature) {
      return { success: false, status: 400, message: 'Missing required fields: order_id, payment_id, and signature are required.' };
    }

    const isMock = finalSignature === 'mock_verified_signature';

    // Strict Production Protection: Reject mock payments in production
    if (process.env.NODE_ENV === 'production') {
      if (isMock) {
        return { success: false, status: 400, message: 'Mock payment verification is prohibited in production mode.' };
      }
    } else if (isMock) {
      // In development mode only
      return { success: true, message: 'Sandbox payment verified (development mode only).' };
    }

    const { keySecret } = getRazorpayCredentials();
    if (!keySecret) {
      return { success: false, status: 401, message: 'Payment key secret is missing or unconfigured.' };
    }

    try {
      const payload = `${finalOrderId}|${finalPaymentId}`;
      const expectedSignature = crypto
        .createHmac('sha256', keySecret)
        .update(payload)
        .digest('hex');

      const expectedBuf = Buffer.from(expectedSignature, 'utf8');
      const signatureBuf = Buffer.from(finalSignature, 'utf8');

      if (expectedBuf.length !== signatureBuf.length) {
        return {
          success: false,
          status: 400,
          message: 'Cryptographic payment signature verification failed. Signature mismatch.'
        };
      }

      const isValid = crypto.timingSafeEqual(expectedBuf, signatureBuf);
      if (!isValid) {
        return {
          success: false,
          status: 400,
          message: 'Cryptographic payment signature verification failed. Signature mismatch.'
        };
      }

      return {
        success: true,
        message: 'Payment signature verified successfully.'
      };
    } catch (err) {
      return {
        success: false,
        status: 400,
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

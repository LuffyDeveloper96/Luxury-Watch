import { Order, Product, Coupon, Payment, ActivityLog } from '../models/index.js';
import { paymentService } from '../services/paymentService.js';
import { paymentFinalizationService } from '../services/paymentFinalizationService.js';
import { emailService } from '../services/emailService.js';

/**
 * 1. Initialize Razorpay Order (Server-Side Calculation & Pending Payment Record)
 * POST /api/payments/razorpay/order
 */
export const createRazorpayOrder = async (req, res) => {
  try {
    const { items, couponCode, deliverySpeed, customer } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ success: false, message: 'Cart items are required.' });
    }

    // Recalculate Subtotal Strictly from Database (NEVER trust frontend price)
    let calculatedSubtotal = 0;
    const validatedItems = [];

    for (const item of items) {
      const prodId = item.id || item.productId || (item.product && item.product.id);
      const product = await Product.findOne({
        $or: [{ id: prodId }, { sku: prodId }, { slug: prodId }]
      }).lean();

      if (!product || product.active === false) {
        return res.status(400).json({
          success: false,
          message: `Timepiece "${item.name || prodId}" is currently unavailable.`
        });
      }

      const rawQty = Number(item.quantity !== undefined ? item.quantity : 1);
      if (!Number.isInteger(rawQty) || rawQty <= 0 || rawQty > 50) {
        return res.status(400).json({
          success: false,
          message: `Invalid quantity for "${item.name || prodId}". Quantity must be a positive integer between 1 and 50.`
        });
      }
      const itemQty = rawQty;

      if (product.stock < itemQty) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for "${product.name}". Only ${product.stock} pieces available.`
        });
      }

      calculatedSubtotal += product.price * itemQty;
      validatedItems.push({
        id: product.id,
        name: product.name,
        brand: product.brand,
        sku: product.sku,
        price: product.price,
        comparePrice: product.comparePrice,
        quantity: itemQty,
        image: product.images?.[0] || '',
        selectedColor: item.selectedColor,
        selectedStrap: item.selectedStrap
      });
    }

    // Validate Coupon WITHOUT incrementing usage count yet
    let discountAmount = 0;
    let appliedCouponData = null;

    if (couponCode) {
      const cleanCode = couponCode.trim().toUpperCase();
      const coupon = await Coupon.findOne({ code: cleanCode, active: true }).lean();

      if (coupon) {
        const meetsMinSpend = !coupon.minSpend || calculatedSubtotal >= coupon.minSpend;
        const hasRemainingUses = !coupon.usageLimit || !coupon.timesUsed || coupon.timesUsed < coupon.usageLimit;

        if (meetsMinSpend && hasRemainingUses) {
          discountAmount = (calculatedSubtotal * (coupon.discountPercent || 0)) / 100;
          if (coupon.maxDiscount && discountAmount > coupon.maxDiscount) {
            discountAmount = coupon.maxDiscount;
          }
          appliedCouponData = {
            code: coupon.code,
            discountPercent: coupon.discountPercent
          };
        }
      }
    }

    // Calculate shipping fee server-side
    const shippingFee = (deliverySpeed && deliverySpeed.includes('Securitas')) ? 499 : 0;
    const finalTotal = Math.max(0, calculatedSubtotal - discountAmount + shippingFee);

    // Call payment abstraction
    const receiptId = `rcpt_${Date.now()}`;
    const orderResult = await paymentService.createOrder({
      amount: finalTotal,
      currency: 'INR',
      receipt: receiptId,
      notes: { itemCount: validatedItems.length }
    });

    if (!orderResult.success) {
      return res.status(400).json({ success: false, message: orderResult.message || 'Failed to initialize payment gateway order.' });
    }

    // Persist Trusted Pending Payment Record in MongoDB
    const transactionId = `TXN-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`;
    await Payment.create({
      transactionId,
      gatewayOrderId: orderResult.gatewayOrderId,
      amount: finalTotal,
      currency: 'INR',
      status: 'created',
      subtotal: calculatedSubtotal,
      discountAmount,
      shippingFee,
      total: finalTotal,
      appliedCoupon: appliedCouponData,
      items: validatedItems,
      customer: customer || {},
      customerEmail: customer?.email,
      customerPhone: customer?.phone,
      userId: req.user?.id
    });

    return res.json({
      success: true,
      provider: orderResult.provider,
      gatewayOrderId: orderResult.gatewayOrderId,
      amount: orderResult.amount,
      currency: orderResult.currency,
      keyId: orderResult.keyId,
      calculatedSummary: {
        subtotal: calculatedSubtotal,
        discountAmount,
        shippingFee,
        total: finalTotal,
        appliedCoupon: appliedCouponData,
        items: validatedItems
      }
    });
  } catch (err) {
    console.error('[Payment Order Init Error]:', err.message);
    return res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * 2. Verify Razorpay Signature & Confirm Order (Delegated to Unified Finalization Engine)
 * POST /api/payments/razorpay/verify
 */
export const verifyRazorpayPayment = async (req, res) => {
  try {
    const {
      gatewayOrderId,
      paymentId,
      signature,
      amount,
      currency,
      customer,
      orderData
    } = req.body;

    if (!gatewayOrderId || !paymentId) {
      return res.status(400).json({
        success: false,
        message: 'Missing gateway order ID or payment ID.'
      });
    }

    // 1. CRYPTOGRAPHIC SIGNATURE VERIFICATION
    const verification = await paymentService.verifySignature({
      gatewayOrderId,
      paymentId,
      signature
    });

    if (!verification.success) {
      await Payment.updateOne(
        { gatewayOrderId },
        {
          $set: {
            gatewayPaymentId: paymentId,
            status: 'failed',
            failureReason: verification.message,
            updatedAt: new Date()
          }
        }
      );

      return res.status(400).json({
        success: false,
        message: verification.message || 'Cryptographic payment signature verification failed.'
      });
    }

    // 2. UNIFIED PAYMENT FINALIZATION (Transactional, Concurrency-Safe & Idempotent)
    const result = await paymentFinalizationService.finalizePayment({
      gatewayOrderId,
      paymentId,
      signature,
      amount,
      currency,
      customer,
      orderData,
      source: 'verify'
    });

    return res.status(result.status || (result.success ? 200 : 400)).json(result);
  } catch (err) {
    console.error('[Payment Verification Error]:', err.message);
    return res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * 3. Handle Razorpay Webhook Events (Delegated to Unified Finalization Engine)
 * POST /api/payments/razorpay/webhook
 */
export const handleRazorpayWebhook = async (req, res) => {
  try {
    const signature = req.headers['x-razorpay-signature'] || req.headers['x-razorpay-signature'.toLowerCase()];

    // Verify webhook signature cryptographically
    const verification = paymentService.verifyWebhookSignature({
      rawBody: req.rawBody || Buffer.from(JSON.stringify(req.body || {})),
      signature
    });

    if (!verification.success) {
      return res.status(400).json({
        success: false,
        message: verification.message || 'Invalid webhook signature.'
      });
    }

    const event = req.body?.event;
    const payload = req.body?.payload;

    if (event === 'payment.captured' || event === 'order.paid') {
      const paymentEntity = payload?.payment?.entity;
      const gatewayOrderId = paymentEntity?.order_id;
      const paymentId = paymentEntity?.id;
      const amount = paymentEntity?.amount; // in paise
      const currency = paymentEntity?.currency;

      if (gatewayOrderId && paymentId) {
        const finalizationResult = await paymentFinalizationService.finalizePayment({
          gatewayOrderId,
          paymentId,
          signature: signature || 'webhook_verified',
          amount,
          currency,
          source: 'webhook'
        });

        if (!finalizationResult.success && finalizationResult.status === 400) {
          return res.status(400).json({ status: 'error', message: finalizationResult.message });
        }
      }
    } else if (event === 'payment.failed') {
      const paymentEntity = payload?.payment?.entity;
      const gatewayOrderId = paymentEntity?.order_id;
      const paymentId = paymentEntity?.id;
      const reason = paymentEntity?.error_description || 'Payment failed';

      if (gatewayOrderId) {
        // Only mark failed if not already paid
        await Payment.updateOne(
          { gatewayOrderId, status: { $ne: 'paid' } },
          {
            $set: {
              gatewayPaymentId: paymentId,
              status: 'failed',
              failureReason: reason,
              updatedAt: new Date()
            }
          }
        );
      }
    }

    return res.json({ status: 'ok', received: true });
  } catch (err) {
    console.error('[Webhook Processing Error]:', err.message);
    return res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * 4. Handle Payment Failure & Log Details
 * POST /api/payments/failure
 */
export const recordPaymentFailure = async (req, res) => {
  try {
    const { gatewayOrderId, paymentId, errorReason, amount, customerEmail } = req.body;

    await paymentService.recordTransaction({
      orderId: gatewayOrderId || `FAIL-${Date.now()}`,
      gatewayOrderId,
      gatewayPaymentId: paymentId,
      amount: amount || 0,
      currency: 'INR',
      status: 'failed',
      failureReason: errorReason || 'Payment declined by bank or user dismissed modal.',
      customerEmail
    });

    return res.json({
      success: true,
      message: 'Payment failure logged. Order can be retried.'
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * 5. Abandoned / Expired Payment Cleanup
 * POST /api/payments/cleanup-abandoned
 */
export const cleanupAbandonedPayments = async (req, res) => {
  try {
    const maxAgeHours = Number(req.query.maxAgeHours) || 24;
    const result = await paymentFinalizationService.cleanupAbandonedPayments({ maxAgeHours });
    return res.json({
      success: true,
      message: `Cleaned up ${result.modifiedCount} abandoned payment(s).`,
      modifiedCount: result.modifiedCount
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

export default {
  createRazorpayOrder,
  verifyRazorpayPayment,
  handleRazorpayWebhook,
  recordPaymentFailure,
  cleanupAbandonedPayments
};

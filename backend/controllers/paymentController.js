import { db } from '../config/db.js';
import { paymentService } from '../services/paymentService.js';
import { emailService } from '../services/emailService.js';

/**
 * Initialize Razorpay Order
 * POST /api/payments/razorpay/order
 */
export const createRazorpayOrder = async (req, res) => {
  try {
    const { items, couponCode, deliverySpeed } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ success: false, message: 'Cart items are required.' });
    }

    // Recalculate Subtotal Strictly from Database (NEVER trust frontend price)
    let calculatedSubtotal = 0;
    const validatedItems = [];

    for (const item of items) {
      const prodId = item.id || item.productId || (item.product && item.product.id);
      const product = db.findById('products', prodId);

      if (!product || product.active === false) {
        return res.status(400).json({
          success: false,
          message: `Product "${item.name || prodId}" is currently unavailable.`
        });
      }

      if (product.stock < (item.quantity || 1)) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for "${product.name}". Only ${product.stock} available.`
        });
      }

      const itemQty = Math.max(1, Number(item.quantity) || 1);
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

    // Validate Coupon if applied
    let discountAmount = 0;
    let appliedCouponData = null;

    if (couponCode) {
      const coupons = db.getCollection('coupons');
      const coupon = coupons.find(c => c.code.toUpperCase() === couponCode.trim().toUpperCase() && c.active);

      if (coupon) {
        if (!coupon.minSpend || calculatedSubtotal >= coupon.minSpend) {
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
 * Verify Razorpay Signature & Confirm Order
 * POST /api/payments/razorpay/verify
 */
export const verifyRazorpayPayment = async (req, res) => {
  try {
    const {
      gatewayOrderId,
      paymentId,
      signature,
      orderData
    } = req.body;

    if (!gatewayOrderId || !paymentId) {
      return res.status(400).json({
        success: false,
        message: 'Payment verification parameters missing.'
      });
    }

    // Verify HMAC-SHA256 signature
    const verification = paymentService.verifySignature({
      gatewayOrderId,
      paymentId,
      signature
    });

    if (!verification.success) {
      // Record failed transaction log
      paymentService.recordTransaction({
        orderId: orderData?.id || gatewayOrderId,
        gatewayOrderId,
        gatewayPaymentId: paymentId,
        amount: orderData?.total || 0,
        status: 'failed',
        failureReason: verification.message
      });

      return res.status(400).json({
        success: false,
        message: verification.message || 'Payment signature verification failed.'
      });
    }

    // Signature verified! Create confirmed order in DB
    const orderId = orderData?.id || `ORD-LW-${Math.floor(10000 + Math.random() * 90000)}`;
    const trackingNumber = orderData?.trackingNumber || `LW-EXP-${Math.floor(10000000 + Math.random() * 90000000)}`;

    const newOrder = {
      ...orderData,
      id: orderId,
      date: new Date().toISOString(),
      orderStatus: 'Confirmed',
      paymentStatus: 'Paid',
      paymentMethod: 'razorpay',
      paymentDetails: {
        gatewayOrderId,
        paymentId,
        signature
      },
      trackingNumber,
      courierTier: orderData?.courierTier || 'Securitas Armoured Express (Insured)'
    };

    // Save order
    const savedOrder = db.insert('orders', newOrder);

    // Record successful payment transaction
    paymentService.recordTransaction({
      orderId: savedOrder.id,
      gatewayOrderId,
      gatewayPaymentId: paymentId,
      gatewaySignature: signature,
      amount: savedOrder.total,
      currency: 'INR',
      status: 'paid',
      customerEmail: savedOrder.customer?.email
    });

    // Atomically decrement stock of ordered items
    (savedOrder.items || []).forEach(item => {
      const prodId = item.id || (item.product && item.product.id);
      if (prodId) {
        const prod = db.findById('products', prodId);
        if (prod) {
          const newStock = Math.max(0, prod.stock - (item.quantity || 1));
          db.update('products', prodId, { stock: newStock });
        }
      }
    });

    // Dispatch email confirmation in background
    emailService.sendOrderConfirmationEmail(savedOrder);

    // Log Activity
    const custName = savedOrder.customer?.fullName || 'Distinguished Patron';
    db.insert('activityLog', {
      id: `act-${Date.now()}`,
      text: `💳 Payment verified! Order #${savedOrder.id} confirmed for ${custName} (₹${(savedOrder.total || 0).toLocaleString('en-IN')})`,
      time: 'Just now',
      type: 'order'
    });

    return res.status(200).json({
      success: true,
      message: 'Payment verified and consignment confirmed.',
      order: savedOrder
    });
  } catch (err) {
    console.error('[Payment Verification Error]:', err.message);
    return res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * Handle Payment Failure & Log Details
 * POST /api/payments/failure
 */
export const recordPaymentFailure = (req, res) => {
  try {
    const { gatewayOrderId, paymentId, errorReason, amount, customerEmail } = req.body;

    paymentService.recordTransaction({
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

export default {
  createRazorpayOrder,
  verifyRazorpayPayment,
  recordPaymentFailure
};

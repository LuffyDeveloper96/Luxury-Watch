import mongoose from 'mongoose';
import { Payment, Order, Product, Coupon, ActivityLog } from '../models/index.js';
import { supportsTransactions } from '../config/db.js';
import { emailService } from './emailService.js';

const PROCESSING_LEASE_TIMEOUT_MS = 60000; // 60 seconds lease lock

/**
 * Single Authority Payment Finalization Engine
 * Shared identically by POST /api/payments/razorpay/verify and POST /api/payments/razorpay/webhook
 */
export const paymentFinalizationService = {
  /**
   * Finalize a verified payment and create/confirm the order exactly once.
   */
  finalizePayment: async ({
    gatewayOrderId,
    paymentId,
    signature = '',
    amount,
    currency,
    customer,
    orderData,
    source = 'verify'
  }) => {
    if (!gatewayOrderId || !paymentId) {
      return {
        success: false,
        status: 400,
        message: 'Missing gateway order ID or payment ID.'
      };
    }

    // =========================================================================
    // 1. IDEMPOTENCY CHECK
    // =========================================================================
    // Check if an Order already exists with this paymentId or gatewayOrderId
    const existingOrder = await Order.findOne({
      $or: [
        { 'paymentDetails.paymentId': paymentId },
        { 'paymentDetails.gatewayOrderId': gatewayOrderId, paymentStatus: 'Paid' }
      ]
    }).lean();

    if (existingOrder) {
      return {
        success: true,
        status: 200,
        message: 'Payment already verified and consignment confirmed.',
        order: existingOrder,
        isDuplicate: true
      };
    }

    // Check if Payment is already marked as paid with an orderId
    const paidPayment = await Payment.findOne({
      $or: [
        { gatewayPaymentId: paymentId, status: 'paid' },
        { gatewayOrderId, status: 'paid' }
      ]
    }).lean();

    if (paidPayment && paidPayment.orderId) {
      const existingOrderDoc = await Order.findOne({ id: paidPayment.orderId }).lean();
      if (existingOrderDoc) {
        return {
          success: true,
          status: 200,
          message: 'Payment already verified and consignment confirmed.',
          order: existingOrderDoc,
          isDuplicate: true
        };
      }
    }

    // =========================================================================
    // 2. FETCH PENDING PAYMENT RECORD & ACQUIRE PROCESSING LEASE LOCK
    // =========================================================================
    const initialPayment = await Payment.findOne({ gatewayOrderId });
    if (!initialPayment) {
      return {
        success: false,
        status: 400,
        message: 'No pending payment transaction found for this gateway order. Verification rejected.'
      };
    }

    // Enforce valid state transitions
    if (initialPayment.status === 'failed') {
      return {
        success: false,
        status: 400,
        message: 'Cannot finalize a payment in failed state.'
      };
    }

    if (initialPayment.status === 'cancelled') {
      return {
        success: false,
        status: 400,
        message: 'Cannot finalize a cancelled/abandoned payment.'
      };
    }

    // Validate Amount & Currency Integrity if supplied
    if (amount !== undefined && amount !== null) {
      const clientAmount = Number(amount);
      const isPaise = clientAmount > initialPayment.amount * 50; // Razorpay sends amount in paise (100x)
      const normalizedAmount = isPaise ? clientAmount / 100 : clientAmount;
      if (Math.abs(normalizedAmount - initialPayment.amount) > 0.01) {
        return {
          success: false,
          status: 400,
          message: `Payment amount mismatch: expected ₹${initialPayment.amount}, received ₹${normalizedAmount}.`
        };
      }
    }

    if (currency && currency.toUpperCase() !== (initialPayment.currency || 'INR').toUpperCase()) {
      return {
        success: false,
        status: 400,
        message: `Payment currency mismatch: expected ${initialPayment.currency || 'INR'}, received ${currency}.`
      };
    }

    // Acquire atomic lease lock on Payment record
    const workerId = `worker_${process.pid}_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
    const staleLockThreshold = new Date(Date.now() - PROCESSING_LEASE_TIMEOUT_MS);

    const lockedPayment = await Payment.findOneAndUpdate(
      {
        gatewayOrderId,
        $or: [
          { status: { $in: ['created', 'pending'] } },
          { status: 'processing', processingAt: { $lt: staleLockThreshold } } // Recover stale lease if worker crashed
        ]
      },
      {
        $set: {
          status: 'processing',
          processingAt: new Date(),
          processingWorkerId: workerId,
          gatewayPaymentId: paymentId,
          updatedAt: new Date()
        }
      },
      { returnDocument: 'after' }
    );

    if (!lockedPayment) {
      // Another concurrent worker (e.g. simultaneous verify + webhook) acquired the lock
      // Wait up to 3 seconds for the order to be created by the concurrent thread
      for (let i = 0; i < 6; i++) {
        await new Promise(r => setTimeout(r, 500));
        const checkOrder = await Order.findOne({
          $or: [
            { 'paymentDetails.paymentId': paymentId },
            { 'paymentDetails.gatewayOrderId': gatewayOrderId, paymentStatus: 'Paid' }
          ]
        }).lean();

        if (checkOrder) {
          return {
            success: true,
            status: 200,
            message: 'Payment verified and consignment confirmed by concurrent worker.',
            order: checkOrder,
            isDuplicate: true
          };
        }
      }

      // If still processing, re-fetch payment status
      const currentPaymentState = await Payment.findOne({ gatewayOrderId }).lean();
      if (currentPaymentState && currentPaymentState.status === 'paid' && currentPaymentState.orderId) {
        const orderDoc = await Order.findOne({ id: currentPaymentState.orderId }).lean();
        if (orderDoc) {
          return {
            success: true,
            status: 200,
            message: 'Payment verified and consignment confirmed.',
            order: orderDoc,
            isDuplicate: true
          };
        }
      }

      return {
        success: false,
        status: 409,
        message: 'Payment finalization is currently in progress by another request.'
      };
    }

    // =========================================================================
    // 3. ASSEMBLE TRUSTED SANITIZED DATA
    // =========================================================================
    const rawCustomer = lockedPayment.customer || customer || orderData?.customer || {};
    const sanitizedCustomer = {
      fullName: rawCustomer.fullName || 'Distinguished Patron',
      email: (rawCustomer.email || lockedPayment.customerEmail || 'client@luxurywatch.com').trim().toLowerCase(),
      phone: rawCustomer.phone || lockedPayment.customerPhone || '+91 98200 98200',
      address: rawCustomer.address || 'The Capital, BKC',
      city: rawCustomer.city || 'Mumbai',
      state: rawCustomer.state || 'Maharashtra',
      postalCode: rawCustomer.postalCode || '400051',
      country: rawCustomer.country || 'India',
      deliverySpeed: rawCustomer.deliverySpeed || (lockedPayment.shippingFee > 0 ? 'Securitas Armoured Express (Insured)' : 'BlueDart Insured Air Express'),
      specialInstructions: rawCustomer.specialInstructions || ''
    };

    const orderId = `ORD-LW-${Math.floor(10000 + Math.random() * 90000)}`;
    const trackingNumber = `LW-EXP-${Math.floor(10000000 + Math.random() * 90000000)}`;
    const itemsToOrder = lockedPayment.items && lockedPayment.items.length > 0 ? lockedPayment.items : [];

    let finalOrder = null;
    const canUseTransactions = supportsTransactions();

    // =========================================================================
    // 4. ATOMIC EXECUTION (TRANSACTIONAL OR COMPENSATING FALLBACK)
    // =========================================================================
    if (canUseTransactions) {
      // -----------------------------------------------------------------------
      // PATH A: MONGODB ATLAS / REPLICA SET TRANSACTION
      // -----------------------------------------------------------------------
      const session = await mongoose.startSession();
      try {
        await session.withTransaction(async () => {
          // A1: Atomic Stock Reservation inside session
          for (const item of itemsToOrder) {
            const itemQty = Math.max(1, Number(item.quantity) || 1);
            const prodId = item.id;

            const updatedProduct = await Product.findOneAndUpdate(
              {
                $or: [{ id: prodId }, { sku: prodId }, { slug: prodId }],
                stock: { $gte: itemQty },
                active: true
              },
              {
                $inc: { stock: -itemQty },
                $set: { updatedAt: new Date() }
              },
              { session, returnDocument: 'after' }
            );

            if (!updatedProduct) {
              const err = new Error(`INSUFFICIENT_STOCK:${item.name || prodId}`);
              err.code = 'INSUFFICIENT_STOCK';
              err.itemName = item.name || prodId;
              throw err;
            }
          }

          // A2: Atomic Coupon Increment inside session
          if (lockedPayment.appliedCoupon?.code) {
            const cleanCode = lockedPayment.appliedCoupon.code.trim().toUpperCase();
            const updatedCoupon = await Coupon.findOneAndUpdate(
              {
                code: cleanCode,
                active: true,
                $or: [
                  { usageLimit: { $exists: false } },
                  { usageLimit: null },
                  { usageLimit: 0 },
                  { $expr: { $lt: ['$timesUsed', '$usageLimit'] } }
                ]
              },
              {
                $inc: { timesUsed: 1 },
                $set: { updatedAt: new Date() }
              },
              { session, returnDocument: 'after' }
            );

            if (!updatedCoupon) {
              const err = new Error(`COUPON_LIMIT_EXCEEDED:${cleanCode}`);
              err.code = 'COUPON_LIMIT_EXCEEDED';
              throw err;
            }
          }

          // A3: Create Order inside session
          const createdOrders = await Order.create([{
            id: orderId,
            orderNumber: orderId,
            customer: sanitizedCustomer,
            items: itemsToOrder,
            subtotal: lockedPayment.subtotal,
            discountAmount: lockedPayment.discountAmount || 0,
            appliedCoupon: lockedPayment.appliedCoupon || null,
            shippingFee: lockedPayment.shippingFee || 0,
            total: lockedPayment.total,
            currency: lockedPayment.currency || 'INR',
            orderStatus: 'Confirmed',
            paymentStatus: 'Paid',
            paymentMethod: 'razorpay',
            paymentDetails: {
              gatewayOrderId,
              paymentId,
              signature: signature || 'verified',
              receipt: `rcpt_${Date.now()}`
            },
            trackingNumber,
            courierTier: lockedPayment.shippingFee > 0 ? 'Securitas Armoured Express (Insured)' : 'BlueDart Insured Air Express',
            createdAt: new Date()
          }], { session });

          finalOrder = createdOrders[0].toObject ? createdOrders[0].toObject() : createdOrders[0];

          // A4: Update Payment to 'paid' inside session
          await Payment.updateOne(
            { _id: lockedPayment._id },
            {
              $set: {
                orderId: finalOrder.id,
                gatewayPaymentId: paymentId,
                gatewaySignature: signature,
                status: 'paid',
                customerEmail: sanitizedCustomer.email,
                customerPhone: sanitizedCustomer.phone,
                processingAt: null,
                processingWorkerId: null,
                updatedAt: new Date()
              }
            },
            { session }
          );
        });
      } catch (txErr) {
        // Transaction automatically aborted all changes!
        // Reset payment status back to failed
        await Payment.updateOne(
          { _id: lockedPayment._id },
          {
            $set: {
              status: 'failed',
              failureReason: txErr.message,
              processingAt: null,
              processingWorkerId: null,
              updatedAt: new Date()
            }
          }
        );

        if (txErr.code === 'INSUFFICIENT_STOCK') {
          return {
            success: false,
            status: 400,
            message: `Inventory stock unavailable for "${txErr.itemName}". The transaction was rolled back.`
          };
        }

        if (txErr.code === 'COUPON_LIMIT_EXCEEDED') {
          return {
            success: false,
            status: 400,
            message: 'Coupon usage limit has been exceeded. The transaction was rolled back.'
          };
        }

        return {
          success: false,
          status: 400,
          message: txErr.message || 'Payment finalization transaction failed.'
        };
      } finally {
        await session.endSession();
      }
    } else {
      // -----------------------------------------------------------------------
      // PATH B: STANDALONE MONGODB ENGINE (Atomic Conditional Updates + Compensating Rollback)
      // Note: Standalone MongoDB without replica set does not support multi-document
      // transactions. We execute atomic single-doc updates with compensating rollback.
      // -----------------------------------------------------------------------
      console.warn('⚠️ [PaymentFinalization] Standalone MongoDB detected: Executing atomic conditional updates with compensating rollback.');

      const reservedItems = [];
      let stockFailed = false;
      let failedItemName = '';

      for (const item of itemsToOrder) {
        const itemQty = Math.max(1, Number(item.quantity) || 1);
        const prodId = item.id;

        const updatedProduct = await Product.findOneAndUpdate(
          {
            $or: [{ id: prodId }, { sku: prodId }, { slug: prodId }],
            stock: { $gte: itemQty },
            active: true
          },
          {
            $inc: { stock: -itemQty },
            $set: { updatedAt: new Date() }
          },
          { returnDocument: 'after' }
        );

        if (!updatedProduct) {
          stockFailed = true;
          failedItemName = item.name || prodId;
          break;
        }

        reservedItems.push({ id: prodId, sku: item.sku, quantity: itemQty });
      }

      if (stockFailed) {
        // Compensating Rollback: restore all successfully reserved items
        for (const reserved of reservedItems) {
          await Product.findOneAndUpdate(
            { $or: [{ id: reserved.id }, { sku: reserved.sku || reserved.id }, { slug: reserved.id }] },
            { $inc: { stock: reserved.quantity }, $set: { updatedAt: new Date() } }
          );
        }

        await Payment.updateOne(
          { _id: lockedPayment._id },
          {
            $set: {
              status: 'failed',
              failureReason: `Insufficient stock for "${failedItemName}" during concurrent reservation.`,
              processingAt: null,
              processingWorkerId: null,
              updatedAt: new Date()
            }
          }
        );

        return {
          success: false,
          status: 400,
          message: `Inventory stock unavailable for "${failedItemName}". The consignment cannot be fulfilled.`
        };
      }

      // Increment coupon usage
      if (lockedPayment.appliedCoupon?.code) {
        const cleanCode = lockedPayment.appliedCoupon.code.trim().toUpperCase();
        const updatedCoupon = await Coupon.findOneAndUpdate(
          {
            code: cleanCode,
            active: true,
            $or: [
              { usageLimit: { $exists: false } },
              { usageLimit: null },
              { usageLimit: 0 },
              { $expr: { $lt: ['$timesUsed', '$usageLimit'] } }
            ]
          },
          { $inc: { timesUsed: 1 }, $set: { updatedAt: new Date() } },
          { returnDocument: 'after' }
        );

        if (!updatedCoupon) {
          // Compensating Rollback of reserved inventory
          for (const reserved of reservedItems) {
            await Product.findOneAndUpdate(
              { $or: [{ id: reserved.id }, { sku: reserved.sku || reserved.id }, { slug: reserved.id }] },
              { $inc: { stock: reserved.quantity }, $set: { updatedAt: new Date() } }
            );
          }

          await Payment.updateOne(
            { _id: lockedPayment._id },
            {
              $set: {
                status: 'failed',
                failureReason: 'Coupon usage limit reached.',
                processingAt: null,
                processingWorkerId: null,
                updatedAt: new Date()
              }
            }
          );

          return {
            success: false,
            status: 400,
            message: 'Coupon usage limit has been reached. Consignment aborted.'
          };
        }
      }

      // Create Order
      try {
        finalOrder = await Order.create({
          id: orderId,
          orderNumber: orderId,
          customer: sanitizedCustomer,
          items: itemsToOrder,
          subtotal: lockedPayment.subtotal,
          discountAmount: lockedPayment.discountAmount || 0,
          appliedCoupon: lockedPayment.appliedCoupon || null,
          shippingFee: lockedPayment.shippingFee || 0,
          total: lockedPayment.total,
          currency: lockedPayment.currency || 'INR',
          orderStatus: 'Confirmed',
          paymentStatus: 'Paid',
          paymentMethod: 'razorpay',
          paymentDetails: {
            gatewayOrderId,
            paymentId,
            signature: signature || 'verified',
            receipt: `rcpt_${Date.now()}`
          },
          trackingNumber,
          courierTier: lockedPayment.shippingFee > 0 ? 'Securitas Armoured Express (Insured)' : 'BlueDart Insured Air Express',
          createdAt: new Date()
        });

        // Update Payment to 'paid'
        await Payment.updateOne(
          { _id: lockedPayment._id },
          {
            $set: {
              orderId: finalOrder.id,
              gatewayPaymentId: paymentId,
              gatewaySignature: signature,
              status: 'paid',
              customerEmail: sanitizedCustomer.email,
              customerPhone: sanitizedCustomer.phone,
              processingAt: null,
              processingWorkerId: null,
              updatedAt: new Date()
            }
          }
        );
      } catch (orderCreateErr) {
        // Compensating Rollback if order insertion fails (e.g. duplicate key)
        for (const reserved of reservedItems) {
          await Product.findOneAndUpdate(
            { $or: [{ id: reserved.id }, { sku: reserved.sku || reserved.id }, { slug: reserved.id }] },
            { $inc: { stock: reserved.quantity }, $set: { updatedAt: new Date() } }
          );
        }

        if (lockedPayment.appliedCoupon?.code) {
          const cleanCode = lockedPayment.appliedCoupon.code.trim().toUpperCase();
          await Coupon.updateOne({ code: cleanCode }, { $inc: { timesUsed: -1 } });
        }

        await Payment.updateOne(
          { _id: lockedPayment._id },
          {
            $set: {
              status: 'failed',
              failureReason: orderCreateErr.message,
              processingAt: null,
              processingWorkerId: null,
              updatedAt: new Date()
            }
          }
        );

        return {
          success: false,
          status: 500,
          message: orderCreateErr.message || 'Order creation failed.'
        };
      }
    }

    // =========================================================================
    // 5. ASYNC NOTIFICATIONS & ACTIVITY LOGGING
    // =========================================================================
    try {
      emailService.sendOrderConfirmationEmail(finalOrder);
    } catch (e) {}

    try {
      const patronName = sanitizedCustomer.fullName || 'Distinguished Patron';
      await ActivityLog.create({
        id: `act-${Date.now()}`,
        text: `💳 Payment verified via ${source}! Consignment #${finalOrder.id} confirmed for ${patronName} (₹${(finalOrder.total || 0).toLocaleString('en-IN')})`,
        time: 'Just now',
        type: 'order'
      });
    } catch (e) {}

    return {
      success: true,
      status: 200,
      message: 'Payment verified and consignment confirmed.',
      order: finalOrder,
      isDuplicate: false
    };
  },

  /**
   * Abandoned / Expired Payment Cleanup
   * Transitions stale payments in 'created' or 'pending' state older than maxAgeHours to 'cancelled'
   */
  cleanupAbandonedPayments: async ({ maxAgeHours = 24 } = {}) => {
    const cutoff = new Date(Date.now() - maxAgeHours * 60 * 60 * 1000);
    const result = await Payment.updateMany(
      {
        status: { $in: ['created', 'pending'] },
        createdAt: { $lt: cutoff }
      },
      {
        $set: {
          status: 'cancelled',
          failureReason: `Payment abandoned after ${maxAgeHours} hours.`,
          updatedAt: new Date()
        }
      }
    );

    return {
      success: true,
      modifiedCount: result.modifiedCount
    };
  }
};

export default paymentFinalizationService;

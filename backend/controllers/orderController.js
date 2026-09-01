import { Order, Product, Coupon, ActivityLog } from '../models/index.js';
import { isValidOrderTransition } from '../models/Order.js';
import { emailService } from '../services/emailService.js';
import { escapeRegex } from '../utils/regex.js';

export const getOrders = async (req, res) => {
  try {
    const pageNum = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 50));
    const skip = (pageNum - 1) * limitNum;

    const [total, orders] = await Promise.all([
      Order.countDocuments({}),
      Order.find({}).sort({ createdAt: -1 }).skip(skip).limit(limitNum).lean()
    ]);

    return res.json({
      success: true,
      count: orders.length,
      total,
      page: pageNum,
      totalPages: Math.ceil(total / limitNum) || 1,
      orders,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum) || 1
      }
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * Get Order Details with Privacy Controls
 * GET /api/orders/:id
 * - Admin or Order Owner: Full order details
 * - Unauthenticated / Public Tracking: Sanitized tracking payload only
 */
export const getOrderById = async (req, res) => {
  try {
    const { id } = req.params;
    const cleanId = (id || '').trim();
    if (!cleanId) {
      return res.status(400).json({ success: false, message: 'Order reference or email required.' });
    }

    const safeClean = escapeRegex(cleanId);
    const regex = new RegExp(`^${safeClean}$`, 'i');

    const order = await Order.findOne({
      $or: [
        { id: regex },
        { orderNumber: regex },
        { trackingNumber: regex },
        { 'customer.email': regex }
      ]
    }).sort({ createdAt: -1 }).lean();

    if (!order) {
      return res.status(404).json({ success: false, message: `No consignment found matching "${id}".` });
    }

    // Check Authorization
    const isAdmin = req.user && (req.user.role === 'admin' || req.user.role === 'master_admin');
    const isOwner = req.user && req.user.email && order.customer?.email &&
      req.user.email.toLowerCase() === order.customer.email.toLowerCase();

    if (isAdmin || isOwner) {
      return res.json({ success: true, order });
    }

    // Unauthenticated / Third-Party Lookup: Return sanitized tracking information only
    const sanitizedTrackingOrder = {
      id: order.id,
      orderNumber: order.orderNumber,
      trackingNumber: order.trackingNumber,
      orderStatus: order.orderStatus,
      paymentStatus: order.paymentStatus,
      courierTier: order.courierTier,
      estimatedDeliveryDate: order.estimatedDeliveryDate,
      createdAt: order.createdAt,
      itemCount: order.items?.length || 0,
      items: order.items?.map(item => ({
        id: item.id || item.productId,
        name: item.name,
        brand: item.brand,
        quantity: item.quantity,
        price: item.price,
        image: item.image
      })) || [],
      customer: {
        city: order.customer?.city || '',
        state: order.customer?.state || '',
        maskedName: order.customer?.fullName
          ? `${order.customer.fullName.charAt(0)}***`
          : 'Valued Patron'
      }
    };

    return res.json({
      success: true,
      order: sanitizedTrackingOrder,
      isSanitized: true
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

export const getUserOrders = async (req, res) => {
  try {
    const userEmail = req.user?.email?.trim();
    if (!userEmail) {
      return res.status(401).json({ success: false, message: 'User authentication required.' });
    }

    const safeEmail = escapeRegex(userEmail);
    const userOrders = await Order.find({
      'customer.email': { $regex: new RegExp(`^${safeEmail}$`, 'i') }
    }).sort({ createdAt: -1 }).lean();

    return res.json({
      success: true,
      count: userOrders.length,
      orders: userOrders
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * Direct Order Creation with Server Recalculation & Atomic Stock Protection
 * POST /api/orders
 */
export const createOrder = async (req, res) => {
  try {
    const orderData = req.body;

    if (!orderData.items || !Array.isArray(orderData.items) || !orderData.items.length || !orderData.customer) {
      return res.status(400).json({
        success: false,
        message: 'Order items and customer information are required.'
      });
    }

    // Recalculate Subtotal Strictly from Database (NEVER trust frontend price)
    let calculatedSubtotal = 0;
    const validatedItems = [];

    for (const item of orderData.items) {
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
          message: `Insufficient stock for "${product.name}". Only ${product.stock} available.`
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

    // Validate Coupon
    let discountAmount = 0;
    let appliedCouponData = null;
    let couponDoc = null;

    if (orderData.appliedCoupon?.code || orderData.couponCode) {
      const couponCode = (orderData.appliedCoupon?.code || orderData.couponCode).trim().toUpperCase();
      couponDoc = await Coupon.findOne({ code: couponCode, active: true });
      if (couponDoc) {
        const meetsMinSpend = !couponDoc.minSpend || calculatedSubtotal >= couponDoc.minSpend;
        const hasRemainingUses = !couponDoc.usageLimit || !couponDoc.timesUsed || couponDoc.timesUsed < couponDoc.usageLimit;

        if (meetsMinSpend && hasRemainingUses) {
          discountAmount = (calculatedSubtotal * (couponDoc.discountPercent || 0)) / 100;
          if (couponDoc.maxDiscount && discountAmount > couponDoc.maxDiscount) {
            discountAmount = couponDoc.maxDiscount;
          }
          appliedCouponData = {
            code: couponDoc.code,
            discountPercent: couponDoc.discountPercent
          };
        }
      }
    }

    // Server-calculated shipping fee
    const clientSpeed = orderData.customer?.deliverySpeed || orderData.courierTier || '';
    const shippingFee = (clientSpeed && clientSpeed.includes('Securitas')) ? 499 : 0;
    const finalTotal = Math.max(0, calculatedSubtotal - discountAmount + shippingFee);

    // Atomic conditional stock reservation
    const reservedItems = [];
    let stockFailed = false;
    let failedItemName = '';

    for (const item of validatedItems) {
      const updatedProduct = await Product.findOneAndUpdate(
        {
          $or: [{ id: item.id }, { sku: item.sku || item.id }],
          stock: { $gte: item.quantity },
          active: true
        },
        {
          $inc: { stock: -item.quantity },
          $set: { updatedAt: new Date() }
        },
        { returnDocument: 'after' }
      );

      if (!updatedProduct) {
        stockFailed = true;
        failedItemName = item.name || item.id;
        break;
      }
      reservedItems.push({ id: item.id, sku: item.sku, quantity: item.quantity });
    }

    if (stockFailed) {
      for (const resItem of reservedItems) {
        await Product.findOneAndUpdate(
          { $or: [{ id: resItem.id }, { sku: resItem.sku || resItem.id }] },
          { $inc: { stock: resItem.quantity }, $set: { updatedAt: new Date() } }
        );
      }
      return res.status(400).json({
        success: false,
        message: `Inventory stock unavailable for "${failedItemName}". The consignment cannot be fulfilled.`
      });
    }

    // Increment coupon usage only after successful stock reservation
    if (couponDoc && discountAmount > 0) {
      await Coupon.updateOne({ _id: couponDoc._id }, { $inc: { timesUsed: 1 } });
    }

    const orderId = orderData.id || `ORD-LW-${Math.floor(10000 + Math.random() * 90000)}`;
    const trackingNumber = orderData.trackingNumber || `LW-EXP-${Math.floor(10000000 + Math.random() * 90000000)}`;

    const rawCustomer = orderData.customer || {};
    const sanitizedCustomer = {
      fullName: rawCustomer.fullName || 'Distinguished Patron',
      email: (rawCustomer.email || '').trim().toLowerCase(),
      phone: rawCustomer.phone || '+91 98200 98200',
      address: rawCustomer.address || 'The Capital, BKC',
      city: rawCustomer.city || 'Mumbai',
      state: rawCustomer.state || 'Maharashtra',
      postalCode: rawCustomer.postalCode || '400051',
      country: rawCustomer.country || 'India',
      deliverySpeed: rawCustomer.deliverySpeed || (shippingFee > 0 ? 'Securitas Armoured Express (Insured)' : 'BlueDart Insured Air Express'),
      specialInstructions: rawCustomer.specialInstructions || ''
    };

    const savedOrder = await Order.create({
      id: orderId,
      orderNumber: orderId,
      customer: sanitizedCustomer,
      items: validatedItems,
      subtotal: calculatedSubtotal,
      discountAmount,
      appliedCoupon: appliedCouponData || null,
      shippingFee,
      total: finalTotal,
      currency: orderData.currency || 'INR',
      orderStatus: 'Confirmed',
      paymentStatus: orderData.paymentStatus || 'Paid',
      paymentMethod: orderData.paymentMethod || 'razorpay',
      paymentDetails: orderData.paymentDetails || {},
      trackingNumber,
      courierTier: shippingFee > 0 ? 'Securitas Armoured Express (Insured)' : 'BlueDart Insured Air Express',
      createdAt: new Date()
    });

    emailService.sendOrderConfirmationEmail(savedOrder);

    const custName = savedOrder.customer?.fullName || 'Distinguished Patron';
    await ActivityLog.create({
      id: `act-${Date.now()}`,
      text: `🎉 Consignment #${savedOrder.id} placed by ${custName} (₹${finalTotal.toLocaleString('en-IN')})`,
      time: 'Just now',
      type: 'order'
    });

    return res.status(201).json({
      success: true,
      message: 'Consignment booked and confirmed.',
      order: savedOrder
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

export const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const orderStatus = req.body.orderStatus || req.body.status;
    const { trackingNumber, courierTier } = req.body;

    if (!orderStatus) {
      return res.status(400).json({ success: false, message: 'Order status is required.' });
    }

    const existing = await Order.findOne({ $or: [{ id }, { orderNumber: id }] });
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Order not found.' });
    }

    if (!isValidOrderTransition(existing.orderStatus, orderStatus)) {
      return res.status(400).json({
        success: false,
        message: `Invalid order status transition from "${existing.orderStatus}" to "${orderStatus}".`
      });
    }

    const updates = { orderStatus, updatedAt: new Date() };
    if (trackingNumber) updates.trackingNumber = trackingNumber;
    if (courierTier) updates.courierTier = courierTier;

    const updated = await Order.findOneAndUpdate(
      { _id: existing._id },
      { $set: updates },
      { returnDocument: 'after' }
    );

    await ActivityLog.create({
      id: `act-${Date.now()}`,
      text: `Consignment #${id} stage changed to: "${orderStatus}"`,
      time: 'Just now',
      type: 'admin'
    });

    return res.json({
      success: true,
      message: 'Order status updated successfully.',
      order: updated
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

export const cancelOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    const existing = await Order.findOne({ $or: [{ id }, { orderNumber: id }] });
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Order not found.' });
    }

    if (existing.orderStatus === 'Delivered' || existing.orderStatus === 'Out for Delivery') {
      return res.status(400).json({
        success: false,
        message: 'Order is already out for delivery or delivered. Please request a Return / Exchange instead.'
      });
    }

    const updated = await Order.findOneAndUpdate(
      { _id: existing._id },
      {
        $set: {
          orderStatus: 'Cancelled',
          cancelReason: reason || 'Customer requested cancellation.',
          updatedAt: new Date()
        }
      },
      { returnDocument: 'after' }
    );

    // Atomically restore stock
    for (const item of existing.items || []) {
      if (item.id) {
        await Product.findOneAndUpdate(
          { $or: [{ id: item.id }, { sku: item.sku || item.id }] },
          { $inc: { stock: item.quantity || 1 }, $set: { updatedAt: new Date() } }
        );
      }
    }

    await ActivityLog.create({
      id: `act-${Date.now()}`,
      text: `Consignment #${id} cancelled (${reason || 'Customer request'})`,
      time: 'Just now',
      type: 'order'
    });

    return res.json({
      success: true,
      message: 'Order cancelled successfully.',
      order: updated
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

export default {
  getOrders,
  getOrderById,
  getUserOrders,
  createOrder,
  updateOrderStatus,
  cancelOrder
};

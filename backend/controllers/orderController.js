import { db } from '../config/db.js';
import { emailService } from '../services/emailService.js';

export const getOrders = (req, res) => {
  try {
    const orders = db.getCollection('orders');
    return res.json({
      success: true,
      count: orders.length,
      orders
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

export const getOrderById = (req, res) => {
  try {
    const { id } = req.params;
    const cleanId = id.trim().toUpperCase();

    const orders = db.getCollection('orders');
    const order = orders.find(
      o => o.id.toUpperCase() === cleanId ||
           o.trackingNumber?.toUpperCase() === cleanId ||
           o.customer?.email?.toLowerCase() === id.trim().toLowerCase()
    );

    if (!order) {
      return res.status(404).json({ success: false, message: `No consignment found matching "${id}".` });
    }

    return res.json({ success: true, order });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

export const getUserOrders = (req, res) => {
  try {
    const userEmail = req.user?.email?.toLowerCase();
    if (!userEmail) {
      return res.status(401).json({ success: false, message: 'User authentication required.' });
    }

    const orders = db.getCollection('orders');
    const userOrders = orders.filter(o => o.customer?.email?.toLowerCase() === userEmail);

    return res.json({
      success: true,
      count: userOrders.length,
      orders: userOrders
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

export const createOrder = (req, res) => {
  try {
    const orderData = req.body;

    if (!orderData.items || !orderData.items.length || !orderData.customer) {
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
      const product = db.findById('products', prodId);

      if (!product || product.active === false) {
        return res.status(400).json({
          success: false,
          message: `Timepiece "${item.name || prodId}" is currently unavailable.`
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

    // Validate Coupon
    let discountAmount = 0;
    if (orderData.appliedCoupon?.code) {
      const coupons = db.getCollection('coupons');
      const coupon = coupons.find(c => c.code.toUpperCase() === orderData.appliedCoupon.code.trim().toUpperCase() && c.active);
      if (coupon) {
        if (!coupon.minSpend || calculatedSubtotal >= coupon.minSpend) {
          discountAmount = (calculatedSubtotal * (coupon.discountPercent || 0)) / 100;
          if (coupon.maxDiscount && discountAmount > coupon.maxDiscount) {
            discountAmount = coupon.maxDiscount;
          }
        }
      }
    }

    const shippingFee = orderData.shippingFee !== undefined ? Number(orderData.shippingFee) : 0;
    const finalTotal = Math.max(0, calculatedSubtotal - discountAmount + shippingFee);

    const orderId = orderData.id || `ORD-LW-${Math.floor(10000 + Math.random() * 90000)}`;
    const trackingNumber = orderData.trackingNumber || `LW-EXP-${Math.floor(10000000 + Math.random() * 90000000)}`;

    const newOrder = {
      ...orderData,
      id: orderId,
      items: validatedItems,
      subtotal: calculatedSubtotal,
      discountAmount,
      total: finalTotal,
      date: new Date().toISOString(),
      orderStatus: orderData.orderStatus || 'Confirmed',
      paymentStatus: orderData.paymentStatus || 'Paid',
      trackingNumber,
      courierTier: orderData.courierTier || 'Securitas Armoured Express (Insured)'
    };

    // Save order
    const savedOrder = db.insert('orders', newOrder);

    // Atomically decrement stock
    validatedItems.forEach(item => {
      const prod = db.findById('products', item.id);
      if (prod) {
        const newStock = Math.max(0, prod.stock - item.quantity);
        db.update('products', item.id, { stock: newStock });
      }
    });

    // Send confirmation email
    emailService.sendOrderConfirmationEmail(savedOrder);

    // Log Activity
    const custName = newOrder.customer?.fullName || 'Distinguished Patron';
    db.insert('activityLog', {
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

export const updateOrderStatus = (req, res) => {
  try {
    const { id } = req.params;
    const orderStatus = req.body.orderStatus || req.body.status;
    const { trackingNumber, courierTier } = req.body;

    if (!orderStatus) {
      return res.status(400).json({ success: false, message: 'Order status is required.' });
    }

    const existing = db.findById('orders', id);
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Order not found.' });
    }

    const updates = { orderStatus };
    if (trackingNumber) updates.trackingNumber = trackingNumber;
    if (courierTier) updates.courierTier = courierTier;

    const updated = db.update('orders', id, updates);

    db.insert('activityLog', {
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

export const cancelOrder = (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    const existing = db.findById('orders', id);
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Order not found.' });
    }

    if (existing.orderStatus === 'Delivered' || existing.orderStatus === 'Out for Delivery') {
      return res.status(400).json({
        success: false,
        message: 'Order is already out for delivery or delivered. Please request a Return / Exchange instead.'
      });
    }

    const updated = db.update('orders', id, {
      orderStatus: 'Cancelled',
      cancelReason: reason || 'Customer requested cancellation.'
    });

    // Restore stock
    (existing.items || []).forEach(item => {
      const prod = db.findById('products', item.id);
      if (prod) {
        db.update('products', item.id, { stock: prod.stock + (item.quantity || 1) });
      }
    });

    db.insert('activityLog', {
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

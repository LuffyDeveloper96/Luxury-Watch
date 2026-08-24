import { db } from '../config/db.js';

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
      return res.status(404).json({ success: false, message: `No order found matching "${id}".` });
    }

    return res.json({ success: true, order });
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

    const orderId = orderData.id || `ORD-AK-${Math.floor(10000 + Math.random() * 90000)}`;
    const trackingNumber = orderData.trackingNumber || `AK-EXP-${Math.floor(10000000 + Math.random() * 90000000)}`;

    const newOrder = {
      ...orderData,
      id: orderId,
      date: new Date().toISOString(),
      orderStatus: orderData.orderStatus || 'Confirmed',
      paymentStatus: orderData.paymentStatus || 'Paid',
      trackingNumber
    };

    // Save order
    const savedOrder = db.insert('orders', newOrder);

    // Atomically decrement stock of ordered items
    newOrder.items.forEach(item => {
      const prodId = item.id || (item.product && item.product.id);
      if (prodId) {
        const prod = db.findById('products', prodId);
        if (prod) {
          const newStock = Math.max(0, prod.stock - (item.quantity || 1));
          db.update('products', prodId, { stock: newStock });
        }
      }
    });

    // Log Activity
    const custName = newOrder.customer?.fullName || 'Distinguished Collector';
    db.insert('activityLog', {
      id: `act-${Date.now()}`,
      text: `🎉 New Order #${savedOrder.id} placed by ${custName}`,
      time: 'Just now',
      type: 'order'
    });

    return res.status(201).json({
      success: true,
      message: 'Order placed and confirmed in Geneva queue.',
      order: savedOrder
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

export const updateOrderStatus = (req, res) => {
  try {
    const { id } = req.params;
    const { orderStatus } = req.body;

    if (!orderStatus) {
      return res.status(400).json({ success: false, message: 'Order status is required.' });
    }

    const existing = db.findById('orders', id);
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Order not found.' });
    }

    const updated = db.update('orders', id, { orderStatus });

    // Log Activity
    db.insert('activityLog', {
      id: `act-${Date.now()}`,
      text: `Order #${id} fulfillment stage changed to: "${orderStatus}"`,
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

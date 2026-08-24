import { db } from '../config/db.js';

export const getSummary = (req, res) => {
  try {
    const products = db.getCollection('products');
    const orders = db.getCollection('orders');
    const reviews = db.getCollection('reviews');

    const totalRevenue = orders.reduce((sum, o) => sum + (Number(o.total) || 0), 0);
    const totalOrders = orders.length;
    const avgOrderValue = totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0;
    const lowStockCount = products.filter(p => Number(p.stock) <= 4).length;

    const ordersByStatus = {
      confirmed: orders.filter(o => o.orderStatus === 'Confirmed').length,
      inAssembly: orders.filter(o => o.orderStatus === 'In Assembly').length,
      dispatched: orders.filter(o => o.orderStatus === 'Dispatched').length,
      delivered: orders.filter(o => o.orderStatus === 'Delivered').length
    };

    return res.json({
      success: true,
      summary: {
        totalRevenue,
        totalOrders,
        avgOrderValue,
        totalProducts: products.length,
        totalReviews: reviews.length,
        lowStockCount,
        ordersByStatus
      }
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

export const getActivityLog = (req, res) => {
  try {
    const activityLog = db.getCollection('activityLog');
    return res.json({
      success: true,
      activityLog
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

export const logActivity = (req, res) => {
  try {
    const { text, type } = req.body;
    if (!text) {
      return res.status(400).json({ success: false, message: 'Activity text is required.' });
    }

    const entry = db.insert('activityLog', {
      id: `act-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      text,
      time: 'Just now',
      type: type || 'general'
    });

    return res.status(201).json({ success: true, activity: entry });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

import { db } from '../config/db.js';

export const getSummary = (req, res) => {
  try {
    const products = db.getCollection('products');
    const orders = db.getCollection('orders');
    const users = db.getCollection('users');
    const returns = db.getCollection('returns');
    const brands = db.getCollection('brands');

    // Revenue calculations
    const paidOrders = orders.filter(o => o.paymentStatus === 'Paid' || o.orderStatus === 'Delivered' || o.orderStatus === 'Confirmed' || o.orderStatus === 'Shipped');
    const totalRevenue = paidOrders.reduce((sum, o) => sum + (Number(o.total) || 0), 0);

    const todayStr = new Date().toISOString().split('T')[0];
    const todayOrders = paidOrders.filter(o => o.date && o.date.startsWith(todayStr));
    const todayRevenue = todayOrders.reduce((sum, o) => sum + (Number(o.total) || 0), 0);

    const now = new Date();
    const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    const monthlyOrders = paidOrders.filter(o => o.date && o.date.startsWith(currentMonth));
    const monthlyRevenue = monthlyOrders.reduce((sum, o) => sum + (Number(o.total) || 0), 0);

    // Orders by status
    const pendingOrders = orders.filter(o => o.orderStatus === 'Pending' || o.orderStatus === 'Confirmed' || o.orderStatus === 'Processing').length;
    const deliveredOrders = orders.filter(o => o.orderStatus === 'Delivered').length;
    const shippedOrders = orders.filter(o => o.orderStatus === 'Shipped' || o.orderStatus === 'Out for Delivery').length;
    const cancelledOrders = orders.filter(o => o.orderStatus === 'Cancelled').length;

    // Inventory status
    const lowStockThreshold = 5;
    const lowStockProducts = products.filter(p => p.stock <= lowStockThreshold && p.stock > 0);
    const outOfStockProducts = products.filter(p => p.stock === 0);

    // Sales by Brand
    const brandSalesMap = {};
    paidOrders.forEach(o => {
      (o.items || []).forEach(item => {
        const b = item.brand || 'Other';
        brandSalesMap[b] = (brandSalesMap[b] || 0) + ((item.price || 0) * (item.quantity || 1));
      });
    });

    const topBrands = Object.entries(brandSalesMap)
      .map(([brand, revenue]) => ({ brand, revenue }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 6);

    // Sales by Category
    const categorySalesMap = {};
    products.forEach(p => {
      const cat = p.category || 'Luxury';
      categorySalesMap[cat] = (categorySalesMap[cat] || 0) + 1;
    });

    const categoryDistribution = Object.entries(categorySalesMap).map(([category, count]) => ({
      category,
      count
    }));

    // Revenue Timeline (Last 7 Days)
    const timeline = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dayKey = d.toISOString().split('T')[0];
      const dayOrders = paidOrders.filter(o => o.date && o.date.startsWith(dayKey));
      const dayRev = dayOrders.reduce((sum, o) => sum + (Number(o.total) || 0), 0);
      timeline.push({
        date: dayKey,
        day: d.toLocaleDateString('en-US', { weekday: 'short' }),
        revenue: dayRev,
        orders: dayOrders.length
      });
    }

    return res.json({
      success: true,
      metrics: {
        totalRevenue,
        todayRevenue,
        monthlyRevenue,
        totalOrders: orders.length,
        pendingOrders,
        shippedOrders,
        deliveredOrders,
        cancelledOrders,
        totalCustomers: Math.max(users.length, new Set(orders.map(o => o.customer?.email)).size),
        totalProducts: products.length,
        totalBrands: brands.length,
        lowStockCount: lowStockProducts.length,
        outOfStockCount: outOfStockProducts.length,
        pendingReturnsCount: returns.filter(r => r.status === 'Requested' || r.status === 'Pickup Scheduled').length
      },
      lowStockProducts,
      topBrands,
      categoryDistribution,
      timeline,
      recentOrders: orders.slice(0, 6)
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

export const getActivityLog = (req, res) => {
  try {
    const logs = db.getCollection('activityLog') || [];
    return res.json({
      success: true,
      count: logs.length,
      activities: logs.slice(0, 25)
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

export const logActivity = (req, res) => {
  try {
    const { text, type = 'general', badge } = req.body;
    if (!text) {
      return res.status(400).json({ success: false, message: 'Activity text is required.' });
    }

    const entry = db.insert('activityLog', {
      id: `act-${Date.now()}`,
      text,
      time: 'Just now',
      type,
      badge
    });

    return res.status(201).json({ success: true, activity: entry });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

export default {
  getSummary,
  getActivityLog,
  logActivity
};

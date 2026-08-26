import { db } from '../config/db.js';

export const getCoupons = (req, res) => {
  try {
    const coupons = db.getCollection('coupons');
    return res.json({
      success: true,
      count: coupons.length,
      coupons
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

export const validateCoupon = (req, res) => {
  try {
    const { code, subtotal, items = [] } = req.body;
    if (!code) {
      return res.status(400).json({ success: false, message: 'Promotion code is required.' });
    }

    const coupons = db.getCollection('coupons');
    const cleanCode = code.trim().toUpperCase();
    const coupon = coupons.find(c => c.code.toUpperCase() === cleanCode);

    if (!coupon) {
      return res.status(404).json({ success: false, message: 'Invalid promotion code.' });
    }

    if (coupon.active === false) {
      return res.status(400).json({ success: false, message: 'This promotion code is currently inactive.' });
    }

    const sub = Number(subtotal) || 0;
    if (coupon.minSpend && sub < coupon.minSpend) {
      return res.status(400).json({
        success: false,
        message: `Minimum order spend of ₹${coupon.minSpend.toLocaleString('en-IN')} required for code ${coupon.code}.`,
        coupon
      });
    }

    let discountAmount = 0;
    if (coupon.discountPercent) {
      discountAmount = (sub * coupon.discountPercent) / 100;
    } else if (coupon.discountAmount) {
      discountAmount = coupon.discountAmount;
    }

    if (coupon.maxDiscount && discountAmount > coupon.maxDiscount) {
      discountAmount = coupon.maxDiscount;
    }

    return res.json({
      success: true,
      message: `Code "${coupon.code}" applied successfully.`,
      coupon,
      discountPercent: coupon.discountPercent,
      discountAmount
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

export const createCoupon = (req, res) => {
  try {
    const { code, discountPercent, discountAmount, minSpend, maxDiscount, description, brand, category } = req.body;

    if (!code || (!discountPercent && !discountAmount)) {
      return res.status(400).json({ success: false, message: 'Code and discount value are required.' });
    }

    const newCoupon = {
      code: code.trim().toUpperCase(),
      discountPercent: discountPercent ? Number(discountPercent) : undefined,
      discountAmount: discountAmount ? Number(discountAmount) : undefined,
      minSpend: Number(minSpend) || 0,
      maxDiscount: maxDiscount ? Number(maxDiscount) : undefined,
      description: description || `${discountPercent || discountAmount}% VIP discount`,
      brand: brand || undefined,
      category: category || undefined,
      active: true,
      createdAt: new Date().toISOString()
    };

    const saved = db.insert('coupons', newCoupon);

    db.insert('activityLog', {
      id: `act-${Date.now()}`,
      text: `Master Admin created promotion code: "${newCoupon.code}"`,
      time: 'Just now',
      type: 'admin'
    });

    return res.status(201).json({
      success: true,
      message: 'Promotion code created successfully.',
      coupon: saved
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

export const updateCoupon = (req, res) => {
  try {
    const { code } = req.params;
    const updates = req.body;
    const cleanCode = code.toUpperCase();

    const coupons = db.getCollection('coupons');
    const idx = coupons.findIndex(c => c.code.toUpperCase() === cleanCode);
    if (idx === -1) {
      return res.status(404).json({ success: false, message: 'Coupon not found.' });
    }

    coupons[idx] = { ...coupons[idx], ...updates, updatedAt: new Date().toISOString() };
    db.setCollection('coupons', coupons);

    return res.json({ success: true, message: 'Coupon updated successfully.', coupon: coupons[idx] });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

export const deleteCoupon = (req, res) => {
  try {
    const { code } = req.params;
    const cleanCode = code.toUpperCase();
    const coupons = db.getCollection('coupons');
    const filtered = coupons.filter(c => c.code.toUpperCase() !== cleanCode);

    if (filtered.length === coupons.length) {
      return res.status(404).json({ success: false, message: 'Coupon not found.' });
    }

    db.setCollection('coupons', filtered);
    return res.json({ success: true, message: 'Coupon removed successfully.' });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

export default {
  getCoupons,
  validateCoupon,
  createCoupon,
  updateCoupon,
  deleteCoupon
};

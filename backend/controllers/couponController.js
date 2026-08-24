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
    const { code, subtotal } = req.body;
    if (!code) {
      return res.status(400).json({ success: false, message: 'Promotion code is required.' });
    }

    const coupons = db.getCollection('coupons');
    const cleanCode = code.trim().toUpperCase();
    const coupon = coupons.find(c => c.code.toUpperCase() === cleanCode);

    if (!coupon) {
      return res.status(404).json({ success: false, message: 'Invalid promotion code.' });
    }

    const sub = Number(subtotal) || 0;
    if (sub < coupon.minSpend) {
      return res.status(400).json({
        success: false,
        message: `Minimum order spend of ₹${coupon.minSpend.toLocaleString('en-IN')} required for code ${coupon.code}.`,
        coupon
      });
    }

    const discountAmount = (sub * coupon.discountPercent) / 100;

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
    const { code, discountPercent, minSpend, description } = req.body;

    if (!code || !discountPercent) {
      return res.status(400).json({ success: false, message: 'Code and discount percentage are required.' });
    }

    const newCoupon = {
      code: code.trim().toUpperCase(),
      discountPercent: Number(discountPercent),
      minSpend: Number(minSpend) || 0,
      description: description || `${discountPercent}% VIP discount`
    };

    const saved = db.insert('coupons', newCoupon);

    // Log Activity
    db.insert('activityLog', {
      id: `act-${Date.now()}`,
      text: `Admin created new VIP promotion code: "${newCoupon.code}" (${newCoupon.discountPercent}%)`,
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

import { Coupon, ActivityLog } from '../models/index.js';

export const getCoupons = async (req, res) => {
  try {
    const coupons = await Coupon.find({}).sort({ createdAt: -1 }).lean();
    return res.json({
      success: true,
      count: coupons.length,
      coupons
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

export const validateCoupon = async (req, res) => {
  try {
    const { code, subtotal, items = [] } = req.body;
    if (!code) {
      return res.status(400).json({ success: false, message: 'Promotion code is required.' });
    }

    const cleanCode = code.trim().toUpperCase();
    const coupon = await Coupon.findOne({ code: cleanCode }).lean();

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

export const createCoupon = async (req, res) => {
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
      createdAt: new Date()
    };

    const saved = await Coupon.create(newCoupon);

    await ActivityLog.create({
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

export const updateCoupon = async (req, res) => {
  try {
    const { code } = req.params;
    const updates = req.body;
    const cleanCode = code.toUpperCase();

    const existing = await Coupon.findOne({ code: cleanCode });
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Coupon not found.' });
    }

    const updated = await Coupon.findOneAndUpdate(
      { _id: existing._id },
      { $set: { ...updates, updatedAt: new Date() } },
      { returnDocument: 'after' }
    );

    return res.json({ success: true, message: 'Coupon updated successfully.', coupon: updated });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

export const deleteCoupon = async (req, res) => {
  try {
    const { code } = req.params;
    const cleanCode = code.toUpperCase();

    const existing = await Coupon.findOne({ code: cleanCode });
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Coupon not found.' });
    }

    await Coupon.deleteOne({ _id: existing._id });
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

import mongoose from 'mongoose';

const couponSchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true, uppercase: true, trim: true, index: true },
  discountPercent: { type: Number, min: 1, max: 100 },
  discountAmount: { type: Number, min: 0 },
  minSpend: { type: Number, default: 0 },
  maxDiscount: { type: Number },
  description: { type: String, default: '' },
  brand: { type: String },
  category: { type: String },
  validFrom: { type: Date, default: Date.now },
  validUntil: { type: Date },
  usageLimit: { type: Number },
  timesUsed: { type: Number, default: 0 },
  active: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

export const Coupon = mongoose.models.Coupon || mongoose.model('Coupon', couponSchema);
export default Coupon;

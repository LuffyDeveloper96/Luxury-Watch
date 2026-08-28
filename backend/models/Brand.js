import mongoose from 'mongoose';

const brandSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true, index: true },
  name: { type: String, required: true, unique: true, trim: true, index: true },
  slug: { type: String, required: true, unique: true, lowercase: true, index: true },
  tagline: { type: String, default: '' },
  origin: { type: String, default: 'Switzerland' },
  founded: { type: String, default: '' },
  hallmark: { type: String, default: '' },
  logoSvg: { type: String, default: '' },
  logoUrl: { type: String, default: '' },
  bannerUrl: { type: String, default: '' },
  color: { type: String, default: '#0f172a' },
  goldAccent: { type: String, default: '#d4af37' },
  displayOrder: { type: Number, default: 0, index: true },
  isFeatured: { type: Boolean, default: true },
  active: { type: Boolean, default: true, index: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

export const Brand = mongoose.models.Brand || mongoose.model('Brand', brandSchema);
export default Brand;

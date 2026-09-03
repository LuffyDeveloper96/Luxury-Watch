import mongoose from 'mongoose';

const brandSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true, index: true },
  name: { type: String, required: true, trim: true, index: true },
  slug: { type: String, required: true, unique: true, lowercase: true, index: true },
  badge: { type: String, default: 'OFFICIAL ICON' },
  tag: { type: String, default: '' },
  location: { type: String, default: 'Geneva, Switzerland' },
  established: { type: String, default: '' },
  origin: { type: String, default: '' },
  founded: { type: String, default: '' },
  featuredCollection: { type: String, default: '' },
  model: { type: String, default: '' },
  description: { type: String, default: '' },
  subtitle: { type: String, default: '' },
  tagline: { type: String, default: '' },
  hallmark: { type: String, default: '' },
  image: { type: String, default: '/images/watches/rolex_submariner.jpg' },
  imageAlt: { type: String, default: '' },
  logoUrl: { type: String, default: '' },
  bannerUrl: { type: String, default: '' },
  filterTarget: { type: String, default: '' },
  accentColor: { type: String, default: '#8a6709' },
  color: { type: String, default: '#0f172a' },
  goldAccent: { type: String, default: '#d4af37' },
  displayOrder: { type: Number, default: 0, index: true },
  isFeatured: { type: Boolean, default: true },
  active: { type: Boolean, default: true, index: true },
  isActive: { type: Boolean, default: true, index: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

export const Brand = mongoose.models.Brand || mongoose.model('Brand', brandSchema);
export default Brand;

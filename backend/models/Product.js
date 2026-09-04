import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true, index: true },
  slug: { type: String, index: true },
  name: { type: String, required: true, trim: true, index: true },
  subtitle: { type: String, default: '' },
  brand: { type: String, required: true, index: true },
  category: { type: String, required: true, index: true },
  gender: { type: String, enum: ['Men', 'Women', 'Unisex'], default: 'Men' },
  sku: { type: String, required: true, unique: true, index: true },
  modelNumber: { type: String, default: '' },
  price: { type: Number, required: true, min: 0 },
  comparePrice: { type: Number, min: 0 },
  discountPercent: { type: Number, default: 0 },
  stock: { type: Number, required: true, min: 0, default: 5 },
  lowStockThreshold: { type: Number, default: 3 },
  rating: { type: Number, default: 5.0, min: 0, max: 5 },
  reviewsCount: { type: Number, default: 0 },
  isFeatured: { type: Boolean, default: false },
  isBestSeller: { type: Boolean, default: false },
  isNewArrival: { type: Boolean, default: false },
  isLimited: { type: Boolean, default: false },
  badge: { type: String, default: '' },
  badgeType: { type: String, default: 'gold' },
  images: [{ type: String }],
  media: [{
    type: { type: String, enum: ['image', 'video'], default: 'image' },
    url: { type: String, required: true },
    thumbnail: { type: String, default: '' },
    order: { type: Number, default: 0 }
  }],
  description: { type: String, default: '' },
  shortDescription: { type: String, default: '' },
  specs: {
    movement: { type: String, default: 'Swiss Automatic' },
    display: { type: String, default: 'Analog' },
    powerReserve: { type: String, default: '48 Hours' },
    caseDiameter: { type: String, default: '41 mm' },
    caseThickness: { type: String, default: '12 mm' },
    caseMaterial: { type: String, default: '316L Stainless Steel' },
    caseShape: { type: String, default: 'Round' },
    dialColor: { type: String, default: 'Black' },
    strapMaterial: { type: String, default: 'Stainless Steel Bracelet' },
    strapColor: { type: String, default: 'Silver' },
    waterResistance: { type: String, default: '100 Meters / 10 ATM' },
    crystal: { type: String, default: 'Scratch-Resistant Sapphire Crystal' },
    clasp: { type: String, default: 'Folding Safety Clasp' },
    caseback: { type: String, default: 'Exhibition Caseback' },
    warranty: { type: String, default: '5-Year International Warranty' },
    origin: { type: String, default: 'Geneva, Switzerland' }
  },
  colors: [{
    name: { type: String },
    hex: { type: String },
    imageIndex: { type: Number, default: 0 }
  }],
  straps: [{
    name: { type: String },
    id: { type: String }
  }],
  returnEligible: { type: Boolean, default: true },
  tags: [{ type: String }],
  active: { type: Boolean, default: true, index: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

productSchema.index({ brand: 1, active: 1 });
productSchema.index({ category: 1, active: 1 });
productSchema.index({ price: 1, active: 1 });
productSchema.index({ isFeatured: 1, active: 1 });
productSchema.index({ isBestSeller: 1, active: 1 });
productSchema.index({ isNewArrival: 1, active: 1 });

export const Product = mongoose.models.Product || mongoose.model('Product', productSchema);
export default Product;


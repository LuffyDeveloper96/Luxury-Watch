import mongoose from 'mongoose';

const categorySchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true, index: true },
  name: { type: String, required: true, unique: true, trim: true, index: true },
  slug: { type: String, required: true, unique: true, lowercase: true, index: true },
  description: { type: String, default: '' },
  imageUrl: { type: String, default: '' },
  displayOrder: { type: Number, default: 0, index: true },
  active: { type: Boolean, default: true, index: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

export const Category = mongoose.models.Category || mongoose.model('Category', categorySchema);
export default Category;

import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true, index: true },
  productId: { type: String, required: true, index: true },
  author: { type: String, required: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  title: { type: String, required: true },
  comment: { type: String, required: true },
  verified: { type: Boolean, default: false },
  avatar: { type: String, default: 'LW' },
  location: { type: String, default: 'India' },
  status: { type: String, enum: ['approved', 'pending', 'hidden'], default: 'approved' },
  source: { type: String, enum: ['seed', 'user'], default: 'user' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

export const Review = mongoose.models.Review || mongoose.model('Review', reviewSchema);
export default Review;

import mongoose from 'mongoose';

const imageSchema = new mongoose.Schema({
  data: Buffer,
  contentType: String,
  createdAt: { type: Date, default: Date.now }
});

export const Image = mongoose.models.Image || mongoose.model('Image', imageSchema);
export default Image;

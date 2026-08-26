import mongoose from 'mongoose';

const addressSchema = new mongoose.Schema({
  id: { type: String, default: () => `ADDR-${Date.now()}` },
  fullName: { type: String, required: true },
  phone: { type: String, required: true },
  street: { type: String, required: true },
  landmark: { type: String, default: '' },
  city: { type: String, required: true },
  state: { type: String, required: true },
  postalCode: { type: String, required: true },
  country: { type: String, default: 'India' },
  isDefault: { type: Boolean, default: false }
}, { _id: false });

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
  password: { type: String, default: '' },
  name: { type: String, default: '' },
  phone: { type: String, default: '' },
  role: { type: String, enum: ['customer', 'admin'], default: 'customer' },
  verified: { type: Boolean, default: false },
  addresses: [addressSchema],
  totalSpent: { type: Number, default: 0 },
  ordersCount: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

export const User = mongoose.models.User || mongoose.model('User', userSchema);
export default User;

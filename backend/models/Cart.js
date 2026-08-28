import mongoose from 'mongoose';

const cartItemSchema = new mongoose.Schema({
  productId: { type: String, required: true, index: true },
  name: { type: String, required: true },
  price: { type: Number, required: true },
  brand: { type: String },
  image: { type: String },
  quantity: { type: Number, required: true, min: 1, default: 1 },
  selectedColor: { type: String },
  selectedStrap: { type: String },
  addedAt: { type: Date, default: Date.now }
}, { _id: false });

const cartSchema = new mongoose.Schema({
  userId: { type: String, required: true, unique: true, index: true },
  items: [cartItemSchema],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

export const Cart = mongoose.models.Cart || mongoose.model('Cart', cartSchema);
export default Cart;

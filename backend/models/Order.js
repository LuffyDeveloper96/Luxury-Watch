import mongoose from 'mongoose';

const orderItemSchema = new mongoose.Schema({
  id: { type: String, required: true },
  name: { type: String, required: true },
  brand: { type: String },
  sku: { type: String },
  price: { type: Number, required: true },
  comparePrice: { type: Number },
  quantity: { type: Number, required: true, min: 1 },
  image: { type: String },
  selectedColor: { type: String },
  selectedStrap: { type: String }
}, { _id: false });

const orderCustomerSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  email: { type: String, required: true, lowercase: true },
  phone: { type: String, required: true },
  address: { type: String, required: true },
  city: { type: String, required: true },
  state: { type: String, required: true },
  postalCode: { type: String, required: true },
  country: { type: String, default: 'India' },
  deliverySpeed: { type: String, default: 'BlueDart Insured Air Express' },
  specialInstructions: { type: String, default: '' }
}, { _id: false });

const orderSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true, index: true },
  customer: { type: orderCustomerSchema, required: true },
  items: [orderItemSchema],
  subtotal: { type: Number, required: true },
  discountAmount: { type: Number, default: 0 },
  appliedCoupon: {
    code: { type: String },
    discountPercent: { type: Number }
  },
  shippingFee: { type: Number, default: 0 },
  taxAmount: { type: Number, default: 0 },
  total: { type: Number, required: true },
  currency: { type: String, default: 'INR' },
  orderStatus: {
    type: String,
    enum: ['Pending', 'Confirmed', 'Processing', 'Packed', 'Shipped', 'Out for Delivery', 'Delivered', 'Cancelled', 'Return Requested', 'Returned', 'Refunded'],
    default: 'Confirmed',
    index: true
  },
  paymentStatus: {
    type: String,
    enum: ['Created', 'Pending', 'Paid', 'Failed', 'Cancelled', 'Refunded'],
    default: 'Paid',
    index: true
  },
  paymentMethod: { type: String, default: 'razorpay' },
  paymentDetails: {
    gatewayOrderId: { type: String, index: true },
    paymentId: { type: String, index: true },
    signature: { type: String },
    utrNumber: { type: String },
    bankReference: { type: String },
    receipt: { type: String }
  },
  trackingNumber: { type: String, index: true },
  courierTier: { type: String, default: 'Securitas Armoured Express (Insured)' },
  estimatedDeliveryDate: { type: String },
  cancelReason: { type: String },
  returnId: { type: String },
  createdAt: { type: Date, default: Date.now, index: true },
  updatedAt: { type: Date, default: Date.now }
});

export const Order = mongoose.models.Order || mongoose.model('Order', orderSchema);
export default Order;

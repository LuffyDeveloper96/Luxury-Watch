import mongoose from 'mongoose';

const paymentSchema = new mongoose.Schema({
  transactionId: { type: String, required: true, unique: true, index: true },
  orderId: { type: String, index: true },
  gateway: { type: String, default: 'razorpay' },
  gatewayOrderId: { type: String, required: true, index: true },
  gatewayPaymentId: { type: String, index: true, sparse: true },
  gatewaySignature: { type: String },
  amount: { type: Number, required: true },
  currency: { type: String, default: 'INR' },
  status: {
    type: String,
    enum: ['created', 'pending', 'processing', 'paid', 'failed', 'refunded', 'cancelled'],
    default: 'created',
    index: true
  },
  processingAt: { type: Date, index: true },
  processingWorkerId: { type: String },
  subtotal: { type: Number },
  discountAmount: { type: Number, default: 0 },
  shippingFee: { type: Number, default: 0 },
  total: { type: Number },
  appliedCoupon: {
    code: { type: String },
    discountPercent: { type: Number }
  },
  items: [{
    id: { type: String, required: true },
    name: { type: String, required: true },
    brand: { type: String },
    sku: { type: String },
    price: { type: Number, required: true },
    quantity: { type: Number, required: true, min: 1 },
    image: { type: String },
    selectedColor: { type: String },
    selectedStrap: { type: String }
  }],
  customer: {
    fullName: { type: String },
    email: { type: String, lowercase: true },
    phone: { type: String },
    address: { type: String },
    city: { type: String },
    state: { type: String },
    postalCode: { type: String },
    country: { type: String, default: 'India' },
    deliverySpeed: { type: String }
  },
  userId: { type: String },
  method: { type: String, default: 'card' },
  customerEmail: { type: String, lowercase: true },
  customerPhone: { type: String },
  failureReason: { type: String },
  rawResponse: { type: mongoose.Schema.Types.Mixed },
  createdAt: { type: Date, default: Date.now, index: true },
  updatedAt: { type: Date, default: Date.now }
});

paymentSchema.index({ gatewayPaymentId: 1, status: 1 });
paymentSchema.index({ gatewayOrderId: 1, status: 1 });

export const Payment = mongoose.models.Payment || mongoose.model('Payment', paymentSchema);
export default Payment;

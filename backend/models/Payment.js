import mongoose from 'mongoose';

const paymentSchema = new mongoose.Schema({
  transactionId: { type: String, required: true, unique: true, index: true },
  orderId: { type: String, required: true, index: true },
  gateway: { type: String, default: 'razorpay' },
  gatewayOrderId: { type: String, index: true },
  gatewayPaymentId: { type: String, index: true },
  gatewaySignature: { type: String },
  amount: { type: Number, required: true },
  currency: { type: String, default: 'INR' },
  status: {
    type: String,
    enum: ['created', 'pending', 'paid', 'failed', 'refunded', 'cancelled'],
    default: 'created',
    index: true
  },
  method: { type: String, default: 'card' },
  customerEmail: { type: String, lowercase: true },
  customerPhone: { type: String },
  failureReason: { type: String },
  rawResponse: { type: mongoose.Schema.Types.Mixed },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

export const Payment = mongoose.models.Payment || mongoose.model('Payment', paymentSchema);
export default Payment;

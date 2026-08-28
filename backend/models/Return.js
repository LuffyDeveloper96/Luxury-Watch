import mongoose from 'mongoose';

const returnItemSchema = new mongoose.Schema({
  id: { type: String },
  name: { type: String, required: true },
  price: { type: Number },
  quantity: { type: Number, default: 1 }
}, { _id: false });

const returnSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true, index: true },
  orderId: { type: String, required: true, index: true },
  customerName: { type: String, default: 'Valued Patron' },
  customerEmail: { type: String, required: true, lowercase: true, index: true },
  customerPhone: { type: String, default: '' },
  items: [returnItemSchema],
  returnReason: { type: String, required: true },
  resolutionType: { type: String, enum: ['Refund', 'Exchange'], default: 'Refund' },
  exchangeModelPreference: { type: String, default: null },
  pickupAddress: { type: String, default: 'Client Registered Address' },
  notes: { type: String, default: '' },
  status: {
    type: String,
    enum: ['Requested', 'Pickup Scheduled', 'Inspected & Approved', 'Refund Issued', 'Exchange Dispatched', 'Rejected', 'Closed'],
    default: 'Requested',
    index: true
  },
  waybillNumber: { type: String, index: true },
  courierTier: { type: String, default: 'Securitas Armoured Return Transit (Insured)' },
  resolutionNotes: { type: String },
  createdAt: { type: Date, default: Date.now, index: true },
  updatedAt: { type: Date, default: Date.now }
});

export const Return = mongoose.models.Return || mongoose.model('Return', returnSchema);
export default Return;

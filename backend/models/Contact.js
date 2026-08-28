import mongoose from 'mongoose';

const contactSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true, index: true },
  name: { type: String, required: true },
  email: { type: String, required: true, lowercase: true, index: true },
  phone: { type: String, default: '' },
  subject: { type: String, default: 'General Concierge Inquiry' },
  message: { type: String, required: true },
  status: { type: String, enum: ['unread', 'read', 'archived'], default: 'unread', index: true },
  createdAt: { type: Date, default: Date.now, index: true }
});

export const Contact = mongoose.models.Contact || mongoose.model('Contact', contactSchema);
export default Contact;

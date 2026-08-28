import mongoose from 'mongoose';

const activityLogSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true, index: true },
  text: { type: String, required: true },
  time: { type: String, default: 'Just now' },
  type: { type: String, default: 'general', index: true },
  badge: { type: String },
  location: { type: String },
  createdAt: { type: Date, default: Date.now, index: true }
});

export const ActivityLog = mongoose.models.ActivityLog || mongoose.model('ActivityLog', activityLogSchema);
export default ActivityLog;

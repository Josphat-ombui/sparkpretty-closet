import mongoose from 'mongoose';

const settingSchema = new mongoose.Schema({
  key: { type: String, required: true, unique: true, trim: true },
  value: { type: mongoose.Schema.Types.Mixed },
  type: { type: String, enum: ['text', 'textarea', 'number', 'boolean', 'json'], default: 'text' },
  group: { type: String, default: 'general' },
  label: { type: String, default: '' },
}, { timestamps: true });

export default mongoose.model('Setting', settingSchema);

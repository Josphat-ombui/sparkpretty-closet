import mongoose from 'mongoose';

const contactMessageSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, lowercase: true, trim: true },
  phone: { type: String, trim: true },
  subject: { type: String, default: '' },
  message: { type: String, required: true },
  read: { type: Boolean, default: false },
  replied: { type: Boolean, default: false },
}, { timestamps: true });

export default mongoose.model('ContactMessage', contactMessageSchema);

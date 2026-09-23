import mongoose from 'mongoose';

const mediaSchema = new mongoose.Schema({
  url: { type: String, required: true, trim: true },
  publicId: { type: String, default: '' },
  filename: { type: String, default: '', trim: true },
  mime: { type: String, default: 'image/jpeg' },
  size: { type: Number, default: 0 },
  width: { type: Number, default: 0 },
  height: { type: Number, default: 0 },
  alt: { type: String, default: '', trim: true },
  caption: { type: String, default: '', trim: true },
  tags: { type: [String], default: [] },
  folder: { type: String, default: 'sparkpretty', trim: true },
  source: { type: String, enum: ['cloudinary', 'url', 'local'], default: 'cloudinary' },
  uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

mediaSchema.index({ url: 1 });
mediaSchema.index({ tags: 1 });
mediaSchema.index({ folder: 1 });
mediaSchema.index({ createdAt: -1 });

export default mongoose.model('Media', mediaSchema);
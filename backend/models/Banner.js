import mongoose from 'mongoose';

const bannerSchema = new mongoose.Schema({
  title: { type: String, default: '' },
  subtitle: { type: String, default: '' },
  image: { type: String, default: '' },
  link: { type: String, default: '' },
  cta: { type: String, default: '' },
  type: { type: String, enum: ['hero', 'promo', 'story'], default: 'hero' },
  order: { type: Number, default: 0 },
  active: { type: Boolean, default: true },
}, { timestamps: true });

export default mongoose.model('Banner', bannerSchema);

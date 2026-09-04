import mongoose from 'mongoose';
import slugify from 'slugify';

const blogSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  slug: { type: String, unique: true },
  excerpt: { type: String, required: true },
  content: { type: String, required: true },
  coverImage: { type: String, default: '' },
  author: { type: String, default: 'Sparkpretty Team' },
  tags: [String],
  published: { type: Boolean, default: false },
  metaTitle: String,
  metaDescription: String,
}, { timestamps: true });

blogSchema.pre('save', function (next) {
  if (this.isModified('title')) {
    this.slug = slugify(this.title, { lower: true, strict: true });
  }
  next();
});

export default mongoose.model('Blog', blogSchema);

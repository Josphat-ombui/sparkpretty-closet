import mongoose from 'mongoose';
import slugify from 'slugify';

const variantSchema = new mongoose.Schema({
  size: { type: String, required: true },
  color: { type: String, required: true },
  colorHex: { type: String, default: '#000000' },
  material: { type: String, default: '' },
  price: { type: Number, required: true },
  salePrice: Number,
  sku: String,
  stock: { type: Number, default: 0 },
  images: [String],
});

const reviewSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  name: String,
  rating: { type: Number, min: 1, max: 5, required: true },
  title: String,
  comment: String,
}, { timestamps: true });

const productSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  slug: { type: String, unique: true },
  description: { type: String, default: '' },
  details: { type: String, default: '' },
  featured: { type: Boolean, default: false },
  active: { type: Boolean, default: true },
  category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
  variants: [variantSchema],
  tags: [String],
  reviews: [reviewSchema],
  relatedProductIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],
  metaTitle: String,
  metaDescription: String,
}, { timestamps: true });

productSchema.pre('save', function (next) {
  if (this.isModified('name')) {
    this.slug = slugify(this.name, { lower: true, strict: true });
  }
  next();
});

export default mongoose.model('Product', productSchema);

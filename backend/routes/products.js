import { Router } from 'express';
import Product from '../models/Product.js';
import Category from '../models/Category.js';

const router = Router();

router.get('/', async (req, res) => {
  try {
    const { category, size, color, material, minPrice, maxPrice, sort, search, page = 1, limit = 12 } = req.query;
    const filter = { active: true };
    if (category) {
      const cat = await Category.findOne({ slug: category });
      if (cat) filter.category = cat._id;
    }
    if (size) filter['variants.size'] = size;
    if (color) filter['variants.color'] = color;
    if (material) {
      const mat = Array.isArray(material) ? material : [material];
      filter['variants.material'] = { $in: mat };
    }
    if (minPrice || maxPrice) {
      filter['variants.price'] = {};
      if (minPrice) filter['variants.price'].$gte = Number(minPrice);
      if (maxPrice) filter['variants.price'].$lte = Number(maxPrice);
    }
    if (search) filter.name = { $regex: search, $options: 'i' };

    let sortObj = { createdAt: -1 };
    if (sort === 'price_asc') sortObj = { 'variants.price': 1 };
    if (sort === 'price_desc') sortObj = { 'variants.price': -1 };
    if (sort === 'name') sortObj = { name: 1 };

    const skip = (Number(page) - 1) * Number(limit);
    const [products, total] = await Promise.all([
      Product.find(filter).populate('category').sort(sortObj).skip(skip).limit(Number(limit)),
      Product.countDocuments(filter),
    ]);

    res.json({ success: true, data: { products, total, page: Number(page), pages: Math.ceil(total / Number(limit)) } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.get('/categories', async (req, res) => {
  try {
    const categories = await Category.find().sort('order');
    res.json({ success: true, data: categories });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.post('/:id/reviews', async (req, res) => {
  try {
    const { name, rating, title, comment } = req.body;
    if (!name || !comment) return res.status(400).json({ success: false, message: 'Name and comment are required' });
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
    const review = { name, rating: Number(rating) || 5, title, comment };
    product.reviews.push(review);
    await product.save();
    res.json({ success: true, data: review });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.get('/:slug', async (req, res) => {
  try {
    const product = await Product.findOne({ slug: req.params.slug, active: true }).populate('category');
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });

    const related = product.relatedProductIds?.length
      ? await Product.find({ _id: { $in: product.relatedProductIds }, active: true }).populate('category').limit(4)
      : await Product.find({ category: product.category, _id: { $ne: product._id }, active: true }).limit(4);

    const ratingData = product.reviews.length
      ? { avgRating: (product.reviews.reduce((s, r) => s + r.rating, 0) / product.reviews.length).toFixed(1), reviewCount: product.reviews.length }
      : { avgRating: 0, reviewCount: 0 };

    res.json({
      success: true,
      data: { ...product.toObject(), ...ratingData, related },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

export default router;

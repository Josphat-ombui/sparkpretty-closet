import { Router } from 'express';
import Product from '../models/Product.js';
import Category from '../models/Category.js';
import Order from '../models/Order.js';
import User from '../models/User.js';
import Blog from '../models/Blog.js';
import { auth, adminOnly } from '../middleware/auth.js';

const router = Router();

router.use(auth, adminOnly);

// --- Dashboard Stats ---
router.get('/stats', async (req, res) => {
  try {
    const [totalProducts, totalOrders, totalUsers, totalBlogs, revenue] = await Promise.all([
      Product.countDocuments(),
      Order.countDocuments(),
      User.countDocuments(),
      Blog.countDocuments(),
      Order.aggregate([{ $match: { status: 'paid' } }, { $group: { _id: null, total: { $sum: '$total' } } }]),
    ]);
    res.json({ success: true, data: { totalProducts, totalOrders, totalUsers, totalBlogs, revenue: revenue[0]?.total || 0 } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// --- Products ---
router.get('/products', async (req, res) => {
  try {
    const products = await Product.find().populate('category').sort('-createdAt');
    res.json({ success: true, data: products });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.post('/products', async (req, res) => {
  try {
    const product = await Product.create(req.body);
    res.status(201).json({ success: true, data: product });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.put('/products/:id', async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
    res.json({ success: true, data: product });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.delete('/products/:id', async (req, res) => {
  try {
    await Product.findByIdAndDelete(req.params.id);
    res.json({ success: true, data: {} });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// --- Orders ---
router.get('/orders', async (req, res) => {
  try {
    const orders = await Order.find().populate('user', 'name email').sort('-createdAt');
    res.json({ success: true, data: orders });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.put('/orders/:id/status', async (req, res) => {
  try {
    const order = await Order.findByIdAndUpdate(req.params.id, { status: req.body.status }, { new: true });
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
    res.json({ success: true, data: order });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// --- Categories ---
router.post('/categories', async (req, res) => {
  try {
    const category = await Category.create(req.body);
    res.status(201).json({ success: true, data: category });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.put('/categories/:id', async (req, res) => {
  try {
    const category = await Category.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json({ success: true, data: category });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.delete('/categories/:id', async (req, res) => {
  try {
    await Category.findByIdAndDelete(req.params.id);
    res.json({ success: true, data: {} });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// --- Blog Posts ---
router.get('/blog', async (req, res) => {
  try {
    const posts = await Blog.find().sort('-createdAt');
    res.json({ success: true, data: posts });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.post('/blog', async (req, res) => {
  try {
    const post = await Blog.create(req.body);
    res.status(201).json({ success: true, data: post });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.put('/blog/:id', async (req, res) => {
  try {
    const post = await Blog.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!post) return res.status(404).json({ success: false, message: 'Post not found' });
    res.json({ success: true, data: post });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.delete('/blog/:id', async (req, res) => {
  try {
    await Blog.findByIdAndDelete(req.params.id);
    res.json({ success: true, data: {} });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

export default router;

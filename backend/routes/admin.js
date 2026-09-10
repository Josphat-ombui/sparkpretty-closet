import { Router } from 'express';
import Product from '../models/Product.js';
import Category from '../models/Category.js';
import Order from '../models/Order.js';
import User from '../models/User.js';
import Blog from '../models/Blog.js';
import Subscriber from '../models/Subscriber.js';
import ContactMessage from '../models/ContactMessage.js';
import Setting from '../models/Setting.js';
import Banner from '../models/Banner.js';
import ContentVersion from '../models/ContentVersion.js';
import { auth, adminOnly, editorOrAdmin } from '../middleware/auth.js';
import { parsePagination } from '../utils/pagination.js';

const router = Router();

router.use(auth, adminOnly);

const asyncHandler = (fn) => (req, res) => {
  fn(req, res).catch((err) => res.status(500).json({ success: false, message: err.message }));
};

// ============================================================
// Dashboard
// ============================================================
router.get('/stats', asyncHandler(async (req, res) => {
  const [totalProducts, totalOrders, totalUsers, totalBlogs, totalSubscribers, unreadContacts, totalRevenue, todayOrders, lowStock] = await Promise.all([
    Product.countDocuments(),
    Order.countDocuments(),
    User.countDocuments(),
    Blog.countDocuments(),
    Subscriber.countDocuments(),
    ContactMessage.countDocuments({ read: false }),
    Order.aggregate([{ $match: { status: 'paid' } }, { $group: { _id: null, total: { $sum: '$total' } } }]),
    Order.countDocuments({ createdAt: { $gte: new Date(new Date().setHours(0, 0, 0, 0)) } }),
    Product.countDocuments({ 'variants.stock': { $lte: 5 } }),
  ]);
  res.json({
    success: true,
    data: {
      totalProducts, totalOrders, totalUsers, totalBlogs, totalSubscribers, unreadContacts,
      revenue: totalRevenue[0]?.total || 0, todayOrders, lowStock,
    },
  });
}));

// Sales analytics for charts (last N days)
router.get('/analytics/sales', asyncHandler(async (req, res) => {
  const days = Math.min(90, Math.max(7, parseInt(req.query.days, 10) || 30));
  const since = new Date();
  since.setDate(since.getDate() - (days - 1));
  since.setHours(0, 0, 0, 0);

  const pipeline = [
    { $match: { createdAt: { $gte: since }, status: { $ne: 'cancelled' } } },
    { $group: {
        _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
        revenue: { $sum: '$total' },
        orders: { $sum: 1 },
      } },
    { $sort: { _id: 1 } },
  ];
  const rows = await Order.aggregate(pipeline);

  const totals = await Order.aggregate([
    { $match: { createdAt: { $gte: since }, status: { $ne: 'cancelled' } } },
    { $group: { _id: null, revenue: { $sum: '$total' }, orders: { $sum: 1 } } },
  ]);

  // Fill missing days with zero
  const byDate = {};
  rows.forEach((r) => { byDate[r._id] = r; });
  const labels = [];
  for (let i = 0; i < days; i++) {
    const d = new Date(since);
    d.setDate(d.getDate() + i);
    const key = d.toISOString().slice(0, 10);
    labels.push({ date: key, revenue: byDate[key]?.revenue || 0, orders: byDate[key]?.orders || 0 });
  }

  res.json({
    success: true,
    data: {
      series: labels,
      totalRevenue: totals[0]?.revenue || 0,
      totalOrders: totals[0]?.orders || 0,
    },
  });
}));

// Top products by quantity sold
router.get('/analytics/top-products', asyncHandler(async (req, res) => {
  const rows = await Order.aggregate([
    { $match: { status: { $ne: 'cancelled' } } },
    { $unwind: '$items' },
    { $group: { _id: '$items.name', quantity: { $sum: '$items.quantity' }, revenue: { $sum: { $multiply: ['$items.quantity', '$items.price'] } } } },
    { $sort: { quantity: -1 } },
    { $limit: 8 },
  ]);
  res.json({ success: true, data: rows });
}));

// Orders by status
router.get('/analytics/orders', asyncHandler(async (req, res) => {
  const rows = await Order.aggregate([
    { $group: { _id: '$status', count: { $sum: 1 } } },
    { $sort: { _id: 1 } },
  ]);
  res.json({ success: true, data: rows });
}));

// ============================================================
// Users
// ============================================================
router.get('/users', asyncHandler(async (req, res) => {
  const { page, limit, skip } = parsePagination(req.query);
  const search = (req.query.search || '').toString().trim();
  const role = (req.query.role || '').toString().trim();
  const filter = {};
  if (search) filter.$or = [{ name: new RegExp(search, 'i') }, { email: new RegExp(search, 'i') }, { phone: new RegExp(search, 'i') }];
  if (role) filter.role = role;

  const [items, total] = await Promise.all([
    User.find(filter).sort('-createdAt').skip(skip).limit(limit).select('-password'),
    User.countDocuments(filter),
  ]);
  res.json({ success: true, data: { items, total, page, pages: Math.ceil(total / limit) || 1, limit } });
}));

router.get('/users/:id', asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id).select('-password');
  if (!user) return res.status(404).json({ success: false, message: 'User not found' });
  res.json({ success: true, data: user });
}));

router.post('/users', asyncHandler(async (req, res) => {
  const { name, email, phone, role, password } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ success: false, message: 'Name, email, and password are required' });
  }
  const existing = await User.findOne({ email: email.toLowerCase() });
  if (existing) return res.status(400).json({ success: false, message: 'Email already in use' });
  const user = await User.create({ name, email, phone, role: role || 'customer', password });
  res.status(201).json({ success: true, data: { _id: user._id, name: user.name, email: user.email, phone: user.phone, role: user.role } });
}));

router.put('/users/:id', asyncHandler(async (req, res) => {
  const { name, email, phone, role, password, addresses } = req.body;
  const update = {};
  if (name !== undefined) update.name = name;
  if (email !== undefined) update.email = email;
  if (phone !== undefined) update.phone = phone;
  if (role !== undefined && ['customer', 'editor', 'admin'].includes(role)) update.role = role;
  if (addresses !== undefined) update.addresses = addresses;
  const user = await User.findByIdAndUpdate(req.params.id, update, { new: true, runValidators: true }).select('-password');
  if (!user) return res.status(404).json({ success: false, message: 'User not found' });
  if (password) {
    user.password = password;
    await user.save();
  }
  res.json({ success: true, data: user });
}));

router.delete('/users/:id', asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) return res.status(404).json({ success: false, message: 'User not found' });
  if (user._id.toString() === req.user._id.toString()) {
    return res.status(400).json({ success: false, message: 'You cannot delete your own account' });
  }
  await User.findByIdAndDelete(req.params.id);
  res.json({ success: true, data: {} });
}));

// ============================================================
// Products
// ============================================================
router.get('/products', asyncHandler(async (req, res) => {
  const { page, limit, skip } = parsePagination(req.query);
  const search = (req.query.search || '').toString().trim();
  const category = (req.query.category || '').toString().trim();
  const filter = {};
  if (search) filter.$or = [{ name: new RegExp(search, 'i') }, { sku: new RegExp(search, 'i') }];
  if (category) filter.category = category;

  const [items, total] = await Promise.all([
    Product.find(filter).populate('category').sort('-createdAt').skip(skip).limit(limit),
    Product.countDocuments(filter),
  ]);
  res.json({ success: true, data: { items, total, page, pages: Math.ceil(total / limit) || 1, limit } });
}));

router.get('/products/:id', asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id).populate('category');
  if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
  res.json({ success: true, data: product });
}));

router.post('/products', asyncHandler(async (req, res) => {
  const product = await Product.create(req.body);
  res.status(201).json({ success: true, data: product });
}));

router.put('/products/:id', asyncHandler(async (req, res) => {
  if (req.body.slug) delete req.body.slug;
  const product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
  res.json({ success: true, data: product });
}));

router.delete('/products/:id', asyncHandler(async (req, res) => {
  await Product.findByIdAndDelete(req.params.id);
  res.json({ success: true, data: {} });
}));

// ============================================================
// Categories
// ============================================================
router.get('/categories', asyncHandler(async (req, res) => {
  const categories = await Category.find().sort({ order: 1, name: 1 });
  const withCounts = await Promise.all(categories.map(async (c) => ({
    ...c.toObject(),
    productCount: await Product.countDocuments({ category: c._id }),
  })));
  res.json({ success: true, data: withCounts });
}));

router.get('/categories/:id', asyncHandler(async (req, res) => {
  const category = await Category.findById(req.params.id);
  if (!category) return res.status(404).json({ success: false, message: 'Category not found' });
  res.json({ success: true, data: category });
}));

router.post('/categories', asyncHandler(async (req, res) => {
  const category = await Category.create(req.body);
  res.status(201).json({ success: true, data: category });
}));

router.put('/categories/:id', asyncHandler(async (req, res) => {
  if (req.body.slug) delete req.body.slug;
  const category = await Category.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  if (!category) return res.status(404).json({ success: false, message: 'Category not found' });
  res.json({ success: true, data: category });
}));

router.delete('/categories/:id', asyncHandler(async (req, res) => {
  const count = await Product.countDocuments({ category: req.params.id });
  if (count > 0) {
    return res.status(400).json({ success: false, message: `Cannot delete: ${count} product(s) belong to this category` });
  }
  await Category.findByIdAndDelete(req.params.id);
  res.json({ success: true, data: {} });
}));

// ============================================================
// Orders
// ============================================================
router.get('/orders', asyncHandler(async (req, res) => {
  const { page, limit, skip } = parsePagination(req.query);
  const status = (req.query.status || '').toString().trim();
  const search = (req.query.search || '').toString().trim();
  const filter = {};
  if (status) filter.status = status;
  if (search) {
    filter.$or = [
      { 'payment.mpesaReceipt': new RegExp(search, 'i') },
      { _id: /^[0-9a-fA-F]{24}$/.test(search) ? search : null },
    ].filter(Boolean);
  }

  const [items, total] = await Promise.all([
    Order.find(filter).populate('user', 'name email phone').sort('-createdAt').skip(skip).limit(limit),
    Order.countDocuments(filter),
  ]);
  res.json({ success: true, data: { items, total, page, pages: Math.ceil(total / limit) || 1, limit } });
}));

router.get('/orders/:id', asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id).populate('user', 'name email phone');
  if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
  res.json({ success: true, data: order });
}));

router.post('/orders', asyncHandler(async (req, res) => {
  const order = await Order.create(req.body);
  res.status(201).json({ success: true, data: order });
}));

router.put('/orders/:id/status', asyncHandler(async (req, res) => {
  const allowed = ['pending', 'paid', 'shipped', 'delivered', 'cancelled'];
  if (!allowed.includes(req.body.status)) {
    return res.status(400).json({ success: false, message: 'Invalid status' });
  }
  const order = await Order.findByIdAndUpdate(req.params.id, { status: req.body.status }, { new: true });
  if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
  res.json({ success: true, data: order });
}));

router.delete('/orders/:id', asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);
  if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
  if (order.status === 'paid') {
    return res.status(400).json({ success: false, message: 'Cannot delete a paid order' });
  }
  await Order.findByIdAndDelete(req.params.id);
  res.json({ success: true, data: {} });
}));

// ============================================================
// Blog
// ============================================================
router.get('/blog', asyncHandler(async (req, res) => {
  const { page, limit, skip } = parsePagination(req.query);
  const search = (req.query.search || '').toString().trim();
  const filter = {};
  if (search) filter.$or = [{ title: new RegExp(search, 'i') }, { author: new RegExp(search, 'i') }, { tags: new RegExp(search, 'i') }];
  const [items, total] = await Promise.all([
    Blog.find(filter).sort('-createdAt').skip(skip).limit(limit),
    Blog.countDocuments(filter),
  ]);
  res.json({ success: true, data: { items, total, page, pages: Math.ceil(total / limit) || 1, limit } });
}));

router.get('/blog/:id', asyncHandler(async (req, res) => {
  const post = await Blog.findById(req.params.id);
  if (!post) return res.status(404).json({ success: false, message: 'Post not found' });
  res.json({ success: true, data: post });
}));

router.post('/blog', asyncHandler(async (req, res) => {
  const post = await Blog.create(req.body);
  res.status(201).json({ success: true, data: post });
}));

router.put('/blog/:id', asyncHandler(async (req, res) => {
  if (req.body.slug) delete req.body.slug;
  const post = await Blog.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  if (!post) return res.status(404).json({ success: false, message: 'Post not found' });
  res.json({ success: true, data: post });
}));

router.delete('/blog/:id', asyncHandler(async (req, res) => {
  await Blog.findByIdAndDelete(req.params.id);
  res.json({ success: true, data: {} });
}));

// ============================================================
// Subscribers
// ============================================================
router.get('/subscribers', asyncHandler(async (req, res) => {
  const { page, limit, skip } = parsePagination(req.query);
  const search = (req.query.search || '').toString().trim();
  const active = (req.query.active || '').toString().trim();
  const filter = {};
  if (search) filter.email = new RegExp(search, 'i');
  if (active === 'true' || active === 'false') filter.active = active === 'true';
  const [items, total] = await Promise.all([
    Subscriber.find(filter).sort('-createdAt').skip(skip).limit(limit),
    Subscriber.countDocuments(filter),
  ]);
  res.json({ success: true, data: { items, total, page, pages: Math.ceil(total / limit) || 1, limit } });
}));

router.delete('/subscribers/:id', asyncHandler(async (req, res) => {
  await Subscriber.findByIdAndDelete(req.params.id);
  res.json({ success: true, data: {} });
}));

// ============================================================
// Contact messages
// ============================================================
router.get('/contacts', asyncHandler(async (req, res) => {
  const { page, limit, skip } = parsePagination(req.query);
  const read = (req.query.read || '').toString().trim();
  const filter = {};
  if (read === 'true' || read === 'false') filter.read = read === 'true';
  const [items, total] = await Promise.all([
    ContactMessage.find(filter).sort('-createdAt').skip(skip).limit(limit),
    ContactMessage.countDocuments(filter),
  ]);
  res.json({ success: true, data: { items, total, page, pages: Math.ceil(total / limit) || 1, limit } });
}));

router.get('/contacts/:id', asyncHandler(async (req, res) => {
  const message = await ContactMessage.findById(req.params.id);
  if (!message) return res.status(404).json({ success: false, message: 'Message not found' });
  res.json({ success: true, data: message });
}));

router.put('/contacts/:id', asyncHandler(async (req, res) => {
  const { read, replied } = req.body;
  const update = {};
  if (typeof read !== 'undefined') update.read = !!read;
  if (typeof replied !== 'undefined') update.replied = !!replied;
  const message = await ContactMessage.findByIdAndUpdate(req.params.id, update, { new: true });
  if (!message) return res.status(404).json({ success: false, message: 'Message not found' });
  res.json({ success: true, data: message });
}));

router.delete('/contacts/:id', asyncHandler(async (req, res) => {
  await ContactMessage.findByIdAndDelete(req.params.id);
  res.json({ success: true, data: {} });
}));

// ============================================================
// Banners (hero / promo / story)
// ============================================================
router.get('/banners', asyncHandler(async (req, res) => {
  const banners = await Banner.find().sort({ order: 1, createdAt: -1 });
  res.json({ success: true, data: banners });
}));

router.post('/banners', asyncHandler(async (req, res) => {
  const banner = await Banner.create(req.body);
  res.status(201).json({ success: true, data: banner });
}));

router.put('/banners/:id', asyncHandler(async (req, res) => {
  const banner = await Banner.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  if (!banner) return res.status(404).json({ success: false, message: 'Banner not found' });
  res.json({ success: true, data: banner });
}));

router.delete('/banners/:id', asyncHandler(async (req, res) => {
  await Banner.findByIdAndDelete(req.params.id);
  res.json({ success: true, data: {} });
}));

// ============================================================
// Content Manager (site content with versioning)
// ============================================================
router.get('/content', editorOrAdmin, asyncHandler(async (req, res) => {
  const { page, limit, skip } = parsePagination(req.query);
  const search = (req.query.search || '').toString().trim();
  const section = (req.query.section || '').toString().trim();
  const type = (req.query.type || '').toString().trim();
  const filter = {};
  if (search) filter.$or = [{ key: new RegExp(search, 'i') }, { label: new RegExp(search, 'i') }];
  if (section) filter.section = section;
  if (type) filter.type = type;

  const [items, total] = await Promise.all([
    Setting.find(filter).sort({ section: 1, key: 1 }).skip(skip).limit(limit),
    Setting.countDocuments(filter),
  ]);
  res.json({ success: true, data: { items, total, page, pages: Math.ceil(total / limit) || 1, limit } });
}));

router.get('/content/sections', editorOrAdmin, asyncHandler(async (req, res) => {
  const sections = await Setting.distinct('section');
  res.json({ success: true, data: sections.sort() });
}));

router.get('/content/:key', editorOrAdmin, asyncHandler(async (req, res) => {
  const setting = await Setting.findOne({ key: req.params.key });
  if (!setting) return res.status(404).json({ success: false, message: 'Content not found' });
  res.json({ success: true, data: setting });
}));

router.put('/content/:key', editorOrAdmin, asyncHandler(async (req, res) => {
  const { value, label, description, placeholder, section, type } = req.body;
  const previous = await Setting.findOne({ key: req.params.key });

  if (previous) {
    await ContentVersion.create({
      contentKey: req.params.key,
      value: previous.value,
      previousValue: previous.value,
      updatedBy: req.user._id,
      updatedByName: req.user.name,
    });
  }

  const setting = await Setting.findOneAndUpdate(
    { key: req.params.key },
    {
      $set: {
        value,
        ...(label !== undefined && { label }),
        ...(description !== undefined && { description }),
        ...(placeholder !== undefined && { placeholder }),
        ...(section !== undefined && { section }),
        ...(type !== undefined && { type }),
        lastUpdatedBy: req.user._id,
      },
    },
    { upsert: true, new: true, runValidators: true },
  );
  res.json({ success: true, data: setting });
}));

router.post('/content/bulk', editorOrAdmin, asyncHandler(async (req, res) => {
  const entries = req.body || [];
  const keys = [];
  for (const entry of entries) {
    if (!entry.key) continue;
    const previous = await Setting.findOne({ key: entry.key });
    if (previous && JSON.stringify(previous.value) !== JSON.stringify(entry.value)) {
      await ContentVersion.create({
        contentKey: entry.key,
        value: entry.value,
        previousValue: previous.value,
        updatedBy: req.user._id,
        updatedByName: req.user.name,
      });
    }
    keys.push(entry.key);
    await Setting.findOneAndUpdate(
      { key: entry.key },
      {
        $set: {
          value: entry.value,
          type: entry.type || 'text',
          group: entry.group || 'content',
          label: entry.label || entry.key,
          section: entry.section || 'general',
          description: entry.description || '',
          placeholder: entry.placeholder || '',
          lastUpdatedBy: req.user._id,
        },
      },
      { upsert: true, new: true },
    );
  }
  res.json({ success: true, data: keys });
}));

router.delete('/content/:key', adminOnly, asyncHandler(async (req, res) => {
  const setting = await Setting.findOneAndDelete({ key: req.params.key });
  if (setting) {
    await ContentVersion.create({
      contentKey: req.params.key,
      value: null,
      previousValue: setting.value,
      updatedBy: req.user._id,
      updatedByName: req.user.name,
    });
  }
  res.json({ success: true, data: {} });
}));

router.get('/content/:key/versions', editorOrAdmin, asyncHandler(async (req, res) => {
  const versions = await ContentVersion.find({ contentKey: req.params.key })
    .sort({ createdAt: -1 })
    .limit(20)
    .populate('updatedBy', 'name email');
  res.json({ success: true, data: versions });
}));

router.post('/content/:key/revert/:versionId', adminOnly, asyncHandler(async (req, res) => {
  const version = await ContentVersion.findById(req.params.versionId);
  if (!version) return res.status(404).json({ success: false, message: 'Version not found' });

  const current = await Setting.findOne({ key: req.params.key });
  if (current) {
    await ContentVersion.create({
      contentKey: req.params.key,
      value: current.value,
      previousValue: current.value,
      updatedBy: req.user._id,
      updatedByName: req.user.name,
    });
  }

  const setting = await Setting.findOneAndUpdate(
    { key: req.params.key },
    { $set: { value: version.value, lastUpdatedBy: req.user._id } },
    { upsert: true, new: true },
  );
  res.json({ success: true, data: setting });
}));

// ============================================================
// Settings (site content / configuration)
// ============================================================
router.get('/settings', asyncHandler(async (req, res) => {
  const settings = await Setting.find().sort({ group: 1, label: 1 });
  res.json({ success: true, data: settings });
}));

router.put('/settings/bulk', asyncHandler(async (req, res) => {
  const entries = req.body || [];
  const keys = [];
  for (const entry of entries) {
    if (!entry.key) continue;
    keys.push(entry.key);
    await Setting.findOneAndUpdate(
      { key: entry.key },
      { $set: { value: entry.value, type: entry.type || 'text', group: entry.group || 'general', label: entry.label || entry.key } },
      { upsert: true, new: true },
    );
  }
  res.json({ success: true, data: keys });
}));

router.get('/settings/:key', asyncHandler(async (req, res) => {
  const setting = await Setting.findOne({ key: req.params.key });
  if (!setting) return res.status(404).json({ success: false, message: 'Setting not found' });
  res.json({ success: true, data: setting });
}));

router.put('/settings/:key', asyncHandler(async (req, res) => {
  const { value, type, group, label } = req.body;
  const setting = await Setting.findOneAndUpdate(
    { key: req.params.key },
    { $set: { value, type: type || 'text', group: group || 'general', label: label || req.params.key } },
    { upsert: true, new: true, runValidators: true },
  );
  res.json({ success: true, data: setting });
}));

router.delete('/settings/:key', asyncHandler(async (req, res) => {
  await Setting.findOneAndDelete({ key: req.params.key });
  res.json({ success: true, data: {} });
}));

export default router;

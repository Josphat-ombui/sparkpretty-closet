import express from 'express';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import slugify from 'slugify';
import multer from 'multer';
import path from 'path';

const JWT_SECRET = process.env.JWT_SECRET || 'mock-secret';
const PORT = process.env.PORT || 5001;
const BASE_URL = process.env.SITE_URL || 'https://sparkpretty.co.ke';

const app = express();
app.use(cors({ origin: '*', credentials: true }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// --- In-memory DB ---
const db = {
  users: [],
  categories: [],
  products: [],
  carts: [],
  orders: [],
  blogs: [],
  reviews: [],
};
let nextId = 1;
const oid = () => String(nextId++);

// --- Seed data ---
const seedData = async () => {
  const cats = [
    { _id: oid(), name: 'Dresses', slug: 'dresses', description: 'Beautiful dresses for every occasion', image: '', order: 1 },
    { _id: oid(), name: 'Tops', slug: 'tops', description: 'Stylish tops and blouses', image: '', order: 2 },
    { _id: oid(), name: 'Bottoms', slug: 'bottoms', description: 'Jeans, skirts, and trousers', image: '', order: 3 },
    { _id: oid(), name: 'Shoes', slug: 'shoes', description: 'Complete your look', image: '', order: 4 },
    { _id: oid(), name: 'Accessories', slug: 'accessories', description: 'The finishing touches', image: '', order: 5 },
  ];
  db.categories.push(...cats);

  const catMap = {};
  cats.forEach((c) => { catMap[c.slug] = c._id; });

  const sampleProducts = [
    { name: 'Rose Garden Midi Dress', description: 'A stunning midi dress in soft rose pink.', categorySlug: 'dresses', featured: true, tags: ['new', 'bestseller'], variants: [
      { size: 'S', color: 'Rose Pink', colorHex: '#F8BBD0', price: 3500, salePrice: 2800, sku: 'SGMD-S-RP', stock: 15, images: [] },
      { size: 'M', color: 'Rose Pink', colorHex: '#F8BBD0', price: 3500, salePrice: 2800, sku: 'SGMD-M-RP', stock: 20, images: [] },
      { size: 'L', color: 'Rose Pink', colorHex: '#F8BBD0', price: 3500, salePrice: 2800, sku: 'SGMD-L-RP', stock: 10, images: [] },
    ]},
    { name: 'Silk Touch Blouse', description: 'Luxurious silk-feel blouse with delicate buttons.', categorySlug: 'tops', featured: false, tags: ['bestseller'], variants: [
      { size: 'S', color: 'White', colorHex: '#FFFFFF', price: 1800, sku: 'STB-S-WH', stock: 25, images: [] },
      { size: 'M', color: 'White', colorHex: '#FFFFFF', price: 1800, sku: 'STB-M-WH', stock: 18, images: [] },
    ]},
    { name: 'High-Waist Skinny Jeans', description: 'Classic high-waist skinny jeans with stretch.', categorySlug: 'bottoms', featured: true, tags: ['bestseller'], variants: [
      { size: 'S', color: 'Dark Blue', colorHex: '#1565C0', price: 2400, sku: 'HWSJ-S-DB', stock: 20, images: [] },
      { size: 'M', color: 'Dark Blue', colorHex: '#1565C0', price: 2400, sku: 'HWSJ-M-DB', stock: 25, images: [] },
      { size: 'L', color: 'Dark Blue', colorHex: '#1565C0', price: 2400, sku: 'HWSJ-L-DB', stock: 15, images: [] },
    ]},
    { name: 'Quilted Crossbody Bag', description: 'Chic quilted crossbody bag with gold chain strap.', categorySlug: 'accessories', featured: true, tags: ['new', 'bestseller'], variants: [
      { size: 'One Size', color: 'Black', colorHex: '#000000', price: 2200, sku: 'QCB-OS-BK', stock: 20, images: [] },
      { size: 'One Size', color: 'Rose Gold', colorHex: '#E8B4B8', price: 2200, sku: 'QCB-OS-RG', stock: 15, images: [] },
    ]},
  ];

  for (const p of sampleProducts) {
    db.products.push({
      _id: oid(), name: p.name, slug: slugify(p.name, { lower: true, strict: true }),
      description: p.description, category: catMap[p.categorySlug],
      variants: p.variants, tags: p.tags, featured: p.featured, active: true,
      createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
    });
  }

  // Admin user
  const adminHash = await bcrypt.hash('admin123', 12);
  db.users.push({
    _id: oid(), name: 'Admin', email: 'admin@sparkpretty.co.ke', password: adminHash,
    phone: '0729366991', role: 'admin', addresses: [], createdAt: new Date().toISOString(),
  });

  // Sample blog posts
  db.blogs.push(
    { _id: oid(), title: '10 Wardrobe Essentials', slug: '10-wardrobe-essentials', excerpt: 'Building a versatile wardrobe.', content: '<h2>Essentials</h2><p>Every woman needs these pieces.</p>', author: 'Sparkpretty Team', tags: ['fashion', 'tips'], published: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
    { _id: oid(), title: 'How to Style a Midi Dress', slug: 'how-to-style-a-midi-dress', excerpt: 'The midi dress is the hardest working piece.', content: '<h2>Midi Dresses</h2><p>Perfect for any occasion.</p>', author: 'Sparkpretty Team', tags: ['styling', 'dresses'], published: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  );

  console.log(`  [SEED] ${cats.length} categories, ${sampleProducts.length} products, 1 admin user, 2 blog posts`);
};

// --- Helpers ---
const signToken = (userId) => jwt.sign({ id: userId }, JWT_SECRET, { expiresIn: '7d' });

const auth = (req, res, next) => {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) return res.status(401).json({ success: false, message: 'Not authenticated' });
  try {
    const decoded = jwt.verify(header.split(' ')[1], JWT_SECRET);
    const user = db.users.find((u) => u._id === decoded.id);
    if (!user) return res.status(401).json({ success: false, message: 'User not found' });
    req.user = user;
    next();
  } catch {
    res.status(401).json({ success: false, message: 'Invalid token' });
  }
};

const optionalAuth = (req, res, next) => {
  const header = req.headers.authorization;
  if (header && header.startsWith('Bearer ')) {
    try {
      const decoded = jwt.verify(header.split(' ')[1], JWT_SECRET);
      const user = db.users.find((u) => u._id === decoded.id);
      if (user) req.user = user;
    } catch {}
  }
  next();
};

const adminOnly = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') return res.status(403).json({ success: false, message: 'Admin access required' });
  next();
};

const publicUser = (u) => ({ _id: u._id, name: u.name, email: u.email, phone: u.phone, role: u.role, addresses: u.addresses || [] });
const getSessionId = (req) => req.headers['x-session-id'] || 'guest';

// ============================================
// AUTH ROUTES
// ============================================
app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;
    if (!name || !email || !password) return res.status(400).json({ success: false, message: 'name, email, password required' });
    if (db.users.some((u) => u.email === email.toLowerCase())) return res.status(400).json({ success: false, message: 'Email already in use' });
    const user = { _id: oid(), name, email: email.toLowerCase(), password: await bcrypt.hash(password, 12), phone: phone || '', role: 'customer', addresses: [], createdAt: new Date().toISOString() };
    db.users.push(user);
    res.status(201).json({ success: true, data: { user: publicUser(user), token: signToken(user._id) } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = db.users.find((u) => u.email === (email || '').toLowerCase());
    if (!user || !(await bcrypt.compare(password, user.password))) return res.status(401).json({ success: false, message: 'Invalid email or password' });
    res.json({ success: true, data: { user: publicUser(user), token: signToken(user._id) } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.get('/api/auth/me', auth, (req, res) => {
  res.json({ success: true, data: publicUser(req.user) });
});

// ============================================
// PRODUCT ROUTES
// ============================================
app.get('/api/products', (req, res) => {
  try {
    const { category, size, color, minPrice, maxPrice, sort, search, page = 1, limit = 12 } = req.query;
    let products = db.products.filter((p) => p.active);

    if (category) products = products.filter((p) => {
      const cat = db.categories.find((c) => c.slug === category);
      return cat && p.category === cat._id;
    });
    if (size) products = products.filter((p) => p.variants.some((v) => v.size === size));
    if (color) products = products.filter((p) => p.variants.some((v) => v.color === color));
    if (minPrice) products = products.filter((p) => p.variants.some((v) => (v.salePrice || v.price) >= Number(minPrice)));
    if (maxPrice) products = products.filter((p) => p.variants.some((v) => (v.salePrice || v.price) <= Number(maxPrice)));
    if (search) products = products.filter((p) => p.name.toLowerCase().includes(search.toLowerCase()));

    if (sort === 'price_asc') products.sort((a, b) => (a.variants[0]?.price || 0) - (b.variants[0]?.price || 0));
    else if (sort === 'price_desc') products.sort((a, b) => (b.variants[0]?.price || 0) - (a.variants[0]?.price || 0));
    else if (sort === 'name') products.sort((a, b) => a.name.localeCompare(b.name));
    else products.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    const total = products.length;
    const start = (Number(page) - 1) * Number(limit);
    products = products.slice(start, start + Number(limit));

    // Populate category
    const populated = products.map((p) => {
      const cat = db.categories.find((c) => c._id === p.category);
      return { ...p, category: cat || null };
    });

    res.json({ success: true, data: { products: populated, total, page: Number(page), pages: Math.ceil(total / Number(limit)) } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.get('/api/products/categories', (req, res) => {
  res.json({ success: true, data: db.categories.sort((a, b) => a.order - b.order) });
});

app.get('/api/products/:slug', (req, res) => {
  const product = db.products.find((p) => p.slug === req.params.slug && p.active);
  if (!product) return res.status(404).json({ success: false, message: 'Product not found' });

  const reviews = db.reviews.filter((r) => r.productId === product._id);
  const avgRating = reviews.length ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1) : 0;
  const cat = db.categories.find((c) => c._id === product.category);
  const related = db.products.filter((p) => p.category === product.category && p._id !== product._id && p.active).slice(0, 4).map((p) => {
    const rc = db.categories.find((c) => c._id === p.category);
    return { ...p, category: rc || null };
  });

  res.json({ success: true, data: { ...product, category: cat || null, avgRating: Number(avgRating), reviewCount: reviews.length, reviews, related } });
});

app.post('/api/products/:id/reviews', (req, res) => {
  const { name, rating, title, comment } = req.body;
  if (!name || !comment) return res.status(400).json({ success: false, message: 'Name and comment are required' });
  const product = db.products.find((p) => p._id === req.params.id);
  if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
  const review = { _id: oid(), productId: product._id, name, rating: Number(rating) || 5, title: title || '', comment, createdAt: new Date().toISOString() };
  db.reviews.push(review);
  res.json({ success: true, data: review });
});

// ============================================
// CART ROUTES
// ============================================
app.get('/api/cart', optionalAuth, (req, res) => {
  const key = req.user ? { userId: req.user._id } : { sessionId: getSessionId(req) };
  const cart = db.carts.find((c) => (key.userId && c.userId === key.userId) || (!key.userId && c.sessionId === key.sessionId));
  if (!cart) return res.json({ success: true, data: { items: [] } });
  // Populate products
  const populated = cart.items.map((item) => {
    const product = db.products.find((p) => p._id === item.productId);
    return { ...item, product: product || null };
  });
  res.json({ success: true, data: { ...cart, items: populated } });
});

app.post('/api/cart/add', optionalAuth, (req, res) => {
  const { productId, variantIndex, quantity = 1 } = req.body;
  const product = db.products.find((p) => p._id === productId);
  if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
  const variant = product.variants[variantIndex];
  if (!variant) return res.status(400).json({ success: false, message: 'Invalid variant' });
  if (variant.stock < quantity) return res.status(400).json({ success: false, message: 'Insufficient stock' });

  const key = req.user ? { userId: req.user._id } : { sessionId: getSessionId(req) };
  let cart = db.carts.find((c) => (key.userId && c.userId === key.userId) || (!key.userId && c.sessionId === key.sessionId));
  if (!cart) {
    cart = { _id: oid(), ...key, items: [], createdAt: new Date().toISOString() };
    db.carts.push(cart);
  }

  const existing = cart.items.find((i) => i.productId === productId && i.variantIndex === variantIndex);
  if (existing) {
    existing.quantity += quantity;
  } else {
    cart.items.push({ _id: oid(), productId, variantIndex, size: variant.size, color: variant.color, quantity, price: variant.salePrice || variant.price });
  }

  // Populate
  const populated = cart.items.map((item) => {
    const p = db.products.find((pp) => pp._id === item.productId);
    return { ...item, product: p || null };
  });
  res.json({ success: true, data: { ...cart, items: populated } });
});

app.put('/api/cart/update', optionalAuth, (req, res) => {
  const { itemId, quantity } = req.body;
  const key = req.user ? { userId: req.user._id } : { sessionId: getSessionId(req) };
  const cart = db.carts.find((c) => (key.userId && c.userId === key.userId) || (!key.userId && c.sessionId === key.sessionId));
  if (!cart) return res.status(404).json({ success: false, message: 'Cart not found' });

  if (quantity < 1) {
    cart.items = cart.items.filter((i) => i._id !== itemId);
  } else {
    const item = cart.items.find((i) => i._id === itemId);
    if (!item) return res.status(404).json({ success: false, message: 'Item not found' });
    item.quantity = quantity;
  }

  const populated = cart.items.map((item) => {
    const p = db.products.find((pp) => pp._id === item.productId);
    return { ...item, product: p || null };
  });
  res.json({ success: true, data: { ...cart, items: populated } });
});

app.delete('/api/cart/remove/:itemId', optionalAuth, (req, res) => {
  const key = req.user ? { userId: req.user._id } : { sessionId: getSessionId(req) };
  const cart = db.carts.find((c) => (key.userId && c.userId === key.userId) || (!key.userId && c.sessionId === key.sessionId));
  if (!cart) return res.status(404).json({ success: false, message: 'Cart not found' });
  cart.items = cart.items.filter((i) => i._id !== req.params.itemId);
  const populated = cart.items.map((item) => {
    const p = db.products.find((pp) => pp._id === item.productId);
    return { ...item, product: p || null };
  });
  res.json({ success: true, data: { ...cart, items: populated } });
});

// ============================================
// ORDER ROUTES
// ============================================
app.post('/api/orders', optionalAuth, (req, res) => {
  try {
    const { shippingAddress } = req.body;
    const key = req.user ? { userId: req.user._id } : { sessionId: getSessionId(req) };
    const cart = db.carts.find((c) => (key.userId && c.userId === key.userId) || (!key.userId && c.sessionId === key.sessionId));
    if (!cart || cart.items.length === 0) return res.status(400).json({ success: false, message: 'Cart is empty' });

    const items = cart.items.map((ci) => {
      const product = db.products.find((p) => p._id === ci.productId);
      return { product: ci.productId, name: product?.name || 'Unknown', size: ci.size, color: ci.color, quantity: ci.quantity, price: ci.price };
    });

    const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
    const shipping = subtotal >= 5000 ? 0 : 350;
    const total = subtotal + shipping;

    const order = {
      _id: oid(),
      user: req.user?._id || null,
      sessionId: req.user ? null : getSessionId(req),
      items, shippingAddress: shippingAddress || {},
      subtotal, shipping, total,
      payment: { method: 'mpesa', mpesaReceipt: '', checkoutRequestId: '', merchantRequestId: '', status: 'pending' },
      status: 'pending', createdAt: new Date().toISOString(),
    };
    db.orders.push(order);

    for (const ci of cart.items) {
      const product = db.products.find((p) => p._id === ci.productId);
      if (product && product.variants[ci.variantIndex]) product.variants[ci.variantIndex].stock -= ci.quantity;
    }
    cart.items = [];
    res.status(201).json({ success: true, data: order });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.get('/api/orders', optionalAuth, (req, res) => {
  let orders;
  if (req.user) orders = db.orders.filter((o) => o.user === req.user._id);
  else orders = db.orders.filter((o) => o.sessionId === getSessionId(req));
  orders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  res.json({ success: true, data: orders });
});

app.get('/api/orders/:id', optionalAuth, (req, res) => {
  const order = db.orders.find((o) => {
    if (o._id !== req.params.id) return false;
    return req.user ? o.user === req.user._id : o.sessionId === getSessionId(req);
  });
  if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
  res.json({ success: true, data: order });
});

// ============================================
// PAYMENT ROUTES (M-Pesa mock)
// ============================================
app.post('/api/payments/mpesa/init', optionalAuth, (req, res) => {
  const { phone, orderId, amount } = req.body;
  const order = db.orders.find((o) => o._id === orderId);
  if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
  if (order.payment.status === 'completed') return res.status(400).json({ success: false, message: 'Order already paid' });

  const checkoutRequestId = `ws_CO_${Date.now()}`;
  const merchantRequestId = `mr_${Date.now()}`;
  order.payment.checkoutRequestId = checkoutRequestId;
  order.payment.merchantRequestId = merchantRequestId;

  res.json({ success: true, data: { checkoutRequestId, merchantRequestId, message: '[MOCK] STK Push sent. Check your phone.' } });
});

app.get('/api/payments/mpesa/status/:checkoutRequestId', (req, res) => {
  const order = db.orders.find((o) => o.payment.checkoutRequestId === req.params.checkoutRequestId);
  if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
  res.json({ success: true, data: { status: order.payment.status, receipt: order.payment.mpesaReceipt } });
});

app.post('/api/payments/mpesa/callback', (req, res) => {
  res.json({ ResultCode: 0, ResultDesc: 'Accepted' });
  try {
    const cb = req.body?.Body?.stkCallback;
    if (!cb) return;
    const { ResultCode, CheckoutRequestID, CallbackMetadata } = cb;
    const order = db.orders.find((o) => o.payment.checkoutRequestId === CheckoutRequestID);
    if (!order || order.payment.status === 'completed') return;
    if (ResultCode === 0 && CallbackMetadata) {
      const items = CallbackMetadata.Item || [];
      const receipt = items.find((i) => i.Name === 'MpesaReceiptNumber')?.Value;
      order.payment.mpesaReceipt = receipt || `MOCK_${Date.now()}`;
      order.payment.status = 'completed';
      order.status = 'paid';
    } else {
      order.payment.status = 'failed';
    }
  } catch (err) {
    console.error('Mock callback error:', err.message);
  }
});

// ============================================
// ADMIN ROUTES
// ============================================
app.get('/api/admin/stats', auth, adminOnly, (req, res) => {
  const revenue = db.orders.filter((o) => o.status === 'paid').reduce((sum, o) => sum + o.total, 0);
  res.json({ success: true, data: { totalProducts: db.products.length, totalOrders: db.orders.length, totalUsers: db.users.length, totalBlogs: db.blogs.length, revenue } });
});

// Admin Products
app.get('/api/admin/products', auth, adminOnly, (req, res) => {
  const products = db.products.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).map((p) => {
    const cat = db.categories.find((c) => c._id === p.category);
    return { ...p, category: cat || null };
  });
  res.json({ success: true, data: products });
});

app.post('/api/admin/products', auth, adminOnly, (req, res) => {
  const { name, description, category, variants, tags, featured } = req.body;
  if (!name) return res.status(400).json({ success: false, message: 'name required' });
  const product = {
    _id: oid(), name, slug: slugify(name, { lower: true, strict: true }), description: description || '',
    category: category || '', variants: variants || [], tags: tags || [], featured: !!featured, active: true,
    createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
  };
  db.products.push(product);
  res.status(201).json({ success: true, data: product });
});

app.put('/api/admin/products/:id', auth, adminOnly, (req, res) => {
  const product = db.products.find((p) => p._id === req.params.id);
  if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
  Object.assign(product, req.body, { updatedAt: new Date().toISOString() });
  res.json({ success: true, data: product });
});

app.delete('/api/admin/products/:id', auth, adminOnly, (req, res) => {
  const idx = db.products.findIndex((p) => p._id === req.params.id);
  if (idx > -1) db.products.splice(idx, 1);
  res.json({ success: true, data: {} });
});

// Admin Orders
app.get('/api/admin/orders', auth, adminOnly, (req, res) => {
  const orders = db.orders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).map((o) => {
    const user = o.user ? db.users.find((u) => u._id === o.user) : null;
    return { ...o, user: user ? { _id: user._id, name: user.name, email: user.email } : null };
  });
  res.json({ success: true, data: orders });
});

app.put('/api/admin/orders/:id/status', auth, adminOnly, (req, res) => {
  const order = db.orders.find((o) => o._id === req.params.id);
  if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
  order.status = req.body.status;
  res.json({ success: true, data: order });
});

// Admin Categories
app.post('/api/admin/categories', auth, adminOnly, (req, res) => {
  const { name, description, image, order } = req.body;
  if (!name) return res.status(400).json({ success: false, message: 'name required' });
  const cat = { _id: oid(), name, slug: slugify(name, { lower: true, strict: true }), description: description || '', image: image || '', order: order || 0, createdAt: new Date().toISOString() };
  db.categories.push(cat);
  res.status(201).json({ success: true, data: cat });
});

app.put('/api/admin/categories/:id', auth, adminOnly, (req, res) => {
  const cat = db.categories.find((c) => c._id === req.params.id);
  if (!cat) return res.status(404).json({ success: false, message: 'Category not found' });
  Object.assign(cat, req.body);
  res.json({ success: true, data: cat });
});

app.delete('/api/admin/categories/:id', auth, adminOnly, (req, res) => {
  const idx = db.categories.findIndex((c) => c._id === req.params.id);
  if (idx > -1) db.categories.splice(idx, 1);
  res.json({ success: true, data: {} });
});

// Admin Blog
app.get('/api/admin/blog', auth, adminOnly, (req, res) => {
  res.json({ success: true, data: db.blogs.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)) });
});

app.post('/api/admin/blog', auth, adminOnly, (req, res) => {
  const post = { _id: oid(), ...req.body, slug: slugify(req.body.title || 'untitled', { lower: true, strict: true }), createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
  db.blogs.push(post);
  res.status(201).json({ success: true, data: post });
});

app.put('/api/admin/blog/:id', auth, adminOnly, (req, res) => {
  const post = db.blogs.find((b) => b._id === req.params.id);
  if (!post) return res.status(404).json({ success: false, message: 'Post not found' });
  Object.assign(post, req.body, { updatedAt: new Date().toISOString() });
  res.json({ success: true, data: post });
});

app.delete('/api/admin/blog/:id', auth, adminOnly, (req, res) => {
  const idx = db.blogs.findIndex((b) => b._id === req.params.id);
  if (idx > -1) db.blogs.splice(idx, 1);
  res.json({ success: true, data: {} });
});

// ============================================
// BLOG ROUTES (public)
// ============================================
app.get('/api/blog', (req, res) => {
  const { page = 1, limit = 9, tag } = req.query;
  let posts = db.blogs.filter((p) => p.published !== false);
  if (tag) posts = posts.filter((p) => p.tags?.includes(tag));
  posts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  const total = posts.length;
  const start = (Number(page) - 1) * Number(limit);
  const paged = posts.slice(start, start + Number(limit)).map(({ content, ...rest }) => rest);
  res.json({ success: true, data: { posts: paged, total, page: Number(page), pages: Math.ceil(total / Number(limit)) } });
});

app.get('/api/blog/tags', (req, res) => {
  const tags = [...new Set(db.blogs.filter((p) => p.published !== false).flatMap((p) => p.tags || []))];
  res.json({ success: true, data: tags });
});

app.get('/api/blog/:slug', (req, res) => {
  const post = db.blogs.find((b) => b.slug === req.params.slug && b.published !== false);
  if (!post) return res.status(404).json({ success: false, message: 'Post not found' });
  res.json({ success: true, data: post });
});

// ============================================
// NEWSLETTER & CONTACT
// ============================================
app.post('/api/newsletter/subscribe', (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ success: false, message: 'Email is required' });
  console.log('[MOCK] Newsletter subscribe:', email);
  res.json({ success: true, message: 'Subscribed successfully' });
});

app.post('/api/contact', (req, res) => {
  const { name, email, phone, message } = req.body;
  if (!name || !email || !message) return res.status(400).json({ success: false, message: 'Name, email, and message are required' });
  console.log('[MOCK] Contact form:', { name, email, phone, message });
  res.json({ success: true, message: 'Message received' });
});

// ============================================
// UPLOADS (mock)
// ============================================
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => cb(null, `${Date.now()}-${Math.round(Math.random() * 1e9)}${path.extname(file.originalname)}`),
});
const upload = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 } });

app.post('/api/uploads', auth, adminOnly, upload.array('images', 10), (req, res) => {
  const urls = req.files.map((f) => `/uploads/${f.filename}`);
  res.json({ success: true, data: urls });
});

// ============================================
// SEO ROUTES
// ============================================
app.get('/sitemap.xml', (req, res) => {
  let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url><loc>${BASE_URL}</loc><changefreq>daily</changefreq><priority>1.0</priority></url>
  <url><loc>${BASE_URL}/shop</loc><changefreq>daily</changefreq><priority>0.9</priority></url>`;
  for (const p of db.products.filter((p) => p.active)) {
    xml += `\n  <url><loc>${BASE_URL}/product/${p.slug}</loc><changefreq>weekly</changefreq><priority>0.8</priority></url>`;
  }
  xml += '\n</urlset>';
  res.header('Content-Type', 'application/xml').send(xml);
});

app.get('/robots.txt', (req, res) => {
  res.header('Content-Type', 'text/plain').send(`User-agent: *\nAllow: /\nDisallow: /admin\n\nSitemap: ${BASE_URL}/sitemap.xml`);
});

// ============================================
// HEALTH
// ============================================
app.get('/api/health', (_, res) => res.json({ ok: true }));

// ============================================
// START
// ============================================
const start = async () => {
  await seedData();
  app.listen(PORT, () => {
    console.log(`\n  [MOCK] Sparkpretty Closet backend running on http://localhost:${PORT}`);
    console.log(`  [MOCK] Admin login: admin@sparkpretty.co.ke / admin123`);
    console.log(`  [MOCK] No database required\n`);
  });
};

start();

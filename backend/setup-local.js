import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';
import Category from './models/Category.js';
import Product from './models/Product.js';

dotenv.config();

const BASE = process.env.API_URL || 'http://localhost:5000/api';

const config = {
  name: process.env.SETUP_NAME || 'Joe',
  email: process.env.SETUP_EMAIL || 'joe@test.com',
  password: process.env.SETUP_PASSWORD || 'secret123',
  phone: process.env.SETUP_PHONE || '0729366991',
  adminCategory: process.env.SETUP_CATEGORY || 'Dresses',
  product: {
    name: 'Floral Midi Dress',
    description: 'A beautiful summer dress',
    categorySlug: 'dresses',
    variant: {
      size: 'M',
      color: 'Pink',
      colorHex: '#F8BBD0',
      price: 1500,
      salePrice: 1200,
      stock: 10,
      images: ['https://placehold.co/600x800/C2185B/FFFFFF?text=FloralMidiDress'],
    },
    tags: ['dress', 'summer'],
    featured: true,
  },
};

async function api(method, path, body, token) {
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers.Authorization = `Bearer ${token}`;
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(`${method} ${path} -> ${res.status}: ${json.message || JSON.stringify(json)}`);
  return json.data;
}

const step = (msg) => console.log(`\n==> ${msg}`);

async function setup() {
  step('Connecting to MongoDB');
  await mongoose.connect(process.env.MONGODB_URI, { serverSelectionTimeoutMS: 10000 });
  console.log('Connected. Host:', mongoose.connection.host);

  const { email, password } = config;

  step('Ensure user exists (register or reuse)');
  let user = await User.findOne({ email });
  if (!user) {
    user = await User.create({ name: config.name, email, password, phone: config.phone });
    console.log('Registered user:', user.email, 'id:', user._id);
  } else {
    console.log('User already exists, reusing:', user.email);
  }

  step('Promote user to admin if needed');
  if (user.role !== 'admin') {
    user.role = 'admin';
    await user.save();
    console.log('Role set to admin:', user.email);
  } else {
    console.log('Already admin.');
  }

  step('Login to obtain JWT');
  let token;
  try {
    const data = await api('POST', '/auth/login', { email, password });
    token = data.token;
    console.log('Logged in. Role:', data.user.role);
  } catch (err) {
    console.error('Login failed:', err.message);
    process.exit(1);
  }

  step('Ensure category exists');
  let category = await Category.findOne({ slug: config.product.categorySlug });
  if (!category) {
    category = await Category.create({ name: config.adminCategory, slug: config.product.categorySlug });
    console.log('Created category:', category.name, category._id);
  } else {
    console.log('Category exists:', category.name, category._id);
  }

  step('Create product (if not exists)');
  const byName = await Product.findOne({ name: config.product.name });
  if (byName) {
    console.log('Product already exists, skipping:', byName.name);
    return;
  }

  const productBody = {
    name: config.product.name,
    description: config.product.description,
    category: category._id,
    variants: [config.product.variant],
    tags: config.product.tags,
    featured: config.product.featured,
  };
  const product = await api('POST', '/admin/products', productBody, token);
  console.log('Created product:', product.name, 'id:', product._id);

  step('Verify via public endpoint');
  const fetched = await api('GET', `/products/${product.slug}`);
  console.log('Persisted & retrievable:', fetched.name);

  console.log('\nDone. Backend is running and data is stored locally in MongoDB.');
  process.exit(0);
}

setup().catch((err) => {
  console.error('\nSetup failed:', err.message);
  process.exit(1);
});

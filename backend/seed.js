import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Category from './models/Category.js';
import Product from './models/Product.js';
import User from './models/User.js';
import Blog from './models/Blog.js';

dotenv.config();

const categories = [
  { name: 'Dresses', slug: 'dresses', description: 'Beautiful dresses for every occasion', order: 1 },
  { name: 'Tops', slug: 'tops', description: 'Stylish tops and blouses', order: 2 },
  { name: 'Bottoms', slug: 'bottoms', description: 'Jeans, skirts, and trousers', order: 3 },
  { name: 'Shoes', slug: 'shoes', description: 'Complete your look', order: 4 },
  { name: 'Accessories', slug: 'accessories', description: 'The finishing touches', order: 5 },
];

const products = [
  {
    name: 'Rose Garden Midi Dress',
    description: 'A stunning midi dress in soft rose pink, perfect for brunch dates and evening events. Features a flattering A-line silhouette.',
    categorySlug: 'dresses',
    featured: true,
    image: '/images/dresses-2.jpeg',
    variants: [
      { size: 'S', color: 'Rose Pink', colorHex: '#F8BBD0', price: 3500, salePrice: 2800, sku: 'SGMD-S-RP', stock: 15, images: ['/images/dresses-2.jpeg'] },
      { size: 'M', color: 'Rose Pink', colorHex: '#F8BBD0', price: 3500, salePrice: 2800, sku: 'SGMD-M-RP', stock: 20, images: ['/images/dresses-2.jpeg'] },
      { size: 'L', color: 'Rose Pink', colorHex: '#F8BBD0', price: 3500, salePrice: 2800, sku: 'SGMD-L-RP', stock: 10, images: ['/images/dresses-2.jpeg'] },
      { size: 'S', color: 'Black', colorHex: '#000000', price: 3500, sku: 'SGMD-S-BK', stock: 12, images: ['/images/dresses-1.jpeg'] },
      { size: 'M', color: 'Black', colorHex: '#000000', price: 3500, sku: 'SGMD-M-BK', stock: 18, images: ['/images/dresses-1.jpeg'] },
      { size: 'L', color: 'Black', colorHex: '#000000', price: 3500, sku: 'SGMD-L-BK', stock: 8, images: ['/images/dresses-1.jpeg'] },
    ],
    tags: ['new', 'bestseller'],
  },
  {
    name: 'Sunset Maxi Dress',
    description: 'Flowing maxi dress with vibrant sunset gradient. Perfect for beach days and summer events.',
    categorySlug: 'dresses',
    image: '/images/dresses-3.jpeg',
    variants: [
      { size: 'S', color: 'Sunset', colorHex: '#FF7043', price: 4200, sku: 'SMD-S-SN', stock: 8, images: ['/images/dresses-3.jpeg'] },
      { size: 'M', color: 'Sunset', colorHex: '#FF7043', price: 4200, sku: 'SMD-M-SN', stock: 12, images: ['/images/dresses-3.jpeg'] },
      { size: 'L', color: 'Sunset', colorHex: '#FF7043', price: 4200, sku: 'SMD-L-SN', stock: 6, images: ['/images/dresses-3.jpeg'] },
    ],
    tags: ['new'],
  },
  {
    name: 'Elegant Wrap Dress',
    description: 'Classic wrap dress that flatters every body type. Versatile from office to evening.',
    categorySlug: 'dresses',
    featured: true,
    image: '/images/hero-4.jpeg',
    variants: [
      { size: 'S', color: 'Navy', colorHex: '#1A237E', price: 3200, sku: 'EWD-S-NV', stock: 10, images: ['/images/hero-4.jpeg'] },
      { size: 'M', color: 'Navy', colorHex: '#1A237E', price: 3200, sku: 'EWD-M-NV', stock: 15, images: ['/images/hero-4.jpeg'] },
      { size: 'L', color: 'Navy', colorHex: '#1A237E', price: 3200, sku: 'EWD-L-NV', stock: 7, images: ['/images/hero-4.jpeg'] },
      { size: 'S', color: 'Burgundy', colorHex: '#880E4F', price: 3200, sku: 'EWD-S-BG', stock: 9, images: ['/images/hero-2.jpeg'] },
      { size: 'M', color: 'Burgundy', colorHex: '#880E4F', price: 3200, sku: 'EWD-M-BG', stock: 14, images: ['/images/hero-2.jpeg'] },
    ],
    tags: ['bestseller'],
  },
  {
    name: 'Silk Touch Blouse',
    description: 'Luxurious silk-feel blouse with delicate buttons. A wardrobe essential.',
    categorySlug: 'tops',
    image: '/images/tops-1.jpeg',
    variants: [
      { size: 'XS', color: 'White', colorHex: '#FFFFFF', price: 1800, sku: 'STB-XS-WH', stock: 20, images: ['/images/tops-1.jpeg'] },
      { size: 'S', color: 'White', colorHex: '#FFFFFF', price: 1800, sku: 'STB-S-WH', stock: 25, images: ['/images/tops-1.jpeg'] },
      { size: 'M', color: 'White', colorHex: '#FFFFFF', price: 1800, sku: 'STB-M-WH', stock: 18, images: ['/images/tops-1.jpeg'] },
      { size: 'S', color: 'Blush', colorHex: '#F8BBD0', price: 1800, sku: 'STB-S-BL', stock: 12, images: ['/images/tops-1.jpeg'] },
      { size: 'M', color: 'Blush', colorHex: '#F8BBD0', price: 1800, sku: 'STB-M-BL', stock: 16, images: ['/images/tops-1.jpeg'] },
    ],
    tags: ['bestseller'],
  },
  {
    name: 'Crop Top Ribbed',
    description: 'Trendy ribbed crop top. Perfect for casual outings and layering.',
    categorySlug: 'tops',
    image: '/images/tops-1.jpeg',
    variants: [
      { size: 'XS', color: 'Black', colorHex: '#000000', price: 1200, sku: 'CTR-XS-BK', stock: 22, images: ['/images/tops-1.jpeg'] },
      { size: 'S', color: 'Black', colorHex: '#000000', price: 1200, sku: 'CTR-S-BK', stock: 30, images: ['/images/tops-1.jpeg'] },
      { size: 'M', color: 'Black', colorHex: '#000000', price: 1200, sku: 'CTR-M-BK', stock: 25, images: ['/images/tops-1.jpeg'] },
      { size: 'S', color: 'Cream', colorHex: '#FFF8E1', price: 1200, sku: 'CTR-S-CR', stock: 18, images: ['/images/tops-1.jpeg'] },
    ],
    tags: ['trending'],
  },
  {
    name: 'Oversized Knit Sweater',
    description: 'Cozy oversized sweater for those cool Nairobi evenings. Soft knit fabric.',
    categorySlug: 'tops',
    image: '/images/hero-3.jpeg',
    variants: [
      { size: 'S', color: 'Camel', colorHex: '#D4A574', price: 2800, sku: 'OKS-S-CM', stock: 14, images: ['/images/hero-3.jpeg'] },
      { size: 'M', color: 'Camel', colorHex: '#D4A574', price: 2800, sku: 'OKS-M-CM', stock: 18, images: ['/images/hero-3.jpeg'] },
      { size: 'L', color: 'Camel', colorHex: '#D4A574', price: 2800, sku: 'OKS-L-CM', stock: 10, images: ['/images/hero-3.jpeg'] },
      { size: 'M', color: 'Oatmeal', colorHex: '#F5F5DC', price: 2800, sku: 'OKS-M-OM', stock: 12, images: ['/images/hero-3.jpeg'] },
    ],
    tags: [],
  },
  {
    name: 'High-Waist Skinny Jeans',
    description: 'Classic high-waist skinny jeans with stretch for comfort. A closet must-have.',
    categorySlug: 'bottoms',
    featured: true,
    image: '/images/bottoms-1.jpeg',
    variants: [
      { size: 'S', color: 'Dark Blue', colorHex: '#1565C0', price: 2400, sku: 'HWSJ-S-DB', stock: 20, images: ['/images/bottoms-1.jpeg'] },
      { size: 'M', color: 'Dark Blue', colorHex: '#1565C0', price: 2400, sku: 'HWSJ-M-DB', stock: 25, images: ['/images/bottoms-1.jpeg'] },
      { size: 'L', color: 'Dark Blue', colorHex: '#1565C0', price: 2400, sku: 'HWSJ-L-DB', stock: 15, images: ['/images/bottoms-1.jpeg'] },
      { size: 'S', color: 'Black', colorHex: '#000000', price: 2400, sku: 'HWSJ-S-BK', stock: 18, images: ['/images/bottoms-2.jpeg'] },
      { size: 'M', color: 'Black', colorHex: '#000000', price: 2400, sku: 'HWSJ-M-BK', stock: 22, images: ['/images/bottoms-2.jpeg'] },
      { size: 'L', color: 'Black', colorHex: '#000000', price: 2400, sku: 'HWSJ-L-BK', stock: 12, images: ['/images/bottoms-2.jpeg'] },
    ],
    tags: ['bestseller'],
  },
  {
    name: 'Pleated Mini Skirt',
    description: 'Flirty pleated mini skirt. Perfect with a blouse or crop top.',
    categorySlug: 'bottoms',
    image: '/images/bottoms-2.jpeg',
    variants: [
      { size: 'XS', color: 'Plaid', colorHex: '#795548', price: 1800, sku: 'PMS-XS-PL', stock: 14, images: ['/images/bottoms-2.jpeg'] },
      { size: 'S', color: 'Plaid', colorHex: '#795548', price: 1800, sku: 'PMS-S-PL', stock: 18, images: ['/images/bottoms-2.jpeg'] },
      { size: 'M', color: 'Plaid', colorHex: '#795548', price: 1800, sku: 'PMS-M-PL', stock: 12, images: ['/images/bottoms-2.jpeg'] },
      { size: 'S', color: 'Black', colorHex: '#000000', price: 1800, sku: 'PMS-S-BK', stock: 16, images: ['/images/bottoms-2.jpeg'] },
    ],
    tags: ['trending'],
  },
  {
    name: 'Wide Leg Trousers',
    description: 'Elegant wide leg trousers for a sophisticated look. Comfortable and chic.',
    categorySlug: 'bottoms',
    image: '/images/bottoms-1.jpeg',
    variants: [
      { size: 'S', color: 'Beige', colorHex: '#F5F5DC', price: 2600, sku: 'WLT-S-BG', stock: 10, images: ['/images/bottoms-1.jpeg'] },
      { size: 'M', color: 'Beige', colorHex: '#F5F5DC', price: 2600, sku: 'WLT-M-BG', stock: 14, images: ['/images/bottoms-1.jpeg'] },
      { size: 'L', color: 'Beige', colorHex: '#F5F5DC', price: 2600, sku: 'WLT-L-BG', stock: 8, images: ['/images/bottoms-1.jpeg'] },
      { size: 'M', color: 'Black', colorHex: '#000000', price: 2600, sku: 'WLT-M-BK', stock: 20, images: ['/images/bottoms-2.jpeg'] },
    ],
    tags: [],
  },
  {
    name: 'Strappy Heel Sandals',
    description: 'Elegant strappy heels to complete any outfit. Comfortable 3-inch heel.',
    categorySlug: 'shoes',
    image: '/images/shoes-2.jpeg',
    variants: [
      { size: '36', color: 'Nude', colorHex: '#FFCCBC', price: 2800, sku: 'SHS-36-ND', stock: 8, images: ['/images/shoes-2.jpeg'] },
      { size: '37', color: 'Nude', colorHex: '#FFCCBC', price: 2800, sku: 'SHS-37-ND', stock: 12, images: ['/images/shoes-2.jpeg'] },
      { size: '38', color: 'Nude', colorHex: '#FFCCBC', price: 2800, sku: 'SHS-38-ND', stock: 10, images: ['/images/shoes-2.jpeg'] },
      { size: '39', color: 'Nude', colorHex: '#FFCCBC', price: 2800, sku: 'SHS-39-ND', stock: 6, images: ['/images/shoes-3.jpeg'] },
      { size: '37', color: 'Black', colorHex: '#000000', price: 2800, sku: 'SHS-37-BK', stock: 14, images: ['/images/shoes-4.jpeg'] },
      { size: '38', color: 'Black', colorHex: '#000000', price: 2800, sku: 'SHS-38-BK', stock: 10, images: ['/images/shoes-4.jpeg'] },
    ],
    tags: ['bestseller'],
  },
  {
    name: 'Canvas Sneakers',
    description: 'Comfortable everyday canvas sneakers. Available in multiple colors.',
    categorySlug: 'shoes',
    image: '/images/shoes-1.jpeg',
    variants: [
      { size: '36', color: 'White', colorHex: '#FFFFFF', price: 1800, sku: 'CS-36-WH', stock: 15, images: ['/images/shoes-1.jpeg'] },
      { size: '37', color: 'White', colorHex: '#FFFFFF', price: 1800, sku: 'CS-37-WH', stock: 20, images: ['/images/shoes-1.jpeg'] },
      { size: '38', color: 'White', colorHex: '#FFFFFF', price: 1800, sku: 'CS-38-WH', stock: 18, images: ['/images/shoes-1.jpeg'] },
      { size: '39', color: 'White', colorHex: '#FFFFFF', price: 1800, sku: 'CS-39-WH', stock: 12, images: ['/images/shoes-7.jpeg'] },
      { size: '37', color: 'Pink', colorHex: '#F8BBD0', price: 1800, sku: 'CS-37-PK', stock: 10, images: ['/images/shoes-7.jpeg'] },
    ],
    tags: [],
  },
  {
    name: 'Quilted Crossbody Bag',
    description: 'Chic quilted crossbody bag with gold chain strap. Fits phone, wallet, and essentials.',
    categorySlug: 'accessories',
    featured: true,
    image: '/images/bags-1.jpeg',
    variants: [
      { size: 'One Size', color: 'Black', colorHex: '#000000', price: 2200, sku: 'QCB-OS-BK', stock: 20, images: ['/images/bags-1.jpeg'] },
      { size: 'One Size', color: 'Rose Gold', colorHex: '#E8B4B8', price: 2200, sku: 'QCB-OS-RG', stock: 15, images: ['/images/bags-2.jpeg'] },
      { size: 'One Size', color: 'Cream', colorHex: '#FFF8E1', price: 2200, sku: 'QCB-OS-CR', stock: 12, images: ['/images/bags-3.jpeg'] },
    ],
    tags: ['new', 'bestseller'],
  },
  {
    name: 'Layered Chain Necklace',
    description: 'Delicate layered chain necklace in gold. Adds elegance to any outfit.',
    categorySlug: 'accessories',
    image: '/images/accessories-1.jpeg',
    variants: [
      { size: 'One Size', color: 'Gold', colorHex: '#FFD700', price: 850, sku: 'LCN-OS-GD', stock: 30, images: ['/images/accessories-1.jpeg'] },
      { size: 'One Size', color: 'Silver', colorHex: '#C0C0C0', price: 850, sku: 'LCN-OS-SV', stock: 25, images: ['/images/accessories-2.jpeg'] },
    ],
    tags: ['trending'],
  },
  {
    name: 'Silk Scarf',
    description: 'Luxurious silk scarf with hand-painted print. Wear it as a headband, belt, or neck scarf.',
    categorySlug: 'accessories',
    image: '/images/bags-5.jpeg',
    variants: [
      { size: 'One Size', color: 'Floral', colorHex: '#C2185B', price: 1200, sku: 'SS-OS-FL', stock: 18, images: ['/images/bags-5.jpeg'] },
      { size: 'One Size', color: 'Abstract', colorHex: '#7B1FA2', price: 1200, sku: 'SS-OS-AB', stock: 14, images: ['/images/bags-5.jpeg'] },
    ],
    tags: [],
  },
  {
    name: 'Mini Body Bag',
    description: 'Compact body bag for hands-free convenience. Trendy and practical.',
    categorySlug: 'accessories',
    image: '/images/bags-4.jpeg',
    variants: [
      { size: 'One Size', color: 'Black', colorHex: '#000000', price: 1500, sku: 'MBB-OS-BK', stock: 22, images: ['/images/bags-4.jpeg'] },
      { size: 'One Size', color: 'Khaki', colorHex: '#8D6E63', price: 1500, sku: 'MBB-OS-KH', stock: 16, images: ['/images/bags-3.jpeg'] },
    ],
    tags: ['new'],
  },
];

const adminUser = { name: 'Admin', email: 'admin@sparkpretty.co.ke', password: 'admin123', role: 'admin' };

const blogPosts = [
  {
    title: '10 Wardrobe Essentials Every Kenyan Woman Needs',
    excerpt: 'Building a versatile wardrobe starts with the right basics. Here are 10 pieces that will take you from office to weekend effortlessly.',
    content: `<h2>The Foundation of a Great Wardrobe</h2>
<p>Every woman deserves a closet filled with pieces that work hard and look amazing. Whether you're heading to the office in Nairobi or enjoying a weekend in Mombasa, these 10 essentials will keep you looking polished.</p>
<h3>1. The Perfect White Blouse</h3>
<p>A crisp white blouse is the ultimate chameleon piece. Tuck it into high-waist trousers for the office, or pair it with jeans for brunch.</p>
<h3>2. High-Waist Jeans</h3>
<p>Find your perfect fit and invest in quality. Dark wash works for both casual and semi-formal occasions.</p>
<h3>3. A Little Black Dress</h3>
<p>Every woman needs an LBD that makes her feel confident. Choose a classic silhouette that flatters your body type.</p>
<h3>4. Comfortable Flats</h3>
<p>Canvas sneakers or ballet flats that can handle Nairobi streets while keeping you stylish.</p>
<h3>5. A Statement Bag</h3>
<p>A crossbody bag in a neutral color goes with everything and keeps your hands free.</p>
<p>Visit our shop to find all these essentials and more!</p>`,
    author: 'Sparkpretty Team',
    tags: ['fashion', 'essentials', 'tips'],
    published: true,
  },
  {
    title: 'How to Style a Midi Dress for Every Occasion',
    excerpt: 'The midi dress is the hardest working piece in your closet. Learn how to dress it up or down for any event.',
    content: `<h2>Why Midi Dresses Are a Must-Have</h2>
<p>Midi dresses hit that sweet spot between casual and formal. They're perfect for Kenya's warm climate while still looking put-together.</p>
<h3>For the Office</h3>
<p>Pair your midi dress with a structured blazer and pointed-toe heels. Keep accessories minimal and professional.</p>
<h3>For a Date Night</h3>
<p>Add strappy heels, statement earrings, and a clutch bag. A bold lip color ties the whole look together.</p>
<h3>For Weekend Brunch</h3>
<p>Casual sneakers or sandals, a crossbody bag, and oversized sunglasses. Easy, breezy, beautiful.</p>
<h3>For a Wedding</h3>
<p>Choose a midi dress in a celebratory color, add heels and elegant jewelry. Make sure not to wear white!</p>
<p>Shop our midi dress collection for styles that work across all occasions.</p>`,
    author: 'Sparkpretty Team',
    tags: ['styling', 'dresses', 'tips'],
    published: true,
  },
  {
    title: 'The Ultimate Guide to Finding Your Perfect Size',
    excerpt: 'Struggling with online shopping? Our comprehensive size guide will help you find the perfect fit every time.',
    content: `<h2>Why Sizing Matters</h2>
<p>Nothing ruins an outfit faster than a poor fit. Understanding your measurements is the key to successful online shopping.</p>
<h3>How to Take Your Measurements</h3>
<p>Use a soft measuring tape and measure over undergarments. For the bust, measure at the fullest point. For the waist, measure at your natural waistline. For hips, measure at the widest point.</p>
<h3>Understanding Size Charts</h3>
<p>Every brand fits differently. Always check the size chart before ordering, and when in doubt, size up rather than down.</p>
<h3>Between Sizes?</h3>
<p>If you're between sizes, consider the garment type. For fitted pieces, go smaller. For relaxed fits, go larger.</p>
<p>Check out our detailed <a href="/size-guide">size guide</a> for all our measurements in centimeters.</p>`,
    author: 'Sparkpretty Team',
    tags: ['size guide', 'shopping tips'],
    published: true,
  },
];

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    await Category.deleteMany({});
    await Product.deleteMany({});
    await User.deleteMany({});
    await Blog.deleteMany({});

    const cats = await Category.insertMany(categories);
    console.log(`Seeded ${cats.length} categories`);

    const catMap = {};
    cats.forEach((c) => { catMap[c.slug] = c._id; });

    const prods = [];
    for (const p of products) {
      const catId = catMap[p.categorySlug];
      if (!catId) continue;
      prods.push({
        name: p.name,
        slug: p.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
        description: p.description,
        category: catId,
        variants: p.variants.map((v) => ({
          ...v,
          images: v.images || [],
        })),
        tags: p.tags || [],
        featured: p.featured || false,
      });
    }
    await Product.insertMany(prods);
    console.log(`Seeded ${prods.length} products`);

    await User.create(adminUser);
    console.log('Created admin user: admin@sparkpretty.co.ke / admin123');

    await Blog.insertMany(blogPosts);
    console.log(`Seeded ${blogPosts.length} blog posts`);

    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

seed();

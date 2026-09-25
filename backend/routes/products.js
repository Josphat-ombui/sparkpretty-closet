import { Router } from 'express';
import Product from '../models/Product.js';
import Category from '../models/Category.js';
import { parsePagination } from '../utils/pagination.js';
import { CACHE_CONTROL } from '../utils/site-cache.js';

const router = Router();

const escapeRegExp = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// Effective price = sale price when set, otherwise list price.
const effectivePrice = {
  $cond: [
    { $and: [{ $ne: ['$variants.salePrice', null] }, { $gt: ['$variants.salePrice', 0] }] },
    '$variants.salePrice',
    '$variants.price',
  ],
};

const cardGroup = {
  _id: '$_id',
  name: { $first: '$name' },
  slug: { $first: '$slug' },
  description: { $first: '$description' },
  featured: { $first: '$featured' },
  active: { $first: '$active' },
  category: { $first: '$category' },
  tags: { $first: '$tags' },
  createdAt: { $first: '$createdAt' },
  updatedAt: { $first: '$updatedAt' },
  variantCount: { $sum: 1 },
  totalStock: { $sum: { $ifNull: ['$variants.stock', 0] } },
  minPrice: { $min: effectivePrice },
  maxPrice: { $max: effectivePrice },
  coverImage: {
    $first: {
      $cond: [
        { $gt: [{ $size: { $ifNull: ['$variants.images', []] } }, 0] },
        { $arrayElemAt: ['$variants.images', 0] },
        null,
      ],
    },
  },
  variants: { $push: '$variants' },
  reviews: { $first: { $ifNull: ['$reviews', []] } },
};

// Adds avgRating (number, 1 dp) + reviewCount and drops the heavy reviews array.
const ratingStage = {
  $addFields: {
    avgRating: {
      $cond: [
        { $gt: [{ $size: '$reviews' }, 0] },
        {
          $round: [
            { $divide: [{ $reduce: { input: '$reviews', initialValue: 0, in: { $add: ['$$value', '$$this.rating'] } } }, { $size: '$reviews' }] },
            1,
          ],
        },
        0,
      ],
    },
    reviewCount: { $size: '$reviews' },
  },
};

const dropReviews = { $project: { reviews: 0 } };

const cardPipeline = (filter, extra = []) => [
  { $match: filter },
  { $lookup: { from: 'categories', localField: 'category', foreignField: '_id', as: 'categoryInfo' } },
  { $unwind: { path: '$categoryInfo', preserveNullAndEmptyArrays: true } },
  { $addFields: { category: '$categoryInfo' } },
  { $unwind: '$variants' },
  { $group: cardGroup },
  ...extra,
  ratingStage,
  dropReviews,
];

const SORTS = {
  newest: { createdAt: -1 },
  created_desc: { createdAt: -1 },
  created_asc: { createdAt: 1 },
  name_asc: { name: 1 },
  name_desc: { name: -1 },
  price_asc: { minPrice: 1 },
  price_desc: { minPrice: -1 },
  rating_desc: { avgRating: -1, createdAt: -1 },
};

// ============================================================
// GET /api/products — storefront catalog (light, derived fields)
// ============================================================
router.get('/', async (req, res) => {
  try {
    const { page, limit, skip } = parsePagination(req.query);
    const search = (req.query.search || '').toString().trim();
    const categorySlug = (req.query.category || '').toString().trim();
    const size = (req.query.size || '').toString().trim();
    const color = (req.query.color || '').toString().trim();
    const material = req.query.material;
    const minPrice = Number(req.query.minPrice);
    const maxPrice = Number(req.query.maxPrice);
    const featured = req.query.featured === 'true' ? true : req.query.featured === 'false' ? false : undefined;
    const sort = SORTS[(req.query.sort || '').toString().trim()] ? (req.query.sort || '').toString().trim() : 'newest';

    const filter = { active: true, variants: { $ne: [] } };

    if (categorySlug) {
      const cat = await Category.findOne({ slug: categorySlug, active: { $ne: false } });
      if (!cat) {
        return res.json({ success: true, data: { products: [], total: 0, page, pages: 0, category: null } });
      }
      filter.category = cat._id;
    }
    if (size) filter['variants.size'] = new RegExp(`^${escapeRegExp(size)}$`, 'i');
    if (color) filter['variants.color'] = new RegExp(`^${escapeRegExp(color)}$`, 'i');
    if (material) {
      const mats = Array.isArray(material) ? material : [material];
      filter['variants.material'] = { $in: mats.map((m) => new RegExp(escapeRegExp(String(m)), 'i')) };
    }
    if (featured !== undefined) filter.featured = featured;
    if (search) {
      const rx = new RegExp(escapeRegExp(search), 'i');
      filter.$or = [{ name: rx }, { description: rx }, { tags: rx }, { 'variants.sku': rx }];
    }

    const hasPriceFilter = minPrice > 0 || maxPrice > 0;
    if (hasPriceFilter) {
      const priceMatch = { minPrice: {} };
      if (minPrice > 0) priceMatch.minPrice.$gte = minPrice;
      if (maxPrice > 0) priceMatch.minPrice.$lte = maxPrice;
      const pipeline = [...cardPipeline(filter), { $match: priceMatch }, { $sort: SORTS[sort] }, { $skip: skip }, { $limit: limit }];
      const [products] = await Product.aggregate(pipeline);
      const [countRes] = await Product.aggregate([...cardPipeline(filter), { $match: priceMatch }, { $count: 'total' }]);
      const total = countRes?.total || 0;
      res.set('Cache-Control', CACHE_CONTROL);
      return res.json({ success: true, data: { products, total, page, pages: Math.ceil(total / limit) || 1 } });
    }

    const [products, total] = await Promise.all([
      Product.aggregate([...cardPipeline(filter), { $sort: SORTS[sort] }, { $skip: skip }, { $limit: limit }]),
      Product.countDocuments(filter),
    ]);

    res.set('Cache-Control', CACHE_CONTROL);
    res.json({ success: true, data: { products, total, page, pages: Math.ceil(total / limit) || 1 } });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Could not load products' });
  }
});

// ============================================================
// GET /api/products/categories — storefront categories with counts
// ============================================================
router.get('/categories', async (req, res) => {
  try {
    const [categories, counts] = await Promise.all([
      Category.find().sort({ order: 1, name: 1 }),
      Product.aggregate([
        { $match: { active: true } },
        { $group: { _id: '$category', productCount: { $sum: 1 } } },
      ]),
    ]);
    const countMap = new Map(counts.map((c) => [String(c._id), c.productCount]));
    const data = categories.map((c) => ({ ...c.toObject(), productCount: countMap.get(String(c._id)) || 0 }));
    res.set('Cache-Control', CACHE_CONTROL);
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Could not load categories' });
  }
});

// ============================================================
// POST /api/products/:id/reviews
// ============================================================
router.post('/:id/reviews', async (req, res) => {
  try {
    const { name, rating, title, comment } = req.body;
    if (!name || !comment) return res.status(400).json({ success: false, message: 'Name and comment are required' });
    const cleanName = String(name).trim().slice(0, 80);
    const cleanComment = String(comment).trim().slice(0, 2000);
    const cleanTitle = String(title || '').trim().slice(0, 120);
    if (!cleanName || !cleanComment) return res.status(400).json({ success: false, message: 'Name and comment are required' });
    let star = Math.round(Number(rating));
    if (!Number.isFinite(star)) star = 5;
    star = Math.min(5, Math.max(1, star));
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
    const review = { name: cleanName, rating: star, title: cleanTitle, comment: cleanComment };
    product.reviews.push(review);
    await product.save();
    res.json({ success: true, data: review });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Could not submit review' });
  }
});

const deriveFields = (o) => {
  const variants = o.variants || [];
  o.variantCount = variants.length;
  o.totalStock = variants.reduce((s, v) => s + (v.stock || 0), 0);
  const prices = variants.map((v) => (v.salePrice > 0 ? v.salePrice : v.price)).filter((p) => p > 0);
  o.minPrice = prices.length ? Math.min(...prices) : null;
  o.maxPrice = prices.length ? Math.max(...prices) : null;
  o.coverImage = variants.flatMap((v) => v.images || [])[0] || null;
  o.avgRating = o.reviews && o.reviews.length
    ? Number((o.reviews.reduce((s, r) => s + r.rating, 0) / o.reviews.length).toFixed(1))
    : 0;
  o.reviewCount = o.reviews ? o.reviews.length : 0;
  return o;
};

// ============================================================
// GET /api/products/:slug — product detail + light related rail
// ============================================================
router.get('/:slug', async (req, res) => {
  try {
    const product = await Product.findOne({ slug: req.params.slug, active: true }).populate('category');
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });

    const relatedIds = (product.relatedProductIds || []).slice(0, 8);
    const relatedFilter = { active: true };
    if (relatedIds.length) relatedFilter._id = { $in: relatedIds };
    else { relatedFilter.category = product.category; relatedFilter._id = { $ne: product._id }; }
    relatedFilter.variants = { $ne: [] };

    const [related] = await Product.aggregate([
      ...cardPipeline(relatedFilter),
      { $sort: { createdAt: -1 } },
      { $limit: 8 },
    ]);

    const o = deriveFields(product.toObject());
    res.set('Cache-Control', CACHE_CONTROL);
    res.json({ success: true, data: { ...o, related } });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Could not load product' });
  }
});

export default router;
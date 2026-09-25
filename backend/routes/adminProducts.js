import { Router } from 'express';
import slugify from 'slugify';
import Product from '../models/Product.js';
import Category from '../models/Category.js';
import { adminOnly } from '../middleware/auth.js';
import { parsePagination } from '../utils/pagination.js';

const router = Router();

const asyncHandler = (fn) => (req, res) => {
  fn(req, res).catch((err) => {
    if (err && err.status) return res.status(err.status).json({ success: false, message: err.message });
    if (err && err.code === 11000) {
      return res.status(400).json({ success: false, message: 'A record with that value already exists.' });
    }
    res.status(500).json({ success: false, message: err.message || 'Internal server error' });
  });
};

const fail = (message, status = 400) => { const e = new Error(message); e.status = status; return e; };

// Effective price = sale price when set, otherwise list price.
const effectivePrice = {
  $cond: [
    { $and: [{ $ne: ['$variants.salePrice', null] }, { $gt: ['$variants.salePrice', 0] }] },
    '$variants.salePrice',
    '$variants.price',
  ],
};

const baseGroup = {
  _id: '$_id',
  name: { $first: '$name' },
  slug: { $first: '$slug' },
  description: { $first: '$description' },
  details: { $first: '$details' },
  featured: { $first: '$featured' },
  active: { $first: '$active' },
  category: { $first: '$category' },
  tags: { $first: '$tags' },
  metaTitle: { $first: '$metaTitle' },
  metaDescription: { $first: '$metaDescription' },
  createdAt: { $first: '$createdAt' },
  updatedAt: { $first: '$updatedAt' },
  variantCount: { $sum: { $cond: [{ $eq: ['$variants', null] }, 0, 1] } },
  totalStock: { $sum: { $ifNull: ['$variants.stock', 0] } },
  minPrice: { $min: effectivePrice },
  maxPrice: { $max: effectivePrice },
  coverImage: { $first: { $cond: [{ $gt: [{ $size: { $ifNull: ['$variants.images', []] } }, 0] }, { $arrayElemAt: ['$variants.images', 0] }, null] } },
};

const SORTS = {
  created_desc: { createdAt: -1 },
  created_asc: { createdAt: 1 },
  name_asc: { name: 1 },
  name_desc: { name: -1 },
  price_asc: { minPrice: 1 },
  price_desc: { minPrice: -1 },
  stock_asc: { totalStock: 1 },
  stock_desc: { totalStock: -1 },
};

const escapeRegExp = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const ensureUniqueSlug = async (name, excludeId) => {
  const base = slugify(name, { lower: true, strict: true }) || 'product';
  let slug = base;
  let n = 2;
  while (await Product.exists({ slug, _id: { $ne: excludeId } })) {
    slug = `${base}-${n++}`;
  }
  return slug;
};

const cleanProductPayload = async (body, existing = {}) => {
  const name = String(body.name || '').trim();
  if (!name) throw fail('Product name is required');

  const payload = { name, slug: await ensureUniqueSlug(name, existing._id) };

  for (const k of ['description', 'details', 'metaTitle', 'metaDescription']) {
    if (body[k] !== undefined) payload[k] = String(body[k]).trim();
  }

  const category = String(body.category || '').trim();
  if (!category) throw fail('A category is required');
  const categoryExists = await Category.exists({ _id: category });
  if (!categoryExists) throw fail('Selected category does not exist');
  payload.category = category;

  payload.tags = Array.isArray(body.tags)
    ? body.tags.map((t) => String(t).trim()).filter(Boolean)
    : String(body.tags || '').split(',').map((t) => t.trim()).filter(Boolean);

  payload.featured = Boolean(body.featured);
  payload.active = body.active === undefined ? true : Boolean(body.active);

  if (!Array.isArray(body.variants) || body.variants.length === 0) {
    throw fail('At least one variant is required');
  }
  payload.variants = body.variants.map((v, i) => {
    const size = String(v.size || '').trim();
    const color = String(v.color || '').trim();
    const price = Number(v.price);
    if (!size || !color) throw fail(`Variant ${i + 1}: size and color are required`);
    if (!(price > 0)) throw fail(`Variant ${i + 1}: price must be a positive number`);

    const rawSale = (v.salePrice === undefined || v.salePrice === null || v.salePrice === '') ? undefined : Number(v.salePrice);
    let salePrice;
    if (rawSale !== undefined) {
      if (Number.isNaN(rawSale) || rawSale < 0) throw fail(`Variant ${i + 1}: sale price must be a positive number`);
      salePrice = rawSale === 0 ? undefined : rawSale;
      if (salePrice !== undefined && salePrice >= price) {
        throw fail(`Variant ${i + 1}: sale price must be lower than the regular price`);
      }
    }

    return {
      size,
      color,
      colorHex: /^#[0-9a-fA-F]{3,8}$/.test(String(v.colorHex || '')) ? String(v.colorHex) : '#000000',
      material: String(v.material || '').trim(),
      price: Math.round(price),
      ...(salePrice === undefined ? {} : { salePrice: Math.round(salePrice) }),
      sku: String(v.sku || '').trim(),
      stock: Math.max(0, Math.floor(Number(v.stock) || 0)),
      images: Array.isArray(v.images) ? v.images.filter((im) => typeof im === 'string' && im.trim()) : [],
    };
  });

  if (Array.isArray(body.relatedProductIds)) {
    payload.relatedProductIds = body.relatedProductIds.filter((id) => /^[0-9a-fA-F]{24}$/.test(id));
  }

  return payload;
};

const detachFromRelated = async (ids) => {
  await Product.updateMany({ relatedProductIds: { $in: ids } }, { $pull: { relatedProductIds: { $in: ids } } });
};

router.use(adminOnly);

// ============================================================
// Catalog stats
// ============================================================
router.get('/stats', asyncHandler(async (req, res) => {
  const [rows] = await Product.aggregate([
    { $project: { active: 1, featured: 1, totalStock: { $sum: '$variants.stock' } } },
    { $group: {
        _id: null,
        total: { $sum: 1 },
        active: { $sum: { $cond: ['$active', 1, 0] } },
        inactive: { $sum: { $cond: ['$active', 0, 1] } },
        featured: { $sum: { $cond: ['$featured', 1, 0] } },
        lowStock: { $sum: { $cond: [{ $lte: ['$totalStock', 5] }, 1, 0] } },
        outOfStock: { $sum: { $cond: [{ $lte: ['$totalStock', 0] }, 1, 0] } },
    } },
  ]);
  const allVariants = await Product.aggregate([
    { $unwind: '$variants' },
    { $group: { _id: null, variants: { $sum: 1 }, units: { $sum: '$variants.stock' } } },
  ]);
  res.json({
    success: true,
    data: rows
      ? {
          total: rows.total,
          active: rows.active,
          inactive: rows.inactive,
          featured: rows.featured,
          lowStock: rows.lowStock,
          outOfStock: rows.outOfStock,
          variants: allVariants[0]?.variants || 0,
          unitsInStock: allVariants[0]?.units || 0,
        }
      : { total: 0, active: 0, inactive: 0, featured: 0, lowStock: 0, outOfStock: 0, variants: 0, unitsInStock: 0 },
  });
}));

// ============================================================
// List with rich filtering + accurate aggregate sums/sorts
// ============================================================
router.get('/', asyncHandler(async (req, res) => {
  const { page, limit, skip } = parsePagination(req.query);
  const search = (req.query.search || '').toString().trim();
  const category = (req.query.category || '').toString().trim();
  const status = (req.query.status || '').toString().trim();
  const stock = (req.query.stock || '').toString().trim();
  const featured = req.query.featured === 'true' ? true : req.query.featured === 'false' ? false : undefined;
  const sort = SORTS[req.query.sort || ''] ? req.query.sort : 'created_desc';

  const filter = {};
  if (search) {
    const rx = new RegExp(escapeRegExp(search), 'i');
    filter.$or = [
      { name: rx },
      { 'variants.sku': rx },
      { tags: rx },
      { description: rx },
    ];
  }
  if (category) filter.category = category;
  if (status === 'active') filter.active = true;
  if (status === 'inactive') filter.active = false;
  if (featured !== undefined) filter.featured = featured;

  const pipeline = [
    { $match: filter },
    { $lookup: { from: 'categories', localField: 'category', foreignField: '_id', as: 'categoryInfo' } },
    { $unwind: { path: '$categoryInfo', preserveNullAndEmptyArrays: true } },
    { $addFields: { category: '$categoryInfo' } },
    { $unwind: { path: '$variants', preserveNullAndEmptyArrays: true } },
    { $group: baseGroup },
  ];

  if (stock === 'in') pipeline.push({ $match: { totalStock: { $gte: 6 } } });
  else if (stock === 'low') pipeline.push({ $match: { totalStock: { $lte: 5 } } });
  else if (stock === 'out') pipeline.push({ $match: { totalStock: { $lte: 0 } } });

  let total;
  if (stock) {
    const [countRes] = await Product.aggregate([...pipeline, { $count: 'total' }]);
    total = countRes?.total || 0;
  } else {
    total = await Product.countDocuments(filter);
  }

  const items = await Product.aggregate([
    ...pipeline,
    { $sort: SORTS[sort] },
    { $skip: skip },
    { $limit: limit },
  ]);

  res.json({ success: true, data: { items, total, page, pages: Math.ceil(total / limit) || 1, limit } });
}));

// ============================================================
// Create
// ============================================================
router.post('/', asyncHandler(async (req, res) => {
  const payload = await cleanProductPayload(req.body);
  const product = await Product.create(payload);
  const populated = await Product.findById(product._id).populate('category');
  res.status(201).json({ success: true, data: populated });
}));

// ============================================================
// Bulk operations
// ============================================================
const collectIds = (body) => {
  const ids = Array.isArray(body) ? body : body && body.ids;
  if (!Array.isArray(ids) || ids.length === 0) throw fail('No product ids supplied');
  const clean = ids.filter((id) => /^[0-9a-fA-F]{24}$/.test(String(id)));
  if (clean.length === 0) throw fail('No valid product ids supplied');
  return clean;
};

router.post('/bulk/delete', asyncHandler(async (req, res) => {
  const ids = collectIds(req.body);
  const result = await Product.deleteMany({ _id: { $in: ids } });
  await detachFromRelated(ids);
  res.json({ success: true, data: { deleted: result.deletedCount } });
}));

router.post('/bulk/status', asyncHandler(async (req, res) => {
  const ids = collectIds(req.body);
  if (typeof req.body.active !== 'boolean') throw fail('`active` must be a boolean');
  const result = await Product.updateMany({ _id: { $in: ids } }, { $set: { active: req.body.active } });
  res.json({ success: true, data: { updated: result.modifiedCount } });
}));

router.put('/bulk/category', asyncHandler(async (req, res) => {
  const ids = collectIds(req.body);
  const category = String(req.body.category || '').trim();
  if (!category) throw fail('A category id is required');
  if (!(await Category.exists({ _id: category }))) throw fail('Selected category does not exist');
  const result = await Product.updateMany({ _id: { $in: ids } }, { $set: { category } });
  res.json({ success: true, data: { updated: result.modifiedCount } });
}));

// ============================================================
// Single product
// ============================================================
router.get('/:id', asyncHandler(async (req, res) => {
  if (!/^[0-9a-fA-F]{24}$/.test(req.params.id)) throw fail('Product not found', 404);
  const product = await Product.findById(req.params.id)
    .populate('category')
    .populate({ path: 'relatedProductIds', select: 'name slug active variants' });
  if (!product) throw fail('Product not found', 404);
  const o = product.toObject();
  const variants = o.variants || [];
  o.variantCount = variants.length;
  o.totalStock = variants.reduce((s, v) => s + (v.stock || 0), 0);
  const prices = variants
    .map((v) => (v.salePrice > 0 ? v.salePrice : v.price))
    .filter((p) => p > 0);
  o.minPrice = prices.length ? Math.min(...prices) : null;
  o.maxPrice = prices.length ? Math.max(...prices) : null;
  o.coverImage = variants.flatMap((v) => v.images || [])[0] || null;
  o.ratingData = o.reviews && o.reviews.length
    ? { avgRating: (o.reviews.reduce((s, r) => s + r.rating, 0) / o.reviews.length).toFixed(1), reviewCount: o.reviews.length }
    : { avgRating: 0, reviewCount: 0 };
  o.relatedProducts = (o.relatedProductIds || []).map((r) => ({
    _id: r._id,
    name: r.name,
    slug: r.slug,
    active: r.active,
    coverImage: (r.variants && r.variants[0] && r.variants[0].images && r.variants[0].images[0]) || null,
  }));
  delete o.relatedProductIds;
  res.json({ success: true, data: o });
}));

router.put('/:id', asyncHandler(async (req, res) => {
  if (!/^[0-9a-fA-F]{24}$/.test(req.params.id)) throw fail('Product not found', 404);
  const existing = await Product.findById(req.params.id);
  if (!existing) throw fail('Product not found', 404);
  const payload = await cleanProductPayload(req.body, existing);
  const product = await Product.findByIdAndUpdate(req.params.id, payload, { new: true, runValidators: true });
  const populated = await Product.findById(product._id).populate('category');
  res.json({ success: true, data: populated });
}));

router.patch('/:id', asyncHandler(async (req, res) => {
  if (!/^[0-9a-fA-F]{24}$/.test(req.params.id)) throw fail('Product not found', 404);
  const body = req.body || {};
  const update = {};
  if (typeof body.active === 'boolean') update.active = body.active;
  if (typeof body.featured === 'boolean') update.featured = body.featured;
  if (Object.keys(update).length === 0) throw fail('Nothing to update');
  const product = await Product.findByIdAndUpdate(req.params.id, update, { new: true });
  if (!product) throw fail('Product not found', 404);
  res.json({ success: true, data: product });
}));

router.delete('/:id', asyncHandler(async (req, res) => {
  if (!/^[0-9a-fA-F]{24}$/.test(req.params.id)) throw fail('Product not found', 404);
  const product = await Product.findByIdAndDelete(req.params.id);
  if (!product) throw fail('Product not found', 404);
  await detachFromRelated([req.params.id]);
  res.json({ success: true, data: { deleted: product._id } });
}));

router.post('/:id/duplicate', asyncHandler(async (req, res) => {
  if (!/^[0-9a-fA-F]{24}$/.test(req.params.id)) throw fail('Product not found', 404);
  const source = await Product.findById(req.params.id);
  if (!source) throw fail('Product not found', 404);
  const copy = source.toObject();
  delete copy._id;
  delete copy.__v;
  delete copy.createdAt;
  delete copy.updatedAt;
  delete copy.reviews;
  delete copy.relatedProductIds;
  copy.name = `${copy.name} (Copy)`;
  copy.featured = false;
  copy.slug = await ensureUniqueSlug(copy.name);
  const created = await Product.create(copy);
  const populated = await Product.findById(created._id).populate('category');
  res.status(201).json({ success: true, data: populated });
}));

export default router;
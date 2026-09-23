import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import { v2 as cloudinary } from 'cloudinary';
import { auth, adminOnly, editorOrAdmin } from '../middleware/auth.js';
import { parsePagination } from '../utils/pagination.js';
import Media from '../models/Media.js';
import Product from '../models/Product.js';
import Banner from '../models/Banner.js';
import Setting from '../models/Setting.js';

const router = Router();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = /jpeg|jpg|png|webp|gif|svg/;
    const ext = allowed.test(path.extname(file.originalname).toLowerCase());
    const mime = allowed.test(file.mimetype);
    if (ext && mime) return cb(null, true);
    cb(new Error('Only image files (jpg, png, webp, gif, svg) are allowed'));
  },
});

const uploadToCloudinary = (file) =>
  new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: 'sparkpretty', resource_type: 'image' },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      }
    );
    stream.end(file.buffer);
  });

const escapeRegExp = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// Find everywhere a media URL is referenced so we never orphan content
const findReferences = async (url) => {
  const urlEscaped = escapeRegExp(url);
  const [products, banners, settings] = await Promise.all([
    Product.find({ 'variants.images': url }, 'name _id'),
    Banner.find({ image: url }, 'title _id'),
    Setting.find(
      { $or: [{ value: url }, { value: { $regex: urlEscaped } }] },
      'key label section type'
    ).limit(50),
  ]);
  return { products, banners, settings };
};

// ============================================================
// Media library
// ============================================================

// Upload one or more images — persists each to the media library.
// Keeps legacy response shape: { success, data: [urls] }
router.post('/', auth, editorOrAdmin, upload.array('images', 10), async (req, res) => {
  try {
    const folder = (req.body.folder || 'sparkpretty').replace(/[^a-zA-Z0-9-_/]/g, '');
    const results = await Promise.all(req.files.map((f) => uploadToCloudinary(f)));
    await Promise.all(results.map((r) => Media.create({
      url: r.secure_url,
      publicId: r.public_id,
      filename: r.original_filename || '',
      mime: r.format ? `image/${r.format}` : 'image/jpeg',
      size: r.bytes || 0,
      width: r.width || 0,
      height: r.height || 0,
      alt: req.body.alt || '',
      caption: req.body.caption || '',
      tags: Array.isArray(req.body.tags) ? req.body.tags : String(req.body.tags || '')
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean),
      folder: folder || 'sparkpretty',
      source: 'cloudinary',
      uploadedBy: req.user._id,
    })));
    const urls = results.map((r) => r.secure_url);
    res.json({ success: true, data: urls });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message || 'Upload failed' });
  }
});

// List media with search / tag / folder filters + pagination
router.get('/', auth, editorOrAdmin, async (req, res) => {
  try {
    const { page, limit, skip } = parsePagination(req.query);
    const search = (req.query.search || '').toString().trim();
    const tag = (req.query.tag || '').toString().trim();
    const folderQ = (req.query.folder || '').toString().trim();
    const filter = {};
    if (search) {
      filter.$or = [
        { alt: { $regex: search, $options: 'i' } },
        { caption: { $regex: search, $options: 'i' } },
        { filename: { $regex: search, $options: 'i' } },
        { url: { $regex: search, $options: 'i' } },
        { tags: { $regex: search, $options: 'i' } },
      ];
    }
    if (tag) filter.tags = tag;
    if (folderQ) filter.folder = folderQ;

    const [items, total] = await Promise.all([
      Media.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
      Media.countDocuments(filter),
    ]);
    res.json({ success: true, data: { items, total, page, pages: Math.ceil(total / limit) || 1, limit } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// All distinct tags for the media picker
router.get('/tags', auth, editorOrAdmin, async (req, res) => {
  try {
    const tags = await Media.distinct('tags');
    res.json({ success: true, data: tags.sort() });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Register a remote URL (e.g. placehold.co image or existing path) in the library
router.post('/from-url', auth, editorOrAdmin, async (req, res) => {
  try {
    const { url, alt = '', caption = '', tags = [], folder = 'sparkpretty', filename = '', mime = 'image/jpeg', size = 0 } = req.body || {};
    if (!url) return res.status(400).json({ success: false, message: 'URL is required' });
    const existing = await Media.findOne({ url });
    if (existing) return res.json({ success: true, data: existing });
    const media = await Media.create({
      url,
      filename,
      mime,
      size,
      alt,
      caption,
      tags: Array.isArray(tags) ? tags : String(tags).split(',').map((t) => t.trim()).filter(Boolean),
      folder,
      source: 'url',
      uploadedBy: req.user._id,
    });
    res.status(201).json({ success: true, data: media });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Media detail
router.get('/:id', auth, editorOrAdmin, async (req, res) => {
  try {
    const media = await Media.findById(req.params.id);
    if (!media) return res.status(404).json({ success: false, message: 'Media not found' });
    res.json({ success: true, data: media });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Update alt text, caption, tags, folder
router.put('/:id', auth, editorOrAdmin, async (req, res) => {
  try {
    const { alt, caption, tags, folder } = req.body;
    const update = {};
    if (alt !== undefined) update.alt = alt;
    if (caption !== undefined) update.caption = caption;
    if (tags !== undefined) {
      update.tags = Array.isArray(tags) ? tags : String(tags).split(',').map((t) => t.trim()).filter(Boolean);
    }
    if (folder !== undefined) update.folder = String(folder).replace(/[^a-zA-Z0-9-_/]/g, '');
    const media = await Media.findByIdAndUpdate(req.params.id, { $set: update }, { new: true });
    if (!media) return res.status(404).json({ success: false, message: 'Media not found' });
    res.json({ success: true, data: media });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Delete media — blocks if still referenced unless ?force=true
// (reference-checked against products, banners and site content settings)
router.delete('/:id', auth, adminOnly, async (req, res) => {
  try {
    const media = await Media.findById(req.params.id);
    if (!media) return res.status(404).json({ success: false, message: 'Media not found' });

    const references = await findReferences(media.url);
    const refCount = references.products.length + references.banners.length + references.settings.length;
    if (refCount > 0 && req.query.force !== 'true') {
      return res.status(409).json({
        success: false,
        message: `This image is used in ${refCount} place(s). Use ?force=true to delete anyway and leave those references broken.`,
        references: {
          products: references.products.map((p) => ({ _id: p._id, name: p.name })),
          banners: references.banners.map((b) => ({ _id: b._id, title: b.title })),
          settings: references.settings.map((s) => ({ key: s.key, label: s.label, section: s.section })),
        },
      });
    }

    if (media.source === 'cloudinary' && media.publicId) {
      try {
        await cloudinary.uploader.destroy(media.publicId);
      } catch { /* Cloudinary removal is best-effort */ }
    }
    await Media.findByIdAndDelete(req.params.id);
    res.json({ success: true, data: {} });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

export default router;
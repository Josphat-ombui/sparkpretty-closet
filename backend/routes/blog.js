import { Router } from 'express';
import Blog from '../models/Blog.js';

const router = Router();

router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 9, tag } = req.query;
    const filter = { published: true };
    if (tag) filter.tags = tag;

    const total = await Blog.countDocuments(filter);
    const posts = await Blog.find(filter)
      .sort('-createdAt')
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .select('-content');

    res.json({ success: true, data: { posts, total, page: Number(page), pages: Math.ceil(total / limit) } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.get('/tags', async (req, res) => {
  try {
    const tags = await Blog.distinct('tags', { published: true });
    res.json({ success: true, data: tags });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.get('/:slug', async (req, res) => {
  try {
    const post = await Blog.findOne({ slug: req.params.slug, published: true });
    if (!post) return res.status(404).json({ success: false, message: 'Post not found' });
    res.json({ success: true, data: post });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

export default router;

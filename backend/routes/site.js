import { Router } from 'express';
import Banner from '../models/Banner.js';
import Setting from '../models/Setting.js';

const router = Router();

router.get('/banners', async (req, res) => {
  try {
    const type = req.query.type;
    const filter = { active: true };
    if (type) filter.type = type;
    const banners = await Banner.find(filter).sort({ order: 1, createdAt: -1 });
    res.json({ success: true, data: banners });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.get('/settings', async (req, res) => {
  try {
    const settings = await Setting.find();
    const data = {};
    settings.forEach((s) => { data[s.key] = s.value; });
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

export default router;

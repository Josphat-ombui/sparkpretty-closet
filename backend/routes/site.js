import { Router } from 'express';
import Banner from '../models/Banner.js';
import Setting from '../models/Setting.js';
import { sectionsFromRegistry, SECTION_LABELS } from '../data/content-registry.js';
import { cached, CACHE_CONTROL } from '../utils/site-cache.js';

const router = Router();

const cacheControl = (res) => res.set('Cache-Control', CACHE_CONTROL);

router.get('/banners', async (req, res) => {
  try {
    const type = req.query.type;
    const filter = { active: true };
    if (type) filter.type = type;
    const banners = await cached(`banners:${type || 'all'}`, () => Banner.find(filter).sort({ order: 1, createdAt: -1 }));
    cacheControl(res);
    res.json({ success: true, data: banners });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.get('/settings', async (req, res) => {
  try {
    const data = await cached('settings', async () => {
      const settings = await Setting.find();
      const map = {};
      settings.forEach((s) => { map[s.key] = s.value; });
      return map;
    });
    cacheControl(res);
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Blueprint of every manageable site section + whether content lives in the DB yet.
// `missing` lists registry keys that have no Setting row (frontends fall back to defaults).
router.get('/sections', async (req, res) => {
  try {
    const sections = await cached('sections', async () => {
      const existing = await Setting.find({}, 'key section enabled');
      const haveKey = new Map(existing.map((s) => [s.key, s.enabled !== false]));
      return sectionsFromRegistry().map((section) => ({
        id: section.id,
        label: section.label,
        enabled: section.fields.some((f) => haveKey.get(f.key) !== false),
        fields: section.fields.map((f) => ({ ...f, hasValue: haveKey.has(f.key) })),
        missing: section.fields.filter((f) => !haveKey.has(f.key)).map((f) => f.key),
      }));
    });
    cacheControl(res);
    res.json({ success: true, data: { sections, sectionLabels: SECTION_LABELS } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.get('/content', async (req, res) => {
  try {
    const data = await cached('content', async () => {
      const settings = await Setting.find({ enabled: { $ne: false } }, 'key value type label section description placeholder');
      const map = {};
      settings.forEach((s) => { map[s.key] = s.value; });
      return map;
    });
    cacheControl(res);
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.get('/content/:key', async (req, res) => {
  try {
    const data = await cached(`content:${req.params.key}`, () =>
      Setting.findOne({ key: req.params.key, enabled: { $ne: false } })
    );
    if (!data) return res.status(404).json({ success: false, message: 'Not found' });
    cacheControl(res);
    res.json({ success: true, data: data.value });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

export default router;
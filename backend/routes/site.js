import { Router } from 'express';
import Banner from '../models/Banner.js';
import Setting from '../models/Setting.js';
import { sectionsFromRegistry, SECTION_LABELS } from '../data/content-registry.js';

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

// Blueprint of every manageable site section + whether content lives in the DB yet.
// `missing` lists registry keys that have no Setting row (frontends fall back to defaults).
router.get('/sections', async (req, res) => {
  try {
    const existing = await Setting.find({}, 'key section enabled');
    const haveKey = new Map(existing.map((s) => [s.key, s.enabled !== false]));
    const sections = sectionsFromRegistry().map((section) => ({
      id: section.id,
      label: section.label,
      enabled: section.fields.some((f) => haveKey.get(f.key) !== false),
      fields: section.fields.map((f) => ({ ...f, hasValue: haveKey.has(f.key) })),
      missing: section.fields.filter((f) => !haveKey.has(f.key)).map((f) => f.key),
    }));
    res.json({ success: true, data: { sections, sectionLabels: SECTION_LABELS } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.get('/content', async (req, res) => {
  try {
    const settings = await Setting.find({ enabled: { $ne: false } }, 'key value type label section description placeholder');
    const data = {};
    settings.forEach((s) => { data[s.key] = s.value; });
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.get('/content/:key', async (req, res) => {
  try {
    const setting = await Setting.findOne({ key: req.params.key, enabled: { $ne: false } });
    if (!setting) return res.status(404).json({ success: false, message: 'Not found' });
    res.json({ success: true, data: setting.value });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

export default router;

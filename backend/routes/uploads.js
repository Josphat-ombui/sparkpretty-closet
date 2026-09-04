import { Router } from 'express';
import multer from 'multer';
import { auth, adminOnly } from '../middleware/auth.js';
import path from 'path';

const router = Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => {
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `${unique}${path.extname(file.originalname)}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = /jpeg|jpg|png|webp|gif/;
    const ext = allowed.test(path.extname(file.originalname).toLowerCase());
    const mime = allowed.test(file.mimetype);
    if (ext && mime) return cb(null, true);
    cb(new Error('Only image files (jpg, png, webp, gif) are allowed'));
  },
});

router.post('/', auth, adminOnly, upload.array('images', 10), (req, res) => {
  const urls = req.files.map((f) => `/uploads/${f.filename}`);
  res.json({ success: true, data: urls });
});

export default router;

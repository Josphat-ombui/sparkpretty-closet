import { Router } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { auth } from '../middleware/auth.js';

const router = Router();

const signToken = (id) => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN });

router.post('/register', async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;
    if (await User.findOne({ email })) {
      return res.status(400).json({ success: false, message: 'Email already in use' });
    }
    const user = await User.create({ name, email, password, phone });
    const token = signToken(user._id);
    res.status(201).json({ success: true, data: { user: { id: user._id, name: user.name, email: user.email, role: user.role }, token } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }
    const token = signToken(user._id);
    res.json({ success: true, data: { user: { id: user._id, name: user.name, email: user.email, role: user.role }, token } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.get('/me', auth, async (req, res) => {
  res.json({ success: true, data: req.user });
});

export default router;

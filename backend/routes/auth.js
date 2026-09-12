import crypto from 'crypto';
import { Router } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { auth } from '../middleware/auth.js';

const router = Router();

const ACCESS_EXPIRES = process.env.JWT_ACCESS_EXPIRES_IN || process.env.JWT_EXPIRES_IN || '15m';
const REFRESH_EXPIRES = process.env.JWT_REFRESH_EXPIRES_IN || '30d';
const MAX_REFRESH_TOKENS = 10;

const sha256 = (value) => crypto.createHash('sha256').update(value).digest('hex');

const signAccessToken = (user) => jwt.sign(
  { id: user._id.toString(), tokenVersion: user.tokenVersion },
  process.env.JWT_SECRET,
  { expiresIn: ACCESS_EXPIRES },
);

const generateRefreshToken = (user) => {
  const rnd = crypto.randomBytes(24).toString('hex');
  const raw = jwt.sign(
    { id: user._id.toString(), type: 'refresh', rnd },
    process.env.JWT_SECRET,
    { expiresIn: REFRESH_EXPIRES },
  );
  return raw;
};

const issueTokens = (user) => ({
  accessToken: signAccessToken(user),
  refreshToken: generateRefreshToken(user),
});

const addRefreshToken = async (user, rawToken) => {
  if (!user.refreshTokens) user.refreshTokens = [];
  user.refreshTokens.push(sha256(rawToken));
  if (user.refreshTokens.length > MAX_REFRESH_TOKENS) {
    user.refreshTokens = user.refreshTokens.slice(-MAX_REFRESH_TOKENS);
  }
  await user.save();
};

const removeRefreshToken = async (user, rawToken) => {
  user.refreshTokens = (user.refreshTokens || []).filter((t) => t !== sha256(rawToken));
  await user.save();
};

const publicUser = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  role: user.role,
  phone: user.phone || '',
});

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;
    if (await User.findOne({ email })) {
      return res.status(400).json({ success: false, message: 'Email already in use' });
    }
    const user = await User.create({ name, email, password, phone });
    const { accessToken, refreshToken } = await issueTokens(user);
    await addRefreshToken(user, refreshToken);
    res.status(201).json({ success: true, data: { user: publicUser(user), token: accessToken, refreshToken } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }
    const { accessToken, refreshToken } = await issueTokens(user);
    await addRefreshToken(user, refreshToken);
    res.json({ success: true, data: { user: publicUser(user), token: accessToken, refreshToken } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/auth/refresh — rotate refresh token, issue new access token
router.post('/refresh', async (req, res) => {
  const { refreshToken } = req.body;
  if (!refreshToken) return res.status(400).json({ success: false, message: 'Refresh token required' });
  try {
    const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET);
    if (decoded.type !== 'refresh' || !decoded.id || !decoded.rnd) {
      return res.status(401).json({ success: false, message: 'Invalid refresh token' });
    }
    const user = await User.findById(decoded.id).select('+refreshTokens');
    if (!user) return res.status(401).json({ success: false, message: 'User not found' });

    const stored = user.refreshTokens || [];
    if (!stored.includes(sha256(refreshToken))) {
      return res.status(401).json({ success: false, message: 'Refresh token revoked' });
    }

    await removeRefreshToken(user, refreshToken);
    const { accessToken, refreshToken: newRefreshToken } = await issueTokens(user);
    await addRefreshToken(user, newRefreshToken);
    res.json({ success: true, data: { user: publicUser(user), token: accessToken, refreshToken: newRefreshToken } });
  } catch {
    res.status(401).json({ success: false, message: 'Invalid or expired refresh token' });
  }
});

// POST /api/auth/logout — revoke ALL sessions for this user
router.post('/logout', auth, async (req, res) => {
  try {
    req.user.tokenVersion = (req.user.tokenVersion || 0) + 1;
    req.user.refreshTokens = [];
    await req.user.save();
    res.json({ success: true, data: {} });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/auth/me
router.get('/me', auth, async (req, res) => {
  res.json({ success: true, data: publicUser(req.user) });
});

export default router;
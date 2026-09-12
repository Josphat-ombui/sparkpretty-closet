import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const verifyAccessToken = async (token) => {
  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  if (decoded.type) throw new Error('Invalid token type');
  const user = await User.findById(decoded.id);
  if (!user) throw new Error('User not found');
  if (decoded.tokenVersion !== undefined && decoded.tokenVersion !== user.tokenVersion) {
    throw new Error('Token revoked');
  }
  return user;
};

export const auth = async (req, res, next) => {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, message: 'Not authenticated' });
  }
  try {
    const token = header.split(' ')[1];
    req.user = await verifyAccessToken(token);
    next();
  } catch {
    res.status(401).json({ success: false, message: 'Invalid token' });
  }
};

export const optionalAuth = async (req, res, next) => {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) return next();
  try {
    const token = header.split(' ')[1];
    req.user = await verifyAccessToken(token);
  } catch { /* ignore invalid token for optional auth */ }
  next();
};

export const adminOnly = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'Admin access required' });
  }
  next();
};

export const editorOrAdmin = (req, res, next) => {
  if (!req.user || (req.user.role !== 'admin' && req.user.role !== 'editor')) {
    return res.status(403).json({ success: false, message: 'Editor or admin access required' });
  }
  next();
};
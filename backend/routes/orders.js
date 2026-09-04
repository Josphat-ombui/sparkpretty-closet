import { Router } from 'express';
import Order from '../models/Order.js';
import Cart from '../models/Cart.js';
import Product from '../models/Product.js';
import { optionalAuth } from '../middleware/auth.js';

const router = Router();

router.use(optionalAuth);

const getSessionId = (req) => req.headers['x-session-id'] || 'anonymous';

router.post('/', async (req, res) => {
  try {
    const { shippingAddress } = req.body;
    const hasUser = Boolean(req.user);
    const query = hasUser ? { user: req.user._id } : { sessionId: getSessionId(req) };
    const cart = await Cart.findOne(query).populate('items.product');
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ success: false, message: 'Cart is empty' });
    }

    const items = [];
    for (const item of cart.items) {
      const product = item.product;
      const variant = product.variants[item.variantIndex];
      if (!variant || variant.stock < item.quantity) {
        return res.status(400).json({ success: false, message: `Insufficient stock for ${product.name}` });
      }
      items.push({
        product: product._id,
        name: product.name,
        size: item.size,
        color: item.color,
        quantity: item.quantity,
        price: item.price,
      });
    }

    const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
    const shipping = subtotal >= 5000 ? 0 : 350;
    const total = subtotal + shipping;

    const order = await Order.create({
      user: hasUser ? req.user._id : null,
      sessionId: hasUser ? null : getSessionId(req),
      items,
      shippingAddress,
      subtotal,
      shipping,
      total,
    });

    for (const item of cart.items) {
      const product = await Product.findById(item.product._id);
      product.variants[item.variantIndex].stock -= item.quantity;
      await product.save();
    }

    cart.items = [];
    await cart.save();

    res.status(201).json({ success: true, data: order });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.get('/', async (req, res) => {
  try {
    if (req.user) {
      const orders = await Order.find({ user: req.user._id }).sort('-createdAt');
      return res.json({ success: true, data: orders });
    }
    const orders = await Order.find({ sessionId: getSessionId(req) }).sort('-createdAt');
    res.json({ success: true, data: orders });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const filter = { _id: req.params.id };
    if (req.user) filter.user = req.user._id;
    else filter.sessionId = getSessionId(req);
    const order = await Order.findOne(filter);
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
    res.json({ success: true, data: order });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

export default router;

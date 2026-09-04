import { Router } from 'express';
import Cart from '../models/Cart.js';
import Product from '../models/Product.js';
import { optionalAuth } from '../middleware/auth.js';

const router = Router();

router.use(optionalAuth);

const getSessionId = (req) => req.headers['x-session-id'] || 'guest';

router.get('/', async (req, res) => {
  try {
    const query = req.user ? { user: req.user._id } : { sessionId: getSessionId(req) };
    let cart = await Cart.findOne(query).populate('items.product');
    if (!cart) cart = { items: [] };
    res.json({ success: true, data: cart });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.post('/add', async (req, res) => {
  try {
    const { productId, variantIndex, quantity = 1 } = req.body;
    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });

    const variant = product.variants[variantIndex];
    if (!variant) return res.status(400).json({ success: false, message: 'Invalid variant' });
    if (variant.stock < quantity) return res.status(400).json({ success: false, message: 'Insufficient stock' });

    const query = req.user ? { user: req.user._id } : { sessionId: getSessionId(req) };
    let cart = await Cart.findOne(query);
    if (!cart) cart = new Cart({ ...query, items: [] });

    const existingIdx = cart.items.findIndex(
      (i) => i.product.toString() === productId && i.variantIndex === variantIndex
    );

    if (existingIdx > -1) {
      cart.items[existingIdx].quantity += quantity;
    } else {
      cart.items.push({
        product: productId,
        variantIndex,
        size: variant.size,
        color: variant.color,
        quantity,
        price: variant.salePrice || variant.price,
      });
    }

    await cart.save();
    cart = await cart.populate('items.product');
    res.json({ success: true, data: cart });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.put('/update', async (req, res) => {
  try {
    const { itemId, quantity } = req.body;
    const query = req.user ? { user: req.user._id } : { sessionId: getSessionId(req) };
    const cart = await Cart.findOne(query);
    if (!cart) return res.status(404).json({ success: false, message: 'Cart not found' });

    const item = cart.items.id(itemId);
    if (!item) return res.status(404).json({ success: false, message: 'Item not found' });
    if (quantity < 1) {
      item.deleteOne();
    } else {
      item.quantity = quantity;
    }

    await cart.save();
    const updated = await cart.populate('items.product');
    res.json({ success: true, data: updated });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.delete('/remove/:itemId', async (req, res) => {
  try {
    const query = req.user ? { user: req.user._id } : { sessionId: getSessionId(req) };
    const cart = await Cart.findOne(query);
    if (!cart) return res.status(404).json({ success: false, message: 'Cart not found' });

    cart.items.pull(req.params.itemId);
    await cart.save();
    const updated = await cart.populate('items.product');
    res.json({ success: true, data: updated });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

export default router;

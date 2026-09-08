import { Router } from 'express';
import Subscriber from '../models/Subscriber.js';

const router = Router();

router.post('/subscribe', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ success: false, message: 'Email is required' });
    const existing = await Subscriber.findOne({ email: email.toLowerCase() });
    if (existing) {
      if (!existing.active) {
        existing.active = true;
        await existing.save();
      }
      return res.json({ success: true, message: 'Subscribed successfully' });
    }
    await Subscriber.create({ email });
    res.json({ success: true, message: 'Subscribed successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

export default router;

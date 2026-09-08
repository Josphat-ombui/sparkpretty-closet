import { Router } from 'express';
import ContactMessage from '../models/ContactMessage.js';

const router = Router();

router.post('/', async (req, res) => {
  try {
    const { name, email, phone, subject, message } = req.body;
    if (!name || !email || !message) {
      return res.status(400).json({ success: false, message: 'Name, email, and message are required' });
    }
    await ContactMessage.create({ name, email, phone, subject, message });
    res.json({ success: true, message: 'Message received' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

export default router;

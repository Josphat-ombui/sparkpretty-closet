import { Router } from 'express';
const router = Router();

router.post('/', async (req, res) => {
  try {
    const { name, email, phone, message } = req.body;
    if (!name || !email || !message) {
      return res.status(400).json({ success: false, message: 'Name, email, and message are required' });
    }
    console.log('Contact form:', { name, email, phone, message });
    res.json({ success: true, message: 'Message received' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

export default router;

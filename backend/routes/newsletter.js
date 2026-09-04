import { Router } from 'express';
const router = Router();

router.post('/subscribe', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ success: false, message: 'Email is required' });
    res.json({ success: true, message: 'Subscribed successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

export default router;

import { Router } from 'express';
import Order from '../models/Order.js';
import { getAccessToken, initiateSTKPush } from '../utils/mpesa.js';
import { optionalAuth } from '../middleware/auth.js';

const router = Router();

router.use(optionalAuth);

const getSessionId = (req) => req.headers['x-session-id'] || 'anonymous';

router.post('/mpesa/init', async (req, res) => {
  try {
    const { phone, orderId, amount } = req.body;

    const order = await Order.findOne({ _id: orderId });
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
    if (req.user && order.user && order.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }
    if (!req.user && !order.sessionId && order.user) {
      return res.status(403).json({ success: false, message: 'Please log in to pay' });
    }
    if (order.payment.status === 'completed') return res.status(400).json({ success: false, message: 'Order already paid' });

    const token = await getAccessToken();
    const accountRef = orderId.slice(-12).toUpperCase();
    const result = await initiateSTKPush(phone, amount, accountRef, 'Sparkpretty Closet Payment', token);

    if (result.ResponseCode !== '0' && result.errorCode) {
      return res.status(400).json({ success: false, message: result.errorMessage || result.ResponseDescription || 'Failed to initiate payment' });
    }

    order.payment.checkoutRequestId = result.CheckoutRequestID || '';
    order.payment.merchantRequestId = result.MerchantRequestID || '';
    await order.save();

    res.json({
      success: true,
      data: {
        checkoutRequestId: result.CheckoutRequestID,
        merchantRequestId: result.MerchantRequestID,
        message: result.CustomerMessage || 'STK Push sent. Check your phone.',
      },
    });
  } catch (err) {
    console.error('STK push error:', err.message);
    res.status(500).json({ success: false, message: err.message });
  }
});

router.get('/mpesa/status/:checkoutRequestId', async (req, res) => {
  try {
    const order = await Order.findOne({ 'payment.checkoutRequestId': req.params.checkoutRequestId });
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
    res.json({ success: true, data: { status: order.payment.status, receipt: order.payment.mpesaReceipt } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.post('/mpesa/callback', async (req, res) => {
  res.json({ ResultCode: 0, ResultDesc: 'Accepted' });
  try {
    const cb = req.body?.Body?.stkCallback;
    if (!cb) return;

    const { ResultCode, ResultDesc, CheckoutRequestID, CallbackMetadata } = cb;
    const order = await Order.findOne({ 'payment.checkoutRequestId': CheckoutRequestID });
    if (!order) return;
    if (order.payment.status === 'completed') return;

    if (ResultCode === 0 && CallbackMetadata) {
      const items = CallbackMetadata.Item || [];
      const get = (name) => items.find((i) => i.Name === name)?.Value;
      order.payment.mpesaReceipt = get('MpesaReceiptNumber');
      order.payment.status = 'completed';
      order.status = 'paid';
      console.log('Payment completed for order', order._id, 'receipt', get('MpesaReceiptNumber'));
    } else {
      order.payment.status = 'failed';
      console.log('Payment failed:', ResultCode, ResultDesc);
    }
    await order.save();
  } catch (err) {
    console.error('M-Pesa callback error:', err.message);
  }
});

export default router;

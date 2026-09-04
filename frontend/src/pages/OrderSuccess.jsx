import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle, XCircle, Loader, ArrowRight, ShoppingBag } from 'lucide-react';
import { api, formatPrice } from '../lib/api';

export default function OrderSuccess() {
  const [searchParams] = useSearchParams();
  const checkoutRequestId = searchParams.get('checkoutRequestId');
  const [paymentStatus, setPaymentStatus] = useState(null);
  const [order, setOrder] = useState(null);

  useEffect(() => {
    if (!checkoutRequestId) return;

    const poll = async () => {
      try {
        const res = await api.get(`/payments/mpesa/status/${checkoutRequestId}`);
        setPaymentStatus(res.data?.status || 'pending');
        if (res.data?.status !== 'pending') clearInterval(interval);
      } catch { /* keep polling */ }
    };

    poll();
    const interval = setInterval(poll, 4000);
    return () => clearInterval(interval);
  }, [checkoutRequestId]);

  useEffect(() => {
    const orderId = searchParams.get('orderId');
    if (orderId) api.get(`/orders/${orderId}`).then((r) => setOrder(r.data)).catch(() => {});
  }, [searchParams]);

  const statusContent = {
    pending: { icon: <Loader className="animate-spin text-warning" size={72} />, title: 'Waiting for payment...', desc: 'Check your phone and enter your M-Pesa PIN to complete payment.' },
    completed: { icon: <CheckCircle className="text-success" size={72} />, title: 'Payment Confirmed!', desc: 'Thank you for your order. You\'ll receive a confirmation shortly.' },
    failed: { icon: <XCircle className="text-error" size={72} />, title: 'Payment Failed', desc: 'No payment was received. Please try again.' },
  };

  const current = statusContent[paymentStatus] || statusContent.pending;

  return (
    <div className="section-padding flex items-center justify-center min-h-[60vh]">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: 'spring', damping: 15 }}
        className="text-center max-w-md w-full"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: 'spring', damping: 10 }}
          className="mb-6 flex justify-center"
        >
          {current.icon}
        </motion.div>

        <h1 className="font-heading text-3xl font-bold mb-3">Order Placed!</h1>
        <p className="text-text-light mb-2">{current.title}</p>
        <p className="text-text-light mb-8">{current.desc}</p>

        {order && (
          <div className="card mb-6 text-left">
            <p className="text-sm text-text-light mb-1">Order #{String(order._id || '').slice(-8)}</p>
            {order.items?.map((item, i) => (
              <div key={i} className="flex justify-between text-sm py-1">
                <span className="text-text-light">{item.name} x{item.quantity}</span>
                <span>{formatPrice(item.price * item.quantity)}</span>
              </div>
            ))}
            <div className="border-t border-border mt-2 pt-2 flex justify-between font-bold">
              <span>Total</span>
              <span className="text-text">{formatPrice(order.total)}</span>
            </div>
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          {paymentStatus === 'failed' && (
            <Link to="/checkout" className="btn-primary flex items-center justify-center gap-2">
              <ShoppingBag size={16} /> Try Again
            </Link>
          )}
          <Link to="/account" className="btn-outline">My Orders</Link>
          <Link to="/shop" className="font-medium text-primary-dark hover:underline flex items-center justify-center gap-1">
            Continue Shopping <ArrowRight size={16} />
          </Link>
        </div>
      </motion.div>
    </div>
  );
}

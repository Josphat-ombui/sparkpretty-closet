import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { User, MapPin, CreditCard, ChevronRight, Check } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useContent } from '../context/ContentContext';
import { api, formatPrice } from '../lib/api';
import toast from 'react-hot-toast';

const steps = ['Shipping', 'Review', 'Payment'];

export default function Checkout() {
  const [step, setStep] = useState(0);
  const { get, num } = useContent();
  const [shipping, setShipping] = useState({ street: '', city: '', county: '', zip: '', country: get('default_country', 'Kenya') });
  const [phone, setPhone] = useState('');
  const [orderId, setOrderId] = useState(null);
  const [loading, setLoading] = useState(false);
  const { items, subtotal } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const freeShipThreshold = num('free_shipping_threshold', 5000);
  const shippingFee = num('shipping_fee', 350);
  const shippingCost = subtotal >= freeShipThreshold ? 0 : shippingFee;
  const total = subtotal + shippingCost;

  const handleCreateOrder = async () => {
    if (!shipping.street || !shipping.city || !shipping.county) { toast.error('Please fill in shipping details'); return; }
    setLoading(true);
    try {
      const res = await api.post('/orders', { shippingAddress: shipping });
      setOrderId(res.data._id);
      setStep(2);
    } catch (err) { toast.error(err.message); }
    setLoading(false);
  };

  const handleMpesaPayment = async () => {
    if (!phone) { toast.error('Enter your M-Pesa phone number'); return; }
    setLoading(true);
    try {
      const res = await api.post('/payments/mpesa/init', { phone, orderId, amount: total });
      const checkoutRequestId = res.data?.data?.checkoutRequestId || '';
      toast.success('Check your phone for the M-Pesa prompt');
      navigate(`/order-success?orderId=${orderId}&checkoutRequestId=${checkoutRequestId}`);
    } catch (err) { toast.error(err.message); }
    setLoading(false);
  };

  return (
    <div className="section-padding">
      <div className="max-w-4xl mx-auto">
        {/* Progress Steps */}
        <div className="flex items-center justify-center mb-12">
          {steps.map((s, i) => (
            <div key={s} className="flex items-center">
              <div className={`flex items-center gap-2 ${i <= step ? 'text-primary-dark' : 'text-text-muted'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                  i < step ? 'bg-secondary text-white' : i === step ? 'bg-secondary text-white' : 'bg-border text-text-muted'
                }`}>
                  {i < step ? <Check size={14} /> : i + 1}
                </div>
                <span className="hidden sm:inline text-sm font-medium">{s}</span>
              </div>
              {i < steps.length - 1 && <div className={`w-12 sm:w-20 h-0.5 mx-2 ${i < step ? 'bg-primary' : 'bg-border'}`} />}
            </div>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {/* Step 1: Shipping */}
          {step === 0 && (
            <motion.div key="shipping" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <h2 className="font-heading text-2xl font-bold mb-6 flex items-center gap-2"><MapPin size={24} /> Shipping Details</h2>
              <div className="card space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Street Address *</label>
                  <input className="input-field" value={shipping.street} onChange={(e) => setShipping({ ...shipping, street: e.target.value })} placeholder="123 Fashion Lane" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">City *</label>
                    <input className="input-field" value={shipping.city} onChange={(e) => setShipping({ ...shipping, city: e.target.value })} placeholder="Nairobi" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">County *</label>
                    <input className="input-field" value={shipping.county} onChange={(e) => setShipping({ ...shipping, county: e.target.value })} placeholder="Nairobi" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">ZIP Code</label>
                    <input className="input-field" value={shipping.zip} onChange={(e) => setShipping({ ...shipping, zip: e.target.value })} placeholder="00100" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Country</label>
                    <input className="input-field" value={shipping.country} disabled />
                  </div>
                </div>
                <button onClick={() => { if (!shipping.street || !shipping.city || !shipping.county) { toast.error('Fill required fields'); return; } setStep(1); }} className="btn-primary w-full flex items-center justify-center gap-2 mt-4">
                  Continue to Review <ChevronRight size={16} />
                </button>
              </div>
            </motion.div>
          )}

          {/* Step 2: Review */}
          {step === 1 && (
            <motion.div key="review" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <h2 className="font-heading text-2xl font-bold mb-6 flex items-center gap-2"><User size={24} /> Review Order</h2>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="card">
                  <h3 className="font-semibold mb-3">Shipping To</h3>
                  <p className="text-text-light text-sm">{shipping.street}<br />{shipping.city}, {shipping.county} {shipping.zip}<br />{shipping.country}</p>
                  <button onClick={() => setStep(0)} className="text-primary-dark text-sm font-medium mt-2 hover:underline">Edit</button>
                </div>
                <div className="card">
                  <h3 className="font-semibold mb-3">Order Summary</h3>
                  <div className="space-y-2 text-sm">
                    {items.map((item) => (
                      <div key={item._id} className="flex justify-between">
                        <span className="text-text-light">{item.product?.name} x{item.quantity}</span>
                        <span>{formatPrice(item.price * item.quantity)}</span>
                      </div>
                    ))}
                    <div className="border-t border-border pt-2 flex justify-between">
                      <span className="text-text-light">Shipping</span>
                      <span>{shippingCost === 0 ? 'Free' : formatPrice(shippingCost)}</span>
                    </div>
                    <div className="border-t border-border pt-2 flex justify-between text-lg font-bold">
                      <span>Total</span>
                      <span className="text-text">{formatPrice(total)}</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex gap-4 mt-6">
                <button onClick={() => setStep(0)} className="btn-outline flex-1">Back</button>
                <button onClick={handleCreateOrder} disabled={loading} className="btn-primary flex-1 flex items-center justify-center gap-2">
                  {loading ? 'Creating Order...' : 'Place Order'}
                </button>
              </div>
            </motion.div>
          )}

          {/* Step 3: Payment */}
          {step === 2 && (
            <motion.div key="payment" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <h2 className="font-heading text-2xl font-bold mb-6 flex items-center gap-2"><CreditCard size={24} /> M-Pesa Payment</h2>
              <div className="card max-w-md mx-auto text-center">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <CreditCard size={28} className="text-primary-dark" />
                </div>
                <p className="text-text-light mb-6">Enter your M-Pesa number to receive a payment prompt.</p>
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-1 text-left">Phone Number</label>
                  <input
                    type="tel"
                    className="input-field text-center text-lg tracking-wide"
                    placeholder="0712345678"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                  <p className="text-xs text-text-muted mt-1">Format: 07XXXXXXXX or 254XXXXXXXXX</p>
                </div>
                <p className="text-2xl font-bold text-text mb-6">{formatPrice(total)}</p>
                <button onClick={handleMpesaPayment} disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2">
                  {loading ? 'Processing...' : 'Pay with M-Pesa'}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Minus, Plus, Trash2, ShoppingBag, ArrowRight } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useContent } from '../context/ContentContext';
import { formatPrice } from '../lib/api';

export default function Cart() {
  const { items, updateItem, removeItem, subtotal, count } = useCart();
  const { get, num } = useContent();
  const freeShipThreshold = num('free_shipping_threshold', 5000);
  const shippingFee = num('shipping_fee', 350);

  if (items.length === 0) {
    return (
      <div className="section-padding text-center">
        <ShoppingBag size={64} className="mx-auto text-border mb-6" />
        <h1 className="font-heading text-3xl font-bold mb-4">Your Bag is Empty</h1>
        <p className="text-text-light mb-8">{get('cart_empty_text', 'Discover something beautiful for yourself.')}</p>
        <Link to="/shop" className="btn-primary inline-flex items-center gap-2">
          Start Shopping <ArrowRight size={16} />
        </Link>
      </div>
    );
  }

  return (
    <div className="section-padding">
      <div className="max-w-5xl mx-auto">
        <h1 className="font-heading text-3xl md:text-4xl font-bold mb-8">Your Bag ({count})</h1>
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Items */}
          <div className="lg:col-span-2 space-y-4">
            {items.map((item, i) => (
              <motion.div
                key={item._id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="card flex gap-4 p-4"
              >
                <div className="w-24 h-28 rounded-lg bg-gradient-to-br from-primary/5 to-primary/10 flex items-center justify-center text-primary/30 text-xs flex-shrink-0">
                  {item.color}
                </div>
                <div className="flex-1 min-w-0">
                  <Link to={`/product/${item.product?.slug}`} className="font-medium hover:text-primary-dark transition-colors truncate block">
                    {item.product?.name || 'Product'}
                  </Link>
                  <p className="text-sm text-text-light mt-1">{item.size} / {item.color}</p>
                  <p className="text-text font-bold mt-1">{formatPrice(item.price)}</p>
                  <div className="flex items-center gap-3 mt-3">
                    <div className="flex items-center border border-border rounded-lg">
                      <button onClick={() => updateItem(item._id, item.quantity - 1)} className="p-2 hover:text-primary-dark transition-colors">
                        <Minus size={14} />
                      </button>
                      <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                      <button onClick={() => updateItem(item._id, item.quantity + 1)} className="p-2 hover:text-primary-dark transition-colors">
                        <Plus size={14} />
                      </button>
                    </div>
                    <button onClick={() => removeItem(item._id)} className="p-2 text-text-light hover:text-error transition-colors">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
                <div className="text-right">
                  <span className="font-bold">{formatPrice(item.price * item.quantity)}</span>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Summary */}
          <div className="lg:col-span-1">
            <div className="card sticky top-24">
              <h2 className="font-heading text-xl font-bold mb-6">Order Summary</h2>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-text-light">Subtotal</span>
                  <span className="font-medium">{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-light">Shipping</span>
                  <span className="font-medium">{subtotal >= freeShipThreshold ? 'Free' : formatPrice(shippingFee)}</span>
                </div>
                <div className="border-t border-border pt-3 flex justify-between text-lg font-bold">
                  <span>Total</span>
                  <span className="text-text">{formatPrice(subtotal + (subtotal >= freeShipThreshold ? 0 : shippingFee))}</span>
                </div>
              </div>
              {subtotal < freeShipThreshold && (
                <p className="text-xs text-text-light mt-3 text-center">
                  Add {formatPrice(freeShipThreshold - subtotal)} more for free shipping!
                </p>
              )}
              <Link to="/checkout" className="btn-primary w-full text-center mt-6 block">
                Proceed to Checkout
              </Link>
              <Link to="/shop" className="text-primary-dark text-sm font-medium block text-center mt-4 hover:underline">
                Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

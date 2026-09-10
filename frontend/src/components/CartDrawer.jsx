import { AnimatePresence, motion } from 'framer-motion';
import { X, Minus, Plus, ShoppingBag } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useContent } from '../context/ContentContext';
import { formatPrice } from '../lib/api';
import { Link } from 'react-router-dom';

export default function CartDrawer() {
  const { items, isOpen, setIsOpen, updateItem, removeItem, subtotal, count } = useCart();
  const { num } = useContent();
  const freeShipThreshold = num('free_shipping_threshold', 5000);
  const shippingFee = num('shipping_fee', 350);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 z-50"
            onClick={() => setIsOpen(false)}
          />
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 bottom-0 w-full max-w-md bg-white z-50 shadow-modal flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-border">
              <div className="flex items-center gap-2">
                <ShoppingBag size={20} className="text-text" />
                <h2 className="font-heading text-xl font-bold">Your Bag ({count})</h2>
              </div>
              <button onClick={() => setIsOpen(false)} className="p-1 hover:text-primary-dark transition-colors">
                <X size={24} />
              </button>
            </div>

            {/* Items */}
            <div className="flex-1 overflow-y-auto p-6">
              {items.length === 0 ? (
                <div className="text-center py-16">
                  <ShoppingBag size={48} className="mx-auto text-border mb-4" />
                  <p className="text-text-light mb-4">Your bag is empty</p>
                  <Link to="/shop" onClick={() => setIsOpen(false)} className="btn-primary inline-block">
                    Start Shopping
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {items.map((item) => (
                    <motion.div
                      key={item._id}
                      layout
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: 100 }}
                      className="flex gap-4 p-4 bg-bg rounded-card"
                    >
                      <div className="w-20 h-24 rounded-lg overflow-hidden flex-shrink-0 bg-primary/10">
                        <div className="w-full h-full flex items-center justify-center text-secondary text-xs font-medium">
                          {item.color}
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-sm truncate">{item.product?.name || 'Product'}</h4>
                        <p className="text-xs text-text-light mt-1">{item.size} / {item.color}</p>
                        <p className="text-sm font-semibold text-text mt-1">{formatPrice(item.price)}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <button
                            onClick={() => updateItem(item._id, item.quantity - 1)}
                            className="w-7 h-7 rounded-full border border-border flex items-center justify-center hover:border-primary transition-colors"
                          >
                            <Minus size={12} />
                          </button>
                          <span className="text-sm font-medium w-6 text-center">{item.quantity}</span>
                          <button
                            onClick={() => updateItem(item._id, item.quantity + 1)}
                            className="w-7 h-7 rounded-full border border-border flex items-center justify-center hover:border-primary transition-colors"
                          >
                            <Plus size={12} />
                          </button>
                          <button
                            onClick={() => removeItem(item._id)}
                            className="ml-auto text-xs text-text-light hover:text-error transition-colors"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            {items.length > 0 && (
              <div className="p-6 border-t border-border">
                <div className="flex justify-between mb-2 text-sm">
                  <span className="text-text-light">Subtotal</span>
                  <span className="font-semibold">{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between mb-4 text-sm">
                  <span className="text-text-light">Shipping</span>
                  <span className="font-semibold">{subtotal >= freeShipThreshold ? 'Free' : formatPrice(shippingFee)}</span>
                </div>
                <div className="flex justify-between mb-6 text-lg font-bold">
                  <span>Total</span>
                  <span className="text-text">{formatPrice(subtotal + (subtotal >= freeShipThreshold ? 0 : shippingFee))}</span>
                </div>
                <Link to="/checkout" onClick={() => setIsOpen(false)} className="btn-primary w-full text-center block">
                  Proceed to Checkout
                </Link>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

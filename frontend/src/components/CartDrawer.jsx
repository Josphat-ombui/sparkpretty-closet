import { X, Minus, Plus, ShoppingBag } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useContent } from '../context/ContentContext';
import { formatPrice } from '../lib/api';
import { Link } from 'react-router-dom';
import ProductImg from './ProductImg';

export default function CartDrawer() {
  const { items, isOpen, setIsOpen, updateItem, removeItem, subtotal, count } = useCart();
  const { num } = useContent();
  const freeShipThreshold = num('free_shipping_threshold', 5000);
  const shippingFee = num('shipping_fee', 350);

  return (
    isOpen && (
      <>
        <div
          className="fixed inset-0 bg-black/40 z-50"
          onClick={() => setIsOpen(false)}
          aria-hidden="true"
        />
        <div
          className="fixed top-0 right-0 bottom-0 w-full max-w-md bg-white z-50 shadow-modal flex flex-col"
          role="dialog"
          aria-label="Shopping bag"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-border">
            <div className="flex items-center gap-2">
              <ShoppingBag size={20} className="text-text" />
              <h2 className="font-heading text-xl font-bold">Your Bag ({count})</h2>
            </div>
            <button onClick={() => setIsOpen(false)} className="p-1 hover:text-primary-dark transition-colors" aria-label="Close shopping bag">
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
                  <div key={item._id} className="flex gap-4 p-4 bg-bg rounded-card">
                    <Link
                      to={`/product/${item.product?.slug}`}
                      onClick={() => setIsOpen(false)}
                      className="w-20 h-24 rounded-lg overflow-hidden flex-shrink-0 relative bg-primary/5"
                      aria-label={`View ${item.product?.name || 'product'}`}
                    >
                      <ProductImg
                        product={item.product}
                        variant={item.product?.variants?.[item.variantIndex] || item.product?.variants?.[0]}
                        className="w-full h-full text-[9px] text-center p-1"
                        imgClassName="w-full h-full object-cover"
                      />
                    </Link>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-sm truncate">{item.product?.name || 'Product'}</h4>
                      <p className="text-xs text-text-light mt-1">{item.size} / {item.color}</p>
                      <p className="text-sm font-semibold text-text mt-1">{formatPrice(item.price)}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <button
                          onClick={() => updateItem(item._id, item.quantity - 1)}
                          className="w-7 h-7 rounded-full border border-border flex items-center justify-center hover:border-primary transition-colors"
                          aria-label={`Decrease ${item.product?.name || 'item'} quantity`}
                        >
                          <Minus size={12} />
                        </button>
                        <span className="text-sm font-medium w-6 text-center">{item.quantity}</span>
                        <button
                          onClick={() => updateItem(item._id, item.quantity + 1)}
                          className="w-7 h-7 rounded-full border border-border flex items-center justify-center hover:border-primary transition-colors"
                          aria-label={`Increase ${item.product?.name || 'item'} quantity`}
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
                  </div>
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
        </div>
      </>
    )
  );
}
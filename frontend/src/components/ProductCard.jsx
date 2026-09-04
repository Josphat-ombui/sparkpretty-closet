import { Link } from 'react-router-dom';
import { ShoppingBag } from 'lucide-react';
import { formatPrice } from '../lib/api';
import { useCart } from '../context/CartContext';
import toast from 'react-hot-toast';

export default function ProductCard({ product }) {
  const { addItem } = useCart();
  const variant = product.variants?.[0] || {};
  const price = variant.price || 0;
  const salePrice = variant.salePrice;
  const inStock = variant.stock > 0;

  const handleAdd = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!inStock) return toast.error('Out of stock');
    addItem(product._id, 0);
    toast.success(`${product.name} added to bag!`);
  };

  return (
    <Link to={`/product/${product.slug}`} className="group card card-hover p-0 overflow-hidden block">
      <div className="aspect-[3/4] bg-gradient-to-br from-primary/5 to-primary/10 relative overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center text-primary/30 font-heading text-base px-4 text-center">
          {product.name}
        </div>
        {salePrice && (
          <span className="absolute top-3 left-3 bg-error text-white text-xs font-bold px-2 py-1 rounded-full z-10">
            Sale
          </span>
        )}
        <button
          onClick={handleAdd}
          disabled={!inStock}
          className="absolute bottom-3 right-3 w-10 h-10 bg-white rounded-full shadow-card flex items-center justify-center
                     opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0
                     transition-all duration-300 hover:bg-primary hover:text-white z-10 disabled:opacity-50"
        >
          <ShoppingBag size={16} />
        </button>
      </div>
      <div className="p-4">
        {product.category && (
          <p className="text-xs text-text-muted uppercase tracking-wider mb-1">{product.category.name}</p>
        )}
        <h3 className="font-medium text-sm truncate group-hover:text-primary-dark transition-colors">{product.name}</h3>
        <div className="flex items-center gap-2 mt-2">
          <span className="font-bold text-text">{formatPrice(salePrice || price)}</span>
          {salePrice && <span className="text-text-light text-sm line-through">{formatPrice(price)}</span>}
        </div>
        {variant.color && (
          <div className="flex items-center gap-1 mt-2">
            <span className="w-3 h-3 rounded-full border border-border" style={{ backgroundColor: variant.colorHex || '#ccc' }} />
            <span className="text-xs text-text-light">{variant.color}</span>
          </div>
        )}
      </div>
    </Link>
  );
}

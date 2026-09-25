import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { X, Minus, Plus, ShoppingBag, ExternalLink, Star } from 'lucide-react';
import toast from 'react-hot-toast';
import { formatPrice } from '../lib/api';
import { useCart } from '../context/CartContext';

const placeholder = 'https://placehold.co/600x800/C2185B/FFFFFF?text=Sparkpretty';

export default function QuickView({ product, onClose }) {
  const { addItem } = useCart();
  const [qty, setQty] = useState(1);

  const variants = product?.variants || [];
  const colors = useMemo(
    () => [...new Map(variants.map((v) => [String(v.color), { color: v.color, colorHex: v.colorHex || '#000000' }])).values()],
    [variants]
  );
  const [color, setColor] = useState(colors[0]?.color || '');
  const sizes = useMemo(
    () => [...new Set(variants.filter((v) => v.color === color).map((v) => v.size))],
    [variants, color]
  );
  const [size, setSize] = useState('');
  const [activeImage, setActiveImage] = useState(product?.coverImage || '');
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!product || !color) return;
    if (!sizes.includes(size)) setSize(sizes[0]);
  }, [product, color, sizes, size]);

  useEffect(() => {
    setColor(colors[0]?.color || '');
    setActiveImage(product?.coverImage || variants.flatMap((v) => v.images || [])[0] || '');
    setQty(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [product?._id]);

  const chosen = useMemo(
    () => variants.find((v) => v.color === color && v.size === size) || variants.find((v) => v.color === color) || variants[0],
    [variants, color, size]
  );
  const variantIndex = variants.indexOf(chosen);

  const images = useMemo(() => [...new Set(variants.flatMap((v) => v.images || []))], [variants]);
  const badge = useMemo(() => {
    if (!chosen) return null;
    const d = chosen.salePrice > 0 ? Math.round((1 - chosen.salePrice / chosen.price) * 100) : 0;
    if (d >= 10) return { text: `-${d}%`, tone: 'bg-error text-white' };
    if (product.tags?.includes('new')) return { text: 'New', tone: 'bg-success text-white' };
    if (product.tags?.includes('bestseller')) return { text: 'Best Seller', tone: 'bg-primary text-white' };
    return null;
  }, [chosen, product.tags]);
  const inStock = chosen?.stock > 0;

  if (!product) return null;

  const showImage = activeImage || chosen?.images?.[0] || images[0] || placeholder;

  const addToBag = async () => {
    if (!inStock) return toast.error('This variant is out of stock');
    await addItem(product._id, variantIndex, qty);
    toast.success(`${product.name} added to bag`);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-label={`${product.name} quick view`}>
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} aria-hidden="true" />
      <div className="relative w-full max-w-4xl max-h-[90vh] overflow-hidden bg-white rounded-2xl shadow-modal animate-scale-in">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 z-10 w-9 h-9 rounded-full bg-black/5 text-text hover:bg-black/10 hover:text-black transition-colors flex items-center justify-center"
          aria-label="Close quick view"
        >
          <X size={18} />
        </button>

        <div className="grid md:grid-cols-2 max-h-[90vh] overflow-y-auto">
          {/* Image preview */}
          <div className="relative bg-bg">
            <div className="img-zoom aspect-[3/4]">
              <img
                src={showImage}
                alt={product.name}
                className={`w-full h-full object-cover transition-opacity duration-500 ${loaded ? 'opacity-100' : 'opacity-0'}`}
                onLoad={() => setLoaded(true)}
                loading="eager"
              />
            </div>
            {badge && (
              <span className={`absolute top-3 left-3 text-xs font-bold px-2.5 py-1 rounded-full ${badge.tone}`}>{badge.text}</span>
            )}
            <div className="flex gap-2 p-3 overflow-x-auto bg-white/60 backdrop-blur">
              {images.length > 0 ? images.map((img, i) => (
                <button
                  key={`${img}-${i}`}
                  onClick={() => setActiveImage(img)}
                  className={`w-14 h-16 rounded-lg overflow-hidden border-2 shrink-0 transition-colors ${showImage === img ? 'border-primary' : 'border-transparent opacity-70 hover:opacity-100'}`}
                  aria-label={`View image ${i + 1}`}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" loading="lazy" onError={(e) => { e.currentTarget.src = placeholder; }} />
                </button>
              )) : null}
            </div>
          </div>

          {/* Buy box */}
          <div className="p-6 md:p-8 flex flex-col">
            <div className="flex items-center gap-2 text-xs text-text-muted mb-2">
              {product.category?.name && (
                <Link to={`/shop?category=${product.category.slug}`} onClick={onClose} className="uppercase tracking-[0.14em] font-semibold text-secondary hover:underline">
                  {product.category.name}
                </Link>
              )}
              {product.active === false && <span className="px-2 py-0.5 rounded-full bg-warning/10 text-warning font-semibold">Hidden</span>}
            </div>

            <Link to={`/product/${product.slug}`} onClick={onClose}>
              <h2 className="font-heading text-2xl md:text-3xl font-bold leading-tight hover:text-primary transition-colors">{product.name}</h2>
            </Link>

            {product.avgRating > 0 && (
              <div className="flex items-center gap-1.5 mt-2 text-sm">
                <span className="flex text-warning">{[1, 2, 3, 4, 5].map((s) => <Star key={s} size={14} className={s <= Math.round(product.avgRating) ? 'fill-warning text-warning' : 'text-border'} />)}</span>
                <span className="text-text-light">{product.avgRating}</span>
                <span className="text-text-muted">({product.reviewCount})</span>
              </div>
            )}

            <div className="mt-3 flex items-end gap-3">
              <span className={`text-3xl font-bold ${chosen?.salePrice > 0 ? 'text-error' : 'text-text'}`}>
                {chosen ? formatPrice(chosen.salePrice > 0 ? chosen.salePrice : chosen.price) : '—'}
              </span>
              {chosen?.salePrice > 0 && <span className="text-lg text-text-muted line-through">{formatPrice(chosen.price)}</span>}
            </div>

            {product.description && <p className="text-sm text-text-light leading-relaxed mt-4 line-clamp-3">{product.description}</p>}

            {/* Color swatches */}
            {colors.length > 1 && (
              <div className="mt-5">
                <p className="text-xs font-semibold uppercase tracking-wider text-text-muted mb-2">Colour · <span className="text-text">{color}</span></p>
                <div className="flex gap-2 flex-wrap">
                  {colors.map((c) => (
                    <button
                      key={c.color}
                      onClick={() => setColor(c.color)}
                      className={`w-8 h-8 rounded-full border-2 transition-all ${color === c.color ? 'border-primary ring-2 ring-primary/25 scale-105' : 'border-border hover:scale-105'}`}
                      style={{ backgroundColor: c.colorHex }}
                      aria-label={`Select ${c.color}`}
                      title={c.color}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Sizes */}
            {sizes.length > 0 && (
              <div className="mt-5">
                <p className="text-xs font-semibold uppercase tracking-wider text-text-muted mb-2">Size · <span className="text-text">{size || 'Select'}</span></p>
                <div className="flex gap-2 flex-wrap">
                  {sizes.map((s) => (
                    <button
                      key={s}
                      onClick={() => setSize(s)}
                      className={`min-w-[2.5rem] h-10 px-3 rounded-lg border text-sm font-medium transition-all ${size === s ? 'border-primary bg-primary text-white shadow-button' : 'border-border bg-white hover:border-primary/60'}`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Qty + add */}
            <div className="flex items-center gap-3 mt-6">
              <div className="flex items-center border border-border rounded-lg h-12">
                <button onClick={() => setQty(Math.max(1, qty - 1))} className="w-11 h-full flex items-center justify-center text-text-light hover:text-primary transition-colors" aria-label="Decrease quantity"><Minus size={15} /></button>
                <span className="w-8 text-center font-semibold">{qty}</span>
                <button onClick={() => setQty(qty + 1)} className="w-11 h-full flex items-center justify-center text-text-light hover:text-primary transition-colors" aria-label="Increase quantity"><Plus size={15} /></button>
              </div>
              <button onClick={addToBag} disabled={!inStock} className="btn-primary flex-1 h-12 disabled:opacity-50">
                <ShoppingBag size={16} /> {inStock ? (chosen?.stock <= 5 ? `Buy now — only ${chosen.stock} left` : 'Add to Bag') : 'Out of stock'}
              </button>
            </div>

            <div className="mt-4 flex items-center gap-4 text-xs text-text-muted">
              <span className="inline-flex items-center gap-1"><Star size={13} className="text-warning" /> {product.avgRating > 0 ? product.avgRating : 'New'} rating</span>
              <span className={inStock ? (chosen.stock <= 5 ? 'text-warning font-medium' : 'text-success font-medium') : 'text-error font-medium'}>
                {inStock ? (chosen.stock <= 5 ? `Only ${chosen.stock} left` : 'In stock') : 'Out of stock'}
              </span>
            </div>

            <Link to={`/product/${product.slug}`} onClick={onClose} className="inline-flex items-center justify-center gap-2 mt-4 text-secondary font-semibold text-sm hover:gap-3 transition-all">
              View full details <ExternalLink size={14} />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
import { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ShoppingBag, Minus, Plus, ChevronRight, ChevronLeft, Star, Heart,
  Package, Truck, RotateCcw, Shield, MessageCircle, Share2, Check,
} from 'lucide-react';
import { api, formatPrice } from '../lib/api';
import { useCart } from '../context/CartContext';
import SEO from '../components/SEO';
import toast from 'react-hot-toast';

const fadeUp = { hidden: { opacity: 0, y: 20 }, visible: { delay: 0.1, duration: 0.5 } };

export default function ProductDetail() {
  const { slug } = useParams();
  const [product, setProduct] = useState(null);
  const [selectedVariant, setSelectedVariant] = useState(0);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [wishlist, setWishlist] = useState(false);
  const [activeTab, setActiveTab] = useState('details');
  const [reviewForm, setReviewForm] = useState({ name: '', rating: 5, title: '', comment: '' });
  const [zooming, setZooming] = useState(false);
  const [zoomPos, setZoomPos] = useState({ x: 50, y: 50 });
  const imgRef = useRef(null);
  const { addItem, loading: cartLoading } = useCart();

  useEffect(() => {
    setLoading(true);
    api.get(`/products/${slug}`).then((r) => setProduct(r.data)).finally(() => setLoading(false));
    window.scrollTo(0, 0);
  }, [slug]);

  if (loading) return (
    <div className="section-padding max-w-7xl mx-auto">
      <div className="grid md:grid-cols-2 gap-8">
        <div className="aspect-square skeleton" />
        <div className="space-y-4"><div className="skeleton h-8 w-3/4" /><div className="skeleton h-4 w-1/2" /><div className="skeleton h-10 w-1/3" /><div className="skeleton h-12 w-full" /></div>
      </div>
    </div>
  );
  if (!product) return <div className="section-padding text-center text-text-light">Product not found</div>;

  const variant = product.variants[selectedVariant];
  const allImages = product.variants.flatMap((v) => v.images).filter(Boolean);
  const uniqueColors = [...new Set(product.variants.map((v) => v.color))];
  const sizesForColor = product.variants.filter((v) => v.color === variant.color);

  const handleAdd = () => {
    if (variant.stock < quantity) return toast.error('Not enough stock');
    addItem(product._id, selectedVariant, quantity);
    toast.success(`${product.name} added to bag!`);
  };

  const handleMouseMove = (e) => {
    if (!imgRef.current) return;
    const rect = imgRef.current.getBoundingClientRect();
    setZoomPos({
      x: ((e.clientX - rect.left) / rect.width) * 100,
      y: ((e.clientY - rect.top) / rect.height) * 100,
    });
  };

  const shareProduct = () => {
    if (navigator.share) navigator.share({ title: product.name, url: window.location.href });
    else navigator.clipboard.writeText(window.location.href);
    toast.success('Link copied!');
  };

  return (
    <div>
      <SEO
        title={product.name}
        description={product.description?.slice(0, 160) || product.name}
        image={allImages[0]}
        url={`/product/${slug}`}
        type="product"
      />

      <div className="section-padding">
        <div className="max-w-7xl mx-auto">
          <nav className="flex items-center gap-2 text-sm text-text-light mb-8">
            <Link to="/" className="hover:text-primary-dark">Home</Link>
            <ChevronRight size={14} />
            <Link to="/shop" className="hover:text-primary-dark">Shop</Link>
            <ChevronRight size={14} />
            <span className="text-text">{product.name}</span>
          </nav>

          <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
            {/* Image Gallery */}
            <motion.div initial="hidden" animate="visible" variants={fadeUp}>
              {/* Main Image with Zoom */}
              <div
                ref={imgRef}
                className="aspect-square bg-gradient-to-br from-primary/5 to-primary/10 rounded-card overflow-hidden relative cursor-zoom-in"
                onMouseEnter={() => setZooming(true)}
                onMouseLeave={() => setZooming(false)}
                onMouseMove={handleMouseMove}
              >
                {allImages[selectedImage] ? (
                  <img
                    src={allImages[selectedImage]}
                    alt={product.name}
                    className={`w-full h-full object-cover transition-transform duration-200 ${zooming ? 'scale-150' : ''}`}
                    style={zooming ? { transformOrigin: `${zoomPos.x}% ${zoomPos.y}%` } : {}}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-primary/20 font-heading text-xl px-8 text-center">
                    {product.name}
                  </div>
                )}
                {zooming && (
                  <div className="absolute inset-0 border-2 border-primary/20 rounded-card pointer-events-none" />
                )}
              </div>

              {/* Thumbnails */}
              {allImages.length > 1 && (
                <div className="flex gap-2 mt-3 overflow-x-auto pb-1">
                  {allImages.map((img, i) => (
                    <button
                      key={i}
                      onClick={() => setSelectedImage(i)}
                      className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all ${
                        selectedImage === i ? 'border-primary' : 'border-border hover:border-primary/30'
                      }`}
                    >
                      <img src={img} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}

              {/* Image navigation arrows */}
              {allImages.length > 1 && (
                <div className="flex gap-2 mt-3">
                  <button
                    onClick={() => setSelectedImage((prev) => (prev === 0 ? allImages.length - 1 : prev - 1))}
                    className="p-2 rounded-lg border border-border hover:bg-bg transition-all"
                  >
                    <ChevronLeft size={16} />
                  </button>
                  <button
                    onClick={() => setSelectedImage((prev) => (prev === allImages.length - 1 ? 0 : prev + 1))}
                    className="p-2 rounded-lg border border-border hover:bg-bg transition-all"
                  >
                    <ChevronRight size={16} />
                  </button>
                  <span className="text-xs text-text-muted self-center ml-2">{selectedImage + 1} / {allImages.length}</span>
                </div>
              )}
            </motion.div>

            {/* Product Info */}
            <motion.div initial="hidden" animate="visible" variants={{ hidden: { opacity: 0, x: 20 }, visible: { opacity: 1, x: 0, transition: { delay: 0.15, duration: 0.5 } } }} className="flex flex-col">
              <p className="text-sm text-text-muted uppercase tracking-wider mb-2">{product.category?.name}</p>
              <div className="flex items-start justify-between gap-4 mb-2">
                <h1 className="font-heading text-3xl md:text-4xl font-bold">{product.name}</h1>
                <div className="flex gap-2">
                  <button onClick={() => setWishlist(!wishlist)} className={`p-2 rounded-lg border transition-all ${wishlist ? 'bg-secondary text-white border-primary' : 'border-border hover:border-primary/30'}`}>
                    <Heart size={18} fill={wishlist ? 'currentColor' : 'none'} />
                  </button>
                  <button onClick={shareProduct} className="p-2 rounded-lg border border-border hover:border-primary/30 transition-all">
                    <Share2 size={18} />
                  </button>
                </div>
              </div>

              {/* Rating */}
              {product.reviewCount > 0 && (
                <div className="flex items-center gap-2 mb-4">
                  <div className="flex">{[1, 2, 3, 4, 5].map((s) => <Star key={s} size={14} className={s <= Math.round(product.avgRating) ? 'fill-warning text-warning' : 'text-text-muted'} />)}</div>
                  <span className="text-sm font-medium">{product.avgRating}</span>
                  <span className="text-sm text-text-light">({product.reviewCount} reviews)</span>
                </div>
              )}

              <div className="flex items-center gap-3 mb-6">
                <span className="text-2xl font-bold text-text">{formatPrice(variant.salePrice || variant.price)}</span>
                {variant.salePrice && <span className="text-lg text-text-light line-through">{formatPrice(variant.price)}</span>}
              </div>

              {/* Color Selector */}
              <div className="mb-6">
                <h3 className="text-sm font-semibold mb-3">Color: <span className="font-normal text-text-light">{variant.color}</span></h3>
                <div className="flex gap-2">
                  {uniqueColors.map((color) => {
                    const v = product.variants.find((vv) => vv.color === color);
                    const idx = product.variants.findIndex((vv) => vv.color === color);
                    return (
                      <button
                        key={color}
                        onClick={() => { setSelectedVariant(idx); setSelectedImage(0); }}
                        className={`w-10 h-10 rounded-full border-2 transition-all ${variant.color === color ? 'border-primary scale-110 ring-2 ring-primary/20' : 'border-border hover:border-primary/50'}`}
                        style={{ backgroundColor: v.colorHex || '#ccc' }}
                        title={color}
                      />
                    );
                  })}
                </div>
              </div>

              {/* Size Selector */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold">Size: <span className="font-normal text-text-light">{variant.size}</span></h3>
                  <Link to="/size-guide" className="text-xs text-primary-dark hover:underline">Size Guide</Link>
                </div>
                <div className="flex flex-wrap gap-2">
                  {sizesForColor.map((v) => {
                    const idx = product.variants.findIndex((vv) => vv.size === v.size && vv.color === v.color);
                    return (
                      <button
                        key={v.size}
                        onClick={() => { setSelectedVariant(idx); setSelectedImage(0); }}
                        disabled={v.stock === 0}
                        className={`px-4 py-2 rounded-lg text-sm font-medium border transition-all ${variant.size === v.size ? 'bg-secondary text-white border-primary' : v.stock === 0 ? 'border-border text-text-muted line-through cursor-not-allowed' : 'border-border text-text hover:border-primary hover:text-secondary'}`}
                      >
                        {v.size}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Stock */}
              <div className="mb-4">
                {variant.stock > 10 ? (
                  <span className="text-sm text-success font-medium flex items-center gap-1"><Check size={14} /> In Stock</span>
                ) : variant.stock > 0 ? (
                  <span className="text-sm text-warning font-medium">Only {variant.stock} left</span>
                ) : (
                  <span className="text-sm text-error font-medium">Out of Stock</span>
                )}
              </div>

              {/* Quantity + Add to Cart */}
              <div className="flex items-center gap-4 mb-6">
                <div className="flex items-center border border-border rounded-lg">
                  <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="p-3 hover:text-secondary transition-colors"><Minus size={16} /></button>
                  <span className="w-12 text-center font-medium">{quantity}</span>
                  <button onClick={() => setQuantity(quantity + 1)} className="p-3 hover:text-secondary transition-colors"><Plus size={16} /></button>
                </div>
                <button onClick={handleAdd} disabled={variant.stock === 0 || cartLoading} className="flex-1 btn-primary py-3 flex items-center justify-center gap-2 disabled:opacity-50">
                  <ShoppingBag size={18} /> {variant.stock === 0 ? 'Out of Stock' : 'Add to Bag'}
                </button>
              </div>

              {/* Trust Signals */}
              <div className="grid grid-cols-3 gap-3 mb-6">
                {[
                  { icon: <Truck size={16} />, text: 'Free shipping 5K+' },
                  { icon: <RotateCcw size={16} />, text: '7-day returns' },
                  { icon: <Shield size={16} />, text: 'Secure pay' },
                ].map((item) => (
                  <div key={item.text} className="flex flex-col items-center text-center text-xs text-text-light gap-1 p-2 bg-bg rounded-lg">
                    <span className="text-secondary">{item.icon}</span>
                    {item.text}
                  </div>
                ))}
              </div>

              {/* WhatsApp CTA */}
              <a href={`https://wa.me/254729366991?text=Hi, I'm interested in ${product.name}`} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2 text-sm text-primary-dark font-medium border border-primary/30 rounded-lg py-2.5 hover:bg-primary/5 transition-all mb-6">
                <MessageCircle size={16} /> Ask about this item
              </a>

              {/* Description */}
              {product.description && (
                <div className="border-t border-border pt-4">
                  <h3 className="font-semibold mb-2">Description</h3>
                  <p className="text-text-light text-sm leading-relaxed">{product.description}</p>
                </div>
              )}
              {variant.sku && (
                <p className="text-xs text-text-muted mt-3 flex items-center gap-1"><Package size={12} /> SKU: {variant.sku}</p>
              )}
            </motion.div>
          </div>

          {/* Tabs: Details / Reviews */}
          <div className="mt-16">
            <div className="flex gap-6 border-b border-border mb-8">
              {['details', 'reviews'].map((tab) => (
                <button key={tab} onClick={() => setActiveTab(tab)} className={`pb-3 text-sm font-semibold border-b-2 transition-all capitalize ${activeTab === tab ? 'border-primary text-primary-dark' : 'border-transparent text-text-light hover:text-primary-dark'}`}>
                  {tab === 'reviews' ? `Reviews (${product.reviewCount || 0})` : 'Product Details'}
                </button>
              ))}
            </div>

            {activeTab === 'details' && (
              <div className="max-w-2xl">
                <div className="prose text-text-light text-sm leading-relaxed whitespace-pre-line">
                  {product.details || product.description || 'No additional details available.'}
                </div>
              </div>
            )}

            {activeTab === 'reviews' && (
              <div className="max-w-2xl">
                {/* Existing reviews */}
                {product.reviews?.length > 0 ? (
                  <div className="space-y-4 mb-8">
                    {product.reviews.map((r, i) => (
                      <div key={i} className="card p-5">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary-dark text-sm font-bold">{(r.name || 'A')[0]}</div>
                          <div>
                            <p className="font-medium text-sm">{r.name}</p>
                            <div className="flex">{[1, 2, 3, 4, 5].map((s) => <Star key={s} size={12} className={s <= r.rating ? 'fill-warning text-warning' : 'text-text-muted'} />)}</div>
                          </div>
                        </div>
                        {r.title && <p className="font-semibold text-sm mb-1">{r.title}</p>}
                        {r.comment && <p className="text-text-light text-sm">{r.comment}</p>}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-text-light text-sm mb-8">No reviews yet. Be the first to share your thoughts!</p>
                )}

                {/* Review Form */}
                <div className="card p-6">
                  <h3 className="font-heading text-lg font-bold mb-4">Write a Review</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-1" htmlFor="review-name">Name</label>
                      <input id="review-name" className="input-field" value={reviewForm.name} onChange={(e) => setReviewForm({ ...reviewForm, name: e.target.value })} />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Rating</label>
                      <div className="flex gap-1">{[1, 2, 3, 4, 5].map((s) => <button key={s} onClick={() => setReviewForm({ ...reviewForm, rating: s })}><Star size={20} className={s <= reviewForm.rating ? 'fill-warning text-warning' : 'text-text-muted hover:text-warning transition-colors'} /></button>)}</div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1" htmlFor="review-title">Title</label>
                      <input id="review-title" className="input-field" value={reviewForm.title} onChange={(e) => setReviewForm({ ...reviewForm, title: e.target.value })} placeholder="Optional" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1" htmlFor="review-comment">Your review</label>
                      <textarea id="review-comment" rows={4} className="input-field resize-none" value={reviewForm.comment} onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })} placeholder="What did you think of this item?" />
                    </div>
                    <button
                      onClick={async () => {
                        if (!reviewForm.name || !reviewForm.comment) return toast.error('Name and review are required');
                        try {
                          const res = await api.post(`/products/${product._id}/reviews`, reviewForm);
                          setProduct((prev) => ({ ...prev, reviews: [...(prev.reviews || []), res.data], reviewCount: (prev.reviewCount || 0) + 1 }));
                          setReviewForm({ name: '', rating: 5, title: '', comment: '' });
                          toast.success('Review submitted!');
                        } catch { toast.error('Failed to submit review'); }
                      }}
                      className="btn-primary px-6"
                    >
                      Submit Review
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Cross-Selling: Complete the Look */}
          {product.related?.length > 0 && (
            <div className="mt-16">
              <h2 className="font-heading text-2xl md:text-3xl font-bold mb-2 text-center">Complete the Look</h2>
              <p className="text-text-light text-center mb-8">Pairs well with this item</p>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                {product.related.map((rel) => {
                  const rv = rel.variants?.[0] || {};
                  return (
                    <Link to={`/product/${rel.slug}`} key={rel._id} className="group card p-0 overflow-hidden hover:shadow-card-hover transition-all">
                      <div className="aspect-square bg-gradient-to-br from-primary/5 to-primary/10 flex items-center justify-center text-primary/20 font-heading text-xs px-4 text-center">
                        {rel.name}
                      </div>
                      <div className="p-3">
                        <h3 className="font-medium text-sm mb-1 group-hover:text-primary-dark transition-colors line-clamp-2">{rel.name}</h3>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm text-text">{formatPrice(rv.salePrice || rv.price)}</span>
                          {rv.salePrice && <span className="text-xs text-text-light line-through">{formatPrice(rv.price)}</span>}
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

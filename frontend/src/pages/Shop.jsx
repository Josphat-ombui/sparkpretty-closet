import { useState, useEffect, useCallback } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  SlidersHorizontal, X, ChevronDown, ChevronRight, Search,
  ShoppingBag, Heart, Star, Eye, Minus, Plus, Shield,
  Truck, RotateCcw, Sparkles, Zap, Package,
} from 'lucide-react';
import { api, formatPrice } from '../lib/api';
import { useCart } from '../context/CartContext';
import { useContent } from '../context/ContentContext';
import SEO from '../components/SEO';
import toast from 'react-hot-toast';

const fadeUp = { hidden: { opacity: 0, y: 20 }, visible: (i = 0) => ({ opacity: 1, y: 0, transition: { delay: i * 0.05, duration: 0.4 } }) };

const colorSwatches = [
  { name: 'Black', hex: '#000000' },
  { name: 'White', hex: '#FFFFFF', border: true },
  { name: 'Rose Pink', hex: '#FFB6C1' },
  { name: 'Navy', hex: '#1A237E' },
  { name: 'Beige', hex: '#F5F5DC' },
  { name: 'Red', hex: '#EF4444' },
  { name: 'Blue', hex: '#1565C0' },
  { name: 'Green', hex: '#10B981' },
];

const materials = [
  { name: 'Cotton', slug: 'cotton' },
  { name: 'Silk', slug: 'silk' },
  { name: 'Denim', slug: 'denim' },
  { name: 'Leather', slug: 'leather' },
  { name: 'Polyester', slug: 'polyester' },
  { name: 'Linen', slug: 'linen' },
  { name: 'Wool', slug: 'wool' },
  { name: 'Satin', slug: 'satin' },
];

const priceRanges = [
  { label: 'Under KSh 1,000', min: 0, max: 1000 },
  { label: 'KSh 1,000 - KSh 3,000', min: 1000, max: 3000 },
  { label: 'KSh 3,000 - KSh 5,000', min: 3000, max: 5000 },
  { label: 'KSh 5,000 - KSh 8,000', min: 5000, max: 8000 },
  { label: 'Over KSh 8,000', min: 8000, max: 80000 },
];

const sortOptions = [
  { value: 'newest', label: 'Newest' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
  { value: 'name', label: 'Name A-Z' },
];

const categoryIcons = {
  dresses: '👗',
  tops: '👚',
  bottoms: '👖',
  shoes: '👟',
  accessories: '👜',
};

export default function Shop() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { get } = useContent();
  const sizeFilterPrefs = get('shop_size_filters', null);
  const clothingSizes = Array.isArray(sizeFilterPrefs?.clothing) ? sizeFilterPrefs.clothing : ['XS', 'S', 'M', 'L', 'XL'];
  const shoeSizes = Array.isArray(sizeFilterPrefs?.shoes) ? sizeFilterPrefs.shoes : ['36', '37', '38', '39', '40', '41'];
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [quickView, setQuickView] = useState(null);
  const [wishlist, setWishlist] = useState([]);
  const [searchSuggestions, setSearchSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedColor, setSelectedColor] = useState('');
  const [selectedPriceRange, setSelectedPriceRange] = useState(null);
  const [qvVariant, setQvVariant] = useState(0);
  const [qvQty, setQvQty] = useState(1);
  const { addItem } = useCart();

  const category = searchParams.get('category') || '';
  const size = searchParams.get('size') || '';
  const sort = searchParams.get('sort') || 'newest';
  const search = searchParams.get('search') || '';
  const page = Number(searchParams.get('page') || 1);
  const color = searchParams.get('color') || '';
  const minPrice = searchParams.get('minPrice') || '';
  const maxPrice = searchParams.get('maxPrice') || '';
  const material = searchParams.get('material') || '';

  const [sliderMin, setSliderMin] = useState(minPrice ? Number(minPrice) : 0);
  const [sliderMax, setSliderMax] = useState(maxPrice ? Number(maxPrice) : 8000);

  useEffect(() => { api.get('/products/categories').then((r) => setCategories(r.data)); }, []);

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (category) params.set('category', category);
    if (size) params.set('size', size);
    if (sort) params.set('sort', sort);
    if (search) params.set('search', search);
    if (color) params.set('color', color);
    if (material) params.set('material', material);
    if (minPrice) params.set('minPrice', minPrice);
    if (maxPrice) params.set('maxPrice', maxPrice);
    params.set('page', page);
    params.set('limit', '12');
    api.get(`/products?${params}`).then((r) => {
      setProducts(r.data.products);
      setTotal(r.data.total);
      setPages(r.data.pages);
    }).finally(() => setLoading(false));
  }, [category, size, sort, search, color, material, minPrice, maxPrice, page]);

  useEffect(() => {
    if (!minPrice && !maxPrice) { setSliderMin(0); setSliderMax(8000); }
  }, [minPrice, maxPrice]);

  const updateParam = useCallback((key, value) => {
    const params = new URLSearchParams(searchParams);
    if (value) { params.set(key, value); } else { params.delete(key); }
    if (key !== 'page') params.delete('page');
    setSearchParams(params);
  }, [searchParams, setSearchParams]);

  const clearAllFilters = () => {
    setSearchParams({});
    setSelectedColor('');
    setSelectedPriceRange(null);
    setSliderMin(0);
    setSliderMax(8000);
  };

  const handleSearch = (value) => {
    updateParam('search', value);
    setShowSuggestions(false);
  };

  const handleSearchInput = async (value) => {
    if (value.length < 2) { setSearchSuggestions([]); return; }
    try {
      const res = await api.get(`/products?search=${value}&limit=5`);
      setSearchSuggestions(res.data.products || []);
    } catch { setSearchSuggestions([]); }
  };

  const toggleWishlist = (id) => {
    setWishlist((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]);
    toast.success(wishlist.includes(id) ? 'Removed from wishlist' : 'Added to wishlist');
  };

  const openQuickView = (product) => {
    setQuickView(product);
    setQvVariant(0);
    setQvQty(1);
  };

  const addFromQuickView = () => {
    if (!quickView) return;
    const v = quickView.variants[qvVariant];
    if (v.stock < qvQty) return toast.error('Not enough stock');
    addItem(quickView._id, qvVariant, qvQty);
    toast.success(`${quickView.name} added to bag!`);
    setQuickView(null);
  };

  const getBadge = (product) => {
    const v = product.variants?.[0] || {};
    const discount = v.salePrice ? Math.round(((v.price - v.salePrice) / v.price) * 100) : 0;
    if (discount >= 20) return { text: `-${discount}%`, style: 'bg-error text-white' };
    if (v.salePrice) return { text: 'Sale', style: 'bg-error text-white' };
    if (product.tags?.includes('new')) return { text: 'New', style: 'bg-success text-white' };
    if (product.tags?.includes('bestseller')) return { text: 'Best Seller', style: 'bg-secondary text-white' };
    if (v.stock > 0 && v.stock <= 5) return { text: `Only ${v.stock} left`, style: 'bg-warning text-white' };
    return null;
  };

  const activeFiltersCount = [category, size, search, color, material, minPrice || maxPrice].filter(Boolean).length;

  return (
    <div>
      <SEO
        title={category ? categories.find((c) => c.slug === category)?.name || 'Shop' : 'Shop All'}
        description={get('shop_seo_description', "Browse our curated collection of women's fashion. Dresses, tops, shoes, and accessories with M-Pesa checkout.")}
        url="/shop"
      />

      {/* Search Bar */}
      <div className="bg-primary/30 border-b border-border sticky top-16 md:top-20 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="relative max-w-2xl mx-auto">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" />
            <input
              type="search"
              placeholder="Search for dresses, shoes, bags..."
              defaultValue={search}
              onChange={(e) => handleSearchInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') handleSearch(e.target.value); }}
              onFocus={() => setShowSuggestions(true)}
              onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
              className="w-full pl-11 pr-4 py-3 rounded-xl border border-border bg-bg text-text placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
              aria-label="Search products"
            />
            <AnimatePresence>
              {showSuggestions && searchSuggestions.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  className="absolute top-full left-0 right-0 bg-white border border-border rounded-xl shadow-modal mt-2 overflow-hidden z-50"
                >
                  {searchSuggestions.map((p) => (
                    <Link
                      key={p._id}
                      to={`/product/${p.slug}`}
                      className="flex items-center gap-3 px-4 py-3 hover:bg-bg transition-colors"
                    >
                      <div className="w-10 h-10 rounded-lg bg-primary/5 flex items-center justify-center text-primary/30 text-xs">
                        <Sparkles size={14} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{p.name}</p>
                        <p className="text-xs text-text-light">{formatPrice(p.variants?.[0]?.price || 0)}</p>
                      </div>
                    </Link>
                  ))}
                  <button
                    onClick={() => handleSearch(search)}
                    className="w-full text-center py-3 text-primary-dark text-sm font-semibold hover:bg-bg transition-colors border-t border-border"
                  >
                    View all results for "{search}"
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      <div className="section-padding">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <div>
              <nav className="flex items-center gap-2 text-sm text-text-light mb-2" aria-label="Breadcrumb">
                <Link to="/" className="hover:text-primary-dark">Home</Link>
                <ChevronRight size={12} />
                <span className="text-text font-medium">{category ? categories.find((c) => c.slug === category)?.name : 'All Products'}</span>
              </nav>
              <h1 className="font-heading text-3xl md:text-4xl font-bold">
                {category ? categories.find((c) => c.slug === category)?.name || 'Shop' : 'All Products'}
              </h1>
              <p className="text-text-light mt-1">{total} products found</p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setFiltersOpen(!filtersOpen)}
                className="md:hidden btn-outline text-sm py-2 px-4 flex items-center gap-2"
              >
                <SlidersHorizontal size={16} /> Filters
                {activeFiltersCount > 0 && (
                  <span className="bg-secondary text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">{activeFiltersCount}</span>
                )}
              </button>
              <div className="relative">
                <select
                  value={sort}
                  onChange={(e) => updateParam('sort', e.target.value)}
                  className="appearance-none bg-white border border-border rounded-lg px-4 py-2.5 pr-10 text-sm focus:ring-2 focus:ring-primary focus:outline-none cursor-pointer"
                  aria-label="Sort products"
                >
                  {sortOptions.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
                <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-text-light pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Active Filter Chips */}
          {activeFiltersCount > 0 && (
            <div className="flex flex-wrap gap-2 mb-6">
              {category && (
                <span className="inline-flex items-center gap-1.5 bg-primary/10 text-primary-dark text-xs font-medium px-3 py-1.5 rounded-full">
                  {categories.find((c) => c.slug === category)?.name}
                  <button onClick={() => updateParam('category', '')} className="hover:text-primary-dark"><X size={12} /></button>
                </span>
              )}
              {size && (
                <span className="inline-flex items-center gap-1.5 bg-primary/10 text-primary-dark text-xs font-medium px-3 py-1.5 rounded-full">
                  Size {size}
                  <button onClick={() => updateParam('size', '')} className="hover:text-primary-dark"><X size={12} /></button>
                </span>
              )}
              {color && (
                <span className="inline-flex items-center gap-1.5 bg-primary/10 text-primary-dark text-xs font-medium px-3 py-1.5 rounded-full">
                  {color}
                  <button onClick={() => updateParam('color', '')} className="hover:text-primary-dark"><X size={12} /></button>
                </span>
              )}
              {material && (
                <span className="inline-flex items-center gap-1.5 bg-primary/10 text-primary-dark text-xs font-medium px-3 py-1.5 rounded-full">
                  {materials.find((m) => m.slug === material)?.name}
                  <button onClick={() => updateParam('material', '')} className="hover:text-primary-dark"><X size={12} /></button>
                </span>
              )}
              {search && (
                <span className="inline-flex items-center gap-1.5 bg-primary/10 text-primary-dark text-xs font-medium px-3 py-1.5 rounded-full">
                  "{search}"
                  <button onClick={() => updateParam('search', '')} className="hover:text-primary-dark"><X size={12} /></button>
                </span>
              )}
              {(minPrice || maxPrice) && (
                <span className="inline-flex items-center gap-1.5 bg-primary/10 text-primary-dark text-xs font-medium px-3 py-1.5 rounded-full">
                  {minPrice && maxPrice ? `${formatPrice(minPrice)} - ${formatPrice(maxPrice)}` : minPrice ? `Over ${formatPrice(minPrice)}` : `Under ${formatPrice(maxPrice)}`}
                  <button onClick={() => { updateParam('minPrice', ''); updateParam('maxPrice', ''); }} className="hover:text-primary-dark"><X size={12} /></button>
                </span>
              )}
              <button onClick={clearAllFilters} className="text-xs text-text-light hover:text-error font-medium transition-colors">Clear all</button>
            </div>
          )}

          <div className="flex gap-8">
            {/* Sidebar Filters */}
            <aside className={`${filtersOpen ? 'block' : 'hidden'} md:block w-full md:w-72 flex-shrink-0`}>
              <div className="sticky top-40 space-y-8">

                {/* Categories */}
                <div>
                  <h3 className="font-semibold text-sm mb-4 flex items-center gap-2">
                    <Sparkles size={14} className="text-primary-dark" /> Categories
                  </h3>
                  <div className="space-y-1">
                    <button
                      onClick={() => updateParam('category', '')}
                      className={`w-full text-left py-2 px-3 rounded-lg text-sm transition-all ${!category ? 'bg-primary/10 text-primary-dark font-semibold' : 'text-text-light hover:bg-bg hover:text-primary-dark'}`}
                    >
                      All Products
                    </button>
                    {categories.map((cat) => (
                      <button
                        key={cat.slug}
                        onClick={() => updateParam('category', cat.slug)}
                        className={`w-full text-left py-2 px-3 rounded-lg text-sm flex items-center gap-2 transition-all ${category === cat.slug ? 'bg-primary/10 text-primary-dark font-semibold' : 'text-text-light hover:bg-bg hover:text-primary-dark'}`}
                      >
                        <span className="text-base">{categoryIcons[cat.slug] || '📦'}</span>
                        {cat.name}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Sizes */}
                <div>
                  <h3 className="font-semibold text-sm mb-4">Size</h3>
                  <div className="flex flex-wrap gap-2">
                    {clothingSizes.map((s) => (
                      <button
                        key={s}
                        onClick={() => updateParam('size', size === s ? '' : s)}
                        className={`w-10 h-10 rounded-lg text-xs font-medium border transition-all flex items-center justify-center ${
                          size === s
                            ? 'bg-secondary text-white border-primary'
                            : 'border-border text-text-light hover:border-primary hover:text-primary-dark'
                        }`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {shoeSizes.map((s) => (
                      <button
                        key={s}
                        onClick={() => updateParam('size', size === s ? '' : s)}
                        className={`w-10 h-10 rounded-lg text-xs font-medium border transition-all flex items-center justify-center ${
                          size === s
                            ? 'bg-secondary text-white border-primary'
                            : 'border-border text-text-light hover:border-primary hover:text-primary-dark'
                        }`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Colors */}
                <div>
                  <h3 className="font-semibold text-sm mb-4">Color</h3>
                  <div className="flex flex-wrap gap-2">
                    {colorSwatches.map((c) => (
                      <button
                        key={c.name}
                        onClick={() => updateParam('color', color === c.name ? '' : c.name)}
                        className={`w-8 h-8 rounded-full border-2 transition-all ${color === c.name ? 'border-primary scale-110 ring-2 ring-primary/20' : 'border-border hover:border-primary/50'}`}
                        style={{ backgroundColor: c.hex }}
                        title={c.name}
                        aria-label={`Color: ${c.name}`}
                      />
                    ))}
                  </div>
                </div>

                {/* Materials */}
                <div>
                  <h3 className="font-semibold text-sm mb-4 flex items-center gap-2">
                    <Package size={14} className="text-primary-dark" /> Material
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {materials.map((m) => (
                      <button
                        key={m.slug}
                        onClick={() => updateParam('material', material === m.slug ? '' : m.slug)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                          material === m.slug
                            ? 'bg-secondary text-white border-primary'
                            : 'border-border text-text-light hover:border-primary hover:text-primary-dark'
                        }`}
                      >
                        {m.name}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Price Range */}
                <div>
                  <h3 className="font-semibold text-sm mb-4">Price Range</h3>
                  {/* Slider */}
                  <div className="px-1 mb-3">
                    <div className="flex justify-between text-xs text-text-light mb-2">
                      <span>{formatPrice(sliderMin)}</span>
                      <span>{formatPrice(sliderMax)}</span>
                    </div>
                    <div className="relative h-1 bg-border rounded-full">
                      <div
                        className="absolute h-1 bg-primary rounded-full"
                        style={{ left: `${(sliderMin / 8000) * 100}%`, right: `${100 - (sliderMax / 8000) * 100}%` }}
                      />
                    </div>
                    <div className="relative -mt-1 h-6">
                      <input
                        type="range"
                        min="0"
                        max="8000"
                        step="100"
                        value={sliderMin}
                        onChange={(e) => {
                          const v = Number(e.target.value);
                          if (v <= sliderMax) setSliderMin(v);
                        }}
                        onMouseUp={() => { updateParam('minPrice', sliderMin); updateParam('maxPrice', sliderMax); }}
                        onTouchEnd={() => { updateParam('minPrice', sliderMin); updateParam('maxPrice', sliderMax); }}
                        className="absolute w-full appearance-none bg-transparent pointer-events-none"
                        style={{ '--slider': (sliderMin / 8000) * 100 + '%' }}
                        aria-label="Minimum price"
                      />
                      <input
                        type="range"
                        min="0"
                        max="8000"
                        step="100"
                        value={sliderMax}
                        onChange={(e) => {
                          const v = Number(e.target.value);
                          if (v >= sliderMin) setSliderMax(v);
                        }}
                        onMouseUp={() => { updateParam('minPrice', sliderMin); updateParam('maxPrice', sliderMax); }}
                        onTouchEnd={() => { updateParam('minPrice', sliderMin); updateParam('maxPrice', sliderMax); }}
                        className="absolute w-full appearance-none bg-transparent pointer-events-none"
                        style={{ '--slider': (sliderMax / 8000) * 100 + '%' }}
                        aria-label="Maximum price"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    {priceRanges.map((range) => {
                      const isActive = Number(minPrice) === range.min && Number(maxPrice) === range.max;
                      return (
                        <button
                          key={range.label}
                          onClick={() => {
                            if (isActive) { updateParam('minPrice', ''); updateParam('maxPrice', ''); setSliderMin(0); setSliderMax(8000); }
                            else { updateParam('minPrice', range.min); updateParam('maxPrice', range.max); setSliderMin(range.min); setSliderMax(range.max); }
                          }}
                          className={`w-full text-left py-2 px-3 rounded-lg text-sm transition-all ${isActive ? 'bg-primary/10 text-primary-dark font-semibold' : 'text-text-light hover:bg-bg hover:text-primary-dark'}`}
                        >
                          {range.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Trust Signals */}
                <div className="bg-bg rounded-card p-4 space-y-3">
                  {[
                    { icon: <Truck size={16} />, text: get('trust_free_shipping_note', `Free shipping over KSh ${get('free_shipping_threshold', '5,000')}`) },
                    { icon: <Shield size={16} />, text: get('secure_payment_note', 'Secure M-Pesa checkout') },
                    { icon: <RotateCcw size={16} />, text: get('return_policy_full', '7-day easy returns') },
                  ].map((item) => (
                    <div key={item.text} className="flex items-center gap-2 text-xs text-text-light">
                      <span className="text-primary-dark">{item.icon}</span> {item.text}
                    </div>
                  ))}
                </div>
              </div>
            </aside>

            {/* Product Grid */}
            <div className="flex-1">
              {loading ? (
                <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-5">
                  {[...Array(8)].map((_, i) => (
                    <div key={i} className="card p-0 overflow-hidden">
                      <div className="aspect-[3/4] skeleton" />
                      <div className="p-4 space-y-3">
                        <div className="skeleton h-3 w-1/3" />
                        <div className="skeleton h-4 w-3/4" />
                        <div className="skeleton h-3 w-1/2" />
                        <div className="skeleton h-4 w-1/3" />
                        <div className="skeleton h-10 w-full" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : products.length === 0 ? (
                <div className="text-center py-24">
                  <div className="w-20 h-20 rounded-full bg-primary/5 flex items-center justify-center mx-auto mb-6">
                    <Search size={32} className="text-primary/30" />
                  </div>
                  <h2 className="font-heading text-2xl font-bold mb-3">No products found</h2>
                  <p className="text-text-light mb-6">Try adjusting your filters or search terms.</p>
                  <button onClick={clearAllFilters} className="btn-primary">Clear All Filters</button>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-5">
                    {products.map((product, i) => {
                      const variant = product.variants?.[0] || {};
                      const price = variant.price || 0;
                      const salePrice = variant.salePrice;
                      const inStock = variant.stock > 0;
                      const badge = getBadge(product);
                      const isWished = wishlist.includes(product._id);

                      return (
                        <motion.div
                          key={product._id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: i * 0.03 }}
                          className="group card card-hover p-0 overflow-hidden"
                        >
                          <Link to={`/product/${product.slug}`} className="block">
                            <div className="aspect-[3/4] bg-gradient-to-br from-primary/5 to-primary/10 relative overflow-hidden">
                              {variant.images?.[0] ? (
                                <img src={variant.images[0]} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                              ) : (
                                <div className="absolute inset-0 flex items-center justify-center text-primary/20 font-heading text-sm px-4 text-center">
                                  {product.name}
                                </div>
                              )}
                              {/* Badge */}
                              {badge && (
                                <span className={`absolute top-3 left-3 text-xs font-bold px-2.5 py-1 rounded-full ${badge.style}`}>
                                  {badge.text}
                                </span>
                              )}
                              {/* Wishlist */}
                              <button
                                onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggleWishlist(product._id); }}
                                className="absolute top-3 right-3 w-9 h-9 bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-white z-10"
                                aria-label={isWished ? 'Remove from wishlist' : 'Add to wishlist'}
                              >
                                <Heart size={14} className={isWished ? 'text-error fill-error' : 'text-text-light'} />
                              </button>
                              {/* Quick Actions */}
                              <div className="absolute bottom-3 left-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300">
                                <button
                                  onClick={(e) => { e.preventDefault(); e.stopPropagation(); openQuickView(product); }}
                                  className="flex-1 bg-white/90 backdrop-blur-sm text-text text-xs font-semibold py-2.5 rounded-lg text-center hover:bg-white transition-colors flex items-center justify-center gap-1"
                                >
                                  <Eye size={12} /> Quick View
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.preventDefault(); e.stopPropagation();
                                    if (!inStock) return toast.error('Out of stock');
                                    addItem(product._id, 0);
                                    toast.success(`${product.name} added!`);
                                  }}
                                  className="w-10 bg-secondary text-white rounded-lg flex items-center justify-center hover:bg-primary-dark transition-colors"
                                  disabled={!inStock}
                                  aria-label="Add to bag"
                                >
                                  <ShoppingBag size={14} />
                                </button>
                              </div>
                            </div>
                          </Link>
                          <div className="p-4">
                            {product.category && (
                              <p className="text-xs text-text-muted uppercase tracking-wider mb-1">{product.category.name}</p>
                            )}
                            <Link to={`/product/${product.slug}`}>
                              <h3 className="font-medium text-sm truncate group-hover:text-primary-dark transition-colors">{product.name}</h3>
                            </Link>
                            {/* Rating */}
                            <div className="flex items-center gap-1 mt-1.5">
                              {[...Array(5)].map((_, j) => (
                                <Star key={j} size={11} className={j < 4 ? 'text-yellow-400 fill-yellow-400' : 'text-gray-200'} />
                              ))}
                              <span className="text-xs text-text-muted ml-0.5">(4.{Math.floor(Math.random() * 5) + 3})</span>
                            </div>
                            {/* Price */}
                            <div className="flex items-center gap-2 mt-2">
                              <span className="font-bold text-text">{formatPrice(salePrice || price)}</span>
                              {salePrice && <span className="text-text-light text-xs line-through">{formatPrice(price)}</span>}
                            </div>
                            {/* Color swatches */}
                            {product.variants && product.variants.length > 1 && (
                              <div className="flex items-center gap-1 mt-2">
                                {[...new Set(product.variants.map((v) => v.color))].slice(0, 4).map((c) => {
                                  const v = product.variants.find((vv) => vv.color === c);
                                  return (
                                    <span key={c} className="w-3 h-3 rounded-full border border-border" style={{ backgroundColor: v?.colorHex || '#ccc' }} title={c} />
                                  );
                                })}
                                {new Set(product.variants.map((v) => v.color)).size > 4 && (
                                  <span className="text-xs text-text-muted">+{new Set(product.variants.map((v) => v.color)).size - 4}</span>
                                )}
                              </div>
                            )}
                            {/* Add to Cart */}
                            <button
                              onClick={() => {
                                if (!inStock) return toast.error('Out of stock');
                                addItem(product._id, 0);
                                toast.success(`${product.name} added!`);
                              }}
                              disabled={!inStock}
                              className="mt-3 w-full btn-primary text-sm py-2 flex items-center justify-center gap-2 disabled:opacity-50"
                            >
                              <ShoppingBag size={13} /> {inStock ? 'Add to Bag' : 'Out of Stock'}
                            </button>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>

                  {/* Pagination */}
                  {pages > 1 && (
                    <div className="flex justify-center items-center gap-2 mt-12">
                      <button
                        onClick={() => updateParam('page', String(Math.max(1, page - 1)))}
                        disabled={page <= 1}
                        className="w-10 h-10 rounded-lg border border-border text-sm font-medium hover:border-primary hover:text-primary-dark transition-all disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center"
                      >
                        <ChevronRight size={16} className="rotate-180" />
                      </button>
                      {[...Array(pages)].map((_, i) => (
                        <button
                          key={i}
                          onClick={() => updateParam('page', String(i + 1))}
                          className={`w-10 h-10 rounded-lg text-sm font-medium transition-all ${
                            page === i + 1
                              ? 'bg-secondary text-white'
                              : 'bg-white border border-border text-text hover:border-primary hover:text-primary-dark'
                          }`}
                        >
                          {i + 1}
                        </button>
                      ))}
                      <button
                        onClick={() => updateParam('page', String(Math.min(pages, page + 1)))}
                        disabled={page >= pages}
                        className="w-10 h-10 rounded-lg border border-border text-sm font-medium hover:border-primary hover:text-primary-dark transition-all disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center"
                      >
                        <ChevronRight size={16} />
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ============================================
          QUICK VIEW MODAL
          ============================================ */}
      <AnimatePresence>
        {quickView && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-50"
              onClick={() => setQuickView(null)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed inset-4 md:inset-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-full md:max-w-3xl md:max-h-[90vh] bg-white rounded-2xl z-50 overflow-y-auto shadow-modal"
              role="dialog"
              aria-label="Quick view"
            >
              <div className="p-6 md:p-8">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="font-heading text-xl font-bold">Quick View</h2>
                  <button onClick={() => setQuickView(null)} className="p-2 hover:bg-bg rounded-lg transition-colors" aria-label="Close">
                    <X size={20} />
                  </button>
                </div>
                <div className="grid md:grid-cols-2 gap-6">
                  {/* Image */}
                  <div className="aspect-[3/4] bg-gradient-to-br from-primary/5 to-primary/10 rounded-card flex items-center justify-center text-primary/20 font-heading overflow-hidden">
                    {quickView.variants?.[0]?.images?.[0] ? (
                      <img src={quickView.variants[0].images[0]} alt={quickView.name} className="w-full h-full object-cover" />
                    ) : (
                      quickView.name
                    )}
                  </div>
                  {/* Info */}
                  <div className="flex flex-col">
                    <p className="text-xs text-text-muted uppercase tracking-wider mb-1">{quickView.category?.name || 'Product'}</p>
                    <h3 className="font-heading text-2xl font-bold mb-2">{quickView.name}</h3>
                    <div className="flex items-center gap-1 mb-3">
                      {[...Array(5)].map((_, j) => <Star key={j} size={14} className="text-yellow-400 fill-yellow-400" />)}
                      <span className="text-sm text-text-muted ml-1">(4.8)</span>
                    </div>

                    {/* Colors */}
                    {quickView.variants && quickView.variants.length > 0 && (
                      <div className="mb-4">
                        <p className="text-sm font-semibold mb-2">Color: <span className="font-normal text-text-light">{quickView.variants[qvVariant]?.color}</span></p>
                        <div className="flex gap-2">
                          {[...new Set(quickView.variants.map((v) => v.color))].map((color) => {
                            const v = quickView.variants.find((vv) => vv.color === color);
                            const idx = quickView.variants.findIndex((vv) => vv.color === color);
                            return (
                              <button
                                key={color}
                                onClick={() => setQvVariant(idx)}
                                className={`w-9 h-9 rounded-full border-2 transition-all ${quickView.variants[qvVariant]?.color === color ? 'border-primary scale-110' : 'border-border hover:border-primary/50'}`}
                                style={{ backgroundColor: v?.colorHex || '#ccc' }}
                                title={color}
                              />
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Sizes */}
                    <div className="mb-4">
                      <p className="text-sm font-semibold mb-2">Size: <span className="font-normal text-text-light">{quickView.variants[qvVariant]?.size}</span></p>
                      <div className="flex flex-wrap gap-2">
                        {quickView.variants?.filter((v) => v.color === quickView.variants[qvVariant]?.color).map((v) => {
                          const idx = quickView.variants.findIndex((vv) => vv.size === v.size && vv.color === v.color);
                          return (
                            <button
                              key={v.size}
                              onClick={() => setQvVariant(idx)}
                              disabled={v.stock === 0}
                              className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                                quickView.variants[qvVariant]?.size === v.size
                                  ? 'bg-secondary text-white border-primary'
                                  : v.stock === 0
                                    ? 'border-border text-text-muted line-through cursor-not-allowed'
                                    : 'border-border hover:border-primary hover:text-primary-dark'
                              }`}
                            >
                              {v.size}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Price */}
                    <div className="mb-4">
                      <span className="text-2xl font-bold text-text">{formatPrice(quickView.variants[qvVariant]?.salePrice || quickView.variants[qvVariant]?.price || 0)}</span>
                      {quickView.variants[qvVariant]?.salePrice && (
                        <span className="text-lg text-text-light line-through ml-2">{formatPrice(quickView.variants[qvVariant]?.price)}</span>
                      )}
                    </div>

                    {/* Stock */}
                    <p className="text-sm mb-4">
                      {quickView.variants[qvVariant]?.stock > 10
                        ? <span className="text-success font-medium">In Stock</span>
                        : quickView.variants[qvVariant]?.stock > 0
                          ? <span className="text-warning font-medium">Only {quickView.variants[qvVariant]?.stock} left</span>
                          : <span className="text-error font-medium">Out of Stock</span>
                      }
                    </p>

                    {/* Quantity + Add */}
                    <div className="flex items-center gap-3 mb-6">
                      <div className="flex items-center border border-border rounded-lg">
                        <button onClick={() => setQvQty(Math.max(1, qvQty - 1))} className="p-2.5 hover:text-primary-dark transition-colors"><Minus size={14} /></button>
                        <span className="w-10 text-center font-medium text-sm">{qvQty}</span>
                        <button onClick={() => setQvQty(qvQty + 1)} className="p-2.5 hover:text-primary-dark transition-colors"><Plus size={14} /></button>
                      </div>
                      <button
                        onClick={addFromQuickView}
                        disabled={quickView.variants[qvVariant]?.stock === 0}
                        className="flex-1 btn-primary py-3 flex items-center justify-center gap-2 disabled:opacity-50"
                      >
                        <ShoppingBag size={16} /> Add to Bag
                      </button>
                    </div>

                    <Link
                      to={`/product/${quickView.slug}`}
                      onClick={() => setQuickView(null)}
                      className="text-primary-dark text-sm font-semibold hover:underline text-center"
                    >
                      View Full Details →
                    </Link>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

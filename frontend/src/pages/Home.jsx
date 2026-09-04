import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowRight, ShoppingBag, Sparkles, Truck, Shield, Heart,
  Star, ChevronLeft, ChevronRight, Quote, Clock, Tag,
  Leaf, Award, Recycle, Send, CheckCircle, CreditCard,
  RotateCcw, Headphones, Zap, BookOpen, Eye,
} from 'lucide-react';
import { api, formatPrice } from '../lib/api';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import SEO from '../components/SEO';
import toast from 'react-hot-toast';

const fadeUp = { hidden: { opacity: 0, y: 30 }, visible: (i = 0) => ({ opacity: 1, y: 0, transition: { delay: i * 0.1, duration: 0.6 } }) };
const fadeIn = { hidden: { opacity: 0 }, visible: (i = 0) => ({ opacity: 1, transition: { delay: i * 0.15, duration: 0.5 } }) };
const scaleIn = { hidden: { opacity: 0, scale: 0.9 }, visible: (i = 0) => ({ opacity: 1, scale: 1, transition: { delay: i * 0.1, duration: 0.5 } }) };

const categories = [
  { name: 'Dresses', slug: 'dresses', color: '#FFB6C1', desc: 'Elegant for every occasion' },
  { name: 'Tops', slug: 'tops', color: '#FFB6C1', desc: 'Stylish everyday wear' },
  { name: 'Bottoms', slug: 'bottoms', color: '#FFB6C1', desc: 'Jeans, skirts & trousers' },
  { name: 'Shoes', slug: 'shoes', color: '#FF8FA3', desc: 'Step out in style' },
  { name: 'Accessories', slug: 'accessories', color: '#FFE0E6', desc: 'The finishing touches' },
];

const testimonials = [
  { name: 'Amina W.', location: 'Nairobi', rating: 5, text: "I've never felt so confident in my outfits! The Rose Garden Midi Dress is absolutely stunning. Sparkpretty has become my go-to for every occasion.", avatar: 'A', product: 'Rose Garden Midi Dress' },
  { name: 'Faith M.', location: 'Mombasa', rating: 5, text: "The quality is incredible for the price. I ordered 3 dresses and they all fit perfectly. The M-Pesa checkout was so easy!", avatar: 'F', product: 'Elegant Wrap Dress' },
  { name: 'Grace N.', location: 'Kisumu', rating: 5, text: "Fast delivery, beautiful packaging, and the clothes look exactly like the photos. I'm a customer for life!", avatar: 'G', product: 'Sunset Maxi Dress' },
  { name: 'Wanjiku K.', location: 'Nakuru', rating: 5, text: "The crossbody bag is my daily essential now. So chic and fits everything I need. Highly recommend Sparkpretty!", avatar: 'W', product: 'Quilted Crossbody Bag' },
  { name: 'Mercy O.', location: 'Eldoret', rating: 5, text: "I was skeptical ordering online but the size guide was spot-on. The silk blouse is gorgeous. Will definitely order again!", avatar: 'M', product: 'Silk Touch Blouse' },
  { name: 'Nancy A.', location: 'Thika', rating: 5, text: "My friends keep asking where I got my outfit. The quality rivals brands I've paid double for. Thank you Sparkpretty!", avatar: 'N', product: 'Oversized Knit Sweater' },
];

const galleryImages = [
  { alt: 'Woman in Rose Garden Midi Dress at brunch', gradient: 'from-pink-200 to-rose-300' },
  { alt: 'Style flatlay with crossbody bag and accessories', gradient: 'from-amber-100 to-orange-200' },
  { alt: 'Model wearing Elegant Wrap Dress at office', gradient: 'from-indigo-200 to-purple-300' },
  { alt: 'Summer look with Sunset Maxi Dress on beach', gradient: 'from-orange-200 to-red-200' },
  { alt: 'Street style with canvas sneakers and jeans', gradient: 'from-teal-200 to-cyan-300' },
  { alt: 'Evening look with strappy heels and clutch', gradient: 'from-gray-200 to-slate-300' },
];

const colorSwatches = [
  { color: '#FFB6C1', name: 'Rose' },
  { color: '#FFB6C1', name: 'Sky' },
  { color: '#1A1A2E', name: 'Black' },
  { color: '#FFFFFF', name: 'White', border: true },
  { color: '#8D6E63', name: 'Khaki' },
  { color: '#7B1FA2', name: 'Purple' },
];

export default function Home() {
  const [featured, setFeatured] = useState([]);
  const [newArrivals, setNewArrivals] = useState([]);
  const [blogPosts, setBlogPosts] = useState([]);
  const [email, setEmail] = useState('');
  const [activeTestimonial, setActiveTestimonial] = useState(0);
  const [wishlist, setWishlist] = useState([]);
  const { addItem } = useCart();
  const { user } = useAuth();

  useEffect(() => {
    api.get('/products?limit=4&sort=newest&featured=true').then((res) => setFeatured(res.data.products || []));
    api.get('/products?limit=8&sort=newest').then((res) => setNewArrivals(res.data.products || []));
    api.get('/blog?limit=3').then((res) => setBlogPosts(res.data.posts || []));
  }, []);

  const toggleWishlist = (productId) => {
    setWishlist((prev) =>
      prev.includes(productId) ? prev.filter((id) => id !== productId) : [...prev, productId]
    );
    toast.success(wishlist.includes(productId) ? 'Removed from wishlist' : 'Added to wishlist');
  };

  const handleSubscribe = async (e) => {
    e.preventDefault();
    try {
      await api.post('/newsletter/subscribe', { email });
      toast.success('Welcome to the Spark! Check your inbox.');
      setEmail('');
    } catch {
      toast.error('Subscription failed. Try again.');
    }
  };

  const nextTestimonial = () => setActiveTestimonial((prev) => (prev + 1) % testimonials.length);
  const prevTestimonial = () => setActiveTestimonial((prev) => (prev - 1 + testimonials.length) % testimonials.length);

  const READING_TIME = (text) => Math.max(1, Math.ceil((text || '').split(/\s+/).length / 200));

  return (
    <div>
      <SEO
        title="Women's Fashion Kenya"
        description="Kenya's premier women's fashion destination. Shop curated dresses, tops, shoes & accessories. M-Pesa checkout. Free shipping over KSh 5,000."
        url="/"
        jsonLd={{
          '@context': 'https://schema.org',
          '@type': 'WebSite',
          name: 'Sparkpretty Closet',
          url: 'https://sparkpretty.co.ke',
          potentialAction: {
            '@type': 'SearchAction',
            target: 'https://sparkpretty.co.ke/shop?search={search_term_string}',
            'query-input': 'required name=search_term_string',
          },
        }}
      />

      {/* ============================================
          1. HERO BANNER
          ============================================ */}
      <section className="gradient-hero relative overflow-hidden min-h-[85vh] flex items-center" aria-label="Welcome banner">
        <div className="absolute inset-0 opacity-10" aria-hidden="true">
          <div className="absolute top-20 left-10 w-72 h-72 bg-white rounded-full blur-3xl" />
          <div className="absolute bottom-10 right-20 w-96 h-96 bg-accent rounded-full blur-3xl" />
          <div className="absolute top-1/2 left-1/2 w-80 h-80 bg-white rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32 relative z-10 w-full">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={0}>
                <span className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm text-white px-4 py-2 rounded-full text-sm font-medium mb-6">
                  <Sparkles size={14} /> New Collection 2026
                </span>
              </motion.div>
              <motion.h1
                initial="hidden" animate="visible" variants={fadeUp} custom={1}
                className="font-heading text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight"
              >
                Wear Your <br />
                <span className="text-white/90">Beautiful Sparkle</span>
              </motion.h1>
              <motion.p
                initial="hidden" animate="visible" variants={fadeUp} custom={2}
                className="text-white/80 text-lg md:text-xl mb-10 max-w-lg leading-relaxed"
              >
                Curated fashion for the confident, sparkling woman. Discover pieces that celebrate your unique beauty and make you feel extraordinary.
              </motion.p>
              <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={3} className="flex flex-wrap gap-4">
                <Link to="/shop" className="bg-white text-text px-8 py-4 rounded-lg font-semibold hover:bg-white/90 transition-all shadow-button hover:shadow-lg inline-flex items-center gap-2 text-lg">
                  Shop New Arrivals <ArrowRight size={18} />
                </Link>
                <Link to="/about" className="border-2 border-white text-white px-8 py-4 rounded-lg font-semibold hover:bg-white/10 transition-all inline-flex items-center gap-2 text-lg">
                  Our Story
                </Link>
              </motion.div>
            </div>
            <motion.div
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4, duration: 0.8 }}
              className="hidden lg:block"
            >
              <div className="relative">
                <div className="aspect-[3/4] rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center overflow-hidden">
                  <div className="text-center text-white/60">
                    <Sparkles size={64} className="mx-auto mb-4 opacity-30" />
                    <p className="font-heading text-2xl">New Collection</p>
                    <p className="text-sm mt-2">Shop the look</p>
                  </div>
                </div>
                <div className="absolute -bottom-6 -left-6 bg-white rounded-xl p-4 shadow-modal flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <Zap size={20} className="text-secondary" />
                  </div>
                  <div>
                    <p className="font-semibold text-sm">Free Shipping</p>
                    <p className="text-text-light text-xs">On orders over KSh 5,000</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ============================================
          2. TRUST BADGES
          ============================================ */}
      <section className="bg-white border-b border-border" aria-label="Trust badges">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { icon: <Truck size={24} />, title: 'Free Shipping', desc: 'Orders over KSh 5,000' },
              { icon: <CreditCard size={24} />, title: 'M-Pesa Checkout', desc: 'Fast & secure payment' },
              { icon: <RotateCcw size={24} />, title: 'Easy Returns', desc: '7-day return policy' },
              { icon: <Headphones size={24} />, title: '24/7 Support', desc: 'WhatsApp us anytime' },
            ].map((item, i) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="flex flex-col items-center gap-2 text-center"
              >
                <div className="w-12 h-12 rounded-xl bg-primary/5 flex items-center justify-center text-secondary">{item.icon}</div>
                <h3 className="font-semibold text-sm">{item.title}</h3>
                <p className="text-text-light text-xs">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================
          3. FEATURED CATEGORIES
          ============================================ */}
      <section className="section-padding" aria-labelledby="categories-heading">
        <div className="max-w-7xl mx-auto">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="text-center mb-14">
            <span className="text-primary-dark text-sm font-semibold uppercase tracking-wider">Browse</span>
            <h2 id="categories-heading" className="font-heading text-3xl md:text-5xl font-bold mt-2 mb-4">Shop by Category</h2>
            <p className="text-text-light text-lg max-w-xl mx-auto">Find exactly what you're looking for — from stunning dresses to statement accessories.</p>
          </motion.div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 md:gap-6">
            {categories.map((cat, i) => (
              <motion.div
                key={cat.slug}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <Link
                  to={`/shop?category=${cat.slug}`}
                  className="group block aspect-[3/4] rounded-card overflow-hidden relative"
                  style={{ background: `linear-gradient(135deg, ${cat.color}, ${cat.color}dd)` }}
                >
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Sparkles size={32} className="text-white/20 group-hover:text-white/40 transition-all group-hover:scale-110 duration-500" />
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 p-5 text-white">
                    <h3 className="font-heading text-xl font-bold group-hover:translate-x-1 transition-transform duration-300">{cat.name}</h3>
                    <p className="text-white/70 text-sm mt-1">{cat.desc}</p>
                  </div>
                  <div className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
                    <ArrowRight size={14} className="text-white" />
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================
          4. STORYTELLING SECTION
          ============================================ */}
      <section className="bg-white section-padding" aria-labelledby="story-heading">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}>
              <span className="text-primary-dark text-sm font-semibold uppercase tracking-wider">Our Story</span>
              <h2 id="story-heading" className="font-heading text-3xl md:text-5xl font-bold mt-2 mb-6 leading-tight">
                Fashion That Celebrates <span className="text-gradient">You</span>
              </h2>
              <p className="text-text-light text-lg leading-relaxed mb-6">
                Sparkpretty Closet was born from a simple belief: every woman deserves to feel beautiful and confident in what she wears. We curate fashion that blends African vibrancy with global trends, creating pieces that tell your story.
              </p>
              <p className="text-text-light text-lg leading-relaxed mb-8">
                From the bustling streets of Nairobi to the serene beaches of Mombasa, our collections are designed for the modern Kenyan woman who embraces her unique sparkle.
              </p>
              <div className="grid grid-cols-3 gap-6">
                {[
                  { icon: <Award size={28} />, label: 'Quality First', desc: 'Handpicked fabrics' },
                  { icon: <Leaf size={28} />, label: 'Sustainable', desc: 'Ethical sourcing' },
                  { icon: <Sparkles size={28} />, label: 'Unique Style', desc: 'Curated collections' },
                ].map((item, i) => (
                  <motion.div
                    key={item.label}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.2 + i * 0.1 }}
                    className="text-center"
                  >
                    <div className="w-14 h-14 rounded-xl bg-primary/5 flex items-center justify-center text-secondary mx-auto mb-3">{item.icon}</div>
                    <h4 className="font-semibold text-sm mb-1">{item.label}</h4>
                    <p className="text-text-light text-xs">{item.desc}</p>
                  </motion.div>
                ))}
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="relative"
            >
              <div className="aspect-[4/5] rounded-2xl bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center overflow-hidden">
                <div className="text-center text-primary/30">
                  <Sparkles size={48} className="mx-auto mb-3" />
                  <p className="font-heading text-xl">Our Story</p>
                </div>
              </div>
              <div className="absolute -top-4 -right-4 bg-white rounded-xl p-5 shadow-modal max-w-xs">
                <div className="flex items-center gap-3 mb-2">
                  <div className="flex">
                    {[...Array(5)].map((_, i) => <Star key={i} size={14} className="text-yellow-400 fill-yellow-400" />)}
                  </div>
                  <span className="text-sm font-semibold">4.9/5</span>
                </div>
                <p className="text-sm text-text-light">Trusted by <strong>2,000+</strong> happy customers across Kenya</p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ============================================
          5. BEST SELLERS
          ============================================ */}
      {featured.length > 0 && (
        <section className="section-padding" aria-labelledby="bestsellers-heading">
          <div className="max-w-7xl mx-auto">
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="flex items-end justify-between mb-12">
              <div>
                <span className="text-primary-dark text-sm font-semibold uppercase tracking-wider">Most Loved</span>
                <h2 id="bestsellers-heading" className="font-heading text-3xl md:text-5xl font-bold mt-2 mb-3">Best Sellers</h2>
                <p className="text-text-light text-lg">Our customers' absolute favorites</p>
              </div>
              <Link to="/shop" className="hidden md:inline-flex items-center gap-2 text-primary-dark font-semibold hover:underline">
                View All <ArrowRight size={16} />
              </Link>
            </motion.div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
              {featured.map((product, i) => {
                const variant = product.variants?.[0] || {};
                const price = variant.price || 0;
                const salePrice = variant.salePrice;
                const inStock = variant.stock > 0;
                const isWished = wishlist.includes(product._id);
                return (
                  <motion.div
                    key={product._id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                    className="group card card-hover p-0 overflow-hidden"
                  >
                    <Link to={`/product/${product.slug}`} className="block">
                      <div className="aspect-[3/4] bg-gradient-to-br from-primary/5 to-primary/10 relative overflow-hidden">
                        <div className="absolute inset-0 flex items-center justify-center text-primary/20 font-heading text-base px-4 text-center">
                          {product.name}
                        </div>
                        {salePrice && (
                          <span className="absolute top-3 left-3 bg-error text-white text-xs font-bold px-2.5 py-1 rounded-full">
                            -{Math.round(((price - salePrice) / price) * 100)}%
                          </span>
                        )}
                        {!salePrice && product.tags?.includes('bestseller') && (
                          <span className="absolute top-3 left-3 bg-primary text-secondary text-xs font-bold px-2.5 py-1 rounded-full flex items-center gap-1">
                            <Star size={10} /> Best Seller
                          </span>
                        )}
                        <button
                          onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggleWishlist(product._id); }}
                          className="absolute top-3 right-3 w-9 h-9 bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-white z-10"
                          aria-label={isWished ? 'Remove from wishlist' : 'Add to wishlist'}
                        >
                          <Heart size={14} className={isWished ? 'text-error fill-error' : 'text-text-light'} />
                        </button>
                      </div>
                    </Link>
                    <div className="p-4">
                      {product.category && (
                        <p className="text-xs text-text-muted uppercase tracking-wider mb-1">{product.category.name}</p>
                      )}
                      <Link to={`/product/${product.slug}`}>
                        <h3 className="font-medium text-sm truncate group-hover:text-primary-dark transition-colors">{product.name}</h3>
                      </Link>
                      <div className="flex items-center gap-1 mt-1">
                        {[...Array(5)].map((_, j) => <Star key={j} size={11} className={j < 4 ? 'text-yellow-400 fill-yellow-400' : 'text-gray-200'} />)}
                        <span className="text-xs text-text-muted ml-1">(4.{i + 2})</span>
                      </div>
                      <div className="flex items-center gap-2 mt-2">
                        <span className="font-bold text-secondary">{formatPrice(salePrice || price)}</span>
                        {salePrice && <span className="text-text-light text-sm line-through">{formatPrice(price)}</span>}
                      </div>
                      <button
                        onClick={() => { if (!inStock) return toast.error('Out of stock'); addItem(product._id, 0); toast.success(`${product.name} added!`); }}
                        disabled={!inStock}
                        className="mt-3 w-full btn-primary text-sm py-2.5 flex items-center justify-center gap-2 disabled:opacity-50"
                      >
                        <ShoppingBag size={14} /> {inStock ? 'Add to Bag' : 'Out of Stock'}
                      </button>
                    </div>
                  </motion.div>
                );
              })}
            </div>
            <div className="mt-8 text-center md:hidden">
              <Link to="/shop" className="btn-outline inline-flex items-center gap-2">View All Products <ArrowRight size={16} /></Link>
            </div>
          </div>
        </section>
      )}

      {/* ============================================
          6. PROMOTIONAL BANNER
          ============================================ */}
      <section className="px-4 sm:px-6 lg:px-8" aria-label="Promotional offer">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="relative rounded-2xl overflow-hidden"
          >
            <div className="gradient-hero py-16 md:py-20 px-8 md:px-16 text-center relative">
              <div className="absolute inset-0 opacity-5" aria-hidden="true">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full blur-3xl" />
                <div className="absolute bottom-0 left-0 w-48 h-48 bg-accent rounded-full blur-3xl" />
              </div>
              <div className="relative z-10">
                <motion.span
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  className="inline-flex items-center gap-2 bg-white/20 text-white px-4 py-2 rounded-full text-sm font-medium mb-6"
                >
                  <Zap size={14} /> Limited Time Offer
                </motion.span>
                <motion.h2
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.1 }}
                  className="font-heading text-4xl md:text-6xl font-bold text-white mb-4"
                >
                  Up to 30% Off
                </motion.h2>
                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.2 }}
                  className="text-white/80 text-lg md:text-xl mb-8 max-w-lg mx-auto"
                >
                  Spring into savings! Shop our curated sale collection before it's gone.
                </motion.p>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.3 }}
                  className="flex flex-wrap gap-4 justify-center"
                >
                  <Link to="/shop" className="bg-white text-text px-8 py-4 rounded-lg font-semibold hover:bg-white/90 transition-all shadow-button inline-flex items-center gap-2 text-lg">
                    Shop the Sale <ArrowRight size={18} />
                  </Link>
                  <div className="flex items-center gap-2 text-white/70 text-sm">
                    <Clock size={16} /> Ends Sunday midnight
                  </div>
                </motion.div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ============================================
          7. NEW ARRIVALS
          ============================================ */}
      {newArrivals.length > 0 && (
        <section className="section-padding" aria-labelledby="newarrivals-heading">
          <div className="max-w-7xl mx-auto">
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="text-center mb-12">
              <span className="text-primary-dark text-sm font-semibold uppercase tracking-wider">Just In</span>
              <h2 id="newarrivals-heading" className="font-heading text-3xl md:text-5xl font-bold mt-2 mb-4">New Arrivals</h2>
              <p className="text-text-light text-lg max-w-xl mx-auto">Fresh styles that just landed. Be the first to rock the latest trends.</p>
            </motion.div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
              {newArrivals.slice(0, 8).map((product, i) => {
                const variant = product.variants?.[0] || {};
                const price = variant.price || 0;
                const salePrice = variant.salePrice;
                const inStock = variant.stock > 0;
                const isNew = product.tags?.includes('new');
                return (
                  <motion.div
                    key={product._id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: (i % 4) * 0.1 }}
                    className="group card card-hover p-0 overflow-hidden"
                  >
                    <Link to={`/product/${product.slug}`} className="block">
                      <div className="aspect-[3/4] bg-gradient-to-br from-primary/5 to-accent/10 relative overflow-hidden">
                        <div className="absolute inset-0 flex items-center justify-center text-primary/20 font-heading text-base px-4 text-center">
                          {product.name}
                        </div>
                        {isNew && (
                          <span className="absolute top-3 left-3 bg-success text-white text-xs font-bold px-2.5 py-1 rounded-full">New</span>
                        )}
                        {salePrice && (
                          <span className="absolute top-3 right-3 bg-error text-white text-xs font-bold px-2 py-1 rounded-full">
                            -{Math.round(((price - salePrice) / price) * 100)}%
                          </span>
                        )}
                        <div className="absolute bottom-3 left-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300">
                          <Link
                            to={`/product/${product.slug}`}
                            className="flex-1 bg-white/90 backdrop-blur-sm text-text text-xs font-semibold py-2 rounded-lg text-center hover:bg-white transition-colors flex items-center justify-center gap-1"
                          >
                            <Eye size={12} /> Quick View
                          </Link>
                          <button
                            onClick={(e) => { e.preventDefault(); e.stopPropagation(); if (!inStock) return toast.error('Out of stock'); addItem(product._id, 0); toast.success('Added!'); }}
                            className="w-10 bg-secondary text-white rounded-lg flex items-center justify-center hover:bg-primary-dark transition-colors"
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
                      <div className="flex items-center gap-2 mt-2">
                        <span className="font-bold text-secondary">{formatPrice(salePrice || price)}</span>
                        {salePrice && <span className="text-text-light text-sm line-through">{formatPrice(price)}</span>}
                      </div>
                      {variant.color && (
                        <div className="flex items-center gap-1 mt-2">
                          <span className="w-3 h-3 rounded-full border border-border" style={{ backgroundColor: variant.colorHex || '#ccc' }} />
                          <span className="text-xs text-text-light">{variant.color}</span>
                        </div>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* ============================================
          8. IMAGE GALLERY
          ============================================ */}
      <section className="bg-white section-padding" aria-labelledby="gallery-heading">
        <div className="max-w-7xl mx-auto">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="text-center mb-12">
            <span className="text-primary-dark text-sm font-semibold uppercase tracking-wider">Get Inspired</span>
            <h2 id="gallery-heading" className="font-heading text-3xl md:text-5xl font-bold mt-2 mb-4">Style Gallery</h2>
            <p className="text-text-light text-lg">See how our pieces come to life in real moments</p>
          </motion.div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {galleryImages.map((img, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className={`group relative rounded-card overflow-hidden cursor-pointer ${
                  i === 0 || i === 3 ? 'md:row-span-2' : ''
                }`}
              >
                <div className={`w-full ${i === 0 || i === 3 ? 'aspect-[3/5]' : 'aspect-square'} bg-gradient-to-br ${img.gradient} flex items-center justify-center`}>
                  <Sparkles size={24} className="text-white/30 group-hover:text-white/50 transition-all group-hover:scale-110 duration-500" />
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="absolute bottom-0 left-0 right-0 p-4">
                    <p className="text-white text-sm font-medium">{img.alt}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
          <div className="text-center mt-8">
            <Link to="/shop" className="btn-outline inline-flex items-center gap-2">
              Shop the Collection <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* ============================================
          9. TESTIMONIALS
          ============================================ */}
      <section className="section-padding" aria-labelledby="testimonials-heading">
        <div className="max-w-7xl mx-auto">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="text-center mb-14">
            <span className="text-primary-dark text-sm font-semibold uppercase tracking-wider">What They Say</span>
            <h2 id="testimonials-heading" className="font-heading text-3xl md:text-5xl font-bold mt-2 mb-4">Customer Love</h2>
            <p className="text-text-light text-lg">Real stories from our amazing customers across Kenya</p>
          </motion.div>

          {/* Featured Testimonial */}
          <div className="relative max-w-4xl mx-auto mb-12">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTestimonial}
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                className="bg-white rounded-2xl shadow-card p-8 md:p-12 text-center relative"
              >
                <Quote size={40} className="text-primary/10 mx-auto mb-6" />
                <p className="text-lg md:text-xl text-text leading-relaxed mb-8 max-w-2xl mx-auto">
                  "{testimonials[activeTestimonial].text}"
                </p>
                <div className="flex items-center justify-center gap-1 mb-4">
                  {[...Array(testimonials[activeTestimonial].rating)].map((_, j) => (
                    <Star key={j} size={18} className="text-yellow-400 fill-yellow-400" />
                  ))}
                </div>
                <div className="flex items-center justify-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary-dark font-bold text-lg">
                    {testimonials[activeTestimonial].avatar}
                  </div>
                  <div className="text-left">
                    <p className="font-semibold">{testimonials[activeTestimonial].name}</p>
                    <p className="text-text-light text-sm">{testimonials[activeTestimonial].location}</p>
                  </div>
                </div>
                <p className="text-xs text-text-muted mt-3">Purchased: {testimonials[activeTestimonial].product}</p>
              </motion.div>
            </AnimatePresence>
            <div className="flex justify-center gap-3 mt-6">
              <button
                onClick={prevTestimonial}
                className="w-10 h-10 rounded-full border border-border flex items-center justify-center hover:border-primary hover:text-primary-dark transition-colors"
                aria-label="Previous testimonial"
              >
                <ChevronLeft size={18} />
              </button>
              <div className="flex items-center gap-2">
                {testimonials.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveTestimonial(i)}
                    className={`w-2.5 h-2.5 rounded-full transition-all ${i === activeTestimonial ? 'bg-primary w-6' : 'bg-border hover:bg-primary/30'}`}
                    aria-label={`Go to testimonial ${i + 1}`}
                  />
                ))}
              </div>
              <button
                onClick={nextTestimonial}
                className="w-10 h-10 rounded-full border border-border flex items-center justify-center hover:border-primary hover:text-primary-dark transition-colors"
                aria-label="Next testimonial"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          </div>

          {/* Testimonial Cards Grid */}
          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.slice(0, 3).map((t, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="card hover:shadow-card-hover transition-all duration-300"
              >
                <div className="flex items-center gap-1 mb-3">
                  {[...Array(t.rating)].map((_, j) => <Star key={j} size={12} className="text-yellow-400 fill-yellow-400" />)}
                </div>
                <p className="text-sm text-text-light leading-relaxed mb-4 line-clamp-3">"{t.text}"</p>
                <div className="flex items-center gap-3 pt-3 border-t border-border">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary-dark font-bold text-sm">
                    {t.avatar}
                  </div>
                  <div>
                    <p className="font-medium text-sm">{t.name}</p>
                    <p className="text-text-light text-xs">{t.location}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================
          10. BLOG / STYLE GUIDE
          ============================================ */}
      {blogPosts.length > 0 && (
        <section className="bg-white section-padding" aria-labelledby="blog-heading">
          <div className="max-w-7xl mx-auto">
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="flex items-end justify-between mb-12">
              <div>
                <span className="text-primary-dark text-sm font-semibold uppercase tracking-wider">Style Guide</span>
                <h2 id="blog-heading" className="font-heading text-3xl md:text-5xl font-bold mt-2 mb-3">From Our Journal</h2>
                <p className="text-text-light text-lg">Fashion tips, trends, and inspiration</p>
              </div>
              <Link to="/blog" className="hidden md:inline-flex items-center gap-2 text-primary-dark font-semibold hover:underline">
                Read All <ArrowRight size={16} />
              </Link>
            </motion.div>
            <div className="grid md:grid-cols-3 gap-6">
              {blogPosts.map((post, i) => (
                <motion.article
                  key={post._id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="card card-hover p-0 overflow-hidden group"
                >
                  <Link to={`/blog/${post.slug}`} className="block">
                    <div className="aspect-video bg-gradient-to-br from-primary/5 to-accent/10 relative overflow-hidden">
                      {post.coverImage ? (
                        <img src={post.coverImage} alt={post.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center text-primary/20">
                          <BookOpen size={32} />
                        </div>
                      )}
                    </div>
                  </Link>
                  <div className="p-6">
                    <div className="flex items-center gap-3 text-xs text-text-muted mb-3">
                      <span className="flex items-center gap-1"><Clock size={12} /> {new Date(post.createdAt).toLocaleDateString('en-KE', { month: 'short', day: 'numeric' })}</span>
                      <span>{READING_TIME(post.content)} min read</span>
                    </div>
                    <Link to={`/blog/${post.slug}`}>
                      <h3 className="font-heading text-lg font-bold mb-2 group-hover:text-primary-dark transition-colors">{post.title}</h3>
                    </Link>
                    <p className="text-text-light text-sm line-clamp-2 mb-4">{post.excerpt}</p>
                    <Link to={`/blog/${post.slug}`} className="inline-flex items-center gap-1 text-primary-dark text-sm font-semibold hover:gap-2 transition-all">
                      Read More <ArrowRight size={14} />
                    </Link>
                  </div>
                </motion.article>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ============================================
          11. NEWSLETTER SIGNUP
          ============================================ */}
      <section className="gradient-hero section-padding" aria-labelledby="newsletter-heading">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}>
            <Send size={36} className="text-white/60 mx-auto mb-6" />
            <h2 id="newsletter-heading" className="font-heading text-3xl md:text-5xl font-bold text-white mb-4">
              Stay in the Spark
            </h2>
            <p className="text-white/80 text-lg mb-10 max-w-xl mx-auto">
              Get exclusive access to new arrivals, special discounts, and styling tips delivered straight to your inbox.
            </p>
            <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-3 max-w-lg mx-auto">
              <label htmlFor="home-newsletter-email" className="sr-only">Email address</label>
              <input
                id="home-newsletter-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email address"
                className="flex-1 px-6 py-4 rounded-lg bg-white/20 text-white placeholder-white/50 border border-white/30 focus:outline-none focus:ring-2 focus:ring-white/50 text-lg"
                required
              />
              <button type="submit" className="bg-white text-text px-8 py-4 rounded-lg font-bold hover:bg-white/90 transition-all shadow-button text-lg flex items-center justify-center gap-2">
                Subscribe <ArrowRight size={18} />
              </button>
            </form>
            <p className="text-white/50 text-sm mt-4">No spam. Unsubscribe anytime. Join 2,000+ fashion lovers.</p>
          </motion.div>
        </div>
      </section>

      {/* ============================================
          12. TRUST SIGNALS
          ============================================ */}
      <section className="bg-white section-padding" aria-labelledby="trust-heading">
        <div className="max-w-7xl mx-auto">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="text-center mb-12">
            <h2 id="trust-heading" className="font-heading text-3xl md:text-4xl font-bold mb-4">Why Shop With Us?</h2>
          </motion.div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { icon: <Shield size={32} />, title: 'Secure Payments', desc: 'M-Pesa and encrypted checkout' },
              { icon: <Truck size={32} />, title: 'Fast Delivery', desc: '2-5 business days nationwide' },
              { icon: <RotateCcw size={32} />, title: 'Free Returns', desc: '7-day hassle-free returns' },
              { icon: <CheckCircle size={32} />, title: 'Quality Promise', desc: 'Handpicked, tested products' },
            ].map((item, i) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="text-center"
              >
                <div className="w-16 h-16 rounded-2xl bg-primary/5 flex items-center justify-center text-secondary mx-auto mb-4">{item.icon}</div>
                <h3 className="font-semibold text-lg mb-2">{item.title}</h3>
                <p className="text-text-light text-sm">{item.desc}</p>
              </motion.div>
            ))}
          </div>
          <div className="mt-12 flex flex-wrap justify-center items-center gap-8 text-text-muted">
            <span className="text-sm font-medium">We accept:</span>
            {['M-Pesa', 'Visa', 'Mastercard', 'PayPal'].map((method) => (
              <span key={method} className="px-4 py-2 bg-bg rounded-lg text-sm font-semibold text-text-light">{method}</span>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================
          13. FINAL CTA
          ============================================ */}
      <section className="section-padding bg-secondary text-white text-center" aria-label="Call to action">
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}>
          <h2 className="font-heading text-4xl md:text-5xl font-bold mb-4">Ready to Sparkle?</h2>
          <p className="text-white/70 mb-10 max-w-lg mx-auto text-lg">
            Join thousands of women who trust Sparkpretty Closet for their wardrobe essentials. Your next favorite outfit is waiting.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link to="/shop" className="btn-primary text-lg px-10 py-4 inline-flex items-center gap-2">
              Shop Now <ArrowRight size={18} />
            </Link>
            <Link to="/contact" className="border-2 border-white text-white px-10 py-4 rounded-lg font-semibold hover:bg-white/10 transition-all text-lg inline-flex items-center gap-2">
              Talk to Us
            </Link>
          </div>
        </motion.div>
      </section>
    </div>
  );
}

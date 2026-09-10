import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Calendar, ArrowRight, Tag, Clock, BookOpen, Send,
  Share2, Facebook, Twitter, ChevronRight, ChevronLeft,
  Sparkles, Heart, Star, Eye, TrendingUp,
} from 'lucide-react';
import { api } from '../lib/api';
import SEO from '../components/SEO';
import { useContent } from '../context/ContentContext';

const fadeUp = { hidden: { opacity: 0, y: 30 }, visible: (i = 0) => ({ opacity: 1, y: 0, transition: { delay: i * 0.1, duration: 0.6 } }) };

const READING_TIME = (text) => Math.max(1, Math.ceil((text || '').split(/\s+/).length / 200));

const DEFAULT_CATEGORIES = [
  { name: 'All', slug: '', icon: '✨' },
  { name: 'Style Tips', slug: 'tips', icon: '💡' },
  { name: 'Trends', slug: 'trends', icon: '🔥' },
  { name: 'Dresses', slug: 'dresses', icon: '👗' },
  { name: 'Shoes', slug: 'shoes', icon: '👟' },
  { name: 'Accessories', slug: 'accessories', icon: '👜' },
  { name: 'Sustainability', slug: 'sustainability', icon: '🌿' },
  { name: 'Behind the Scenes', slug: 'behind-the-scenes', icon: '🎬' },
];

const DEFAULT_SPOTLIGHTS = [
  { name: 'Amina W.', location: 'Nairobi', text: 'Wore the Rose Garden Midi Dress to my friend\'s wedding and got so many compliments!', avatar: 'A', product: 'Rose Garden Midi Dress' },
  { name: 'Faith M.', location: 'Mombasa', text: 'The Strappy Heel Sandals are my go-to for every event. So comfortable and stylish!', avatar: 'F', product: 'Strappy Heel Sandals' },
  { name: 'Grace N.', location: 'Kisumu', text: 'I styled the Silk Blouse with high-waist jeans for a casual Friday look. Loved it!', avatar: 'G', product: 'Silk Touch Blouse' },
];

const DEFAULT_STYLE_GUIDES = [
  { title: 'How to Style a Midi Dress for Every Occasion', excerpt: 'From office to weekend brunch — master the art of the versatile midi dress.', gradient: 'from-pink-100 to-rose-200', icon: '👗', readTime: '5 min' },
  { title: '10 Wardrobe Essentials Every Kenyan Woman Needs', excerpt: 'Build a versatile wardrobe with these timeless basics that work hard.', gradient: 'from-amber-100 to-orange-200', icon: '✨', readTime: '4 min' },
  { title: 'Accessorizing 101: Complete Any Outfit', excerpt: 'The right accessories can transform a simple look into something extraordinary.', gradient: 'from-purple-100 to-indigo-200', icon: '👜', readTime: '3 min' },
];

const DEFAULT_BTS_ITEMS = [
  { title: 'How We Source Our Fabrics', desc: 'From local Kenyan markets to international suppliers — our fabric sourcing journey.', gradient: 'from-teal-100 to-cyan-200', icon: '🧵' },
  { title: 'Meet the Team Behind Your Orders', desc: 'Get to know the passionate people who make your Sparkpretty experience special.', gradient: 'from-violet-100 to-purple-200', icon: '👩‍💻' },
  { title: 'Our Quality Promise: From Warehouse to Door', desc: 'Every item goes through rigorous quality checks before it reaches you.', gradient: 'from-rose-100 to-pink-200', icon: '✅' },
];

export default function Blog() {
  const { get } = useContent();
  const siteName = get('site_name', 'Sparkpretty Closet');
  const siteUrl = get('site_url', 'https://sparkpretty.co.ke');
  const blogCategories = get('blog_categories', DEFAULT_CATEGORIES);
  const customerSpotlights = get('blog_spotlights', DEFAULT_SPOTLIGHTS);
  const styleGuides = get('blog_style_guides', DEFAULT_STYLE_GUIDES);
  const btsItems = get('blog_bts_items', DEFAULT_BTS_ITEMS);
  const [posts, setPosts] = useState([]);
  const [tags, setTags] = useState([]);
  const [selectedTag, setSelectedTag] = useState('');
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState('');
  const [activeCategory, setActiveCategory] = useState('');
  const [featuredPost, setFeaturedPost] = useState(null);

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams({ page, limit: 12 });
    if (selectedTag) params.set('tag', selectedTag);
    api.get(`/blog?${params}`).then((res) => {
      const allPosts = res.data.posts || [];
      setPosts(allPosts);
      setPages(res.data.pages || 1);
      if (!featuredPost && allPosts.length > 0) {
        setFeaturedPost(allPosts[0]);
      }
      setLoading(false);
    });
    api.get('/blog/tags').then((res) => setTags(res.data || []));
  }, [page, selectedTag]);

  const handleSubscribe = async (e) => {
    e.preventDefault();
    try {
      await api.post('/newsletter/subscribe', { email });
      setEmail('');
      alert('Subscribed! Welcome to the Spark Journal.');
    } catch {
      alert('Subscription failed. Try again.');
    }
  };

  const shareOnTwitter = (post) => {
    const url = `${window.location.origin}/blog/${post.slug}`;
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(post.title)}&url=${encodeURIComponent(url)}`, '_blank');
  };

  const shareOnFacebook = (post) => {
    const url = `${window.location.origin}/blog/${post.slug}`;
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank');
  };

  const displayPosts = posts.filter((p) => p._id !== featuredPost?._id);

  return (
    <div>
      <SEO
        title={get('blog_seo_title', 'Blog — Style Stories & Fashion Insights')}
        description={get('blog_seo_description', `Fashion tips, styling guides, and the latest trends from ${siteName}. Your go-to fashion hub.`)}
        url="/blog"
        jsonLd={{
          '@context': 'https://schema.org',
          '@type': 'Blog',
          name: `${siteName} Journal`,
          url: `${siteUrl}/blog`,
          description: 'Fashion tips, styling guides, and the latest trends',
        }}
      />

      {/* ============================================
          1. HERO BLOG BANNER
          ============================================ */}
      <section className="gradient-hero relative overflow-hidden min-h-[50vh] flex items-center" aria-label="Blog hero">
        <div className="absolute inset-0 opacity-10" aria-hidden="true">
          <div className="absolute top-10 left-10 w-72 h-72 bg-white rounded-full blur-3xl" />
          <div className="absolute bottom-10 right-20 w-96 h-96 bg-accent rounded-full blur-3xl" />
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28 relative z-10 w-full">
          <div className="max-w-2xl">
            <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={0}>
              <span className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm text-white px-4 py-2 rounded-full text-sm font-medium mb-6">
                <BookOpen size={14} /> {get('blog_hero_badge', 'The Spark Journal')}
              </span>
            </motion.div>
            <motion.h1
              initial="hidden" animate="visible" variants={fadeUp} custom={1}
              className="font-heading text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight"
            >
              {get('blog_hero_heading', 'Style Stories & Fashion Insights')}
            </motion.h1>
            <motion.p
              initial="hidden" animate="visible" variants={fadeUp} custom={2}
              className="text-white/80 text-lg md:text-xl mb-8 max-w-lg"
            >
              {get('blog_hero_text', 'Discover trends, styling tips, and stories from the Sparkpretty world. Your fashion journey starts here.')}
            </motion.p>
            <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={3}>
              <a href="#latest" className="bg-white text-text px-8 py-4 rounded-lg font-semibold hover:bg-white/90 transition-all shadow-button inline-flex items-center gap-2">
                {get('blog_hero_cta', 'Start Reading')} <ArrowRight size={18} />
              </a>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ============================================
          2. FEATURED POST (Hero Article)
          ============================================ */}
      {featuredPost && (
        <section className="section-padding pb-0" aria-label="Featured article">
          <div className="max-w-7xl mx-auto">
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}>
              <span className="text-primary-dark text-sm font-semibold uppercase tracking-wider">Featured Story</span>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="mt-4"
            >
              <Link to={`/blog/${featuredPost.slug}`} className="group block">
                <div className="grid md:grid-cols-2 gap-0 bg-white rounded-card overflow-hidden shadow-card hover:shadow-card-hover transition-all duration-300">
                  <div className="aspect-[4/3] md:aspect-auto bg-gradient-to-br from-primary/5 to-accent/10 relative overflow-hidden">
                    {featuredPost.coverImage ? (
                      <img src={featuredPost.coverImage} alt={featuredPost.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center text-primary/20">
                        <Sparkles size={48} />
                      </div>
                    )}
                    <div className="absolute top-4 left-4">
                      <span className="bg-secondary text-white text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1">
                        <TrendingUp size={12} /> Featured
                      </span>
                    </div>
                  </div>
                  <div className="p-8 md:p-12 flex flex-col justify-center">
                    <div className="flex items-center gap-3 text-sm text-text-muted mb-4">
                      <span className="flex items-center gap-1"><Calendar size={14} /> {new Date(featuredPost.createdAt).toLocaleDateString('en-KE', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
                      <span className="flex items-center gap-1"><Clock size={14} /> {READING_TIME(featuredPost.content)} min read</span>
                    </div>
                    <h2 className="font-heading text-2xl md:text-3xl font-bold mb-4 group-hover:text-primary-dark transition-colors leading-tight">{featuredPost.title}</h2>
                    <p className="text-text-light leading-relaxed mb-6">{featuredPost.excerpt}</p>
                    {featuredPost.tags?.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-6">
                        {featuredPost.tags.map((tag) => (
                          <span key={tag} className="text-xs bg-primary/5 text-primary-dark px-3 py-1 rounded-full">{tag}</span>
                        ))}
                      </div>
                    )}
                    <span className="inline-flex items-center gap-2 text-primary-dark font-semibold group-hover:gap-3 transition-all">
                      Read Full Article <ArrowRight size={16} />
                    </span>
                    <div className="flex items-center gap-3 mt-6 pt-4 border-t border-border">
                      <span className="text-sm text-text-light">Share:</span>
                      <button onClick={(e) => { e.preventDefault(); shareOnTwitter(featuredPost); }} className="text-text-muted hover:text-primary-dark transition-colors" aria-label="Share on Twitter"><Twitter size={16} /></button>
                      <button onClick={(e) => { e.preventDefault(); shareOnFacebook(featuredPost); }} className="text-text-muted hover:text-primary-dark transition-colors" aria-label="Share on Facebook"><Facebook size={16} /></button>
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          </div>
        </section>
      )}

      {/* ============================================
          3. CATEGORIES
          ============================================ */}
      <section className="section-padding" aria-labelledby="categories-heading" id="latest">
        <div className="max-w-7xl mx-auto">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="mb-10">
            <span className="text-primary-dark text-sm font-semibold uppercase tracking-wider">Browse Topics</span>
            <h2 id="categories-heading" className="font-heading text-3xl md:text-4xl font-bold mt-2 mb-6">Categories</h2>
            <div className="flex flex-wrap gap-3">
              {blogCategories.map((cat) => (
                <button
                  key={cat.slug}
                  onClick={() => { setSelectedTag(cat.slug); setActiveCategory(cat.slug); setPage(1); }}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium transition-all ${
                    activeCategory === cat.slug
                      ? 'bg-secondary text-white shadow-button'
                      : 'bg-white border border-border text-text-light hover:border-primary hover:text-primary-dark'
                  }`}
                >
                  <span>{cat.icon}</span> {cat.name}
                </button>
              ))}
              {tags.filter((t) => !blogCategories.find((c) => c.slug === t)).map((tag) => (
                <button
                  key={tag}
                  onClick={() => { setSelectedTag(tag); setActiveCategory(tag); setPage(1); }}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium transition-all ${
                    activeCategory === tag
                      ? 'bg-secondary text-white shadow-button'
                      : 'bg-white border border-border text-text-light hover:border-primary hover:text-primary-dark'
                  }`}
                >
                  <Tag size={12} /> {tag}
                </button>
              ))}
            </div>
          </motion.div>

          {/* Posts Grid */}
          {loading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="card p-0 overflow-hidden">
                  <div className="aspect-video skeleton" />
                  <div className="p-6 space-y-3">
                    <div className="skeleton h-4 w-24" />
                    <div className="skeleton h-6 w-full" />
                    <div className="skeleton h-4 w-full" />
                    <div className="skeleton h-4 w-3/4" />
                  </div>
                </div>
              ))}
            </div>
          ) : displayPosts.length === 0 ? (
            <div className="text-center py-20">
              <BookOpen size={48} className="text-primary/20 mx-auto mb-4" />
              <p className="text-text-light text-lg mb-4">No posts in this category yet.</p>
              <button onClick={() => { setSelectedTag(''); setActiveCategory(''); }} className="btn-primary">View All Posts</button>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {displayPosts.map((post, i) => (
                <motion.article
                  key={post._id}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  variants={fadeUp}
                  custom={i}
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
                      <span className="flex items-center gap-1"><Calendar size={12} /> {new Date(post.createdAt).toLocaleDateString('en-KE', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                      <span className="flex items-center gap-1"><Clock size={12} /> {READING_TIME(post.content)} min read</span>
                    </div>
                    <Link to={`/blog/${post.slug}`}>
                      <h3 className="font-heading text-lg font-bold mb-2 group-hover:text-primary-dark transition-colors leading-tight">{post.title}</h3>
                    </Link>
                    <p className="text-text-light text-sm line-clamp-3 mb-4 leading-relaxed">{post.excerpt}</p>
                    {post.tags?.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mb-4">
                        {post.tags.slice(0, 3).map((tag) => (
                          <span key={tag} className="text-xs bg-primary/5 text-primary-dark px-2 py-0.5 rounded-full">{tag}</span>
                        ))}
                      </div>
                    )}
                    <div className="flex items-center justify-between pt-3 border-t border-border">
                      <Link to={`/blog/${post.slug}`} className="inline-flex items-center gap-1 text-primary-dark text-sm font-semibold hover:gap-2 transition-all">
                        Read More <ArrowRight size={14} />
                      </Link>
                      <div className="flex items-center gap-2">
                        <button onClick={(e) => { e.preventDefault(); shareOnTwitter(post); }} className="text-text-muted hover:text-primary-dark transition-colors" aria-label="Share on Twitter"><Twitter size={14} /></button>
                        <button onClick={(e) => { e.preventDefault(); shareOnFacebook(post); }} className="text-text-muted hover:text-primary-dark transition-colors" aria-label="Share on Facebook"><Facebook size={14} /></button>
                      </div>
                    </div>
                  </div>
                </motion.article>
              ))}
            </div>
          )}

          {/* Pagination */}
          {pages > 1 && (
            <div className="flex justify-center items-center gap-2 mt-12">
              <button
                onClick={() => setPage(Math.max(1, page - 1))}
                disabled={page <= 1}
                className="w-10 h-10 rounded-lg border border-border text-sm font-medium hover:border-primary hover:text-primary-dark transition-all disabled:opacity-30 flex items-center justify-center"
              >
                <ChevronLeft size={16} />
              </button>
              {[...Array(pages)].map((_, i) => (
                <button
                  key={i}
                  onClick={() => setPage(i + 1)}
                  className={`w-10 h-10 rounded-lg text-sm font-medium transition-all ${
                    page === i + 1 ? 'bg-secondary text-white' : 'bg-white border border-border hover:border-primary hover:text-primary-dark'
                  }`}
                >
                  {i + 1}
                </button>
              ))}
              <button
                onClick={() => setPage(Math.min(pages, page + 1))}
                disabled={page >= pages}
                className="w-10 h-10 rounded-lg border border-border text-sm font-medium hover:border-primary hover:text-primary-dark transition-all disabled:opacity-30 flex items-center justify-center"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          )}
        </div>
      </section>

      {/* ============================================
          4. STYLE GUIDES SECTION
          ============================================ */}
      <section className="bg-white section-padding" aria-labelledby="styleguides-heading">
        <div className="max-w-7xl mx-auto">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="text-center mb-12">
            <span className="text-primary-dark text-sm font-semibold uppercase tracking-wider">{get('blog_styleguides_eyebrow', 'Get Inspired')}</span>
            <h2 id="styleguides-heading" className="font-heading text-3xl md:text-4xl font-bold mt-2 mb-4">{get('blog_styleguides_heading', 'Style Guides')}</h2>
            <p className="text-text-light text-lg max-w-xl mx-auto">{get('blog_styleguides_desc', 'Learn how to mix, match, and style your favorite pieces')}</p>
          </motion.div>
          <div className="grid md:grid-cols-3 gap-6">
            {styleGuides.map((guide, i) => (
              <motion.div
                key={guide.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="card hover:shadow-card-hover transition-all duration-300 overflow-hidden group"
              >
                <div className={`aspect-video bg-gradient-to-br ${guide.gradient} flex items-center justify-center`}>
                  <span className="text-4xl group-hover:scale-110 transition-transform duration-300">{guide.icon}</span>
                </div>
                <div className="p-6">
                  <div className="flex items-center gap-2 text-xs text-text-muted mb-3">
                    <span className="bg-primary/10 text-primary-dark px-2 py-0.5 rounded-full font-medium">Style Guide</span>
                    <span className="flex items-center gap-1"><Clock size={12} /> {guide.readTime}</span>
                  </div>
                  <h3 className="font-heading text-lg font-bold mb-2 group-hover:text-primary-dark transition-colors">{guide.title}</h3>
                  <p className="text-text-light text-sm leading-relaxed mb-4">{guide.excerpt}</p>
                  <Link to="/blog" className="inline-flex items-center gap-1 text-primary-dark text-sm font-semibold hover:gap-2 transition-all">
                    Read Guide <ArrowRight size={14} />
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================
          5. BEHIND THE SCENES
          ============================================ */}
      <section className="section-padding" aria-labelledby="bts-heading">
        <div className="max-w-7xl mx-auto">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="text-center mb-12">
            <span className="text-primary-dark text-sm font-semibold uppercase tracking-wider">{get('blog_bts_eyebrow', 'Our Process')}</span>
            <h2 id="bts-heading" className="font-heading text-3xl md:text-4xl font-bold mt-2 mb-4">{get('blog_bts_heading', 'Behind the Scenes')}</h2>
            <p className="text-text-light text-lg max-w-xl mx-auto">{get('blog_bts_desc', `Discover the people and process behind every ${siteName} piece`)}</p>
          </motion.div>
          <div className="grid md:grid-cols-3 gap-6">
            {btsItems.map((item, i) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="card hover:shadow-card-hover transition-all duration-300 overflow-hidden group"
              >
                <div className={`aspect-video bg-gradient-to-br ${item.gradient} flex items-center justify-center`}>
                  <span className="text-4xl group-hover:scale-110 transition-transform duration-300">{item.icon}</span>
                </div>
                <div className="p-6">
                  <span className="bg-accent/10 text-accent text-xs font-medium px-2 py-0.5 rounded-full">Behind the Scenes</span>
                  <h3 className="font-heading text-lg font-bold mt-3 mb-2 group-hover:text-primary-dark transition-colors">{item.title}</h3>
                  <p className="text-text-light text-sm leading-relaxed mb-4">{item.desc}</p>
                  <Link to="/blog" className="inline-flex items-center gap-1 text-primary-dark text-sm font-semibold hover:gap-2 transition-all">
                    Read Story <ArrowRight size={14} />
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================
          6. CUSTOMER SPOTLIGHTS
          ============================================ */}
      <section className="bg-white section-padding" aria-labelledby="spotlights-heading">
        <div className="max-w-7xl mx-auto">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="text-center mb-12">
            <span className="text-primary-dark text-sm font-semibold uppercase tracking-wider">{get('blog_community_eyebrow', 'Community')}</span>
            <h2 id="spotlights-heading" className="font-heading text-3xl md:text-4xl font-bold mt-2 mb-4">{get('blog_community_heading', 'Customer Spotlights')}</h2>
            <p className="text-text-light text-lg">{get('blog_spotlights_desc', `Real women, real style — see how our community wears ${siteName}`)}</p>
          </motion.div>
          <div className="grid md:grid-cols-3 gap-6">
            {customerSpotlights.map((customer, i) => (
              <motion.div
                key={customer.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="card hover:shadow-card-hover transition-all duration-300"
              >
                <div className="flex items-center gap-1 mb-3">
                  {[...Array(5)].map((_, j) => <Star key={j} size={12} className="text-yellow-400 fill-yellow-400" />)}
                </div>
                <p className="text-text-light text-sm leading-relaxed mb-4 italic">"{customer.text}"</p>
                <div className="flex items-center gap-3 pt-4 border-t border-border">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary-dark font-bold text-sm">
                    {customer.avatar}
                  </div>
                  <div>
                    <p className="font-medium text-sm">{customer.name}</p>
                    <p className="text-text-light text-xs">{customer.location} · Wearing: {customer.product}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
          <div className="text-center mt-8">
            <p className="text-text-light text-sm mb-3">Want to be featured? Tag us on social media with {get('blog_hashtag', '#SparkprettyStyle')}</p>
          </div>
        </div>
      </section>

      {/* ============================================
          7. NEWSLETTER SIGNUP
          ============================================ */}
      <section className="gradient-hero section-padding" aria-labelledby="blog-newsletter-heading">
        <div className="max-w-3xl mx-auto text-center">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}>
            <Send size={36} className="text-white/60 mx-auto mb-6" />
            <h2 id="blog-newsletter-heading" className="font-heading text-3xl md:text-4xl font-bold text-white mb-4">
              {get('blog_newsletter_heading', 'Never Miss a Style Story')}
            </h2>
            <p className="text-white/80 text-lg mb-8">
              {get('blog_newsletter_text', 'Subscribe for exclusive fashion tips, early access to new collections, and a 10% welcome discount.')}
            </p>
            <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-3 max-w-lg mx-auto">
              <label htmlFor="blog-email" className="sr-only">Email address</label>
              <input
                id="blog-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Your email address"
                className="flex-1 px-6 py-4 rounded-lg bg-white/20 text-white placeholder-white/50 border border-white/30 focus:outline-none focus:ring-2 focus:ring-white/50 text-lg"
                required
              />
              <button type="submit" className="bg-white text-text px-8 py-4 rounded-lg font-bold hover:bg-white/90 transition-all shadow-button text-lg flex items-center justify-center gap-2">
                Subscribe <ArrowRight size={18} />
              </button>
            </form>
            <p className="text-white/50 text-sm mt-4">{get('blog_newsletter_footer', 'Get 10% off your first order. Unsubscribe anytime.')}</p>
          </motion.div>
        </div>
      </section>
    </div>
  );
}

import { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Calendar, Clock, ArrowLeft, Tag, Share2, Facebook, Twitter,
  Bookmark, Send, ArrowRight, ChevronRight, Sparkles,
} from 'lucide-react';
import { api, formatPrice } from '../lib/api';
import { BlogSEO } from '../components/SEO';
import { useContent } from '../context/ContentContext';

const READING_TIME = (text) => Math.max(1, Math.ceil((text || '').split(/\s+/).length / 200));

export default function BlogPost() {
  const { slug } = useParams();
  const { get } = useContent();
  const [post, setPost] = useState(null);
  const [relatedPosts, setRelatedPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState('');
  const [bookmarked, setBookmarked] = useState(false);

  useEffect(() => {
    setLoading(true);
    api.get(`/blog/${slug}`).then((res) => {
      setPost(res.data);
      setLoading(false);
      api.get(`/blog?limit=3`).then((r) => {
        setRelatedPosts((r.data.posts || []).filter((p) => p.slug !== slug).slice(0, 3));
      });
    }).catch(() => setLoading(false));
  }, [slug]);

  const shareUrl = typeof window !== 'undefined' ? window.location.href : '';
  const shareOnTwitter = () => window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(post?.title || '')}&url=${encodeURIComponent(shareUrl)}`, '_blank');
  const shareOnFacebook = () => window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`, '_blank');
  const copyLink = () => { navigator.clipboard.writeText(shareUrl); alert('Link copied!'); };

  const handleSubscribe = async (e) => {
    e.preventDefault();
    try {
      await api.post('/newsletter/subscribe', { email });
      setEmail('');
      alert('Subscribed! Check your inbox for a welcome discount.');
    } catch {
      alert('Subscription failed.');
    }
  };

  if (loading) {
    return (
      <div className="section-padding max-w-4xl mx-auto">
        <div className="skeleton h-8 w-48 mb-4" />
        <div className="skeleton h-12 w-full mb-4" />
        <div className="skeleton h-6 w-64 mb-8" />
        <div className="skeleton aspect-video w-full mb-8" />
        <div className="space-y-3">{[...Array(8)].map((_, i) => <div key={i} className="skeleton h-4 w-full" />)}</div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="section-padding text-center">
        <h1 className="font-heading text-3xl font-bold mb-4">Post Not Found</h1>
        <p className="text-text-light mb-8">The article you're looking for doesn't exist.</p>
        <Link to="/blog" className="btn-primary inline-flex items-center gap-2"><ArrowLeft size={16} /> Back to Blog</Link>
      </div>
    );
  }

  return (
    <div>
      <BlogSEO post={post} />

      {/* Cover Image */}
      {post.coverImage && (
        <div className="w-full h-64 md:h-96 overflow-hidden relative">
          <img src={post.coverImage} alt={post.title} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
        </div>
      )}

      <article className="section-padding">
        <div className="max-w-4xl mx-auto">
          {/* Breadcrumb */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <nav className="flex items-center gap-2 text-sm text-text-light mb-6" aria-label="Breadcrumb">
              <Link to="/" className="hover:text-primary-dark">Home</Link>
              <ChevronRight size={12} />
              <Link to="/blog" className="hover:text-primary-dark">Blog</Link>
              <ChevronRight size={12} />
              <span className="text-text truncate max-w-[200px]">{post.title}</span>
            </nav>
          </motion.div>

          {/* Article Header */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <div className="flex items-center gap-3 text-sm text-text-muted mb-4 flex-wrap">
              <span className="flex items-center gap-1"><Calendar size={14} /> {new Date(post.createdAt).toLocaleDateString('en-KE', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
              <span className="flex items-center gap-1"><Clock size={14} /> {READING_TIME(post.content)} min read</span>
              <span className="text-text-light">by {post.author}</span>
            </div>

            <h1 className="font-heading text-3xl md:text-5xl font-bold mb-6 leading-tight">{post.title}</h1>

            {post.tags?.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-6">
                {post.tags.map((tag) => (
                  <Link
                    key={tag}
                    to={`/blog?tag=${tag}`}
                    className="flex items-center gap-1 text-xs bg-primary/5 text-primary-dark px-3 py-1 rounded-full hover:bg-primary/10 transition-colors"
                  >
                    <Tag size={10} /> {tag}
                  </Link>
                ))}
              </div>
            )}

            {/* Share Bar */}
            <div className="flex items-center gap-4 py-4 border-y border-border mb-8">
              <span className="text-sm font-medium text-text-light flex items-center gap-1"><Share2 size={14} /> Share:</span>
              <button onClick={shareOnTwitter} className="w-9 h-9 rounded-full bg-bg flex items-center justify-center text-text-light hover:bg-primary hover:text-white transition-all" aria-label="Share on Twitter">
                <Twitter size={16} />
              </button>
              <button onClick={shareOnFacebook} className="w-9 h-9 rounded-full bg-bg flex items-center justify-center text-text-light hover:bg-primary hover:text-white transition-all" aria-label="Share on Facebook">
                <Facebook size={16} />
              </button>
              <button onClick={copyLink} className="w-9 h-9 rounded-full bg-bg flex items-center justify-center text-text-light hover:bg-primary hover:text-white transition-all" aria-label="Copy link">
                <Bookmark size={16} />
              </button>
            </div>
          </motion.div>

          {/* Article Content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="prose prose-lg max-w-none
              prose-headings:font-heading prose-headings:text-text
              prose-p:text-text-light prose-p:leading-relaxed
              prose-a:text-secondary prose-a:no-underline hover:prose-a:underline
              prose-img:rounded-card
              prose-strong:text-text"
            dangerouslySetInnerHTML={{ __html: post.content }}
          />

          {/* Author Card */}
          <div className="mt-12 p-6 bg-bg rounded-card flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center text-primary-dark font-bold text-lg flex-shrink-0">
              {post.author?.charAt(0) || 'S'}
            </div>
            <div>
              <p className="font-semibold">{post.author || get('blog_post_author_fallback', 'Sparkpretty Team')}</p>
              <p className="text-text-light text-sm">{get('blog_post_author_bio', 'Curating fashion tips and stories for the Sparkpretty community.')}</p>
            </div>
          </div>

          {/* In-Article CTA */}
          <div className="my-12 p-8 gradient-hero rounded-card text-center text-white">
            <Sparkles size={28} className="mx-auto mb-4 text-white/60" />
            <h3 className="font-heading text-2xl font-bold mb-3">{get('blog_post_cta_heading', 'Ready to Update Your Wardrobe?')}</h3>
            <p className="text-white/80 mb-6">{get('blog_post_cta_text', 'Explore our latest collection and find your perfect look.')}</p>
            <Link to="/shop" className="bg-white text-text px-8 py-3 rounded-lg font-semibold hover:bg-white/90 transition-all inline-flex items-center gap-2">
              Shop Now <ArrowRight size={16} />
            </Link>
          </div>

          {/* Newsletter CTA */}
          <div className="mb-12 p-6 bg-bg rounded-card text-center">
            <Send size={24} className="text-primary-dark mx-auto mb-3" />
            <h3 className="font-heading text-xl font-bold mb-2">{get('blog_post_newsletter_heading', 'Enjoyed this article?')}</h3>
            <p className="text-text-light text-sm mb-4">{get('blog_post_newsletter_text', 'Subscribe for more fashion tips and get 10% off your first order.')}</p>
            <form onSubmit={handleSubscribe} className="flex gap-2 max-w-md mx-auto">
              <label htmlFor="post-newsletter" className="sr-only">Email address</label>
              <input
                id="post-newsletter"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Your email"
                className="flex-1 px-4 py-2.5 rounded-lg border border-border text-sm focus:ring-2 focus:ring-primary focus:outline-none"
                required
              />
              <button type="submit" className="btn-primary text-sm py-2.5">Subscribe</button>
            </form>
          </div>

          {/* Related Posts */}
          {relatedPosts.length > 0 && (
            <div className="border-t border-border pt-12">
              <h3 className="font-heading text-2xl font-bold mb-8">{get('blog_post_related_heading', 'You Might Also Like')}</h3>
              <div className="grid md:grid-cols-3 gap-6">
                {relatedPosts.map((rp) => (
                  <Link key={rp._id} to={`/blog/${rp.slug}`} className="group card card-hover p-0 overflow-hidden">
                    <div className="aspect-video bg-gradient-to-br from-primary/5 to-accent/10 relative overflow-hidden">
                      {rp.coverImage ? (
                        <img src={rp.coverImage} alt={rp.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center text-primary/20">
                          <Sparkles size={24} />
                        </div>
                      )}
                    </div>
                    <div className="p-5">
                      <div className="flex items-center gap-2 text-xs text-text-muted mb-2">
                        <Calendar size={12} /> {new Date(rp.createdAt).toLocaleDateString('en-KE', { month: 'short', day: 'numeric' })}
                        <span className="flex items-center gap-1"><Clock size={12} /> {READING_TIME(rp.content)} min</span>
                      </div>
                      <h4 className="font-heading text-sm font-bold group-hover:text-secondary transition-colors line-clamp-2">{rp.title}</h4>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </article>
    </div>
  );
}

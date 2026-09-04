import { Link } from 'react-router-dom';
import { Phone, MessageCircle, Mail, ArrowRight, Heart, Instagram, Facebook, Twitter, Sparkles } from 'lucide-react';
import { api } from '../lib/api';
import { useState } from 'react';
import toast from 'react-hot-toast';

const socials = [
  { name: 'Instagram', icon: <Instagram size={18} />, url: 'https://instagram.com/sparkpretty', hover: 'hover:bg-[#E4405F]' },
  { name: 'Facebook', icon: <Facebook size={18} />, url: 'https://facebook.com/sparkpretty', hover: 'hover:bg-[#1877F2]' },
  { name: 'Twitter', icon: <Twitter size={18} />, url: 'https://twitter.com/sparkpretty', hover: 'hover:bg-[#1DA1F2]' },
];

export default function Footer() {
  const [email, setEmail] = useState('');

  const handleSubscribe = async (e) => {
    e.preventDefault();
    try {
      await api.post('/newsletter/subscribe', { email });
      toast.success('Subscribed! Welcome to the Spark.');
      setEmail('');
    } catch {
      toast.error('Subscription failed. Try again.');
    }
  };

  return (
    <footer className="footer-gradient text-white relative overflow-hidden" role="contentinfo">
      {/* Decorative glow blobs */}
      <div className="absolute -top-16 -left-16 w-64 h-64 bg-white/5 rounded-full blur-3xl" aria-hidden="true" />
      <div className="absolute top-1/3 -right-20 w-80 h-80 bg-white/5 rounded-full blur-3xl" aria-hidden="true" />
      <div className="absolute bottom-0 left-1/3 w-72 h-72 bg-white/5 rounded-full blur-3xl" aria-hidden="true" />

      {/* ===== Newsletter Section ===== */}
      <div className="relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-8 text-center">
          <div className="inline-flex items-center gap-2 text-primary-light text-sm font-semibold mb-3">
            <Sparkles size={16} aria-hidden="true" /> Stay in the Spark
          </div>
          <h3 className="font-heading text-2xl md:text-3xl font-bold mb-3">Join Our Pink Community</h3>
          <p className="text-white/80 mb-6 max-w-md mx-auto">Get 10% off your first order + new arrivals, exclusive deals, and style inspiration straight to your inbox.</p>
          <form onSubmit={handleSubscribe} className="flex max-w-md mx-auto gap-2 bg-white/10 backdrop-blur-sm p-2 rounded-xl border border-white/20">
            <label htmlFor="newsletter-email" className="sr-only">Email address</label>
            <input
              id="newsletter-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Your email address"
              className="flex-1 px-4 py-2.5 rounded-lg bg-transparent text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/50"
              required
              aria-label="Email address for newsletter"
            />
            <button type="submit" className="bg-white text-[#C2185B] px-6 py-2.5 rounded-lg font-semibold hover:bg-primary-light hover:text-[#C2185B] transition-colors flex items-center gap-2 shadow-button" aria-label="Subscribe to newsletter">
              Subscribe <ArrowRight size={16} aria-hidden="true" />
            </button>
          </form>
        </div>
      </div>

      {/* ===== Footer Links ===== */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand */}
          <div>
            <h4 className="font-heading text-2xl font-bold mb-4">
              Sparkpretty<span className="text-primary-light"> Closet</span>
            </h4>
            <p className="text-white/70 text-sm leading-relaxed mb-5">
              Your destination for beautiful, confident fashion. Curated pieces that celebrate the sparkle in every woman.
            </p>
            <div className="flex gap-3">
              {socials.map((s) => (
                <a
                  key={s.name}
                  href={s.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`Follow us on ${s.name}`}
                  className={`w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white/90 hover:text-white transition-all duration-300 ${s.hover}`}
                >
                  {s.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Shop */}
          <nav aria-label="Shop links">
            <h5 className="font-heading font-semibold text-sm uppercase tracking-wider mb-5 text-primary-light">Shop</h5>
            <ul className="space-y-3 text-sm text-white/70">
              <li><Link to="/shop?category=dresses" className="hover:text-white hover:pl-1 transition-all">Dresses</Link></li>
              <li><Link to="/shop?category=tops" className="hover:text-white hover:pl-1 transition-all">Tops</Link></li>
              <li><Link to="/shop?category=bottoms" className="hover:text-white hover:pl-1 transition-all">Bottoms</Link></li>
              <li><Link to="/shop?category=shoes" className="hover:text-white hover:pl-1 transition-all">Shoes</Link></li>
              <li><Link to="/shop?category=accessories" className="hover:text-white hover:pl-1 transition-all">Accessories</Link></li>
            </ul>
          </nav>

          {/* Help */}
          <nav aria-label="Help links">
            <h5 className="font-heading font-semibold text-sm uppercase tracking-wider mb-5 text-primary-light">Help</h5>
            <ul className="space-y-3 text-sm text-white/70">
              <li><Link to="/size-guide" className="hover:text-white hover:pl-1 transition-all">Size Guide</Link></li>
              <li><Link to="/contact" className="hover:text-white hover:pl-1 transition-all">Contact Us</Link></li>
              <li><Link to="/account" className="hover:text-white hover:pl-1 transition-all">My Account</Link></li>
              <li><Link to="/account/orders" className="hover:text-white hover:pl-1 transition-all">Order History</Link></li>
              <li><Link to="/blog" className="hover:text-white hover:pl-1 transition-all">Blog</Link></li>
            </ul>
          </nav>

          {/* Contact */}
          <div>
            <h5 className="font-heading font-semibold text-sm uppercase tracking-wider mb-5 text-primary-light">Contact</h5>
            <ul className="space-y-3 text-sm text-white/70">
              <li>
                <a href="tel:0729366991" className="flex items-center gap-3 hover:text-white transition-colors" aria-label="Call 0729366991">
                  <span className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center flex-shrink-0"><Phone size={15} className="text-primary-light" aria-hidden="true" /></span>
                  0729366991
                </a>
              </li>
              <li>
                <a href="https://wa.me/254729366991" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 hover:text-white transition-colors" aria-label="Chat on WhatsApp">
                  <span className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center flex-shrink-0"><MessageCircle size={15} className="text-primary-light" aria-hidden="true" /></span>
                  WhatsApp Us
                </a>
              </li>
              <li>
                <a href="mailto:hello@sparkpretty.co.ke" className="flex items-center gap-3 hover:text-white transition-colors break-all" aria-label="Email hello@sparkpretty.co.ke">
                  <span className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center flex-shrink-0"><Mail size={15} className="text-primary-light" aria-hidden="true" /></span>
                  hello@sparkpretty.co.ke
                </a>
              </li>
            </ul>
            <div className="mt-5 flex items-center gap-2 text-xs text-white/60">
              <Heart size={13} className="text-primary-light fill-primary" aria-hidden="true" />
              <span>Supporting Kenyan women-owned business</span>
            </div>
          </div>
        </div>
      </div>

      {/* ===== Bottom Bar ===== */}
      <div className="relative border-t border-white/15">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col sm:flex-row justify-between items-center gap-4 text-sm text-white/60">
          <p>&copy; {new Date().getFullYear()} Sparkpretty Closet. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <Link to="/about" className="hover:text-white transition-colors">Privacy Policy</Link>
            <Link to="/about" className="hover:text-white transition-colors">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

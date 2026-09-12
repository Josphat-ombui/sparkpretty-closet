import { Link } from 'react-router-dom';
import { Phone, MessageCircle, Mail, ArrowRight, Heart, Instagram, Facebook, Twitter, MapPin, Clock, ShieldCheck } from 'lucide-react';
import Logo from './Logo';
import { api } from '../lib/api';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { useContent } from '../context/ContentContext';

export default function Footer() {
  const [email, setEmail] = useState('');
  const { get } = useContent();

  const phone = get('contact_phone', '0729366991');
  const phoneIntl = get('contact_whatsapp', '254729366991');
  const contactEmail = get('contact_email', 'hello@sparkpretty.co.ke');
  const location = get('contact_location', 'Nairobi, Kenya');
  const instagram = get('social_instagram', 'https://instagram.com/sparkpretty');
  const facebook = get('social_facebook', 'https://facebook.com/sparkpretty');
  const twitter = get('social_twitter', 'https://twitter.com/sparkpretty');
  const siteName = get('site_name', 'Sparkpretty Closet');
  const footerTagline = get('footer_tagline', 'Your destination for beautiful, confident fashion. Curated pieces that celebrate the sparkle in every woman.');
  const nlHeading = get('footer_newsletter_heading', 'Stay in the Spark');
  const nlText = get('footer_newsletter_text', 'Get 10% off your first order + new arrivals, exclusive deals, and style inspiration straight to your inbox.');
  const [brandFirst = 'Sparkpretty', brandSecond = 'Closet'] = siteName.split(/\s+(.+)/);

  const socials = [
    { name: 'Instagram', icon: <Instagram size={16} />, url: instagram, hover: 'hover:bg-[#E4405F]' },
    { name: 'Facebook', icon: <Facebook size={16} />, url: facebook, hover: 'hover:bg-[#1877F2]' },
    { name: 'Twitter', icon: <Twitter size={16} />, url: twitter, hover: 'hover:bg-[#1DA1F2]' },
  ];

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

  const shopLinks = [
    { to: '/shop?category=dresses', label: 'Dresses' },
    { to: '/shop?category=tops', label: 'Tops' },
    { to: '/shop?category=bottoms', label: 'Bottoms' },
    { to: '/shop?category=shoes', label: 'Shoes' },
    { to: '/shop?category=accessories', label: 'Accessories' },
  ];

  const helpLinks = [
    { to: '/size-guide', label: 'Size Guide' },
    { to: '/contact', label: 'Contact Us' },
    { to: '/account', label: 'My Account' },
    { to: '/account/orders', label: 'Order History' },
    { to: '/blog', label: 'Journal' },
  ];

  return (
    <footer className="footer-gradient text-white relative overflow-hidden" role="contentinfo">
      {/* subtle top rule */}
      <div className="h-[3px] w-full" style={{ background: 'var(--primary)' }} aria-hidden="true" />
      <div className="absolute -top-16 -left-16 w-72 h-72 bg-white/[0.04] rounded-full blur-3xl" aria-hidden="true" />
      <div className="absolute bottom-0 -right-20 w-96 h-96 bg-white/[0.04] rounded-full blur-3xl" aria-hidden="true" />

      {/* Newsletter Section */}
      <div className="relative border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 flex flex-col lg:flex-row items-center justify-between gap-6">
          <div className="text-center lg:text-left">
            <p className="eyebrow-light mb-2">{nlHeading}</p>
            <h3 className="font-heading text-2xl md:text-3xl font-bold">
              Join the Sparkpretty inner circle
            </h3>
            <p className="text-white/70 mt-2 max-w-md text-sm leading-relaxed">{nlText}</p>
          </div>
          <form onSubmit={handleSubscribe} className="flex w-full max-w-lg gap-2 bg-white/[0.08] backdrop-blur-sm p-2 rounded-xl border border-white/15">
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
            <button
              type="submit"
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg font-semibold transition-colors text-white"
              style={{ backgroundColor: 'var(--primary)' }}
              aria-label="Subscribe to newsletter"
            >
              Subscribe <ArrowRight size={16} aria-hidden="true" />
            </button>
          </form>
        </div>
      </div>

      {/* Footer Links */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
          <div>
            <Logo size={42} name={brandFirst} sub={brandSecond} light />
            <p className="text-white/60 text-sm leading-relaxed mt-5 mb-6 max-w-xs">{footerTagline}</p>
            <div className="flex gap-2.5">
              {socials.map((s) => (
                <a
                  key={s.name}
                  href={s.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`Follow us on ${s.name}`}
                  className={`w-10 h-10 rounded-full bg-white/[0.07] flex items-center justify-center text-white/80 hover:text-white transition-all duration-300 ${s.hover}`}
                >
                  {s.icon}
                </a>
              ))}
            </div>
            <div className="mt-6 flex items-center gap-2 text-xs text-white/50">
              <ShieldCheck size={14} className="text-white/70" aria-hidden="true" />
              <span>Secure M-Pesa checkout</span>
            </div>
          </div>

          <nav aria-label="Shop links">
            <h5 className="font-heading font-semibold text-sm uppercase tracking-[0.18em] mb-5 text-white/85">Shop</h5>
            <ul className="space-y-3 text-sm text-white/60">
              {shopLinks.map((l) => (
                <li key={l.label}>
                  <Link to={l.to} className="hover:text-white hover:pl-1 transition-all">{l.label}</Link>
                </li>
              ))}
            </ul>
          </nav>

          <nav aria-label="Help links">
            <h5 className="font-heading font-semibold text-sm uppercase tracking-[0.18em] mb-5 text-white/85">Explore</h5>
            <ul className="space-y-3 text-sm text-white/60">
              {helpLinks.map((l) => (
                <li key={l.label}>
                  <Link to={l.to} className="hover:text-white hover:pl-1 transition-all">{l.label}</Link>
                </li>
              ))}
            </ul>
          </nav>

          <div>
            <h5 className="font-heading font-semibold text-sm uppercase tracking-[0.18em] mb-5 text-white/85">Contact</h5>
            <ul className="space-y-4 text-sm text-white/60">
              <li>
                <a href={`tel:${phone}`} className="flex items-center gap-3 hover:text-white transition-colors" aria-label={`Call ${phone}`}>
                  <span className="w-9 h-9 rounded-lg bg-white/[0.07] border border-white/10 flex items-center justify-center flex-shrink-0">
                    <Phone size={15} className="text-white/80" aria-hidden="true" />
                  </span>
                  {phone}
                </a>
              </li>
              <li>
                <a href={`https://wa.me/${phoneIntl}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 hover:text-white transition-colors" aria-label="Chat on WhatsApp">
                  <span className="w-9 h-9 rounded-lg bg-white/[0.07] border border-white/10 flex items-center justify-center flex-shrink-0">
                    <MessageCircle size={15} className="text-white/80" aria-hidden="true" />
                  </span>
                  WhatsApp Us
                </a>
              </li>
              <li>
                <a href={`mailto:${contactEmail}`} className="flex items-center gap-3 hover:text-white transition-colors break-all" aria-label={`Email ${contactEmail}`}>
                  <span className="w-9 h-9 rounded-lg bg-white/[0.07] border border-white/10 flex items-center justify-center flex-shrink-0">
                    <Mail size={15} className="text-white/80" aria-hidden="true" />
                  </span>
                  {contactEmail}
                </a>
              </li>
              <li className="flex items-center gap-3">
                <span className="w-9 h-9 rounded-lg bg-white/[0.07] border border-white/10 flex items-center justify-center flex-shrink-0">
                  <MapPin size={15} className="text-white/80" aria-hidden="true" />
                </span>
                {location}
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="relative border-t border-white/10 bg-black/15">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col sm:flex-row justify-between items-center gap-4 text-sm text-white/50">
          <p>&copy; {new Date().getFullYear()} {siteName}. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <Link to="/about" className="hover:text-white transition-colors">Privacy Policy</Link>
            <Link to="/about" className="hover:text-white transition-colors">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
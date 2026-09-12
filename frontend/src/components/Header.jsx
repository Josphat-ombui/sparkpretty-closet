import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShoppingBag, User, Search, Menu, X, Phone, Palette, Mail,
  Clock, Instagram, Facebook, Twitter, Truck, Sparkles, Shield,
  ChevronRight, FileText,
} from 'lucide-react';
import Logo from './Logo';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useTheme, THEMES } from '../context/ThemeContext';
import { useContent } from '../context/ContentContext';

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const { count, setIsOpen } = useCart();
  const { user } = useAuth();
  const { theme, cycleTheme } = useTheme();
  const location = useLocation();
  const { get } = useContent();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => { setMobileOpen(false); }, [location]);

  const phone = get('contact_phone', '0729366991');
  const phoneIntl = get('contact_phone_intl', '254729366991');
  const email = get('contact_email', 'hello@sparkpretty.co.ke');
  const hours = get('contact_business_hours', 'Mon-Sat 8AM-8PM');
  const freeShipping = get('free_shipping_threshold', '5,000');
  const instagram = get('social_instagram', 'https://instagram.com/sparkpretty');
  const facebook = get('social_facebook', 'https://facebook.com/sparkpretty');
  const twitter = get('social_twitter', 'https://twitter.com/sparkpretty');
  const siteName = get('site_name', 'Sparkpretty Closet');
  const [brandFirst = 'Sparkpretty', brandSecond = 'Closet'] = siteName.split(/\s+(.+)/);

  const navLinks = [
    { to: '/', label: 'Home' },
    { to: '/shop', label: 'Shop' },
    { to: '/blog', label: 'Journal' },
    { to: '/about', label: 'About' },
    { to: '/contact', label: 'Contact' },
  ];

  const socials = [
    { name: 'Instagram', icon: <Instagram size={12} />, url: instagram, hover: 'hover:bg-[#E4405F]' },
    { name: 'Facebook', icon: <Facebook size={12} />, url: facebook, hover: 'hover:bg-[#1877F2]' },
    { name: 'Twitter', icon: <Twitter size={12} />, url: twitter, hover: 'hover:bg-[#1DA1F2]' },
  ];

  const isActive = (to) => (to === '/' ? location.pathname === '/' : location.pathname === to);

  return (
    <>
      {/* ===== Top Utility Bar ===== */}
      <div className="header-top text-white text-xs" role="banner">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-wrap items-center justify-between gap-x-6 gap-y-1 py-2">
          <p className="flex items-center gap-1.5 font-medium text-white/90 whitespace-nowrap">
            <Truck size={13} aria-hidden="true" />
            <span className="hidden sm:inline">Free delivery on orders over KSh {freeShipping}</span>
            <span className="sm:hidden">Free delivery over KSh {freeShipping}</span>
          </p>

          <div className="hidden md:flex items-center gap-5 text-white/80">
            <p className="flex items-center gap-1.5"><Clock size={13} aria-hidden="true" /> {hours}</p>
            <a href={`tel:${phone}`} className="flex items-center gap-1.5 hover:text-white transition-colors" aria-label={`Call us at ${phone}`}>
              <Phone size={13} aria-hidden="true" /> {phone}
            </a>
            <a href={`mailto:${email}`} className="flex items-center gap-1.5 hover:text-white transition-colors" aria-label={`Email ${email}`}>
              <Mail size={13} aria-hidden="true" /> <span className="hidden lg:inline">{email}</span><span className="lg:hidden">Email</span>
            </a>
          </div>

          <div className="flex items-center gap-1.5">
            {socials.map((s) => (
              <a
                key={s.name}
                href={s.url}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`Follow us on ${s.name}`}
                className={`w-6 h-6 rounded-full bg-white/15 flex items-center justify-center text-white hover:text-white transition-all duration-300 ${s.hover}`}
              >
                {s.icon}
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* ===== Main Header ===== */}
      <header
        className={`sticky top-0 z-50 transition-all duration-300 border-b ${
          scrolled ? 'bg-white/92 backdrop-blur-md shadow-[var(--shadow-card)]' : 'bg-white'
        }`}
        role="navigation"
        aria-label="Main navigation"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-[72px] md:h-20">
            <div className="flex items-center gap-3">
              <button
                className="md:hidden p-2 -ml-2 text-text hover:text-secondary transition-colors"
                onClick={() => setMobileOpen(!mobileOpen)}
                aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
                aria-expanded={mobileOpen}
              >
                {mobileOpen ? <X size={22} aria-hidden="true" /> : <Menu size={22} aria-hidden="true" />}
              </button>
              <Link to="/" className="flex items-center" aria-label={`${siteName} - Home`}>
                <Logo size={42} name={brandFirst} sub={brandSecond} />
              </Link>
            </div>

            <nav className="hidden md:flex items-center gap-7" aria-label="Main menu">
              {navLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`text-[13px] font-medium tracking-wide transition-colors relative py-2 ${
                    isActive(link.to) ? 'text-secondary' : 'text-text hover:text-secondary'
                  }`}
                  aria-current={isActive(link.to) ? 'page' : undefined}
                >
                  {link.label}
                  {isActive(link.to) && (
                    <motion.span
                      layoutId="nav-indicator"
                      className="absolute -bottom-0.5 left-0 right-0 h-[2px] rounded-full"
                      aria-hidden="true"
                      style={{ backgroundColor: 'var(--primary)' }}
                    />
                  )}
                </Link>
              ))}
            </nav>

            <div className="flex items-center gap-1 md:gap-2">
              <div className="hidden md:flex items-center rounded-lg border border-border overflow-hidden">
                <button
                  onClick={() => setSearchOpen(!searchOpen)}
                  className="px-3 py-2 text-text hover:text-secondary transition-colors"
                  aria-label={searchOpen ? 'Close search' : 'Search products'}
                  aria-expanded={searchOpen}
                >
                  <Search size={18} aria-hidden="true" />
                </button>
                <input
                  type="text"
                  placeholder="Search..."
                  onKeyDown={(e) => { if (e.key === 'Enter' && e.target.value.trim()) window.location.href = `/shop?search=${encodeURIComponent(e.target.value.trim())}`; }}
                  className="w-36 focus:w-52 bg-transparent py-2 pr-3 text-sm focus:outline-none transition-all duration-300 placeholder:text-text-muted"
                  aria-label="Search products"
                />
              </div>

              <button
                onClick={() => setSearchOpen(!searchOpen)}
                className="md:hidden p-2 text-text hover:text-secondary transition-colors"
                aria-label="Search products"
              >
                <Search size={19} aria-hidden="true" />
              </button>

              <Link
                to={user ? '/account' : '/login'}
                className="p-2 text-text hover:text-secondary transition-colors"
                aria-label={user ? 'My account' : 'Log in'}
              >
                <User size={19} aria-hidden="true" />
              </Link>

              {(user?.role === 'admin' || user?.role === 'editor') && (
                <Link
                  to={user?.role === 'admin' ? '/admin' : '/admin/content'}
                  className="hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition-colors text-white"
                  style={{ backgroundColor: 'var(--primary)' }}
                  aria-label={user?.role === 'admin' ? 'Admin dashboard' : 'Content manager'}
                  title={user?.role === 'admin' ? 'Admin dashboard' : 'Content manager'}
                >
                  <Shield size={15} aria-hidden="true" /> Panel
                </Link>
              )}

              <button
                onClick={cycleTheme}
                className="relative p-2 text-text hover:text-secondary transition-colors group"
                aria-label={`Theme: ${THEMES[theme].label}. Click to change theme`}
                title={`Theme: ${THEMES[theme].label}`}
              >
                <Palette size={19} aria-hidden="true" />
                <span
                  className="absolute bottom-0.5 right-0.5 w-2.5 h-2.5 rounded-full border border-white shadow"
                  style={{ backgroundColor: THEMES[theme].swatch }}
                  aria-hidden="true"
                />
              </button>

              <button
                onClick={() => setIsOpen(true)}
                className="relative p-2 text-text hover:text-secondary transition-colors"
                aria-label={`Shopping bag, ${count} items`}
              >
                <ShoppingBag size={19} aria-hidden="true" />
                <AnimatePresence>
                  {count > 0 && (
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      exit={{ scale: 0 }}
                      className="absolute -top-0.5 -right-0.5 bg-secondary text-white text-[10px] w-[18px] h-[18px] rounded-full flex items-center justify-center font-bold"
                      aria-hidden="true"
                    >
                      {count}
                    </motion.span>
                  )}
                </AnimatePresence>
              </button>
            </div>
          </div>
        </div>

        <AnimatePresence>
          {searchOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="border-t border-border overflow-hidden bg-white"
              role="search"
              aria-label="Product search"
            >
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                <form onSubmit={(e) => { e.preventDefault(); const q = e.target.search.value.trim(); if (q) window.location.href = `/shop?search=${encodeURIComponent(q)}`; }}>
                  <label htmlFor="header-search" className="sr-only">Search products</label>
                  <input
                    id="header-search"
                    name="search"
                    type="search"
                    placeholder="Search products..."
                    className="input-field"
                    autoFocus
                    aria-label="Search products"
                  />
                </form>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/30 z-40 md:hidden"
              onClick={() => setMobileOpen(false)}
              aria-hidden="true"
            />
            <motion.nav
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 26, stiffness: 220 }}
              className="fixed top-0 left-0 bottom-0 w-80 bg-white z-50 shadow-modal overflow-y-auto md:hidden"
              aria-label="Mobile menu"
            >
              <div className="border-b border-border px-6 py-5 flex items-center justify-between">
                <Logo size={38} name={brandFirst} sub={brandSecond} />
                <button onClick={() => setMobileOpen(false)} aria-label="Close menu" className="p-2 -mr-2 text-text-light hover:text-text">
                  <X size={22} aria-hidden="true" />
                </button>
              </div>
              <div className="px-6 py-6 flex flex-col">
                {navLinks.map((link, i) => (
                  <motion.div
                    key={link.to}
                    initial={{ opacity: 0, x: -16 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.06 }}
                  >
                    <Link
                      to={link.to}
                      className={`flex items-center justify-between py-3 border-b border-border/60 text-[15px] font-medium ${
                        isActive(link.to) ? 'text-secondary' : 'text-text'
                      }`}
                      aria-current={isActive(link.to) ? 'page' : undefined}
                    >
                      {link.label}
                      <ChevronRight size={16} className="text-text-muted" />
                    </Link>
                  </motion.div>
                ))}

                {user?.role === 'admin' && (
                  <motion.div key="admin" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
                    <Link to="/admin" className="flex items-center gap-2 py-3 text-primary text-[15px] font-semibold">
                      <Shield size={16} /> Admin Dashboard
                    </Link>
                  </motion.div>
                )}
                {user?.role === 'editor' && (
                  <motion.div key="admin" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
                    <Link to="/admin/content" className="flex items-center gap-2 py-3 text-primary text-[15px] font-semibold">
                      <Shield size={16} /> Content Manager
                    </Link>
                  </motion.div>
                )}
              </div>
              <div className="px-6 py-6 border-t border-border bg-bg space-y-3 text-sm">
                <a href={`tel:${phone}`} className="flex items-center gap-3 text-secondary font-semibold" aria-label={`Call us at ${phone}`}>
                  <Phone size={17} aria-hidden="true" /> {phone}
                </a>
                <a href={`mailto:${email}`} className="flex items-center gap-3 text-text-light hover:text-secondary transition-colors break-all" aria-label={`Email ${email}`}>
                  <Mail size={17} aria-hidden="true" /> {email}
                </a>
                <p className="flex items-center gap-3 text-text-light">
                  <Clock size={17} aria-hidden="true" /> {hours}
                </p>
              </div>
            </motion.nav>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
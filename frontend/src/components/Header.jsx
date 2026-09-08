import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShoppingBag, User, Search, Menu, X, Phone, Palette, Mail,
  Clock, Instagram, Facebook, Twitter, Truck, Sparkles, Shield,
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useTheme, THEMES } from '../context/ThemeContext';

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const { count, setIsOpen } = useCart();
  const { user } = useAuth();
  const { theme, cycleTheme } = useTheme();
  const location = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => { setMobileOpen(false); }, [location]);

  const navLinks = [
    { to: '/', label: 'Home' },
    { to: '/shop', label: 'Shop' },
    { to: '/blog', label: 'Blog' },
    { to: '/about', label: 'About' },
    { to: '/contact', label: 'Contact' },
  ];

  const socials = [
    { name: 'Instagram', icon: <Instagram size={13} />, url: 'https://instagram.com/sparkpretty', hover: 'hover:bg-[#E4405F]' },
    { name: 'Facebook', icon: <Facebook size={13} />, url: 'https://facebook.com/sparkpretty', hover: 'hover:bg-[#1877F2]' },
    { name: 'Twitter', icon: <Twitter size={13} />, url: 'https://twitter.com/sparkpretty', hover: 'hover:bg-[#1DA1F2]' },
  ];

  return (
    <>
      {/* ===== Top Utility Bar ===== */}
      <div className="header-top text-white text-xs" role="banner">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-wrap items-center justify-between gap-x-6 gap-y-1 py-2">
          {/* Promo message */}
          <p className="flex items-center gap-1.5 font-medium text-white/90 whitespace-nowrap">
            <Truck size={13} aria-hidden="true" />
            <span className="hidden sm:inline">Free delivery on orders over KSh 5,000</span>
            <span className="sm:hidden">Free delivery over KSh 5,000</span>
          </p>

          {/* Contact + hours (desktop) */}
          <div className="hidden md:flex items-center gap-5 text-white/85">
            <p className="flex items-center gap-1.5"><Clock size={13} aria-hidden="true" /> Mon-Sat 8AM-8PM</p>
            <a href="tel:0729366991" className="flex items-center gap-1.5 hover:text-white transition-colors" aria-label="Call us at 0729366991">
              <Phone size={13} aria-hidden="true" /> 0729366991
            </a>
            <a href="mailto:hello@sparkpretty.co.ke" className="flex items-center gap-1.5 hover:text-white transition-colors" aria-label="Email hello@sparkpretty.co.ke">
              <Mail size={13} aria-hidden="true" /> <span className="hidden lg:inline">hello@sparkpretty.co.ke</span><span className="lg:hidden">Email</span>
            </a>
          </div>

          {/* Socials */}
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
        className={`sticky top-0 z-50 transition-all duration-300 ${
          scrolled ? 'bg-white/90 backdrop-blur-md shadow-card' : 'bg-white'
        }`}
        role="navigation"
        aria-label="Main navigation"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 md:h-20">
            <button
              className="md:hidden p-2 text-text hover:text-secondary transition-colors"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={mobileOpen}
            >
              {mobileOpen ? <X size={24} aria-hidden="true" /> : <Menu size={24} aria-hidden="true" />}
            </button>

            <Link to="/" className="flex items-center" aria-label="Sparkpretty Closet - Home">
              <h1 className="font-heading text-xl md:text-2xl font-bold text-text">
                Sparkpretty<span className="text-secondary"> Closet</span>
              </h1>
            </Link>

            <nav className="hidden md:flex items-center gap-8" aria-label="Main menu">
              {navLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`text-sm font-medium transition-colors relative py-1 ${
                    location.pathname === link.to
                      ? 'text-secondary'
                      : 'text-text hover:text-secondary'
                  }`}
                  aria-current={location.pathname === link.to ? 'page' : undefined}
                >
                  {link.label}
                  {location.pathname === link.to && (
                    <motion.div
                      layoutId="nav-indicator"
                      className="absolute bottom-0 left-0 right-0 h-0.5 bg-secondary rounded-full"
                      aria-hidden="true"
                    />
                  )}
                </Link>
              ))}
            </nav>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setSearchOpen(!searchOpen)}
                className="p-2 text-text hover:text-secondary transition-colors"
                aria-label={searchOpen ? 'Close search' : 'Search products'}
                aria-expanded={searchOpen}
              >
                <Search size={20} aria-hidden="true" />
              </button>
              <Link
                to={user ? '/account' : '/login'}
                className="p-2 text-text hover:text-secondary transition-colors"
                aria-label={user ? 'My account' : 'Log in'}
              >
                <User size={20} aria-hidden="true" />
              </Link>
              {user?.role === 'admin' && (
                <Link
                  to="/admin"
                  className="p-2 text-text hover:text-primary-dark transition-colors"
                  aria-label="Admin dashboard"
                  title="Admin dashboard"
                >
                  <Shield size={20} aria-hidden="true" />
                </Link>
              )}
              <button
                onClick={cycleTheme}
                className="relative p-2 text-text hover:text-secondary transition-colors group"
                aria-label={`Theme: ${THEMES[theme].label}. Click to change theme`}
                title={`Theme: ${THEMES[theme].label}`}
              >
                <Palette size={20} aria-hidden="true" />
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
                <ShoppingBag size={20} aria-hidden="true" />
                <AnimatePresence>
                  {count > 0 && (
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      exit={{ scale: 0 }}
                      className="absolute -top-1 -right-1 bg-secondary text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold"
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
              className="border-t border-border overflow-hidden"
              role="search"
              aria-label="Product search"
            >
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                <form onSubmit={(e) => { e.preventDefault(); window.location.href = `/shop?search=${e.target.search.value}`; }}>
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
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 left-0 bottom-0 w-72 bg-white z-50 shadow-modal p-8 md:hidden"
              aria-label="Mobile menu"
            >
              <div className="flex justify-between items-center mb-8">
                <h2 className="font-heading text-xl font-bold text-text">Menu</h2>
                <button onClick={() => setMobileOpen(false)} aria-label="Close menu">
                  <X size={24} className="text-text" aria-hidden="true" />
                </button>
              </div>
              <div className="flex flex-col gap-4">
                {navLinks.map((link, i) => (
                  <motion.div
                    key={link.to}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                  >
                    <Link
                      to={link.to}
                      className={`text-lg font-medium block py-2 ${
                        location.pathname === link.to ? 'text-secondary' : 'text-text'
                      }`}
                      aria-current={location.pathname === link.to ? 'page' : undefined}
                    >
                      {link.label}
                    </Link>
                  </motion.div>
                ))}
              </div>
              <div className="mt-8 pt-6 border-t border-border space-y-3 text-sm">
                <a href="tel:0729366991" className="flex items-center gap-3 text-secondary font-semibold" aria-label="Call us at 0729366991">
                  <Phone size={18} aria-hidden="true" /> 0729366991
                </a>
                <a href="mailto:hello@sparkpretty.co.ke" className="flex items-center gap-3 text-text-light hover:text-secondary transition-colors break-all" aria-label="Email hello@sparkpretty.co.ke">
                  <Mail size={18} aria-hidden="true" /> hello@sparkpretty.co.ke
                </a>
                <p className="flex items-center gap-3 text-text-light">
                  <Clock size={18} aria-hidden="true" /> Mon-Sat 8AM-8PM
                </p>
              </div>
            </motion.nav>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

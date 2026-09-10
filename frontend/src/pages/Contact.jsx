import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Phone, MessageCircle, Mail, Send, MapPin, Clock,
  HelpCircle, Shield, Truck, RotateCcw, CheckCircle,
  ChevronDown, ChevronUp, Instagram, Facebook, Twitter,
  ArrowRight, Sparkles, Headphones, CreditCard, Zap,
} from 'lucide-react';
import SEO from '../components/SEO';
import { api } from '../lib/api';
import toast from 'react-hot-toast';
import { useContent } from '../context/ContentContext';

const fadeUp = { hidden: { opacity: 0, y: 30 }, visible: (i = 0) => ({ opacity: 1, y: 0, transition: { delay: i * 0.1, duration: 0.6 } }) };

const safeJSON = (val, fallback) => {
  if (Array.isArray(val)) return val;
  if (typeof val === 'string') { try { return JSON.parse(val); } catch {} }
  return fallback;
};

export default function Contact() {
  const { get } = useContent();
  const [form, setForm] = useState({ name: '', email: '', phone: '', subject: '', message: '' });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [openFaq, setOpenFaq] = useState(null);
  const [email, setEmail] = useState('');
  const [errors, setErrors] = useState({});

  const faqs = safeJSON(get('contact_faqs', []), []);

  const socialLinks = [
    { name: 'Instagram', icon: <Instagram size={22} />, url: get('social_instagram', 'https://instagram.com/sparkpretty'), color: '#E4405F' },
    { name: 'Facebook', icon: <Facebook size={22} />, url: get('social_facebook', 'https://facebook.com/sparkpretty'), color: '#1877F2' },
    { name: 'Twitter', icon: <Twitter size={22} />, url: get('social_twitter', 'https://twitter.com/sparkpretty'), color: '#1DA1F2' },
    { name: 'TikTok', icon: <span className="font-bold text-lg">T</span>, url: get('social_tiktok', 'https://tiktok.com/@sparkpretty'), color: '#000000' },
  ];

  const contactPhone = get('contact_phone', '0729366991');
  const contactWhatsApp = get('contact_whatsapp', '254729366991');
  const contactEmail = get('contact_email', 'hello@sparkpretty.co.ke');
  const contactLocation = get('contact_location', 'Nairobi, Kenya');
  const contactBusinessHours = get('contact_business_hours', 'Mon-Sat, 8AM-8PM');
  const contactMapsEmbed = get('contact_maps_embed', 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d15955.0!2d36.8219!3d-1.2921!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x182f173c01e3e3e3%3A0x1234567890abcdef!2sNairobi%2C%20Kenya!5e0!3m2!1sen!2ske!4v1');
  const contactHeroHeading = get('contact_hero_heading', "We'd Love to Hear From You");
  const contactHeroText = get('contact_hero_text', 'Reach out for inquiries, support, or collaborations. Our team is ready to help you find your perfect style.');
  const contactHoursDetailed = safeJSON(get('contact_hours_detailed', []), []);

  const validate = () => {
    const errs = {};
    if (!form.name.trim()) errs.name = 'Name is required';
    if (!form.email.trim()) errs.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errs.email = 'Invalid email format';
    if (!form.message.trim()) errs.message = 'Message is required';
    else if (form.message.trim().length < 10) errs.message = 'Message must be at least 10 characters';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      await api.post('/contact', form);
      setSubmitted(true);
      setForm({ name: '', email: '', phone: '', subject: '', message: '' });
      toast.success('Message sent successfully!');
    } catch {
      toast.error('Failed to send message. Please try again.');
    }
    setLoading(false);
  };

  const handleNewsletter = async (e) => {
    e.preventDefault();
    try {
      await api.post('/newsletter/subscribe', { email });
      setEmail('');
      toast.success('Subscribed! Welcome to the Spark.');
    } catch {
      toast.error('Subscription failed.');
    }
  };

  return (
    <div>
      <SEO
        title="Contact Us"
        description="Get in touch with Sparkpretty Closet. Call, WhatsApp, or email us for inquiries, support, or collaborations."
        url="/contact"
      />

      {/* ============================================
          1. HERO SECTION
          ============================================ */}
      <section className="gradient-hero relative overflow-hidden min-h-[50vh] flex items-center" aria-label="Contact hero">
        <div className="absolute inset-0 opacity-10" aria-hidden="true">
          <div className="absolute top-10 left-10 w-72 h-72 bg-white rounded-full blur-3xl" />
          <div className="absolute bottom-10 right-20 w-96 h-96 bg-accent rounded-full blur-3xl" />
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28 relative z-10 w-full">
          <div className="max-w-2xl">
            <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={0}>
              <span className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm text-white px-4 py-2 rounded-full text-sm font-medium mb-6">
                <Headphones size={14} /> We're Here to Help
              </span>
            </motion.div>
            <motion.h1
              initial="hidden" animate="visible" variants={fadeUp} custom={1}
              className="font-heading text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight"
            >
              {contactHeroHeading}
            </motion.h1>
            <motion.p
              initial="hidden" animate="visible" variants={fadeUp} custom={2}
              className="text-white/80 text-lg md:text-xl mb-8 max-w-lg"
            >
              {contactHeroText}
            </motion.p>
            <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={3} className="flex flex-wrap gap-4">
              <a href={`tel:${contactPhone}`} className="bg-white text-text px-8 py-4 rounded-lg font-semibold hover:bg-white/90 transition-all shadow-button inline-flex items-center gap-2">
                <Phone size={18} /> Call Now
              </a>
              <a href={`https://wa.me/${contactWhatsApp}`} target="_blank" rel="noopener noreferrer" className="border-2 border-white text-white px-8 py-4 rounded-lg font-semibold hover:bg-white/10 transition-all inline-flex items-center gap-2">
                <MessageCircle size={18} /> WhatsApp Us
              </a>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ============================================
          2. DIRECT CONTACT INFO
          ============================================ */}
      <section className="section-padding pb-0" aria-label="Contact methods">
        <div className="max-w-7xl mx-auto">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 -mt-20 relative z-10">
            {[
              { icon: <Phone size={24} />, title: 'Call Us', detail: contactPhone, sub: contactBusinessHours, link: `tel:${contactPhone}`, color: '#FFB6C1' },
              { icon: <MessageCircle size={24} />, title: 'WhatsApp', detail: 'Chat with us', sub: 'Instant replies', link: `https://wa.me/${contactWhatsApp}`, color: '#25D366' },
              { icon: <Mail size={24} />, title: 'Email', detail: contactEmail, sub: 'Response within 24hrs', link: `mailto:${contactEmail}`, color: '#FF8FA3' },
              { icon: <MapPin size={24} />, title: 'Location', detail: contactLocation, sub: 'Serving all 47 counties', link: null, color: '#FFB6C1' },
            ].map((card, i) => (
              <motion.div
                key={card.title}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + i * 0.1 }}
              >
                {card.link ? (
                  <a href={card.link} target={card.link.startsWith('http') ? '_blank' : undefined} rel="noopener noreferrer" className="card text-center hover:shadow-card-hover transition-all group block h-full">
                    <CardContent card={card} />
                  </a>
                ) : (
                  <div className="card text-center h-full">
                    <CardContent card={card} />
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================
          3. CONTACT FORM + MAP
          ============================================ */}
      <section className="section-padding" aria-labelledby="form-heading">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12">
            {/* Form */}
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}>
              <span className="text-primary-dark text-sm font-semibold uppercase tracking-wider">Send a Message</span>
              <h2 id="form-heading" className="font-heading text-3xl md:text-4xl font-bold mt-2 mb-6">Let's Talk</h2>

              {submitted ? (
                <div className="card text-center py-16">
                  <div className="w-16 h-16 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-4">
                    <CheckCircle size={32} className="text-success" />
                  </div>
                  <h3 className="font-heading text-2xl font-bold mb-2">Message Sent!</h3>
                  <p className="text-text-light mb-6">Thank you for reaching out. We'll get back to you within 24 hours.</p>
                  <button onClick={() => setSubmitted(false)} className="btn-primary">Send Another Message</button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="card space-y-5">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1.5" htmlFor="contact-name">Name *</label>
                      <input
                        id="contact-name"
                        className={`input-field ${errors.name ? 'border-error focus:ring-error' : ''}`}
                        value={form.name}
                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                        placeholder="Your name"
                      />
                      {errors.name && <p className="text-error text-xs mt-1">{errors.name}</p>}
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1.5" htmlFor="contact-phone">Phone</label>
                      <input
                        id="contact-phone"
                        type="tel"
                        className="input-field"
                        value={form.phone}
                        onChange={(e) => setForm({ ...form, phone: e.target.value })}
                        placeholder="07XX XXX XXX"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1.5" htmlFor="contact-email">Email *</label>
                    <input
                      id="contact-email"
                      type="email"
                      className={`input-field ${errors.email ? 'border-error focus:ring-error' : ''}`}
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      placeholder="your@email.com"
                    />
                    {errors.email && <p className="text-error text-xs mt-1">{errors.email}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1.5" htmlFor="contact-subject">Subject</label>
                    <select
                      id="contact-subject"
                      className="input-field"
                      value={form.subject}
                      onChange={(e) => setForm({ ...form, subject: e.target.value })}
                    >
                      <option value="">Select a topic</option>
                      <option value="order">Order Inquiry</option>
                      <option value="returns">Returns & Exchanges</option>
                      <option value="sizing">Sizing Help</option>
                      <option value="payment">Payment Issues</option>
                      <option value="wholesale">Wholesale / Partnerships</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1.5" htmlFor="contact-message">Message *</label>
                    <textarea
                      id="contact-message"
                      rows={5}
                      className={`input-field resize-none ${errors.message ? 'border-error focus:ring-error' : ''}`}
                      value={form.message}
                      onChange={(e) => setForm({ ...form, message: e.target.value })}
                      placeholder="How can we help you?"
                    />
                    {errors.message && <p className="text-error text-xs mt-1">{errors.message}</p>}
                  </div>
                  <button type="submit" disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2 py-3.5">
                    <Send size={16} /> {loading ? 'Sending...' : 'Send Message'}
                  </button>
                  <p className="text-text-muted text-xs text-center">We typically respond within 24 hours.</p>
                </form>
              )}
            </motion.div>

            {/* Map + Info */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="space-y-6"
            >
              {/* Google Maps Embed */}
              <div className="rounded-card overflow-hidden shadow-card h-72">
                <iframe
                  title="Sparkpretty Closet Location"
                  src={contactMapsEmbed}
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
              </div>

              {/* Support Hours */}
              <div className="card">
                <h3 className="font-heading text-lg font-bold mb-4 flex items-center gap-2">
                  <Clock size={18} className="text-primary-dark" /> Support Hours
                </h3>
                <div className="space-y-2 text-sm">
                  {contactHoursDetailed.length > 0 ? (
                    contactHoursDetailed.map((h, i) => (
                      <div key={i} className="flex justify-between">
                        <span className="text-text-light">{h.day}</span>
                        <span className="font-medium">{h.hours}</span>
                      </div>
                    ))
                  ) : (
                    <>
                      <div className="flex justify-between"><span className="text-text-light">Monday - Friday</span><span className="font-medium">8:00 AM - 8:00 PM</span></div>
                      <div className="flex justify-between"><span className="text-text-light">Saturday</span><span className="font-medium">9:00 AM - 6:00 PM</span></div>
                      <div className="flex justify-between"><span className="text-text-light">Sunday</span><span className="font-medium">10:00 AM - 4:00 PM</span></div>
                    </>
                  )}
                  <div className="pt-2 border-t border-border flex justify-between">
                    <span className="text-text-light">WhatsApp</span>
                    <span className="font-medium text-success">Available 24/7</span>
                  </div>
                </div>
              </div>

              {/* Quick Links */}
              <div className="card">
                <h3 className="font-heading text-lg font-bold mb-4 flex items-center gap-2">
                  <HelpCircle size={18} className="text-primary-dark" /> Quick Help
                </h3>
                <div className="space-y-3">
                  <Link to="/size-guide" className="flex items-center gap-3 text-sm text-text-light hover:text-primary-dark transition-colors group">
                    <div className="w-8 h-8 rounded-lg bg-primary/5 flex items-center justify-center text-primary-dark group-hover:bg-primary group-hover:text-white transition-all"><Zap size={14} /></div>
                    Size Guide
                  </Link>
                  <Link to="/shop" className="flex items-center gap-3 text-sm text-text-light hover:text-primary-dark transition-colors group">
                    <div className="w-8 h-8 rounded-lg bg-primary/5 flex items-center justify-center text-primary-dark group-hover:bg-primary group-hover:text-white transition-all"><Sparkles size={14} /></div>
                    Browse Collection
                  </Link>
                  <a href={`https://wa.me/${contactWhatsApp}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-sm text-text-light hover:text-primary-dark transition-colors group">
                    <div className="w-8 h-8 rounded-lg bg-primary/5 flex items-center justify-center text-primary-dark group-hover:bg-primary group-hover:text-white transition-all"><MessageCircle size={14} /></div>
                    Live Chat on WhatsApp
                  </a>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ============================================
          4. FAQs
          ============================================ */}
      <section className="bg-white section-padding" aria-labelledby="faq-heading">
        <div className="max-w-4xl mx-auto">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="text-center mb-12">
            <span className="text-primary-dark text-sm font-semibold uppercase tracking-wider">Got Questions?</span>
            <h2 id="faq-heading" className="font-heading text-3xl md:text-4xl font-bold mt-2 mb-4">Frequently Asked Questions</h2>
            <p className="text-text-light text-lg">Quick answers to common questions</p>
          </motion.div>
          <div className="space-y-3">
            {faqs.map((faq, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className="card p-0 overflow-hidden"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between p-5 text-left"
                  aria-expanded={openFaq === i}
                >
                  <span className="font-semibold pr-4">{faq.q}</span>
                  {openFaq === i ? <ChevronUp size={18} className="text-primary-dark flex-shrink-0" /> : <ChevronDown size={18} className="text-text-muted flex-shrink-0" />}
                </button>
                {openFaq === i && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    className="px-5 pb-5"
                  >
                    <p className="text-text-light leading-relaxed">{faq.a}</p>
                  </motion.div>
                )}
              </motion.div>
            ))}
          </div>
          <div className="text-center mt-8">
            <p className="text-text-light text-sm mb-3">Still have questions?</p>
            <a href={`https://wa.me/${contactWhatsApp}`} target="_blank" rel="noopener noreferrer" className="btn-outline inline-flex items-center gap-2">
              <MessageCircle size={16} /> Chat on WhatsApp
            </a>
          </div>
        </div>
      </section>

      {/* ============================================
          5. SOCIAL MEDIA LINKS
          ============================================ */}
      <section className="section-padding" aria-labelledby="social-heading">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}>
            <span className="text-primary-dark text-sm font-semibold uppercase tracking-wider">Stay Connected</span>
            <h2 id="social-heading" className="font-heading text-3xl md:text-4xl font-bold mt-2 mb-4">Follow Us for Style Inspiration</h2>
            <p className="text-text-light text-lg mb-10">Join our community and never miss a new arrivals, sales, or styling tips.</p>
          </motion.div>
          <div className="flex justify-center gap-4 mb-8">
            {socialLinks.map((social, i) => (
              <motion.a
                key={social.name}
                href={social.url}
                target="_blank"
                rel="noopener noreferrer"
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="w-16 h-16 rounded-2xl flex items-center justify-center text-white hover:scale-110 transition-transform duration-300 shadow-card"
                style={{ backgroundColor: social.color }}
                aria-label={`Follow us on ${social.name}`}
              >
                {social.icon}
              </motion.a>
            ))}
          </div>
          <p className="text-text-muted text-sm">Tag us with <strong>#SparkprettyStyle</strong> for a chance to be featured!</p>
        </div>
      </section>

      {/* ============================================
          6. TRUST SIGNALS
          ============================================ */}
      <section className="bg-white section-padding" aria-labelledby="trust-heading">
        <div className="max-w-7xl mx-auto">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="text-center mb-12">
            <h2 id="trust-heading" className="font-heading text-2xl md:text-3xl font-bold">Shop With Confidence</h2>
          </motion.div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { icon: <Shield size={24} />, title: 'Secure Payments', desc: 'M-Pesa & encrypted checkout' },
              { icon: <Truck size={24} />, title: 'Fast Delivery', desc: '2-5 days nationwide' },
              { icon: <RotateCcw size={24} />, title: 'Easy Returns', desc: '7-day return policy' },
              { icon: <CreditCard size={24} />, title: 'Flexible Payment', desc: 'Pay on delivery available' },
            ].map((item, i) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="text-center"
              >
                <div className="w-12 h-12 rounded-xl bg-primary/5 flex items-center justify-center text-primary-dark mx-auto mb-3">{item.icon}</div>
                <h3 className="font-semibold text-sm mb-1">{item.title}</h3>
                <p className="text-text-light text-xs">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================
          7. CTA + NEWSLETTER
          ============================================ */}
      <section className="gradient-hero section-padding" aria-label="Call to action">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}>
            <Sparkles size={36} className="text-white/60 mx-auto mb-6" />
            <h2 className="font-heading text-3xl md:text-5xl font-bold text-white mb-4">
              Have a Question? Let's Talk.
            </h2>
            <p className="text-white/80 text-lg mb-8 max-w-xl mx-auto">
              Whether you need styling advice, order help, or just want to say hi — we're all ears.
            </p>
            <div className="flex flex-wrap gap-4 justify-center mb-10">
              <a href={`https://wa.me/${contactWhatsApp}`} target="_blank" rel="noopener noreferrer" className="bg-white text-text px-8 py-4 rounded-lg font-bold hover:bg-white/90 transition-all shadow-button text-lg inline-flex items-center gap-2">
                <MessageCircle size={18} /> Chat Now
              </a>
              <Link to="/shop" className="border-2 border-white text-white px-8 py-4 rounded-lg font-semibold hover:bg-white/10 transition-all text-lg inline-flex items-center gap-2">
                Browse Collection <ArrowRight size={18} />
              </Link>
            </div>
            <div className="max-w-lg mx-auto">
              <p className="text-white/60 text-sm mb-3">Or subscribe for updates and get 10% off:</p>
              <form onSubmit={handleNewsletter} className="flex gap-2">
                <label htmlFor="contact-newsletter" className="sr-only">Email address</label>
                <input
                  id="contact-newsletter"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="flex-1 px-5 py-3 rounded-lg bg-white/20 text-white placeholder-white/50 border border-white/30 focus:outline-none focus:ring-2 focus:ring-white/50"
                  required
                />
                <button type="submit" className="bg-white text-text px-6 py-3 rounded-lg font-semibold hover:bg-white/90 transition-all">
                  Subscribe
                </button>
              </form>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}

function CardContent({ card }) {
  return (
    <>
      <div className="w-14 h-14 rounded-full mx-auto mb-4 flex items-center justify-center" style={{ backgroundColor: `${card.color}15`, color: card.color }}>
        {card.icon}
      </div>
      <h3 className="font-semibold mb-1">{card.title}</h3>
      <p className="text-text-light text-sm group-hover:text-primary-dark transition-colors">{card.detail}</p>
      <p className="text-text-muted text-xs mt-1">{card.sub}</p>
    </>
  );
}

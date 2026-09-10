import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowRight, Heart, Sparkles, Star, Award, Leaf, Recycle,
  Users, Eye, Target, Globe, Shield, Truck, RotateCcw,
  CheckCircle, Quote, BookOpen, Package, Scissors, Gem,
  Mail, MessageCircle, Phone,
} from 'lucide-react';
import SEO from '../components/SEO';
import { useContent } from '../context/ContentContext';

const fadeUp = { hidden: { opacity: 0, y: 30 }, visible: (i = 0) => ({ opacity: 1, y: 0, transition: { delay: i * 0.1, duration: 0.6 } }) };

const safeJSON = (val, fallback) => {
  if (Array.isArray(val)) return val;
  if (typeof val === 'string') { try { return JSON.parse(val); } catch {} }
  return fallback;
};

const values = [
  { icon: <Award size={28} />, title: 'Quality First', desc: 'Every piece is hand-selected and tested for quality, comfort, and durability before it reaches you.' },
  { icon: <Heart size={28} />, title: 'Customer Love', desc: 'Your satisfaction is our obsession. We go above and beyond to make every shopping experience special.' },
  { icon: <Leaf size={28} />, title: 'Sustainability', desc: 'We source ethically and are committed to reducing our environmental footprint with every collection.' },
  { icon: <Sparkles size={28} />, title: 'Unique Style', desc: 'Our curated collections blend African vibrancy with global trends for looks that stand out.' },
  { icon: <Users size={28} />, title: 'Inclusive Sizing', desc: 'Fashion is for every body. We offer a wide range of sizes to celebrate all women.' },
  { icon: <Globe size={28} />, title: 'Kenyan Pride', desc: 'Proudly serving women across Kenya, from Nairobi to Mombasa, Kisumu to Eldoret.' },
];

const craftsmanshipSteps = [
  { icon: <Eye size={24} />, title: 'Curation', desc: 'Our team hand-selects fabrics and designs from trusted suppliers across the globe.' },
  { icon: <Scissors size={24} />, title: 'Design', desc: 'Each piece is designed with attention to detail, fit, and the latest trends in mind.' },
  { icon: <Package size={24} />, title: 'Quality Check', desc: 'Rigorous quality control ensures every item meets our high standards before listing.' },
  { icon: <Sparkles size={24} />, title: 'Presentation', desc: 'Beautiful packaging and careful handling so your order arrives in perfect condition.' },
];

export default function About() {
  const { get } = useContent();

  const milestones = safeJSON(get('about_milestones', []), []);
  const team = safeJSON(get('about_team', []), []);
  const testimonials = safeJSON(get('about_testimonials', []), []);

  const siteName = get('site_name', 'Sparkpretty Closet');
  const siteUrl = get('site_url', 'https://sparkpretty.co.ke');

  return (
    <div>
      <SEO
        title="About Us"
        description="Learn about Sparkpretty Closet — Kenya's premier women's fashion destination. Our story, mission, and commitment to quality."
        url="/about"
        jsonLd={{
          '@context': 'https://schema.org',
          '@type': 'Organization',
          name: siteName,
          url: siteUrl,
          description: "Kenya's premier women's fashion destination",
          address: { '@type': 'PostalAddress', addressCountry: 'KE' },
        }}
      />

      {/* ============================================
          1. HERO SECTION
          ============================================ */}
      <section className="gradient-hero relative overflow-hidden min-h-[70vh] flex items-center" aria-label="About us hero">
        <div className="absolute inset-0 opacity-10" aria-hidden="true">
          <div className="absolute top-20 left-10 w-72 h-72 bg-white rounded-full blur-3xl" />
          <div className="absolute bottom-10 right-20 w-96 h-96 bg-accent rounded-full blur-3xl" />
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32 relative z-10 text-center">
          <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={0}>
            <span className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm text-white px-4 py-2 rounded-full text-sm font-medium mb-6">
              <Heart size={14} /> Our Story
            </span>
          </motion.div>
          <motion.h1
            initial="hidden" animate="visible" variants={fadeUp} custom={1}
            className="font-heading text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight"
          >
            {get('about_hero_heading', 'Fashion That Speaks Your Story')}
          </motion.h1>
          <motion.p
            initial="hidden" animate="visible" variants={fadeUp} custom={2}
            className="text-white/80 text-lg md:text-xl mb-10 max-w-2xl mx-auto leading-relaxed"
          >
            {get('about_hero_text', 'We believe every woman deserves to feel beautiful, confident, and radiant in what she wears. Sparkpretty Closet curates fashion that celebrates your unique sparkle.')}
          </motion.p>
          <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={3} className="flex flex-wrap gap-4 justify-center">
            <Link to="/shop" className="bg-white text-text px-8 py-4 rounded-lg font-semibold hover:bg-white/90 transition-all shadow-button inline-flex items-center gap-2 text-lg">
              Explore Collection <ArrowRight size={18} />
            </Link>
            <a href="#story" className="border-2 border-white text-white px-8 py-4 rounded-lg font-semibold hover:bg-white/10 transition-all inline-flex items-center gap-2 text-lg">
              Read Our Story
            </a>
          </motion.div>
        </div>
      </section>

      {/* ============================================
          2. BRAND STORY + TIMELINE
          ============================================ */}
      <section id="story" className="section-padding" aria-labelledby="brand-story-heading">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-start">
            {/* Story Text */}
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}>
              <span className="text-primary-dark text-sm font-semibold uppercase tracking-wider">How It Started</span>
              <h2 id="brand-story-heading" className="font-heading text-3xl md:text-5xl font-bold mt-2 mb-6 leading-tight">
                {get('about_story_heading', 'Born from a Passion for Fashion')}
              </h2>
              <p className="text-text-light text-lg leading-relaxed mb-6">
                {get('about_story_para1', 'Sparkpretty Closet was founded in 2020 with a simple dream: to bring beautiful, high-quality fashion to every Kenyan woman. What started as a small collection of hand-picked pieces has grown into a trusted fashion destination serving thousands of customers across the country.')}
              </p>
              <p className="text-text-light text-lg leading-relaxed mb-6">
                {get('about_story_para2', "Our founder, Mercy Wanjiku, noticed that many women struggled to find fashion that was both stylish and affordable. She set out to create a brand that celebrates African femininity while embracing global trends — a brand that makes every woman feel like the best version of herself.")}
              </p>
              <p className="text-text-light text-lg leading-relaxed mb-8">
                {get('about_story_para3', 'Today, we curate collections that blend elegance with everyday wearability. From stunning dresses to statement accessories, every piece in our collection is chosen with love, quality, and your unique style in mind.')}
              </p>
              <div className="flex items-center gap-8">
                <div className="text-center">
                  <p className="font-heading text-3xl font-bold text-primary-dark">{get('about_stat_customers', '2,000+')}</p>
                  <p className="text-text-light text-sm">Happy Customers</p>
                </div>
                <div className="w-px h-12 bg-border" />
                <div className="text-center">
                  <p className="font-heading text-3xl font-bold text-primary-dark">{get('about_stat_styles', '100+')}</p>
                  <p className="text-text-light text-sm">Unique Styles</p>
                </div>
                <div className="w-px h-12 bg-border" />
                <div className="text-center">
                  <p className="font-heading text-3xl font-bold text-primary-dark">{get('about_stat_counties', '47')}</p>
                  <p className="text-text-light text-sm">Counties Served</p>
                </div>
              </div>
            </motion.div>

            {/* Timeline */}
            <div className="relative">
              <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-border" aria-hidden="true" />
              <div className="space-y-8">
                {milestones.map((m, i) => (
                  <motion.div
                    key={m.year}
                    initial={{ opacity: 0, x: 20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                    className="relative pl-16"
                  >
                    <div className="absolute left-4 w-5 h-5 rounded-full bg-primary border-4 border-white shadow-card z-10" aria-hidden="true" />
                    <div className="card">
                      <span className="text-xs font-bold text-primary-dark uppercase tracking-wider">{m.year}</span>
                      <h3 className="font-heading text-lg font-bold mt-1 mb-2">{m.title}</h3>
                      <p className="text-text-light text-sm leading-relaxed">{m.desc}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================
          3. MISSION & VISION
          ============================================ */}
      <section className="bg-white section-padding" aria-labelledby="mission-heading">
        <div className="max-w-7xl mx-auto">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="text-center mb-16">
            <span className="text-primary-dark text-sm font-semibold uppercase tracking-wider">What Drives Us</span>
            <h2 id="mission-heading" className="font-heading text-3xl md:text-5xl font-bold mt-2 mb-4">Mission & Vision</h2>
          </motion.div>
          <div className="grid md:grid-cols-2 gap-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="card p-8 md:p-10 border-t-4 border-primary"
            >
              <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center text-primary-dark mb-6">
                <Target size={28} />
              </div>
              <h3 className="font-heading text-2xl font-bold mb-4">Our Mission</h3>
              <p className="text-text-light text-lg leading-relaxed mb-4">
                {get('about_mission', 'To make stunning, high-quality fashion accessible to every Kenyan woman. We bridge the gap between style and affordability, bringing you curated collections that celebrate your unique beauty.')}
              </p>
              <p className="text-text-light leading-relaxed">
                {get('about_mission_detail', "From everyday essentials to statement pieces, we're here to ensure you always have something beautiful to wear — delivered right to your doorstep with a smile.")}
              </p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="card p-8 md:p-10 border-t-4 border-accent"
            >
              <div className="w-14 h-14 rounded-xl bg-accent/10 flex items-center justify-center text-accent mb-6">
                <Globe size={28} />
              </div>
              <h3 className="font-heading text-2xl font-bold mb-4">Our Vision</h3>
              <p className="text-text-light text-lg leading-relaxed mb-4">
                {get('about_vision', "To become Africa's leading fashion destination for shoes, clothes, and bags — a brand that empowers women across the continent to express their unique style with confidence.")}
              </p>
              <p className="text-text-light leading-relaxed">
                {get('about_vision_detail', 'We envision a world where every woman has access to beautiful, sustainable fashion that makes her feel extraordinary, regardless of where she lives or what her budget is.')}
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ============================================
          4. VALUES
          ============================================ */}
      <section className="section-padding" aria-labelledby="values-heading">
        <div className="max-w-7xl mx-auto">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="text-center mb-16">
            <span className="text-primary-dark text-sm font-semibold uppercase tracking-wider">What We Stand For</span>
            <h2 id="values-heading" className="font-heading text-3xl md:text-5xl font-bold mt-2 mb-4">Our Values</h2>
            <p className="text-text-light text-lg max-w-xl mx-auto">The principles that guide everything we do</p>
          </motion.div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {values.map((v, i) => (
              <motion.div
                key={v.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="card hover:shadow-card-hover transition-all duration-300 text-center p-8"
              >
                <div className="w-16 h-16 rounded-2xl bg-primary/5 flex items-center justify-center text-primary-dark mx-auto mb-5">{v.icon}</div>
                <h3 className="font-heading text-xl font-bold mb-3">{v.title}</h3>
                <p className="text-text-light leading-relaxed">{v.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================
          5. TEAM INTRODUCTION
          ============================================ */}
      <section className="bg-white section-padding" aria-labelledby="team-heading">
        <div className="max-w-7xl mx-auto">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="text-center mb-16">
            <span className="text-primary-dark text-sm font-semibold uppercase tracking-wider">The People Behind the Spark</span>
            <h2 id="team-heading" className="font-heading text-3xl md:text-5xl font-bold mt-2 mb-4">Meet Our Team</h2>
            <p className="text-text-light text-lg max-w-xl mx-auto">Passionate people who make Sparkpretty possible every day</p>
          </motion.div>
          <div className="grid md:grid-cols-3 gap-8">
            {team.map((member, i) => (
              <motion.div
                key={member.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="card text-center p-8 hover:shadow-card-hover transition-all duration-300"
              >
                <div
                  className="w-24 h-24 rounded-full mx-auto mb-6 flex items-center justify-center text-white font-bold text-2xl"
                  style={{ backgroundColor: member.color }}
                >
                  {member.initials}
                </div>
                <h3 className="font-heading text-xl font-bold mb-1">{member.name}</h3>
                <p className="text-primary-dark text-sm font-medium mb-4">{member.role}</p>
                <p className="text-text-light text-sm leading-relaxed">{member.bio}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================
          6. CRAFTSMANSHIP & QUALITY
          ============================================ */}
      <section className="section-padding" aria-labelledby="craftsmanship-heading">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}>
              <span className="text-primary-dark text-sm font-semibold uppercase tracking-wider">How We Work</span>
              <h2 id="craftsmanship-heading" className="font-heading text-3xl md:text-5xl font-bold mt-2 mb-6 leading-tight">
                Crafted with <span className="text-gradient">Care</span>
              </h2>
              <p className="text-text-light text-lg leading-relaxed mb-8">
                Every piece in our collection goes through a meticulous process to ensure it meets our high
                standards of quality, comfort, and style. Here's how we bring fashion from concept to your closet.
              </p>
              <div className="grid grid-cols-2 gap-6">
                {craftsmanshipSteps.map((step, i) => (
                  <motion.div
                    key={step.title}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.1 + i * 0.1 }}
                  >
                    <div className="w-12 h-12 rounded-xl bg-primary/5 flex items-center justify-center text-primary-dark mb-3">{step.icon}</div>
                    <h4 className="font-semibold text-sm mb-1">{step.title}</h4>
                    <p className="text-text-light text-xs leading-relaxed">{step.desc}</p>
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
              <div className="aspect-[4/5] rounded-2xl overflow-hidden">
                <img src="/images/hero-2.jpeg" alt="Sparkpretty craftsmanship and quality" className="w-full h-full object-cover" />
              </div>
              <div className="absolute -bottom-4 -left-4 bg-white rounded-xl p-5 shadow-modal">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-success/10 flex items-center justify-center">
                    <CheckCircle size={20} className="text-success" />
                  </div>
                  <div>
                    <p className="font-semibold text-sm">100% Quality</p>
                    <p className="text-text-light text-xs">Checked & verified</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ============================================
          7. CUSTOMER PROMISE + TRUST BADGES
          ============================================ */}
      <section className="bg-white section-padding" aria-labelledby="promise-heading">
        <div className="max-w-7xl mx-auto">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="text-center mb-16">
            <span className="text-primary-dark text-sm font-semibold uppercase tracking-wider">Our Promise to You</span>
            <h2 id="promise-heading" className="font-heading text-3xl md:text-5xl font-bold mt-2 mb-4">Shop With Confidence</h2>
          </motion.div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { icon: <Shield size={32} />, title: 'Secure Payments', desc: 'M-Pesa and encrypted checkout protect every transaction' },
              { icon: <Truck size={32} />, title: 'Fast Delivery', desc: '2-5 business days to any address in Kenya' },
              { icon: <RotateCcw size={32} />, title: 'Easy Returns', desc: '7-day hassle-free return policy, no questions asked' },
              { icon: <CheckCircle size={32} />, title: 'Quality Guarantee', desc: 'Every product is hand-checked before it ships' },
            ].map((item, i) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="text-center"
              >
                <div className="w-16 h-16 rounded-2xl bg-primary/5 flex items-center justify-center text-primary-dark mx-auto mb-4">{item.icon}</div>
                <h3 className="font-semibold text-lg mb-2">{item.title}</h3>
                <p className="text-text-light text-sm">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================
          8. SOCIAL PROOF / TESTIMONIALS
          ============================================ */}
      <section className="section-padding" aria-labelledby="proof-heading">
        <div className="max-w-7xl mx-auto">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="text-center mb-16">
            <span className="text-primary-dark text-sm font-semibold uppercase tracking-wider">Social Proof</span>
            <h2 id="proof-heading" className="font-heading text-3xl md:text-5xl font-bold mt-2 mb-4">What Our Customers Say</h2>
            <p className="text-text-light text-lg">Real reviews from real women across Kenya</p>
          </motion.div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {testimonials.map((t, i) => (
              <motion.div
                key={t.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="card hover:shadow-card-hover transition-all duration-300"
              >
                <Quote size={24} className="text-primary/10 mb-3" />
                <div className="flex items-center gap-1 mb-3">
                  {[...Array(t.rating)].map((_, j) => <Star key={j} size={12} className="text-yellow-400 fill-yellow-400" />)}
                </div>
                <p className="text-sm text-text-light leading-relaxed mb-4">"{t.text}"</p>
                <div className="pt-3 border-t border-border flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-primary-dark font-bold text-xs">
                    {t.name.charAt(0)}
                  </div>
                  <div>
                    <p className="font-medium text-sm">{t.name}</p>
                    <p className="text-text-light text-xs">{t.location}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
          <div className="mt-12 text-center">
            <div className="inline-flex items-center gap-3 bg-white rounded-xl px-6 py-4 shadow-card">
              <div className="flex">
                {[...Array(5)].map((_, i) => <Star key={i} size={20} className="text-yellow-400 fill-yellow-400" />)}
              </div>
              <span className="font-bold text-lg">4.9</span>
              <span className="text-text-light text-sm">/ 5 average from {get('about_stat_customers', '2,000+')} reviews</span>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================
          9. CTA SECTION
          ============================================ */}
      <section className="gradient-hero section-padding" aria-label="Call to action">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}>
            <Sparkles size={36} className="text-white/60 mx-auto mb-6" />
            <h2 className="font-heading text-4xl md:text-5xl font-bold text-white mb-6">
              Discover Your Style Today
            </h2>
            <p className="text-white/80 text-lg mb-10 max-w-xl mx-auto">
              Join thousands of women who trust Sparkpretty Closet for their wardrobe. Your next favorite outfit is just a click away.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Link to="/shop" className="bg-white text-text px-10 py-4 rounded-lg font-bold hover:bg-white/90 transition-all shadow-button text-lg inline-flex items-center gap-2">
                Shop Now <ArrowRight size={18} />
              </Link>
              <Link to="/contact" className="border-2 border-white text-white px-10 py-4 rounded-lg font-semibold hover:bg-white/10 transition-all text-lg inline-flex items-center gap-2">
                <MessageCircle size={18} /> Chat With Us
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
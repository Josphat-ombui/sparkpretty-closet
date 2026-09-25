import { Link } from 'react-router-dom';
import SEO from '../components/SEO';
import Reveal from '../components/Reveal';
import { useContent } from '../context/ContentContext';
import { Phone, Mail } from 'lucide-react';

const section = (id, title, body) => (
  <section id={id} className="scroll-mt-28">
    <h2 className="font-heading text-2xl font-bold mb-3">{title}</h2>
    <div className="text-text-light leading-relaxed space-y-3 text-[15px]">{body}</div>
  </section>
);

export default function Policies() {
  const { get } = useContent();
  const email = get('contact_email', 'hello@sparkpretty.co.ke');
  const phone = get('contact_phone', '0729366991');
  const siteName = get('site_name', 'Sparkpretty Closet');

  const privacy = [
    <p key="p1">At {siteName}, we take your privacy seriously. This policy explains what information we collect, how we use it, and the choices you have.</p>,
    <p key="p2"><strong className="text-text">What we collect:</strong> Account details (name, email, phone, delivery addresses) needed to process orders, payment confirmations from M-Pesa, and browsing data to improve your shopping experience.</p>,
    <p key="p3"><strong className="text-text">How we use it:</strong> To fulfil your orders, send order updates, personalise your experience, and — only with your consent — share offers and style news. We never sell your personal information.</p>,
    <p key="p4"><strong className="text-text">Your choices:</strong> You can update your details, opt out of marketing, or request deletion of your data at any time by contacting us at <a href={`mailto:${email}`} className="text-secondary hover:underline">{email}</a>.</p>,
  ];
  const terms = [
    <p key="t1">By shopping with {siteName}, you agree to these terms. Please read them carefully before placing an order.</p>,
    <p key="t2"><strong className="text-text">Orders & payment:</strong> All prices are in Kenyan Shillings (KES) and are whole numbers. Payment is via M-Pesa; your order is confirmed once payment is received.</p>,
    <p key="t3"><strong className="text-text">Shipping:</strong> Orders are delivered nationwide within 2-5 business days. Free delivery applies on orders above the threshold advertised at checkout.</p>,
    <p key="t4"><strong className="text-text">Returns:</strong> You have 7 days from delivery to request a return on unworn items with tags attached. Return & exchange details are available on request.</p>,
    <p key="t5"><strong className="text-text">Contact:</strong> Questions? Reach us at <a href={`tel:${phone}`} className="text-secondary hover:underline">{phone}</a> or <a href={`mailto:${email}`} className="text-secondary hover:underline">{email}</a>.</p>,
  ];

  return (
    <div>
      <SEO
        title="Privacy Policy & Terms of Service"
        description={`Privacy policy and terms of service for ${siteName}. Learn how we protect your data and what to expect when you shop with us.`}
        url="/policies"
      />

      <section className="section-padding">
        <div className="max-w-3xl mx-auto">
          <Reveal>
            <span className="eyebrow">Good to Know</span>
            <h1 className="font-heading text-4xl md:text-5xl font-bold mt-2 mb-6">Policies</h1>
            <p className="text-text-light text-lg mb-12">Everything you need to know about shopping with {siteName} — your data and your order, in plain language.</p>
          </Reveal>

          <div className="grid gap-10">
            <Reveal>{section('privacy', 'Privacy Policy', privacy)}</Reveal>
            <Reveal>{section('terms', 'Terms of Service', terms)}</Reveal>
          </div>

          <Reveal className="mt-12">
            <div className="card p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <h3 className="font-heading text-lg font-bold">Still have questions?</h3>
                <p className="text-text-light text-sm mt-1">Our team is happy to help.</p>
              </div>
              <div className="flex gap-3">
                <Link to="/contact" className="btn-primary px-6 py-3 text-sm">Contact Us</Link>
                <a href={`tel:${phone}`} className="btn-outline px-6 py-3 text-sm inline-flex items-center gap-2"><Phone size={15} /> {phone}</a>
              </div>
            </div>
          </Reveal>
        </div>
      </section>
    </div>
  );
}
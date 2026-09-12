import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { api } from '../lib/api';

const ContentContext = createContext();

export const useContent = () => useContext(ContentContext);

function safeParse(value) {
  if (typeof value !== 'string') return value;
  try { return JSON.parse(value); } catch { return value; }
}

const DEFAULTS = {
  site_name: 'Sparkpretty Closet',
  site_tagline: "Women's Fashion",
  site_url: 'https://sparkpretty.co.ke',
  contact_phone: '0729366991',
  contact_phone_intl: '254729366991',
  contact_email: 'hello@sparkpretty.co.ke',
  contact_whatsapp: '254729366991',
  contact_location: 'Nairobi, Kenya',
  contact_business_hours: 'Mon-Sat 8AM-8PM',
  social_instagram: 'https://instagram.com/sparkpretty',
  social_facebook: 'https://facebook.com/sparkpretty',
  social_twitter: 'https://twitter.com/sparkpretty',
  social_tiktok: 'https://tiktok.com/@sparkpretty',
  free_shipping_threshold: '5,000',
  home_hero_badge: 'New Collection 2026',
  home_hero_heading: 'Wear Your Beautiful Sparkle',
  home_hero_subheading: 'Curated fashion for the confident, sparkling woman. Discover pieces that celebrate your unique beauty and make you feel extraordinary.',
  home_hero_cta: 'Shop New Arrivals',
  home_hero_cta_link: '/shop',
  home_hero_image: '/images/hero-1.jpeg',
  home_promo_heading: 'Up to 30% Off',
  home_cta_heading: 'Ready to Sparkle?',
  home_cta_text: 'Join thousands of women who trust Sparkpretty Closet for their wardrobe essentials. Your next favorite outfit is waiting.',
  home_newsletter_heading: 'Stay in the Spark',
  home_newsletter_subscribers: '2,000+',
  company_legal_name: 'Sparkpretty Closet',
  company_tagline: "Premier Women's Fashion · Kenya",
  company_krapin: 'P000000000K',
  company_vat: '',
  company_reg_number: '',
  company_address: 'Nairobi, Kenya',
  company_city: 'Nairobi',
  company_county: 'Nairobi County',
  company_phone: '0729366991',
  company_email: 'hello@sparkpretty.co.ke',
  company_website: 'https://sparkpretty.co.ke',
  company_logo: '/images/logo-mark.svg',
  company_bank_name: '',
  company_bank_account: '',
  company_bank_branch: '',
  company_mpesa_paybill: '',
  company_signature_name: 'Authorised Signature',
  company_quote_terms: 'This quotation is valid for 14 days from the date of issue. Prices are in Kenyan Shillings (KES) and inclusive of applicable taxes unless stated otherwise.',
  company_invoice_terms: 'Payment is due within 7 days of the invoice date unless otherwise agreed. Please reference the invoice number when making payment.',
  company_receipt_note: 'Thank you for your business. This receipt confirms payment received.',
};

function parseJSONValue(val) {
  if (val === undefined || val === null) return val;
  if (typeof val === 'string' && (val.startsWith('[') || val.startsWith('{'))) {
    try { return JSON.parse(val); } catch { return val; }
  }
  return val;
}

export const ContentProvider = ({ children }) => {
  const [content, setContent] = useState({});
  const [loaded, setLoaded] = useState(false);

  const loadContent = useCallback(() => {
    api.get('/site/content')
      .then((res) => {
        const raw = res.data || {};
        const parsed = {};
        Object.entries(raw).forEach(([k, v]) => { parsed[k] = parseJSONValue(v); });
        setContent(parsed);
      })
      .catch(() => {})
      .finally(() => setLoaded(true));
  }, []);

  useEffect(() => { loadContent(); }, [loadContent]);

  const get = useCallback((key, fallback) => {
    const val = content[key];
    if (val !== undefined && val !== null && val !== '') return val;
    if (fallback !== undefined) return fallback;
    return DEFAULTS[key] ?? '';
  }, [content]);

  const num = useCallback((key, fallback) => {
    const n = Number(String(get(key, fallback)).replace(/[^0-9.]/g, ''));
    return Number.isFinite(n) ? n : 0;
  }, [get]);

  return (
    <ContentContext.Provider value={{ content, loaded, get, num, reload: loadContent }}>
      {children}
    </ContentContext.Provider>
  );
};

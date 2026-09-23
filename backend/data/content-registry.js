// Master content registry: every editable site field, grouped by section.
// This is the single source of truth used by:
//   - seed-content.js  (bootstrap defaults + metadata)
//   - POST /api/admin/content/seed   (idempotent admin bootstrap)
//   - GET  /api/admin/content/registry (admin UI / frontend builds)
//   - GET  /api/site/sections         (public sections blueprint)
//
// `value` is the DEFAULT value used only when a field does not exist yet.
// Existing customized values are always preserved on reseed.

// Ordered section labels for admin grouping / public sections blueprint
export const SECTION_LABELS = {
  general: 'General & SEO',
  header: 'Header & Navigation',
  contact: 'Contact Information',
  social: 'Social Links',
  home_hero: 'Home — Hero',
  home_categories: 'Home — Shop by Category',
  home_story: 'Home — Our Story',
  home_tabs: 'Home — Best Sellers / New Arrivals',
  home_gallery: 'Home — Style Gallery',
  home_testimonials: 'Home — Customer Love',
  home_journal: 'Home — From Our Journal',
  home_promo: 'Home — Promo Banner',
  home_newsletter: 'Home — Newsletter',
  home_cta: 'Home — Final CTA',
  home_trust: 'Home — Trust & Guarantees',
  footer: 'Footer',
  about: 'About Page',
  contact_page: 'Contact Page',
  shopping: 'Shopping & Product Pages',
  shipping: 'Shipping & Trust',
  blog: 'Blog Pages',
  size_guide: 'Size Guide',
  business: 'Business / Documents',
  seo: 'SEO',
};

export const SECTION_ORDER = [
  'general', 'header', 'contact', 'social',
  'home_hero', 'home_categories', 'home_story', 'home_tabs', 'home_gallery',
  'home_testimonials', 'home_journal', 'home_promo', 'home_newsletter',
  'home_cta', 'home_trust', 'footer',
  'about', 'contact_page', 'shopping', 'shipping', 'blog', 'size_guide',
  'business', 'seo',
];

const json = (value) => JSON.stringify(value);

export const CONTENT_REGISTRY = [
  // ===== GENERAL =====
  { key: 'site_name', value: 'Sparkpretty Closet', type: 'text', group: 'general', section: 'general', label: 'Site Name', description: 'Brand name displayed in header, footer, and SEO' },
  { key: 'site_tagline', value: "Women's Fashion", type: 'text', group: 'general', section: 'general', label: 'Site Tagline', description: 'Tagline shown next to brand name' },
  { key: 'site_logo', value: '/images/logo-mark.svg', type: 'image', group: 'general', section: 'general', label: 'Site Logo', description: 'Logo / brand mark used in header and footer' },
  { key: 'site_url', value: 'https://sparkpretty.co.ke', type: 'text', group: 'general', section: 'general', label: 'Site URL', description: 'Canonical site URL' },
  { key: 'site_description', value: "Kenya's premier women's fashion destination. Curated dresses, tops, shoes & accessories with M-Pesa checkout.", type: 'textarea', group: 'seo', section: 'general', label: 'Default Meta Description', description: 'Used when no page-specific description is set' },
  { key: 'site_og_image', value: 'https://placehold.co/1200x630/FFB6C1/000000?text=Sparkpretty+Closet', type: 'image', group: 'seo', section: 'general', label: 'Default OG Image', description: 'Social media share image fallback' },

  // ===== HEADER & NAVIGATION =====
  { key: 'header_announcement', value: 'Free shipping over KSh 5,000', type: 'text', group: 'content', section: 'header', label: 'Announcement Bar Text', description: 'Rotating / static notice at the very top of the site' },
  { key: 'header_announcement_link', value: '/shop', type: 'text', group: 'content', section: 'header', label: 'Announcement Bar Link', description: 'URL the announcement bar links to' },
  { key: 'header_nav_links', value: json([
    { label: 'Home', to: '/' },
    { label: 'Shop', to: '/shop' },
    { label: 'Journal', to: '/blog' },
    { label: 'About', to: '/about' },
    { label: 'Contact', to: '/contact' },
  ]), type: 'json', group: 'content', section: 'header', label: 'Navigation Links', description: 'JSON array of {label, to} — main menu items' },
  { key: 'header_link_shop', value: 'Shop', type: 'text', group: 'content', section: 'header', label: 'Shop Link Label', description: 'Label for the main shop menu item' },
  { key: 'header_link_journal', value: 'Journal', type: 'text', group: 'content', section: 'header', label: 'Journal Link Label', description: 'Label for the blog/journal menu item' },
  { key: 'header_link_about', value: 'About', type: 'text', group: 'content', section: 'header', label: 'About Link Label', description: 'Label for the about menu item' },
  { key: 'header_link_contact', value: 'Contact', type: 'text', group: 'content', section: 'header', label: 'Contact Link Label', description: 'Label for the contact menu item' },
  { key: 'header_link_home', value: 'Home', type: 'text', group: 'content', section: 'header', label: 'Home Link Label', description: 'Label for the home menu item' },
  { key: 'header_shop_cta', value: 'Shop Now', type: 'text', group: 'content', section: 'header', label: 'Header Shop CTA', description: 'Action button text in the header' },

  // ===== CONTACT INFO =====
  { key: 'contact_phone', value: '0729366991', type: 'text', group: 'contact', section: 'contact', label: 'Phone Number', description: 'Primary phone displayed in header, footer, and contact page' },
  { key: 'contact_phone_intl', value: '254729366991', type: 'text', group: 'contact', section: 'contact', label: 'Phone (International)', description: 'E.164 format for WhatsApp links' },
  { key: 'contact_email', value: 'hello@sparkpretty.co.ke', type: 'text', group: 'contact', section: 'contact', label: 'Email Address', description: 'Primary email displayed across the site' },
  { key: 'contact_whatsapp', value: '254729366991', type: 'text', group: 'contact', section: 'contact', label: 'WhatsApp Number', description: 'International format for wa.me links' },
  { key: 'contact_location', value: 'Nairobi, Kenya', type: 'text', group: 'contact', section: 'contact', label: 'Location', description: 'Physical location displayed on contact page' },
  { key: 'contact_business_hours', value: 'Mon-Sat 8AM-8PM', type: 'text', group: 'contact', section: 'contact', label: 'Business Hours (short)', description: 'Short business hours shown in header' },
  { key: 'contact_hours_detailed', value: json([
    { day: 'Monday - Friday', hours: '8:00 AM - 8:00 PM' },
    { day: 'Saturday', hours: '9:00 AM - 6:00 PM' },
    { day: 'Sunday', hours: '10:00 AM - 4:00 PM' },
    { day: 'WhatsApp', hours: 'Available 24/7' },
  ]), type: 'json', group: 'contact', section: 'contact', label: 'Detailed Business Hours', description: 'Full hours table for contact page' },
  { key: 'contact_maps_embed', value: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d15955.0!2d36.8219!3d-1.2921!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x182f173c01e3e3e3%3A0x1234567890abcdef!2sNairobi%2C%20Kenya!5e0!3m2!1sen!2ske!4v1', type: 'text', group: 'contact', section: 'contact', label: 'Google Maps Embed URL', description: 'iframe src for the map on contact page' },
  { key: 'default_country', value: 'Kenya', type: 'text', group: 'contact', section: 'contact', label: 'Default Country', description: 'Country pre-selected at checkout' },
  { key: 'whatsapp_cta', value: 'Ask about this item', type: 'text', group: 'contact', section: 'contact', label: 'WhatsApp CTA Text', description: 'Button text for the WhatsApp enquiry link on product pages' },

  // ===== SOCIAL LINKS =====
  { key: 'social_instagram', value: 'https://instagram.com/sparkpretty', type: 'text', group: 'social', section: 'social', label: 'Instagram URL', description: 'Full Instagram profile URL' },
  { key: 'social_facebook', value: 'https://facebook.com/sparkpretty', type: 'text', group: 'social', section: 'social', label: 'Facebook URL', description: 'Full Facebook page URL' },
  { key: 'social_twitter', value: 'https://twitter.com/sparkpretty', type: 'text', group: 'social', section: 'social', label: 'Twitter URL', description: 'Full Twitter profile URL' },
  { key: 'social_tiktok', value: 'https://tiktok.com/@sparkpretty', type: 'text', group: 'social', section: 'social', label: 'TikTok URL', description: 'Full TikTok profile URL' },

  // ===== HOME PAGE - HERO =====
  { key: 'home_hero_badge', value: 'New Collection 2026', type: 'text', group: 'content', section: 'home_hero', label: 'Hero Badge Text', description: 'Small badge above the main headline' },
  { key: 'home_hero_heading', value: 'Wear Your Beautiful Sparkle', type: 'text', group: 'content', section: 'home_hero', label: 'Hero Heading', description: 'Main hero headline', placeholder: 'Wear Your Beautiful Sparkle' },
  { key: 'home_hero_subheading', value: 'Curated fashion for the confident, sparkling woman. Discover pieces that celebrate your unique beauty and make you feel extraordinary.', type: 'textarea', group: 'content', section: 'home_hero', label: 'Hero Subheading', description: 'Hero paragraph text below the heading' },
  { key: 'home_hero_cta', value: 'Shop New Arrivals', type: 'text', group: 'content', section: 'home_hero', label: 'Hero CTA Button', description: 'Main call-to-action button text' },
  { key: 'home_hero_cta_link', value: '/shop', type: 'text', group: 'content', section: 'home_hero', label: 'Hero CTA Link', description: 'URL the hero CTA button links to' },
  { key: 'home_hero_image', value: '/images/hero-1.jpeg', type: 'image', group: 'content', section: 'home_hero', label: 'Hero Image', description: 'Hero section main image' },

  // ===== HOME PAGE - SHOP BY CATEGORY =====
  { key: 'home_cats_eyebrow', value: 'Browse', type: 'text', group: 'content', section: 'home_categories', label: 'Categories Eyebrow', description: 'Small label above the categories heading' },
  { key: 'home_cats_heading', value: 'Shop by Category', type: 'text', group: 'content', section: 'home_categories', label: 'Categories Heading', description: 'Main heading for the category cards' },
  { key: 'home_categories', value: json([
    { name: 'Dresses', slug: 'dresses', color: '#FFB6C1', desc: 'Elegant for every occasion', image: '/images/dresses-3.jpeg' },
    { name: 'Tops', slug: 'tops', color: '#FFB6C1', desc: 'Stylish everyday wear', image: '/images/tops-1.jpeg' },
    { name: 'Bottoms', slug: 'bottoms', color: '#FFB6C1', desc: 'Jeans, skirts & trousers', image: '/images/bottoms-2.jpeg' },
    { name: 'Shoes', slug: 'shoes', color: '#FF8FA3', desc: 'Step out in style', image: '/images/shoes-6.jpeg' },
    { name: 'Accessories', slug: 'accessories', color: '#FFE0E6', desc: 'The finishing touches', image: '/images/accessories-1.jpeg' },
  ]), type: 'json', group: 'content', section: 'home_categories', label: 'Category Cards', description: 'JSON array of {name, slug, color, desc, image} — images editable' },

  // ===== HOME PAGE - STORY =====
  { key: 'home_story_eyebrow', value: 'Our Story', type: 'text', group: 'content', section: 'home_story', label: 'Story Eyebrow', description: 'Small label above the story heading' },
  { key: 'home_story_heading', value: 'Fashion That Celebrates You', type: 'text', group: 'content', section: 'home_story', label: 'Story Section Heading' },
  { key: 'home_story_para1', value: 'Sparkpretty Closet was born from a simple belief: every woman deserves to feel beautiful and confident in what she wears. We curate fashion that blends African vibrancy with global trends, creating pieces that tell your story.', type: 'textarea', group: 'content', section: 'home_story', label: 'Story Paragraph 1' },
  { key: 'home_story_para2', value: 'From the bustling streets of Nairobi to the serene beaches of Mombasa, our collections are designed for the modern Kenyan woman who embraces her unique sparkle.', type: 'textarea', group: 'content', section: 'home_story', label: 'Story Paragraph 2' },
  { key: 'home_story_image', value: '/images/hero-3.jpeg', type: 'image', group: 'content', section: 'home_story', label: 'Story Section Image', description: 'Image beside the story text' },
  { key: 'home_story_stat_customers', value: '2,000+', type: 'text', group: 'content', section: 'home_story', label: 'Stats: Happy Customers' },
  { key: 'home_story_stat_styles', value: '100+', type: 'text', group: 'content', section: 'home_story', label: 'Stats: Unique Styles' },
  { key: 'home_story_stat_counties', value: '47', type: 'text', group: 'content', section: 'home_story', label: 'Stats: Counties Served' },

  // ===== HOME PAGE - TABS (Best Sellers / New Arrivals) =====
  { key: 'home_bestsellers_eyebrow', value: 'Most Loved', type: 'text', group: 'content', section: 'home_tabs', label: 'Best Sellers Eyebrow', description: 'Small label above the Best Sellers heading' },
  { key: 'home_bestsellers_heading', value: 'Best Sellers', type: 'text', group: 'content', section: 'home_tabs', label: 'Best Sellers Heading' },
  { key: 'home_bestsellers_view_all', value: 'View All', type: 'text', group: 'content', section: 'home_tabs', label: 'Best Sellers "View All" Label', description: 'Link label shown next to the Best Sellers heading' },
  { key: 'home_newarrivals_eyebrow', value: 'Just In', type: 'text', group: 'content', section: 'home_tabs', label: 'New Arrivals Eyebrow', description: 'Small label above the New Arrivals heading' },
  { key: 'home_newarrivals_heading', value: 'New Arrivals', type: 'text', group: 'content', section: 'home_tabs', label: 'New Arrivals Heading' },
  { key: 'home_view_all_products', value: 'View All Products', type: 'text', group: 'content', section: 'home_tabs', label: '"View All Products" Label', description: 'Button label linking to the full shop' },

  // ===== HOME PAGE - GALLERY =====
  { key: 'home_gallery_eyebrow', value: 'Get Inspired', type: 'text', group: 'content', section: 'home_gallery', label: 'Gallery Eyebrow', description: 'Small label above the gallery heading' },
  { key: 'home_gallery_heading', value: 'Style Gallery', type: 'text', group: 'content', section: 'home_gallery', label: 'Gallery Heading', description: 'Main heading for the gallery grid' },
  { key: 'home_gallery_images', value: json([
    { alt: 'Woman in Rose Garden Midi Dress at brunch', image: '/images/hero-2.jpeg' },
    { alt: 'Style flatlay with crossbody bag and accessories', image: '/images/accessories-2.jpeg' },
    { alt: 'Model wearing Elegant Wrap Dress at office', image: '/images/hero-4.jpeg' },
    { alt: 'Summer look with Sunset Maxi Dress on beach', image: '/images/dresses-2.jpeg' },
    { alt: 'Street style with canvas sneakers and jeans', image: '/images/shoes-7.jpeg' },
    { alt: 'Evening look with strappy heels and clutch', image: '/images/shoes-5.jpeg' },
  ]), type: 'json', group: 'content', section: 'home_gallery', label: 'Gallery Images', description: 'JSON array of {alt, image} objects — every photo editable' },

  // ===== HOME PAGE - TESTIMONIALS =====
  { key: 'home_testimonials_eyebrow', value: 'What They Say', type: 'text', group: 'content', section: 'home_testimonials', label: 'Testimonials Eyebrow', description: 'Small label above the testimonials heading' },
  { key: 'home_testimonials_heading', value: 'Customer Love', type: 'text', group: 'content', section: 'home_testimonials', label: 'Testimonials Heading' },
  { key: 'home_testimonials', value: json([
    { name: 'Amina W.', location: 'Nairobi', rating: 5, text: "I've never felt so confident in my outfits! The Rose Garden Midi Dress is absolutely stunning. Sparkpretty has become my go-to for every occasion.", avatar: 'A', product: 'Rose Garden Midi Dress' },
    { name: 'Faith M.', location: 'Mombasa', rating: 5, text: 'The quality is incredible for the price. I ordered 3 dresses and they all fit perfectly. The M-Pesa checkout was so easy!', avatar: 'F', product: 'Elegant Wrap Dress' },
    { name: 'Grace N.', location: 'Kisumu', rating: 5, text: "Fast delivery, beautiful packaging, and the clothes look exactly like the photos. I'm a customer for life!", avatar: 'G', product: 'Sunset Maxi Dress' },
    { name: 'Wanjiku K.', location: 'Nakuru', rating: 5, text: 'The crossbody bag is my daily essential now. So chic and fits everything I need. Highly recommend Sparkpretty!', avatar: 'W', product: 'Quilted Crossbody Bag' },
    { name: 'Mercy O.', location: 'Eldoret', rating: 5, text: "I was skeptical ordering online but the size guide was spot-on. The silk blouse is gorgeous. Will definitely order again!", avatar: 'M', product: 'Silk Touch Blouse' },
    { name: 'Nancy A.', location: 'Thika', rating: 5, text: "My friends keep asking where I got my outfit. The quality rivals brands I've paid double for. Thank you Sparkpretty!", avatar: 'N', product: 'Oversized Knit Sweater' },
  ]), type: 'json', group: 'content', section: 'home_testimonials', label: 'Testimonials', description: 'JSON array of customer testimonials' },

  // ===== HOME PAGE - JOURNAL =====
  { key: 'home_journal_eyebrow', value: 'Style Guide', type: 'text', group: 'content', section: 'home_journal', label: 'Journal Eyebrow', description: 'Small label above the journal heading' },
  { key: 'home_journal_heading', value: 'From Our Journal', type: 'text', group: 'content', section: 'home_journal', label: 'Journal Heading', description: 'Heading for the blog preview section' },
  { key: 'home_journal_linked', value: 'View All Posts', type: 'text', group: 'content', section: 'home_journal', label: 'Journal "View All" Label', description: 'Link label for the full blog' },

  // ===== HOME PAGE - PROMO =====
  { key: 'home_promo_eyebrow', value: 'Limited Time', type: 'text', group: 'content', section: 'home_promo', label: 'Promo Eyebrow', description: 'Small label above the promo heading' },
  { key: 'home_promo_heading', value: 'Up to 30% Off', type: 'text', group: 'content', section: 'home_promo', label: 'Promo Banner Heading' },
  { key: 'home_promo_text', value: "Spring into savings! Shop our curated sale collection before it's gone.", type: 'textarea', group: 'content', section: 'home_promo', label: 'Promo Banner Text' },
  { key: 'home_promo_cta', value: 'Shop the Sale', type: 'text', group: 'content', section: 'home_promo', label: 'Promo CTA Button' },

  // ===== HOME PAGE - NEWSLETTER =====
  { key: 'home_newsletter_eyebrow', value: 'Newsletter', type: 'text', group: 'content', section: 'home_newsletter', label: 'Newsletter Eyebrow', description: 'Small label above the newsletter heading' },
  { key: 'home_newsletter_heading', value: 'Stay in the Spark', type: 'text', group: 'content', section: 'home_newsletter', label: 'Newsletter Heading' },
  { key: 'home_newsletter_text', value: 'Get exclusive access to new arrivals, special discounts, and styling tips delivered straight to your inbox.', type: 'textarea', group: 'content', section: 'home_newsletter', label: 'Newsletter Text' },
  { key: 'home_newsletter_subscribers', value: '2,000+', type: 'text', group: 'content', section: 'home_newsletter', label: 'Subscriber Count Display', description: 'Displayed as social proof' },

  // ===== HOME PAGE - FINAL CTA =====
  { key: 'home_cta_eyebrow', value: 'Join Us', type: 'text', group: 'content', section: 'home_cta', label: 'Final CTA Eyebrow', description: 'Small label above the final CTA heading' },
  { key: 'home_cta_heading', value: 'Ready to Sparkle?', type: 'text', group: 'content', section: 'home_cta', label: 'Final CTA Heading' },
  { key: 'home_cta_text', value: 'Join thousands of women who trust Sparkpretty Closet for their wardrobe essentials. Your next favorite outfit is waiting.', type: 'textarea', group: 'content', section: 'home_cta', label: 'Final CTA Text' },

  // ===== HOME PAGE - TRUST BADGES =====
  { key: 'home_trust_eyebrow', value: 'Why Shop With Us?', type: 'text', group: 'content', section: 'home_trust', label: 'Trust Eyebrow', description: 'Small label above the trust heading' },
  { key: 'home_trust_heading', value: 'Why Shop With Us?', type: 'text', group: 'content', section: 'home_trust', label: 'Trust Section Heading' },
  { key: 'home_trust_bar', value: json([
    { title: 'Free Shipping', desc: 'Orders over KSh 5,000' },
    { title: 'M-Pesa Checkout', desc: 'Fast & secure payment' },
    { title: 'Easy Returns', desc: '7-day return policy' },
    { title: '24/7 Support', desc: 'WhatsApp us anytime' },
  ]), type: 'json', group: 'content', section: 'home_trust', label: 'Top Trust Strip', description: 'JSON array of {title, desc} shown under the hero' },
  { key: 'home_trust_badges', value: json([
    { title: 'Secure Payments', desc: 'M-Pesa and encrypted checkout' },
    { title: 'Fast Delivery', desc: '2-5 business days nationwide' },
    { title: 'Free Returns', desc: '7-day hassle-free returns' },
    { title: 'Quality Promise', desc: 'Handpicked, tested products' },
  ]), type: 'json', group: 'content', section: 'home_trust', label: 'Trust Badges', description: 'JSON array of {title, desc} shown above the final CTA' },
  { key: 'free_shipping_threshold', value: '5,000', type: 'text', group: 'content', section: 'home_trust', label: 'Free Shipping Threshold', description: 'Amount in KSh for free shipping' },

  // ===== FOOTER =====
  { key: 'footer_tagline', value: 'Your destination for beautiful, confident fashion. Curated pieces that celebrate the sparkle in every woman.', type: 'textarea', group: 'content', section: 'footer', label: 'Footer Brand Tagline' },
  { key: 'footer_heading_shop', value: 'Shop', type: 'text', group: 'content', section: 'footer', label: 'Shop Column Heading', description: 'Heading of the footer shop links column' },
  { key: 'footer_shop_links', value: json([
    { label: 'Dresses', to: '/shop?category=dresses' },
    { label: 'Tops', to: '/shop?category=tops' },
    { label: 'Bottoms', to: '/shop?category=bottoms' },
    { label: 'Shoes', to: '/shop?category=shoes' },
    { label: 'Accessories', to: '/shop?category=accessories' },
  ]), type: 'json', group: 'content', section: 'footer', label: 'Shop Links', description: 'JSON array of {label, to}' },
  { key: 'footer_heading_explore', value: 'Explore', type: 'text', group: 'content', section: 'footer', label: 'Explore Column Heading', description: 'Heading of the footer explore links column' },
  { key: 'footer_explore_links', value: json([
    { label: 'Size Guide', to: '/size-guide' },
    { label: 'Contact Us', to: '/contact' },
    { label: 'My Account', to: '/account' },
    { label: 'Order History', to: '/account/orders' },
    { label: 'Journal', to: '/blog' },
  ]), type: 'json', group: 'content', section: 'footer', label: 'Explore Links', description: 'JSON array of {label, to}' },
  { key: 'footer_heading_contact', value: 'Contact', type: 'text', group: 'content', section: 'footer', label: 'Contact Column Heading', description: 'Heading of the footer contact column' },
  { key: 'footer_newsletter_eyebrow', value: 'Newsletter', type: 'text', group: 'content', section: 'footer', label: 'Footer Newsletter Eyebrow', description: 'Small label above the newsletter heading' },
  { key: 'footer_newsletter_heading', value: 'Stay in the Spark', type: 'text', group: 'content', section: 'footer', label: 'Footer Newsletter Heading' },
  { key: 'footer_newsletter_subheading', value: 'Join Our Pink Community', type: 'text', group: 'content', section: 'footer', label: 'Footer Newsletter Subheading' },
  { key: 'footer_newsletter_text', value: 'Get 10% off your first order + new arrivals, exclusive deals, and style inspiration straight to your inbox.', type: 'textarea', group: 'content', section: 'footer', label: 'Footer Newsletter Text' },
  { key: 'footer_payment_note', value: 'We accept M-Pesa & all major mobile money', type: 'text', group: 'content', section: 'footer', label: 'Payment Note', description: 'Payment mention shown in the footer bottom bar' },
  { key: 'footer_copyright', value: 'Sparkpretty Closet. All rights reserved.', type: 'text', group: 'content', section: 'footer', label: 'Copyright Line', description: 'Footer copyright text' },

  // ===== ABOUT PAGE =====
  { key: 'about_eyebrow_hero', value: 'Our Story', type: 'text', group: 'content', section: 'about', label: 'Hero Eyebrow', description: 'Small label above the about hero heading' },
  { key: 'about_hero_heading', value: 'Fashion That Speaks Your Story', type: 'text', group: 'content', section: 'about', label: 'About Hero Heading' },
  { key: 'about_hero_text', value: 'We believe every woman deserves to feel beautiful, confident, and radiant in what she wears. Sparkpretty Closet curates fashion that celebrates your unique sparkle.', type: 'textarea', group: 'content', section: 'about', label: 'About Hero Text' },
  { key: 'about_eyebrow_story', value: 'Our Journey', type: 'text', group: 'content', section: 'about', label: 'Story Eyebrow', description: 'Small label above the story heading' },
  { key: 'about_story_heading', value: 'Born from a Passion for Fashion', type: 'text', group: 'content', section: 'about', label: 'About Story Heading' },
  { key: 'about_story_para1', value: 'Sparkpretty Closet was founded in 2020 with a simple dream: to bring beautiful, high-quality fashion to every Kenyan woman. What started as a small collection of hand-picked pieces has grown into a trusted fashion destination serving thousands of customers across the country.', type: 'textarea', group: 'content', section: 'about', label: 'About Story Paragraph 1' },
  { key: 'about_story_para2', value: 'Our founder, Mercy Wanjiku, noticed that many women struggled to find fashion that was both stylish and affordable. She set out to create a brand that celebrates African femininity while embracing global trends \u2014 a brand that makes every woman feel like the best version of herself.', type: 'textarea', group: 'content', section: 'about', label: 'About Story Paragraph 2' },
  { key: 'about_story_para3', value: "Today, we curate collections that blend elegance with everyday wearability. From stunning dresses to statement accessories, every piece in our collection is chosen with love, quality, and your unique style in mind.", type: 'textarea', group: 'content', section: 'about', label: 'About Story Paragraph 3' },
  { key: 'about_stat_customers', value: '2,000+', type: 'text', group: 'content', section: 'about', label: 'About: Happy Customers' },
  { key: 'about_stat_styles', value: '100+', type: 'text', group: 'content', section: 'about', label: 'About: Unique Styles' },
  { key: 'about_stat_counties', value: '47', type: 'text', group: 'content', section: 'about', label: 'About: Counties Served' },
  { key: 'about_eyebrow_mission', value: 'Get to Know Us', type: 'text', group: 'content', section: 'about', label: 'Mission & Vision Eyebrow', description: 'Small label above the Mission & Vision heading' },
  { key: 'about_mission_heading', value: 'Mission & Vision', type: 'text', group: 'content', section: 'about', label: 'Mission & Vision Heading' },
  { key: 'about_mission', value: 'To make stunning, high-quality fashion accessible to every Kenyan woman. We bridge the gap between style and affordability, bringing you curated collections that celebrate your unique beauty.', type: 'textarea', group: 'content', section: 'about', label: 'Mission Statement' },
  { key: 'about_mission_detail', value: "From everyday essentials to statement pieces, we're here to ensure you always have something beautiful to wear \u2014 delivered right to your doorstep with a smile.", type: 'textarea', group: 'content', section: 'about', label: 'Mission Detail' },
  { key: 'about_vision', value: "To become Africa's leading fashion destination for shoes, clothes, and bags \u2014 a brand that empowers women across the continent to express their unique style with confidence.", type: 'textarea', group: 'content', section: 'about', label: 'Vision Statement' },
  { key: 'about_vision_detail', value: 'We envision a world where every woman has access to beautiful, sustainable fashion that makes her feel extraordinary, regardless of where she lives or what her budget is.', type: 'textarea', group: 'content', section: 'about', label: 'Vision Detail' },
  { key: 'about_eyebrow_values', value: 'What We Stand For', type: 'text', group: 'content', section: 'about', label: 'Values Eyebrow', description: 'Small label above the values heading' },
  { key: 'about_values_heading', value: 'Our Values', type: 'text', group: 'content', section: 'about', label: 'Values Heading' },
  { key: 'about_values', value: json([
    { title: 'Quality First', desc: 'Every piece is hand-selected and tested for quality, comfort, and durability before it reaches you.' },
    { title: 'Customer Love', desc: 'Your satisfaction is our obsession. We go above and beyond to make every shopping experience special.' },
    { title: 'Sustainability', desc: 'We source ethically and are committed to reducing our environmental footprint with every collection.' },
    { title: 'Unique Style', desc: 'Our curated collections blend African vibrancy with global trends for looks that stand out.' },
    { title: 'Inclusive Sizing', desc: 'Fashion is for every body. We offer a wide range of sizes to celebrate all women.' },
    { title: 'Kenyan Pride', desc: 'Proudly serving women across Kenya, from Nairobi to Mombasa, Kisumu to Eldoret.' },
  ]), type: 'json', group: 'content', section: 'about', label: 'Values Cards', description: 'JSON array of {title, desc}' },
  { key: 'about_eyebrow_team', value: 'The People', type: 'text', group: 'content', section: 'about', label: 'Team Eyebrow', description: 'Small label above the team heading' },
  { key: 'about_team_heading', value: 'Meet Our Team', type: 'text', group: 'content', section: 'about', label: 'Team Heading' },
  { key: 'about_team', value: json([
    { name: 'Mercy Wanjiku', role: 'Founder & Creative Director', bio: 'Passionate about African fashion and empowering women through style. Mercy curates every collection with love.', initials: 'MW', color: '#FFB6C1' },
    { name: 'Faith Akinyi', role: 'Head of Operations', bio: 'Ensures every order is packed with care and delivered on time. Faith makes the magic happen behind the scenes.', initials: 'FA', color: '#FF8FA3' },
    { name: 'Grace Muthoni', role: 'Lead Stylist', bio: 'Creates stunning lookbooks and style guides to help our customers look their absolute best.', initials: 'GM', color: '#FFB6C1' },
  ]), type: 'json', group: 'content', section: 'about', label: 'Team Members' },
  { key: 'about_eyebrow_journey', value: 'Milestones', type: 'text', group: 'content', section: 'about', label: 'Milestones Eyebrow', description: 'Small label above the milestones heading' },
  { key: 'about_milestones_heading', value: 'Our Journey', type: 'text', group: 'content', section: 'about', label: 'Milestones Heading' },
  { key: 'about_milestones', value: json([
    { year: '2020', title: 'The Spark', desc: 'Sparkpretty Closet was born from a passion for making every woman feel beautiful and confident.' },
    { year: '2021', title: 'Growing Community', desc: 'Reached 500+ happy customers across Nairobi and Mombasa. Expanded our collection to 100+ styles.' },
    { year: '2023', title: 'Nationwide Delivery', desc: 'Expanded to serve all of Kenya. Introduced M-Pesa checkout for seamless payments.' },
    { year: '2025', title: '2,000+ Customers', desc: 'Celebrating over 2,000 satisfied customers. Launched our blog and style guides.' },
    { year: '2026', title: 'The Future', desc: "Aiming to become Africa's leading fashion destination. Sustainability initiatives and new collections." },
  ]), type: 'json', group: 'content', section: 'about', label: 'Milestones Timeline' },
  { key: 'about_eyebrow_testimonials', value: 'Testimonials', type: 'text', group: 'content', section: 'about', label: 'Testimonials Eyebrow', description: 'Small label above the testimonials heading' },
  { key: 'about_testimonials_heading', value: 'What Customers Say', type: 'text', group: 'content', section: 'about', label: 'Testimonials Heading' },
  { key: 'about_testimonials', value: json([
    { name: 'Amina W.', location: 'Nairobi', text: 'Sparkpretty has completely transformed my wardrobe. The quality is incredible and the styles are always on point!', rating: 5 },
    { name: 'Faith M.', location: 'Mombasa', text: 'I was nervous ordering online, but the experience was flawless. The dress fit perfectly and the M-Pesa checkout was so easy.', rating: 5 },
    { name: 'Grace N.', location: 'Kisumu', text: 'Fast delivery, beautiful packaging, and the clothes look exactly like the photos. I am a customer for life!', rating: 5 },
    { name: 'Wanjiku K.', location: 'Nakuru', text: 'The crossbody bag is my daily essential now. So chic and fits everything I need. Highly recommend Sparkpretty!', rating: 5 },
  ]), type: 'json', group: 'content', section: 'about', label: 'About Testimonials' },
  { key: 'about_cta_eyebrow', value: 'Join Us', type: 'text', group: 'content', section: 'about', label: 'About CTA Eyebrow', description: 'Small label above the about CTA heading' },
  { key: 'about_cta_heading', value: 'Ready to Shop?', type: 'text', group: 'content', section: 'about', label: 'About CTA Heading' },
  { key: 'about_cta_text', value: 'Explore our latest collection and find something you will love. Free delivery over KSh 5,000.', type: 'textarea', group: 'content', section: 'about', label: 'About CTA Text' },
  { key: 'about_cta_button', value: 'Shop the Collection', type: 'text', group: 'content', section: 'about', label: 'About CTA Button' },
  { key: 'about_trust_badges', value: json([
    { title: 'Secure Payments', desc: 'M-Pesa and encrypted checkout protect every transaction' },
    { title: 'Fast Delivery', desc: '2-5 business days to any address in Kenya' },
    { title: 'Easy Returns', desc: '7-day hassle-free return policy, no questions asked' },
    { title: 'Quality Guarantee', desc: 'Every product is hand-checked before it ships' },
  ]), type: 'json', group: 'content', section: 'about', label: 'Trust Badges', description: 'JSON array of {title, desc} at the bottom of the about page' },
  { key: 'about_rating_note', value: '/ 5 average from 2,000+ reviews', type: 'text', group: 'content', section: 'about', label: 'Rating Footnote', description: 'Text shown under the average rating' },

  // ===== CONTACT PAGE =====
  { key: 'contact_hero_eyebrow', value: 'Contact', type: 'text', group: 'content', section: 'contact_page', label: 'Hero Eyebrow', description: 'Small label above the contact hero heading' },
  { key: 'contact_hero_heading', value: "We'd Love to Hear From You", type: 'text', group: 'content', section: 'contact_page', label: 'Contact Hero Heading' },
  { key: 'contact_hero_text', value: 'Reach out for inquiries, support, or collaborations. Our team is ready to help you find your perfect style.', type: 'textarea', group: 'content', section: 'contact_page', label: 'Contact Hero Text' },
  { key: 'contact_preferred_heading', value: 'Contact Information', type: 'text', group: 'content', section: 'contact_page', label: 'Contact Cards Heading', description: 'Heading over the phone/WhatsApp/email/location cards' },
  { key: 'contact_form_heading', value: "Let's Talk", type: 'text', group: 'content', section: 'contact_page', label: 'Form Heading', description: 'Heading above the contact form' },
  { key: 'contact_form_note', value: 'Fill out the form and our team will get back to you within 24 hours.', type: 'textarea', group: 'content', section: 'contact_page', label: 'Form Intro Text', description: 'Supporting text above the contact form' },
  { key: 'contact_faq_eyebrow', value: 'Help Center', type: 'text', group: 'content', section: 'contact_page', label: 'FAQ Eyebrow', description: 'Small label above the FAQ heading' },
  { key: 'contact_faq_heading', value: 'Frequently Asked Questions', type: 'text', group: 'content', section: 'contact_page', label: 'FAQ Heading' },
  { key: 'contact_faqs', value: json([
    { q: 'How long does shipping take?', a: 'Standard shipping takes 2-5 business days within Kenya. Express delivery to Nairobi is available for next-day delivery on orders placed before 2 PM.' },
    { q: 'What is your return policy?', a: 'We offer a 7-day hassle-free return policy. Items must be unworn, unwashed, with tags attached. Contact us to initiate a return.' },
    { q: 'How do I find my size?', a: "Check our comprehensive Size Guide for detailed measurements in centimeters. If you're between sizes, we recommend sizing up for comfort." },
    { q: 'Do you offer international shipping?', a: "Currently we ship within Kenya. We're working on expanding to East African countries soon! Stay tuned." },
    { q: 'How do I pay with M-Pesa?', a: "At checkout, select M-Pesa as your payment method. You'll receive an STK push prompt on your phone \u2014 just enter your PIN to complete the payment." },
    { q: 'Can I track my order?', a: "Yes! Once your order is shipped, you'll receive a confirmation via SMS and email with tracking details." },
  ]), type: 'json', group: 'content', section: 'contact_page', label: 'FAQs', description: 'JSON array of {q, a}' },
  { key: 'contact_social_eyebrow', value: 'Connect', type: 'text', group: 'content', section: 'contact_page', label: 'Social Eyebrow', description: 'Small label above the social heading' },
  { key: 'contact_social_heading', value: 'Follow Us for Style Inspiration', type: 'text', group: 'content', section: 'contact_page', label: 'Social Heading' },
  { key: 'contact_social_text', value: 'Stay updated with new arrivals, styling tips, and behind-the-scenes exclusives.', type: 'textarea', group: 'content', section: 'contact_page', label: 'Social Intro Text' },
  { key: 'contact_trust_heading', value: 'Why Shop With Us?', type: 'text', group: 'content', section: 'contact_page', label: 'Trust Heading' },
  { key: 'contact_trust_badges', value: json([
    { title: 'Secure Payments', desc: 'M-Pesa & encrypted checkout' },
    { title: 'Fast Delivery', desc: '2-5 days nationwide' },
    { title: 'Easy Returns', desc: '7-day return policy' },
    { title: 'Flexible Payment', desc: 'Pay on delivery available' },
  ]), type: 'json', group: 'content', section: 'contact_page', label: 'Trust Badges', description: 'JSON array of {title, desc}' },
  { key: 'contact_cta_heading', value: 'Need More Help?', type: 'text', group: 'content', section: 'contact_page', label: 'CTA Heading', description: 'Heading for the bottom call-to-action' },
  { key: 'contact_cta_text', value: 'Call or WhatsApp us and our friendly team will assist you right away.', type: 'textarea', group: 'content', section: 'contact_page', label: 'CTA Text' },
  { key: 'contact_cta_button', value: 'Call 0729366991', type: 'text', group: 'content', section: 'contact_page', label: 'CTA Button Label' },

  // ===== SHOPPING & PRODUCT PAGES =====
  { key: 'cart_heading', value: 'Your Bag', type: 'text', group: 'content', section: 'shopping', label: 'Cart Page Heading' },
  { key: 'shop_heading', value: 'All Products', type: 'text', group: 'content', section: 'shopping', label: 'Shop Page Heading', description: 'Default heading when no category is selected' },
  { key: 'product_add_to_cart', value: 'Add to Bag', type: 'text', group: 'content', section: 'shopping', label: '"Add to Bag" Button', description: 'Add-to-cart button label' },
  { key: 'product_buy_now', value: 'Buy Now', type: 'text', group: 'content', section: 'shopping', label: '"Buy Now" Button', description: 'Buy-now button label' },
  { key: 'product_related_heading', value: 'You May Also Like', type: 'text', group: 'content', section: 'shopping', label: 'Related Products Heading' },
  { key: 'product_description_tab', value: 'Product Details', type: 'text', group: 'content', section: 'shopping', label: 'Details Tab Label', description: 'Tab label for product details' },
  { key: 'product_reviews_tab', value: 'Reviews', type: 'text', group: 'content', section: 'shopping', label: 'Reviews Tab Label' },
  { key: 'product_size_guide_cta', value: 'Size Guide', type: 'text', group: 'content', section: 'shopping', label: 'Size Guide Link', description: 'Link label that opens the size guide' },
  { key: 'checkout_heading', value: 'Checkout', type: 'text', group: 'content', section: 'shopping', label: 'Checkout Heading' },
  { key: 'size_guide_page_link', value: 'Size Guide', type: 'text', group: 'content', section: 'shopping', label: 'Size Guide Page Link', description: 'Footer/link label for the size guide page' },

  // ===== SHIPPING & TRUST =====
  { key: 'shipping_fee', value: '350', type: 'text', group: 'content', section: 'shipping', label: 'Flat Shipping Fee (KES)', description: 'Delivery fee charged when the order is below the free-shipping threshold. Whole number, no decimals.' },
  { key: 'return_policy', value: '7-day returns', type: 'text', group: 'content', section: 'shipping', label: 'Return Policy (short)', description: 'Short return policy shown on product pages' },
  { key: 'return_policy_full', value: '7-day easy returns', type: 'text', group: 'content', section: 'shipping', label: 'Return Policy (full)', description: 'Longer return wording shown in trust badges' },
  { key: 'secure_payment_note', value: 'Secure M-Pesa checkout', type: 'text', group: 'content', section: 'shipping', label: 'Secure Payment Note', description: 'Trust signal on shop page' },
  { key: 'secure_payment_short', value: 'Secure pay', type: 'text', group: 'content', section: 'shipping', label: 'Secure Payment (short)', description: 'Short trust signal on product pages' },
  { key: 'trust_free_shipping_note', value: 'Free shipping over KSh 5,000', type: 'text', group: 'content', section: 'shipping', label: 'Free Shipping Note', description: 'Trust badge text on the shop page' },
  { key: 'trust_free_shipping_short', value: 'Free shipping 5K+', type: 'text', group: 'content', section: 'shipping', label: 'Free Shipping Note (short)', description: 'Short trust badge on product pages' },
  { key: 'cart_empty_text', value: 'Discover something beautiful for yourself.', type: 'text', group: 'content', section: 'shipping', label: 'Empty Cart Message', description: 'Message shown when the cart has no items' },

  // ===== BLOG PAGE =====
  { key: 'blog_hero_badge', value: 'The Spark Journal', type: 'text', group: 'content', section: 'blog', label: 'Hero Badge', description: 'Badge above the blog hero heading' },
  { key: 'blog_hero_heading', value: 'Style Stories & Fashion Insights', type: 'text', group: 'content', section: 'blog', label: 'Hero Heading' },
  { key: 'blog_hero_text', value: 'Discover trends, styling tips, and stories from the Sparkpretty world. Your fashion journey starts here.', type: 'textarea', group: 'content', section: 'blog', label: 'Hero Text' },
  { key: 'blog_hero_cta', value: 'Start Reading', type: 'text', group: 'content', section: 'blog', label: 'Hero CTA Button' },
  { key: 'blog_categories', value: json([
    { name: 'All', slug: '', icon: '✨' },
    { name: 'Style Tips', slug: 'tips', icon: '💡' },
    { name: 'Trends', slug: 'trends', icon: '🔥' },
    { name: 'Dresses', slug: 'dresses', icon: '👗' },
    { name: 'Shoes', slug: 'shoes', icon: '👟' },
    { name: 'Accessories', slug: 'accessories', icon: '👜' },
    { name: 'Sustainability', slug: 'sustainability', icon: '🌿' },
    { name: 'Behind the Scenes', slug: 'behind-the-scenes', icon: '🎬' },
  ]), type: 'json', group: 'content', section: 'blog', label: 'Category Pills', description: 'JSON array of {name, slug, icon}' },
  { key: 'blog_spotlights', value: json([
    { name: 'Amina W.', location: 'Nairobi', text: 'Wore the Rose Garden Midi Dress to my friend\'s wedding and got so many compliments!', avatar: 'A', product: 'Rose Garden Midi Dress' },
    { name: 'Faith M.', location: 'Mombasa', text: 'The Strappy Heel Sandals are my go-to for every event. So comfortable and stylish!', avatar: 'F', product: 'Strappy Heel Sandals' },
    { name: 'Grace N.', location: 'Kisumu', text: 'I styled the Silk Blouse with high-waist jeans for a casual Friday look. Loved it!', avatar: 'G', product: 'Silk Touch Blouse' },
  ]), type: 'json', group: 'content', section: 'blog', label: 'Customer Spotlights', description: 'JSON array of {name, location, text, avatar, product}' },
  { key: 'blog_style_guides', value: json([
    { title: 'How to Style a Midi Dress for Every Occasion', excerpt: 'From office to weekend brunch — master the art of the versatile midi dress.', gradient: 'from-pink-100 to-rose-200', icon: '👗', readTime: '5 min' },
    { title: '10 Wardrobe Essentials Every Kenyan Woman Needs', excerpt: 'Build a versatile wardrobe with these timeless basics that work hard.', gradient: 'from-amber-100 to-orange-200', icon: '✨', readTime: '4 min' },
    { title: 'Accessorizing 101: Complete Any Outfit', excerpt: 'The right accessories can transform a simple look into something extraordinary.', gradient: 'from-purple-100 to-indigo-200', icon: '👜', readTime: '3 min' },
  ]), type: 'json', group: 'content', section: 'blog', label: 'Style Guide Cards', description: 'JSON array of {title, excerpt, gradient, icon, readTime}' },
  { key: 'blog_bts_items', value: json([
    { title: 'How We Source Our Fabrics', desc: 'From local Kenyan markets to international suppliers — our fabric sourcing journey.', gradient: 'from-teal-100 to-cyan-200', icon: '🧵' },
    { title: 'Meet the Team Behind Your Orders', desc: 'Get to know the passionate people who make your Sparkpretty experience special.', gradient: 'from-violet-100 to-purple-200', icon: '👩‍💻' },
    { title: 'Our Quality Promise: From Warehouse to Door', desc: 'Every item goes through rigorous quality checks before it reaches you.', gradient: 'from-rose-100 to-pink-200', icon: '✅' },
  ]), type: 'json', group: 'content', section: 'blog', label: 'Behind the Scenes Cards', description: 'JSON array of {title, desc, gradient, icon}' },
  { key: 'blog_newsletter_heading', value: 'Never Miss a Style Story', type: 'text', group: 'content', section: 'blog', label: 'Newsletter Heading' },
  { key: 'blog_newsletter_text', value: 'Subscribe for exclusive fashion tips, early access to new collections, and a 10% welcome discount.', type: 'textarea', group: 'content', section: 'blog', label: 'Newsletter Text' },
  { key: 'blog_newsletter_footer', value: 'Get 10% off your first order. Unsubscribe anytime.', type: 'text', group: 'content', section: 'blog', label: 'Newsletter Footer Note' },
  { key: 'blog_seo_title', value: 'Blog — Style Stories & Fashion Insights', type: 'text', group: 'seo', section: 'blog', label: 'Blog Page Title' },
  { key: 'blog_seo_description', value: "Fashion tips, styling guides, and the latest trends from Sparkpretty Closet. Your go-to fashion hub.", type: 'textarea', group: 'seo', section: 'blog', label: 'Blog Meta Description' },
  { key: 'blog_spotlights_desc', value: 'Real women, real style — see how our community wears Sparkpretty', type: 'text', group: 'content', section: 'blog', label: 'Spotlights Description' },
  { key: 'blog_hashtag', value: '#SparkprettyStyle', type: 'text', group: 'content', section: 'blog', label: 'Social Hashtag', description: 'Hashtag used in the spotlights section' },
  { key: 'blog_styleguides_eyebrow', value: 'Get Inspired', type: 'text', group: 'content', section: 'blog', label: 'Style Guides Eyebrow' },
  { key: 'blog_styleguides_heading', value: 'Style Guides', type: 'text', group: 'content', section: 'blog', label: 'Style Guides Heading' },
  { key: 'blog_styleguides_desc', value: 'Learn how to mix, match, and style your favorite pieces', type: 'text', group: 'content', section: 'blog', label: 'Style Guides Description' },
  { key: 'blog_bts_eyebrow', value: 'Our Process', type: 'text', group: 'content', section: 'blog', label: 'Behind the Scenes Eyebrow' },
  { key: 'blog_bts_heading', value: 'Behind the Scenes', type: 'text', group: 'content', section: 'blog', label: 'Behind the Scenes Heading' },
  { key: 'blog_bts_desc', value: 'Discover the people and process behind every Sparkpretty piece', type: 'text', group: 'content', section: 'blog', label: 'Behind the Scenes Description' },
  { key: 'blog_community_eyebrow', value: 'Community', type: 'text', group: 'content', section: 'blog', label: 'Community Eyebrow' },
  { key: 'blog_community_heading', value: 'Customer Spotlights', type: 'text', group: 'content', section: 'blog', label: 'Spotlights Heading' },
  { key: 'blog_post_author_fallback', value: 'Sparkpretty Team', type: 'text', group: 'content', section: 'blog', label: 'Default Author Name' },
  { key: 'blog_post_author_bio', value: 'Curating fashion tips and stories for the Sparkpretty community.', type: 'text', group: 'content', section: 'blog', label: 'Default Author Bio' },
  { key: 'blog_post_cta_heading', value: 'Ready to Update Your Wardrobe?', type: 'text', group: 'content', section: 'blog', label: 'Post CTA Heading' },
  { key: 'blog_post_cta_text', value: 'Explore our latest collection and find your perfect look.', type: 'text', group: 'content', section: 'blog', label: 'Post CTA Text' },
  { key: 'blog_post_newsletter_heading', value: 'Enjoyed this article?', type: 'text', group: 'content', section: 'blog', label: 'Post Newsletter Heading' },
  { key: 'blog_post_newsletter_text', value: 'Subscribe for more fashion tips and get 10% off your first order.', type: 'text', group: 'content', section: 'blog', label: 'Post Newsletter Text' },
  { key: 'blog_post_related_heading', value: 'You Might Also Like', type: 'text', group: 'content', section: 'blog', label: 'Related Posts Heading' },
  { key: 'blog_categories_heading', value: 'Categories', type: 'text', group: 'content', section: 'blog', label: 'Categories Section Heading', description: 'Heading above blog filter pills' },
  { key: 'blog_view_all_posts', value: 'View All Posts', type: 'text', group: 'content', section: 'blog', label: '"View All Posts" Button' },

  // ===== SIZE GUIDE =====
  { key: 'sizing_page_heading', value: 'Size Guide', type: 'text', group: 'content', section: 'size_guide', label: 'Page Heading' },
  { key: 'sizing_page_subtitle', value: 'Find your perfect fit', type: 'text', group: 'content', section: 'size_guide', label: 'Page Subtitle' },
  { key: 'sizing_measure_heading', value: 'How to Measure', type: 'text', group: 'content', section: 'size_guide', label: 'How to Measure Heading' },
  { key: 'sizing_clothing_heading', value: 'Clothing Sizes (cm)', type: 'text', group: 'content', section: 'size_guide', label: 'Clothing Sizes Heading' },
  { key: 'sizing_shoes_heading', value: 'Shoe Sizes', type: 'text', group: 'content', section: 'size_guide', label: 'Shoe Sizes Heading' },
  { key: 'sizing_instructions', value: json([
    { title: 'Bust', text: 'Measure around the fullest part of your chest, keeping the tape horizontal.' },
    { title: 'Waist', text: 'Measure around your natural waistline, the narrowest part of your torso.' },
    { title: 'Hips', text: 'Measure around the fullest part of your hips and buttocks.' },
  ]), type: 'json', group: 'content', section: 'size_guide', label: 'Measurement Instructions', description: 'JSON array of {title, text} steps' },
  { key: 'sizing_clothing', value: json([
    { size: 'XS', bust: '80-84', waist: '60-64', hips: '86-90' },
    { size: 'S', bust: '84-88', waist: '64-68', hips: '90-94' },
    { size: 'M', bust: '88-92', waist: '68-72', hips: '94-98' },
    { size: 'L', bust: '92-96', waist: '72-76', hips: '98-102' },
    { size: 'XL', bust: '96-100', waist: '76-80', hips: '102-106' },
  ]), type: 'json', group: 'content', section: 'size_guide', label: 'Clothing Size Table', description: 'JSON array of {size, bust, waist, hips} in cm' },
  { key: 'sizing_shoes', value: json([
    { eu: '36', us: '5.5', uk: '3.5', cm: '23' },
    { eu: '37', us: '6.5', uk: '4.5', cm: '23.5' },
    { eu: '38', us: '7.5', uk: '5', cm: '24' },
    { eu: '39', us: '8', uk: '5.5', cm: '24.5' },
    { eu: '40', us: '9', uk: '6.5', cm: '25' },
    { eu: '41', us: '10', uk: '7.5', cm: '26' },
  ]), type: 'json', group: 'content', section: 'size_guide', label: 'Shoe Size Table', description: 'JSON array of {eu, us, uk, cm}' },
  { key: 'shop_size_filters', value: json({ clothing: ['XS', 'S', 'M', 'L', 'XL'], shoes: ['36', '37', '38', '39', '40', '41'] }), type: 'json', group: 'content', section: 'size_guide', label: 'Shop Size Filters', description: 'Size options shown in the shop filter sidebar' },

  // ===== BUSINESS / COMPANY (documents & invoicing) =====
  { key: 'company_legal_name', value: 'Sparkpretty Closet', type: 'text', group: 'business', section: 'business', label: 'Legal / Business Name', description: 'Company name printed on quotations, invoices, receipts and letterheads' },
  { key: 'company_tagline', value: "Premier Women's Fashion · Kenya", type: 'text', group: 'business', section: 'business', label: 'Company Tagline', description: 'Short descriptor under the company name on documents' },
  { key: 'company_krapin', value: 'P000000000K', type: 'text', group: 'business', section: 'business', label: 'KRA PIN', description: 'KRA PIN printed on invoices and receipts' },
  { key: 'company_vat', value: '', type: 'text', group: 'business', section: 'business', label: 'VAT Registration No.', description: 'VAT number, if registered' },
  { key: 'company_reg_number', value: '', type: 'text', group: 'business', section: 'business', label: 'Business Registration No.', description: 'Company / business registration number' },
  { key: 'company_address', value: 'Nairobi, Kenya', type: 'text', group: 'business', section: 'business', label: 'Registered Address', description: 'Street / postal address for official documents' },
  { key: 'company_city', value: 'Nairobi', type: 'text', group: 'business', section: 'business', label: 'City', description: 'Company city' },
  { key: 'company_county', value: 'Nairobi County', type: 'text', group: 'business', section: 'business', label: 'County', description: 'Company county' },
  { key: 'company_phone', value: '0729366991', type: 'text', group: 'business', section: 'business', label: 'Company Phone', description: 'Phone on official documents' },
  { key: 'company_email', value: 'hello@sparkpretty.co.ke', type: 'text', group: 'business', section: 'business', label: 'Company Email', description: 'Email on official documents' },
  { key: 'company_website', value: 'https://sparkpretty.co.ke', type: 'text', group: 'business', section: 'business', label: 'Company Website', description: 'Website on official documents' },
  { key: 'company_logo', value: '/images/logo-mark.svg', type: 'image', group: 'business', section: 'business', label: 'Company Logo', description: 'Logo displayed on documents' },
  { key: 'company_bank_name', value: '', type: 'text', group: 'business', section: 'business', label: 'Bank Name', description: 'Bank used for M-Pesa business settlement' },
  { key: 'company_bank_account', value: '', type: 'text', group: 'business', section: 'business', label: 'Bank Account No.', description: 'Bank account shown on invoices' },
  { key: 'company_bank_branch', value: '', type: 'text', group: 'business', section: 'business', label: 'Bank Branch', description: 'Bank branch name' },
  { key: 'company_mpesa_paybill', value: '', type: 'text', group: 'business', section: 'business', label: 'M-Pesa Paybill', description: 'Paybill / Till number for payments (if any)' },
  { key: 'company_signature_name', value: 'Authorised Signature', type: 'text', group: 'business', section: 'business', label: 'Signature Title', description: 'Title under the signature line on documents' },
  { key: 'company_quote_terms', value: 'This quotation is valid for 14 days from the date of issue. Prices are in Kenyan Shillings (KES) and inclusive of applicable taxes unless stated otherwise. Delivery and payment terms as agreed.', type: 'textarea', group: 'business', section: 'business', label: 'Quotation Terms', description: 'Default terms & conditions for quotations' },
  { key: 'company_invoice_terms', value: 'Payment is due within 7 days of the invoice date unless otherwise agreed. Please reference the invoice number when making payment.', type: 'textarea', group: 'business', section: 'business', label: 'Invoice Terms', description: 'Default terms & conditions for invoices' },
  { key: 'company_receipt_note', value: 'Thank you for your business. This receipt confirms payment received.', type: 'textarea', group: 'business', section: 'business', label: 'Receipt Note', description: 'Default note printed on receipts' },

  // ===== SEO =====
  { key: 'seo_home_title', value: "Women's Fashion Kenya", type: 'text', group: 'seo', section: 'seo', label: 'Home Page Title' },
  { key: 'seo_home_description', value: "Kenya's premier women's fashion destination. Shop curated dresses, tops, shoes & accessories. M-Pesa checkout. Free shipping over KSh 5,000.", type: 'textarea', group: 'seo', section: 'seo', label: 'Home Page Description' },
  { key: 'shop_seo_title', value: "Shop Women's Fashion", type: 'text', group: 'seo', section: 'seo', label: 'Shop Page Title' },
  { key: 'shop_seo_description', value: "Browse our curated collection of women's fashion. Dresses, tops, shoes, and accessories with M-Pesa checkout.", type: 'textarea', group: 'seo', section: 'seo', label: 'Shop Page Description' },
  { key: 'seo_about_title', value: 'About Us', type: 'text', group: 'seo', section: 'seo', label: 'About Page Title' },
  { key: 'seo_about_description', value: "Learn the story behind Sparkpretty Closet — Kenya's curated women's fashion destination.", type: 'textarea', group: 'seo', section: 'seo', label: 'About Page Description' },
  { key: 'seo_contact_title', value: 'Contact Us', type: 'text', group: 'seo', section: 'seo', label: 'Contact Page Title' },
  { key: 'seo_contact_description', value: 'Get in touch with Sparkpretty Closet for enquiries, support, or collaborations. Call or WhatsApp 0729366991.', type: 'textarea', group: 'seo', section: 'seo', label: 'Contact Page Description' },
];

// ============================================================
// Helpers
// ============================================================

export const findField = (key) => CONTENT_REGISTRY.find((f) => f.key === key);

export const sectionsFromRegistry = () =>
  SECTION_ORDER
    .map((id) => ({
      id,
      label: SECTION_LABELS[id] || id,
      fields: CONTENT_REGISTRY
        .filter((f) => f.section === id)
        .map(({ key, type, group, section, label, description, placeholder }) => ({ key, type, group, section, label, description, placeholder })),
    }))
    .filter((s) => s.fields.length > 0);

export default CONTENT_REGISTRY;
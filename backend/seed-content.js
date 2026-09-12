import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Setting from './models/Setting.js';

dotenv.config();

const contentEntries = [
  // ===== GENERAL =====
  { key: 'site_name', value: 'Sparkpretty Closet', type: 'text', group: 'general', section: 'general', label: 'Site Name', description: 'Brand name displayed in header, footer, and SEO' },
  { key: 'site_tagline', value: "Women's Fashion", type: 'text', group: 'general', section: 'general', label: 'Site Tagline', description: 'Tagline shown next to brand name' },
  { key: 'site_url', value: 'https://sparkpretty.co.ke', type: 'text', group: 'general', section: 'general', label: 'Site URL', description: 'Canonical site URL' },
  { key: 'site_description', value: "Kenya's premier women's fashion destination. Curated dresses, tops, shoes & accessories with M-Pesa checkout.", type: 'textarea', group: 'seo', section: 'general', label: 'Default Meta Description', description: 'Used when no page-specific description is set' },
  { key: 'site_og_image', value: 'https://placehold.co/1200x630/FFB6C1/000000?text=Sparkpretty+Closet', type: 'text', group: 'seo', section: 'general', label: 'Default OG Image', description: 'Social media share image fallback' },

  // ===== CONTACT INFO =====
  { key: 'contact_phone', value: '0729366991', type: 'text', group: 'contact', section: 'contact', label: 'Phone Number', description: 'Primary phone displayed in header, footer, and contact page' },
  { key: 'contact_phone_intl', value: '254729366991', type: 'text', group: 'contact', section: 'contact', label: 'Phone (International)', description: 'E.164 format for WhatsApp links' },
  { key: 'contact_email', value: 'hello@sparkpretty.co.ke', type: 'text', group: 'contact', section: 'contact', label: 'Email Address', description: 'Primary email displayed across the site' },
  { key: 'contact_whatsapp', value: '254729366991', type: 'text', group: 'contact', section: 'contact', label: 'WhatsApp Number', description: 'International format for wa.me links' },
  { key: 'contact_location', value: 'Nairobi, Kenya', type: 'text', group: 'contact', section: 'contact', label: 'Location', description: 'Physical location displayed on contact page' },
  { key: 'contact_business_hours', value: 'Mon-Sat 8AM-8PM', type: 'text', group: 'contact', section: 'contact', label: 'Business Hours (short)', description: 'Short business hours shown in header' },
  { key: 'contact_hours_detailed', value: JSON.stringify([
    { day: 'Monday - Friday', hours: '8:00 AM - 8:00 PM' },
    { day: 'Saturday', hours: '9:00 AM - 6:00 PM' },
    { day: 'Sunday', hours: '10:00 AM - 4:00 PM' },
    { day: 'WhatsApp', hours: 'Available 24/7' },
  ]), type: 'json', group: 'contact', section: 'contact', label: 'Detailed Business Hours', description: 'Full hours table for contact page' },
  { key: 'contact_maps_embed', value: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d15955.0!2d36.8219!3d-1.2921!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x182f173c01e3e3e3%3A0x1234567890abcdef!2sNairobi%2C%20Kenya!5e0!3m2!1sen!2ske!4v1', type: 'text', group: 'contact', section: 'contact', label: 'Google Maps Embed URL', description: 'iframe src for the map on contact page' },

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
  { key: 'home_hero_image', value: '/images/hero-1.jpeg', type: 'text', group: 'content', section: 'home_hero', label: 'Hero Image', description: 'Hero section main image' },

  // ===== HOME PAGE - STORY =====
  { key: 'home_story_heading', value: 'Fashion That Celebrates You', type: 'text', group: 'content', section: 'home_story', label: 'Story Section Heading' },
  { key: 'home_story_para1', value: 'Sparkpretty Closet was born from a simple belief: every woman deserves to feel beautiful and confident in what she wears. We curate fashion that blends African vibrancy with global trends, creating pieces that tell your story.', type: 'textarea', group: 'content', section: 'home_story', label: 'Story Paragraph 1' },
  { key: 'home_story_para2', value: 'From the bustling streets of Nairobi to the serene beaches of Mombasa, our collections are designed for the modern Kenyan woman who embraces her unique sparkle.', type: 'textarea', group: 'content', section: 'home_story', label: 'Story Paragraph 2' },
  { key: 'home_story_image', value: '/images/hero-3.jpeg', type: 'text', group: 'content', section: 'home_story', label: 'Story Section Image' },
  { key: 'home_story_stat_customers', value: '2,000+', type: 'text', group: 'content', section: 'home_story', label: 'Stats: Happy Customers' },
  { key: 'home_story_stat_styles', value: '100+', type: 'text', group: 'content', section: 'home_story', label: 'Stats: Unique Styles' },
  { key: 'home_story_stat_counties', value: '47', type: 'text', group: 'content', section: 'home_story', label: 'Stats: Counties Served' },

  // ===== HOME PAGE - GALLERY =====
  { key: 'home_gallery_images', value: JSON.stringify([
    { alt: 'Woman in Rose Garden Midi Dress at brunch', image: '/images/hero-2.jpeg' },
    { alt: 'Style flatlay with crossbody bag and accessories', image: '/images/accessories-2.jpeg' },
    { alt: 'Model wearing Elegant Wrap Dress at office', image: '/images/hero-4.jpeg' },
    { alt: 'Summer look with Sunset Maxi Dress on beach', image: '/images/dresses-2.jpeg' },
    { alt: 'Street style with canvas sneakers and jeans', image: '/images/shoes-7.jpeg' },
    { alt: 'Evening look with strappy heels and clutch', image: '/images/shoes-5.jpeg' },
  ]), type: 'json', group: 'content', section: 'home_gallery', label: 'Gallery Images', description: 'JSON array of {alt, image} objects' },

  // ===== HOME PAGE - TESTIMONIALS =====
  { key: 'home_testimonials', value: JSON.stringify([
    { name: 'Amina W.', location: 'Nairobi', rating: 5, text: "I've never felt so confident in my outfits! The Rose Garden Midi Dress is absolutely stunning. Sparkpretty has become my go-to for every occasion.", avatar: 'A', product: 'Rose Garden Midi Dress' },
    { name: 'Faith M.', location: 'Mombasa', rating: 5, text: 'The quality is incredible for the price. I ordered 3 dresses and they all fit perfectly. The M-Pesa checkout was so easy!', avatar: 'F', product: 'Elegant Wrap Dress' },
    { name: 'Grace N.', location: 'Kisumu', rating: 5, text: "Fast delivery, beautiful packaging, and the clothes look exactly like the photos. I'm a customer for life!", avatar: 'G', product: 'Sunset Maxi Dress' },
    { name: 'Wanjiku K.', location: 'Nakuru', rating: 5, text: 'The crossbody bag is my daily essential now. So chic and fits everything I need. Highly recommend Sparkpretty!', avatar: 'W', product: 'Quilted Crossbody Bag' },
    { name: 'Mercy O.', location: 'Eldoret', rating: 5, text: "I was skeptical ordering online but the size guide was spot-on. The silk blouse is gorgeous. Will definitely order again!", avatar: 'M', product: 'Silk Touch Blouse' },
    { name: 'Nancy A.', location: 'Thika', rating: 5, text: "My friends keep asking where I got my outfit. The quality rivals brands I've paid double for. Thank you Sparkpretty!", avatar: 'N', product: 'Oversized Knit Sweater' },
  ]), type: 'json', group: 'content', section: 'home_testimonials', label: 'Testimonials', description: 'JSON array of customer testimonials' },

  // ===== HOME PAGE - PROMO =====
  { key: 'home_promo_heading', value: 'Up to 30% Off', type: 'text', group: 'content', section: 'home_promo', label: 'Promo Banner Heading' },
  { key: 'home_promo_text', value: "Spring into savings! Shop our curated sale collection before it's gone.", type: 'textarea', group: 'content', section: 'home_promo', label: 'Promo Banner Text' },
  { key: 'home_promo_cta', value: 'Shop the Sale', type: 'text', group: 'content', section: 'home_promo', label: 'Promo CTA Button' },

  // ===== HOME PAGE - NEWSLETTER =====
  { key: 'home_newsletter_heading', value: 'Stay in the Spark', type: 'text', group: 'content', section: 'home_newsletter', label: 'Newsletter Heading' },
  { key: 'home_newsletter_text', value: 'Get exclusive access to new arrivals, special discounts, and styling tips delivered straight to your inbox.', type: 'textarea', group: 'content', section: 'home_newsletter', label: 'Newsletter Text' },
  { key: 'home_newsletter_subscribers', value: '2,000+', type: 'text', group: 'content', section: 'home_newsletter', label: 'Subscriber Count Display', description: 'Displayed as social proof' },

  // ===== HOME PAGE - FINAL CTA =====
  { key: 'home_cta_heading', value: 'Ready to Sparkle?', type: 'text', group: 'content', section: 'home_cta', label: 'Final CTA Heading' },
  { key: 'home_cta_text', value: 'Join thousands of women who trust Sparkpretty Closet for their wardrobe essentials. Your next favorite outfit is waiting.', type: 'textarea', group: 'content', section: 'home_cta', label: 'Final CTA Text' },

  // ===== HOME PAGE - TRUST BADGES =====
  { key: 'free_shipping_threshold', value: '5,000', type: 'text', group: 'content', section: 'home_trust', label: 'Free Shipping Threshold', description: 'Amount in KSh for free shipping' },

  // ===== FOOTER =====
  { key: 'footer_tagline', value: 'Your destination for beautiful, confident fashion. Curated pieces that celebrate the sparkle in every woman.', type: 'textarea', group: 'content', section: 'footer', label: 'Footer Brand Tagline' },
  { key: 'footer_newsletter_heading', value: 'Stay in the Spark', type: 'text', group: 'content', section: 'footer', label: 'Footer Newsletter Heading' },
  { key: 'footer_newsletter_subheading', value: 'Join Our Pink Community', type: 'text', group: 'content', section: 'footer', label: 'Footer Newsletter Subheading' },
  { key: 'footer_newsletter_text', value: 'Get 10% off your first order + new arrivals, exclusive deals, and style inspiration straight to your inbox.', type: 'textarea', group: 'content', section: 'footer', label: 'Footer Newsletter Text' },

  // ===== ABOUT PAGE =====
  { key: 'about_hero_heading', value: 'Fashion That Speaks Your Story', type: 'text', group: 'content', section: 'about', label: 'About Hero Heading' },
  { key: 'about_hero_text', value: 'We believe every woman deserves to feel beautiful, confident, and radiant in what she wears. Sparkpretty Closet curates fashion that celebrates your unique sparkle.', type: 'textarea', group: 'content', section: 'about', label: 'About Hero Text' },
  { key: 'about_story_heading', value: 'Born from a Passion for Fashion', type: 'text', group: 'content', section: 'about', label: 'About Story Heading' },
  { key: 'about_story_para1', value: 'Sparkpretty Closet was founded in 2020 with a simple dream: to bring beautiful, high-quality fashion to every Kenyan woman. What started as a small collection of hand-picked pieces has grown into a trusted fashion destination serving thousands of customers across the country.', type: 'textarea', group: 'content', section: 'about', label: 'About Story Paragraph 1' },
  { key: 'about_story_para2', value: 'Our founder, Mercy Wanjiku, noticed that many women struggled to find fashion that was both stylish and affordable. She set out to create a brand that celebrates African femininity while embracing global trends \u2014 a brand that makes every woman feel like the best version of herself.', type: 'textarea', group: 'content', section: 'about', label: 'About Story Paragraph 2' },
  { key: 'about_story_para3', value: "Today, we curate collections that blend elegance with everyday wearability. From stunning dresses to statement accessories, every piece in our collection is chosen with love, quality, and your unique style in mind.", type: 'textarea', group: 'content', section: 'about', label: 'About Story Paragraph 3' },
  { key: 'about_stat_customers', value: '2,000+', type: 'text', group: 'content', section: 'about', label: 'About: Happy Customers' },
  { key: 'about_stat_styles', value: '100+', type: 'text', group: 'content', section: 'about', label: 'About: Unique Styles' },
  { key: 'about_stat_counties', value: '47', type: 'text', group: 'content', section: 'about', label: 'About: Counties Served' },
  { key: 'about_milestones', value: JSON.stringify([
    { year: '2020', title: 'The Spark', desc: 'Sparkpretty Closet was born from a passion for making every woman feel beautiful and confident.' },
    { year: '2021', title: 'Growing Community', desc: 'Reached 500+ happy customers across Nairobi and Mombasa. Expanded our collection to 100+ styles.' },
    { year: '2023', title: 'Nationwide Delivery', desc: 'Expanded to serve all of Kenya. Introduced M-Pesa checkout for seamless payments.' },
    { year: '2025', title: '2,000+ Customers', desc: 'Celebrating over 2,000 satisfied customers. Launched our blog and style guides.' },
    { year: '2026', title: 'The Future', desc: "Aiming to become Africa's leading fashion destination. Sustainability initiatives and new collections." },
  ]), type: 'json', group: 'content', section: 'about', label: 'Milestones Timeline' },
  { key: 'about_team', value: JSON.stringify([
    { name: 'Mercy Wanjiku', role: 'Founder & Creative Director', bio: 'Passionate about African fashion and empowering women through style. Mercy curates every collection with love.', initials: 'MW', color: '#FFB6C1' },
    { name: 'Faith Akinyi', role: 'Head of Operations', bio: 'Ensures every order is packed with care and delivered on time. Faith makes the magic happen behind the scenes.', initials: 'FA', color: '#FF8FA3' },
    { name: 'Grace Muthoni', role: 'Lead Stylist', bio: 'Creates stunning lookbooks and style guides to help our customers look their absolute best.', initials: 'GM', color: '#FFB6C1' },
  ]), type: 'json', group: 'content', section: 'about', label: 'Team Members' },
  { key: 'about_mission', value: 'To make stunning, high-quality fashion accessible to every Kenyan woman. We bridge the gap between style and affordability, bringing you curated collections that celebrate your unique beauty.', type: 'textarea', group: 'content', section: 'about', label: 'Mission Statement' },
  { key: 'about_mission_detail', value: "From everyday essentials to statement pieces, we're here to ensure you always have something beautiful to wear \u2014 delivered right to your doorstep with a smile.", type: 'textarea', group: 'content', section: 'about', label: 'Mission Detail' },
  { key: 'about_vision', value: "To become Africa's leading fashion destination for shoes, clothes, and bags \u2014 a brand that empowers women across the continent to express their unique style with confidence.", type: 'textarea', group: 'content', section: 'about', label: 'Vision Statement' },
  { key: 'about_vision_detail', value: 'We envision a world where every woman has access to beautiful, sustainable fashion that makes her feel extraordinary, regardless of where she lives or what her budget is.', type: 'textarea', group: 'content', section: 'about', label: 'Vision Detail' },
  { key: 'about_testimonials', value: JSON.stringify([
    { name: 'Amina W.', location: 'Nairobi', text: 'Sparkpretty has completely transformed my wardrobe. The quality is incredible and the styles are always on point!', rating: 5 },
    { name: 'Faith M.', location: 'Mombasa', text: 'I was nervous ordering online, but the experience was flawless. The dress fit perfectly and the M-Pesa checkout was so easy.', rating: 5 },
    { name: 'Grace N.', location: 'Kisumu', text: 'Fast delivery, beautiful packaging, and the clothes look exactly like the photos. I am a customer for life!', rating: 5 },
    { name: 'Wanjiku K.', location: 'Nakuru', text: 'The crossbody bag is my daily essential now. So chic and fits everything I need. Highly recommend Sparkpretty!', rating: 5 },
  ]), type: 'json', group: 'content', section: 'about', label: 'About Testimonials' },

  // ===== CONTACT PAGE =====
  { key: 'contact_hero_heading', value: "We'd Love to Hear From You", type: 'text', group: 'content', section: 'contact', label: 'Contact Hero Heading' },
  { key: 'contact_hero_text', value: 'Reach out for inquiries, support, or collaborations. Our team is ready to help you find your perfect style.', type: 'textarea', group: 'content', section: 'contact', label: 'Contact Hero Text' },
  { key: 'contact_faqs', value: JSON.stringify([
    { q: 'How long does shipping take?', a: 'Standard shipping takes 2-5 business days within Kenya. Express delivery to Nairobi is available for next-day delivery on orders placed before 2 PM.' },
    { q: 'What is your return policy?', a: 'We offer a 7-day hassle-free return policy. Items must be unworn, unwashed, with tags attached. Contact us to initiate a return.' },
    { q: 'How do I find my size?', a: "Check our comprehensive Size Guide for detailed measurements in centimeters. If you're between sizes, we recommend sizing up for comfort." },
    { q: 'Do you offer international shipping?', a: "Currently we ship within Kenya. We're working on expanding to East African countries soon! Stay tuned." },
    { q: 'How do I pay with M-Pesa?', a: "At checkout, select M-Pesa as your payment method. You'll receive an STK push prompt on your phone \u2014 just enter your PIN to complete the payment." },
    { q: 'Can I track my order?', a: "Yes! Once your order is shipped, you'll receive a confirmation via SMS and email with tracking details." },
  ]), type: 'json', group: 'content', section: 'contact', label: 'FAQs' },

  // ===== SHIPPING & TRUST =====
  { key: 'shipping_fee', value: '350', type: 'text', group: 'content', section: 'shipping', label: 'Flat Shipping Fee (KES)', description: 'Delivery fee charged when the order is below the free-shipping threshold. Whole number, no decimals.' },
  { key: 'return_policy', value: '7-day returns', type: 'text', group: 'content', section: 'shipping', label: 'Return Policy (short)', description: 'Short return policy shown on product pages' },
  { key: 'return_policy_full', value: '7-day easy returns', type: 'text', group: 'content', section: 'shipping', label: 'Return Policy (full)', description: 'Longer return wording shown in trust badges' },
  { key: 'secure_payment_note', value: 'Secure M-Pesa checkout', type: 'text', group: 'content', section: 'shipping', label: 'Secure Payment Note', description: 'Trust signal on shop page' },
  { key: 'secure_payment_short', value: 'Secure pay', type: 'text', group: 'content', section: 'shipping', label: 'Secure Payment (short)', description: 'Short trust signal on product pages' },
  { key: 'trust_free_shipping_note', value: 'Free shipping over KSh 5,000', type: 'text', group: 'content', section: 'shipping', label: 'Free Shipping Note', description: 'Trust badge text on the shop page' },
  { key: 'trust_free_shipping_short', value: 'Free shipping 5K+', type: 'text', group: 'content', section: 'shipping', label: 'Free Shipping Note (short)', description: 'Short trust badge on product pages' },
  { key: 'default_country', value: 'Kenya', type: 'text', group: 'contact', section: 'contact', label: 'Default Country', description: 'Country pre-selected at checkout' },
  { key: 'cart_empty_text', value: 'Discover something beautiful for yourself.', type: 'text', group: 'content', section: 'shipping', label: 'Empty Cart Message', description: 'Message shown when the cart has no items' },

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

  // ===== SIZE GUIDE =====
  { key: 'sizing_page_heading', value: 'Size Guide', type: 'text', group: 'content', section: 'size_guide', label: 'Page Heading' },
  { key: 'sizing_page_subtitle', value: 'Find your perfect fit', type: 'text', group: 'content', section: 'size_guide', label: 'Page Subtitle' },
  { key: 'sizing_measure_heading', value: 'How to Measure', type: 'text', group: 'content', section: 'size_guide', label: 'How to Measure Heading' },
  { key: 'sizing_clothing_heading', value: 'Clothing Sizes (cm)', type: 'text', group: 'content', section: 'size_guide', label: 'Clothing Sizes Heading' },
  { key: 'sizing_shoes_heading', value: 'Shoe Sizes', type: 'text', group: 'content', section: 'size_guide', label: 'Shoe Sizes Heading' },
  { key: 'sizing_instructions', value: JSON.stringify([
    { title: 'Bust', text: 'Measure around the fullest part of your chest, keeping the tape horizontal.' },
    { title: 'Waist', text: 'Measure around your natural waistline, the narrowest part of your torso.' },
    { title: 'Hips', text: 'Measure around the fullest part of your hips and buttocks.' },
  ]), type: 'json', group: 'content', section: 'size_guide', label: 'Measurement Instructions', description: 'JSON array of {title, text} steps' },
  { key: 'sizing_clothing', value: JSON.stringify([
    { size: 'XS', bust: '80-84', waist: '60-64', hips: '86-90' },
    { size: 'S', bust: '84-88', waist: '64-68', hips: '90-94' },
    { size: 'M', bust: '88-92', waist: '68-72', hips: '94-98' },
    { size: 'L', bust: '92-96', waist: '72-76', hips: '98-102' },
    { size: 'XL', bust: '96-100', waist: '76-80', hips: '102-106' },
  ]), type: 'json', group: 'content', section: 'size_guide', label: 'Clothing Size Table', description: 'JSON array of {size, bust, waist, hips} in cm' },
  { key: 'sizing_shoes', value: JSON.stringify([
    { eu: '36', us: '5.5', uk: '3.5', cm: '23' },
    { eu: '37', us: '6.5', uk: '4.5', cm: '23.5' },
    { eu: '38', us: '7.5', uk: '5', cm: '24' },
    { eu: '39', us: '8', uk: '5.5', cm: '24.5' },
    { eu: '40', us: '9', uk: '6.5', cm: '25' },
    { eu: '41', us: '10', uk: '7.5', cm: '26' },
  ]), type: 'json', group: 'content', section: 'size_guide', label: 'Shoe Size Table', description: 'JSON array of {eu, us, uk, cm}' },
  { key: 'shop_size_filters', value: JSON.stringify({ clothing: ['XS', 'S', 'M', 'L', 'XL'], shoes: ['36', '37', '38', '39', '40', '41'] }), type: 'json', group: 'content', section: 'size_guide', label: 'Shop Size Filters', description: 'Size options shown in the shop filter sidebar' },

  // ===== BLOG PAGE =====
  { key: 'blog_hero_badge', value: 'The Spark Journal', type: 'text', group: 'content', section: 'blog', label: 'Hero Badge', description: 'Badge above the blog hero heading' },
  { key: 'blog_hero_heading', value: 'Style Stories & Fashion Insights', type: 'text', group: 'content', section: 'blog', label: 'Hero Heading' },
  { key: 'blog_hero_text', value: 'Discover trends, styling tips, and stories from the Sparkpretty world. Your fashion journey starts here.', type: 'textarea', group: 'content', section: 'blog', label: 'Hero Text' },
  { key: 'blog_hero_cta', value: 'Start Reading', type: 'text', group: 'content', section: 'blog', label: 'Hero CTA Button' },
  { key: 'blog_categories', value: JSON.stringify([
    { name: 'All', slug: '', icon: '✨' },
    { name: 'Style Tips', slug: 'tips', icon: '💡' },
    { name: 'Trends', slug: 'trends', icon: '🔥' },
    { name: 'Dresses', slug: 'dresses', icon: '👗' },
    { name: 'Shoes', slug: 'shoes', icon: '👟' },
    { name: 'Accessories', slug: 'accessories', icon: '👜' },
    { name: 'Sustainability', slug: 'sustainability', icon: '🌿' },
    { name: 'Behind the Scenes', slug: 'behind-the-scenes', icon: '🎬' },
  ]), type: 'json', group: 'content', section: 'blog', label: 'Category Pills', description: 'JSON array of {name, slug, icon}' },
  { key: 'blog_spotlights', value: JSON.stringify([
    { name: 'Amina W.', location: 'Nairobi', text: 'Wore the Rose Garden Midi Dress to my friend\'s wedding and got so many compliments!', avatar: 'A', product: 'Rose Garden Midi Dress' },
    { name: 'Faith M.', location: 'Mombasa', text: 'The Strappy Heel Sandals are my go-to for every event. So comfortable and stylish!', avatar: 'F', product: 'Strappy Heel Sandals' },
    { name: 'Grace N.', location: 'Kisumu', text: 'I styled the Silk Blouse with high-waist jeans for a casual Friday look. Loved it!', avatar: 'G', product: 'Silk Touch Blouse' },
  ]), type: 'json', group: 'content', section: 'blog', label: 'Customer Spotlights', description: 'JSON array of {name, location, text, avatar, product}' },
  { key: 'blog_style_guides', value: JSON.stringify([
    { title: 'How to Style a Midi Dress for Every Occasion', excerpt: 'From office to weekend brunch — master the art of the versatile midi dress.', gradient: 'from-pink-100 to-rose-200', icon: '👗', readTime: '5 min' },
    { title: '10 Wardrobe Essentials Every Kenyan Woman Needs', excerpt: 'Build a versatile wardrobe with these timeless basics that work hard.', gradient: 'from-amber-100 to-orange-200', icon: '✨', readTime: '4 min' },
    { title: 'Accessorizing 101: Complete Any Outfit', excerpt: 'The right accessories can transform a simple look into something extraordinary.', gradient: 'from-purple-100 to-indigo-200', icon: '👜', readTime: '3 min' },
  ]), type: 'json', group: 'content', section: 'blog', label: 'Style Guide Cards', description: 'JSON array of {title, excerpt, gradient, icon, readTime}' },
  { key: 'blog_bts_items', value: JSON.stringify([
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
  { key: 'whatsapp_cta', value: 'Ask about this item', type: 'text', group: 'contact', section: 'contact', label: 'WhatsApp CTA Text', description: 'Button text for the WhatsApp enquiry link on product pages' },
  { key: 'blog_post_author_fallback', value: 'Sparkpretty Team', type: 'text', group: 'content', section: 'blog', label: 'Default Author Name' },
  { key: 'blog_post_author_bio', value: 'Curating fashion tips and stories for the Sparkpretty community.', type: 'text', group: 'content', section: 'blog', label: 'Default Author Bio' },
  { key: 'blog_post_cta_heading', value: 'Ready to Update Your Wardrobe?', type: 'text', group: 'content', section: 'blog', label: 'Post CTA Heading' },
  { key: 'blog_post_cta_text', value: 'Explore our latest collection and find your perfect look.', type: 'text', group: 'content', section: 'blog', label: 'Post CTA Text' },
  { key: 'blog_post_newsletter_heading', value: 'Enjoyed this article?', type: 'text', group: 'content', section: 'blog', label: 'Post Newsletter Heading' },
  { key: 'blog_post_newsletter_text', value: 'Subscribe for more fashion tips and get 10% off your first order.', type: 'text', group: 'content', section: 'blog', label: 'Post Newsletter Text' },
  { key: 'blog_post_related_heading', value: 'You Might Also Like', type: 'text', group: 'content', section: 'blog', label: 'Related Posts Heading' },
  { key: 'shop_seo_description', value: "Browse our curated collection of women's fashion. Dresses, tops, shoes, and accessories with M-Pesa checkout.", type: 'textarea', group: 'seo', section: 'seo', label: 'Shop Page Description' },

  // ===== SEO =====
  { key: 'seo_home_title', value: "Women's Fashion Kenya", type: 'text', group: 'seo', section: 'seo', label: 'Home Page Title' },
  { key: 'seo_home_description', value: "Kenya's premier women's fashion destination. Shop curated dresses, tops, shoes & accessories. M-Pesa checkout. Free shipping over KSh 5,000.", type: 'textarea', group: 'seo', section: 'seo', label: 'Home Page Description' },
];

const seedContent = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    let created = 0;
    let updated = 0;

    for (const entry of contentEntries) {
      const existing = await Setting.findOne({ key: entry.key });
      if (existing) {
        await Setting.findOneAndUpdate({ key: entry.key }, { $set: entry });
        updated++;
      } else {
        await Setting.create(entry);
        created++;
      }
    }

    console.log(`Content seed complete: ${created} created, ${updated} updated (${contentEntries.length} total)`);
    process.exit(0);
  } catch (err) {
    console.error('Content seed failed:', err);
    process.exit(1);
  }
};

seedContent();

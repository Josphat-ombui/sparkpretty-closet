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

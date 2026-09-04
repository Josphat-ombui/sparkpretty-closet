import { Router } from 'express';
import Product from '../models/Product.js';
import Blog from '../models/Blog.js';

const router = Router();
const BASE_URL = process.env.SITE_URL || 'https://sparkpretty.co.ke';

router.get('/sitemap.xml', async (req, res) => {
  try {
    const products = await Product.find({ active: true }).select('slug updatedAt');
    const posts = await Blog.find({ published: true }).select('slug updatedAt');

    let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url><loc>${BASE_URL}</loc><changefreq>daily</changefreq><priority>1.0</priority></url>
  <url><loc>${BASE_URL}/shop</loc><changefreq>daily</changefreq><priority>0.9</priority></url>
  <url><loc>${BASE_URL}/about</loc><changefreq>monthly</changefreq><priority>0.6</priority></url>
  <url><loc>${BASE_URL}/contact</loc><changefreq>monthly</changefreq><priority>0.6</priority></url>
  <url><loc>${BASE_URL}/blog</loc><changefreq>weekly</changefreq><priority>0.7</priority></url>
  <url><loc>${BASE_URL}/size-guide</loc><changefreq>monthly</changefreq><priority>0.5</priority></url>`;

    for (const p of products) {
      xml += `\n  <url><loc>${BASE_URL}/product/${p.slug}</loc><lastmod>${p.updatedAt?.toISOString().split('T')[0]}</lastmod><changefreq>weekly</changefreq><priority>0.8</priority></url>`;
    }
    for (const b of posts) {
      xml += `\n  <url><loc>${BASE_URL}/blog/${b.slug}</loc><lastmod>${b.updatedAt?.toISOString().split('T')[0]}</lastmod><changefreq>weekly</changefreq><priority>0.7</priority></url>`;
    }

    xml += '\n</urlset>';
    res.header('Content-Type', 'application/xml').send(xml);
  } catch (err) {
    res.status(500).send('Error generating sitemap');
  }
});

router.get('/robots.txt', (req, res) => {
  const content = `User-agent: *
Allow: /
Disallow: /admin
Disallow: /checkout
Disallow: /account

Sitemap: ${BASE_URL}/sitemap.xml`;
  res.header('Content-Type', 'text/plain').send(content);
});

export default router;

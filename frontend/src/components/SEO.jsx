import { Helmet } from 'react-helmet-async';
import { useContent } from '../context/ContentContext';

const FALLBACK_NAME = 'Sparkpretty Closet';
const FALLBACK_DESC = "Kenya's premier women's fashion destination. Curated dresses, tops, shoes & accessories with M-Pesa checkout.";
const FALLBACK_IMAGE = 'https://placehold.co/1200x630/FFB6C1/000000?text=Sparkpretty+Closet';
const FALLBACK_URL = 'https://sparkpretty.co.ke';

export default function SEO({ title, description, image, url, type = 'website', jsonLd }) {
  const { get, loaded } = useContent();
  const siteName = loaded ? get('site_name', FALLBACK_NAME) : FALLBACK_NAME;
  const siteUrl = loaded ? get('site_url', FALLBACK_URL) : FALLBACK_URL;
  const defaultDesc = loaded ? get('site_description', FALLBACK_DESC) : FALLBACK_DESC;
  const defaultImage = loaded ? get('site_og_image', FALLBACK_IMAGE) : FALLBACK_IMAGE;

  const fullTitle = title ? `${title} | ${siteName}` : `${siteName} — Women's Fashion`;
  const metaDesc = description || defaultDesc;
  const metaImage = image || defaultImage;
  const metaUrl = url ? `${siteUrl}${url}` : siteUrl;

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={metaDesc} />
      <link rel="canonical" href={metaUrl} />

      <meta property="og:type" content={type} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={metaDesc} />
      <meta property="og:image" content={metaImage} />
      <meta property="og:url" content={metaUrl} />
      <meta property="og:site_name" content={siteName} />

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={metaDesc} />
      <meta name="twitter:image" content={metaImage} />

      {jsonLd && (
        <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
      )}
    </Helmet>
  );
}

export function ProductSEO({ product }) {
  const { get, loaded } = useContent();
  const siteName = loaded ? get('site_name', 'Sparkpretty Closet') : 'Sparkpretty Closet';
  const siteUrl = loaded ? get('site_url', 'https://sparkpretty.co.ke') : 'https://sparkpretty.co.ke';
  const defaultImage = 'https://placehold.co/1200x630/FFB6C1/000000?text=Sparkpretty+Closet';
  const variant = product?.variants?.[0] || {};
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product?.name,
    description: product?.description,
    image: variant.images?.[0] || defaultImage,
    brand: { '@type': 'Brand', name: siteName },
    offers: {
      '@type': 'Offer',
      price: variant.salePrice || variant.price,
      priceCurrency: 'KES',
      availability: variant.stock > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
      url: `${siteUrl}/product/${product?.slug}`,
    },
  };

  return (
    <SEO
      title={product?.name}
      description={product?.description?.slice(0, 160)}
      image={variant.images?.[0]}
      url={`/product/${product?.slug}`}
      type="product"
      jsonLd={jsonLd}
    />
  );
}

export function BlogSEO({ post }) {
  const { get, loaded } = useContent();
  const siteName = loaded ? get('site_name', 'Sparkpretty Closet') : 'Sparkpretty Closet';
  const siteUrl = loaded ? get('site_url', 'https://sparkpretty.co.ke') : 'https://sparkpretty.co.ke';
  const defaultImage = 'https://placehold.co/1200x630/FFB6C1/000000?text=Sparkpretty+Closet';
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post?.title,
    description: post?.excerpt,
    image: post?.coverImage || defaultImage,
    author: { '@type': 'Organization', name: siteName },
    datePublished: post?.createdAt,
    dateModified: post?.updatedAt,
    url: `${siteUrl}/blog/${post?.slug}`,
  };

  return (
    <SEO
      title={post?.title}
      description={post?.excerpt}
      image={post?.coverImage}
      url={`/blog/${post?.slug}`}
      type="article"
      jsonLd={jsonLd}
    />
  );
}

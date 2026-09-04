import { Helmet } from 'react-helmet-async';

const SITE_NAME = 'Sparkpretty Closet';
const DEFAULT_DESCRIPTION = "Kenya's premier women's fashion destination. Curated dresses, tops, shoes & accessories with M-Pesa checkout.";
const DEFAULT_IMAGE = 'https://placehold.co/1200x630/FFB6C1/000000?text=Sparkpretty+Closet';
const SITE_URL = 'https://sparkpretty.co.ke';

export default function SEO({ title, description, image, url, type = 'website', jsonLd }) {
  const fullTitle = title ? `${title} | ${SITE_NAME}` : `${SITE_NAME} — Women's Fashion`;
  const metaDesc = description || DEFAULT_DESCRIPTION;
  const metaImage = image || DEFAULT_IMAGE;
  const metaUrl = url ? `${SITE_URL}${url}` : SITE_URL;

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
      <meta property="og:site_name" content={SITE_NAME} />

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
  const variant = product?.variants?.[0] || {};
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product?.name,
    description: product?.description,
    image: variant.images?.[0] || DEFAULT_IMAGE,
    brand: { '@type': 'Brand', name: SITE_NAME },
    offers: {
      '@type': 'Offer',
      price: variant.salePrice || variant.price,
      priceCurrency: 'KES',
      availability: variant.stock > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
      url: `${SITE_URL}/product/${product?.slug}`,
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
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post?.title,
    description: post?.excerpt,
    image: post?.coverImage || DEFAULT_IMAGE,
    author: { '@type': 'Organization', name: SITE_NAME },
    datePublished: post?.createdAt,
    dateModified: post?.updatedAt,
    url: `${SITE_URL}/blog/${post?.slug}`,
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

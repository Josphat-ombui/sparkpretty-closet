import { useMemo, useState } from 'react';

export default function ProductImg({
  product,
  variant,
  className = '',
  alt,
  eager = false,
  imgClassName,
  ...rest
}) {
  const fallbackSrc = product?.name
    ? `https://placehold.co/600x800/${(variant?.colorHex || 'F8BBD0').replace('#', '')}/FFFFFF?text=${encodeURIComponent(product.name)}`
    : '';

  const list = useMemo(() => {
    const own = variant?.images?.length ? variant.images : null;
    const pool = (own || (product?.variants || []).flatMap((v) => v.images || [])).filter(Boolean);
    const unique = [...new Set(pool)];
    return fallbackSrc && !unique.includes(fallbackSrc) ? [...unique, fallbackSrc] : unique;
  }, [variant, product, fallbackSrc]);

  const [idx, setIdx] = useState(0);
  const src = list[idx];

  if (!src) {
    return (
      <div className={`flex items-center justify-center text-primary/20 font-heading px-4 text-center ${className}`}>
        {product?.name || 'No image available'}
      </div>
    );
  }

  return (
    <img
      {...rest}
      src={src}
      alt={alt || product?.name || ''}
      loading={eager ? 'eager' : 'lazy'}
      decoding="async"
      className={imgClassName || className}
      onError={() => {
        if (idx < list.length - 1) setIdx(idx + 1);
        else setIdx(-1);
      }}
    />
  );
}
import { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Pencil, Copy, Trash2, ExternalLink, Star, Tag, Layers,
  ShieldCheck, AlertTriangle, PackageOpen, Link2,
} from 'lucide-react';
import { api, formatPrice } from '../../lib/api';
import toast from 'react-hot-toast';
import { PageHeader, Modal } from '../../components/admin/ui.jsx';

function Stat({ icon: Icon, label, value, tone }) {
  return (
    <div className="card p-4 flex items-center gap-3">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${tone}`}><Icon size={18} /></div>
      <div className="min-w-0">
        <p className="text-sm font-bold leading-tight">{value}</p>
        <p className="text-xs text-text-muted truncate">{label}</p>
      </div>
    </div>
  );
}

export default function ProductView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState('');
  const [confirm, setConfirm] = useState(false);

  useEffect(() => {
    api.get(`/admin/products/${id}`)
      .then((r) => {
        const p = r.data;
        setProduct(p);
        setActiveImage(p.coverImage || '');
      })
      .catch(() => toast.error('Failed to load product'))
      .finally(() => setLoading(false));
  }, [id]);

  const duplicate = async () => {
    try {
      const created = (await api.post(`/admin/products/${id}/duplicate`)).data;
      toast.success('Product duplicated');
      navigate(`/admin/products/${created._id}`);
    } catch (err) {
      toast.error(err.message || 'Duplicate failed');
    }
  };

  const handleDelete = async () => {
    try {
      await api.delete(`/admin/products/${id}`);
      toast.success('Product deleted');
      navigate('/admin/products');
    } catch (err) {
      toast.error(err.message || 'Delete failed');
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="skeleton h-8 w-64" />
        <div className="grid lg:grid-cols-5 gap-6">
          <div className="lg:col-span-2 skeleton h-96" />
          <div className="lg:col-span-3 space-y-4"><div className="skeleton h-12" /><div className="skeleton h-40" /><div className="skeleton h-40" /></div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="py-20 text-center">
        <AlertTriangle size={36} className="mx-auto text-warning mb-3" />
        <h2 className="font-heading text-xl font-semibold mb-1">Product not found</h2>
        <p className="text-text-light text-sm mb-5">It may have been deleted.</p>
        <Link to="/admin/products" className="btn-primary text-sm inline-block">Back to products</Link>
      </div>
    );
  }

  const images = [...new Set((product.variants || []).flatMap((v) => v.images || []))];
  const displayImage = activeImage || images[0] || '';
  const hasSale = (product.variants || []).some((v) => v.salePrice > 0);
  const totalUnits = product.totalStock;
  const lowStock = totalUnits <= 5;
  const seoReady = product.metaTitle && product.metaDescription && product.slug;

  return (
    <div>
      <Link to="/admin/products" className="inline-flex items-center gap-1 text-secondary text-sm font-semibold mb-4 hover:gap-2 transition-all">
        <ArrowLeft size={14} /> Back to products
      </Link>

      <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
        <div>
          <h1 className="font-heading text-2xl md:text-3xl font-bold">{product.name}</h1>
          <div className="flex items-center gap-2 mt-2 flex-wrap">
            {product.active
              ? <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-success/10 text-success">Active in store</span>
              : <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-error/10 text-error">Hidden</span>}
            {product.featured && <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-warning/10 text-warning"><Star size={11} className="inline -mt-0.5 mr-0.5" />Featured</span>}
            {product.category?.name &&
              <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-bg text-text-light">
                <Tag size={11} className="inline -mt-0.5 mr-1" />{product.category.name}
              </span>}
            {lowStock && <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-error/10 text-error">Low stock</span>}
          </div>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Link to={`/product/${product.slug}`} target="_blank" rel="noopener noreferrer" className="btn-outline text-sm px-4 flex items-center gap-2">
            <ExternalLink size={14} /> View on store
          </Link>
          <button onClick={duplicate} className="btn-outline text-sm px-4 flex items-center gap-2"><Copy size={14} /> Duplicate</button>
          <button onClick={() => setConfirm(true)} className="inline-flex items-center gap-1.5 text-sm px-4 py-2 rounded-lg border border-error/30 text-error hover:bg-error/10 transition-colors"><Trash2 size={14} /> Delete</button>
          <Link to={`/admin/products/${product._id}/edit`} className="btn-primary text-sm px-4 flex items-center gap-2"><Pencil size={14} /> Edit</Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <Stat icon={Layers} label="Variants" value={product.variantCount} tone="bg-primary/10 text-primary" />
        <Stat icon={PackageOpen} label="Units in stock" value={totalUnits} tone={lowStock ? 'bg-warning/10 text-warning' : 'bg-success/10 text-success'} />
        <Stat icon={Star} label="Avg rating" value={product.ratingData?.avgRating || '—'} tone="bg-warning/10 text-warning" />
        <Stat icon={ShieldCheck} label="SKUs" value={product.variants?.filter((v) => v.sku).length || 0} tone="bg-primary/10 text-primary" />
      </div>

      <div className="grid lg:grid-cols-5 gap-6">
        {/* Gallery */}
        <div className="lg:col-span-2 space-y-4">
          <div className="rounded-card overflow-hidden border border-border bg-bg aspect-[3/4]">
            {displayImage ? (
              <img src={displayImage} alt={product.name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-text-muted text-sm">No image</div>
            )}
          </div>
          {images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-1">
              {images.map((img) => (
                <button
                  key={img}
                  onClick={() => setActiveImage(img)}
                  className={`relative w-20 h-24 rounded-lg overflow-hidden border-2 shrink-0 transition-colors ${displayImage === img ? 'border-primary' : 'border-border hover:border-primary/40'}`}
                  aria-label="Select image"
                >
                  <img src={img} alt="" className="w-full h-full object-cover" loading="lazy" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Details */}
        <div className="lg:col-span-3 space-y-5">
          <div className="card">
            <h2 className="font-heading text-lg font-semibold mb-3">Pricing</h2>
            <div className="flex items-end gap-3 flex-wrap">
              <span className="font-bold text-3xl">
                {product.minPrice ? formatPrice(product.minPrice) : '—'}
                {product.maxPrice && product.maxPrice > product.minPrice && <span className="text-text-light text-xl"> – {formatPrice(product.maxPrice)}</span>}
              </span>
              {hasSale && <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-error/10 text-error mb-1">Sale active</span>}
            </div>
            <p className="text-xs text-text-muted mt-2">Across {product.variantCount} variant(s)</p>
            {product.description && <p className="text-sm text-text-light mt-4 leading-relaxed">{product.description}</p>}
            {product.details && (
              <div className="mt-4 pt-4 border-t border-border">
                <p className="text-xs font-semibold uppercase tracking-widest text-text-muted mb-2">Details</p>
                <p className="text-sm text-text-light leading-relaxed whitespace-pre-line">{product.details}</p>
              </div>
            )}
            {product.tags?.length > 0 && (
              <div className="mt-4 pt-4 border-t border-border flex items-center gap-2 flex-wrap">
                <span className="text-xs font-semibold uppercase tracking-widest text-text-muted">Tags</span>
                {product.tags.map((t) => (
                  <span key={t} className="text-xs bg-bg rounded-full px-2.5 py-1 text-text-light">#{t}</span>
                ))}
              </div>
            )}
          </div>

          {/* Variants */}
          <div className="card">
            <h2 className="font-heading text-lg font-semibold mb-3">Variants</h2>
            <div className="overflow-x-auto -mx-5 px-5">
              <table className="w-full text-sm min-w-[560px]">
                <thead className="text-text-muted uppercase text-xs">
                  <tr>
                    <th className="text-left py-2 font-semibold">Size</th>
                    <th className="text-left py-2 font-semibold">Color</th>
                    <th className="text-left py-2 font-semibold">Material</th>
                    <th className="text-left py-2 font-semibold">SKU</th>
                    <th className="text-right py-2 font-semibold">Price</th>
                    <th className="text-right py-2 font-semibold">Stock</th>
                  </tr>
                </thead>
                <tbody>
                  {product.variants.map((v, i) => (
                    <tr key={i} className="border-t border-border/50">
                      <td className="py-2.5 font-medium">{v.size}</td>
                      <td className="py-2.5">
                        <span className="flex items-center gap-2">
                          <span className="w-4 h-4 rounded-full border border-border shrink-0" style={{ backgroundColor: v.colorHex || '#000' }} />
                          {v.color}
                        </span>
                      </td>
                      <td className="py-2.5 text-text-muted">{v.material || '—'}</td>
                      <td className="py-2.5 text-text-muted">{v.sku || '—'}</td>
                      <td className="py-2.5 text-right whitespace-nowrap">{formatPrice(v.price)}</td>
                      <td className="py-2.5 text-right">
                        {v.stock <= 0
                          ? <span className="text-error font-semibold">Sold out</span>
                          : <span className={v.stock <= 5 ? 'text-warning font-semibold' : 'font-medium'}>{v.stock}</span>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* SEO */}
          <div className="card">
            <h2 className="font-heading text-lg font-semibold mb-3">Search engines</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-text-muted mb-1">Slug</p>
                <p className="text-sm text-text break-all">/products/{product.slug}</p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-text-muted mb-1">Meta title</p>
                <p className="text-sm text-text-light break-words">{product.metaTitle || 'Not set'}</p>
              </div>
              <div className="sm:col-span-2">
                <p className="text-xs font-semibold uppercase tracking-widest text-text-muted mb-1">Meta description</p>
                <p className="text-sm text-text-light">{product.metaDescription || 'Not set'}</p>
              </div>
            </div>
            <p className="text-xs text-text-muted mt-4">
              {seoReady
                ? <span className="inline-flex items-center gap-1 text-success"><ShieldCheck size={12} /> Full SEO metadata present</span>
                : <span className="inline-flex items-center gap-1 text-warning"><AlertTriangle size={12} /> Missing meta title/description</span>}
            </p>
          </div>

          {/* Related products */}
          <div className="card">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-heading text-lg font-semibold">Related products</h2>
              <Link to={`/admin/products/${product._id}/edit`} className="text-xs text-secondary font-semibold hover:underline">Manage</Link>
            </div>
            {product.relatedProducts && product.relatedProducts.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {product.relatedProducts.map((r) => (
                  <Link
                    key={r._id}
                    to={`/admin/products/${r._id}`}
                    className="flex items-center gap-2.5 p-2 rounded-card border border-border hover:border-primary/50 hover:shadow-card transition-all group"
                  >
                    <img
                      src={r.coverImage || 'https://placehold.co/600x800/C2185B/FFFFFF?text=Product'}
                      alt={r.name}
                      className="w-12 h-14 object-cover rounded-md border border-border bg-bg shrink-0"
                      loading="lazy"
                    />
                    <span className="min-w-0 flex-1">
                      <span className="block text-sm font-medium truncate group-hover:text-primary transition-colors">{r.name}</span>
                      <span className="block text-xs text-text-muted mt-0.5 flex items-center gap-1">
                        {r.active === false && <span className="text-[10px] font-semibold uppercase text-warning">Hidden</span>}
                        {r.active !== false && <Link2 size={11} className="shrink-0" />}
                      </span>
                    </span>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="flex items-center gap-3 text-sm text-text-muted">
                <Link2 size={18} className="shrink-0" />
                <span>No related products yet. <Link to={`/admin/products/${product._id}/edit`} className="text-secondary font-semibold hover:underline">Add some in the editor</Link>.</span>
              </div>
            )}
          </div>
        </div>
      </div>

      <Modal
        open={confirm}
        onClose={() => setConfirm(false)}
        title="Delete product?"
        size="sm"
        footer={
          <>
            <button onClick={() => setConfirm(false)} className="btn-outline text-sm px-4">Cancel</button>
            <button onClick={handleDelete} className="inline-flex items-center gap-1.5 text-sm px-4 py-2 rounded-lg bg-error text-white hover:opacity-90 transition-opacity">
              <Trash2 size={14} /> Delete
            </button>
          </>
        }
      >
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-full bg-error/10 text-error flex items-center justify-center shrink-0"><AlertTriangle size={18} /></div>
          <div className="text-sm">
            <p>Permanently delete <strong>{product.name}</strong>? This cannot be undone.</p>
          </div>
        </div>
      </Modal>
    </div>
  );
}
import { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Plus, Trash2, ImagePlus, UploadCloud, Loader2, Check, X, Eye, EyeOff, Layers, FileText } from 'lucide-react';
import { api, API } from '../../lib/api';
import toast from 'react-hot-toast';
import { PageHeader } from '../../components/admin/ui.jsx';

const uploadFiles = async (files) => {
  const token = localStorage.getItem('token');
  const fd = new FormData();
  files.forEach((f) => fd.append('images', f));
  const res = await fetch(`${API}/uploads`, {
    method: 'POST',
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body: fd,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || 'Upload failed');
  return data.data || [];
};

const emptyVariant = { size: '', color: '', colorHex: '#000000', material: '', price: '', salePrice: '', sku: '', stock: '', images: [] };

function Section({ step, title, subtitle, children }) {
  return (
    <section className="card">
      <div className="flex items-start gap-3 mb-4">
        <span className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-heading font-bold text-sm shrink-0">{step}</span>
        <div>
          <h2 className="font-heading text-lg font-semibold leading-tight">{title}</h2>
          {subtitle && <p className="text-xs text-text-muted mt-0.5">{subtitle}</p>}
        </div>
      </div>
      <div className="space-y-4">{children}</div>
    </section>
  );
}

function Toggle({ checked, onChange, label, hint }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className="flex items-center justify-between w-full py-2 group"
      aria-pressed={checked}
    >
      <span className="text-left min-w-0">
        <span className="text-sm font-medium block">{label}</span>
        {hint && <span className="text-xs text-text-muted block">{hint}</span>}
      </span>
      <span className={`relative w-11 h-6 rounded-full transition-colors shrink-0 ${checked ? 'bg-success' : 'bg-border'}`}>
        <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all ${checked ? 'left-[22px]' : 'left-0.5'}`} />
      </span>
    </button>
  );
}

export default function ProductForm() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [fetching, setFetching] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: '', description: '', details: '', category: '', tags: '', featured: false, active: true,
    metaTitle: '', metaDescription: '', variants: [{ ...emptyVariant }],
  });
  const [uploading, setUploading] = useState(new Set());

  useEffect(() => {
    api.get('/products/categories').then((r) => setCategories(r.data || [])).catch(() => {});
    if (isEdit) {
      api.get(`/admin/products/${id}`)
        .then((r) => {
          const p = r.data;
          setForm({
            name: p.name, description: p.description || '', details: p.details || '', category: p.category?._id || '',
            tags: (p.tags || []).join(', '), featured: p.featured, active: p.active ?? true,
            metaTitle: p.metaTitle || '', metaDescription: p.metaDescription || '',
            variants: p.variants.map((v) => ({
              size: v.size, color: v.color, colorHex: v.colorHex || '#000000', material: v.material || '',
              price: v.price, salePrice: v.salePrice || '', sku: v.sku || '', stock: v.stock,
              images: v.images || [],
            })),
          });
        })
        .catch(() => toast.error('Failed to load product'))
        .finally(() => setFetching(false));
    }
  }, [id, isEdit]);

  const updateVariant = (index, field, value) => {
    const variants = [...form.variants];
    variants[index] = { ...variants[index], [field]: value };
    setForm({ ...form, variants });
  };

  const addImage = (i, url) => {
    const variants = [...form.variants];
    if (!variants[i].images) variants[i].images = [];
    variants[i].images = [...variants[i].images, url];
    setForm({ ...form, variants });
  };

  const removeImage = (i, idx) => {
    const variants = [...form.variants];
    variants[i].images = variants[i].images.filter((_, j) => j !== idx);
    setForm({ ...form, variants });
  };

  const replaceVariantImages = (i, updater) => {
    setForm((prev) => {
      const variants = [...prev.variants];
      variants[i] = { ...variants[i], images: updater(variants[i].images || []) };
      return { ...prev, variants };
    });
  };

  const handleUpload = async (i, files) => {
    const list = Array.from(files || []);
    if (!list.length) return;
    const previews = list.map((f) => ({ preview: URL.createObjectURL(f), file: f }));
    replaceVariantImages(i, (imgs) => [...imgs, ...previews.map((p) => p.preview)]);
    setUploading((s) => { const n = new Set(s); previews.forEach((p) => n.add(p.preview)); return n; });

    for (const p of previews) {
      try {
        const urls = await uploadFiles([p.file]);
        replaceVariantImages(i, (imgs) => imgs.map((img) => (img === p.preview ? urls[0] : img)));
      } catch (err) {
        replaceVariantImages(i, (imgs) => imgs.filter((img) => img !== p.preview));
        toast.error(`Upload failed: ${err.message}`);
      } finally {
        setUploading((s) => { const n = new Set(s); n.delete(p.preview); return n; });
        URL.revokeObjectURL(p.preview);
      }
    }
  };

  const addVariant = () => setForm({ ...form, variants: [...form.variants, { ...emptyVariant }] });
  const removeVariant = (i) => setForm({ ...form, variants: form.variants.filter((_, idx) => idx !== i) });

  const slugPreview = useMemo(() => (form.name || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, ''), [form.name]);

  const summary = useMemo(() => {
    const prices = form.variants
      .map((v) => { const p = Number(v.salePrice || v.price); return p > 0 ? p : null; })
      .filter(Boolean);
    return {
      variantCount: form.variants.length,
      totalStock: form.variants.reduce((s, v) => s + (Math.max(0, Number(v.stock) || 0)), 0),
      minPrice: prices.length ? Math.min(...prices) : null,
      maxPrice: prices.length ? Math.max(...prices) : null,
    };
  }, [form.variants]);

  const issues = useMemo(() => {
    const list = [];
    if (!form.name.trim()) list.push('Product name is missing');
    if (!form.category) list.push('Category is not selected');
    form.variants.forEach((v, i) => {
      const label = `Variant ${i + 1}`;
      if (!v.size) list.push(`${label} is missing a size`);
      if (!v.color) list.push(`${label} is missing a color`);
      const price = Number(v.price);
      if (!(price > 0)) list.push(`${label} needs a valid price`);
      const sale = Number(v.salePrice);
      if (sale > 0 && sale >= price) list.push(`${label} sale price must be lower than price`);
    });
    return list;
  }, [form]);

  const afterSave = isEdit ? `/admin/products/${id}` : '/admin/products';

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (issues.length) {
      toast.error(issues[0]);
      return;
    }
    setSaving(true);
    const payload = {
      ...form,
      tags: form.tags.split(',').map((t) => t.trim()).filter(Boolean),
      variants: form.variants.map((v) => ({
        ...v,
        price: Number(v.price),
        salePrice: v.salePrice ? Number(v.salePrice) : undefined,
        stock: Number(v.stock),
      })),
    };
    try {
      if (isEdit) { await api.put(`/admin/products/${id}`, payload); }
      else { await api.post('/admin/products', payload); }
      toast.success(isEdit ? 'Product updated' : 'Product created');
      navigate(afterSave);
    } catch (err) {
      toast.error(err.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const canSave = issues.length === 0;

  return (
    <div>
      <Link to="/admin/products" className="inline-flex items-center gap-1 text-secondary text-sm font-semibold mb-4 hover:gap-2 transition-all">
        <ArrowLeft size={14} /> Back to products
      </Link>
      <PageHeader title={isEdit ? 'Edit Product' : 'New Product'} />

      {fetching ? (
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4"><div className="skeleton h-40" /><div className="skeleton h-72" /><div className="skeleton h-40" /></div>
          <div className="skeleton h-80" />
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="grid lg:grid-cols-3 gap-6 items-start">
          <div className="lg:col-span-2 space-y-6 min-w-0">
            {/* Basic */}
            <Section step={1} title="Basic details" subtitle="Name, description and store placement.">
              <div>
                <label className="block text-sm font-medium mb-1.5">Name *</label>
                <input className="input-field" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Silk Maxi Dress" required />
                {slugPreview && <p className="text-xs text-text-muted mt-1">/products/{slugPreview}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">Short description</label>
                <textarea className="input-field" rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="One or two sentences shown on cards and search results" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">Full details</label>
                <textarea className="input-field" rows={5} value={form.details} onChange={(e) => setForm({ ...form, details: e.target.value })} placeholder="Fabric, fit, care instructions, delivery notes…" />
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1.5">Category *</label>
                  <select className="input-field" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} required>
                    <option value="">Select category</option>
                    {categories.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5">Tags (comma-separated)</label>
                  <input className="input-field" value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} placeholder="new, bestseller, summer" />
                </div>
              </div>
            </Section>

            {/* Variants */}
            <Section step={2} title="Variants" subtitle="Size / colour / material combinations with pricing and stock.">
              {form.variants.map((v, i) => (
                <div key={i} className="p-4 bg-bg rounded-card space-y-3 border border-border">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-text">{v.size && v.color ? `${v.size} · ${v.color}` : `Variant ${i + 1}`}</span>
                    {form.variants.length > 1 && (
                      <button type="button" onClick={() => removeVariant(i)} className="p-1 text-text-light hover:text-error transition-colors" aria-label={`Remove variant ${i + 1}`}>
                        <Trash2 size={15} />
                      </button>
                    )}
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <div>
                      <label className="block text-xs font-medium mb-1">Size *</label>
                      <input className="input-field text-sm" value={v.size} onChange={(e) => updateVariant(i, 'size', e.target.value)} placeholder="S / M / 42" required />
                    </div>
                    <div>
                      <label className="block text-xs font-medium mb-1">Color *</label>
                      <input className="input-field text-sm" value={v.color} onChange={(e) => updateVariant(i, 'color', e.target.value)} placeholder="Blush" required />
                    </div>
                    <div>
                      <label className="block text-xs font-medium mb-1">Material</label>
                      <input className="input-field text-sm" value={v.material} onChange={(e) => updateVariant(i, 'material', e.target.value)} placeholder="Silk, Cotton…" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium mb-1">SKU</label>
                      <input className="input-field text-sm" value={v.sku} onChange={(e) => updateVariant(i, 'sku', e.target.value)} placeholder="SP-001-M" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <div>
                      <label className="block text-xs font-medium mb-1">Price (KES) *</label>
                      <input type="number" min="0" className="input-field text-sm" value={v.price} onChange={(e) => updateVariant(i, 'price', e.target.value)} required />
                    </div>
                    <div>
                      <label className="block text-xs font-medium mb-1">Sale price (KES)</label>
                      <input type="number" min="0" className="input-field text-sm" value={v.salePrice} onChange={(e) => updateVariant(i, 'salePrice', e.target.value)} placeholder="Optional" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium mb-1">Stock *</label>
                      <input type="number" min="0" className="input-field text-sm" value={v.stock} onChange={(e) => updateVariant(i, 'stock', e.target.value)} required />
                    </div>
                    <div>
                      <label className="block text-xs font-medium mb-1">Color hex</label>
                      <div className="flex gap-2">
                        <input type="color" value={/^#[0-9a-fA-F]{6}$/.test(v.colorHex) ? v.colorHex : '#000000'} onChange={(e) => updateVariant(i, 'colorHex', e.target.value)} className="w-10 h-10 rounded border border-border cursor-pointer shrink-0" />
                        <input className="input-field text-sm" value={v.colorHex} onChange={(e) => updateVariant(i, 'colorHex', e.target.value)} />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="flex items-center gap-1.5 text-xs font-medium mb-2"><ImagePlus size={14} /> Images</label>
                    <div className="flex flex-wrap gap-2">
                      {(v.images || []).map((img, idx) => (
                        <div key={idx} className={`relative group cursor-pointer ${uploading.has(img) ? 'opacity-90' : ''}`}>
                          <img src={img} alt="" className="w-16 h-20 object-cover rounded-lg border border-border" loading="lazy" />
                          {uploading.has(img) && (
                            <div className="absolute inset-0 rounded-lg bg-black/40 flex items-center justify-center">
                              <Loader2 size={16} className="text-white animate-spin" />
                            </div>
                          )}
                          <button type="button" onClick={() => removeImage(i, idx)} className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-error text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity" title="Remove image">
                            <X size={11} />
                          </button>
                        </div>
                      ))}
                      {!v.images?.length && <span className="text-xs text-text-muted self-center">No images yet</span>}
                    </div>
                    <div className="flex items-center gap-2 mt-2 flex-wrap">
                      <label className="btn-primary text-sm px-4 py-2 cursor-pointer inline-flex items-center gap-2">
                        <UploadCloud size={15} /> Upload photos
                        <input type="file" accept="image/*" multiple className="hidden" onChange={(e) => { handleUpload(i, e.target.files); e.target.value = ''; }} />
                      </label>
                      <div className="flex gap-2 flex-1 min-w-[220px]">
                        <input className="input-field text-sm flex-1" placeholder="Paste image URL and press Add..." value={v._imgInput || ''} onChange={(e) => updateVariant(i, '_imgInput', e.target.value)} />
                        <button
                          type="button"
                          className="btn-outline text-sm px-4"
                          onClick={() => {
                            const url = v._imgInput?.trim();
                            if (!url) return toast.error('Enter an image URL');
                            addImage(i, url);
                            updateVariant(i, '_imgInput', '');
                          }}
                        >
                          Add
                        </button>
                      </div>
                    </div>
                    <p className="text-xs text-text-muted mt-1">Photos preview instantly and upload in the background. Max 5 MB each.</p>
                  </div>
                </div>
              ))}
              <button type="button" onClick={addVariant} className="btn-outline text-sm w-full flex items-center justify-center gap-2 py-2.5 border-dashed">
                <Plus size={15} /> Add Variant
              </button>
            </Section>

            {/* SEO */}
            <Section step={3} title="Search engines" subtitle="Optional meta tags to improve how the product appears in search results.">
              <div>
                <label className="block text-sm font-medium mb-1.5">Meta title</label>
                <input className="input-field" value={form.metaTitle} onChange={(e) => setForm({ ...form, metaTitle: e.target.value })} placeholder={form.name || 'Meta title'} />
                <p className="text-xs text-text-muted mt-1">{form.metaTitle?.length || 0}/60 characters recommended</p>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">Meta description</label>
                <textarea className="input-field" rows={3} value={form.metaDescription} onChange={(e) => setForm({ ...form, metaDescription: e.target.value })} placeholder="A short, convincing summary for search engines" />
                <p className="text-xs text-text-muted mt-1">{form.metaDescription?.length || 0}/160 characters recommended</p>
              </div>
            </Section>
          </div>

          {/* Right rail */}
          <div className="space-y-5 lg:sticky lg:top-[137px]">
            <div className="card">
              <h2 className="font-heading text-base font-semibold mb-2">Visibility</h2>
              <Toggle checked={form.active} onChange={(v) => setForm({ ...form, active: v })} label="Active in store" hint={form.active ? 'Customers can purchase this' : 'Hidden from customers'} />
              <div className="border-t border-border my-1" />
              <Toggle checked={form.featured} onChange={(v) => setForm({ ...form, featured: v })} label="Featured" hint="Shown on the homepage spotlight" />
            </div>

            <div className="card space-y-3">
              <h2 className="font-heading text-base font-semibold flex items-center gap-2"><Layers size={16} className="text-primary" /> Summary</h2>
              {[
                { label: 'Variants', value: summary.variantCount },
                { label: 'Units in stock', value: summary.totalStock },
                { label: 'Price range', value: summary.minPrice ? `KSh ${summary.minPrice.toLocaleString()}${summary.maxPrice !== summary.minPrice ? `–${summary.maxPrice.toLocaleString()}` : ''}` : '—' },
                { label: 'Status', value: form.active ? 'Active' : 'Inactive' },
              ].map((row) => (
                <div key={row.label} className="flex justify-between text-sm">
                  <span className="text-text-light">{row.label}</span>
                  <span className="font-medium">{row.value}</span>
                </div>
              ))}
              {issues.length > 0 && (
                <div className="pt-2 border-t border-border">
                  <p className="text-xs text-warning font-semibold mb-1.5 flex items-center gap-1"><FileText size={12} /> {issues.length} thing(s) to fix</p>
                  <ul className="space-y-1">
                    {issues.slice(0, 3).map((issue) => (
                      <li key={issue} className="text-xs text-text-muted flex items-start gap-1.5"><X size={12} className="text-error shrink-0 mt-0.5" />{issue}</li>
                    ))}
                    {issues.length > 3 && <li className="text-xs text-text-muted">+{issues.length - 3} more</li>}
                  </ul>
                </div>
              )}
              {canSave && (
                <p className="text-xs text-success flex items-center gap-1.5"><Check size={13} /> All set — ready to save</p>
              )}
            </div>

            <div className="card space-y-2">
              <button type="submit" disabled={saving || !canSave} className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-50">
                {saving ? <Loader2 size={16} className="animate-spin" /> : form.active ? <Eye size={16} /> : <EyeOff size={16} />}
                {saving ? 'Saving…' : isEdit ? 'Update Product' : 'Create Product'}
              </button>
              <Link to={afterSave} className="btn-outline w-full text-center text-sm">Cancel</Link>
            </div>
          </div>
        </form>
      )}
    </div>
  );
}
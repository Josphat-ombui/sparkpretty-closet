import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Plus, Trash2, ImagePlus, UploadCloud, Loader2 } from 'lucide-react';
import { api, API, API_BASE } from '../../lib/api';
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

const emptyVariant = { size: '', color: '', colorHex: '#000000', price: '', salePrice: '', sku: '', stock: '', images: [] };

export default function ProductForm() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [fetching, setFetching] = useState(isEdit);
  const [form, setForm] = useState({
    name: '', description: '', category: '', tags: '', featured: false, active: true,
    variants: [{ ...emptyVariant }],
  });
  const [uploading, setUploading] = useState(new Set());

  useEffect(() => {
    api.get('/products/categories').then((r) => setCategories(r.data || [])).catch(() => {});
    if (isEdit) {
      api.get(`/admin/products/${id}`)
        .then((r) => {
          const p = r.data;
          setForm({
            name: p.name, description: p.description, category: p.category?._id || '',
            tags: (p.tags || []).join(', '), featured: p.featured, active: p.active ?? true,
            variants: p.variants.map((v) => ({
              size: v.size, color: v.color, colorHex: v.colorHex || '#000000',
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
        const serverUrl = `${API_BASE}${urls[0]}`;
        replaceVariantImages(i, (imgs) => imgs.map((img) => (img === p.preview ? serverUrl : img)));
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

  const handleSubmit = async (e) => {
    e.preventDefault();
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
      navigate('/admin/products');
    } catch (err) { toast.error(err.message || 'Save failed'); }
  };

  return (
    <div className="max-w-3xl">
      <Link to="/admin/products" className="inline-flex items-center gap-1 text-secondary text-sm font-semibold mb-4 hover:gap-2 transition-all">
        <ArrowLeft size={14} /> Back to products
      </Link>
      <PageHeader title={isEdit ? 'Edit Product' : 'New Product'} />

      {fetching ? (
        <div className="card space-y-4"><div className="skeleton h-12" /><div className="skeleton h-24" /><div className="skeleton h-52" /></div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="card space-y-4">
            <h2 className="font-heading text-lg font-semibold">Basic Info</h2>
            <div>
              <label className="block text-sm font-medium mb-1.5">Name *</label>
              <input className="input-field" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">Description</label>
              <textarea className="input-field" rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1.5">Category *</label>
                <select className="input-field" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} required>
                  <option value="">Select category</option>
                  {categories.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">Tags (comma-separated)</label>
                <input className="input-field" value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} placeholder="new, bestseller" />
              </div>
            </div>
            <div className="flex gap-6">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={form.featured} onChange={(e) => setForm({ ...form, featured: e.target.checked })} className="w-4 h-4 accent-primary" />
                <span className="text-sm font-medium">Featured on homepage</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={form.active} onChange={(e) => setForm({ ...form, active: e.target.checked })} className="w-4 h-4 accent-primary" />
                <span className="text-sm font-medium">Active (visible in store)</span>
              </label>
            </div>
          </div>

          <div className="card space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-heading text-lg font-semibold">Variants</h2>
              <button type="button" onClick={addVariant} className="text-secondary text-sm font-medium flex items-center gap-1 hover:underline">
                <Plus size={14} /> Add Variant
              </button>
            </div>
            {form.variants.map((v, i) => (
              <div key={i} className="p-4 bg-bg rounded-card space-y-3 border border-border">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-text-light">Variant {i + 1}</span>
                  {form.variants.length > 1 && (
                    <button type="button" onClick={() => removeVariant(i)} className="p-1 text-text-light hover:text-error"><Trash2 size={14} /></button>
                  )}
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <div>
                    <label className="block text-xs font-medium mb-1">Size *</label>
                    <input className="input-field text-sm" value={v.size} onChange={(e) => updateVariant(i, 'size', e.target.value)} required />
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-1">Color *</label>
                    <input className="input-field text-sm" value={v.color} onChange={(e) => updateVariant(i, 'color', e.target.value)} required />
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-1">Color Hex</label>
                    <div className="flex gap-2">
                      <input type="color" value={v.colorHex} onChange={(e) => updateVariant(i, 'colorHex', e.target.value)} className="w-10 h-10 rounded border border-border cursor-pointer" />
                      <input className="input-field text-sm flex-1" value={v.colorHex} onChange={(e) => updateVariant(i, 'colorHex', e.target.value)} />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-1">SKU</label>
                    <input className="input-field text-sm" value={v.sku} onChange={(e) => updateVariant(i, 'sku', e.target.value)} />
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-medium mb-1">Price (KES) *</label>
                    <input type="number" className="input-field text-sm" value={v.price} onChange={(e) => updateVariant(i, 'price', e.target.value)} required />
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-1">Sale Price (KES)</label>
                    <input type="number" className="input-field text-sm" value={v.salePrice} onChange={(e) => updateVariant(i, 'salePrice', e.target.value)} />
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-1">Stock *</label>
                    <input type="number" className="input-field text-sm" value={v.stock} onChange={(e) => updateVariant(i, 'stock', e.target.value)} required />
                  </div>
                </div>

                <div>
                  <label className="flex items-center gap-1.5 text-xs font-medium mb-2"><ImagePlus size={14} /> Images</label>
                  <div className="flex flex-wrap gap-2">
                    {(v.images || []).map((img, idx) => (
                      <div key={idx} className={`relative group cursor-pointer ${uploading.has(img) ? 'opacity-90' : ''}`}>
                        <img src={img} alt="" className="w-16 h-20 object-cover rounded-lg border border-border" />
                        {uploading.has(img) && (
                          <div className="absolute inset-0 rounded-lg bg-black/40 flex items-center justify-center">
                            <Loader2 size={16} className="text-white animate-spin" />
                          </div>
                        )}
                        <button type="button" onClick={() => removeImage(i, idx)} className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-error text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity" title="Remove image">
                          <XSmall />
                        </button>
                      </div>
                    ))}
                    {!v.images?.length && <span className="text-xs text-text-muted self-center">No images yet</span>}
                  </div>
                  <div className="flex items-center gap-2 mt-2 flex-wrap">
                    <label className="btn-primary text-sm px-4 py-2 cursor-pointer inline-flex items-center gap-2">
                      <UploadCloud size={15} /> Upload photos
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        className="hidden"
                        onChange={(e) => { handleUpload(i, e.target.files); e.target.value = ''; }}
                      />
                    </label>
                    <div className="flex gap-2 flex-1 min-w-[220px]">
                      <input
                        className="input-field text-sm flex-1"
                        placeholder="Paste image URL and press Add..."
                        value={v._imgInput || ''}
                        onChange={(e) => updateVariant(i, '_imgInput', e.target.value)}
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const url = v._imgInput?.trim();
                          if (!url) return toast.error('Enter an image URL');
                          addImage(i, url);
                          updateVariant(i, '_imgInput', '');
                        }}
                        className="btn-outline text-sm px-4"
                      >
                        Add
                      </button>
                    </div>
                  </div>
                  <p className="text-xs text-text-muted">Select one or more photos — they preview instantly and upload while you keep editing. Max 5 MB each.</p>
                </div>
              </div>
            ))}
          </div>

          <div className="flex gap-4">
            <Link to="/admin/products" className="btn-outline flex-1 text-center">Cancel</Link>
            <button type="submit" className="btn-primary flex-1">{isEdit ? 'Update Product' : 'Create Product'}</button>
          </div>
        </form>
      )}
    </div>
  );
}

function XSmall() {
  return <span className="text-[10px] font-bold leading-none">✕</span>;
}
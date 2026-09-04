import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Plus, Trash2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../lib/api';
import toast from 'react-hot-toast';

export default function ProductForm() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const { user } = useAuth();
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState({
    name: '', description: '', category: '', tags: '', featured: false,
    variants: [{ size: '', color: '', colorHex: '#000000', price: '', salePrice: '', sku: '', stock: '' }],
  });

  useEffect(() => {
    if (!user || user.role !== 'admin') { navigate('/'); return; }
    api.get('/products/categories').then((r) => setCategories(r.data));
    if (isEdit) {
      api.get('/admin/products').then((r) => {
        const p = r.data.find((pp) => pp._id === id);
        if (p) setForm({
          name: p.name, description: p.description, category: p.category?._id || '',
          tags: (p.tags || []).join(', '), featured: p.featured,
          variants: p.variants.map((v) => ({
            size: v.size, color: v.color, colorHex: v.colorHex || '#000000',
            price: v.price, salePrice: v.salePrice || '', sku: v.sku || '', stock: v.stock,
          })),
        });
      });
    }
  }, [id, isEdit, user, navigate]);

  const updateVariant = (index, field, value) => {
    const variants = [...form.variants];
    variants[index] = { ...variants[index], [field]: value };
    setForm({ ...form, variants });
  };

  const addVariant = () => setForm({ ...form, variants: [...form.variants, { size: '', color: '', colorHex: '#000000', price: '', salePrice: '', sku: '', stock: '' }] });
  const removeVariant = (i) => setForm({ ...form, variants: form.variants.filter((_, idx) => idx !== i) });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      ...form,
      tags: form.tags.split(',').map((t) => t.trim()).filter(Boolean),
      variants: form.variants.map((v) => ({
        ...v, price: Number(v.price), salePrice: v.salePrice ? Number(v.salePrice) : undefined, stock: Number(v.stock),
      })),
    };
    try {
      if (isEdit) { await api.put(`/admin/products/${id}`, payload); }
      else { await api.post('/admin/products', payload); }
      toast.success(isEdit ? 'Product updated' : 'Product created');
      navigate('/admin/products');
    } catch (err) { toast.error(err.message); }
  };

  return (
    <div className="section-padding">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <Link to="/admin/products" className="p-2 hover:text-secondary transition-colors"><ArrowLeft size={20} /></Link>
          <h1 className="font-heading text-3xl font-bold">{isEdit ? 'Edit' : 'New'} Product</h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="card space-y-4">
            <h2 className="font-semibold text-lg">Basic Info</h2>
            <div>
              <label className="block text-sm font-medium mb-1">Name *</label>
              <input className="input-field" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Description</label>
              <textarea className="input-field" rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Category *</label>
                <select className="input-field" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} required>
                  <option value="">Select category</option>
                  {categories.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Tags (comma-separated)</label>
                <input className="input-field" value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} placeholder="new, bestseller" />
              </div>
            </div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={form.featured} onChange={(e) => setForm({ ...form, featured: e.target.checked })} className="w-4 h-4 accent-primary" />
              <span className="text-sm font-medium">Featured on homepage</span>
            </label>
          </div>

          <div className="card space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-lg">Variants</h2>
              <button type="button" onClick={addVariant} className="text-secondary text-sm font-medium flex items-center gap-1 hover:underline">
                <Plus size={14} /> Add Variant
              </button>
            </div>
            {form.variants.map((v, i) => (
              <div key={i} className="p-4 bg-bg rounded-card space-y-3">
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
              </div>
            ))}
          </div>

          <div className="flex gap-4">
            <Link to="/admin/products" className="btn-outline flex-1 text-center">Cancel</Link>
            <button type="submit" className="btn-primary flex-1">{isEdit ? 'Update Product' : 'Create Product'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

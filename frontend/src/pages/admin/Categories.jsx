import { useEffect, useState } from 'react';
import { Plus, Search, Pencil, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { api } from '../../lib/api';
import { Card, PageHeader, EmptyState, Modal } from '../../components/admin/ui.jsx';

export default function Categories() {
  const [cats, setCats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: '', description: '', image: '', order: 0 });

  const load = () => {
    setLoading(true);
    api.get('/admin/categories').then((r) => setCats(r.data || [])).catch(() => toast.error('Failed to load categories')).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const filtered = cats.filter((c) => !search || c.name.toLowerCase().includes(search.toLowerCase()));

  const deleteCat = async (c) => {
    if (!window.confirm(`Delete category "${c.name}"?`)) return;
    try {
      await api.delete(`/admin/categories/${c._id}`);
      toast.success('Category deleted');
      load();
    } catch (err) {
      toast.error(err.message || 'Delete failed');
    }
  };

  const openAdd = () => { setEditing(null); setForm({ name: '', description: '', image: '', order: cats.length }); setShowAdd(true); };
  const openEdit = (c) => { setEditing(c._id); setForm({ name: c.name, description: c.description || '', image: c.image || '', order: c.order || 0 }); setShowAdd(true); };

  const submit = async (e) => {
    e.preventDefault();
    if (!form.name) return toast.error('Name is required');
    try {
      if (editing) {
        await api.put(`/admin/categories/${editing}`, { ...form, order: Number(form.order) });
        toast.success('Category updated');
      } else {
        await api.post('/admin/categories', { ...form, order: Number(form.order) });
        toast.success('Category created');
      }
      setShowAdd(false);
      setEditing(null);
      load();
    } catch (err) {
      toast.error(err.message || 'Save failed');
    }
  };

  return (
    <div>
      <PageHeader
        title="Categories"
        subtitle="Organize products into categories"
        actions={<button onClick={openAdd} className="btn-primary flex items-center gap-2 text-sm"><Plus size={16} /> Add Category</button>}
      />

      <Card pad={false}>
        <div className="p-4 border-b border-border relative">
          <Search size={16} className="absolute left-7 top-1/2 -translate-y-1/2 text-text-muted" />
          <input className="input-field pl-9 max-w-sm" placeholder="Search categories..." value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>

        {loading ? (
          <div className="p-5 space-y-3"><div className="skeleton h-16" /><div className="skeleton h-16" /></div>
        ) : filtered.length === 0 ? (
          <EmptyState title="No categories" message="Create your first category to organize products." action={<button onClick={openAdd} className="btn-primary text-sm">Add Category</button>} />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-bg text-text-muted uppercase text-xs">
                <tr>
                  <th className="text-left px-5 py-3 font-semibold">Category</th>
                  <th className="text-left px-5 py-3 font-semibold">Order</th>
                  <th className="text-left px-5 py-3 font-semibold">Products</th>
                  <th className="text-left px-5 py-3 font-semibold">Slug</th>
                  <th className="text-right px-5 py-3 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((c) => (
                  <tr key={c._id} className="border-t border-border/50 hover:bg-bg/50">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        {c.image ? (
                          <img src={c.image} alt={c.name} className="w-11 h-11 rounded-lg object-cover" />
                        ) : (
                          <div className="w-11 h-11 rounded-lg gradient-soft flex items-center justify-center text-primary font-heading text-lg">{c.name?.charAt(0)?.toUpperCase()}</div>
                        )}
                        <div>
                          <p className="font-medium">{c.name}</p>
                          {c.description && <p className="text-xs text-text-muted line-clamp-1 max-w-[280px]">{c.description}</p>}
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-sm text-text-light">{c.order}</td>
                    <td className="px-5 py-3">
                      <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-primary/10 text-primary-dark">{c.productCount}</span>
                    </td>
                    <td className="px-5 py-3 font-mono text-xs text-text-light">/{c.slug}</td>
                    <td className="px-5 py-3">
                      <div className="flex justify-end gap-1.5">
                        <button onClick={() => openEdit(c)} className="p-2 rounded-lg text-text-light hover:text-primary hover:bg-primary/10 transition-colors" title="Edit"><Pencil size={15} /></button>
                        <button onClick={() => deleteCat(c)} className="p-2 rounded-lg text-text-light hover:text-error hover:bg-error/10 transition-colors" title="Delete"><Trash2 size={15} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <Modal
        open={showAdd}
        onClose={() => { setShowAdd(false); setEditing(null); }}
        title={editing ? 'Edit Category' : 'Add Category'}
        size="sm"
        footer={
          <>
            <button onClick={() => { setShowAdd(false); setEditing(null); }} className="btn-outline text-sm">Cancel</button>
            <button type="submit" form="cat-form" className="btn-primary text-sm">{editing ? 'Save Changes' : 'Create'}</button>
          </>
        }
      >
        <form id="cat-form" onSubmit={submit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1.5">Name</label>
            <input className="input-field" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5">Description</label>
            <textarea className="input-field" rows={2} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5">Image URL</label>
            <input className="input-field" value={form.image} onChange={(e) => setForm({ ...form, image: e.target.value })} placeholder="https://... or /images/..." />
            {form.image && <img src={form.image} alt="preview" className="mt-2 w-20 h-20 rounded-lg object-cover" />}
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5">Display Order</label>
            <input type="number" className="input-field" value={form.order} onChange={(e) => setForm({ ...form, order: e.target.value })} />
          </div>
        </form>
      </Modal>
    </div>
  );
}
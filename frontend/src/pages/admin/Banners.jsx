import { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';
import { api } from '../../lib/api';
import { Card, PageHeader, EmptyState, Modal } from '../../components/admin/ui.jsx';
import ImageUpload from '../../components/admin/ImageUpload';

const empty = { title: '', subtitle: '', image: '', link: '', cta: '', type: 'hero', order: 0, active: true };

export default function Banners() {
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(empty);

  const load = () => {
    setLoading(true);
    api.get('/admin/banners').then((r) => setBanners(r.data || [])).catch(() => toast.error('Failed to load banners')).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const toggleActive = async (b) => {
    try {
      await api.put(`/admin/banners/${b._id}`, { active: !b.active });
      toast.success(b.active ? 'Banner deactivated' : 'Banner activated');
      load();
    } catch { toast.error('Update failed'); }
  };

  const openAdd = () => { setEditing(null); setForm({ ...empty, order: banners.length }); setShowAdd(true); };
  const openEdit = (b) => { setEditing(b._id); setForm({ title: b.title, subtitle: b.subtitle, image: b.image, link: b.link, cta: b.cta, type: b.type, order: b.order, active: b.active }); setShowAdd(true); };

  const submit = async (e) => {
    e.preventDefault();
    try {
      if (editing) {
        await api.put(`/admin/banners/${editing}`, { ...form, order: Number(form.order) });
        toast.success('Banner updated');
      } else {
        await api.post('/admin/banners', { ...form, order: Number(form.order) });
        toast.success('Banner created');
      }
      setShowAdd(false);
      setEditing(null);
      load();
    } catch (err) { toast.error(err.message || 'Save failed'); }
  };

  const typeMap = { hero: 'Hero', promo: 'Promo', story: 'Story' };

  return (
    <div>
      <PageHeader
        title="Banners"
        subtitle="Hero, promo, and story banners shown on the homepage"
        actions={<button onClick={openAdd} className="btn-primary flex items-center gap-2 text-sm"><Plus size={16} /> Add Banner</button>}
      />

      <Card pad={false}>
        {loading ? (
          <div className="p-5 space-y-3"><div className="skeleton h-24" /><div className="skeleton h-24" /></div>
        ) : banners.length === 0 ? (
          <EmptyState title="No banners yet" message="Add hero/promo banners to control homepage visuals." action={<button onClick={openAdd} className="btn-primary text-sm"><Plus size={14} /> Add Banner</button>} />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-bg text-text-muted uppercase text-xs">
                <tr>
                  <th className="text-left px-5 py-3 font-semibold">Preview</th>
                  <th className="text-left px-5 py-3 font-semibold">Banner</th>
                  <th className="text-left px-5 py-3 font-semibold">Type</th>
                  <th className="text-left px-5 py-3 font-semibold">Order</th>
                  <th className="text-left px-5 py-3 font-semibold">Status</th>
                  <th className="text-right px-5 py-3 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {banners.map((b) => (
                  <tr key={b._id} className="border-t border-border/50 hover:bg-bg/50">
                    <td className="px-5 py-3">
                      {b.image ? (
                        <img src={b.image} alt="" className="w-16 h-11 object-cover rounded-lg" style={b.type === 'hero' ? { aspectRatio: '21/9' } : {}} />
                      ) : (
                        <div className="w-16 h-11 rounded-lg gradient-hero" />
                      )}
                    </td>
                    <td className="px-5 py-3">
                      <p className="font-medium">{b.title || '(Untitled)'}</p>
                      {b.subtitle && <p className="text-xs text-text-muted truncate max-w-[240px]">{b.subtitle}</p>}
                    </td>
                    <td className="px-5 py-3">
                      <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-primary/10 text-primary-dark">{typeMap[b.type] || b.type}</span>
                    </td>
                    <td className="px-5 py-3 text-text-light">{b.order}</td>
                    <td className="px-5 py-3">
                      <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${b.active ? 'bg-success/10 text-success' : 'bg-error/10 text-error'}`}>
                        {b.active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex justify-end gap-1.5">
                        <button onClick={() => toggleActive(b)} className="p-2 rounded-lg hover:bg-bg transition-colors" title={b.active ? 'Deactivate' : 'Activate'}>
                          {b.active ? <EyeOff size={15} className="text-warning" /> : <Eye size={15} className="text-success" />}
                        </button>
                        <button onClick={() => openEdit(b)} className="p-2 rounded-lg hover:bg-bg transition-colors" title="Edit"><Pencil size={15} className="text-secondary" /></button>
                        <button onClick={async () => { if (window.confirm('Delete this banner?')) { await api.delete(`/admin/banners/${b._id}`).then(() => { toast.success('Deleted'); load(); }).catch(() => toast.error('Failed')); } }} className="p-2 rounded-lg hover:bg-bg transition-colors" title="Delete"><Trash2 size={15} className="text-error" /></button>
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
        title={editing ? 'Edit Banner' : 'Add Banner'}
        size="sm"
        footer={
          <>
            <button onClick={() => { setShowAdd(false); setEditing(null); }} className="btn-outline text-sm">Cancel</button>
            <button type="submit" form="banner-form" className="btn-primary text-sm">{editing ? 'Save Changes' : 'Create'}</button>
          </>
        }
      >
        <form id="banner-form" onSubmit={submit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1.5">Banner Type</label>
            <select className="input-field" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
              <option value="hero">Hero</option>
              <option value="promo">Promo</option>
              <option value="story">Story</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5">Title</label>
            <input className="input-field" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5">Subtitle</label>
            <input className="input-field" value={form.subtitle} onChange={(e) => setForm({ ...form, subtitle: e.target.value })} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5">Banner Image</label>
            <ImageUpload value={form.image} onChange={(v) => setForm({ ...form, image: v })} previewHeight="h-28" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1.5">Button Text</label>
              <input className="input-field" value={form.cta} onChange={(e) => setForm({ ...form, cta: e.target.value })} placeholder="Shop Now" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">Link</label>
              <input className="input-field" value={form.link} onChange={(e) => setForm({ ...form, link: e.target.value })} placeholder="/shop" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5">Display Order</label>
            <input type="number" className="input-field" value={form.order} onChange={(e) => setForm({ ...form, order: e.target.value })} />
          </div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={form.active} onChange={(e) => setForm({ ...form, active: e.target.checked })} className="w-4 h-4 accent-primary" />
            <span className="text-sm font-medium">Active</span>
          </label>
        </form>
      </Modal>
    </div>
  );
}
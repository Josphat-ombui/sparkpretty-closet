import { useEffect, useState, useCallback } from 'react';
import { Upload, Link as LinkIcon, Trash2, Copy, Pencil, Search, Plus, Tag, ImageOff } from 'lucide-react';
import toast from 'react-hot-toast';
import { api, API_BASE } from '../../lib/api';
import { Card, PageHeader, EmptyState, Modal, Pagination } from '../../components/admin/ui.jsx';

const EMPTY_EDIT = { alt: '', caption: '', tags: '', folder: 'sparkpretty' };
const EMPTY_URL = { url: '', alt: '', tags: '' };

export default function MediaLibrary() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [tags, setTags] = useState([]);
  const [searchBox, setSearchBox] = useState('');
  const [search, setSearch] = useState('');
  const [tag, setTag] = useState('');
  const [folder, setFolder] = useState('');
  const [uploading, setUploading] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [editForm, setEditForm] = useState(EMPTY_EDIT);
  const [urlModal, setUrlModal] = useState(false);
  const [urlForm, setUrlForm] = useState(EMPTY_URL);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [refs, setRefs] = useState(null);

  const load = useCallback(() => {
    setLoading(true);
    const params = new URLSearchParams({ page: String(page), limit: '48' });
    if (search) params.set('search', search);
    if (tag) params.set('tag', tag);
    if (folder) params.set('folder', folder);
    api.get(`/uploads?${params.toString()}`)
      .then((r) => {
        const data = r.data || {};
        setItems(data.items || []);
        setPages(data.pages || 1);
        setTotal(data.total || 0);
      })
      .catch(() => toast.error('Failed to load media'))
      .finally(() => setLoading(false));
  }, [page, search, tag, folder]);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    api.get('/uploads/tags').then((r) => setTags(r.data || [])).catch(() => {});
  }, []);

  const applyFilters = (e) => {
    e.preventDefault();
    setPage(1);
    setSearch(searchBox.trim());
  };

  const resetFilters = () => {
    setSearchBox('');
    setSearch('');
    setTag('');
    setFolder('');
    setPage(1);
  };

  const handleFiles = async (files) => {
    const list = Array.from(files || []);
    if (!list.length) return;
    if (list.some((f) => f.size > 5 * 1024 * 1024)) return toast.error('Max file size is 5MB each');
    setUploading(true);
    try {
      const fd = new FormData();
      list.forEach((f) => fd.append('images', f));
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE}/api/uploads`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: fd,
      });
      const data = await res.json();
      if (!res.ok || !data.data?.length) throw new Error(data.message || 'Upload failed');
      toast.success(`Uploaded ${data.data.length} image${data.data.length > 1 ? 's' : ''}`);
      setPage(1);
      load();
    } catch (err) {
      toast.error(err.message || 'Upload failed');
    }
    setUploading(false);
  };

  const copyUrl = (url) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(url)
        .then(() => toast.success('URL copied'))
        .catch(() => toast('Copy the URL manually'));
    } else {
      toast('Copy the URL manually');
    }
  };

  const openEdit = (m) => {
    setEditTarget(m);
    setEditForm({ alt: m.alt || '', caption: m.caption || '', tags: (m.tags || []).join(', '), folder: m.folder || 'sparkpretty' });
  };

  const saveEdit = async (e) => {
    e.preventDefault();
    try {
      await api.put(`/uploads/${editTarget._id}`, {
        alt: editForm.alt,
        caption: editForm.caption,
        tags: editForm.tags.split(',').map((t) => t.trim()).filter(Boolean),
        folder: editForm.folder,
      });
      toast.success('Media updated');
      setEditTarget(null);
      load();
    } catch (err) { toast.error(err.message || 'Update failed'); }
  };

  const addFromUrl = async (e) => {
    e.preventDefault();
    if (!urlForm.url.trim()) return toast.error('URL is required');
    try {
      await api.post('/uploads/from-url', {
        url: urlForm.url.trim(),
        alt: urlForm.alt,
        tags: urlForm.tags.split(',').map((t) => t.trim()).filter(Boolean),
      });
      toast.success('Added to library');
      setUrlModal(false);
      setUrlForm(EMPTY_URL);
      setPage(1);
      load();
    } catch (err) { toast.error(err.message || 'Failed'); }
  };

  const requestDelete = async (m) => {
    const token = localStorage.getItem('token');
    const res = await fetch(`${API_BASE}/api/uploads/${m._id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json().catch(() => ({}));
    if (res.ok) {
      toast.success('Deleted');
      load();
      return;
    }
    if (res.status === 409) {
      setDeleteTarget(m);
      setRefs(data.references || {});
    } else {
      toast.error(data.message || 'Delete failed');
    }
  };

  const forceDelete = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE}/api/uploads/${deleteTarget._id}?force=true`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.message || 'Delete failed');
      toast.success('Deleted');
      setDeleteTarget(null);
      setRefs(null);
      load();
    } catch (err) { toast.error(err.message || 'Delete failed'); }
  };

  const folders = [...new Set(items.map((i) => i.folder || 'sparkpretty'))].sort();
  const refCount = (refs?.products?.length || 0) + (refs?.banners?.length || 0) + (refs?.settings?.length || 0);

  return (
    <div>
      <PageHeader
        title="Media Library"
        subtitle="Every image used across the site — upload, organize, and copy URLs"
        actions={
          <div className="flex items-center gap-2">
            <button onClick={() => setUrlModal(true)} className="btn-outline flex items-center gap-2 text-sm">
              <LinkIcon size={16} /> From URL
            </button>
            <label className="btn-primary flex items-center gap-2 text-sm cursor-pointer">
              <Upload size={16} /> {uploading ? 'Uploading...' : 'Upload Images'}
              <input type="file" accept="image/jpeg,image/png,image/webp,image/gif,image/svg+xml" multiple className="sr-only" disabled={uploading} onChange={(e) => { handleFiles(e.target.files); e.target.value = ''; }} />
            </label>
          </div>
        }
      />

      <Card pad={false} className="mb-6">
        <form onSubmit={applyFilters} className="p-4 border-b border-border flex flex-wrap gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
            <input className="input-field pl-9" placeholder="Search by name, alt text, caption or URL..." value={searchBox} onChange={(e) => setSearchBox(e.target.value)} />
          </div>
          <select value={tag} onChange={(e) => { setTag(e.target.value); setPage(1); }} className="input-field w-auto">
            <option value="">All tags</option>
            {tags.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
          <select value={folder} onChange={(e) => { setFolder(e.target.value); setPage(1); }} className="input-field w-auto">
            <option value="">All folders</option>
            {folders.map((f) => <option key={f} value={f}>{f}</option>)}
          </select>
          <button type="submit" className="btn-outline text-sm px-4">Search</button>
          {(search || tag || folder) && (
            <button type="button" onClick={resetFilters} className="text-sm text-text-light hover:text-text">Clear</button>
          )}
        </form>
      </Card>

      {loading ? (
        <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => <div key={i} className="skeleton h-48 rounded-card" />)}
        </div>
      ) : items.length === 0 ? (
        <Card>
          <EmptyState
            title="No media found"
            message="Upload images from your computer or register existing URLs to build your library."
            action={<label className="btn-primary inline-flex items-center gap-2 text-sm cursor-pointer"><Upload size={14} /> Upload Images<input type="file" multiple className="sr-only" onChange={(e) => { handleFiles(e.target.files); e.target.value = ''; }} /></label>}
          />
        </Card>
      ) : (
        <>
          <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4">
            {items.map((m) => (
              <div key={m._id} className="group bg-white border border-border rounded-card overflow-hidden">
                <div className="relative aspect-square bg-bg">
                  {m.url ? (
                    <img src={m.url} alt={m.alt || m.filename || 'Media'} className="w-full h-full object-cover" loading="lazy" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-text-muted"><ImageOff size={28} /></div>
                  )}
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5">
                    <button onClick={() => copyUrl(m.url)} className="p-2 rounded-lg text-white hover:bg-white/20" title="Copy URL"><Copy size={15} /></button>
                    <button onClick={() => openEdit(m)} className="p-2 rounded-lg text-white hover:bg-white/20" title="Edit details"><Pencil size={15} /></button>
                    <button onClick={() => requestDelete(m)} className="p-2 rounded-lg text-white hover:bg-error/70" title="Delete"><Trash2 size={15} /></button>
                  </div>
                  {!!m.tags?.length && (
                    <span className="absolute top-2 left-2 flex items-center gap-1 text-[10px] font-medium px-2 py-1 rounded-full bg-black/60 text-white">
                      <Tag size={10} /> {m.tags.slice(0, 2).join(', ')}{m.tags.length > 2 ? ` +${m.tags.length - 2}` : ''}
                    </span>
                  )}
                </div>
                <div className="px-3 py-2.5">
                  <p className="text-xs font-medium truncate">{m.alt || m.filename || 'Untitled'}</p>
                  <p className="text-[10px] text-text-muted truncate">{m.folder} · {m.width ? `${m.width}×${m.height}` : m.mime || ''}</p>
                </div>
              </div>
            ))}
          </div>
          <Pagination page={page} pages={pages} total={total} onPage={setPage} />
        </>
      )}

      <Modal
        open={!!editTarget}
        onClose={() => setEditTarget(null)}
        title="Edit Media Details"
        size="sm"
        footer={
          <>
            <button onClick={() => setEditTarget(null)} className="btn-outline text-sm">Cancel</button>
            <button type="submit" form="media-edit-form" className="btn-primary text-sm">Save</button>
          </>
        }
      >
        {editTarget && (
          <>
            <img src={editTarget.url} alt="" className="w-full aspect-video object-cover rounded-lg border border-border mb-4" />
            <form id="media-edit-form" onSubmit={saveEdit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1.5">Alt text</label>
                <input className="input-field" value={editForm.alt} onChange={(e) => setEditForm({ ...editForm, alt: e.target.value })} placeholder="Describe the image for accessibility" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">Caption</label>
                <input className="input-field" value={editForm.caption} onChange={(e) => setEditForm({ ...editForm, caption: e.target.value })} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">Tags</label>
                <input className="input-field" value={editForm.tags} onChange={(e) => setEditForm({ ...editForm, tags: e.target.value })} placeholder="comma, separated, keywords" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">Folder</label>
                <input className="input-field" value={editForm.folder} onChange={(e) => setEditForm({ ...editForm, folder: e.target.value })} />
              </div>
            </form>
          </>
        )}
      </Modal>

      <Modal
        open={urlModal}
        onClose={() => { setUrlModal(false); setUrlForm(EMPTY_URL); }}
        title="Add from URL"
        size="sm"
        footer={
          <>
            <button onClick={() => { setUrlModal(false); setUrlForm(EMPTY_URL); }} className="btn-outline text-sm">Cancel</button>
            <button type="submit" form="media-url-form" className="btn-primary text-sm"><Plus size={14} /> Add</button>
          </>
        }
      >
        <form id="media-url-form" onSubmit={addFromUrl} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1.5">Image URL</label>
            <input className="input-field" value={urlForm.url} onChange={(e) => setUrlForm({ ...urlForm, url: e.target.value })} placeholder="https://..." required />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5">Alt text</label>
            <input className="input-field" value={urlForm.alt} onChange={(e) => setUrlForm({ ...urlForm, alt: e.target.value })} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5">Tags</label>
            <input className="input-field" value={urlForm.tags} onChange={(e) => setUrlForm({ ...urlForm, tags: e.target.value })} placeholder="comma, separated" />
          </div>
        </form>
      </Modal>

      <Modal
        open={!!deleteTarget}
        onClose={() => { setDeleteTarget(null); setRefs(null); }}
        title="Image is in use"
        footer={
          <>
            <button onClick={() => { setDeleteTarget(null); setRefs(null); }} className="btn-outline text-sm">Cancel</button>
            <button onClick={forceDelete} className="btn-primary flex items-center gap-2 text-sm bg-error border-error hover:bg-error/90"><Trash2 size={14} /> Force Delete</button>
          </>
        }
      >
        <p className="text-sm text-text-light">
          This image is referenced in <strong>{refCount}</strong> place{refCount > 1 ? 's' : ''}. Deleting it will leave those references broken.
        </p>
        <div className="mt-4 space-y-2 text-sm">
          {!!refs?.products?.length && (
            <div>
              <p className="font-semibold text-xs uppercase tracking-wider text-text-muted mb-1">Products</p>
              <ul className="space-y-1">
                {refs.products.map((p) => <li key={p._id} className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" /><span>{p.name}</span></li>)}
              </ul>
            </div>
          )}
          {!!refs?.banners?.length && (
            <div>
              <p className="font-semibold text-xs uppercase tracking-wider text-text-muted mb-1">Banners</p>
              <ul className="space-y-1">
                {refs.banners.map((b) => <li key={b._id} className="flex items-center gap-2"><span>Banner — {b.title || '(Untitled)'}</span></li>)}
              </ul>
            </div>
          )}
          {!!refs?.settings?.length && (
            <div>
              <p className="font-semibold text-xs uppercase tracking-wider text-text-muted mb-1">Site Content</p>
              <ul className="space-y-1">
                {refs.settings.map((s) => <li key={s.key} className="flex items-center gap-2"><span className="font-mono text-xs bg-bg px-1.5 py-0.5 rounded">{s.key}</span></li>)}
              </ul>
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
}
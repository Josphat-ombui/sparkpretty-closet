import { useEffect, useState, useCallback } from 'react';
import {
  Save, Search, ChevronDown, ChevronRight, History,
  Undo2, Filter, FileText, Image as ImageIcon, Phone, Mail, Globe,
  Type, AlignLeft, Hash, List, Plus, Trash2,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { api } from '../../lib/api';
import { Card, PageHeader, Modal } from '../../components/admin/ui.jsx';
import ImageUpload from '../../components/admin/ImageUpload';

const SECTION_META = {
  general: { label: 'General / Site Info', icon: Globe },
  contact: { label: 'Contact Information', icon: Phone },
  social: { label: 'Social Links', icon: Globe },
  home_hero: { label: 'Home - Hero Section', icon: ImageIcon },
  home_story: { label: 'Home - Story Section', icon: FileText },
  home_gallery: { label: 'Home - Gallery', icon: ImageIcon },
  home_testimonials: { label: 'Home - Testimonials', icon: AlignLeft },
  home_promo: { label: 'Home - Promo Banner', icon: FileText },
  home_newsletter: { label: 'Home - Newsletter', icon: Mail },
  home_cta: { label: 'Home - Final CTA', icon: FileText },
  home_trust: { label: 'Home - Trust Badges', icon: Hash },
  footer: { label: 'Footer', icon: FileText },
  about: { label: 'About Page', icon: FileText },
  contact_page: { label: 'Contact Page Content', icon: Phone },
  seo: { label: 'SEO Defaults', icon: Globe },
};

const TYPE_ICONS = { text: Type, textarea: AlignLeft, number: Hash, boolean: Hash, json: List, image: ImageIcon };
const FIELD_TYPES = ['text', 'textarea', 'number', 'boolean', 'json', 'image'];
const EMPTY_FORM = { key: '', label: '', section: 'general', type: 'text', value: '', description: '' };

function parseJSON(val) {
  if (typeof val === 'string' && (val.startsWith('[') || val.startsWith('{'))) {
    try { return JSON.parse(val); } catch { return val; }
  }
  return val;
}

function JSONEditor({ value, onChange }) {
  const [text, setText] = useState(typeof value === 'string' ? value : JSON.stringify(value, null, 2));
  const [error, setError] = useState('');

  useEffect(() => {
    setText(typeof value === 'string' && (value.startsWith('[') || value.startsWith('{'))
      ? JSON.stringify(JSON.parse(value), null, 2)
      : typeof value === 'object' ? JSON.stringify(value, null, 2) : String(value || ''));
  }, [value]);

  const handleChange = (v) => {
    setText(v);
    try { const parsed = JSON.parse(v); setError(''); onChange(parsed); }
    catch { setError('Invalid JSON'); }
  };

  return (
    <div>
      <textarea
        className="input-field font-mono text-xs w-full"
        rows={Math.max(4, (text || '').split('\n').length + 1)}
        value={text}
        onChange={(e) => handleChange(e.target.value)}
        spellCheck={false}
      />
      {error && <p className="text-error text-xs mt-1">{error}</p>}
    </div>
  );
}

function ContentField({ entry, onChange }) {
  const { key: k, type, value } = entry;
  if (type === 'json') return <JSONEditor value={value} onChange={(v) => onChange(k, v)} />;
  if (type === 'boolean') return (
    <button type="button" onClick={() => onChange(!value)} className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${value ? 'bg-success/10 text-success' : 'bg-error/10 text-error'}`}>
      {value ? 'Yes' : 'No'}
    </button>
  );
  if (type === 'textarea') return <textarea className="input-field w-full" rows={3} value={value || ''} onChange={(e) => onChange(k, e.target.value)} />;
  if (type === 'number') return <input type="number" className="input-field w-full" value={value ?? ''} onChange={(e) => onChange(k, e.target.value === '' ? '' : Number(e.target.value))} />;
  if (type === 'image' || k.includes('image') || k.includes('hero_image') || k.includes('story_image') || k.includes('logo') || k.includes('banner') || k.includes('photo') || k.includes('icon')) return <ImageUpload value={value} onChange={(v) => onChange(k, v)} />;
  return <input className="input-field w-full" value={value ?? ''} onChange={(e) => onChange(k, e.target.value)} />;
}

export default function ContentManager() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [sectionFilter, setSectionFilter] = useState('');
  const [edits, setEdits] = useState({});
  const [expandedSections, setExpandedSections] = useState({});
  const [historyModal, setHistoryModal] = useState(null);
  const [versions, setVersions] = useState([]);
  const [showAdd, setShowAdd] = useState(false);
  const [addForm, setAddForm] = useState(EMPTY_FORM);

  const load = useCallback(() => {
    setLoading(true);
    const params = new URLSearchParams({ page: '1', limit: '200' });
    if (search) params.set('search', search);
    if (sectionFilter) params.set('section', sectionFilter);
    api.get(`/admin/content?${params.toString()}`)
      .then((r) => {
        const list = (r.data?.items || []).map((s) => ({ ...s, value: parseJSON(s.value) }));
        setItems(list);
        const expanded = {};
        list.forEach((s) => { const sec = s.section || 'general'; if (!expanded[sec]) expanded[sec] = true; });
        setExpandedSections(expanded);
      })
      .catch(() => toast.error('Failed to load content'))
      .finally(() => setLoading(false));
  }, [search, sectionFilter]);

  useEffect(() => { load(); }, [load]);

  const onChange = useCallback((key, value) => {
    setEdits((prev) => ({ ...prev, [key]: value }));
  }, []);

  const saveAll = async () => {
    const dirtyKeys = Object.keys(edits);
    if (!dirtyKeys.length) return toast('No unsaved changes');
    const payload = dirtyKeys.map((k) => {
      const item = items.find((x) => x.key === k);
      return {
        key: k,
        value: typeof edits[k] === 'object' ? JSON.stringify(edits[k]) : edits[k],
        type: item?.type || 'text',
        group: item?.group || 'content',
        label: item?.label || k,
        section: item?.section || 'general',
        description: item?.description || '',
      };
    });
    try {
      await api.post('/admin/content/bulk', payload);
      toast.success(`Saved ${dirtyKeys.length} change${dirtyKeys.length > 1 ? 's' : ''}`);
      setEdits({});
      load();
    } catch (err) { toast.error(err.message || 'Save failed'); }
  };

  const openHistory = async (key) => {
    setHistoryModal(key);
    try {
      const r = await api.get(`/admin/content/${key}/versions`);
      setVersions(r.data || []);
    } catch { setVersions([]); }
  };

  const revert = async (versionId, key) => {
    if (!window.confirm('Revert to this version?')) return;
    try {
      await api.post(`/admin/content/${key}/revert/${versionId}`);
      toast.success('Reverted');
      setHistoryModal(null);
      load();
    } catch (err) { toast.error(err.message || 'Revert failed'); }
  };

  const deleteField = async (key) => {
    if (!window.confirm(`Delete content field "${key}"? This cannot be undone.`)) return;
    try {
      await api.delete(`/admin/content/${key}`);
      toast.success('Field deleted');
      const nextEdits = { ...edits };
      delete nextEdits[key];
      setEdits(nextEdits);
      load();
    } catch (err) { toast.error(err.message || 'Delete failed'); }
  };

  const addField = async (e) => {
    e.preventDefault();
    const key = addForm.key.trim();
    if (!key) return toast.error('Key is required');
    try {
      const payload = {
        ...addForm,
        key,
        value: addForm.type === 'number' ? Number(addForm.value) : addForm.type === 'boolean' ? addForm.value === 'true' : addForm.type === 'json' ? JSON.parse(addForm.value || '[]') : addForm.value,
      };
      await api.put(`/admin/content/${key}`, payload);
      toast.success('Content field created');
      setShowAdd(false);
      setAddForm(EMPTY_FORM);
      load();
    } catch (err) { toast.error(err.message || 'Failed to create'); }
  };

  const sections = {};
  items.forEach((item) => {
    const sec = item.section || 'general';
    if (!sections[sec]) sections[sec] = [];
    sections[sec].push(item);
  });

  const toggleSection = (sec) => setExpandedSections((prev) => ({ ...prev, [sec]: !prev[sec] }));

  const dirtyCount = Object.keys(edits).length;

  return (
    <div>
      <PageHeader
        title="Content Manager"
        subtitle="Edit all website content from one place — changes save to the live site"
        actions={
          <div className="flex items-center gap-2">
            {dirtyCount > 0 && (
              <span className="text-sm text-warning font-medium">{dirtyCount} unsaved change{dirtyCount > 1 ? 's' : ''}</span>
            )}
            <button onClick={() => { setAddForm(EMPTY_FORM); setShowAdd(true); }} className="btn-outline flex items-center gap-2 text-sm">
              <Plus size={16} /> Add Content Field
            </button>
            <button onClick={saveAll} disabled={!dirtyCount} className="btn-primary flex items-center gap-2 text-sm disabled:opacity-50">
              <Save size={16} /> Publish Changes
            </button>
          </div>
        }
      />

      <Card pad={false} className="mb-6">
        <div className="p-4 border-b border-border flex flex-wrap gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
            <input className="input-field pl-9" placeholder="Search content fields..." value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <select value={sectionFilter} onChange={(e) => setSectionFilter(e.target.value)} className="input-field w-auto">
            <option value="">All sections</option>
            {Object.keys(SECTION_META).map((s) => (
              <option key={s} value={s}>{SECTION_META[s]?.label || s}</option>
            ))}
          </select>
          <button onClick={load} className="btn-outline text-sm px-4"><Filter size={14} className="inline mr-1" />Refresh</button>
        </div>
      </Card>

      {loading ? (
        <div className="space-y-4"><div className="skeleton h-40" /><div className="skeleton h-40" /><div className="skeleton h-40" /></div>
      ) : items.length === 0 ? (
        <Card><p className="text-center text-text-muted py-10">No content found. Run the content seed script first.</p></Card>
      ) : (
        Object.entries(sections).map(([sec, entries]) => {
          const meta = SECTION_META[sec] || { label: sec, icon: FileText };
          const Icon = meta.icon;
          const expanded = expandedSections[sec] !== false;
          const sectionDirty = entries.filter((e) => e.key in edits).length;

          return (
            <div key={sec} className="mb-4">
              <button
                onClick={() => toggleSection(sec)}
                className="w-full flex items-center gap-3 px-4 py-3 bg-white border border-border rounded-t-lg hover:bg-bg/50 transition-colors"
              >
                {expanded ? <ChevronDown size={16} className="text-text-muted" /> : <ChevronRight size={16} className="text-text-muted" />}
                <Icon size={16} className="text-primary" />
                <span className="font-heading font-semibold text-sm">{meta.label}</span>
                <span className="text-xs text-text-muted bg-bg px-2 py-0.5 rounded-full">{entries.length} fields</span>
                {sectionDirty > 0 && (
                  <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-warning/10 text-warning">{sectionDirty} unsaved</span>
                )}
              </button>
              {expanded && (
                <div className="bg-white border border-t-0 border-border rounded-b-lg divide-y divide-border/50">
                  {entries.map((entry) => {
                    const TypeIcon = TYPE_ICONS[entry.type] || Type;
                    const isDirty = entry.key in edits;
                    return (
                      <div key={entry.key} className={`px-4 py-3 ${isDirty ? 'bg-warning/5' : ''}`}>
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1.5">
                              <TypeIcon size={13} className="text-text-muted" />
                              <span className="text-sm font-medium">{entry.label || entry.key}</span>
                              {entry.description && (
                                <span className="text-xs text-text-muted hidden sm:inline">- {entry.description}</span>
                              )}
                              <span className="text-[10px] font-mono text-text-muted bg-bg px-1.5 py-0.5 rounded">{entry.type}</span>
                              {isDirty && <span className="w-2 h-2 rounded-full bg-warning" title="Unsaved" />}
                            </div>
                            <ContentField entry={entry} onChange={onChange} />
                          </div>
                          <div className="flex items-center gap-1 shrink-0">
                            <button onClick={() => openHistory(entry.key)} className="p-2 text-text-muted hover:text-primary-dark rounded-lg hover:bg-bg transition-colors" title="Version history">
                              <History size={15} />
                            </button>
                            <button onClick={() => deleteField(entry.key)} className="p-2 text-text-muted hover:text-error rounded-lg hover:bg-error/10 transition-colors" title="Delete field">
                              <Trash2 size={15} />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })
      )}

      <Modal
        open={!!historyModal}
        onClose={() => { setHistoryModal(null); setVersions([]); }}
        title={`Version History — ${historyModal || ''}`}
        size="lg"
      >
        {versions.length === 0 ? (
          <p className="text-text-muted text-center py-8">No version history yet for this field.</p>
        ) : (
          <div className="space-y-3 max-h-[60vh] overflow-y-auto">
            {versions.map((v) => (
              <div key={v._id} className="flex items-start justify-between gap-4 p-3 bg-bg rounded-lg">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium truncate">{String(v.value).slice(0, 100)}</p>
                  <p className="text-xs text-text-muted mt-1">
                    By {v.updatedByName || 'Unknown'} &middot; {new Date(v.createdAt).toLocaleString()}
                  </p>
                </div>
                <button onClick={() => revert(v._id, historyModal)} className="btn-outline text-xs flex items-center gap-1 shrink-0">
                  <Undo2 size={12} /> Revert
                </button>
              </div>
            ))}
          </div>
        )}
      </Modal>

      <Modal
        open={showAdd}
        onClose={() => { setShowAdd(false); setAddForm(EMPTY_FORM); }}
        title="Add Content Field"
        size="sm"
        footer={
          <>
            <button onClick={() => { setShowAdd(false); setAddForm(EMPTY_FORM); }} className="btn-outline text-sm">Cancel</button>
            <button type="submit" form="add-field-form" className="btn-primary text-sm">Create Field</button>
          </>
        }
      >
        <form id="add-field-form" onSubmit={addField} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1.5">Field Key</label>
            <input
              className="input-field font-mono text-sm"
              value={addForm.key}
              onChange={(e) => setAddForm((prev) => ({ ...prev, key: e.target.value.replace(/[^a-z0-9_]/gi, '_').toLowerCase() }))}
              placeholder="home_hero_heading"
              required
            />
            <p className="text-xs text-text-muted mt-1">Used in code as <code className="font-mono">get('{addForm.key || 'your_key'}', fallback)</code></p>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5">Label</label>
            <input className="input-field" value={addForm.label} onChange={(e) => setAddForm((prev) => ({ ...prev, label: e.target.value }))} placeholder="Home hero heading" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1.5">Section</label>
              <select className="input-field" value={addForm.section} onChange={(e) => setAddForm((prev) => ({ ...prev, section: e.target.value }))}>
                {Object.keys(SECTION_META).map((s) => (
                  <option key={s} value={s}>{SECTION_META[s]?.label || s}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">Type</label>
              <select className="input-field" value={addForm.type} onChange={(e) => setAddForm((prev) => ({ ...prev, type: e.target.value, value: e.target.value === 'json' ? '[]' : e.target.value === 'boolean' ? 'true' : '' }))}>
                {FIELD_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5">Description</label>
            <input className="input-field" value={addForm.description} onChange={(e) => setAddForm((prev) => ({ ...prev, description: e.target.value }))} placeholder="Optional helper text" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5">Default Value</label>
            {addForm.type === 'textarea' ? (
              <textarea className="input-field" rows={2} value={addForm.value} onChange={(e) => setAddForm((prev) => ({ ...prev, value: e.target.value }))} />
            ) : addForm.type === 'boolean' ? (
              <select className="input-field" value={addForm.value === 'true' ? 'true' : 'false'} onChange={(e) => setAddForm((prev) => ({ ...prev, value: e.target.value }))}>
                <option value="true">Yes</option>
                <option value="false">No</option>
              </select>
            ) : addForm.type === 'number' ? (
              <input type="number" className="input-field" value={addForm.value} onChange={(e) => setAddForm((prev) => ({ ...prev, value: e.target.value }))} />
            ) : addForm.type === 'json' ? (
              <textarea className="input-field font-mono text-xs" rows={3} value={addForm.value} onChange={(e) => setAddForm((prev) => ({ ...prev, value: e.target.value }))} spellCheck={false} />
            ) : addForm.type === 'image' ? (
              <ImageUpload value={addForm.value} onChange={(v) => setAddForm((prev) => ({ ...prev, value: v }))} previewHeight="h-24" />
            ) : (
              <input className="input-field" value={addForm.value} onChange={(e) => setAddForm((prev) => ({ ...prev, value: e.target.value }))} />
            )}
          </div>
        </form>
      </Modal>
    </div>
  );
}

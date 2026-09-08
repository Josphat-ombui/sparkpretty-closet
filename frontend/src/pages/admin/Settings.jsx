import { useEffect, useState } from 'react';
import { Save, Plus, Trash2, Palette } from 'lucide-react';
import toast from 'react-hot-toast';
import { api } from '../../lib/api';
import { useTheme } from '../../context/ThemeContext';
import ThemePicker from '../../components/admin/ThemePicker';
import { Card, PageHeader, Modal } from '../../components/admin/ui.jsx';

const GROUPS = ['general', 'store', 'contact', 'social', 'seo'];

export default function Settings() {
  const [settings, setSettings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ key: '', value: '', type: 'text', group: 'general', label: '' });
  const [edits, setEdits] = useState({}); // key -> edited value
  const { theme, setTheme } = useTheme();
  const [siteTheme, setSiteTheme] = useState('');
  const [themeDirty, setThemeDirty] = useState(false);

  const load = () => {
    setLoading(true);
    api.get('/admin/settings').then((r) => {
      setSettings(r.data || []);
      const st = (r.data || []).find((s) => s.key === 'site_theme');
      setSiteTheme(st?.value || theme);
    }).catch(() => toast.error('Failed to load settings')).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const saveTheme = async () => {
    try {
      await api.put('/admin/settings/site_theme', { value: siteTheme, type: 'text', group: 'general', label: 'Site Theme' });
      toast.success('Theme saved for the whole site');
      setThemeDirty(false);
    } catch (err) { toast.error(err.message || 'Failed to save theme'); }
  };

  const renderValue = (s) => {
    const onChange = (v) => setEdits((prev) => ({ ...prev, [s.key]: v }));
    const value = s.key in edits ? edits[s.key] : s.value;
    if (s.type === 'boolean') {
      return (
        <button type="button" onClick={() => onChange(!value)} className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${value ? 'bg-success/10 text-success' : 'bg-error/10 text-error'}`}>
          {value ? 'Yes' : 'No'}
        </button>
      );
    }
    if (s.type === 'number') {
      return <input type="number" className="input-field text-sm py-2 w-32" value={value ?? ''} onChange={(e) => onChange(e.target.value === '' ? '' : Number(e.target.value))} />;
    }
    if (s.type === 'textarea') {
      return <textarea className="input-field text-sm py-2" rows={2} value={value ?? ''} onChange={(e) => onChange(e.target.value)} />;
    }
    return <input className="input-field text-sm py-2" value={value ?? ''} onChange={(e) => onChange(e.target.value)} />;
  };

  const save = async () => {
    const dirtyKeys = Object.keys(edits);
    if (!dirtyKeys.length) return toast('No unsaved changes');
    const payload = dirtyKeys.map((k) => {
      const s = settings.find((x) => x.key === k);
      return { key: k, value: edits[k], type: s?.type || 'text', group: s?.group || 'general', label: s?.label || k };
    });
    try {
      await api.put('/admin/settings/bulk', payload);
      toast.success('Settings saved');
      setEdits({});
      load();
    } catch (err) { toast.error(err.message || 'Save failed'); }
  };

  const removeKey = async (key) => {
    if (!window.confirm(`Delete setting "${key}"?`)) return;
    try {
      await api.delete(`/admin/settings/${key}`);
      toast.success('Setting deleted');
      load();
    } catch { toast.error('Failed to delete'); }
  };

  const addSetting = async (e) => {
    e.preventDefault();
    if (!form.key) return toast.error('Key is required');
    try {
      const value = form.type === 'boolean' ? form.value === 'true' : form.type === 'number' ? Number(form.value) : form.value;
      await api.put(`/admin/settings/${form.key}`, { value, type: form.type, group: form.group, label: form.label || form.key });
      toast.success('Setting created');
      setShowAdd(false);
      setForm({ key: '', value: '', type: 'text', group: 'general', label: '' });
      load();
    } catch { toast.error('Failed to create'); }
  };

  return (
    <div>
      <PageHeader
        title="Site Settings"
        subtitle="Global configuration, contact info, and SEO defaults"
        actions={
          <div className="flex items-center gap-2">
            <button onClick={() => setShowAdd(true)} className="btn-outline flex items-center gap-2 text-sm"><Plus size={16} /> Add Setting</button>
            <button onClick={save} className="btn-primary flex items-center gap-2 text-sm"><Save size={16} /> Save Changes</button>
          </div>
        }
      />

      <div className="mb-6">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
          <div className="flex items-center gap-2">
            <Palette size={18} className="text-primary" />
            <h2 className="font-heading text-xl font-semibold">Site Theme</h2>
          </div>
          {themeDirty && (
            <button onClick={saveTheme} className="btn-primary flex items-center gap-2 text-sm"><Save size={16} /> Save Theme</button>
          )}
        </div>
        <p className="text-text-light text-sm mb-3">Pick a theme for the whole site — public storefront and admin panel. Visitors see your chosen theme by default.</p>
        <Card>
          <ThemePicker
            size="lg"
            value={siteTheme}
            onSelect={(id) => { setSiteTheme(id); setThemeDirty(true); setTheme(id); }}
            onPreview={(id) => setTheme(id)}
          />
        </Card>
      </div>

      {loading ? (
        <Card><div className="skeleton h-40" /></Card>
      ) : (
        GROUPS.map((group) => {
          const groupSettings = settings.filter((s) => (s.group || 'general') === group);
          if (!groupSettings.length) return null;
          return (
            <div key={group} className="mb-6">
              <div className="flex items-center gap-2 mb-3">
                <h2 className="font-heading text-lg font-semibold capitalize">{group}</h2>
                <span className="text-xs text-text-muted bg-bg px-2 py-0.5 rounded-full">{groupSettings.length}</span>
              </div>
              <Card>
                <div className="space-y-4">
                  {groupSettings.map((s) => (
                    <div key={s.key} className="grid sm:grid-cols-[1fr_1.2fr_auto] gap-3 items-start">
                      <div>
                        <p className="text-sm font-medium">{s.label || s.key}</p>
                        <p className="text-xs text-text-muted font-mono">{s.key} <span className="text-bg-600">· {s.type}</span></p>
                      </div>
                      <div>{renderValue(s)}</div>
                      <button onClick={() => removeKey(s.key)} className="p-2 text-text-light hover:text-error rounded-lg hover:bg-error/10" title="Delete"><Trash2 size={15} /></button>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          );
        })
      )}

      <Modal
        open={showAdd}
        onClose={() => setShowAdd(false)}
        title="Add Setting"
        size="sm"
        footer={
          <>
            <button onClick={() => setShowAdd(false)} className="btn-outline text-sm">Cancel</button>
            <button type="submit" form="setting-form" className="btn-primary text-sm">Create</button>
          </>
        }
      >
        <form id="setting-form" onSubmit={addSetting} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1.5">Key</label>
            <input className="input-field font-mono text-sm" value={form.key} onChange={(e) => setForm({ ...form, key: e.target.value.replace(/\s+/g, '_').toLowerCase() })} placeholder="store_phone" required />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5">Label</label>
            <input className="input-field" value={form.label} onChange={(e) => setForm({ ...form, label: e.target.value })} placeholder="Store phone number" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1.5">Group</label>
              <select className="input-field" value={form.group} onChange={(e) => setForm({ ...form, group: e.target.value })}>
                {GROUPS.map((g) => <option key={g} value={g}>{g}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">Type</label>
              <select className="input-field" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
                <option value="text">Text</option>
                <option value="textarea">Textarea</option>
                <option value="number">Number</option>
                <option value="boolean">Boolean</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5">Value</label>
            {form.type === 'textarea'
              ? <textarea className="input-field" rows={3} value={form.value} onChange={(e) => setForm({ ...form, value: e.target.value })} />
              : form.type === 'boolean'
                ? <select className="input-field" value={form.value === 'true' ? 'true' : 'false'} onChange={(e) => setForm({ ...form, value: e.target.value })}><option value="true">Yes</option><option value="false">No</option></select>
                : form.type === 'number'
                  ? <input type="number" className="input-field" value={form.value} onChange={(e) => setForm({ ...form, value: e.target.value })} />
                  : <input className="input-field" value={form.value} onChange={(e) => setForm({ ...form, value: e.target.value })} />}
          </div>
        </form>
      </Modal>
    </div>
  );
}
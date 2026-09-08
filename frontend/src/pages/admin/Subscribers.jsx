import { useEffect, useState } from 'react';
import { Mail, Search, Trash2, Copy } from 'lucide-react';
import toast from 'react-hot-toast';
import { api } from '../../lib/api';
import { Card, PageHeader, Pagination, EmptyState } from '../../components/admin/ui.jsx';

export default function Subscribers() {
  const [state, setState] = useState({ items: [], total: 0, page: 1, pages: 1 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [query, setQuery] = useState('');
  const [active, setActive] = useState('');

  const load = (p = 1) => {
    setLoading(true);
    const params = new URLSearchParams();
    if (query) params.set('search', query);
    if (active) params.set('active', active);
    params.set('page', p);
    api.get(`/admin/subscribers?${params.toString()}`)
      .then((r) => setState(r.data))
      .catch(() => toast.error('Failed to load subscribers'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(1); /* eslint-disable-next-line */ }, [query, active]);

  const remove = async (id) => {
    if (!window.confirm('Remove this subscriber?')) return;
    try {
      await api.delete(`/admin/subscribers/${id}`);
      toast.success('Subscriber removed');
      load(state.page);
    } catch { toast.error('Failed to remove'); }
  };

  const copyAll = async () => {
    const emails = state.items.map((s) => s.email).join(', ');
    try {
      await navigator.clipboard.writeText(emails);
      toast.success('Emails copied to clipboard');
    } catch { toast.error('Could not copy'); }
  };

  return (
    <div>
      <PageHeader
        title="Newsletter Subscribers"
        subtitle={`${state.total} subscribers`}
        actions={
          <button onClick={copyAll} className="btn-outline flex items-center gap-2 text-sm"><Copy size={15} /> Copy emails</button>
        }
      />

      <Card pad={false}>
        <div className="p-4 border-b border-border flex flex-wrap gap-3 items-center">
          <div className="relative flex-1 min-w-[200px]">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
            <input
              className="input-field pl-9"
              placeholder="Search by email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && setQuery(search)}
            />
          </div>
          <select value={active} onChange={(e) => setActive(e.target.value)} className="input-field w-auto">
            <option value="">All</option>
            <option value="true">Active</option>
            <option value="false">Unsubscribed</option>
          </select>
          <button onClick={() => setQuery(search)} className="btn-outline text-sm px-4">Search</button>
        </div>

        {loading ? (
          <div className="p-5 space-y-3"><div className="skeleton h-12" /><div className="skeleton h-12" /></div>
        ) : state.items.length === 0 ? (
          <EmptyState title="No subscribers" message="Subscribers sign up through the footer newsletter form." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-bg text-text-muted uppercase text-xs">
                <tr>
                  <th className="text-left px-5 py-3 font-semibold">Email</th>
                  <th className="text-left px-5 py-3 font-semibold">Status</th>
                  <th className="text-left px-5 py-3 font-semibold">Subscribed</th>
                  <th className="text-right px-5 py-3 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {state.items.map((s) => (
                  <tr key={s._id} className="border-t border-border/50 hover:bg-bg/50">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center"><Mail size={15} className="text-primary" /></div>
                        <span className="font-medium">{s.email}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3">
                      <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${s.active ? 'bg-success/10 text-success' : 'bg-error/10 text-error'}`}>
                        {s.active ? 'Active' : 'Unsubscribed'}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-xs text-text-light">{new Date(s.createdAt).toLocaleDateString()}</td>
                    <td className="px-5 py-3 text-right">
                      <button onClick={() => remove(s._id)} className="p-2 rounded-lg text-text-light hover:text-error hover:bg-error/10 transition-colors" title="Remove"><Trash2 size={15} /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {state.pages > 1 && (
          <div className="px-5 pb-4"><Pagination page={state.page} pages={state.pages} total={state.total} onPage={load} /></div>
        )}
      </Card>
    </div>
  );
}
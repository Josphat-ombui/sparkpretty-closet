import { useEffect, useState } from 'react';
import { Search, Trash2, Eye, Mail, Phone } from 'lucide-react';
import toast from 'react-hot-toast';
import { api } from '../../lib/api';
import { Card, PageHeader, Pagination, EmptyState, Modal } from '../../components/admin/ui.jsx';

export default function Contacts() {
  const [state, setState] = useState({ items: [], total: 0, page: 1, pages: 1 });
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');
  const [detail, setDetail] = useState(null);

  const load = (p = 1) => {
    setLoading(true);
    const params = new URLSearchParams();
    if (filter) params.set('read', filter === 'unread' ? 'false' : 'true');
    params.set('page', p);
    api.get(`/admin/contacts?${params.toString()}`)
      .then((r) => setState(r.data))
      .catch(() => toast.error('Failed to load messages'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(1); /* eslint-disable-next-line */ }, [filter]);

  const openDetail = async (m) => {
    setDetail(m);
    if (!m.read) {
      await api.put(`/admin/contacts/${m._id}`, { read: true }).catch(() => {});
      setDetail({ ...m, read: true });
      load(state.page);
    }
  };

  const remove = async (id) => {
    if (!window.confirm('Delete this message?')) return;
    try {
      await api.delete(`/admin/contacts/${id}`);
      toast.success('Message deleted');
      setDetail(null);
      load(state.page);
    } catch { toast.error('Failed to delete'); }
  };

  return (
    <div>
      <PageHeader title="Messages" subtitle={`${state.total} contact messages`} />

      <Card pad={false}>
        <div className="p-4 border-b border-border flex flex-wrap gap-3 items-center">
          <select value={filter} onChange={(e) => setFilter(e.target.value)} className="input-field w-auto">
            <option value="">All messages</option>
            <option value="unread">Unread</option>
            <option value="read">Read</option>
          </select>
        </div>

        {loading ? (
          <div className="p-5 space-y-3"><div className="skeleton h-14" /><div className="skeleton h-14" /></div>
        ) : state.items.length === 0 ? (
          <EmptyState title="No messages" message="Contact form submissions will appear here." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-bg text-text-muted uppercase text-xs">
                <tr>
                  <th className="text-left px-5 py-3 font-semibold">From</th>
                  <th className="text-left px-5 py-3 font-semibold">Subject</th>
                  <th className="text-left px-5 py-3 font-semibold">Status</th>
                  <th className="text-left px-5 py-3 font-semibold">Date</th>
                  <th className="text-right px-5 py-3 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {state.items.map((m) => (
                  <tr key={m._id} className={`border-t border-border/50 hover:bg-bg/50 ${!m.read ? 'bg-primary/[0.03]' : ''}`}>
                    <td className="px-5 py-3">
                      <p className="font-medium">{m.name}</p>
                      <p className="text-xs text-text-muted">{m.email}</p>
                    </td>
                    <td className="px-5 py-3">
                      <p className="truncate max-w-[220px]">{m.subject || '(no subject)'}</p>
                      <p className="text-xs text-text-muted truncate max-w-[220px]">{m.message}</p>
                    </td>
                    <td className="px-5 py-3">
                      {!m.read && <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-warning/10 text-warning">New</span>}
                      {m.read && <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-success/10 text-success">Read</span>}
                    </td>
                    <td className="px-5 py-3 text-xs text-text-light">{new Date(m.createdAt).toLocaleDateString()} {new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</td>
                    <td className="px-5 py-3">
                      <div className="flex justify-end gap-1.5">
                        <button onClick={() => openDetail(m)} className="p-2 rounded-lg text-text-light hover:text-primary hover:bg-primary/10 transition-colors" title="View"><Eye size={15} /></button>
                        <button onClick={() => remove(m._id)} className="p-2 rounded-lg text-text-light hover:text-error hover:bg-error/10 transition-colors" title="Delete"><Trash2 size={15} /></button>
                      </div>
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

      <Modal
        open={!!detail}
        onClose={() => setDetail(null)}
        title={detail?.subject || 'Message'}
        size="sm"
        footer={
          <>
            {detail && <button onClick={() => remove(detail._id)} className="btn-outline text-error text-sm hover:bg-error hover:text-white border-error">Delete</button>}
            <button onClick={() => setDetail(null)} className="btn-primary text-sm">Close</button>
          </>
        }
      >
        {detail && (
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-11 h-11 rounded-full gradient-hero flex items-center justify-center text-white font-semibold">{detail.name?.charAt(0)?.toUpperCase()}</div>
              <div>
                <p className="font-semibold">{detail.name}</p>
                <div className="flex items-center gap-3 text-xs text-text-light mt-1">
                  <span className="flex items-center gap-1"><Mail size={12} /> {detail.email}</span>
                  {detail.phone && <span className="flex items-center gap-1"><Phone size={12} /> {detail.phone}</span>}
                </div>
              </div>
            </div>
            <div className="rounded-lg bg-bg p-4 whitespace-pre-wrap text-sm">{detail.message}</div>
            <div className="flex justify-end gap-2 text-xs">
              <a href={`mailto:${detail.email}?subject=Re: ${detail.subject || 'Your message'}`} className="btn-primary text-xs px-3 py-2">Reply by Email</a>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
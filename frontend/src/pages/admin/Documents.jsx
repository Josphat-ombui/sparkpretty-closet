import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Plus, Search, Eye, Pencil, Printer, Trash2,
  FileText, FilePlus2, Receipt, ScrollText, CreditCard, TrendingUp,
} from 'lucide-react';
import { api } from '../../lib/api';
import toast from 'react-hot-toast';
import { Card, PageHeader, Pagination, EmptyState, Modal, StatusPill } from '../../components/admin/ui.jsx';
import { DOC_TYPES, DOC_ORDER, DOC_STATUS, money } from '../../lib/documents';

const TYPE_ICONS = {
  quotation: FilePlus2,
  invoice: FileText,
  receipt: Receipt,
  credit_note: CreditCard,
  delivery_note: ScrollText,
  purchase_order: CreditCard,
  letterhead: FileText,
  statement: ScrollText,
};

export default function Documents() {
  const navigate = useNavigate();
  const [state, setState] = useState({ items: [], total: 0, page: 1, pages: 1 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [query, setQuery] = useState('');
  const [type, setType] = useState('');
  const [status, setStatus] = useState('');
  const [summary, setSummary] = useState(null);
  const [newOpen, setNewOpen] = useState(false);

  const load = (p = 1) => {
    setLoading(true);
    const params = new URLSearchParams();
    if (query) params.set('search', query);
    if (type) params.set('type', type);
    if (status) params.set('status', status);
    params.set('page', p);
    params.set('limit', 15);
    api.get(`/admin/documents?${params.toString()}`)
      .then((r) => setState(r.data))
      .catch(() => toast.error('Failed to load documents'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load(1);
    api.get('/admin/documents/summary').then((r) => setSummary(r.data)).catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query, type, status]);

  const remove = async (doc) => {
    if (!window.confirm(`Delete #${doc.number}? This cannot be undone.`)) return;
    try {
      await api.delete(`/admin/documents/${doc._id}`);
      toast.success('Document deleted');
      api.get('/admin/documents/summary').then((r) => setSummary(r.data)).catch(() => {});
      load(state.page);
    } catch (err) {
      toast.error(err.message || 'Delete failed');
    }
  };

  const statCards = [
    {
      label: 'Total Documents',
      value: summary?.totalDocs ?? '\u2014',
      icon: FileText,
      tint: 'bg-primary/10 text-primary',
    },
    {
      label: 'Year Invoiced',
      value: money(summary?.yearInvoiced ?? 0),
      icon: TrendingUp,
      tint: 'bg-success/10 text-success',
    },
    {
      label: 'Year Received',
      value: money(summary?.yearCollected ?? 0),
      icon: CreditCard,
      tint: 'bg-warning/10 text-warning',
    },
  ];

  return (
    <div>
      <PageHeader
        title="Business Documents"
        subtitle="Quotations, invoices, receipts, letterheads & more"
        actions={
          <>
            <button onClick={() => setNewOpen(true)} className="btn-primary flex items-center gap-2 text-sm">
              <Plus size={16} /> New Document
            </button>
          </>
        }
      />

      {/* Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        {statCards.map((s) => {
          const Icon = s.icon;
          return (
            <div key={s.label} className="card p-5 flex items-center gap-4">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${s.tint}`}>
                <Icon size={22} />
              </div>
              <div className="min-w-0">
                <p className="text-xs uppercase tracking-wider text-text-muted font-medium">{s.label}</p>
                <p className="text-xl font-bold mt-0.5">{s.value}</p>
              </div>
            </div>
          );
        })}
      </div>

      <Card pad={false}>
        <div className="p-4 border-b border-border flex flex-wrap gap-3 items-center">
          <div className="relative flex-1 min-w-[200px]">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
            <input
              className="input-field pl-9"
              placeholder="Search number, title or client..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && setQuery(search)}
            />
          </div>
          <select value={type} onChange={(e) => setType(e.target.value)} className="input-field w-auto">
            <option value="">All types</option>
            {DOC_ORDER.map((t) => <option key={t} value={t}>{DOC_TYPES[t].label}</option>)}
          </select>
          <select value={status} onChange={(e) => setStatus(e.target.value)} className="input-field w-auto">
            <option value="">All statuses</option>
            {Object.keys(DOC_STATUS).map((s) => <option key={s} value={s}>{DOC_STATUS[s].label}</option>)}
          </select>
          <button onClick={() => setQuery(search)} className="btn-outline text-sm px-4">Search</button>
        </div>

        {loading ? (
          <div className="p-5 space-y-3"><div className="skeleton h-14" /><div className="skeleton h-14" /></div>
        ) : state.items.length === 0 ? (
          <EmptyState
            title="No documents yet"
            message="Create quotations, invoices, receipts and letterheads for your clients — all generated with your company branding."
            action={
              <button onClick={() => setNewOpen(true)} className="btn-primary text-sm flex items-center gap-2">
                <Plus size={16} /> Create your first document
              </button>
            }
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="table-shell">
              <thead>
                <tr>
                  <th className="w-10">#</th>
                  <th>Document</th>
                  <th>Client</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Date</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {state.items.map((doc) => {
                  const Icon = TYPE_ICONS[doc.type] || FileText;
                  const meta = DOC_TYPES[doc.type] || {};
                  return (
                    <tr key={doc._id}>
                      <td className="px-4">
                        <div className="w-9 h-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                          <Icon size={16} />
                        </div>
                      </td>
                      <td>
                        <Link to={`/admin/documents/${doc._id}`} className="font-medium hover:text-primary transition-colors block">
                          #{doc.number}
                        </Link>
                        <span className="text-xs text-text-muted">{meta.label}{doc.title ? ` \u00b7 ${doc.title}` : ''}</span>
                      </td>
                      <td className="text-sm">{doc.party?.name || '\u2014'}</td>
                      <td className="font-medium">{money(doc.total)}</td>
                      <td>
                        <StatusPill status={doc.status} map={DOC_STATUS} />
                      </td>
                      <td className="text-xs text-text-light">{new Date(doc.createdAt).toLocaleDateString()}</td>
                      <td className="text-right">
                        <div className="flex justify-end gap-1">
                          <Link to={`/admin/documents/${doc._id}`} className="p-2 rounded-lg text-text-light hover:text-primary hover:bg-primary/10 transition-colors" title="View"><Eye size={15} /></Link>
                          <Link to={`/admin/documents/${doc._id}/edit`} className="p-2 rounded-lg text-text-light hover:text-accent hover:bg-accent-light transition-colors" title="Edit"><Pencil size={15} /></Link>
                          <Link to={`/admin/documents/${doc._id}/print`} target="_blank" className="p-2 rounded-lg text-text-light hover:text-success hover:bg-success/10 transition-colors" title="Print / PDF"><Printer size={15} /></Link>
                          <button onClick={() => remove(doc)} className="p-2 rounded-lg text-text-light hover:text-error hover:bg-error/10 transition-colors" title="Delete"><Trash2 size={15} /></button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {state.pages > 1 && (
          <div className="px-5 pb-4"><Pagination page={state.page} pages={state.pages} total={state.total} onPage={load} /></div>
        )}
      </Card>

      {/* New document type picker */}
      <Modal open={newOpen} onClose={() => setNewOpen(false)} title="Create a new document" size="sm">
        <div className="space-y-2">
          {DOC_ORDER.map((t) => {
            const Icon = TYPE_ICONS[t] || FileText;
            const meta = DOC_TYPES[t];
            return (
              <button
                key={t}
                onClick={() => { setNewOpen(false); navigate(`/admin/documents/new?type=${t}`); }}
                className="w-full flex items-center gap-3 p-3 rounded-lg border border-border hover:border-primary hover:bg-primary/5 transition-colors text-left"
              >
                <span className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                  <Icon size={18} />
                </span>
                <span>
                  <span className="block text-sm font-semibold">{meta.label}</span>
                  <span className="block text-xs text-text-muted">Create &amp; print a {meta.label.toLowerCase()}</span>
                </span>
              </button>
            );
          })}
        </div>
      </Modal>
    </div>
  );
}
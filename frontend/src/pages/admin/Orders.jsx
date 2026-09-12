import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, Eye, Trash2, FileText } from 'lucide-react';
import { api, formatPrice } from '../../lib/api';
import toast from 'react-hot-toast';
import { Card, PageHeader, Pagination, EmptyState, Modal, StatusPill, ORDER_STATUS, PAYMENT_STATUS } from '../../components/admin/ui.jsx';

export default function AdminOrders() {
  const [state, setState] = useState({ items: [], total: 0, page: 1, pages: 1 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState('');
  const [detail, setDetail] = useState(null);

  const load = (p = 1) => {
    setLoading(true);
    const params = new URLSearchParams();
    if (query) params.set('search', query);
    if (status) params.set('status', status);
    params.set('page', p);
    params.set('limit', 15);
    api.get(`/admin/orders?${params.toString()}`)
      .then((r) => setState(r.data))
      .catch(() => toast.error('Failed to load orders'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(1); /* eslint-disable-next-line */ }, [query, status]);

  const updateStatus = async (orderId, nextStatus) => {
    try {
      await api.put(`/admin/orders/${orderId}/status`, { status: nextStatus });
      toast.success('Status updated');
      if (detail && detail._id === orderId) setDetail({ ...detail, status: nextStatus });
      load(state.page);
    } catch (err) {
      toast.error(err.message || 'Update failed');
    }
  };

  const deleteOrder = async (o) => {
    if (!window.confirm(`Delete order #${o._id.slice(-8).toUpperCase()}?`)) return;
    try {
      await api.delete(`/admin/orders/${o._id}`);
      toast.success('Order deleted');
      setDetail(null);
      load(state.page);
    } catch (err) {
      toast.error(err.message || 'Delete failed');
    }
  };

  return (
    <div>
      <PageHeader title="Orders" subtitle={`${state.total} orders`} />

      <Card pad={false}>
        <div className="p-4 border-b border-border flex flex-wrap gap-3 items-center">
          <div className="relative flex-1 min-w-[200px]">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
            <input
              className="input-field pl-9"
              placeholder="Search order ID or M-Pesa receipt..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && setQuery(search)}
            />
          </div>
          <select value={status} onChange={(e) => setStatus(e.target.value)} className="input-field w-auto">
            <option value="">All statuses</option>
            {Object.keys(ORDER_STATUS).map((s) => <option key={s} value={s}>{ORDER_STATUS[s].label}</option>)}
          </select>
          <button onClick={() => setQuery(search)} className="btn-outline text-sm px-4">Search</button>
        </div>

        {loading ? (
          <div className="p-5 space-y-3"><div className="skeleton h-14" /><div className="skeleton h-14" /></div>
        ) : state.items.length === 0 ? (
          <EmptyState title="No orders found" message="Orders will appear here once customers check out." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-bg text-text-muted uppercase text-xs">
                <tr>
                  <th className="text-left px-5 py-3 font-semibold">Order</th>
                  <th className="text-left px-5 py-3 font-semibold">Customer</th>
                  <th className="text-left px-5 py-3 font-semibold">Items</th>
                  <th className="text-left px-5 py-3 font-semibold">Total</th>
                  <th className="text-left px-5 py-3 font-semibold">Payment</th>
                  <th className="text-left px-5 py-3 font-semibold">Status</th>
                  <th className="text-left px-5 py-3 font-semibold">Date</th>
                  <th className="text-right px-5 py-3 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {state.items.map((order) => (
                  <tr key={order._id} className="border-t border-border/50 hover:bg-bg/50">
                    <td className="px-5 py-3 font-mono text-xs">#{order._id.slice(-8).toUpperCase()}</td>
                    <td className="px-5 py-3">
                      <p className="font-medium">{order.user?.name || 'Guest'}</p>
                      {order.user?.email && <p className="text-xs text-text-muted">{order.user.email}</p>}
                    </td>
                    <td className="px-5 py-3">{order.items.length}</td>
                    <td className="px-5 py-3 font-medium">{formatPrice(order.total)}</td>
                    <td className="px-5 py-3">
                      <StatusPill status={order.payment?.status || 'pending'} map={PAYMENT_STATUS} />
                    </td>
                    <td className="px-5 py-3">
                      <StatusPill status={order.status} map={ORDER_STATUS} />
                    </td>
                    <td className="px-5 py-3 text-xs text-text-light">{new Date(order.createdAt).toLocaleDateString()}</td>
                    <td className="px-5 py-3">
                      <div className="flex justify-end gap-1.5">
                        <Link to={`/admin/documents/new?type=invoice&order=${order._id}`} className="p-2 rounded-lg text-text-light hover:text-accent hover:bg-accent-light transition-colors" title="Generate Invoice"><FileText size={15} /></Link>
                        <button onClick={() => setDetail(order)} className="p-2 rounded-lg text-text-light hover:text-primary hover:bg-primary/10 transition-colors" title="View"><Eye size={15} /></button>
                        <button onClick={() => deleteOrder(order)} className="p-2 rounded-lg text-text-light hover:text-error hover:bg-error/10 transition-colors" title="Delete"><Trash2 size={15} /></button>
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
        title={detail ? `Order #${detail._id.slice(-8).toUpperCase()}` : ''}
        size="lg"
        footer={
          <>
            {detail && detail.status !== 'paid' && (
              <button onClick={() => deleteOrder(detail)} className="btn-outline text-error text-sm hover:bg-error hover:text-white border-error">Delete Order</button>
            )}
            <button onClick={() => setDetail(null)} className="btn-primary text-sm">Close</button>
          </>
        }
      >
        {detail && (
          <div className="space-y-5">
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="rounded-lg bg-bg p-4">
                <p className="text-xs uppercase tracking-wider text-text-muted font-medium mb-1">Customer</p>
                <p className="font-medium">{detail.user?.name || 'Guest'}</p>
                {detail.user?.email && <p className="text-sm text-text-light">{detail.user.email}</p>}
                {detail.user?.phone && <p className="text-sm text-text-light">{detail.user.phone}</p>}
              </div>
              <div className="rounded-lg bg-bg p-4">
                <p className="text-xs uppercase tracking-wider text-text-muted font-medium mb-1">Shipping</p>
                <p className="text-sm">{detail.shippingAddress?.street}</p>
                <p className="text-sm text-text-light">{detail.shippingAddress?.city}, {detail.shippingAddress?.county}</p>
                <p className="text-sm text-text-light">{detail.shippingAddress?.label} · {detail.shippingAddress?.phone || detail.shippingAddress?.country}</p>
              </div>
            </div>

            <div className="grid sm:grid-cols-3 gap-4">
              <div>
                <p className="text-xs uppercase tracking-wider text-text-muted font-medium mb-1">Order Status</p>
                <StatusPill status={detail.status} map={ORDER_STATUS} />
              </div>
              <div>
                <p className="text-xs uppercase tracking-wider text-text-muted font-medium mb-1">Payment</p>
                <StatusPill status={detail.payment?.status || 'pending'} map={PAYMENT_STATUS} />
              </div>
              <div>
                <p className="text-xs uppercase tracking-wider text-text-muted font-medium mb-1">M-Pesa Receipt</p>
                <p className="text-sm font-mono">{detail.payment?.mpesaReceipt || '—'}</p>
              </div>
            </div>

            <div className="rounded-lg border border-border overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-bg text-text-muted uppercase text-xs">
                  <tr>
                    <th className="text-left px-4 py-2.5 font-semibold">Item</th>
                    <th className="text-left px-4 py-2.5 font-semibold">Size / Color</th>
                    <th className="text-right px-4 py-2.5 font-semibold">Qty</th>
                    <th className="text-right px-4 py-2.5 font-semibold">Price</th>
                  </tr>
                </thead>
                <tbody>
                  {detail.items.map((it, idx) => (
                    <tr key={idx} className="border-t border-border/50">
                      <td className="px-4 py-2.5 font-medium">{it.name}</td>
                      <td className="px-4 py-2.5 text-xs text-text-light">{it.size} · {it.color}</td>
                      <td className="px-4 py-2.5 text-right">{it.quantity}</td>
                      <td className="px-4 py-2.5 text-right">{formatPrice(it.price * it.quantity)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex flex-wrap justify-between items-center gap-3">
              <div>
                <p className="text-sm text-text-light">Subtotal <span className="ml-1 font-medium text-text">{formatPrice(detail.subtotal)}</span></p>
                <p className="text-sm text-text-light">Shipping <span className="ml-1 font-medium text-text">{formatPrice(detail.shipping || 0)}</span></p>
                <p className="text-lg font-bold mt-1">Total {formatPrice(detail.total)}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wider text-text-muted font-medium mb-1">Update status</p>
                <select
                  value={detail.status}
                  onChange={(e) => updateStatus(detail._id, e.target.value)}
                  className="input-field w-auto py-2"
                >
                  {Object.keys(ORDER_STATUS).map((s) => <option key={s} value={s}>{ORDER_STATUS[s].label}</option>)}
                </select>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
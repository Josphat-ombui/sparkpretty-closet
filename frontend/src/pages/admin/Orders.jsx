import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { api, formatPrice } from '../../lib/api';
import toast from 'react-hot-toast';

export default function AdminOrders() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    if (!user || user.role !== 'admin') { navigate('/'); return; }
    api.get('/admin/orders').then((r) => setOrders(r.data));
  }, [user, navigate]);

  const updateStatus = async (orderId, status) => {
    await api.put(`/admin/orders/${orderId}/status`, { status });
    setOrders(orders.map((o) => o._id === orderId ? { ...o, status } : o));
    toast.success('Status updated');
  };

  const statusColors = {
    pending: 'bg-warning/10 text-warning',
    paid: 'bg-success/10 text-success',
    shipped: 'bg-primary/10 text-secondary',
    delivered: 'bg-success/10 text-success',
    cancelled: 'bg-error/10 text-error',
  };

  return (
    <div className="section-padding">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <Link to="/admin" className="p-2 hover:text-secondary transition-colors"><ArrowLeft size={20} /></Link>
          <h1 className="font-heading text-3xl font-bold">Orders</h1>
        </div>

        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-bg">
                  <th className="text-left p-3 font-semibold">Order ID</th>
                  <th className="text-left p-3 font-semibold">Customer</th>
                  <th className="text-left p-3 font-semibold">Items</th>
                  <th className="text-left p-3 font-semibold">Total</th>
                  <th className="text-left p-3 font-semibold">Payment</th>
                  <th className="text-left p-3 font-semibold">Status</th>
                  <th className="text-left p-3 font-semibold">Date</th>
                  <th className="text-left p-3 font-semibold">Update</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order._id} className="border-b border-border/50 hover:bg-bg/50">
                    <td className="p-3 font-mono text-xs">#{order._id.slice(-8)}</td>
                    <td className="p-3">{order.user?.name || 'Guest'}</td>
                    <td className="p-3">{order.items.length}</td>
                    <td className="p-3 font-medium">{formatPrice(order.total)}</td>
                    <td className="p-3">
                      <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                        order.payment?.status === 'completed' ? 'bg-success/10 text-success' :
                        order.payment?.status === 'failed' ? 'bg-error/10 text-error' :
                        'bg-warning/10 text-warning'
                      }`}>
                        {order.payment?.status || 'pending'}
                      </span>
                    </td>
                    <td className="p-3">
                      <span className={`text-xs font-medium px-2 py-1 rounded-full ${statusColors[order.status]}`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="p-3 text-text-light text-xs">{new Date(order.createdAt).toLocaleDateString()}</td>
                    <td className="p-3">
                      <select
                        value={order.status}
                        onChange={(e) => updateStatus(order._id, e.target.value)}
                        className="text-xs border border-border rounded-lg px-2 py-1 bg-white focus:ring-2 focus:ring-primary focus:outline-none"
                      >
                        {['pending', 'paid', 'shipped', 'delivered', 'cancelled'].map((s) => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

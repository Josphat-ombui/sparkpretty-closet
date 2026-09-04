import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Package, ShoppingCart, Users, DollarSign, Plus, FileText } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { api, formatPrice } from '../../lib/api';

export default function AdminDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    if (!user || user.role !== 'admin') { navigate('/'); return; }
    api.get('/admin/stats').then((r) => setStats(r.data));
    api.get('/admin/orders').then((r) => setOrders(r.data.slice(0, 5)));
  }, [user, navigate]);

  if (!stats) return <div className="section-padding"><div className="skeleton h-40 w-full" /></div>;

  const cards = [
    { icon: <Package size={24} />, label: 'Products', value: stats.totalProducts, color: '#FF69B4' },
    { icon: <ShoppingCart size={24} />, label: 'Orders', value: stats.totalOrders, color: '#1E90FF' },
    { icon: <Users size={24} />, label: 'Users', value: stats.totalUsers, color: '#FFB6C1' },
    { icon: <DollarSign size={24} />, label: 'Revenue', value: formatPrice(stats.revenue), color: '#10B981' },
    { icon: <FileText size={24} />, label: 'Blog Posts', value: stats.totalBlogs || 0, color: '#6366F1' },
  ];

  return (
    <div className="section-padding">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
          <h1 className="font-heading text-3xl font-bold">Admin Dashboard</h1>
          <div className="flex gap-3 flex-wrap">
            <Link to="/admin/products" className="btn-outline text-sm py-2">Products</Link>
            <Link to="/admin/orders" className="btn-outline text-sm py-2">Orders</Link>
            <Link to="/admin/blog" className="btn-outline text-sm py-2">Blog</Link>
            <Link to="/admin/products/new" className="btn-primary text-sm py-2 flex items-center gap-1"><Plus size={14} /> Add Product</Link>
            <Link to="/admin/blog/new" className="btn-primary text-sm py-2 flex items-center gap-1"><Plus size={14} /> New Post</Link>
          </div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          {cards.map((card, i) => (
            <motion.div
              key={card.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="card flex items-center gap-4"
            >
              <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${card.color}15`, color: card.color }}>
                {card.icon}
              </div>
              <div>
                <p className="text-2xl font-bold">{card.value}</p>
                <p className="text-sm text-text-light">{card.label}</p>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-heading text-xl font-bold">Recent Orders</h2>
            <Link to="/admin/orders" className="text-secondary text-sm font-medium hover:underline">View All</Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left p-3 font-semibold" scope="col">Order ID</th>
                  <th className="text-left p-3 font-semibold" scope="col">Customer</th>
                  <th className="text-left p-3 font-semibold" scope="col">Total</th>
                  <th className="text-left p-3 font-semibold" scope="col">Status</th>
                  <th className="text-left p-3 font-semibold" scope="col">Date</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order._id} className="border-b border-border/50 hover:bg-bg/50">
                    <td className="p-3 font-mono text-xs">#{order._id.slice(-8)}</td>
                    <td className="p-3">{order.user?.name || 'Guest'}</td>
                    <td className="p-3 font-medium">{formatPrice(order.total)}</td>
                    <td className="p-3">
                      <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                        order.status === 'paid' ? 'bg-success/10 text-success' :
                        order.status === 'pending' ? 'bg-warning/10 text-warning' :
                        order.status === 'cancelled' ? 'bg-error/10 text-error' :
                        'bg-primary/10 text-secondary'
                      }`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="p-3 text-text-light">{new Date(order.createdAt).toLocaleDateString()}</td>
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

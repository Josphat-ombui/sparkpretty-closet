import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Package, ShoppingCart, Users, DollarSign, FileText, Mail,
  MessageSquare, TrendingUp, AlertTriangle, Clock,
} from 'lucide-react';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import { api, formatPrice } from '../../lib/api';
import { useAuth } from '../../context/AuthContext';
import { Card, PageHeader, Pagination, ORDER_STATUS } from '../../components/admin/ui.jsx';

const statCards = [
  { key: 'revenue', label: 'Total Revenue', icon: DollarSign, color: 'success', secondary: (d) => `${d.todayOrders ?? 0} orders today`, format: true },
  { key: 'totalOrders', label: 'Orders', icon: ShoppingCart, color: 'primary' },
  { key: 'totalProducts', label: 'Products', icon: Package, color: 'secondary', link: '/admin/products' },
  { key: 'totalUsers', label: 'Customers', icon: Users, color: 'accent', link: '/admin/users' },
  { key: 'totalBlogs', label: 'Blog Posts', icon: FileText, color: 'warning', link: '/admin/blog' },
  { key: 'totalSubscribers', label: 'Subscribers', icon: Mail, color: 'primary', link: '/admin/subscribers' },
  { key: 'unreadContacts', label: 'Unread Messages', icon: MessageSquare, color: 'error', link: '/admin/contacts' },
  { key: 'lowStock', label: 'Low Stock Items', icon: AlertTriangle, color: 'warning', link: '/admin/products' },
];

const PIE_COLORS = ['#C2185B', '#D4A574', '#10B981', '#F59E0B', '#EF4444', '#6B7280'];

function StatCard({ stat, value, config }) {
  const Icon = stat.icon;
  const text = stat.format ? formatPrice(value) : value;
  const cls = {
    revenue: 'text-success', totalOrders: 'text-primary', totalProducts: 'text-secondary',
    totalUsers: 'text-accent', totalBlogs: 'text-warning', totalSubscribers: 'text-primary',
    unreadContacts: 'text-error', lowStock: 'text-warning',
  };
  const clsText = `bg-${stat.color}/10 ${cls[stat.key]}`;
  const inner = (
    <div className={`card ${stat.link ? 'hover:shadow-card-hover transition-shadow cursor-pointer' : ''} p-5 flex items-center gap-4`}>
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${clsText}`}>
        <Icon size={22} />
      </div>
      <div className="min-w-0">
        <p className="text-xs uppercase tracking-wider text-text-muted font-medium">{stat.label}</p>
        <p className="text-2xl font-bold mt-0.5">{text}</p>
        {stat.secondary && <p className="text-xs text-text-light mt-0.5">{stat.secondary(value)}</p>}
      </div>
    </div>
  );
  return stat.link ? <Link to={stat.link} className="block">{inner}</Link> : inner;
}

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [sales, setSales] = useState(null);
  const [topProducts, setTopProducts] = useState([]);
  const [orderBreakdown, setOrderBreakdown] = useState([]);
  const [orders, setOrders] = useState({ items: [], total: 0, page: 1, pages: 1 });
  const [loading, setLoading] = useState(true);
  const [days, setDays] = useState(30);

  const loadAnalytics = (d) => {
    api.get('/admin/analytics/sales?days=' + d).then((r) => setSales(r.data)).catch(() => {});
  };

  useEffect(() => {
    api.get('/admin/stats').then((r) => setStats(r.data)).catch(() => {});
    api.get('/admin/analytics/top-products').then((r) => setTopProducts(r.data || [])).catch(() => {});
    api.get('/admin/analytics/orders').then((r) => setOrderBreakdown(r.data || [])).catch(() => {});
    loadAnalytics(days);
    api.get('/admin/orders?page=1&limit=6').then((r) => setOrders({ items: r.data.items || [], total: r.data.total, page: r.data.page, pages: r.data.pages })).catch(() => {});
    setLoading(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const today = new Date().toISOString().slice(0, 10);
  const greeting = (() => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
  })();

  if (loading) {
    return <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4"><div className="skeleton h-32" /><div className="skeleton h-32" /><div className="skeleton h-32" /><div className="skeleton h-32" /></div>;
  }

  const statusSeries = orderBreakdown.map((row) => ({
    name: row._id ? row._id : 'unknown',
    value: row.count,
    label: ORDER_STATUS[row._id]?.label || row._id || 'unknown',
  }));

  return (
    <div>
      <PageHeader
        title={`${greeting}, ${user?.name?.split(' ')[0] || 'Admin'}`}
        subtitle={`Sales overview for ${today}`}
        actions={
          <div className="flex items-center gap-2">
            {[7, 30, 90].map((d) => (
              <button
                key={d}
                onClick={() => { setDays(d); loadAnalytics(d); }}
                className={`px-3 py-1.5 text-sm rounded-lg border transition-colors ${days === d ? 'bg-primary text-white border-primary' : 'border-border text-text-light hover:bg-bg'}`}
              >
                {d}D
              </button>
            ))}
          </div>
        }
      />

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {statCards.map((stat) => (
          <StatCard key={stat.key} stat={stat} value={stats?.[stat.key] ?? 0} config={{}} />
        ))}
      </div>

      {/* Charts */}
      <div className="grid lg:grid-cols-3 gap-5 mt-6">
        <Card className="lg:col-span-2" pad={false}>
          <div className="px-5 py-4 border-b border-border flex items-center justify-between">
            <h2 className="font-heading text-lg font-semibold flex items-center gap-2"><TrendingUp size={18} /> Revenue (last {days} days)</h2>
          </div>
          <div className="p-4 h-72">
            {sales?.series?.length ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={sales.series} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F3E8E8" />
                  <XAxis dataKey="date" tick={{ fontSize: 11 }} tickLine={false} axisLine={{ stroke: '#F3E8E8' }} />
                  <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v} width={40} />
                  <Tooltip formatter={(v) => formatPrice(v)} />
                  <Line type="monotone" dataKey="revenue" stroke="#C2185B" strokeWidth={2.5} dot={false} activeDot={{ r: 5 }} />
                </LineChart>
              </ResponsiveContainer>
            ) : <div className="h-full flex items-center justify-center text-text-muted text-sm">No sales data in this period</div>}
          </div>
        </Card>

        <Card pad={false}>
          <div className="px-5 py-4 border-b border-border">
            <h2 className="font-heading text-lg font-semibold">Orders by Status</h2>
          </div>
          <div className="p-4 h-72">
            {statusSeries.length ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={statusSeries} dataKey="value" nameKey="label" cx="50%" cy="50%" outerRadius={90} label>
                    {statusSeries.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : <div className="h-full flex items-center justify-center text-text-muted text-sm">No orders yet</div>}
          </div>
        </Card>
      </div>

      {/* Bottom row */}
      <div className="grid lg:grid-cols-3 gap-5 mt-6">
        <Card pad={false} className="lg:col-span-2">
          <div className="px-5 py-4 border-b border-border flex items-center justify-between">
            <h2 className="font-heading text-lg font-semibold">Recent Orders</h2>
            <Link to="/admin/orders" className="text-sm text-primary hover:underline font-medium">View all</Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-bg text-text-muted uppercase text-xs">
                <tr>
                  <th className="text-left px-5 py-3 font-semibold">Order</th>
                  <th className="text-left px-5 py-3 font-semibold">Customer</th>
                  <th className="text-left px-5 py-3 font-semibold">Total</th>
                  <th className="text-left px-5 py-3 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody>
                {orders.items.map((o) => (
                  <tr key={o._id} className="border-t border-border/50 hover:bg-bg/50">
                    <td className="px-5 py-3 font-mono text-xs text-text-light">{o._id.slice(-8).toUpperCase()}</td>
                    <td className="px-5 py-3">{o.user?.name || 'Guest'}</td>
                    <td className="px-5 py-3 font-semibold">{formatPrice(o.total)}</td>
                    <td className="px-5 py-3">
                      <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${ORDER_STATUS[o.status]?.bg} ${ORDER_STATUS[o.status]?.color}`}>
                        {ORDER_STATUS[o.status]?.label || o.status}
                      </span>
                    </td>
                  </tr>
                ))}
                {!orders.items.length && (
                  <tr><td colSpan={4} className="px-5 py-10 text-center text-text-muted">No orders yet</td></tr>
                )}
              </tbody>
            </table>
          </div>
          {orders.pages > 1 && (
            <div className="px-5 pb-4">
              <Pagination page={orders.page} pages={orders.pages} total={orders.total} onPage={(p) => {
                api.get(`/admin/orders?page=${p}&limit=6`).then((r) => setOrders({ items: r.data.items || [], total: r.data.total, page: r.data.page, pages: r.data.pages }));
              }} />
            </div>
          )}
        </Card>

        <Card pad={false}>
          <div className="px-5 py-4 border-b border-border">
            <h2 className="font-heading text-lg font-semibold">Top Products</h2>
          </div>
          <div className="p-4 h-72">
            {topProducts.length ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={topProducts} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F3E8E8" />
                  <XAxis dataKey="_id" tick={{ fontSize: 10 }} tickLine={false} interval={0} angle={-20} height={50} />
                  <YAxis tick={{ fontSize: 11 }} allowDecimals={false} width={26} />
                  <Tooltip formatter={(v, n) => [n === 'quantity' ? `${v} sold` : v, null]} />
                  <Bar dataKey="quantity" fill="#D4A574" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : <div className="h-full flex items-center justify-center text-text-muted text-sm">No sales yet</div>}
          </div>
        </Card>
      </div>
    </div>
  );
}
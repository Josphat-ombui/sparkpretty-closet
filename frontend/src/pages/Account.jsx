import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { User, Package, MapPin, Shield, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api, formatPrice } from '../lib/api';

export default function Account() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [tab, setTab] = useState('profile');

  useEffect(() => {
    if (!user) { navigate('/login'); return; }
    api.get('/orders').then((r) => setOrders(r.data));
  }, [user, navigate]);

  if (!user) return null;

  const statusColors = {
    pending: 'bg-warning/10 text-warning',
    paid: 'bg-success/10 text-success',
    shipped: 'bg-primary/10 text-secondary',
    delivered: 'bg-success/10 text-success',
    cancelled: 'bg-error/10 text-error',
  };

  return (
    <div className="section-padding">
      <div className="max-w-5xl mx-auto">
        <h1 className="font-heading text-3xl font-bold mb-8">My Account</h1>
        <div className="flex flex-col md:flex-row gap-8">
          {/* Sidebar */}
          <div className="md:w-64 flex-shrink-0">
            <div className="card space-y-1">
              {[
                { key: 'profile', icon: <User size={18} />, label: 'Profile' },
                { key: 'orders', icon: <Package size={18} />, label: 'Orders' },
                { key: 'addresses', icon: <MapPin size={18} />, label: 'Addresses' },
              ].map((item) => (
                <button
                  key={item.key}
                  onClick={() => setTab(item.key)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                    tab === item.key ? 'bg-primary/10 text-primary-dark' : 'text-text-light hover:bg-bg'
                  }`}
                >
                  {item.icon} {item.label}
                </button>
              ))}
              {user.role === 'admin' && (
                <Link to="/admin" className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-primary-dark bg-primary/5 hover:bg-primary/10 transition-all">
                  <Shield size={18} /> Admin Dashboard
                </Link>
              )}
              <button onClick={() => { logout(); navigate('/'); }} className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-error hover:bg-error/5 transition-all">
                <LogOut size={18} /> Sign Out
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1">
            <motion.div key={tab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
              {tab === 'profile' && (
                <div className="card">
                  <h2 className="font-heading text-xl font-bold mb-4">Profile</h2>
                  <div className="space-y-3 text-sm">
                    <p><span className="text-text-light">Name:</span> {user.name}</p>
                    <p><span className="text-text-light">Email:</span> {user.email}</p>
                    <p><span className="text-text-light">Phone:</span> {user.phone || 'Not set'}</p>
                  </div>
                </div>
              )}

              {tab === 'orders' && (
                <div className="space-y-4">
                  <h2 className="font-heading text-xl font-bold">Orders</h2>
                  {orders.length === 0 ? (
                    <div className="card text-center py-12 text-text-light">No orders yet</div>
                  ) : orders.map((order) => (
                    <div key={order._id} className="card">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <p className="text-sm text-text-light">Order #{order._id.slice(-8)}</p>
                          <p className="text-xs text-text-muted">{new Date(order.createdAt).toLocaleDateString()}</p>
                        </div>
                        <span className={`text-xs font-medium px-3 py-1 rounded-full ${statusColors[order.status]}`}>
                          {order.status}
                        </span>
                      </div>
                      <div className="space-y-1 text-sm">
                        {order.items.map((item, i) => (
                          <div key={i} className="flex justify-between">
                            <span className="text-text-light">{item.name} x{item.quantity}</span>
                            <span>{formatPrice(item.price * item.quantity)}</span>
                          </div>
                        ))}
                      </div>
                      <div className="border-t border-border mt-3 pt-3 flex justify-between font-bold">
                        <span>Total</span>
                        <span className="text-text">{formatPrice(order.total)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {tab === 'addresses' && (
                <div className="card">
                  <h2 className="font-heading text-xl font-bold mb-4">Saved Addresses</h2>
                  <p className="text-text-light text-sm">Addresses saved during checkout will appear here.</p>
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}

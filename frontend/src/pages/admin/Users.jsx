import { useEffect, useState } from 'react';
import { UserPlus, Search, Trash2, Shield, ShieldOff, Pencil } from 'lucide-react';
import toast from 'react-hot-toast';
import { api } from '../../lib/api';
import { Card, PageHeader, Pagination, EmptyState, Modal } from '../../components/admin/ui.jsx';

export default function Users() {
  const [users, setUsers] = useState({ items: [], total: 0, page: 1, pages: 1 });
  const [search, setSearch] = useState('');
  const [role, setRole] = useState('');
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: '', email: '', phone: '', role: 'customer', password: '' });

  const load = (p = 1) => {
    setLoading(true);
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    if (role) params.set('role', role);
    params.set('page', p);
    api.get(`/admin/users?${params.toString()}`).then((r) => setUsers(r.data)).catch(() => toast.error('Failed to load users')).finally(() => setLoading(false));
  };

  useEffect(() => { load(1); /* eslint-disable-next-line */ }, [query, role]);

  const deleteUser = async (u) => {
    if (!window.confirm(`Delete user ${u.name}? This cannot be undone.`)) return;
    try {
      await api.delete(`/admin/users/${u._id}`);
      toast.success('User deleted');
      load(users.page);
    } catch (err) {
      toast.error(err.message || 'Delete failed');
    }
  };

  const toggleRole = async (u) => {
    const next = u.role === 'admin' ? 'customer' : 'admin';
    try {
      await api.put(`/admin/users/${u._id}`, { role: next });
      toast.success(next === 'admin' ? 'Promoted to admin' : 'Removed admin access');
      load(users.page);
    } catch (err) {
      toast.error(err.message || 'Update failed');
    }
  };

  const openEdit = (u) => {
    setEditing(u._id);
    setForm({ name: u.name, email: u.email, phone: u.phone || '', role: u.role, password: '' });
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email) return toast.error('Name and email are required');
    if (editing && !form.password) {
      const { password, ...rest } = form;
      try { await api.put(`/admin/users/${editing}`, rest); toast.success('User updated'); setEditing(null); setShowAdd(false); load(users.page); }
      catch (err) { toast.error(err.message || 'Update failed'); }
      return;
    }
    if (!editing && !form.password) return toast.error('Password is required for new users');
    try {
      if (editing) {
        await api.put(`/admin/users/${editing}`, form);
        toast.success('User updated');
      } else {
        await api.post('/admin/users', form);
        toast.success('User created');
      }
      setForm({ name: '', email: '', phone: '', role: 'customer', password: '' });
      setEditing(null);
      setShowAdd(false);
      load(users.page);
    } catch (err) {
      toast.error(err.message || 'Save failed');
    }
  };

  return (
    <div>
      <PageHeader
        title="Users"
        subtitle="Manage customers and admin accounts"
        actions={<button onClick={() => { setEditing(null); setShowAdd(true); }} className="btn-primary flex items-center gap-2 text-sm"><UserPlus size={16} /> Add User</button>}
      />

      <Card pad={false}>
        <div className="p-4 border-b border-border flex flex-wrap gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
            <input
              className="input-field pl-9"
              placeholder="Search by name, email, or phone..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && setQuery(search)}
            />
          </div>
          <select value={role} onChange={(e) => setRole(e.target.value)} className="input-field w-auto">
            <option value="">All roles</option>
            <option value="customer">Customer</option>
            <option value="admin">Admin</option>
          </select>
          <button onClick={() => setQuery(search)} className="btn-outline text-sm px-4">Search</button>
        </div>

        {loading ? (
          <div className="p-5 space-y-3"><div className="skeleton h-12" /><div className="skeleton h-12" /><div className="skeleton h-12" /></div>
        ) : users.items.length === 0 ? (
          <EmptyState title="No users found" message="Try adjusting your search or role filter." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-bg text-text-muted uppercase text-xs">
                <tr>
                  <th className="text-left px-5 py-3 font-semibold">User</th>
                  <th className="text-left px-5 py-3 font-semibold">Contact</th>
                  <th className="text-left px-5 py-3 font-semibold">Role</th>
                  <th className="text-left px-5 py-3 font-semibold">Joined</th>
                  <th className="text-right px-5 py-3 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.items.map((u) => (
                  <tr key={u._id} className="border-t border-border/50 hover:bg-bg/50">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full gradient-hero flex items-center justify-center text-white font-semibold text-xs shrink-0">
                          {u.name?.charAt(0)?.toUpperCase()}
                        </div>
                        <div>
                          <p className="font-medium">{u.name}</p>
                          <p className="text-xs text-text-muted">#{String(u._id).slice(-6).toUpperCase()}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3">
                      <p className="text-xs">{u.email}</p>
                      {u.phone && <p className="text-xs text-text-muted">{u.phone}</p>}
                    </td>
                    <td className="px-5 py-3">
                      <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${u.role === 'admin' ? 'bg-primary/10 text-primary-dark' : 'bg-bg text-text-light'}`}>
                        {u.role === 'admin' ? 'Admin' : 'Customer'}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-xs text-text-light">{new Date(u.createdAt).toLocaleDateString()}</td>
                    <td className="px-5 py-3">
                      <div className="flex justify-end gap-1.5">
                        <button onClick={() => openEdit(u)} className="p-2 rounded-lg text-text-light hover:text-primary hover:bg-primary/10 transition-colors" title="Edit"><Pencil size={15} /></button>
                        <button onClick={() => toggleRole(u)} className={`p-2 rounded-lg transition-colors ${u.role === 'admin' ? 'text-text-light hover:text-warning hover:bg-warning/10' : 'text-text-light hover:text-primary-dark hover:bg-primary/10'}`} title={u.role === 'admin' ? 'Remove admin' : 'Make admin'}>
                          {u.role === 'admin' ? <ShieldOff size={15} /> : <Shield size={15} />}
                        </button>
                        <button onClick={() => deleteUser(u)} className="p-2 rounded-lg text-text-light hover:text-error hover:bg-error/10 transition-colors" title="Delete"><Trash2 size={15} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {users.pages > 1 && (
          <div className="px-5 pb-4"><Pagination page={users.page} pages={users.pages} total={users.total} onPage={load} /></div>
        )}
      </Card>

      <Modal
        open={showAdd}
        onClose={() => { setShowAdd(false); setEditing(null); }}
        title={editing ? 'Edit User' : 'Add User'}
        size="sm"
        footer={
          <>
            <button onClick={() => { setShowAdd(false); setEditing(null); }} className="btn-outline text-sm">Cancel</button>
            <button type="submit" form="user-form" className="btn-primary text-sm">{editing ? 'Save Changes' : 'Create User'}</button>
          </>
        }
      >
        <form id="user-form" onSubmit={submit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1.5">Full Name</label>
            <input className="input-field" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5">Email</label>
            <input type="email" className="input-field" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5">Phone</label>
            <input className="input-field" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="+254..." />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5">Role</label>
            <select className="input-field" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
              <option value="customer">Customer</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5">{editing ? 'New Password (leave blank to keep)' : 'Password'}</label>
            <input type="password" className="input-field" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder={editing ? '••••••••' : ''} required={!editing} />
          </div>
        </form>
      </Modal>
    </div>
  );
}
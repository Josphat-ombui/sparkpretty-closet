import { useState } from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Package, ShoppingCart, Users, MessageSquare,
  FileText, PenLine, Mail, Image, Settings, LogOut, Menu, X,
  Heart, ExternalLink, Store,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme, THEMES, THEME_ORDER } from '../context/ThemeContext';
import { Check } from 'lucide-react';

const navSections = [
  {
    label: 'Overview',
    items: [
      { to: '/admin', label: 'Dashboard', icon: LayoutDashboard, end: true },
    ],
  },
  {
    label: 'Commerce',
    items: [
      { to: '/admin/products', label: 'Products', icon: Package },
      { to: '/admin/categories', label: 'Categories', icon: Store },
      { to: '/admin/orders', label: 'Orders', icon: ShoppingCart },
    ],
  },
  {
    label: 'Content',
    items: [
      { to: '/admin/blog', label: 'Blog Posts', icon: FileText },
      { to: '/admin/banners', label: 'Banners', icon: Image },
      { to: '/admin/settings', label: 'Site Settings', icon: Settings },
    ],
  },
  {
    label: 'Marketing',
    items: [
      { to: '/admin/subscribers', label: 'Subscribers', icon: Mail },
      { to: '/admin/contacts', label: 'Messages', icon: MessageSquare },
    ],
  },
  {
    label: 'Accounts',
    items: [
      { to: '/admin/users', label: 'Users', icon: Users },
    ],
  },
];

export default function AdminLayout({ children }) {
  const { user, logout } = useAuth();
  const { theme, setTheme } = useTheme();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const SidebarContent = (
    <div className="flex flex-col h-full bg-white border-r border-border">
      <div className="px-5 py-5 border-b border-border flex items-center justify-between">
        <Link to="/admin" className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-lg gradient-hero flex items-center justify-center">
            <Heart size={18} className="text-white" />
          </div>
          <div>
            <p className="font-heading font-bold text-lg leading-none">Sparkpretty</p>
            <p className="text-xs text-text-muted mt-1 tracking-wide uppercase">Admin Panel</p>
          </div>
        </Link>
        <button onClick={() => setOpen(false)} className="lg:hidden p-1 text-text-light hover:text-text">
          <X size={20} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
        {navSections.map((section) => (
          <div key={section.label}>
            <p className="px-3 mb-1 text-[11px] font-semibold uppercase tracking-widest text-text-muted">{section.label}</p>
            <nav className="space-y-0.5">
              {section.items.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    end={item.end}
                    onClick={() => setOpen(false)}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                        isActive
                          ? 'bg-primary/10 text-primary-dark'
                          : 'text-text-light hover:bg-bg hover:text-text'
                      }`
                    }
                  >
                    <Icon size={17} className={({ isActive }) => (isActive ? 'text-primary' : '')} />
                    <span>{item.label}</span>
                  </NavLink>
                );
              })}
            </nav>
          </div>
        ))}
      </div>

      <div className="border-t border-border px-3 pt-3 pb-2">
        <p className="px-1 mb-2 text-[11px] font-semibold uppercase tracking-widest text-text-muted">Theme preview</p>
        <div className="flex items-center gap-2 px-1">
          {THEME_ORDER.map((id) => (
            <button
              key={id}
              onClick={() => setTheme(id)}
              title={`${THEMES[id].label} theme`}
              aria-label={`Switch to ${THEMES[id].label} theme`}
              className="relative w-8 h-8 rounded-full border-2 border-white shadow hover:scale-110 transition-transform focus:outline-none focus:ring-2 focus:ring-primary"
              style={{ backgroundColor: THEMES[id].swatch }}
            >
              {theme === id && <Check size={14} className="absolute inset-0 m-auto text-white drop-shadow" />}
            </button>
          ))}
        </div>
      </div>
      <div className="border-t border-border p-3 space-y-1">
        <Link to="/" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-text-light hover:bg-bg transition-colors">
          <ExternalLink size={17} /> View Store
        </Link>
        <div className="px-3 py-3 rounded-lg bg-bg flex items-center gap-3">
          <div className="w-9 h-9 rounded-full gradient-hero flex items-center justify-center text-white font-semibold text-sm">
            {user?.name?.charAt(0)?.toUpperCase() || 'A'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold truncate">{user?.name}</p>
            <p className="text-xs text-text-muted truncate">{user?.email}</p>
          </div>
          <button onClick={handleLogout} title="Sign out" className="p-1.5 text-text-light hover:text-error rounded-lg hover:bg-error/10">
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-[75vh] lg:flex">
      {/* Desktop sidebar */}
      <aside className="hidden lg:block w-64 shrink-0 border-r border-border lg:h-[calc(100vh-137px)] lg:sticky lg:top-[137px]">
        {SidebarContent}
      </aside>

      {/* Mobile top bar + drawer */}
      <div className="lg:hidden sticky top-0 z-40 bg-white border-b border-border px-4 py-3 flex items-center justify-between">
        <button
          onClick={() => setOpen(true)}
          className="p-2 rounded-lg border border-border text-text-light hover:text-text"
          aria-label="Open admin menu"
        >
          <Menu size={20} />
        </button>
        <span className="font-heading font-bold">Admin Panel</span>
        <div className="w-9" />
      </div>
      {open && (
        <div className="lg:hidden fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/40" onClick={() => setOpen(false)} />
          <div className="absolute inset-y-0 left-0 w-72 max-w-[80%] shadow-modal">
            {SidebarContent}
          </div>
        </div>
      )}

      <main className="flex-1 min-w-0">
        <div className="px-4 sm:px-6 lg:px-8 py-8">{children}</div>
      </main>
    </div>
  );
}
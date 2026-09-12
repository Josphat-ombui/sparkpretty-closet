import { useState } from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Package, ShoppingCart, Users, MessageSquare,
  FileText, PenLine, Mail, Image, Settings, LogOut, Menu, X,
  Heart, ExternalLink, Store, Edit3, FileText as DocIcon,
} from 'lucide-react';
import Logo from './Logo';
import { useAuth } from '../context/AuthContext';
import { useContent } from '../context/ContentContext';
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
    label: 'Business',
    items: [
      { to: '/admin/documents', label: 'Documents', icon: DocIcon, end: false },
    ],
  },
  {
    label: 'Content',
    items: [
      { to: '/admin/content', label: 'Content Manager', icon: Edit3 },
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

function SidebarLink({ item, onClick }) {
  const Icon = item.icon;
  return (
    <NavLink
      to={item.to}
      end={item.end}
      onClick={onClick}
      className={({ isActive }) =>
        `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
          isActive
            ? 'text-white'
            : 'text-text-light hover:bg-bg hover:text-text'
        }`
      }
      style={({ isActive }) => (isActive ? { backgroundColor: 'var(--primary)' } : undefined)}
    >
      <Icon size={17} />
      <span>{item.label}</span>
      {item.end && (
        <span className="ml-auto w-1.5 h-1.5 rounded-full" style={{ backgroundColor: 'var(--primary)' }} />
      )}
    </NavLink>
  );
}

export default function AdminLayout({ children }) {
  const { user, logout } = useAuth();
  const { get } = useContent();
  const { theme, setTheme } = useTheme();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const brandFirst = get('site_name', 'Sparkpretty Closet').split(/\s+/)[0] || 'Sparkpretty';

  const SidebarContent = (
    <div className="flex flex-col h-full bg-white border-r border-border">
      <div className="px-5 py-5 border-b border-border flex items-center justify-between">
        <Link to={user?.role === 'editor' ? '/admin/content' : '/admin'} className="flex items-center gap-2">
          <Logo size={40} name={brandFirst} sub="Admin Panel" showWordmark={false} />
          <div className="leading-none">
            <p className="font-heading font-bold text-[15px]">{brandFirst}</p>
            <p className="text-[10px] text-text-muted tracking-[0.18em] uppercase mt-1">{user?.role === 'editor' ? 'Editor Panel' : 'Admin Panel'}</p>
          </div>
        </Link>
        <button onClick={() => setOpen(false)} className="lg:hidden p-1 text-text-light hover:text-text">
          <X size={20} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
        {navSections.filter((section) => {
          if (user?.role === 'editor') {
            return section.label === 'Content';
          }
          return true;
        }).map((section) => (
          <div key={section.label}>
            <p className="px-3 mb-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-text-muted">{section.label}</p>
            <nav className="space-y-0.5">
              {section.items.map((item) => (
                <SidebarLink key={item.to + item.label} item={item} onClick={() => setOpen(false)} />
              ))}
            </nav>
          </div>
        ))}
      </div>

      <div className="border-t border-border px-3 pt-3 pb-2">
        <p className="px-1 mb-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-text-muted">Theme preview</p>
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
          <div className="w-9 h-9 rounded-full flex items-center justify-center text-white font-semibold text-sm" style={{ backgroundColor: 'var(--primary)' }}>
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
      <aside className="hidden lg:block w-64 shrink-0 border-r border-border lg:h-[calc(100vh-137px)] lg:sticky lg:top-[137px] no-print">
        {SidebarContent}
      </aside>

      {/* Mobile top bar + drawer */}
      <div className="lg:hidden sticky top-0 z-40 bg-white border-b border-border px-4 py-3 flex items-center justify-between no-print">
        <button
          onClick={() => setOpen(true)}
          className="p-2 rounded-lg border border-border text-text-light hover:text-text"
          aria-label="Open admin menu"
        >
          <Menu size={20} />
        </button>
        <span className="font-heading font-bold">{get('site_name', 'Sparkpretty')}</span>
        <div className="w-9" />
      </div>
      {open && (
        <div className="lg:hidden fixed inset-0 z-50 no-print">
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
import { useState, useEffect, useCallback, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Plus, Search, Star, Eye, Pencil, Copy, Trash2, X, Check,
  ChevronUp, ChevronDown, ChevronsUpDown, AlertTriangle, PackageOpen,
  Layers, Star as StarIcon, ArrowDownUp,
} from 'lucide-react';
import { api, formatPrice } from '../../lib/api';
import toast from 'react-hot-toast';
import { Card, Pagination, EmptyState, Modal } from '../../components/admin/ui.jsx';

const PAGE_SIZE = 12;

const TABS = [
  { id: 'all', label: 'All products', key: null },
  { id: 'active', label: 'Active', key: 'active' },
  { id: 'featured', label: 'Featured', key: 'featured' },
  { id: 'low', label: 'Low stock', key: 'low' },
  { id: 'out', label: 'Out of stock', key: 'out' },
];

const SORT_KEYS = {
  '': { label: 'Recently added', dir: null },
  name_asc: { label: 'Name A–Z', dir: 'asc' },
  name_desc: { label: 'Name Z–A', dir: 'desc' },
  price_asc: { label: 'Price low–high', dir: 'asc' },
  price_desc: { label: 'Price high–low', dir: 'desc' },
  stock_desc: { label: 'Most stock', dir: 'desc' },
  stock_asc: { label: 'Least stock', dir: 'asc' },
};

function StockBadge({ stock }) {
  if (stock <= 0) return <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-error/10 text-error">Out</span>;
  if (stock <= 5) return <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-warning/10 text-warning">Low</span>;
  return <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-success/10 text-success">In stock</span>;
}

export default function AdminProducts() {
  const navigate = useNavigate();
  const [state, setState] = useState({ items: [], total: 0, page: 1, pages: 1 });
  const [stats, setStats] = useState({ total: 0, active: 0, featured: 0, lowStock: 0, outOfStock: 0, variants: 0, unitsInStock: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [cats, setCats] = useState([]);

  const [tab, setTab] = useState('all');
  const [search, setSearch] = useState('');
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('');
  const [sort, setSort] = useState('');
  const [selected, setSelected] = useState(new Set());
  const [confirm, setConfirm] = useState(null); // { type: 'delete', product } | { type: 'bulk' }
  const [moveOpen, setMoveOpen] = useState(false);
  const [moveCategory, setMoveCategory] = useState('');

  const tabKey = TABS.find((t) => t.id === tab)?.key;

  const load = useCallback((p = 1) => {
    setLoading(true);
    setError('');
    const params = new URLSearchParams();
    if (query) params.set('search', query);
    if (category) params.set('category', category);
    if (tabKey === 'active') params.set('status', 'active');
    if (tabKey === 'featured') params.set('featured', 'true');
    if (tabKey === 'low') params.set('stock', 'low');
    if (tabKey === 'out') params.set('stock', 'out');
    if (sort) params.set('sort', sort);
    params.set('page', p);
    params.set('limit', PAGE_SIZE);
    api.get(`/admin/products?${params.toString()}`)
      .then((r) => setState(r.data))
      .catch(() => setError('Could not load products. The server may be asleep — please retry.'))
      .finally(() => setLoading(false));
  }, [query, category, tabKey, sort]);

  const loadStats = useCallback(() => {
    api.get('/admin/products/stats').then((r) => setStats(r.data || {})).catch(() => {});
  }, []);

  useEffect(() => {
    load(1);
    setSelected(new Set());
  }, [load]);

  useEffect(() => {
    loadStats();
    Promise.all([
      api.get('/admin/categories').then((r) => r.data || []),
    ]).then(([c]) => setCats(c)).catch(() => {});
  }, [loadStats]);

  const allOnPageSelected = state.items.length > 0 && state.items.every((p) => selected.has(p._id));

  const toggleSelect = (id) => setSelected((prev) => {
    const next = new Set(prev);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    return next;
  });

  const toggleSelectAll = () => {
    if (allOnPageSelected) {
      setSelected((prev) => {
        const next = new Set(prev);
        state.items.forEach((p) => next.delete(p._id));
        return next;
      });
    } else {
      setSelected((prev) => new Set([...prev, ...state.items.map((p) => p._id)]));
    }
  };

  const clearSelection = () => setSelected(new Set());

  const patrol = (id, patch) => setState((s) => ({
    ...s,
    items: s.items.map((p) => (p._id === id ? { ...p, ...patch } : p)),
  }));

  const toggleField = async (product, field) => {
    const next = !product[field];
    patrol(product._id, { [field]: next });
    try {
      await api.patch(`/admin/products/${product._id}`, { [field]: next });
      toast.success(`${field === 'active' ? 'Visibility' : 'Featured'} updated`);
      loadStats();
    } catch (err) {
      patrol(product._id, { [field]: !next });
      toast.error(err.message || 'Update failed');
    }
  };

  const handleDeleteOne = async () => {
    try {
      await api.delete(`/admin/products/${confirm.product._id}`);
      toast.success('Product deleted');
      setConfirm(null);
      clearSelection();
      load(state.page === 1 ? 1 : Math.max(1, state.items.length === 1 ? state.page - 1 : state.page));
      loadStats();
    } catch (err) {
      toast.error(err.message || 'Delete failed');
    }
  };

  const handleBulkDelete = async () => {
    try {
      const { deleted } = (await api.post('/admin/products/bulk/delete', { ids: [...selected] })).data;
      toast.success(`${deleted} product(s) deleted`);
      setConfirm(null);
      clearSelection();
      load(1);
      loadStats();
    } catch (err) {
      toast.error(err.message || 'Bulk delete failed');
    }
  };

  const bulkStatus = async (active) => {
    if (selected.size === 0) return;
    try {
      await api.post('/admin/products/bulk/status', { ids: [...selected], active });
      toast.success(`Marked ${selected.size} product(s) ${active ? 'active' : 'inactive'}`);
      clearSelection();
      load(state.page);
      loadStats();
    } catch (err) {
      toast.error(err.message || 'Bulk update failed');
    }
  };

  const handleBulkCategory = async () => {
    if (!moveCategory) return toast.error('Choose a category first');
    try {
      await api.put('/admin/products/bulk/category', { ids: [...selected], category: moveCategory });
      toast.success(`Moved ${selected.size} product(s)`);
      setMoveOpen(false);
      setMoveCategory('');
      clearSelection();
      load(state.page);
    } catch (err) {
      toast.error(err.message || 'Bulk move failed');
    }
  };

  const duplicate = async (product) => {
    try {
      const created = (await api.post(`/admin/products/${product._id}/duplicate`)).data;
      toast.success('Product duplicated');
      navigate(`/admin/products/${created._id}/edit`);
    } catch (err) {
      toast.error(err.message || 'Duplicate failed');
    }
  };

  const visited = useMemo(() => {
    const counts = { total: stats.total, active: stats.active, featured: stats.featured, low: stats.lowStock, out: stats.outOfStock };
    return TABS.map((t) => ({ ...t, count: counts[t.key || 'total'] ?? 0 }));
  }, [stats]);

  const statCards = [
    { label: 'Total products', value: stats.total, icon: PackageOpen, tone: 'bg-primary/10 text-primary' },
    { label: 'Active in store', value: stats.active, icon: Check, tone: 'bg-success/10 text-success' },
    { label: 'Featured', value: stats.featured, icon: StarIcon, tone: 'bg-warning/10 text-warning' },
    { label: 'Units in stock', value: stats.unitsInStock, icon: Layers, tone: 'bg-primary/10 text-primary' },
  ];

  const sortFor = (key, descKey) => {
    const current = SORT_KEYS[sort]?.label;
    const dir = sort === key ? 'desc' : sort === descKey ? 'asc' : null;
    return { active: Boolean(dir), dir };
  };
  const requestSort = (ascKey, descKey) => {
    setSort(sort === ascKey ? descKey : ascKey);
    setSelected(new Set());
  };

  const SortHead = ({ ascKey, descKey, children }) => {
    const { active, dir } = sortFor(ascKey, descKey);
    const Icon = dir === 'asc' ? ChevronUp : dir === 'desc' ? ChevronDown : ChevronsUpDown;
    return (
      <th className="px-5 py-3 font-semibold">
        <button
          onClick={() => requestSort(ascKey, descKey)}
          className={`inline-flex items-center gap-1 hover:text-text transition-colors ${active ? 'text-primary' : ''}`}
          aria-label={`Sort by ${children}`}
        >
          {children}
          <Icon size={13} />
        </button>
      </th>
    );
  };

  return (
    <div>
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
        <div>
          <nav className="flex items-center gap-1.5 text-sm text-text-muted mb-1">
            <span>Catalog</span>
            <span>/</span>
            <span className="text-text font-medium">Products</span>
          </nav>
          <h1 className="font-heading text-2xl md:text-3xl font-bold">Products</h1>
          <p className="text-text-light mt-1 text-sm">{stats.total} products · {stats.variants} variants in your catalog</p>
        </div>
        <Link to="/admin/products/new" className="btn-primary flex items-center gap-2 text-sm">
          <Plus size={16} /> Add Product
        </Link>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {statCards.map((c) => (
          <div key={c.label} className="card p-4 flex items-center gap-3">
            <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${c.tone}`}>
              <c.icon size={20} />
            </div>
            <div className="min-w-0">
              <p className="font-heading text-2xl font-bold leading-tight">{c.value.toLocaleString()}</p>
              <p className="text-xs text-text-muted truncate">{c.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Tab navigation */}
      <div className="flex items-center gap-1 border-b border-border mb-5 overflow-x-auto no-scrollbar">
        {visited.map((t) => (
          <button
            key={t.id}
            onClick={() => { setTab(t.id); setSelected(new Set()); }}
            aria-current={tab === t.id ? 'page' : undefined}
            className={`relative whitespace-nowrap px-4 py-2.5 text-sm font-medium transition-colors ${
              tab === t.id ? 'text-secondary' : 'text-text-light hover:text-text'
            }`}
          >
            {t.label}
            <span className={`ml-1.5 text-xs px-1.5 py-0.5 rounded-full ${tab === t.id ? 'bg-primary/10 text-primary' : 'bg-bg text-text-muted'}`}>
              {t.count}
            </span>
            {tab === t.id && <span className="absolute inset-x-2 -bottom-px h-[2px] rounded-full" style={{ backgroundColor: 'var(--primary)' }} />}
          </button>
        ))}
      </div>

      {/* Filter toolbar */}
      <Card pad={false}>
        <div className="p-4 border-b border-border flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[220px]">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
            <input
              className="input-field pl-9"
              placeholder="Search name, SKU, tag or description..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') { setQuery(search); setSelected(new Set()); } }}
            />
          </div>
          <select value={category} onChange={(e) => { setCategory(e.target.value); setSelected(new Set()); }} className="input-field w-auto max-w-[180px]">
            <option value="">All categories</option>
            {cats.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
          </select>
          <div className="relative">
            <select value={sort} onChange={(e) => { setSort(e.target.value); setSelected(new Set()); }} className="input-field w-auto pr-8 max-w-[180px]" aria-label="Sort products">
              <option value="">Recently added</option>
              {Object.entries(SORT_KEYS).filter(([k]) => k).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
            </select>
            <ArrowDownUp size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none" />
          </div>
          <button onClick={() => { setQuery(search); setSelected(new Set()); }} className="btn-outline text-sm px-4">Search</button>
          {(query || category || tabKey) && (
            <button
              onClick={() => { setQuery(''); setSearch(''); setCategory(''); setTab('all'); setSort(''); setSelected(new Set()); }}
              className="inline-flex items-center gap-1 text-sm text-text-muted hover:text-error transition-colors"
            >
              <X size={14} /> Clear
            </button>
          )}
        </div>

        {/* Bulk action bar */}
        {selected.size > 0 && (
          <div className="px-4 py-3 border-b border-border bg-primary/5 flex items-center gap-2 flex-wrap">
            <span className="text-sm font-semibold text-primary mr-2">
              <Check size={14} className="inline -mt-0.5 mr-1" />
              {selected.size} selected
            </span>
            <button onClick={bulkStatus(true)} className="btn-outline text-xs px-3 py-1.5">Activate</button>
            <button onClick={bulkStatus(false)} className="btn-outline text-xs px-3 py-1.5">Deactivate</button>
            <button onClick={() => setMoveOpen(true)} className="btn-outline text-xs px-3 py-1.5">Move to category</button>
            <button onClick={() => setConfirm({ type: 'bulk' })} className="inline-flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-lg text-error hover:bg-error/10 transition-colors">
              <Trash2 size={14} /> Delete
            </button>
            <button onClick={clearSelection} className="ml-auto text-xs text-text-muted hover:text-text">Clear</button>
          </div>
        )}

        {loading ? (
          <div className="p-5 space-y-3">
            {Array.from({ length: 6 }).map((_, i) => <div key={i} className="skeleton h-16" />)}
          </div>
        ) : error ? (
          <div className="text-center py-14 px-4">
            <AlertTriangle size={32} className="mx-auto text-warning mb-3" />
            <p className="text-sm text-text-light mb-4">{error}</p>
            <button onClick={() => load(state.page)} className="btn-outline text-sm px-4">Retry</button>
          </div>
        ) : state.items.length === 0 ? (
          <EmptyState
            title="No products here"
            message="Try a different filter, clear your search, or add a brand new product."
            action={
              <div className="flex gap-3 justify-center">
                <button onClick={() => { setQuery(''); setSearch(''); setCategory(''); setTab('all'); setSort(''); }} className="btn-outline text-sm px-4">Reset filters</button>
                <Link to="/admin/products/new" className="btn-primary text-sm"><Plus size={14} /> Add Product</Link>
              </div>
            }
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-bg text-text-muted uppercase text-xs">
                <tr>
                  <th className="px-5 py-3 w-10">
                    <input type="checkbox" className="w-4 h-4 accent-primary cursor-pointer" checked={allOnPageSelected} onChange={toggleSelectAll} aria-label="Select all on page" />
                  </th>
                  <SortHead ascKey="name_asc" descKey="name_desc">Product</SortHead>
                  <th className="text-left px-5 py-3 font-semibold">Category</th>
                  <SortHead ascKey="price_asc" descKey="price_desc">Price</SortHead>
                  <SortHead ascKey="stock_asc" descKey="stock_desc">Stock</SortHead>
                  <th className="text-left px-5 py-3 font-semibold">Featured</th>
                  <th className="text-left px-5 py-3 font-semibold">Status</th>
                  <SortHead ascKey="created_asc" descKey="created_desc">Updated</SortHead>
                  <th className="text-right px-5 py-3 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {state.items.map((product) => {
                  const price = product.minPrice ?? 0;
                  const hasRange = product.maxPrice && product.maxPrice > product.minPrice;
                  return (
                    <tr key={product._id} className={`border-t border-border/50 hover:bg-bg/50 transition-colors ${selected.has(product._id) ? 'bg-primary/5' : ''}`}>
                      <td className="px-5 py-3">
                        <input type="checkbox" className="w-4 h-4 accent-primary cursor-pointer" checked={selected.has(product._id)} onChange={() => toggleSelect(product._id)} aria-label={`Select ${product.name}`} />
                      </td>
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-3">
                          {product.coverImage ? (
                            <img src={product.coverImage} alt="" className="w-12 h-12 rounded-lg object-cover shrink-0" loading="lazy" />
                          ) : (
                            <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center font-heading text-base text-primary shrink-0">{product.name?.charAt(0)}</div>
                          )}
                          <div className="min-w-0">
                            <Link to={`/admin/products/${product._id}`} className="font-medium truncate max-w-[220px] block hover:text-secondary transition-colors" title={product.name}>
                              {product.name}
                            </Link>
                            <p className="text-xs text-text-muted">{product.variantCount} variant(s)</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3">
                        {product.category?.name ? (
                          <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-bg text-text-light">{product.category.name}</span>
                        ) : <span className="text-text-muted">—</span>}
                      </td>
                      <td className="px-5 py-3 font-semibold whitespace-nowrap">
                        {price ? `${formatPrice(price)}${hasRange ? `–${formatPrice(product.maxPrice)}` : ''}` : '—'}
                      </td>
                      <td className="px-5 py-3">
                        <div className="flex flex-col gap-1 min-w-[110px]">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{product.totalStock}</span>
                            <StockBadge stock={product.totalStock} />
                          </div>
                          <div className="h-1 rounded-full bg-bg overflow-hidden">
                            <div
                              className="h-full rounded-full transition-all"
                              style={{
                                width: `${Math.min(100, Math.round((product.totalStock / 50) * 100))}%`,
                                backgroundColor: product.totalStock <= 0 ? '#EF4444' : 'var(--primary)',
                              }}
                            />
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3">
                        <button
                          onClick={() => toggleField(product, 'featured')}
                          className={`p-1.5 rounded-lg transition-colors ${product.featured ? 'text-warning hover:bg-warning/10' : 'text-text-light hover:text-warning hover:bg-warning/10'}`}
                          title={product.featured ? 'Remove from featured' : 'Mark as featured'}
                          aria-label={`${product.featured ? 'Unfeature' : 'Feature'} ${product.name}`}
                        >
                          <Star size={17} fill={product.featured ? 'currentColor' : 'none'} />
                        </button>
                      </td>
                      <td className="px-5 py-3">
                        <button
                          onClick={() => toggleField(product, 'active')}
                          role="switch"
                          aria-checked={product.active}
                          aria-label={`${product.active ? 'Deactivate' : 'Activate'} ${product.name}`}
                          className={`relative w-10 h-[22px] rounded-full transition-colors ${product.active ? 'bg-success' : 'bg-border'}`}
                        >
                          <span className={`absolute top-0.5 w-[18px] h-[18px] rounded-full bg-white shadow transition-all ${product.active ? 'left-[20px]' : 'left-0.5'}`} />
                        </button>
                      </td>
                      <td className="px-5 py-3 text-text-muted whitespace-nowrap">
                        {new Date(product.updatedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                      </td>
                      <td className="px-5 py-3">
                        <div className="flex items-center justify-end gap-1">
                          <Link to={`/admin/products/${product._id}`} className="p-2 rounded-lg text-text-light hover:text-primary hover:bg-primary/10 transition-colors" title="View"><Eye size={15} /></Link>
                          <Link to={`/admin/products/${product._id}/edit`} className="p-2 rounded-lg text-text-light hover:text-primary hover:bg-primary/10 transition-colors" title="Edit"><Pencil size={15} /></Link>
                          <button onClick={() => duplicate(product)} className="p-2 rounded-lg text-text-light hover:text-primary hover:bg-primary/10 transition-colors" title="Duplicate"><Copy size={15} /></button>
                          <button onClick={() => setConfirm({ type: 'delete', product })} className="p-2 rounded-lg text-text-light hover:text-error hover:bg-error/10 transition-colors" title="Delete"><Trash2 size={15} /></button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        <div className="px-5 pb-4">
          <Pagination page={state.page} pages={state.pages} total={state.total} onPage={(p) => { setSelected(new Set()); load(p); }} />
        </div>
      </Card>

      {/* Move-to-category modal */}
      <Modal open={moveOpen} onClose={() => setMoveOpen(false)} title={`Move ${selected.size} product(s)`} size="sm"
        footer={
          <>
            <button onClick={() => setMoveOpen(false)} className="btn-outline text-sm px-4">Cancel</button>
            <button onClick={handleBulkCategory} className="btn-primary text-sm px-4" disabled={!moveCategory}>Move products</button>
          </>
        }
      >
        <p className="text-sm text-text-light mb-3">Choose the destination category.</p>
        <select className="input-field" value={moveCategory} onChange={(e) => setMoveCategory(e.target.value)}>
          <option value="">Select category</option>
          {cats.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
        </select>
      </Modal>

      {/* Delete confirmation modal */}
      <Modal
        open={Boolean(confirm)}
        onClose={() => setConfirm(null)}
        title={confirm?.type === 'bulk' ? 'Delete selected products?' : 'Delete product?'}
        size="sm"
        footer={
          <>
            <button onClick={() => setConfirm(null)} className="btn-outline text-sm px-4">Cancel</button>
            <button onClick={confirm?.type === 'bulk' ? handleBulkDelete : handleDeleteOne} className="inline-flex items-center gap-1.5 text-sm px-4 py-2 rounded-lg bg-error text-white hover:opacity-90 transition-opacity">
              <Trash2 size={14} /> Delete
            </button>
          </>
        }
      >
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-full bg-error/10 text-error flex items-center justify-center shrink-0"><AlertTriangle size={18} /></div>
          <div className="text-sm">
            {confirm?.type === 'bulk' ? (
              <p>This will permanently delete <strong>{selected.size}</strong> selected product(s). Action cannot be undone.</p>
            ) : (
              <p>Are you sure you want to permanently delete <strong>{confirm?.product?.name}</strong>? This cannot be undone.</p>
            )}
          </div>
        </div>
      </Modal>
    </div>
  );
}
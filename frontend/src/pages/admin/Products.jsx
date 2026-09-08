import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Edit, Trash2, Search } from 'lucide-react';
import { api, formatPrice } from '../../lib/api';
import toast from 'react-hot-toast';
import { Card, PageHeader, Pagination, EmptyState } from '../../components/admin/ui.jsx';

export default function AdminProducts() {
  const [state, setState] = useState({ items: [], total: 0, page: 1, pages: 1 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('');
  const [cats, setCats] = useState([]);
  const [stock, setStock] = useState('');

  const load = (p = 1) => {
    setLoading(true);
    const params = new URLSearchParams();
    if (query) params.set('search', query);
    if (category) params.set('category', category);
    params.set('page', p);
    params.set('limit', 15);
    api.get(`/admin/products?${params.toString()}`)
      .then((r) => setState(r.data))
      .catch(() => toast.error('Failed to load products'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(1); /* eslint-disable-next-line */ }, [query, category]);

  useEffect(() => {
    api.get('/admin/categories').then((r) => setCats(r.data || [])).catch(() => {});
  }, []);

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete "${name}"? This cannot be undone.`)) return;
    try {
      await api.delete(`/admin/products/${id}`);
      toast.success('Product deleted');
      load(state.page);
    } catch (err) {
      toast.error(err.message || 'Delete failed');
    }
  };

  const shown = stock === 'low' ? state.items.filter((p) => p.variants.reduce((s, v) => s + (v.stock || 0), 0) <= 5) : state.items;
  const totalShown = stock === 'low' ? shown.length : state.total;

  return (
    <div>
      <PageHeader
        title="Products"
        subtitle={`${state.total} products in your catalog`}
        actions={<Link to="/admin/products/new" className="btn-primary flex items-center gap-2 text-sm"><Plus size={16} /> Add Product</Link>}
      />

      <Card pad={false}>
        <div className="p-4 border-b border-border flex flex-wrap gap-3 items-center">
          <div className="relative flex-1 min-w-[200px]">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
            <input
              className="input-field pl-9"
              placeholder="Search products..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && setQuery(search)}
            />
          </div>
          <select value={category} onChange={(e) => setCategory(e.target.value)} className="input-field w-auto">
            <option value="">All categories</option>
            {cats.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
          </select>
          <select value={stock} onChange={(e) => setStock(e.target.value)} className="input-field w-auto">
            <option value="">All stock</option>
            <option value="low">Low stock (≤5)</option>
          </select>
          <button onClick={() => setQuery(search)} className="btn-outline text-sm px-4">Search</button>
        </div>

        {loading ? (
          <div className="p-5 space-y-3"><div className="skeleton h-14" /><div className="skeleton h-14" /><div className="skeleton h-14" /></div>
        ) : shown.length === 0 ? (
          <EmptyState title="No products found" message="Try adjusting filters or add a new product." action={<Link to="/admin/products/new" className="btn-primary text-sm"><Plus size={14} /> Add Product</Link>} />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-bg text-text-muted uppercase text-xs">
                <tr>
                  <th className="text-left px-5 py-3 font-semibold">Product</th>
                  <th className="text-left px-5 py-3 font-semibold">Category</th>
                  <th className="text-left px-5 py-3 font-semibold">Price</th>
                  <th className="text-left px-5 py-3 font-semibold">Stock</th>
                  <th className="text-left px-5 py-3 font-semibold">Status</th>
                  <th className="text-right px-5 py-3 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {shown.map((product) => {
                  const totalStock = product.variants.reduce((s, v) => s + (v.stock || 0), 0);
                  const minPrice = Math.min(...product.variants.map((v) => v.salePrice || v.price));
                  const img = product.variants.flatMap((v) => v.images || [])[0] || product.image;
                  return (
                    <tr key={product._id} className="border-t border-border/50 hover:bg-bg/50">
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-3">
                          {img ? (
                            <img src={img} alt="" className="w-11 h-11 rounded-lg object-cover shrink-0" />
                          ) : (
                            <div className="w-11 h-11 rounded-lg gradient-soft flex items-center justify-center text-primary font-heading text-base shrink-0">{product.name?.charAt(0)}</div>
                          )}
                          <div className="min-w-0">
                            <p className="font-medium truncate max-w-[260px]">{product.name}</p>
                            <p className="text-xs text-text-muted">{product.variants.length} variant(s)</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3 text-text-light">{product.category?.name || '—'}</td>
                      <td className="px-5 py-3 font-medium">{formatPrice(minPrice)}</td>
                      <td className="px-5 py-3">
                        <span className={totalStock <= 5 ? 'text-error font-medium' : 'font-medium'}>{totalStock}</span>
                        {totalStock <= 5 && <span className="text-xs text-error ml-1">low</span>}
                      </td>
                      <td className="px-5 py-3">
                        <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${product.active ? 'bg-success/10 text-success' : 'bg-error/10 text-error'}`}>
                          {product.active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-5 py-3">
                        <div className="flex items-center justify-end gap-1.5">
                          <Link to={`/admin/products/${product._id}/edit`} className="p-2 rounded-lg text-text-light hover:text-primary hover:bg-primary/10 transition-colors" title="Edit"><Edit size={15} /></Link>
                          <button onClick={() => handleDelete(product._id, product.name)} className="p-2 rounded-lg text-text-light hover:text-error hover:bg-error/10 transition-colors" title="Delete"><Trash2 size={15} /></button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {stock !== 'low' && state.pages > 1 && (
          <div className="px-5 pb-4">
            <Pagination page={state.page} pages={state.pages} total={totalShown} onPage={load} />
          </div>
        )}
      </Card>
    </div>
  );
}
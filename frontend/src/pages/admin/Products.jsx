import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Plus, Edit, Trash2, ArrowLeft } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { api, formatPrice } from '../../lib/api';
import toast from 'react-hot-toast';

export default function AdminProducts() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || user.role !== 'admin') { navigate('/'); return; }
    loadProducts();
  }, [user, navigate]);

  const loadProducts = () => {
    api.get('/admin/products').then((r) => setProducts(r.data)).finally(() => setLoading(false));
  };

  const handleDelete = async (id, name) => {
    if (!confirm(`Delete "${name}"?`)) return;
    await api.delete(`/admin/products/${id}`);
    toast.success('Product deleted');
    loadProducts();
  };

  return (
    <div className="section-padding">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link to="/admin" className="p-2 hover:text-secondary transition-colors"><ArrowLeft size={20} /></Link>
            <h1 className="font-heading text-3xl font-bold">Products</h1>
          </div>
          <Link to="/admin/products/new" className="btn-primary text-sm py-2 flex items-center gap-1">
            <Plus size={14} /> Add Product
          </Link>
        </div>

        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-bg">
                  <th className="text-left p-3 font-semibold">Product</th>
                  <th className="text-left p-3 font-semibold">Category</th>
                  <th className="text-left p-3 font-semibold">Price</th>
                  <th className="text-left p-3 font-semibold">Stock</th>
                  <th className="text-left p-3 font-semibold">Status</th>
                  <th className="text-right p-3 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => {
                  const totalStock = product.variants.reduce((s, v) => s + v.stock, 0);
                  const minPrice = Math.min(...product.variants.map((v) => v.salePrice || v.price));
                  return (
                    <tr key={product._id} className="border-b border-border/50 hover:bg-bg/50">
                      <td className="p-3 font-medium">{product.name}</td>
                      <td className="p-3 text-text-light">{product.category?.name || '—'}</td>
                      <td className="p-3">{formatPrice(minPrice)}</td>
                      <td className="p-3">
                        <span className={totalStock < 5 ? 'text-error font-medium' : ''}>{totalStock}</span>
                      </td>
                      <td className="p-3">
                        <span className={`text-xs font-medium px-2 py-1 rounded-full ${product.active ? 'bg-success/10 text-success' : 'bg-error/10 text-error'}`}>
                          {product.active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="p-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link to={`/admin/products/${product._id}/edit`} className="p-2 hover:text-secondary transition-colors">
                            <Edit size={16} />
                          </Link>
                          <button onClick={() => handleDelete(product._id, product.name)} className="p-2 hover:text-error transition-colors">
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

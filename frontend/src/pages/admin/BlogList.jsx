import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { PenLine, Trash2, Eye, EyeOff, Plus, Search } from 'lucide-react';
import { api } from '../../lib/api';
import toast from 'react-hot-toast';
import { Card, PageHeader, Pagination, EmptyState } from '../../components/admin/ui.jsx';

export default function AdminBlog() {
  const [state, setState] = useState({ items: [], total: 0, page: 1, pages: 1 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [query, setQuery] = useState('');

  const load = (p = 1) => {
    setLoading(true);
    const params = new URLSearchParams();
    if (query) params.set('search', query);
    params.set('page', p);
    params.set('limit', 12);
    api.get(`/admin/blog?${params.toString()}`)
      .then((r) => setState(r.data))
      .catch(() => toast.error('Failed to load posts'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(1); /* eslint-disable-next-line */ }, [query]);

  const togglePublish = async (id, published) => {
    try {
      await api.put(`/admin/blog/${id}`, { published: !published });
      toast.success(published ? 'Post unpublished' : 'Post published');
      load(state.page);
    } catch { toast.error('Failed to update'); }
  };

  const deletePost = async (id) => {
    if (!window.confirm('Delete this post? This cannot be undone.')) return;
    try {
      await api.delete(`/admin/blog/${id}`);
      toast.success('Post deleted');
      load(state.page);
    } catch { toast.error('Failed to delete'); }
  };

  return (
    <div>
      <PageHeader
        title="Blog Posts"
        subtitle={`${state.total} total posts`}
        actions={<Link to="/admin/blog/new" className="btn-primary flex items-center gap-2 text-sm"><Plus size={16} /> New Post</Link>}
      />

      <Card pad={false}>
        <div className="p-4 border-b border-border flex flex-wrap gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
            <input
              className="input-field pl-9"
              placeholder="Search by title, author, or tag..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && setQuery(search)}
            />
          </div>
          <button onClick={() => setQuery(search)} className="btn-outline text-sm px-4">Search</button>
        </div>

        {loading ? (
          <div className="p-5 space-y-3"><div className="skeleton h-14" /><div className="skeleton h-14" /></div>
        ) : state.items.length === 0 ? (
          <EmptyState title="No blog posts" message="Write your first post for the site's blog." action={<Link to="/admin/blog/new" className="btn-primary text-sm"><Plus size={14} /> New Post</Link>} />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-bg text-text-muted uppercase text-xs">
                <tr>
                  <th className="text-left px-5 py-3 font-semibold">Title</th>
                  <th className="text-left px-5 py-3 font-semibold">Author</th>
                  <th className="text-left px-5 py-3 font-semibold">Tags</th>
                  <th className="text-left px-5 py-3 font-semibold">Status</th>
                  <th className="text-left px-5 py-3 font-semibold">Date</th>
                  <th className="text-right px-5 py-3 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {state.items.map((post) => (
                  <tr key={post._id} className="border-t border-border/50 hover:bg-bg/50">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        {post.coverImage ? (
                          <img src={post.coverImage} alt="" className="w-11 h-11 rounded-lg object-cover shrink-0" />
                        ) : (
                          <div className="w-11 h-11 rounded-lg gradient-soft flex items-center justify-center text-primary font-heading text-base shrink-0">{post.title?.charAt(0)}</div>
                        )}
                        <div className="min-w-0">
                          <p className="font-medium truncate max-w-[280px]">{post.title}</p>
                          <p className="text-xs text-text-muted truncate max-w-[280px]">{post.excerpt}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-text-light">{post.author}</td>
                    <td className="px-5 py-3">
                      <div className="flex flex-wrap gap-1">
                        {post.tags?.slice(0, 3).map((t) => <span key={t} className="text-xs bg-primary/10 text-primary-dark px-2 py-0.5 rounded-full">{t}</span>)}
                      </div>
                    </td>
                    <td className="px-5 py-3">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${post.published ? 'bg-success/10 text-success' : 'bg-warning/10 text-warning'}`}>
                        {post.published ? 'Published' : 'Draft'}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-text-light">{new Date(post.createdAt).toLocaleDateString()}</td>
                    <td className="px-5 py-3">
                      <div className="flex justify-end gap-1.5">
                        <button onClick={() => togglePublish(post._id, post.published)} className="p-2 rounded-lg hover:bg-bg transition-colors" title={post.published ? 'Unpublish' : 'Publish'}>
                          {post.published ? <EyeOff size={15} className="text-warning" /> : <Eye size={15} className="text-success" />}
                        </button>
                        <Link to={`/admin/blog/${post._id}/edit`} className="p-2 rounded-lg hover:bg-bg transition-colors" title="Edit">
                          <PenLine size={15} className="text-secondary" />
                        </Link>
                        <button onClick={() => deletePost(post._id)} className="p-2 rounded-lg hover:bg-bg transition-colors" title="Delete">
                          <Trash2 size={15} className="text-error" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {state.pages > 1 && (
          <div className="px-5 pb-4"><Pagination page={state.page} pages={state.pages} total={state.total} onPage={load} /></div>
        )}
      </Card>
    </div>
  );
}
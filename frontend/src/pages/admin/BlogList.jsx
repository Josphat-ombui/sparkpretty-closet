import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { PenLine, Trash2, Eye, EyeOff } from 'lucide-react';
import { api } from '../../lib/api';
import toast from 'react-hot-toast';

export default function AdminBlog() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchPosts = () => {
    api.get('/admin/blog').then((res) => { setPosts(res.data || []); setLoading(false); });
  };

  useEffect(() => { fetchPosts(); }, []);

  const togglePublish = async (id, published) => {
    try {
      await api.put(`/admin/blog/${id}`, { published: !published });
      toast.success(published ? 'Post unpublished' : 'Post published');
      fetchPosts();
    } catch { toast.error('Failed to update'); }
  };

  const deletePost = async (id) => {
    if (!confirm('Delete this post?')) return;
    try {
      await api.delete(`/admin/blog/${id}`);
      toast.success('Post deleted');
      fetchPosts();
    } catch { toast.error('Failed to delete'); }
  };

  return (
    <div className="section-padding">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-heading text-3xl font-bold">Blog Posts</h1>
            <p className="text-text-light mt-1">{posts.length} total posts</p>
          </div>
          <Link to="/admin/blog/new" className="btn-primary">New Post</Link>
        </div>

        {loading ? (
          <div className="space-y-4">{[...Array(5)].map((_, i) => <div key={i} className="card h-20 skeleton" />)}</div>
        ) : posts.length === 0 ? (
          <div className="card text-center py-16">
            <p className="text-text-light mb-4">No blog posts yet</p>
            <Link to="/admin/blog/new" className="btn-primary">Create Your First Post</Link>
          </div>
        ) : (
          <div className="bg-white rounded-card shadow-card overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-bg text-text-light text-left">
                <tr>
                  <th className="px-6 py-4 font-medium">Title</th>
                  <th className="px-6 py-4 font-medium">Author</th>
                  <th className="px-6 py-4 font-medium">Tags</th>
                  <th className="px-6 py-4 font-medium">Status</th>
                  <th className="px-6 py-4 font-medium">Date</th>
                  <th className="px-6 py-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {posts.map((post) => (
                  <tr key={post._id} className="hover:bg-bg/50 transition-colors">
                    <td className="px-6 py-4 font-medium max-w-xs truncate">{post.title}</td>
                    <td className="px-6 py-4 text-text-light">{post.author}</td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1">
                        {post.tags?.slice(0, 3).map((t) => <span key={t} className="text-xs bg-primary/10 text-secondary px-2 py-0.5 rounded-full">{t}</span>)}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${post.published ? 'bg-success/10 text-success' : 'bg-warning/10 text-warning'}`}>
                        {post.published ? 'Published' : 'Draft'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-text-light">{new Date(post.createdAt).toLocaleDateString()}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => togglePublish(post._id, post.published)} className="p-2 hover:bg-bg rounded-lg transition-colors" title={post.published ? 'Unpublish' : 'Publish'}>
                          {post.published ? <EyeOff size={16} className="text-warning" /> : <Eye size={16} className="text-success" />}
                        </button>
                        <Link to={`/admin/blog/${post._id}/edit`} className="p-2 hover:bg-bg rounded-lg transition-colors" title="Edit">
                          <PenLine size={16} className="text-secondary" />
                        </Link>
                        <button onClick={() => deletePost(post._id)} className="p-2 hover:bg-bg rounded-lg transition-colors" title="Delete">
                          <Trash2 size={16} className="text-error" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

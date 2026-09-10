import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { api } from '../../lib/api';
import toast from 'react-hot-toast';
import { PageHeader } from '../../components/admin/ui.jsx';
import ImageUpload from '../../components/admin/ImageUpload';

export default function BlogForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;

  const [form, setForm] = useState({
    title: '', excerpt: '', content: '', coverImage: '', author: 'Sparkpretty Team',
    tags: '', published: false, metaTitle: '', metaDescription: '',
  });
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(isEdit);

  useEffect(() => {
    if (isEdit) {
      api.get(`/admin/blog/${id}`).then((res) => {
        setForm({ ...res.data, tags: res.data.tags?.join(', ') || '' });
      }).catch(() => toast.error('Failed to load post')).finally(() => setFetching(false));
    }
  }, [id, isEdit]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const body = { ...form, tags: form.tags ? form.tags.split(',').map((t) => t.trim()).filter(Boolean) : [] };
      if (isEdit) {
        await api.put(`/admin/blog/${id}`, body);
        toast.success('Post updated');
      } else {
        await api.post('/admin/blog', body);
        toast.success('Post created');
      }
      navigate('/admin/blog');
    } catch (err) {
      toast.error(err.message || 'Failed to save');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl">
      <Link to="/admin/blog" className="inline-flex items-center gap-1 text-secondary text-sm font-semibold mb-4 hover:gap-2 transition-all">
        <ArrowLeft size={14} /> Back to posts
      </Link>
      <PageHeader title={isEdit ? 'Edit Post' : 'New Blog Post'} />

      {fetching ? (
        <div className="card space-y-4"><div className="skeleton h-12" /><div className="skeleton h-24" /><div className="skeleton h-40" /></div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="card space-y-6">
            <div>
              <label className="block text-sm font-medium mb-2" htmlFor="blog-title">Title</label>
              <input id="blog-title" name="title" value={form.title} onChange={handleChange} className="input-field" required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2" htmlFor="blog-excerpt">Excerpt</label>
              <textarea name="excerpt" value={form.excerpt} onChange={handleChange} rows={2} className="input-field" required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2" htmlFor="blog-content">Content (HTML supported)</label>
              <textarea name="content" value={form.content} onChange={handleChange} rows={15} className="input-field font-mono text-sm" required />
            </div>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium mb-2" htmlFor="blog-cover">Cover Image</label>
                <ImageUpload value={form.coverImage} onChange={(v) => setForm((prev) => ({ ...prev, coverImage: v }))} previewHeight="h-28" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2" htmlFor="blog-author">Author</label>
                <input id="blog-author" name="author" value={form.author} onChange={handleChange} className="input-field" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2" htmlFor="blog-tags">Tags (comma separated)</label>
              <input id="blog-tags" name="tags" value={form.tags} onChange={handleChange} className="input-field" placeholder="fashion, tips, trends" />
            </div>
          </div>

          <div className="card space-y-6">
            <h3 className="font-heading text-lg font-bold">SEO Settings</h3>
            <div>
              <label className="block text-sm font-medium mb-2" htmlFor="blog-meta-title">Meta Title</label>
              <input id="blog-meta-title" name="metaTitle" value={form.metaTitle} onChange={handleChange} className="input-field" placeholder="Override page title for SEO" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2" htmlFor="blog-meta-desc">Meta Description</label>
              <textarea name="metaDescription" value={form.metaDescription} onChange={handleChange} rows={2} className="input-field" placeholder="Override description for search engines" />
            </div>
          </div>

          <div className="card">
            <label className="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" name="published" checked={form.published} onChange={handleChange} className="w-5 h-5 rounded border-border text-secondary focus:ring-primary" />
              <span className="font-medium">Publish immediately</span>
            </label>
          </div>

          <div className="flex gap-4">
            <button type="submit" disabled={loading} className="btn-primary disabled:opacity-50">
              {loading ? 'Saving...' : isEdit ? 'Update Post' : 'Create Post'}
            </button>
            <button type="button" onClick={() => navigate('/admin/blog')} className="btn-outline">Cancel</button>
          </div>
        </form>
      )}
    </div>
  );
}
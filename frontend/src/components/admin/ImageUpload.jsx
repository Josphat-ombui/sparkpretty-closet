import { useState } from 'react';
import { Upload, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { API_BASE } from '../../lib/api';

export default function ImageUpload({ value, onChange, placeholder, className = '', previewHeight = 'h-32' }) {
  const [uploading, setUploading] = useState(false);

  const handleUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) return toast.error('Max file size is 5MB');
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('images', file);
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE}/api/uploads`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: fd,
      });
      const data = await res.json();
      if (!res.ok || !data.data?.length) throw new Error(data.message || 'Upload failed');
      onChange(data.data[0]);
      toast.success('Image uploaded');
    } catch (err) {
      toast.error(err.message || 'Upload failed');
    }
    setUploading(false);
  };

  return (
    <div className={`space-y-2 ${className}`}>
      <div className="flex gap-2">
        <input
          className="input-field flex-1"
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder || 'Image URL or upload below'}
        />
        <label className="btn-outline flex items-center gap-2 text-sm cursor-pointer whitespace-nowrap">
          <Upload size={14} /> {uploading ? 'Uploading...' : 'Upload'}
          <input type="file" accept="image/jpeg,image/png,image/webp,image/gif" className="sr-only" onChange={handleUpload} disabled={uploading} />
        </label>
        {value && (
          <button type="button" onClick={() => onChange('')} className="p-2 text-text-light hover:text-error rounded-lg hover:bg-error/10" title="Remove image">
            <X size={15} />
          </button>
        )}
      </div>
      {value && <img src={value} alt="Preview" className={`w-full ${previewHeight} object-cover rounded-lg border border-border`} />}
    </div>
  );
}

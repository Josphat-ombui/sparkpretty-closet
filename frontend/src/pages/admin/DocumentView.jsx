import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Printer, Pencil, Trash2, ArrowLeft, Check, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { api } from '../../lib/api';
import { PageHeader, Card, StatusPill } from '../../components/admin/ui.jsx';
import DocumentSheet from '../../components/admin/DocumentSheet';
import { DOC_TYPES, DOC_STATUS } from '../../lib/documents';

export default function DocumentView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [doc, setDoc] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/admin/documents/${id}`)
      .then((r) => setDoc(r.data))
      .catch(() => toast.error('Failed to load document'))
      .finally(() => setLoading(false));
  }, [id]);

  const updateStatus = async (status) => {
    try {
      const { data } = await api.put(`/admin/documents/${id}`, { ...doc, status });
      setDoc(data);
      toast.success('Status updated');
    } catch (err) {
      toast.error(err.message || 'Update failed');
    }
  };

  const remove = async () => {
    if (!window.confirm(`Delete #${doc.number}?`)) return;
    try {
      await api.delete(`/admin/documents/${id}`);
      toast.success('Document deleted');
      navigate('/admin/documents');
    } catch (err) {
      toast.error(err.message || 'Delete failed');
    }
  };

  if (loading || !doc) {
    return <div><Card><div className="skeleton h-96" /></Card></div>;
  }

  const meta = DOC_TYPES[doc.type] || {};

  return (
    <div>
      <PageHeader
        title={`${meta.label} #${doc.number}`}
        subtitle={`Issued ${new Date(doc.issueDate || doc.createdAt).toLocaleDateString()} \u00b7 ${doc.party?.name || 'No client attached'}`}
        actions={
          <>
            <Link to="/admin/documents" className="btn-outline flex items-center gap-2 text-sm"><ArrowLeft size={15} /> All Documents</Link>
            <Link to={`/admin/documents/${id}/edit`} className="btn-outline flex items-center gap-2 text-sm"><Pencil size={15} /> Edit</Link>
            <Link to={`/admin/documents/${id}/print`} target="_blank" className="btn-primary flex items-center gap-2 text-sm"><Printer size={15} /> Print / PDF</Link>
          </>
        }
      />

      {/* Status bar */}
      <Card className="mb-6 p-4 flex flex-wrap items-center justify-between gap-3 no-print">
        <div className="flex items-center gap-2">
          <span className="text-xs uppercase tracking-wider text-text-muted font-medium">Status</span>
          <StatusPill status={doc.status} map={DOC_STATUS} />
        </div>
        <div className="flex items-center gap-2">
          {Object.keys(DOC_STATUS)
            .filter((s) => s !== doc.status && s !== 'draft')
            .map((s) => (
              <button
                key={s}
                onClick={() => updateStatus(s)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border border-border hover:border-primary hover:text-primary transition-colors"
              >
                {s === 'void' ? <X size={13} /> : <Check size={13} />}
                Mark as {DOC_STATUS[s].label}
              </button>
            ))}
          <button
            onClick={remove}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-error border border-error/30 hover:bg-error/10 transition-colors"
          >
            <Trash2 size={13} /> Delete
          </button>
        </div>
      </Card>

      <DocumentSheet doc={doc} />
    </div>
  );
}
import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Printer, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';
import { api } from '../../lib/api';
import DocumentSheet from '../../components/admin/DocumentSheet';

export default function DocumentPrint() {
  const { id } = useParams();
  const [doc, setDoc] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/admin/documents/${id}`)
      .then((r) => setDoc(r.data))
      .catch(() => toast.error('Failed to load document'))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16">
        <div className="skeleton h-96" />
      </div>
    );
  }

  if (!doc) {
    return (
      <div className="max-w-xl mx-auto px-4 py-24 text-center">
        <h1 className="font-heading text-2xl font-bold mb-3">Document not found</h1>
        <Link to="/admin/documents" className="btn-primary text-sm">Back to Documents</Link>
      </div>
    );
  }

  const isLetter = doc.type === 'letterhead';

  return (
    <div className="min-h-screen bg-slate-100 pb-16">
      {/* Toolbar — hidden on print */}
      <div className="no-print sticky top-0 z-50 bg-white border-b border-slate-200">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between gap-3">
          <Link to={`/admin/documents/${id}`} className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">
            <ArrowLeft size={16} /> Back to document
          </Link>
          <div className="text-right">
            <p className="text-sm font-semibold text-slate-800">{doc.number}</p>
            <p className="text-xs text-slate-500">{isLetter ? 'Letterhead' : doc.party?.name || ''}</p>
          </div>
          <button onClick={() => window.print()} className="btn-primary px-5 py-2.5 text-sm">
            <Printer size={16} /> Print / Save as PDF
          </button>
        </div>
      </div>

      <div className="print-area px-4 pt-8">
        <DocumentSheet doc={doc} />
      </div>
    </div>
  );
}
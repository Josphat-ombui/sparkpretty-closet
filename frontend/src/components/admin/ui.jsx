import { ChevronLeft, ChevronRight, Inbox, X } from 'lucide-react';

export function PageHeader({ title, subtitle, actions }) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
      <div>
        <h1 className="font-heading text-2xl md:text-3xl font-bold">{title}</h1>
        {subtitle && <p className="text-text-light mt-1 text-sm">{subtitle}</p>}
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  );
}

export function Card({ children, className = '', pad = true }) {
  return (
    <div className={`card ${pad ? 'p-5 md:p-6' : ''} ${className}`}>
      {children}
    </div>
  );
}

export function Pagination({ page, pages, total, onPage }) {
  if (pages <= 1) return null;
  const prev = page > 1 ? page - 1 : null;
  const next = page < pages ? page + 1 : null;
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 mt-5">
      <p className="text-sm text-text-light">Page <strong>{page}</strong> of <strong>{pages}</strong> · {total} total</p>
      <div className="flex items-center gap-2">
        <button
          disabled={!prev}
          onClick={() => prev && onPage(prev)}
          className="p-2 rounded-lg border border-border disabled:opacity-40 text-text-light hover:bg-bg transition-colors"
          aria-label="Previous page"
        >
          <ChevronLeft size={16} />
        </button>
        <span className="text-sm font-medium w-10 text-center">{page}</span>
        <button
          disabled={!next}
          onClick={() => next && onPage(next)}
          className="p-2 rounded-lg border border-border disabled:opacity-40 text-text-light hover:bg-bg transition-colors"
          aria-label="Next page"
        >
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
}

export function EmptyState({ title, message, action }) {
  return (
    <div className="text-center py-14">
      <div className="w-14 h-14 mx-auto rounded-full bg-primary/10 flex items-center justify-center mb-4">
        <Inbox size={26} className="text-primary" />
      </div>
      <h3 className="font-heading text-xl font-semibold">{title}</h3>
      {message && <p className="text-text-light text-sm mt-1 max-w-md mx-auto">{message}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

export function Modal({ open, onClose, title, children, footer, size = 'md' }) {
  if (!open) return null;
  const width = size === 'lg' ? 'max-w-3xl' : size === 'sm' ? 'max-w-md' : 'max-w-xl';
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className={`relative bg-white rounded-card shadow-modal w-full ${width} max-h-[90vh] flex flex-col`}>
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <h3 className="font-heading text-lg font-semibold">{title}</h3>
          <button onClick={onClose} className="p-1.5 text-text-light hover:text-text rounded-lg hover:bg-bg" aria-label="Close">
            <X size={18} />
          </button>
        </div>
        <div className="px-5 py-5 overflow-y-auto">{children}</div>
        {footer && <div className="px-5 py-4 border-t border-border flex justify-end gap-2">{footer}</div>}
      </div>
    </div>
  );
}

export function StatusPill({ status, map }) {
  const entry = map?.[status] || { color: 'text-text-light', bg: 'bg-bg', label: status };
  return (
    <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${entry.bg} ${entry.color}`}>
      {entry.label}
    </span>
  );
}

export const ORDER_STATUS = {
  pending: { label: 'Pending', color: 'text-warning', bg: 'bg-warning/10' },
  paid: { label: 'Paid', color: 'text-success', bg: 'bg-success/10' },
  shipped: { label: 'Shipped', color: 'text-primary', bg: 'bg-primary/10' },
  delivered: { label: 'Delivered', color: 'text-success', bg: 'bg-success/10' },
  cancelled: { label: 'Cancelled', color: 'text-error', bg: 'bg-error/10' },
};

export const PAYMENT_STATUS = {
  pending: { label: 'Pending', color: 'text-warning', bg: 'bg-warning/10' },
  completed: { label: 'Completed', color: 'text-success', bg: 'bg-success/10' },
  failed: { label: 'Failed', color: 'text-error', bg: 'bg-error/10' },
};
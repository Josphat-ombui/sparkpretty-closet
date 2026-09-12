export const DOC_TYPES = {
  quotation: { label: 'Quotation', plural: 'Quotations', prefix: 'QUO', title: 'Quotation' },
  invoice: { label: 'Invoice', plural: 'Invoices', prefix: 'INV', title: 'Invoice' },
  receipt: { label: 'Receipt', plural: 'Receipts', prefix: 'RCT', title: 'Official Receipt' },
  credit_note: { label: 'Credit Note', plural: 'Credit Notes', prefix: 'CRN', title: 'Credit Note' },
  delivery_note: { label: 'Delivery Note', plural: 'Delivery Notes', prefix: 'DNN', title: 'Delivery Note' },
  purchase_order: { label: 'Purchase Order', plural: 'Purchase Orders', prefix: 'PO', title: 'Purchase Order' },
  letterhead: { label: 'Letterhead', plural: 'Letterheads', prefix: 'LTR', title: 'Letterhead' },
  statement: { label: 'Account Statement', plural: 'Statements', prefix: 'STM', title: 'Account Statement' },
};

export const DOC_ORDER = ['quotation', 'invoice', 'receipt', 'credit_note', 'delivery_note', 'purchase_order', 'statement', 'letterhead'];

export const DOC_STATUS = {
  draft: { label: 'Draft', color: 'text-text-light', bg: 'bg-bg' },
  sent: { label: 'Sent', color: 'text-primary', bg: 'bg-primary/10' },
  approved: { label: 'Approved', color: 'text-success', bg: 'bg-success/10' },
  paid: { label: 'Paid', color: 'text-success', bg: 'bg-success/10' },
  void: { label: 'Void', color: 'text-error', bg: 'bg-error/10' },
};

export const money = (n) =>
  `KSh ${Number(n || 0).toLocaleString('en-KE', { maximumFractionDigits: 0 })}`;

export const sheetMoney = (n) =>
  `KSh ${Number(n || 0).toLocaleString('en-KE', { minimumFractionDigits: 0 })}`;

export const fmtDate = (d) =>
  d ? new Date(d).toLocaleDateString('en-KE', { day: '2-digit', month: 'short', year: 'numeric' }) : '\u2014';

export const computeTotals = (items, discount = 0, taxRate = 0, shipping = 0, amountPaid = 0) => {
  const rows = (items || [])
    .map((it) => ({
      ...it,
      description: (it.description || '').trim(),
      quantity: Math.max(0, Number(it.quantity) || 0),
      unitPrice: Math.max(0, Number(it.unitPrice) || 0),
    }))
    .filter((it) => it.description)
    .map((it) => ({ ...it, amount: it.quantity * it.unitPrice }));
  const subtotal = rows.reduce((s, it) => s + it.amount, 0);
  const disc = Math.min(subtotal, Math.max(0, Number(discount) || 0));
  const rate = Math.min(100, Math.max(0, Number(taxRate) || 0));
  const taxAmount = (subtotal - disc) * (rate / 100);
  const ship = Math.max(0, Number(shipping) || 0);
  const total = (subtotal - disc) + taxAmount + ship;
  const paid = Math.max(0, Number(amountPaid) || 0);
  return {
    items: rows,
    subtotal,
    discount: disc,
    taxRate: rate,
    taxAmount,
    shipping: ship,
    total,
    amountPaid: paid,
    balance: Math.max(0, total - paid),
  };
};
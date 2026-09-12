import { useState, useEffect, useMemo } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { Save, Trash2, Plus, ArrowLeft, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';
import { api } from '../../lib/api';
import { useContent } from '../../context/ContentContext';
import { Card, PageHeader } from '../../components/admin/ui.jsx';
import { DOC_TYPES, DOC_ORDER, DOC_STATUS, computeTotals, sheetMoney } from '../../lib/documents';

const emptyItem = { description: '', quantity: 1, unitPrice: 0, amount: 0 };

export default function DocumentForm() {
  const { id } = useParams();
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { get } = useContent();
  const isEdit = !!id;
  const presetType = params.get('type') || '';
  const orderParam = params.get('order') || '';

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    type: DOC_ORDER.includes(presetType) ? presetType : 'invoice',
    number: '',
    title: '',
    status: 'draft',
    issueDate: new Date().toISOString().slice(0, 10),
    dueDate: '',
    party: { name: '', email: '', phone: '', address: '', city: '', county: '', country: 'Kenya' },
    sender: {
      name: get('company_legal_name', 'Sparkpretty Closet'),
      email: get('company_email', ''),
      phone: get('company_phone', ''),
      address: get('company_address', ''),
      city: get('company_city', ''),
      county: get('company_county', ''),
      krapin: get('company_krapin', ''),
    },
    items: [{ ...emptyItem }],
    discount: 0,
    taxRate: 0,
    shipping: 0,
    amountPaid: 0,
    notes: '',
    terms: '',
    body: '',
  });

  const [fetchedNumber, setFetchedNumber] = useState('');

  const fetchNumber = (t) => {
    api.get(`/admin/documents/next-number?type=${t}`).then((r) => {
      setFetchedNumber(r.data);
      setForm((f) => ({ ...f, number: f.number || r.data }));
    }).catch(() => {});
  };

  useEffect(() => {
    let active = true;
    const init = async () => {
      try {
        let target = form;
        if (isEdit) {
          const { data } = await api.get(`/admin/documents/${id}`);
          target = {
            ...data,
            issueDate: data.issueDate ? new Date(data.issueDate).toISOString().slice(0, 10) : '',
            dueDate: data.dueDate ? new Date(data.dueDate).toISOString().slice(0, 10) : '',
          };
        } else if (orderParam) {
          const { data: order } = await api.get(`/admin/orders/${orderParam}`);
          target = {
            ...target,
            items: order.items.map((it) => ({
              description: [it.name, it.size, it.color].filter(Boolean).join(' \u2014 '),
              quantity: it.quantity,
              unitPrice: it.price,
              amount: it.price * it.quantity,
            })),
            party: {
              name: order.user?.name || '',
              email: order.user?.email || '',
              phone: order.user?.phone || '',
              address: (order.shippingAddress || {}).street || '',
              city: (order.shippingAddress || {}).city || '',
              county: (order.shippingAddress || {}).county || '',
              country: (order.shippingAddress || {}).country || 'Kenya',
            },
            subtotal: order.subtotal,
            shipping: order.shipping || 0,
            total: order.total,
            terms: get('company_invoice_terms', ''),
            orderId: order._id,
          };
        } else if (presetType === 'quotation') {
          target = { ...target, terms: get('company_quote_terms', '') };
        } else if (presetType === 'receipt') {
          target = { ...target, notes: get('company_receipt_note', '') };
        }
        if (active) setForm(target);
      } catch {
        toast.error('Failed to load data');
      } finally {
        if (active) setLoading(false);
      }
    };
    init();
    if (!isEdit) fetchNumber(presetType && DOC_ORDER.includes(presetType) ? presetType : 'invoice');
    return () => { active = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  // Keep number in sync when type changes on fresh drafts
  useEffect(() => {
    if (!isEdit && !form.number && fetchedNumber) setForm((f) => ({ ...f, number: fetchedNumber }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetchedNumber]);

  const totals = useMemo(
    () => computeTotals(form.items, form.discount, form.taxRate, form.shipping, form.amountPaid),
    [form.items, form.discount, form.taxRate, form.shipping, form.amountPaid],
  );

  const set = (key, val) => setForm((f) => ({ ...f, [key]: val }));
  const setParty = (key, val) => setForm((f) => ({ ...f, party: { ...f.party, [key]: val } }));
  const setSender = (key, val) => setForm((f) => ({ ...f, sender: { ...f.sender, [key]: val } }));

  const setItem = (i, key, val) => {
    setForm((f) => {
      const items = f.items.map((it, idx) => (idx === i ? { ...it, [key]: val } : it));
      items[i].amount = (Number(items[i].quantity) || 0) * (Number(items[i].unitPrice) || 0);
      return { ...f, items };
    });
  };

  const addItem = () => setForm((f) => ({ ...f, items: [...f.items, { ...emptyItem }] }));
  const removeItem = (i) => setForm((f) => ({ ...f, items: f.items.length > 1 ? f.items.filter((_, idx) => idx !== i) : f.items }));

  const typeChange = (t) => {
    setForm((f) => ({ ...f, type: t }));
    setFetchedNumber('');
    api.get(`/admin/documents/next-number?type=${t}`).then((r) => {
      setFetchedNumber(r.data);
      setForm((f) => ({ ...f, number: r.data }));
    }).catch(() => {});
  };

  const save = async (e) => {
    e.preventDefault();
    setSaving(true);
    const payload = {
      ...form,
      ...totals,
      issueDate: form.issueDate || new Date().toISOString().slice(0, 10),
    };
    try {
      if (isEdit) {
        await api.put(`/admin/documents/${id}`, payload);
        toast.success('Document updated');
      } else {
        await api.post('/admin/documents', payload);
        toast.success('Document created');
      }
      navigate('/admin/documents');
    } catch (err) {
      toast.error(err.message || 'Save failed');
      setSaving(false);
    }
  };

  const isLetter = form.type === 'letterhead';
  const meta = DOC_TYPES[form.type] || DOC_TYPES.invoice;

  if (loading) {
    return (
      <div>
        <PageHeader title="Document" />
        <Card><div className="skeleton h-64" /></Card>
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title={isEdit ? `Edit ${meta.label}` : `New ${meta.label}`}
        subtitle={isEdit ? `#${form.number}` : 'Fill in the details below to generate a branded, print-ready document'}
        actions={
          <>
            <button onClick={() => navigate('/admin/documents')} className="btn-outline flex items-center gap-2 text-sm">
              <ArrowLeft size={15} /> Back
            </button>
            <button type="submit" form="document-form" disabled={saving} className="btn-primary flex items-center gap-2 text-sm">
              <Save size={15} /> {saving ? 'Saving...' : 'Save Document'}
            </button>
          </>
        }
      />

      <form id="document-form" onSubmit={save} className="space-y-6">
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <div className="grid sm:grid-cols-2 gap-4 mb-5">
                <div>
                  <label className="form-label">Document Type</label>
                  <select className="input-field" value={form.type} onChange={(e) => typeChange(e.target.value)} disabled={isEdit}>
                    {DOC_ORDER.map((t) => <option key={t} value={t}>{DOC_TYPES[t].label}</option>)}
                  </select>
                </div>
                <div>
                  <label className="form-label">Document Number</label>
                  <div className="flex gap-2">
                    <input className="input-field font-mono text-sm" value={form.number} onChange={(e) => set('number', e.target.value)} placeholder="AUTO" />
                    <button type="button" onClick={() => typeChange(form.type)} title="Generate number" className="px-3 rounded-lg border border-border flex items-center text-text-light hover:text-primary transition-colors">
                      <RefreshCw size={15} />
                    </button>
                  </div>
                </div>
                <div>
                  <label className="form-label">Status</label>
                  <select className="input-field" value={form.status} onChange={(e) => set('status', e.target.value)}>
                    {Object.keys(DOC_STATUS).map((s) => <option key={s} value={s}>{DOC_STATUS[s].label}</option>)}
                  </select>
                </div>
                <div>
                  <label className="form-label">Title (optional)</label>
                  <input className="input-field" value={form.title} onChange={(e) => set('title', e.target.value)} placeholder="e.g. Q1 2026 Spring Collection" />
                </div>
                <div>
                  <label className="form-label">Issue Date</label>
                  <input type="date" className="input-field" value={form.issueDate} onChange={(e) => set('issueDate', e.target.value)} />
                </div>
                <div>
                  <label className="form-label">Due / Valid Until</label>
                  <input type="date" className="input-field" value={form.dueDate} onChange={(e) => set('dueDate', e.target.value)} />
                </div>
              </div>

              {isLetter ? (
                <div>
                  <label className="form-label">Letter Body</label>
                  <textarea
                    className="input-field min-h-[300px] leading-relaxed"
                    rows={12}
                    value={form.body}
                    onChange={(e) => set('body', e.target.value)}
                    placeholder={'To whom it may concern,\n\nWrite your letter content here. It will be rendered on your company letterhead and is ready to print.'}
                  />
                </div>
              ) : (
                <>
                  <label className="form-label">Line Items</label>
                  <div className="rounded-lg border border-border overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="table-shell">
                        <thead>
                          <tr>
                            <th className="w-[44%]">Description</th>
                            <th className="w-[12%]">Qty</th>
                            <th className="w-[18%]">Unit Price (KSh)</th>
                            <th className="w-[16%]">Amount</th>
                            <th className="w-10" />
                          </tr>
                        </thead>
                        <tbody>
                          {form.items.map((it, i) => (
                            <tr key={i}>
                              <td className="px-3 py-2">
                                <input className="input-field text-sm py-2" value={it.description} onChange={(e) => setItem(i, 'description', e.target.value)} placeholder={`Item ${i + 1}`} />
                              </td>
                              <td className="px-3 py-2">
                                <input type="number" min="0" className="input-field text-sm py-2" value={it.quantity} onChange={(e) => setItem(i, 'quantity', e.target.value)} />
                              </td>
                              <td className="px-3 py-2">
                                <input type="number" min="0" step="any" className="input-field text-sm py-2" value={it.unitPrice} onChange={(e) => setItem(i, 'unitPrice', e.target.value)} />
                              </td>
                              <td className="px-3 py-2 text-sm font-semibold">{sheetMoney(it.amount)}</td>
                              <td className="px-2 py-2">
                                <button type="button" onClick={() => removeItem(i)} className="p-1.5 text-text-light hover:text-error rounded-lg hover:bg-error/10" title="Remove item"><Trash2 size={14} /></button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    <div className="px-3 py-2 border-t border-border">
                      <button type="button" onClick={addItem} className="btn-ghost text-sm"><Plus size={15} /> Add Line Item</button>
                    </div>
                  </div>
                </>
              )}
            </Card>

            <Card>
              <h3 className="font-heading text-lg font-semibold mb-4">Notes &amp; Terms</h3>
              <div className="grid sm:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="form-label">Notes</label>
                  <textarea className="input-field" rows={3} value={form.notes} onChange={(e) => set('notes', e.target.value)} placeholder="Thank you for your business..." />
                </div>
                <div>
                  <label className="form-label">Terms &amp; Conditions</label>
                  <textarea className="input-field" rows={3} value={form.terms} onChange={(e) => set('terms', e.target.value)} placeholder="Payment due within 7 days..." />
                </div>
              </div>
            </Card>
          </div>

          {/* Right column */}
          <div className="space-y-6">
            <Card>
              <h3 className="font-heading text-lg font-semibold mb-3">Issue To (Client)</h3>
              <div className="space-y-3">
                <div><label className="form-label">Name / Company</label><input className="input-field" value={form.party.name} onChange={(e) => setParty('name', e.target.value)} /></div>
                <div><label className="form-label">Email</label><input type="email" className="input-field" value={form.party.email} onChange={(e) => setParty('email', e.target.value)} /></div>
                <div><label className="form-label">Phone</label><input className="input-field" value={form.party.phone} onChange={(e) => setParty('phone', e.target.value)} /></div>
                <div><label className="form-label">Address</label><input className="input-field" value={form.party.address} onChange={(e) => setParty('address', e.target.value)} /></div>
                <div className="grid grid-cols-2 gap-3">
                  <div><label className="form-label">City</label><input className="input-field" value={form.party.city} onChange={(e) => setParty('city', e.target.value)} /></div>
                  <div><label className="form-label">County</label><input className="input-field" value={form.party.county} onChange={(e) => setParty('county', e.target.value)} /></div>
                </div>
                <div><label className="form-label">Country</label><input className="input-field" value={form.party.country} onChange={(e) => setParty('country', e.target.value)} /></div>
              </div>
            </Card>

            <Card>
              <h3 className="font-heading text-lg font-semibold mb-3">Issued By</h3>
              <div className="space-y-2.5">
                <div><label className="form-label">Company Name</label><input className="input-field" value={form.sender.name} onChange={(e) => setSender('name', e.target.value)} /></div>
                <div className="grid grid-cols-2 gap-3">
                  <div><label className="form-label">Email</label><input className="input-field" value={form.sender.email} onChange={(e) => setSender('email', e.target.value)} /></div>
                  <div><label className="form-label">Phone</label><input className="input-field" value={form.sender.phone} onChange={(e) => setSender('phone', e.target.value)} /></div>
                </div>
                <div><label className="form-label">Address</label><input className="input-field" value={form.sender.address} onChange={(e) => setSender('address', e.target.value)} /></div>
                <div className="grid grid-cols-2 gap-3">
                  <div><label className="form-label">City</label><input className="input-field" value={form.sender.city} onChange={(e) => setSender('city', e.target.value)} /></div>
                  <div><label className="form-label">County</label><input className="input-field" value={form.sender.county} onChange={(e) => setSender('county', e.target.value)} /></div>
                </div>
                <div><label className="form-label">KRA PIN</label><input className="input-field font-mono text-sm" value={form.sender.krapin} onChange={(e) => setSender('krapin', e.target.value)} /></div>
              </div>
            </Card>

            {!isLetter && (
              <Card>
                <h3 className="font-heading text-lg font-semibold mb-3">Totals</h3>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm"><span className="text-text-light">Subtotal</span><span className="font-medium">{sheetMoney(totals.subtotal)}</span></div>
                  <div><label className="form-label">Discount (KSh)</label><input type="number" min="0" step="any" className="input-field" value={form.discount} onChange={(e) => set('discount', e.target.value)} /></div>
                  <div><label className="form-label">Tax Rate (%)</label><input type="number" min="0" max="100" step="0.5" className="input-field" value={form.taxRate} onChange={(e) => set('taxRate', e.target.value)} /></div>
                  <div className="flex justify-between text-sm"><span className="text-text-light">Tax</span><span className="font-medium">{sheetMoney(totals.taxAmount)}</span></div>
                  <div><label className="form-label">Shipping (KSh)</label><input type="number" min="0" step="any" className="input-field" value={form.shipping} onChange={(e) => set('shipping', e.target.value)} /></div>
                  {form.type === 'invoice' && (
                    <div><label className="form-label">Amount Paid (KSh)</label><input type="number" min="0" step="any" className="input-field" value={form.amountPaid} onChange={(e) => set('amountPaid', e.target.value)} /></div>
                  )}
                  <div className="pt-3 border-t border-border">
                    <div className="flex justify-between text-lg font-bold"><span>Total</span><span style={{ color: 'var(--primary)' }}>{sheetMoney(totals.total)}</span></div>
                    {form.type === 'invoice' && totals.balance > 0 && (
                      <div className="flex justify-between text-sm mt-1"><span className="text-text-light">Balance Due</span><span className="font-semibold">{sheetMoney(totals.balance)}</span></div>
                    )}
                  </div>
                </div>
              </Card>
            )}
          </div>
        </div>
      </form>
    </div>
  );
}
import { DOC_TYPES, sheetMoney, fmtDate } from '../../lib/documents';
import { useContent } from '../../context/ContentContext';

function ContactLine({ icon, text }) {
  if (!text) return null;
  return (
    <span className="inline-flex items-center gap-1.5">
      {icon}
      {text}
    </span>
  );
}

export default function DocumentSheet({ doc }) {
  const { get } = useContent();

  const companyName = doc?.sender?.name || get('company_legal_name', 'Sparkpretty Closet');
  const companyTagline = doc?.sender?.tagline || get('company_tagline', "Premier Women's Fashion \u00b7 Kenya");
  const companyKrapin = doc?.sender?.krapin || get('company_krapin', '');
  const companyAddress = doc?.sender?.address || get('company_address', 'Nairobi, Kenya');
  const companyCity = doc?.sender?.city || get('company_city', '');
  const companyCounty = doc?.sender?.county || get('company_county', '');
  const companyPhone = doc?.sender?.phone || get('company_phone', '');
  const companyEmail = doc?.sender?.email || get('company_email', '');
  const companyWebsite = get('company_website', 'https://sparkpretty.co.ke');
  const companyLogo = get('company_logo', '/images/logo-mark.svg');
  const bankName = get('company_bank_name', '');
  const bankAccount = get('company_bank_account', '');
  const mpesaPaybill = get('company_mpesa_paybill', '');
  const signatureTitle = get('company_signature_name', 'Authorised Signature');

  const meta = DOC_TYPES[doc?.type] || DOC_TYPES.invoice;
  const party = doc?.party || {};
  const items = doc?.items || [];
  const sender = doc?.sender || {};

  const dueDate = doc?.dueDate || (doc?.type === 'invoice' ? new Date(doc.createdAt) : null);
  const referenceLine = doc?.number ? `No. ${doc.number}` : '';

  const showItems = doc?.type !== 'letterhead';
  const hasBank = bankName || bankAccount || mpesaPaybill;

  return (
    <div className="doc-sheet rounded-lg p-8 md:p-12 shadow-[var(--shadow-card)]">
      {/* ===== Header ===== */}
      <div className="doc-header">
        <div className="doc-brand flex items-start gap-4">
          {companyLogo ? (
            <img src={companyLogo} alt={companyName} className="w-14 h-14 object-contain" />
          ) : (
            <div style={{ width: 56, height: 56 }} className="rounded-xl flex items-center justify-center text-white font-heading font-bold text-xl" >
              {companyName.charAt(0)}
            </div>
          )}
          <div>
            <h2>{companyName}</h2>
            <small>{companyTagline}</small>
            <p className="mt-2 text-[0.72rem] leading-relaxed" style={{ color: '#4A4A4A' }}>
              {[companyAddress, [companyCity, companyCounty].filter(Boolean).join(', ')].filter(Boolean).join(' \u00b7 ')}
              {companyKrapin && <span className="block">KRA PIN: {companyKrapin}</span>}
            </p>
          </div>
        </div>
        <div className="doc-title">
          <h3>{meta.title}</h3>
          <p className="doc-number">{referenceLine}</p>
          {(doc?.status && doc.status !== 'draft') && (
            <p className="doc-number capitalize" style={{ color: 'var(--primary)' }}>{doc.status}</p>
          )}
        </div>
      </div>

      {/* ===== Meta ===== */}
      <div className="doc-meta">
        <div>
          <strong>Date Issued</strong>
          {fmtDate(doc?.issueDate || doc?.createdAt)}
        </div>
        {dueDate && (
          <div>
            <strong>{doc?.type === 'quotation' ? 'Valid Until' : 'Due Date'}</strong>
            {fmtDate(dueDate)}
          </div>
        )}
        <div>
          <strong>{doc?.type === 'purchase_order' ? 'Supplier' : 'Bill To'}</strong>
          <span className="block font-medium" style={{ color: '#1A1A2E' }}>{party.name || '\u2014'}</span>
          {party.email && <span className="block">{party.email}</span>}
          {party.phone && <span className="block">{party.phone}</span>}
          {party.address && <span className="block">{party.address}</span>}
          {[party.city, party.county, party.country].filter(Boolean).join(', ') && (
            <span className="block">{[party.city, party.county].filter(Boolean).join(', ')}</span>
          )}
        </div>
        <div>
          <strong>Contact</strong>
          <span className="flex flex-col gap-1">
            {companyPhone && <ContactLine icon={<span aria-hidden="true">{'\u260E'}</span>} text={companyPhone} />}
            {companyEmail && <ContactLine icon={<span aria-hidden="true">{'\u2709'}</span>} text={companyEmail} />}
            {companyWebsite && <ContactLine icon={<span aria-hidden="true">{'\u2192'}</span>} text={companyWebsite} />}
          </span>
        </div>
      </div>

      {/* ===== Items ===== */}
      {showItems ? (
        <table className="doc-sheet-table">
          <thead>
            <tr>
              <th style={{ width: '46%' }}>Description</th>
              <th className="num">Qty</th>
              <th className="num">Unit Price</th>
              <th className="num">Amount</th>
            </tr>
          </thead>
          <tbody>
            {items.length > 0 ? items.map((it, i) => (
              <tr key={i}>
                <td>{it.description}</td>
                <td className="num">{Number(it.quantity)}</td>
                <td className="num">{sheetMoney(it.unitPrice)}</td>
                <td className="num">{sheetMoney(it.amount)}</td>
              </tr>
            )) : (
              <tr><td colSpan={4} style={{ padding: '1rem 0.75rem', color: '#8A8A8A' }}>No line items.</td></tr>
            )}
          </tbody>
        </table>
      ) : (
        <div className="doc-notes" style={{ borderLeft: '3px solid var(--primary)', padding: '0.75rem 1.25rem', margin: '1.25rem 0' }}>
          {(doc?.body || doc?.notes || '').split('\n').map((line, i) => (
            <p key={i} className={line.trim() ? '' : 'h-3'}>{line}</p>
          ))}
        </div>
      )}

      {/* ===== Totals ===== */}
      {showItems && (
        <div style={{ marginTop: '1.5rem' }} className="flex justify-end">
          <table className="doc-sheet-table" style={{ maxWidth: 320 }}>
            <tbody>
              <tr><td>Subtotal</td><td className="num">{sheetMoney(doc.subtotal)}</td></tr>
              {doc.discount > 0 && <tr><td>Discount</td><td className="num">{'\u2013'} {sheetMoney(doc.discount)}</td></tr>}
              {doc.taxRate > 0 && <tr><td>Tax ({Number(doc.taxRate)}%)</td><td className="num">{sheetMoney(doc.taxAmount)}</td></tr>}
              {doc.shipping > 0 && <tr><td>Shipping</td><td className="num">{sheetMoney(doc.shipping)}</td></tr>}
              <tr className="doc-total-row"><td>Total</td><td className="num">{sheetMoney(doc.total)}</td></tr>
              {doc.amountPaid > 0 && (
                <tr><td style={{ color: 'var(--success,#10B981)' }}>Amount Paid</td><td className="num" style={{ color: 'var(--success,#10B981)' }}>{'\u2013'} {sheetMoney(doc.amountPaid)}</td></tr>
              )}
              {doc.balance > 0 && doc.type === 'invoice' && (
                <tr className="doc-total-row"><td>Balance Due</td><td className="num">{sheetMoney(doc.balance)}</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* ===== Notes / Terms ===== */}
      {(doc?.notes || doc?.terms) && (
        <div className="doc-notes" style={{ marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid #EEF0F4' }}>
          {doc.notes && (
            <div>
              <strong>Notes</strong>
              <p>{doc.notes}</p>
            </div>
          )}
          {doc.terms && (
            <div>
              <strong>Terms &amp; Conditions</strong>
              <p>{doc.terms}</p>
            </div>
          )}
          {showItems && hasBank && (
            <div>
              <strong>Payment Details</strong>
              <p>
                {[bankName, bankAccount ? `Account: ${bankAccount}` : '', mpesaPaybill ? `M-Pesa Paybill/Till: ${mpesaPaybill}` : '']
                  .filter(Boolean)
                  .join(' \u00b7 ')}
              </p>
            </div>
          )}
        </div>
      )}

      {/* ===== Signature ===== */}
      {!items.length && !showItems ? null : (
        <div className="doc-sign">
          <div className="sig-line">
            <p>{party.name || 'Client'}</p>
            <div className="sig-mark">
              {doc?.type === 'invoice' || doc?.type === 'receipt' ? (doc.type === 'invoice' ? signatureTitle : 'Received By') : 'For ' + companyName}
            </div>
          </div>
          <div className="sig-line" style={{ marginLeft: 64 }}>
            <p>{companyName}</p>
            <div className="sig-mark">{signatureTitle}</div>
          </div>
        </div>
      )}

      <div className="doc-notes" style={{ marginTop: '2rem', paddingTop: '0.75rem', borderTop: '1px solid #EEF0F4' }}>
        <p style={{ fontSize: '0.68rem', textAlign: 'center' }}>
          This is a computer generated document. {companyName} {'\u00B7'} {companyAddress} {'\u00B7'} {companyPhone || ''}
        </p>
      </div>
    </div>
  );
}
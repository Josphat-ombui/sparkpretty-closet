import mongoose from 'mongoose';

const docItemSchema = new mongoose.Schema({
  description: { type: String, required: true, trim: true },
  quantity: { type: Number, default: 1, min: 0 },
  unitPrice: { type: Number, default: 0, min: 0 },
  amount: { type: Number, default: 0 },
}, { _id: false });

const documentSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['quotation', 'invoice', 'receipt', 'credit_note', 'delivery_note', 'purchase_order', 'letterhead', 'statement'],
    required: true,
    index: true,
  },
  number: { type: String, required: true, trim: true, index: true },
  title: { type: String, default: '' },
  status: {
    type: String,
    enum: ['draft', 'sent', 'approved', 'paid', 'void'],
    default: 'draft',
    index: true,
  },
  issueDate: { type: Date, default: Date.now },
  dueDate: { type: Date },
  party: {
    name: { type: String, default: '', trim: true },
    email: { type: String, default: '', trim: true },
    phone: { type: String, default: '', trim: true },
    address: { type: String, default: '', trim: true },
    city: { type: String, default: '', trim: true },
    county: { type: String, default: '', trim: true },
    country: { type: String, default: 'Kenya' },
  },
  sender: {
    name: { type: String, default: '', trim: true },
    email: { type: String, default: '', trim: true },
    phone: { type: String, default: '', trim: true },
    address: { type: String, default: '', trim: true },
    city: { type: String, default: '', trim: true },
    county: { type: String, default: '', trim: true },
    krapin: { type: String, default: '', trim: true },
    logo: { type: String, default: '' },
  },
  items: { type: [docItemSchema], default: [] },
  subtotal: { type: Number, default: 0 },
  discount: { type: Number, default: 0, min: 0 },
  taxRate: { type: Number, default: 0, min: 0, max: 100 },
  taxAmount: { type: Number, default: 0 },
  shipping: { type: Number, default: 0, min: 0 },
  total: { type: Number, default: 0 },
  balance: { type: Number, default: 0 },
  currency: { type: String, default: 'KES' },
  notes: { type: String, default: '' },
  terms: { type: String, default: '' },
  body: { type: String, default: '' },
  orderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', index: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

documentSchema.index({ number: 1 }, { unique: true });

export default mongoose.model('Document', documentSchema);
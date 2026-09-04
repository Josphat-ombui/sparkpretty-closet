import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  sessionId: { type: String },
  items: [{
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
    name: String,
    size: String,
    color: String,
    quantity: Number,
    price: Number,
  }],
  shippingAddress: {
    label: String,
    street: { type: String, required: true },
    city: { type: String, required: true },
    county: { type: String, required: true },
    zip: String,
    country: { type: String, default: 'Kenya' },
  },
  subtotal: { type: Number, required: true },
  shipping: { type: Number, default: 0 },
  total: { type: Number, required: true },
  payment: {
    method: { type: String, default: 'mpesa' },
    mpesaReceipt: String,
    checkoutRequestId: String,
    merchantRequestId: String,
    status: { type: String, enum: ['pending', 'completed', 'failed'], default: 'pending' },
  },
  status: { type: String, enum: ['pending', 'paid', 'shipped', 'delivered', 'cancelled'], default: 'pending' },
}, { timestamps: true });

export default mongoose.model('Order', orderSchema);

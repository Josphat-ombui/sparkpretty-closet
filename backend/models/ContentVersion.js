import mongoose from 'mongoose';

const contentVersionSchema = new mongoose.Schema({
  contentKey: { type: String, required: true, index: true },
  value: { type: mongoose.Schema.Types.Mixed },
  previousValue: { type: mongoose.Schema.Types.Mixed },
  updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  updatedByName: { type: String },
}, { timestamps: true });

contentVersionSchema.index({ contentKey: 1, createdAt: -1 });

export default mongoose.model('ContentVersion', contentVersionSchema);

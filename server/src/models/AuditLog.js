import mongoose from 'mongoose';

const schema = new mongoose.Schema(
  {
    actor: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    action: { type: String, required: true },
    entityType: { type: String, required: true },
    entityId: { type: String, default: '' },
    metadata: { type: mongoose.Schema.Types.Mixed, default: {} },
  },
  { timestamps: true },
);
export default mongoose.model('AuditLog', schema);

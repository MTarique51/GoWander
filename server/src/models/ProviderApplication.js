import mongoose from 'mongoose';

const schema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    businessName: { type: String, required: true, trim: true },
    description: { type: String, required: true, maxlength: 1500 },
    experienceYears: { type: Number, min: 0, default: 0 },
    serviceAreas: [{ type: String, trim: true }],
    documentUrls: [{ type: String, trim: true }],
    status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
    adminNote: { type: String, default: '' },
    reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    reviewedAt: Date,
  },
  { timestamps: true },
);

schema.index({ user: 1, createdAt: -1 });
export default mongoose.model('ProviderApplication', schema);

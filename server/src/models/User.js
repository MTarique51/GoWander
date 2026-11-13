import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 80 },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true, select: false },
    phone: { type: String, trim: true, default: '' },
    avatar: { type: String, default: '' },
    bio: { type: String, maxlength: 500, default: '' },
    role: { type: String, enum: ['traveler', 'provider', 'admin'], default: 'traveler' },
    providerStatus: {
      type: String,
      enum: ['not_applied', 'pending', 'approved', 'rejected'],
      default: 'not_applied',
    },
    status: { type: String, enum: ['active', 'suspended'], default: 'active' },
    isVerified: { type: Boolean, default: false },
  },
  { timestamps: true },
);

userSchema.index({ name: 'text', email: 'text' });
export default mongoose.model('User', userSchema);

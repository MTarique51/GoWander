import mongoose from 'mongoose';

const schema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    listing: { type: mongoose.Schema.Types.ObjectId, ref: 'Listing', required: true },
  },
  { timestamps: true },
);
schema.index({ user: 1, listing: 1 }, { unique: true });
export default mongoose.model('Favorite', schema);

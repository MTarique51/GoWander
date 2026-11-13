import mongoose from 'mongoose';

const schema = new mongoose.Schema(
  {
    traveler: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    listing: { type: mongoose.Schema.Types.ObjectId, ref: 'Listing', required: true },
    booking: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking', required: true, unique: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    title: { type: String, maxlength: 100, default: '' },
    comment: { type: String, required: true, maxlength: 1200 },
    status: { type: String, enum: ['published', 'hidden'], default: 'published' },
  },
  { timestamps: true },
);

schema.index({ listing: 1, status: 1 });
export default mongoose.model('Review', schema);

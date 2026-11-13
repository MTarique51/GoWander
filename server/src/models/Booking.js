import mongoose from 'mongoose';

const schema = new mongoose.Schema(
  {
    traveler: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    listing: { type: mongoose.Schema.Types.ObjectId, ref: 'Listing', required: true },
    provider: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    bookingDate: { type: Date, required: true },
    guests: { type: Number, required: true, min: 1 },
    unitPrice: { type: Number, required: true },
    totalPrice: { type: Number, required: true },
    specialRequests: { type: String, maxlength: 500, default: '' },
    paymentMethod: { type: String, enum: ['pay_at_venue', 'offline'], default: 'pay_at_venue' },
    paymentStatus: { type: String, enum: ['unpaid', 'paid', 'refunded'], default: 'unpaid' },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'completed', 'cancelled', 'rejected'],
      default: 'pending',
    },
    cancellationReason: { type: String, default: '' },
  },
  { timestamps: true },
);

schema.index({ listing: 1, bookingDate: 1, status: 1 });
export default mongoose.model('Booking', schema);

import mongoose from 'mongoose';

const schema = new mongoose.Schema(
  {
    provider: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    title: { type: String, required: true, trim: true, maxlength: 120 },
    slug: { type: String, unique: true, sparse: true },
    description: { type: String, required: true, maxlength: 5000 },
    shortDescription: { type: String, maxlength: 220, default: '' },
    category: {
      type: String,
      enum: [
        'adventure',
        'culture',
        'food',
        'nature',
        'wellness',
        'sightseeing',
        'workshop',
        'other',
      ],
      required: true,
    },
    location: {
      city: { type: String, required: true, trim: true },
      state: { type: String, default: '' },
      country: { type: String, default: 'India' },
      address: { type: String, default: '' },
      geo: {
        type: { type: String, enum: ['Point'], default: 'Point' },
        coordinates: {
          type: [Number],
          required: true,
          validate: {
            validator: (value) =>
              Array.isArray(value) && value.length === 2 && value.every(Number.isFinite),
            message: 'Package location must include longitude and latitude.',
          },
        },
      },
    },
    price: { type: Number, required: true, min: 0 },
    currency: { type: String, default: 'INR' },
    durationHours: { type: Number, min: 0.5, default: 2 },
    maxGuests: { type: Number, min: 1, default: 10 },
    images: [{ type: String }],
    included: [{ type: String }],
    requirements: [{ type: String }],
    highlights: [{ type: String }],
    availableDates: [{ type: Date }],
    status: { type: String, enum: ['draft', 'published', 'paused', 'rejected'], default: 'draft' },
    featured: { type: Boolean, default: false },
    averageRating: { type: Number, default: 0 },
    reviewCount: { type: Number, default: 0 },
    bookingCount: { type: Number, default: 0 },
  },
  { timestamps: true },
);

schema.index({ title: 'text', description: 'text', 'location.city': 'text' });
schema.index({ category: 1, status: 1, price: 1 });
schema.index({ 'location.city': 1, status: 1 });
schema.index({ 'location.geo': '2dsphere' });
export default mongoose.model('Listing', schema);

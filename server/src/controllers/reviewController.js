import Booking from '../models/Booking.js';
import Review from '../models/Review.js';
import Listing from '../models/Listing.js';
import { notify } from '../utils/notify.js';

async function refreshRating(listingId) {
  const stats = await Review.aggregate([
    { $match: { listing: listingId, status: 'published' } },
    { $group: { _id: '$listing', average: { $avg: '$rating' }, count: { $sum: 1 } } },
  ]);
  await Listing.findByIdAndUpdate(listingId, {
    averageRating: stats[0]?.average || 0,
    reviewCount: stats[0]?.count || 0,
  });
}

export async function createReview(req, res) {
  const { bookingId, rating, title, comment } = req.body;
  const booking = await Booking.findOne({
    _id: bookingId,
    traveler: req.user._id,
    status: 'completed',
  });
  if (!booking)
    return res.status(400).json({ message: 'Only completed bookings can be reviewed.' });
  if (await Review.findOne({ booking: booking._id }))
    return res.status(409).json({ message: 'This booking is already reviewed.' });
  if (!comment || Number(rating) < 1 || Number(rating) > 5)
    return res.status(400).json({ message: 'Rating and comment are required.' });
  const review = await Review.create({
    traveler: req.user._id,
    listing: booking.listing,
    booking: booking._id,
    rating: Number(rating),
    title: title || '',
    comment,
  });
  await refreshRating(booking.listing);
  await notify(
    booking.provider,
    'New experience review',
    'A traveler reviewed one of your experiences.',
    'review',
  );
  res.status(201).json({ review });
}

export async function listingReviews(req, res) {
  const reviews = await Review.find({ listing: req.params.listingId, status: 'published' })
    .populate('traveler', 'name avatar')
    .sort({ createdAt: -1 });
  res.json({ reviews });
}

export async function adminReviews(req, res) {
  const reviews = await Review.find()
    .populate('traveler', 'name email')
    .populate('listing', 'title')
    .sort({ createdAt: -1 });
  res.json({ reviews });
}

export async function moderateReview(req, res) {
  const review = await Review.findById(req.params.id);
  if (!review) return res.status(404).json({ message: 'Review not found.' });
  review.status = req.body.status === 'hidden' ? 'hidden' : 'published';
  await review.save();
  await refreshRating(review.listing);
  res.json({ review });
}

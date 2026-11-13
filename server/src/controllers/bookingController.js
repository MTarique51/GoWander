import Booking from '../models/Booking.js';
import Listing from '../models/Listing.js';
import Review from '../models/Review.js';
import { notify } from '../utils/notify.js';

export async function createBooking(req, res) {
  const { listingId, bookingDate, guests, specialRequests, paymentMethod } = req.body;
  const listing = await Listing.findById(listingId);
  if (!listing || listing.status !== 'published')
    return res.status(404).json({ message: 'Experience unavailable.' });
  const count = Number(guests);
  const date = new Date(bookingDate);
  if (
    !bookingDate ||
    Number.isNaN(date.getTime()) ||
    date < new Date(new Date().setHours(0, 0, 0, 0))
  ) {
    return res.status(400).json({ message: 'Choose a valid future booking date.' });
  }
  if (!Number.isInteger(count) || count < 1 || count > listing.maxGuests) {
    return res.status(400).json({ message: `Guests must be between 1 and ${listing.maxGuests}.` });
  }
  const booking = await Booking.create({
    traveler: req.user._id,
    listing: listing._id,
    provider: listing.provider,
    bookingDate: date,
    guests: count,
    unitPrice: listing.price,
    totalPrice: listing.price * count,
    specialRequests: specialRequests || '',
    paymentMethod: paymentMethod || 'pay_at_venue',
  });
  listing.bookingCount += 1;
  await listing.save();
  await notify(
    listing.provider,
    'New booking received',
    `${req.user.name} booked ${listing.title}.`,
    'booking',
    '/provider/bookings',
  );
  res.status(201).json({ booking });
}

export async function myBookings(req, res) {
  const bookings = await Booking.find({ traveler: req.user._id })
    .populate('listing', 'title images location category')
    .populate('provider', 'name')
    .sort({ createdAt: -1 });
  const reviewed = await Review.find({ traveler: req.user._id }).select('booking');
  const reviewedIds = new Set(reviewed.map((r) => String(r.booking)));
  res.json({ bookings, reviewedBookingIds: [...reviewedIds] });
}

export async function providerBookings(req, res) {
  const bookings = await Booking.find({ provider: req.user._id })
    .populate('traveler', 'name email phone')
    .populate('listing', 'title images')
    .sort({ createdAt: -1 });
  res.json({ bookings });
}

export async function updateBookingStatus(req, res) {
  const booking = await Booking.findById(req.params.id).populate('listing', 'title');
  if (!booking) return res.status(404).json({ message: 'Booking not found.' });
  if (req.user.role !== 'admin' && String(booking.provider) !== String(req.user._id)) {
    return res.status(403).json({ message: 'Not your booking.' });
  }
  const allowed = ['confirmed', 'completed', 'rejected', 'cancelled'];
  if (!allowed.includes(req.body.status))
    return res.status(400).json({ message: 'Invalid booking status.' });
  if (booking.status === 'completed' || booking.status === 'cancelled') {
    return res.status(409).json({ message: 'This booking can no longer be changed.' });
  }
  booking.status = req.body.status;
  if (req.body.cancellationReason) booking.cancellationReason = req.body.cancellationReason;
  await booking.save();
  await notify(
    booking.traveler,
    'Booking updated',
    `Your booking for ${booking.listing.title} is ${booking.status}.`,
    'booking',
  );
  res.json({ booking });
}

export async function cancelMyBooking(req, res) {
  const booking = await Booking.findOne({ _id: req.params.id, traveler: req.user._id }).populate(
    'listing',
    'title',
  );
  if (!booking) return res.status(404).json({ message: 'Booking not found.' });
  if (!['pending', 'confirmed'].includes(booking.status))
    return res.status(409).json({ message: 'This booking cannot be cancelled.' });
  booking.status = 'cancelled';
  booking.cancellationReason = req.body.reason || 'Cancelled by traveler';
  await booking.save();
  await notify(
    booking.provider,
    'Booking cancelled',
    `A booking for ${booking.listing.title} was cancelled.`,
    'booking',
  );
  res.json({ booking });
}

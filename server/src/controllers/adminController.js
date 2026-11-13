import User from '../models/User.js';
import Listing from '../models/Listing.js';
import Booking from '../models/Booking.js';
import Review from '../models/Review.js';
import ProviderApplication from '../models/ProviderApplication.js';
import AuditLog from '../models/AuditLog.js';

export async function overview(req, res) {
  const [
    users,
    providers,
    listings,
    bookings,
    reviews,
    bookingRevenue,
    recentBookings,
    bookingTrend,
  ] = await Promise.all([
    User.countDocuments(),
    User.countDocuments({ providerStatus: 'approved' }),
    Listing.countDocuments(),
    Booking.countDocuments(),
    Review.countDocuments(),
    Booking.aggregate([
      { $match: { status: { $in: ['confirmed', 'completed'] } } },
      { $group: { _id: null, total: { $sum: '$totalPrice' } } },
    ]),
    Booking.find()
      .populate('traveler', 'name')
      .populate('listing', 'title')
      .sort({ createdAt: -1 })
      .limit(8),
    Booking.aggregate([
      { $match: { createdAt: { $gte: new Date(Date.now() - 6 * 30 * 86400000) } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m', date: '$createdAt' } },
          count: { $sum: 1 },
          revenue: { $sum: '$totalPrice' },
        },
      },
      { $sort: { _id: 1 } },
    ]),
  ]);
  const byStatus = await Booking.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]);
  res.json({
    stats: {
      users,
      providers,
      listings,
      bookings,
      reviews,
      grossBookingValue: bookingRevenue[0]?.total || 0,
    },
    byStatus,
    bookingTrend,
    recentBookings,
  });
}

export async function listUsers(req, res) {
  const { q, role, status } = req.query;
  const filter = {};
  if (role) filter.role = role;
  if (status) filter.status = status;
  if (q) filter.$or = [{ name: new RegExp(q, 'i') }, { email: new RegExp(q, 'i') }];
  const users = await User.find(filter).select('-passwordHash').sort({ createdAt: -1 }).limit(200);
  res.json({ users });
}

export async function updateUser(req, res) {
  const user = await User.findById(req.params.id);
  if (!user) return res.status(404).json({ message: 'User not found.' });
  if (String(user._id) === String(req.user._id))
    return res.status(400).json({ message: 'You cannot change your own account here.' });
  if (['active', 'suspended'].includes(req.body.status)) user.status = req.body.status;
  if (['traveler', 'provider', 'admin'].includes(req.body.role)) user.role = req.body.role;
  await user.save();
  res.json({
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      status: user.status,
    },
  });
}

export async function listAllListings(req, res) {
  const listings = await Listing.find()
    .populate('provider', 'name email')
    .sort({ createdAt: -1 })
    .limit(300);
  res.json({ listings });
}

export async function moderateListing(req, res) {
  const listing = await Listing.findById(req.params.id);
  if (!listing) return res.status(404).json({ message: 'Listing not found.' });
  const allowed = ['published', 'paused', 'rejected', 'draft'];
  if (!allowed.includes(req.body.status))
    return res.status(400).json({ message: 'Invalid status.' });
  listing.status = req.body.status;
  if (req.body.featured !== undefined) listing.featured = Boolean(req.body.featured);
  await listing.save();
  await AuditLog.create({
    actor: req.user._id,
    action: 'listing.moderated',
    entityType: 'Listing',
    entityId: listing._id,
    metadata: { status: listing.status },
  });
  res.json({ listing });
}

export async function listAllBookings(req, res) {
  const bookings = await Booking.find()
    .populate('traveler', 'name email')
    .populate('provider', 'name')
    .populate('listing', 'title')
    .sort({ createdAt: -1 })
    .limit(300);
  res.json({ bookings });
}

export async function auditLogs(req, res) {
  const logs = await AuditLog.find()
    .populate('actor', 'name email')
    .sort({ createdAt: -1 })
    .limit(100);
  res.json({ logs });
}

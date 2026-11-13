import Listing from '../models/Listing.js';
import Review from '../models/Review.js';
import { slugify } from '../utils/slug.js';
import AuditLog from '../models/AuditLog.js';

export async function getListings(req, res) {
  const {
    q,
    category,
    city,
    minPrice,
    maxPrice,
    sort = 'newest',
    page = 1,
    limit = 12,
    featured,
  } = req.query;
  const filter = { status: 'published' };
  if (category) filter.category = category;
  if (city) filter['location.city'] = new RegExp(city, 'i');
  if (featured === 'true') filter.featured = true;
  if (minPrice || maxPrice) filter.price = {};
  if (minPrice) filter.price.$gte = Number(minPrice);
  if (maxPrice) filter.price.$lte = Number(maxPrice);
  if (q) filter.$text = { $search: q };
  const sortMap = {
    newest: { createdAt: -1 },
    price_low: { price: 1 },
    price_high: { price: -1 },
    rating: { averageRating: -1 },
    popular: { bookingCount: -1 },
  };
  const pageNum = Math.max(1, Number(page));
  const limitNum = Math.min(48, Math.max(1, Number(limit)));
  const [items, total] = await Promise.all([
    Listing.find(filter)
      .populate('provider', 'name avatar')
      .sort(sortMap[sort] || sortMap.newest)
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum),
    Listing.countDocuments(filter),
  ]);
  res.json({
    items,
    pagination: { page: pageNum, limit: limitNum, total, pages: Math.ceil(total / limitNum) },
  });
}

export async function getMapLocations(req, res) {
  try {
    const locations = await Listing.find({
      status: 'published',
      'location.geo.type': 'Point',
      'location.geo.coordinates.0': { $exists: true },
      'location.geo.coordinates.1': { $exists: true },
    })
      .select('title category price currency images shortDescription location provider')
      .populate('provider', 'name avatar bio')
      .sort({ createdAt: -1 })
      .lean();

    const validLocations = locations.filter((listing) => {
      const coordinates = listing.location?.geo?.coordinates;

      if (!Array.isArray(coordinates) || coordinates.length !== 2) {
        return false;
      }

      const [longitude, latitude] = coordinates;

      return (
        Number.isFinite(longitude) &&
        Number.isFinite(latitude) &&
        longitude >= -180 &&
        longitude <= 180 &&
        latitude >= -90 &&
        latitude <= 90 &&
        Boolean(listing.provider)
      );
    });

    return res.status(200).json({
      success: true,
      count: validLocations.length,
      locations: validLocations,
    });
  } catch (error) {
    console.error('Get map locations error:', error);

    return res.status(500).json({
      success: false,
      message: 'Failed to load map locations.',
    });
  }
}

// Search only locations that exist in published package records. Arbitrary points can
// always be selected directly on the map; no external geocoder is required.
export async function searchPackageLocations(req, res) {
  const q = String(req.query.q || '').trim();
  if (q.length < 2) return res.json({ locations: [] });
  const safeQuery = q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const rows = await Listing.aggregate([
    {
      $match: {
        status: 'published',
        $or: [
          { 'location.city': { $regex: safeQuery, $options: 'i' } },
          { 'location.state': { $regex: safeQuery, $options: 'i' } },
          { 'location.address': { $regex: safeQuery, $options: 'i' } },
        ],
      },
    },
    {
      $group: {
        _id: { city: '$location.city', state: '$location.state', country: '$location.country' },
        packageCount: { $sum: 1 },
      },
    },
    { $limit: 10 },
  ]);
  // Use a stable representative coordinate (first package) rather than averaging
  // longitude/latitude arrays in MongoDB.
  const locations = [];
  for (const row of rows) {
    const sample = await Listing.findOne({
      status: 'published',
      'location.city': row._id.city,
      'location.geo.coordinates.0': { $exists: true },
    })
      .select('location.geo.coordinates')
      .lean();
    if (sample?.location?.geo?.coordinates?.length === 2)
      locations.push({
        city: row._id.city,
        state: row._id.state,
        country: row._id.country,
        lng: sample.location.geo.coordinates[0],
        lat: sample.location.geo.coordinates[1],
        packageCount: row.packageCount,
      });
  }
  res.json({ locations });
}

export async function getNearbyProviders(req, res) {
  const lat = Number(req.query.lat);
  const lng = Number(req.query.lng);
  const requestedRadius = Number(req.query.radiusKm ?? 25);
  const radiusKm = Number.isFinite(requestedRadius)
    ? Math.min(200, Math.max(1, requestedRadius))
    : 25;
  if (!Number.isFinite(lat) || !Number.isFinite(lng) || Math.abs(lat) > 90 || Math.abs(lng) > 180) {
    return res.status(400).json({ message: 'Valid latitude and longitude are required.' });
  }
  const nearby = await Listing.find({
    status: 'published',
    'location.geo': { $geoWithin: { $centerSphere: [[lng, lat], radiusKm / 6378.1] } },
  })
    .populate('provider', 'name avatar bio phone')
    .lean();

  const grouped = new Map();
  for (const item of nearby) {
    if (!item.provider) continue;
    const [packageLng, packageLat] = item.location.geo.coordinates;
    const rad = (v) => (v * Math.PI) / 180;
    const dLat = rad(packageLat - lat),
      dLng = rad(packageLng - lng);
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(rad(lat)) * Math.cos(rad(packageLat)) * Math.sin(dLng / 2) ** 2;
    const distanceKm = 6371 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const key = String(item.provider._id);
    if (!grouped.has(key))
      grouped.set(key, {
        provider: item.provider,
        nearestDistanceKm: distanceKm,
        nearbyPackages: [],
      });
    const entry = grouped.get(key);
    entry.nearestDistanceKm = Math.min(entry.nearestDistanceKm, distanceKm);
    entry.nearbyPackages.push({ ...item, distanceKm });
  }
  const providers = [...grouped.values()]
    .map((entry) => ({
      ...entry,
      nearbyPackageCount: entry.nearbyPackages.length,
    }))
    .sort((a, b) => a.nearestDistanceKm - b.nearestDistanceKm);
  res.json({ providers, total: providers.length, radiusKm, center: { lat, lng } });
}

export async function getListing(req, res) {
  const listing = await Listing.findById(req.params.id).populate('provider', 'name avatar bio');
  if (
    !listing ||
    (listing.status !== 'published' &&
      String(listing.provider?._id) !== String(req.user?._id) &&
      req.user?.role !== 'admin')
  ) {
    return res.status(404).json({ message: 'Listing not found.' });
  }
  const reviews = await Review.find({ listing: listing._id, status: 'published' })
    .populate('traveler', 'name avatar')
    .sort({ createdAt: -1 })
    .limit(20);
  res.json({ listing, reviews });
}

export async function createListing(req, res) {
  const data = {
    ...req.body,
    provider: req.user._id,
    slug: `${slugify(req.body.title || 'experience')}-${Date.now()}`,
  };
  const listing = await Listing.create(data);
  await AuditLog.create({
    actor: req.user._id,
    action: 'listing.created',
    entityType: 'Listing',
    entityId: listing._id,
  });
  res.status(201).json({ listing });
}

export async function updateListing(req, res) {
  const listing = await Listing.findOne({ _id: req.params.id, provider: req.user._id });
  if (!listing) return res.status(404).json({ message: 'Listing not found.' });
  const fields = [
    'title',
    'description',
    'shortDescription',
    'category',
    'location',
    'price',
    'currency',
    'durationHours',
    'maxGuests',
    'images',
    'included',
    'requirements',
    'highlights',
    'availableDates',
    'status',
  ];
  fields.forEach((field) => {
    if (req.body[field] !== undefined) listing[field] = req.body[field];
  });
  await listing.save();
  res.json({ listing });
}

export async function deleteListing(req, res) {
  const listing = await Listing.findOne({ _id: req.params.id, provider: req.user._id });
  if (!listing) return res.status(404).json({ message: 'Listing not found.' });
  listing.status = 'paused';
  await listing.save();
  res.json({ message: 'Listing paused.' });
}

export async function myListings(req, res) {
  const items = await Listing.find({ provider: req.user._id }).sort({ updatedAt: -1 });
  res.json({ items });
}

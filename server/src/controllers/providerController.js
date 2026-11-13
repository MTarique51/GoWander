import ProviderApplication from '../models/ProviderApplication.js';
import User from '../models/User.js';
import Listing from '../models/Listing.js';
import AuditLog from '../models/AuditLog.js';
import { notify } from '../utils/notify.js';
import mongoose from 'mongoose';

export async function submitApplication(req, res) {
  const { businessName, description, experienceYears, serviceAreas, documentUrls } = req.body;
  if (!businessName || !description)
    return res.status(400).json({ message: 'Business name and description are required.' });
  if (req.user.providerStatus === 'approved')
    return res.status(409).json({ message: 'You are already an approved provider.' });
  const pending = await ProviderApplication.findOne({ user: req.user._id, status: 'pending' });
  if (pending)
    return res.status(409).json({ message: 'You already have an application under review.' });
  const application = await ProviderApplication.create({
    user: req.user._id,
    businessName,
    description,
    experienceYears,
    serviceAreas: serviceAreas || [],
    documentUrls: documentUrls || [],
  });
  req.user.providerStatus = 'pending';
  await req.user.save();
  res.status(201).json({ application });
}

export async function myApplication(req, res) {
  const application = await ProviderApplication.findOne({ user: req.user._id }).sort({
    createdAt: -1,
  });
  res.json({ application });
}

export async function listApplications(req, res) {
  const filter = req.query.status ? { status: req.query.status } : {};
  const applications = await ProviderApplication.find(filter)
    .populate('user', 'name email phone')
    .sort({ createdAt: -1 });
  res.json({ applications });
}

export async function reviewApplication(req, res) {
  const application = await ProviderApplication.findById(req.params.id).populate('user');
  if (!application) return res.status(404).json({ message: 'Application not found.' });
  if (!['approved', 'rejected'].includes(req.body.status))
    return res.status(400).json({ message: 'Invalid decision.' });
  application.status = req.body.status;
  application.adminNote = req.body.adminNote || '';
  application.reviewedBy = req.user._id;
  application.reviewedAt = new Date();
  await application.save();
  const user = await User.findById(application.user._id);
  user.providerStatus = req.body.status;
  if (req.body.status === 'approved') user.role = 'provider';
  else if (user.role === 'provider') user.role = 'traveler';
  await user.save();
  await notify(
    user._id,
    'Provider application updated',
    `Your application was ${req.body.status}.`,
    'provider',
  );
  await AuditLog.create({
    actor: req.user._id,
    action: `provider.${req.body.status}`,
    entityType: 'ProviderApplication',
    entityId: application._id,
  });
  res.json({ application });
}

export async function getPublicProviderPackages(req, res) {
  const provider = await User.findOne({
    _id: req.params.providerId,
    role: 'provider',
    providerStatus: 'approved',
  }).select('name avatar bio phone createdAt');
  if (!provider) return res.status(404).json({ message: 'Provider not found.' });
  const packages = await Listing.find({ provider: provider._id, status: 'published' })
    .sort({ createdAt: -1 })
    .lean();
  res.json({ provider, packages });
}

// GET /api/providers/directory?page=1&limit=8
// Returns all approved providers who have at least one published package.

export async function getProviderDirectory(req, res) {
  try {
    const page = Math.max(1, Number.parseInt(req.query.page, 10) || 1);
    const limit = Math.min(30, Math.max(1, Number.parseInt(req.query.limit, 10) || 8));

    const skip = (page - 1) * limit;

    const result = await Listing.aggregate([
      // Only providers with published packages
      {
        $match: {
          status: 'published',
        },
      },

      // Group packages by provider
      {
        $group: {
          _id: '$provider',
          packageCount: { $sum: 1 },
          latestPackageAt: { $max: '$createdAt' },
        },
      },

      // Get provider information
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'provider',
        },
      },
      {
        $unwind: '$provider',
      },

      // Only approved and active providers
      {
        $match: {
          'provider.role': 'provider',
          'provider.providerStatus': 'approved',
          'provider.status': 'active',
        },
      },

      {
        $sort: {
          latestPackageAt: -1,
        },
      },

      // Pagination
      {
        $facet: {
          metadata: [
            {
              $count: 'total',
            },
          ],
          providers: [
            {
              $skip: skip,
            },
            {
              $limit: limit,
            },
            {
              $project: {
                _id: '$provider._id',
                name: '$provider.name',
                email: '$provider.email',
                phone: '$provider.phone',
                avatar: '$provider.avatar',
                bio: '$provider.bio',
                packageCount: 1,
                latestPackageAt: 1,
              },
            },
          ],
        },
      },
    ]);

    const providers = result[0]?.providers || [];
    const total = result[0]?.metadata[0]?.total || 0;

    res.json({
      providers,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNextPage: page < Math.ceil(total / limit),
        hasPrevPage: page > 1,
      },
    });
  } catch (error) {
    console.error('Provider directory error:', error);

    res.status(500).json({
      message: 'Failed to load provider directory.',
    });
  }
}

// GET /api/providers/:providerId/profile?page=1&limit=6
// Returns one provider's public details and their published packages.

export async function getProviderProfile(req, res) {
  try {
    const { providerId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(providerId)) {
      return res.status(400).json({
        message: 'Invalid provider ID.',
      });
    }

    const provider = await User.findOne({
      _id: providerId,
      role: 'provider',
      providerStatus: 'approved',
      status: 'active',
    }).select('name email phone avatar bio createdAt');

    if (!provider) {
      return res.status(404).json({
        message: 'Provider not found.',
      });
    }

    const page = Math.max(1, Number.parseInt(req.query.page, 10) || 1);
    const limit = Math.min(30, Math.max(1, Number.parseInt(req.query.limit, 10) || 6));

    const skip = (page - 1) * limit;

    const filter = {
      provider: provider._id,
      status: 'published',
    };

    const [packages, total] = await Promise.all([
      Listing.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),

      Listing.countDocuments(filter),
    ]);

    const totalPages = Math.ceil(total / limit);

    res.json({
      provider,
      packages,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    });
  } catch (error) {
    console.error('Provider profile error:', error);

    res.status(500).json({
      message: 'Failed to load provider profile.',
    });
  }
}

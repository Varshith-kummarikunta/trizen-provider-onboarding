const mongoose = require('mongoose');
const ProviderProfile = require('../models/ProviderProfile');
const User = require('../models/User');
const { sendSuccess, sendError } = require('../utils/apiResponse');

/**
 * Get aggregated dashboard statistics
 * GET /api/admin/dashboard/stats
 */
const getDashboardStats = async (req, res, next) => {
  try {
    const [total, pending, approved, rejected, draft] = await Promise.all([
      ProviderProfile.countDocuments(),
      ProviderProfile.countDocuments({ status: 'pending' }),
      ProviderProfile.countDocuments({ status: 'approved' }),
      ProviderProfile.countDocuments({ status: 'rejected' }),
      ProviderProfile.countDocuments({ status: 'draft' }),
    ]);

    // Aggregate category distribution
    const categoryStats = await ProviderProfile.aggregate([
      { $unwind: '$categories' },
      { $group: { _id: '$categories', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 8 },
    ]);

    // Recent 5 applications
    const recentApplications = await ProviderProfile.find()
      .populate('user', 'name email')
      .sort({ updatedAt: -1 })
      .limit(5);

    return sendSuccess(res, 'Dashboard statistics retrieved.', {
      counts: {
        total,
        pending,
        approved,
        rejected,
        draft,
      },
      categoryStats: categoryStats.map((item) => ({
        category: item._id,
        count: item.count,
      })),
      recentApplications,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * List providers with pagination, search, status & category filtering
 * GET /api/admin/providers
 */
const getProviders = async (req, res, next) => {
  try {
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.max(1, Math.min(100, parseInt(req.query.limit, 10) || 10));
    const skip = (page - 1) * limit;

    const { search, status, category } = req.query;

    const query = {};

    // Filter by application status
    if (status && ['draft', 'pending', 'approved', 'rejected'].includes(status)) {
      query.status = status;
    }

    // Filter by service category
    if (category && category.trim()) {
      query.categories = category.trim();
    }

    // Search by name, phone or user's email
    if (search && search.trim()) {
      const searchRegex = new RegExp(search.trim(), 'i');

      // Find user IDs matching email search
      const matchingUsers = await User.find({
        $or: [{ email: searchRegex }, { name: searchRegex }],
      }).select('_id');

      const userIds = matchingUsers.map((u) => u._id);

      query.$or = [
        { fullName: searchRegex },
        { phone: searchRegex },
        { user: { $in: userIds } },
      ];
    }

    const [total, providers] = await Promise.all([
      ProviderProfile.countDocuments(query),
      ProviderProfile.find(query)
        .populate('user', 'name email role createdAt')
        .sort({ submittedAt: -1, createdAt: -1 })
        .skip(skip)
        .limit(limit),
    ]);

    const totalPages = Math.ceil(total / limit) || 1;

    return sendSuccess(res, 'Providers retrieved successfully.', {
      providers,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasMore: page < totalPages,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get full provider dossier by profile ID
 * GET /api/admin/providers/:id
 */
const getProviderById = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return sendError(res, 'Invalid provider profile ID format.', [], 400);
    }

    const profile = await ProviderProfile.findById(id).populate(
      'user',
      'name email role createdAt'
    );

    if (!profile) {
      return sendError(res, 'Provider profile not found.', [], 404);
    }

    return sendSuccess(res, 'Provider details retrieved.', {
      provider: profile,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Approve a provider application
 * PATCH /api/admin/providers/:id/approve
 */
const approveProvider = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return sendError(res, 'Invalid provider profile ID.', [], 400);
    }

    const profile = await ProviderProfile.findById(id).populate(
      'user',
      'name email role'
    );

    if (!profile) {
      return sendError(res, 'Provider profile not found.', [], 404);
    }

    profile.status = 'approved';
    profile.reviewedAt = new Date();
    profile.rejectionRemarks = '';
    await profile.save();

    return sendSuccess(res, 'Provider application approved successfully.', {
      provider: profile,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Reject a provider application with mandatory remarks
 * PATCH /api/admin/providers/:id/reject
 */
const rejectProvider = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { remarks } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return sendError(res, 'Invalid provider profile ID.', [], 400);
    }

    if (!remarks || typeof remarks !== 'string' || remarks.trim().length === 0) {
      return sendError(
        res,
        'Rejection remarks are required explaining why the application was rejected.',
        ['Remarks field cannot be empty.'],
        400
      );
    }

    const profile = await ProviderProfile.findById(id).populate(
      'user',
      'name email role'
    );

    if (!profile) {
      return sendError(res, 'Provider profile not found.', [], 404);
    }

    profile.status = 'rejected';
    profile.rejectionRemarks = remarks.trim();
    profile.reviewedAt = new Date();
    await profile.save();

    return sendSuccess(res, 'Provider application rejected with feedback remarks.', {
      provider: profile,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDashboardStats,
  getProviders,
  getProviderById,
  approveProvider,
  rejectProvider,
};

const ProviderProfile = require('../models/ProviderProfile');
const { uploadFile, deleteFile } = require('../services/uploadService');
const { sendSuccess, sendError } = require('../utils/apiResponse');

// Helper to calculate profile completion percentage
const calculateCompletion = (profile) => {
  let score = 0;
  if (profile.fullName && profile.phone) score += 20;
  if (profile.categories && profile.categories.length > 0) score += 20;
  if (profile.skills && profile.skills.length > 0 && typeof profile.experience === 'number') score += 20;
  if (profile.serviceLocations && profile.serviceLocations.length > 0) score += 20;
  if (profile.documents && profile.documents.length > 0) score += 20;
  return score;
};

/**
 * Get current provider's profile
 * GET /api/providers/me
 */
const getMyProfile = async (req, res, next) => {
  try {
    let profile = await ProviderProfile.findOne({ user: req.user._id }).populate(
      'user',
      'name email role'
    );

    if (!profile) {
      // Auto-create if not yet created
      profile = await ProviderProfile.create({
        user: req.user._id,
        fullName: req.user.name,
        phone: '',
        status: 'draft',
      });
      profile = await profile.populate('user', 'name email role');
    }

    const completionPercentage = calculateCompletion(profile);

    return sendSuccess(res, 'Provider profile retrieved.', {
      profile,
      completionPercentage,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update current provider's profile information
 * PUT /api/providers/me
 */
const updateMyProfile = async (req, res, next) => {
  try {
    const profile = await ProviderProfile.findOne({ user: req.user._id });

    if (!profile) {
      return sendError(res, 'Provider profile not found.', [], 404);
    }

    // Enforce Backend State Machine Rules
    if (profile.status === 'pending') {
      return sendError(
        res,
        'Your application is currently under review by administrators and is locked from modification.',
        [],
        403
      );
    }

    if (profile.status === 'approved') {
      return sendError(
        res,
        'Your verified provider profile is locked. Please contact support to request changes.',
        [],
        403
      );
    }

    const {
      fullName,
      phone,
      bio,
      categories,
      skills,
      experience,
      serviceLocations,
    } = req.body;

    if (fullName !== undefined) {
      if (typeof fullName !== 'string' || fullName.trim().length < 2) {
        return sendError(res, 'Full name must be at least 2 characters.', [], 400);
      }
      profile.fullName = fullName.trim();
    }

    if (phone !== undefined) {
      if (typeof phone !== 'string' || phone.trim().length < 7) {
        return sendError(res, 'Please provide a valid phone number (minimum 7 digits).', [], 400);
      }
      profile.phone = phone.trim();
    }

    if (bio !== undefined) {
      profile.bio = typeof bio === 'string' ? bio.trim() : '';
    }

    if (categories !== undefined) {
      if (!Array.isArray(categories)) {
        return sendError(res, 'Categories must be an array of category names.', [], 400);
      }
      profile.categories = categories.map((c) => String(c).trim()).filter(Boolean);
    }

    if (skills !== undefined) {
      if (!Array.isArray(skills)) {
        return sendError(res, 'Skills must be an array.', [], 400);
      }
      profile.skills = skills.map((s) => String(s).trim()).filter(Boolean);
    }

    if (experience !== undefined) {
      const expNum = Number(experience);
      if (isNaN(expNum) || expNum < 0) {
        return sendError(res, 'Years of experience must be a non-negative number.', [], 400);
      }
      profile.experience = expNum;
    }

    if (serviceLocations !== undefined) {
      if (!Array.isArray(serviceLocations)) {
        return sendError(res, 'Service locations must be an array of locations.', [], 400);
      }
      profile.serviceLocations = serviceLocations.map((l) => String(l).trim()).filter(Boolean);
    }

    await profile.save();

    const completionPercentage = calculateCompletion(profile);

    return sendSuccess(res, 'Profile updated successfully.', {
      profile,
      completionPercentage,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Upload profile photo
 * POST /api/providers/me/photo
 */
const uploadProfilePhoto = async (req, res, next) => {
  try {
    const profile = await ProviderProfile.findOne({ user: req.user._id });
    if (!profile) {
      return sendError(res, 'Provider profile not found.', [], 404);
    }

    if (!profile.isEditable()) {
      return sendError(
        res,
        `Cannot modify photos while application status is '${profile.status}'.`,
        [],
        403
      );
    }

    if (!req.file) {
      return sendError(res, 'Please select an image file to upload.', [], 400);
    }

    // Delete existing photo if it had a publicId
    if (profile.profilePhoto && profile.profilePhoto.publicId) {
      await deleteFile(profile.profilePhoto.publicId);
    }

    const uploaded = await uploadFile(req.file, 'avatars');

    profile.profilePhoto = {
      url: uploaded.url,
      fileName: uploaded.fileName,
      publicId: uploaded.publicId,
    };

    await profile.save();

    return sendSuccess(res, 'Profile photo uploaded successfully.', {
      profilePhoto: profile.profilePhoto,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Upload a verification document
 * POST /api/providers/me/documents
 */
const uploadVerificationDocument = async (req, res, next) => {
  try {
    const profile = await ProviderProfile.findOne({ user: req.user._id });
    if (!profile) {
      return sendError(res, 'Provider profile not found.', [], 404);
    }

    if (!profile.isEditable()) {
      return sendError(
        res,
        `Cannot upload documents while application status is '${profile.status}'.`,
        [],
        403
      );
    }

    if (!req.file) {
      return sendError(res, 'Please select a document file to upload.', [], 400);
    }

    const documentType = req.body.documentType || 'other';
    const allowedTypes = ['identity', 'address', 'certificate', 'other'];

    if (!allowedTypes.includes(documentType)) {
      return sendError(
        res,
        `Invalid document type. Allowed types: [${allowedTypes.join(', ')}]`,
        [],
        400
      );
    }

    const uploaded = await uploadFile(req.file, 'documents');

    const newDoc = {
      documentType,
      fileName: uploaded.fileName,
      fileUrl: uploaded.url,
      publicId: uploaded.publicId,
      fileSize: uploaded.fileSize,
      uploadedAt: new Date(),
    };

    profile.documents.push(newDoc);
    await profile.save();

    const addedDoc = profile.documents[profile.documents.length - 1];

    return sendSuccess(
      res,
      'Document uploaded successfully.',
      {
        document: addedDoc,
        documents: profile.documents,
      },
      201
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Delete a verification document
 * DELETE /api/providers/me/documents/:documentId
 */
const deleteVerificationDocument = async (req, res, next) => {
  try {
    const profile = await ProviderProfile.findOne({ user: req.user._id });
    if (!profile) {
      return sendError(res, 'Provider profile not found.', [], 404);
    }

    if (!profile.isEditable()) {
      return sendError(
        res,
        `Cannot delete documents while application status is '${profile.status}'.`,
        [],
        403
      );
    }

    const docIndex = profile.documents.findIndex(
      (d) => d._id.toString() === req.params.documentId
    );

    if (docIndex === -1) {
      return sendError(res, 'Document not found.', [], 404);
    }

    const docToDelete = profile.documents[docIndex];
    if (docToDelete.publicId) {
      await deleteFile(docToDelete.publicId);
    }

    profile.documents.splice(docIndex, 1);
    await profile.save();

    return sendSuccess(res, 'Document deleted successfully.', {
      documents: profile.documents,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Submit provider onboarding application for admin verification
 * POST /api/providers/me/submit
 */
const submitApplication = async (req, res, next) => {
  try {
    const profile = await ProviderProfile.findOne({ user: req.user._id });
    if (!profile) {
      return sendError(res, 'Provider profile not found.', [], 404);
    }

    if (profile.status === 'pending') {
      return sendError(res, 'Your application is already pending verification.', [], 400);
    }

    if (profile.status === 'approved') {
      return sendError(res, 'Your application is already approved.', [], 400);
    }

    // Rigorous Validation of Onboarding Completeness
    const validationErrors = [];

    if (!profile.fullName || profile.fullName.trim().length < 2) {
      validationErrors.push('Full name is required before submission.');
    }

    if (!profile.phone || profile.phone.trim().length < 7) {
      validationErrors.push('A valid phone number is required before submission.');
    }

    if (!profile.categories || profile.categories.length === 0) {
      validationErrors.push('Please select at least one service category.');
    }

    if (!profile.skills || profile.skills.length === 0) {
      validationErrors.push('Please specify at least one skill.');
    }

    if (typeof profile.experience !== 'number' || profile.experience < 0) {
      validationErrors.push('Valid years of experience is required.');
    }

    if (!profile.serviceLocations || profile.serviceLocations.length === 0) {
      validationErrors.push('Please provide at least one service location.');
    }

    if (!profile.documents || profile.documents.length === 0) {
      validationErrors.push('Please upload at least one verification document (e.g. Identity or Certificate proof).');
    }

    if (validationErrors.length > 0) {
      return sendError(
        res,
        'Cannot submit application. Required profile information is missing.',
        validationErrors,
        400
      );
    }

    // Transition state machine: draft/rejected -> pending
    profile.status = 'pending';
    profile.submittedAt = new Date();
    // Preserve old rejectionRemarks if re-submitting or clear?
    // Let's keep rejectionRemarks until reviewed or reset
    // Actually, on resubmission, keeping remarks in history or clearing is fine. Let's clear rejectionRemarks so applicant sees a clean pending state.
    profile.rejectionRemarks = '';
    await profile.save();

    return sendSuccess(res, 'Application submitted successfully. Awaiting admin verification.', {
      status: profile.status,
      submittedAt: profile.submittedAt,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get current application status
 * GET /api/providers/me/status
 */
const getApplicationStatus = async (req, res, next) => {
  try {
    const profile = await ProviderProfile.findOne({ user: req.user._id });
    if (!profile) {
      return sendError(res, 'Provider profile not found.', [], 404);
    }

    const completionPercentage = calculateCompletion(profile);

    return sendSuccess(res, 'Application status retrieved.', {
      status: profile.status,
      submittedAt: profile.submittedAt,
      reviewedAt: profile.reviewedAt,
      rejectionRemarks: profile.rejectionRemarks,
      isEditable: profile.isEditable(),
      completionPercentage,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getMyProfile,
  updateMyProfile,
  uploadProfilePhoto,
  uploadVerificationDocument,
  deleteVerificationDocument,
  submitApplication,
  getApplicationStatus,
};

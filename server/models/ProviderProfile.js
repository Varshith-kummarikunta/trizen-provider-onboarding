const mongoose = require('mongoose');

const documentSchema = new mongoose.Schema({
  documentType: {
    type: String,
    enum: ['identity', 'address', 'certificate', 'other'],
    required: [true, 'Document type is required'],
  },
  fileName: {
    type: String,
    required: true,
  },
  fileUrl: {
    type: String,
    required: true,
  },
  publicId: {
    type: String,
    default: '',
  },
  fileSize: {
    type: Number,
    default: 0,
  },
  uploadedAt: {
    type: Date,
    default: Date.now,
  },
});

const providerProfileSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
      index: true,
    },
    fullName: {
      type: String,
      default: '',
      trim: true,
    },
    phone: {
      type: String,
      default: '',
      trim: true,
    },
    bio: {
      type: String,
      default: '',
      maxlength: [1000, 'Bio cannot exceed 1000 characters'],
    },
    profilePhoto: {
      url: { type: String, default: '' },
      fileName: { type: String, default: '' },
      publicId: { type: String, default: '' },
    },
    categories: {
      type: [String],
      default: [],
      index: true,
    },
    skills: {
      type: [String],
      default: [],
    },
    experience: {
      type: Number,
      min: [0, 'Experience cannot be negative'],
      default: 0,
    },
    serviceLocations: {
      type: [String],
      default: [],
    },
    documents: {
      type: [documentSchema],
      default: [],
    },
    status: {
      type: String,
      enum: ['draft', 'pending', 'approved', 'rejected'],
      default: 'draft',
      index: true,
    },
    rejectionRemarks: {
      type: String,
      default: '',
    },
    submittedAt: {
      type: Date,
      default: null,
    },
    reviewedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Helper method to check if profile is editable
providerProfileSchema.methods.isEditable = function () {
  return this.status === 'draft' || this.status === 'rejected';
};

module.exports = mongoose.model('ProviderProfile', providerProfileSchema);

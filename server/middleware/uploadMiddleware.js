const multer = require('multer');

// Configure memory storage so buffer is readily available for dual-mode uploadService
const storage = multer.memoryStorage();

// Profile Photo Filter
const photoFileFilter = (req, file, cb) => {
  const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp'];
  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new Error('Invalid image format. Only JPG, JPEG, PNG, and WEBP images are allowed.'),
      false
    );
  }
};

// Verification Document Filter
const documentFileFilter = (req, file, cb) => {
  const allowedMimeTypes = ['application/pdf', 'image/jpeg', 'image/png'];
  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new Error('Invalid document format. Only PDF, JPG, JPEG, and PNG files are allowed.'),
      false
    );
  }
};

// Multer Upload Instances
const uploadPhoto = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB maximum
  },
  fileFilter: photoFileFilter,
}).single('photo');

const uploadDocument = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB maximum
  },
  fileFilter: documentFileFilter,
}).single('document');

module.exports = {
  uploadPhoto,
  uploadDocument,
};

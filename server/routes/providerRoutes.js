const express = require('express');
const router = express.Router();
const {
  getMyProfile,
  updateMyProfile,
  uploadProfilePhoto,
  uploadVerificationDocument,
  deleteVerificationDocument,
  submitApplication,
  getApplicationStatus,
} = require('../controllers/providerController');
const { requireAuth, requireRole } = require('../middleware/authMiddleware');
const { uploadPhoto, uploadDocument } = require('../middleware/uploadMiddleware');

// All provider routes require authentication and 'provider' role
router.use(requireAuth);
router.use(requireRole('provider'));

router.get('/me', getMyProfile);
router.put('/me', updateMyProfile);
router.post('/me/photo', uploadPhoto, uploadProfilePhoto);
router.post('/me/documents', uploadDocument, uploadVerificationDocument);
router.delete('/me/documents/:documentId', deleteVerificationDocument);
router.post('/me/submit', submitApplication);
router.get('/me/status', getApplicationStatus);

module.exports = router;

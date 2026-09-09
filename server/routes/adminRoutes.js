const express = require('express');
const router = express.Router();
const {
  getDashboardStats,
  getProviders,
  getProviderById,
  approveProvider,
  rejectProvider,
} = require('../controllers/adminController');
const { requireAuth, requireRole } = require('../middleware/authMiddleware');

// All admin routes require authentication and 'admin' role
router.use(requireAuth);
router.use(requireRole('admin'));

router.get('/dashboard/stats', getDashboardStats);
router.get('/providers', getProviders);
router.get('/providers/:id', getProviderById);
router.patch('/providers/:id/approve', approveProvider);
router.patch('/providers/:id/reject', rejectProvider);

module.exports = router;

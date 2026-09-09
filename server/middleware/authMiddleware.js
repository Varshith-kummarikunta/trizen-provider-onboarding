const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { sendError } = require('../utils/apiResponse');

/**
 * Authentication Middleware: Verifies Bearer JWT token and attaches user to req
 */
const requireAuth = async (req, res, next) => {
  let token = null;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer ')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return sendError(res, 'Authentication required. Please log in.', [], 401);
  }

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || 'trizen_super_secure_jwt_secret_dev_key_2026_!@#'
    );

    const user = await User.findById(decoded.id);
    if (!user) {
      return sendError(res, 'User belonging to this token no longer exists.', [], 401);
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return sendError(res, 'Session expired. Please log in again.', [], 401);
    }
    return sendError(res, 'Invalid authentication token.', [], 401);
  }
};

/**
 * Role Authorization Middleware: Restricts access to specific roles
 * @param  {...string} roles - e.g. 'admin', 'provider'
 */
const requireRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return sendError(res, 'Authentication required.', [], 401);
    }

    if (!roles.includes(req.user.role)) {
      return sendError(
        res,
        `Access denied. Requires one of the following roles: [${roles.join(', ')}].`,
        [],
        403
      );
    }

    next();
  };
};

module.exports = {
  requireAuth,
  requireRole,
};

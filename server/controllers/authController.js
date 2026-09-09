const jwt = require('jsonwebtoken');
const User = require('../models/User');
const ProviderProfile = require('../models/ProviderProfile');
const { sendSuccess, sendError } = require('../utils/apiResponse');

// Helper to generate JWT token
const generateToken = (user) => {
  return jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET || 'trizen_super_secure_jwt_secret_dev_key_2026_!@#',
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
};

/**
 * Register a new provider account
 * POST /api/auth/register
 */
const register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return sendError(res, 'Please provide name, email, and password.', [], 400);
    }

    if (password.length < 6) {
      return sendError(res, 'Password must be at least 6 characters long.', [], 400);
    }

    const existingUser = await User.findOne({ email: email.toLowerCase().trim() });
    if (existingUser) {
      return sendError(res, 'An account with this email address already exists.', [], 400);
    }

    // Explicitly enforce role='provider' for public registration
    const user = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password,
      role: 'provider',
    });

    // Automatically initialize provider profile in draft status
    const profile = await ProviderProfile.create({
      user: user._id,
      fullName: user.name,
      phone: '',
      status: 'draft',
    });

    const token = generateToken(user);

    return sendSuccess(
      res,
      'Registration successful. Welcome to Trizen!',
      {
        token,
        user,
        profile: {
          id: profile._id,
          status: profile.status,
        },
      },
      201
    );
  } catch (error) {
    next(error);
  }
};

/**
 * User login (both provider and admin)
 * POST /api/auth/login
 */
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return sendError(res, 'Please provide email and password.', [], 400);
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      return sendError(res, 'Invalid email or password.', [], 401);
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return sendError(res, 'Invalid email or password.', [], 401);
    }

    const token = generateToken(user);

    let profileData = null;
    if (user.role === 'provider') {
      const profile = await ProviderProfile.findOne({ user: user._id });
      if (profile) {
        profileData = {
          id: profile._id,
          status: profile.status,
        };
      }
    }

    return sendSuccess(res, 'Login successful.', {
      token,
      user,
      profile: profileData,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get currently authenticated user details
 * GET /api/auth/me
 */
const getMe = async (req, res, next) => {
  try {
    const user = req.user;
    let profile = null;

    if (user.role === 'provider') {
      profile = await ProviderProfile.findOne({ user: user._id });
    }

    return sendSuccess(res, 'User authenticated.', {
      user,
      profile,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login,
  getMe,
};

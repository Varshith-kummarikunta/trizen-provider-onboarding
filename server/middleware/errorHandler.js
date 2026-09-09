const multer = require('multer');
const { sendError } = require('../utils/apiResponse');

/**
 * Centralized Application Error Handling Middleware
 */
const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal Server Error';
  let errors = [];

  // Mongoose Validation Error
  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = 'Validation failed';
    errors = Object.values(err.errors).map((e) => e.message);
  }

  // Mongoose Cast Error (Invalid MongoDB ObjectId)
  if (err.name === 'CastError') {
    statusCode = 400;
    message = `Invalid format for resource identifier: '${err.value}'`;
  }

  // MongoDB Duplicate Key Error (E11000)
  if (err.code === 11000) {
    statusCode = 400;
    const field = Object.keys(err.keyValue || {})[0] || 'field';
    message = `An account with this ${field} already exists.`;
  }

  // Multer File Upload Errors
  if (err instanceof multer.MulterError) {
    statusCode = 400;
    if (err.code === 'LIMIT_FILE_SIZE') {
      message = 'Uploaded file exceeds the maximum permitted file size.';
    } else {
      message = `Upload error: ${err.message}`;
    }
  }

  // In development, log the error for diagnostics
  if (process.env.NODE_ENV !== 'production') {
    console.error('[Error Handler]', err);
  }

  return sendError(res, message, errors, statusCode);
};

module.exports = errorHandler;

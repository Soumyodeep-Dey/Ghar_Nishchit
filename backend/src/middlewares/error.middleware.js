import AppError from '../utils/AppError.js';

/**
 * Global Express Error Handling Middleware
 */
export const globalErrorHandler = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  // Handle standard Zod Schema Validation errors
  if (err.name === 'ZodError' || err.issues) {
    const formattedErrors = err.issues ? err.issues.map(issue => ({
      field: issue.path.join('.'),
      message: issue.message
    })) : [];
    
    return res.status(400).json({
      status: 'fail',
      message: 'Validation failed',
      errors: formattedErrors
    });
  }

  // Handle JWT token validation errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      status: 'fail',
      message: 'Invalid authorization token. Please login again.'
    });
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      status: 'fail',
      message: 'Authorization token has expired. Please login again.'
    });
  }

  // Handle Mongoose cast errors (e.g. invalid MongoDB ObjectIDs)
  if (err.name === 'CastError') {
    return res.status(400).json({
      status: 'fail',
      message: `Invalid format for field ${err.path}: "${err.value}"`
    });
  }

  // Development vs Production Error Shape
  if (process.env.NODE_ENV === 'production') {
    // In production, mask stack traces and unhandled native programmer errors
    if (err.isOperational) {
      return res.status(err.statusCode).json({
        status: err.status,
        message: err.message
      });
    }

    // Unhandled technical database or internal library errors
    console.error('[PRODUCTION FATAL ERROR] 💥:', err);
    return res.status(500).json({
      status: 'error',
      message: 'An unexpected internal error occurred'
    });
  } else {
    // In development/staging, log entire stacks for easy debugging
    console.error('[DEV ERROR] 💥:', err);
    return res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
      stack: err.stack,
      error: err
    });
  }
};

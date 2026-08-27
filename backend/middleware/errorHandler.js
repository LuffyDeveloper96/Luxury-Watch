import { env } from '../config/env.js';

/**
 * Centralized sanitized error handler
 * Never exposes stack traces, internal paths, or secrets in production mode
 */
export const errorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || (res.statusCode >= 400 ? res.statusCode : 500);
  const isDev = (env.NODE_ENV || process.env.NODE_ENV) === 'development';

  if (isDev) {
    console.error(`[Error Handler] ${req.method} ${req.originalUrl}:`, err.message);
    if (err.stack) console.error(err.stack);
  } else {
    console.error(`[Error Handler] ${req.method} ${req.originalUrl}: ${statusCode} - ${err.message ? err.message.slice(0, 100) : 'Internal Error'}`);
  }

  // Safe message in production for 500 errors to prevent leaking internal database / system details
  const safeMessage = isDev
    ? (err.message || 'Internal Server Error')
    : (statusCode >= 500 ? 'An internal server error occurred.' : (err.message || 'Request failed.'));

  res.status(statusCode).json({
    success: false,
    message: safeMessage,
    ...(isDev && { error: err.message, stack: err.stack })
  });
};

export default errorHandler;

/**
 * Centralized sanitized error handler
 * Never exposes stack traces in production mode
 */
export const errorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || (res.statusCode === 200 ? 500 : res.statusCode);
  const isDev = process.env.NODE_ENV === 'development';

  console.error(`[Error Handler] ${req.method} ${req.originalUrl}:`, err.message);
  if (isDev) {
    console.error(err.stack);
  }

  res.status(statusCode).json({
    success: false,
    message: err.message || 'Internal Haute Horlogerie Engine Error',
    error: isDev ? err.message : undefined,
    stack: isDev ? err.stack : undefined
  });
};

export default errorHandler;

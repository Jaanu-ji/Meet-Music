export default (err, req, res, next) => {
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;

  // Centralized error logging so we can see the exact backend error causing 500s
  console.error('[ErrorMiddleware] Unhandled error:', {
    message: err?.message,
    stack: err?.stack,
    statusCode,
    path: req.path,
    method: req.method,
    // Avoid logging entire body for large uploads; only log basic metadata
    hasBody: Boolean(req.body && Object.keys(req.body).length),
    params: req.params,
    query: req.query,
  });

  res.status(statusCode).json({
    success: false,
    message: err.message || 'Server Error',
    stack: process.env.NODE_ENV === 'production' ? undefined : err.stack,
  });
};

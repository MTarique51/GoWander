export function notFound(req, res) {
  res.status(404).json({ message: `Route not found: ${req.method} ${req.originalUrl}` });
}

export function errorHandler(err, req, res, next) {
  const status = err.statusCode || (err.name === 'ValidationError' ? 400 : 500);
  if (process.env.NODE_ENV !== 'production') console.error(err);
  res.status(status).json({
    message: err.name === 'ValidationError' ? err.message : err.message || 'Server error',
    ...(process.env.NODE_ENV !== 'production' ? { stack: err.stack } : {}),
  });
}

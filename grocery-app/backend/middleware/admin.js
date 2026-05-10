/**
 * Admin middleware — checks if authenticated user is admin
 * Must be used AFTER the protect middleware
 */
const admin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    return next();
  }
  res.status(403);
  throw new Error('Access denied. Admins only.');
};

module.exports = { admin };

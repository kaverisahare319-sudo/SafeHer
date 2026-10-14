const jwt = require('jsonwebtoken');
const userStore = require('../utils/userStore');

// Valid token AND the account must still be approved (admin can block anyone later).
async function requireAuth(req, res, next) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'No token provided. Please sign in again.' });
  }
  try {
    const decoded = jwt.verify(header.split(' ')[1], process.env.JWT_SECRET);
    const user = await userStore.findById(decoded.userId);
    if (!user) return res.status(401).json({ message: 'Account not found. Please sign in again.' });
    if (user.status !== 'approved') return res.status(403).json({ message: 'Your account is not approved.' });
    req.userId = String(user._id);
    req.userRole = user.role || 'user';
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Session expired. Please sign in again.' });
  }
}

function requireAdmin(req, res, next) {
  if (req.userRole !== 'admin') return res.status(403).json({ message: 'Admin access only.' });
  next();
}

module.exports = requireAuth;
module.exports.requireAdmin = requireAdmin;

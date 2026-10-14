// Tiny in-memory rate limiter (per IP). Good enough for one server instance.
module.exports = function rateLimit({ windowMs = 15 * 60 * 1000, max = 30, message = 'Too many attempts. Try again later.' } = {}) {
  const hits = new Map();
  return (req, res, next) => {
    const key = req.ip;
    const now = Date.now();
    const rec = hits.get(key) || { count: 0, reset: now + windowMs };
    if (now > rec.reset) { rec.count = 0; rec.reset = now + windowMs; }
    rec.count += 1;
    hits.set(key, rec);
    if (rec.count > max) return res.status(429).json({ message });
    next();
  };
};

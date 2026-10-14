const express = require('express');
const crypto = require('crypto');
const requireAuth = require('../middleware/auth');
const { walkSessions } = require('../utils/memoryStore');

const router = express.Router();

const MAX_WALK_MINUTES = 120;
const MAX_PINGS = 200;

// Purge finished/expired walk sessions so location trails never linger.
setInterval(() => {
  const now = Date.now();
  for (const [id, s] of walkSessions) {
    if (new Date(s.expiresAt).getTime() < now || s.status !== 'in_progress') walkSessions.delete(id);
  }
}, 60 * 1000).unref();

// 1. WALK ME HOME — user-started, time-limited, ends automatically.
router.post('/walk/start', requireAuth, (req, res) => {
  const { friendName, durationMinutes = 30, initialLocation } = req.body;
  const minutes = Math.min(Math.max(Number(durationMinutes) || 30, 5), MAX_WALK_MINUTES);

  const sessionId = crypto.randomBytes(16).toString('hex'); // unguessable
  const expiresAt = new Date(Date.now() + minutes * 60 * 1000);

  walkSessions.set(sessionId, {
    sessionId,
    ownerId: req.userId,
    friendName: friendName || 'Trusted contact',
    expiresAt,
    lastPosition: initialLocation && typeof initialLocation.lat === 'number'
      ? { lat: initialLocation.lat, lng: initialLocation.lng, time: new Date() } : null,
    pings: 0,
    status: 'in_progress'
  });

  res.status(201).json({
    message: `Walk sharing started. It ends automatically in ${minutes} minutes or when you tap "I'm safe".`,
    sessionId,
    trackingUrl: `${req.protocol}://${req.get('host')}/api/nightout/walk/${sessionId}`,
    expiresAt
  });
});

// Friend's link: shows ONLY the latest position + time left. No name, phone, history.
router.get('/walk/:sessionId', (req, res) => {
  const s = walkSessions.get(req.params.sessionId);
  if (!s || new Date(s.expiresAt) < new Date() || s.status !== 'in_progress') {
    return res.status(404).json({ message: 'This sharing link has ended.' });
  }
  res.json({ lastPosition: s.lastPosition, expiresAt: s.expiresAt, status: s.status });
});

router.post('/walk/:sessionId/ping', requireAuth, (req, res) => {
  const s = walkSessions.get(req.params.sessionId);
  if (!s || s.ownerId !== req.userId || new Date(s.expiresAt) < new Date()) {
    return res.status(404).json({ message: 'Session not found or already ended.' });
  }
  const { lat, lng } = req.body;
  if (typeof lat !== 'number' || typeof lng !== 'number') return res.status(400).json({ message: 'lat and lng are required.' });
  if (s.pings >= MAX_PINGS) return res.status(429).json({ message: 'Too many updates for this session.' });
  s.lastPosition = { lat, lng, time: new Date() };
  s.pings += 1;
  res.json({ status: 'updated' });
});

router.post('/walk/:sessionId/safe', requireAuth, (req, res) => {
  const s = walkSessions.get(req.params.sessionId);
  if (s && s.ownerId === req.userId) walkSessions.delete(req.params.sessionId); // forget location immediately
  res.json({ message: 'Sharing stopped and location forgotten.' });
});

// 2. DRINK SAFETY — alert goes to the user's OWN contacts only (client-side SMS/share). No one else is told.
router.post('/drink-spiked', requireAuth, (req, res) => {
  const { lat, lng } = req.body;
  const mapsLink = (typeof lat === 'number' && typeof lng === 'number')
    ? `https://www.google.com/maps?q=${lat},${lng}` : null;
  res.json({
    status: 'contacts_alert_ready',
    message: 'Alert prepared for your emergency contacts. If you feel unwell, call 112 or go to the nearest hospital.',
    mapsLink
  });
});

module.exports = router;

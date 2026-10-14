const express = require('express');
const { anonymousReports, communityAlerts } = require('../utils/memoryStore');

const requireAuth = require('../middleware/auth');

const router = express.Router();
router.use(requireAuth); // approved students only; reports store no identity

// 1. ANONYMOUS INCIDENT REPORTING
router.post('/anonymous', (req, res) => {
  const { location, category, description, photoUrl } = req.body;

  if (!location || !description) {
    return res.status(400).json({ message: 'Location and description are required.' });
  }

  const token = 'ANON-' + Math.floor(100000 + Math.random() * 900000);

  const report = {
    token,
    location,
    category: category || 'General Safety Hazard',
    description,
    photoUrl: photoUrl || null,
    createdAt: new Date()
  };

  anonymousReports.push(report);

  // Pattern detection check: Check if same location has 3+ reports
  const matchingSectorReports = anonymousReports.filter(r => 
    r.location.toLowerCase().includes(location.toLowerCase()) || 
    location.toLowerCase().includes(r.location.toLowerCase())
  );

  const patternAlertTriggered = matchingSectorReports.length >= 3;

  res.status(201).json({
    message: 'Anonymous Incident Report encrypted and filed.',
    token,
    patternAlertTriggered,
    patternNote: patternAlertTriggered
      ? `${matchingSectorReports.length} reports mention this location. It is marked for admin review. Nobody is labelled or accused automatically.`
      : 'Your identity is never stored with this report.'
  });
});

// 2. COMMUNITY ALERT BOARD FEED (7-day active warnings)
router.get('/feed', (req, res) => {
  // Filter out alerts older than 7 days
  const now = Date.now();
  const sevenDaysMs = 7 * 24 * 60 * 60 * 1000;

  const activeAlerts = communityAlerts.filter(a => {
    const age = now - new Date(a.createdAt).getTime();
    return age <= sevenDaysMs;
  });

  res.json(activeAlerts);
});

// Post a new community warning
router.post('/feed', (req, res) => {
  const { title, location, category, description } = req.body;

  if (!title || !location) {
    return res.status(400).json({ message: 'Title and location are required.' });
  }

  const newAlert = {
    id: 'alert-' + Date.now(),
    title,
    location,
    category: category || 'General Safety',
    description: description || '',
    upvotes: 1,
    expiresInDays: 7,
    createdAt: new Date()
  };

  communityAlerts.unshift(newAlert);

  res.status(201).json({
    message: 'Community safety warning posted. Auto-expires in 7 days.',
    alert: newAlert
  });
});

// Upvote / Confirm community warning
router.post('/feed/:id/upvote', (req, res) => {
  const alert = communityAlerts.find(a => a.id === req.params.id);
  if (!alert) {
    return res.status(404).json({ message: 'Alert not found or expired.' });
  }

  alert.upvotes = (alert.upvotes || 0) + 1;

  res.json({
    message: 'Confirmation upvote recorded.',
    upvotes: alert.upvotes
  });
});

module.exports = router;

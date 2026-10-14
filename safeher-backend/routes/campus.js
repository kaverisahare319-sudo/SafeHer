const express = require('express');
const requireAuth = require('../middleware/auth');
const { escorts, heatmapReports } = require('../utils/memoryStore');

const router = express.Router();
router.use(requireAuth); // closed community: approved students only

const CAMPUS_ZONES = [
  {
    id: 'zone-1',
    name: 'Central Plaza & Main Library Walk',
    status: 'safe',
    levelText: 'Few student reports',
    lighting: 'Excellent (LED floodlights every 20m)',
    patrols: 'Campus Security station 50m away',
    reportsCount: 1
  },
  {
    id: 'zone-2',
    name: 'East Tree Grove & Old Greenhouse Path',
    status: 'caution',
    levelText: 'Some student reports',
    lighting: 'Moderate - 2 flickering lamp posts reported',
    patrols: 'Periodic bike patrol every 45 mins',
    reportsCount: 7
  },
  {
    id: 'zone-3',
    name: 'South Boundary Alley & Gate 4 Construction',
    status: 'unsafe',
    levelText: 'Many student reports',
    lighting: 'Poor - Temporary construction barricade, dark blindspots',
    patrols: 'Infrequent patrol, high foliage obstruction',
    reportsCount: 19
  }
];

// 1. CAMPUS ESCORT REQUEST — recorded for the college admin / security office to act on.
// SafeHer does not claim that anyone is on the way; the admin marks it acknowledged.
router.post('/escort/request', requireAuth, (req, res) => {
  const { pickupLocation, destination } = req.body;
  if (!pickupLocation || !destination) return res.status(400).json({ message: 'Pickup and destination are required.' });

  const escortId = 'escort-' + Date.now() + Math.random().toString(36).slice(2, 6);
  const newEscort = {
    escortId,
    userId: req.userId,
    pickupLocation: String(pickupLocation).slice(0, 120),
    destination: String(destination).slice(0, 120),
    status: 'requested', // requested -> acknowledged -> completed | cancelled
    createdAt: new Date()
  };
  escorts.set(escortId, newEscort);

  res.status(201).json({
    message: 'Escort request sent to the college security office. This is not an emergency service. If you are in danger, call 112.',
    escort: { escortId, pickupLocation: newEscort.pickupLocation, destination: newEscort.destination, status: newEscort.status }
  });
});

router.get('/escort/:id', requireAuth, (req, res) => {
  const e = escorts.get(req.params.id);
  if (!e || e.userId !== req.userId) return res.status(404).json({ message: 'Escort request not found' });
  res.json({ escortId: e.escortId, pickupLocation: e.pickupLocation, destination: e.destination, status: e.status });
});

router.post('/escort/:id/cancel', requireAuth, (req, res) => {
  const e = escorts.get(req.params.id);
  if (e && e.userId === req.userId) e.status = 'cancelled';
  res.json({ message: 'Escort request cancelled.' });
});

// 2. SAFETY HEATMAP: Get campus zones
router.get('/heatmap', (req, res) => {
  res.json(CAMPUS_ZONES);
});

// Drop anonymous hazard pin on heatmap
router.post('/heatmap/pin', (req, res) => {
  const { location, category, details } = req.body;
  const pin = {
    id: 'pin-' + Date.now(),
    location,
    category,
    details,
    createdAt: new Date()
  };
  heatmapReports.push(pin);

  res.status(201).json({
    message: 'Anonymous area pin submitted. It is shown as a student report, not a verified fact.',
    pin
  });
});

// 3. HOSTEL PANIC — SafeHer only alerts the user's own emergency contacts (done on the device).
// It never claims that wardens or police were notified.
router.post('/hostel/panic', requireAuth, (req, res) => {
  res.json({
    status: 'contacts_alert_ready',
    message: 'Alert prepared for your emergency contacts. Also call your hostel warden or 112 directly.'
  });
});

module.exports = router;

const express = require('express');
const requireAuth = require('../middleware/auth');
const liveShare = require('../utils/liveShare');

const router = express.Router();

// POST /api/location/update  { lat, lng }
// Only accepted while an emergency / SOS share is ACTIVE for this user. Location is held in memory
// for a limited time and is never stored permanently. There is no background tracking.
router.post('/update', requireAuth, (req, res) => {
  const { lat, lng } = req.body;
  if (typeof lat !== 'number' || typeof lng !== 'number') {
    return res.status(400).json({ message: 'lat and lng are required.' });
  }
  if (!liveShare.isActive(req.userId)) {
    return res.status(409).json({ message: 'Location is only shared during an active alert. Nothing was stored.' });
  }
  liveShare.set(req.userId, { lat, lng });
  res.json({ message: 'Live location refreshed for your active alert.' });
});

module.exports = router;

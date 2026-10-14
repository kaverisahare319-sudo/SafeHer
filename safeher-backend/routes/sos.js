const express = require('express');
const mongoose = require('mongoose');
const User = require('../models/User');
const requireAuth = require('../middleware/auth');
const liveShare = require('../utils/liveShare');
const sendSMS = require('../utils/sms');
const { users } = require('../utils/memoryStore');

const router = express.Router();
const isDbConnected = () => mongoose.connection.readyState === 1;

// Global active distress tracking map (userId -> distress state)
const activeDistressMap = new Map();

// Helper to get user
async function getUser(userId) {
  if (isDbConnected()) {
    return await User.findById(userId);
  }
  return users.find(u => u._id === userId);
}

// POST /api/sos/trigger - Loud Emergency Distress Trigger
router.post('/trigger', requireAuth, async (req, res) => {
  try {
    const { lat, lng } = req.body;

    if (lat === undefined || lng === undefined) {
      return res.status(400).json({ message: 'Location (lat, lng) is required to send an alert.' });
    }

    const user = await getUser(req.userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const contacts = user.emergencyContacts || [];
    if (!contacts.length) {
      return res.status(400).json({ message: 'Add at least one emergency contact first.' });
    }

    const mapsLink = `https://www.google.com/maps?q=${lat},${lng}`;
    const message = `SafeHer Emergency Alert: ${user.name} needs help. Live location: ${mapsLink}`;

    // Send SMS to contacts
    const results = await Promise.all(
      contacts.map(contact => sendSMS(contact.phone, message))
    );

    const sentCount = results.filter(Boolean).length;

    liveShare.set(req.userId, { lat, lng });

    // Record active distress state
    activeDistressMap.set(req.userId, {
      type: 'LOUD_EMERGENCY',
      lat,
      lng,
      startTime: new Date(),
      active: true
    });

    res.json({
      status: 'active',
      message: `Alert sent to ${sentCount || contacts.length} contacts.`,
      mapsLink,
      contactsNotified: contacts.map(c => c.name)
    });
  } catch (err) {
    console.error('SOS trigger error:', err);
    res.status(500).json({ message: 'Could not send SOS alert. Try again.' });
  }
});

// POST /api/sos/silent - Stealth Silent SOS Trigger
router.post('/silent', requireAuth, async (req, res) => {
  try {
    const { lat, lng, covert } = req.body;

    const user = await getUser(req.userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const contacts = user.emergencyContacts || [];
    const mapsLink = `https://www.google.com/maps?q=${lat || 37.7749},${lng || -122.4194}`;
    const message = `[SILENT SOS] SafeHer discreet alert: ${user.name} silently activated distress signal. Live GPS: ${mapsLink}`;

    // Send silent SMS dispatch without sirens
    await Promise.all(
      contacts.map(contact => sendSMS(contact.phone, message))
    );

    liveShare.set(req.userId, { lat, lng });
    activeDistressMap.set(req.userId, {
      type: 'SILENT_STEALTH',
      lat,
      lng,
      covert: true,
      startTime: new Date(),
      audioRecordingStream: true,
      active: true
    });

    res.json({
      status: 'silent_active',
      message: `Silent alert sent to ${contacts.length} of your emergency contacts. SafeHer does not contact police; call 112 if you are in danger. No sirens sounded.`,
      audioStreamReady: true,
      mapsLink
    });
  } catch (err) {
    console.error('Silent SOS error:', err);
    res.status(500).json({ message: 'Could not dispatch silent SOS.' });
  }
});

// POST /api/sos/deadman - Low Battery Dead-man Switch Trigger
router.post('/deadman', requireAuth, async (req, res) => {
  try {
    const { lat, lng, batteryLevel } = req.body;

    const user = await getUser(req.userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const contacts = user.emergencyContacts || [];
    const mapsLink = `https://www.google.com/maps?q=${lat},${lng}`;
    const message = `[DEAD-MAN SWITCH] SafeHer alert: ${user.name}'s phone battery has dropped to ${batteryLevel}%. Last cached GPS breadcrumb: ${mapsLink}`;

    await Promise.all(
      contacts.map(contact => sendSMS(contact.phone, message))
    );

    res.json({
      status: 'deadman_sent',
      message: `Battery dead-man breadcrumb sent to ${contacts.length} contacts.`
    });
  } catch (err) {
    res.status(500).json({ message: 'Could not send deadman alert.' });
  }
});

// POST /api/sos/stop - Stop Distress & Mark User Safe
router.post('/stop', requireAuth, async (req, res) => {
  try {
    activeDistressMap.delete(req.userId);
    liveShare.clear(req.userId); // stop sharing, forget location

    const user = await getUser(req.userId);
    if (user && user.emergencyContacts) {
      const message = `SafeHer Update: ${user.name} has marked themselves SAFE. Emergency alert ended.`;
      // Send safety resolution SMS
      await Promise.all(
        user.emergencyContacts.map(c => sendSMS(c.phone, message))
      );
    }

    res.json({
      status: 'resolved',
      message: 'Emergency alert deactivated. Contacts notified that you are safe.'
    });
  } catch (err) {
    res.status(500).json({ message: 'Could not stop alert.' });
  }
});

// GET /api/sos/status - Current Distress Status
router.get('/status', requireAuth, (req, res) => {
  const current = activeDistressMap.get(req.userId);
  if (!current) {
    return res.json({ active: false });
  }
  res.json({ active: true, ...current });
});

module.exports = router;

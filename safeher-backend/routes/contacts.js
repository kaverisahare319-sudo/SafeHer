const express = require('express');
const mongoose = require('mongoose');
const User = require('../models/User');
const requireAuth = require('../middleware/auth');
const { users } = require('../utils/memoryStore');

const router = express.Router();
const isDbConnected = () => mongoose.connection.readyState === 1;

// GET /api/contacts - list current user's emergency contacts
router.get('/', requireAuth, async (req, res) => {
  try {
    if (isDbConnected()) {
      const user = await User.findById(req.userId);
      return res.json(user?.emergencyContacts || []);
    } else {
      const user = users.find(u => u._id === req.userId);
      return res.json(user?.emergencyContacts || []);
    }
  } catch (err) {
    res.status(500).json({ message: 'Could not fetch contacts' });
  }
});

// POST /api/contacts - add a new emergency contact
router.post('/', requireAuth, async (req, res) => {
  try {
    const { name, phone } = req.body;

    if (!name || !phone) {
      return res.status(400).json({ message: 'Contact name and phone are required.' });
    }

    if (isDbConnected()) {
      const user = await User.findById(req.userId);
      if (!user) return res.status(404).json({ message: 'User not found' });
      user.emergencyContacts.push({ name, phone });
      await user.save();
      return res.status(201).json(user.emergencyContacts);
    } else {
      const user = users.find(u => u._id === req.userId);
      if (!user) return res.status(404).json({ message: 'User not found' });
      if (!user.emergencyContacts) user.emergencyContacts = [];
      user.emergencyContacts.push({ name, phone });
      return res.status(201).json(user.emergencyContacts);
    }
  } catch (err) {
    res.status(500).json({ message: 'Could not add contact' });
  }
});

// DELETE /api/contacts/:phone - remove a contact
router.delete('/:phone', requireAuth, async (req, res) => {
  try {
    const phone = req.params.phone;

    if (isDbConnected()) {
      const user = await User.findById(req.userId);
      if (!user) return res.status(404).json({ message: 'User not found' });
      user.emergencyContacts = user.emergencyContacts.filter(c => c.phone !== phone);
      await user.save();
      return res.json(user.emergencyContacts);
    } else {
      const user = users.find(u => u._id === req.userId);
      if (!user) return res.status(404).json({ message: 'User not found' });
      user.emergencyContacts = (user.emergencyContacts || []).filter(c => c.phone !== phone);
      return res.json(user.emergencyContacts);
    }
  } catch (err) {
    res.status(500).json({ message: 'Could not delete contact' });
  }
});

module.exports = router;

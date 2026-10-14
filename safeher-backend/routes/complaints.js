const express = require('express');
const requireAuth = require('../middleware/auth');
const store = require('../utils/complaintStore');

const router = express.Router();
const CATEGORIES = ['Harassment', 'Stalking / Following', 'Ragging / Bullying', 'Unsafe place', 'Staff / Faculty misconduct', 'Other'];
const DAILY_LIMIT = 5;

router.get('/categories', (req, res) => res.json(CATEGORIES));

// POST /api/complaints — anonymous: nothing identifying is saved with the complaint.
router.post('/', requireAuth, async (req, res) => {
  try {
    const description = String(req.body.description || '').trim();
    const category = CATEGORIES.includes(req.body.category) ? req.body.category : 'Other';
    const location = String(req.body.location || '').trim().slice(0, 120);
    if (description.length < 15) return res.status(400).json({ message: 'Please describe what happened (at least 15 characters).' });
    if (description.length > 2000) return res.status(400).json({ message: 'Description is too long (max 2000 characters).' });
    if (await store.countToday(req.userId) >= DAILY_LIMIT) {
      return res.status(429).json({ message: `You can file up to ${DAILY_LIMIT} complaints per day.` });
    }
    const c = await store.create(req.userId, { category, location, description });
    res.status(201).json({ message: 'Complaint submitted anonymously. Your name is not saved with it.', complaint: c });
  } catch (e) {
    console.error('Complaint error:', e.message);
    res.status(500).json({ message: 'Could not submit complaint.' });
  }
});

// GET /api/complaints/mine — only HER OWN complaints, with status and admin reply.
router.get('/mine', requireAuth, async (req, res) => {
  try { res.json(await store.mine(req.userId)); }
  catch (e) { res.status(500).json({ message: 'Could not load complaints.' }); }
});

module.exports = router;

const express = require('express');
const requireAuth = require('../middleware/auth');
const { requireAdmin } = require('../middleware/auth');
const userStore = require('../utils/userStore');
const complaintStore = require('../utils/complaintStore');
const { escorts } = require('../utils/memoryStore');

const router = express.Router();
router.use(requireAuth, requireAdmin);

const row = (u) => ({
  id: String(u._id), name: u.name, email: u.email, phone: u.phone, college: u.college,
  status: u.status, emailVerified: !!u.emailVerified, hasIdCard: !!u.idCardImage,
  rejectReason: u.rejectReason || null, createdAt: u.createdAt
});

router.get('/stats', async (req, res) => {
  const students = (await userStore.list({ role: 'user' }));
  res.json({
    students: {
      pending: students.filter(u => u.status === 'pending' && u.emailVerified).length,
      approved: students.filter(u => u.status === 'approved').length,
      rejected: students.filter(u => u.status === 'rejected').length
    },
    complaints: await complaintStore.stats()
  });
});

// Registrations. Only email-verified ones are shown as "pending" so admin doesn't review spam.
router.get('/users', async (req, res) => {
  const status = req.query.status || 'pending';
  const all = await userStore.list({ role: 'user', status });
  res.json(all.filter(u => status !== 'pending' || u.emailVerified).map(row));
});

router.get('/users/:id/id-card', async (req, res) => {
  const u = await userStore.findById(req.params.id);
  if (!u || !u.idCardImage) return res.status(404).json({ message: 'No ID card on file.' });
  res.json({ idCardImage: u.idCardImage });
});

// Approve / reject. The ID card photo is deleted right after the decision (data minimisation).
router.post('/users/:id/approve', async (req, res) => {
  const u = await userStore.findById(req.params.id);
  if (!u || u.role === 'admin') return res.status(404).json({ message: 'User not found.' });
  u.status = 'approved'; u.rejectReason = undefined; u.idCardImage = undefined;
  await userStore.save(u);
  res.json({ message: 'Student approved.', user: row(u) });
});
router.post('/users/:id/reject', async (req, res) => {
  const u = await userStore.findById(req.params.id);
  if (!u || u.role === 'admin') return res.status(404).json({ message: 'User not found.' });
  u.status = 'rejected'; u.rejectReason = String(req.body.reason || '').slice(0, 200) || undefined; u.idCardImage = undefined;
  await userStore.save(u);
  res.json({ message: 'Registration rejected.', user: row(u) });
});
// Block / unblock an already-approved account (e.g. misuse)
router.post('/users/:id/block', async (req, res) => {
  const u = await userStore.findById(req.params.id);
  if (!u || u.role === 'admin') return res.status(404).json({ message: 'User not found.' });
  u.status = 'rejected'; u.rejectReason = String(req.body.reason || 'Account blocked by admin').slice(0, 200);
  await userStore.save(u);
  res.json({ message: 'Account blocked.', user: row(u) });
});

// Complaints: identity is not stored, so it cannot be shown here.
router.get('/complaints', async (req, res) => res.json(await complaintStore.listAll(req.query.status)));
router.patch('/complaints/:id', async (req, res) => {
  const { status, adminReply } = req.body;
  if (status && !['open', 'in_review', 'resolved'].includes(status)) return res.status(400).json({ message: 'Invalid status.' });
  const c = await complaintStore.update(req.params.id, { status, adminReply: adminReply === undefined ? undefined : String(adminReply).slice(0, 1000) });
  if (!c) return res.status(404).json({ message: 'Complaint not found.' });
  res.json(c);
});

// Escort requests (shown with the student's name so security can find her)
router.get('/escorts', async (req, res) => {
  const out = [];
  for (const e of escorts.values()) {
    if (e.status === 'cancelled' || e.status === 'completed') continue;
    const u = await userStore.findById(e.userId);
    out.push({ id: e.escortId, name: u?.name || 'Student', phone: u?.phone, pickupLocation: e.pickupLocation, destination: e.destination, status: e.status, createdAt: e.createdAt });
  }
  res.json(out.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
});
router.patch('/escorts/:id', (req, res) => {
  const e = escorts.get(req.params.id);
  if (!e) return res.status(404).json({ message: 'Not found.' });
  if (!['acknowledged', 'completed'].includes(req.body.status)) return res.status(400).json({ message: 'Invalid status.' });
  e.status = req.body.status;
  res.json({ id: e.escortId, status: e.status });
});

module.exports = router;

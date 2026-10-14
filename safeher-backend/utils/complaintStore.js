const crypto = require('crypto');
const mongoose = require('mongoose');
const Complaint = require('../models/Complaint');
const { complaints } = require('./memoryStore');

const db = () => mongoose.connection.readyState === 1;

// One-way key: lets a student see HER OWN complaints and lets us rate-limit.
// The complaint itself holds no name/email/id and no API ever returns this key.
const ownerKey = (userId) =>
  crypto.createHmac('sha256', process.env.COMPLAINT_SALT || process.env.JWT_SECRET).update(`complaint:${userId}`).digest('hex');

const strip = (c) => ({
  id: String(c._id), category: c.category, location: c.location, description: c.description,
  status: c.status, adminReply: c.adminReply || null, createdAt: c.createdAt, repliedAt: c.repliedAt || null
});

async function create(userId, data) {
  const key = ownerKey(userId);
  if (db()) return strip(await Complaint.create({ ownerKey: key, ...data }));
  const c = { _id: 'c-' + Date.now() + Math.random().toString(36).slice(2, 6), ownerKey: key, status: 'open', createdAt: new Date(), ...data };
  complaints.push(c);
  return strip(c);
}
async function countToday(userId) {
  const key = ownerKey(userId), since = new Date(Date.now() - 24 * 3600 * 1000);
  if (db()) return Complaint.countDocuments({ ownerKey: key, createdAt: { $gte: since } });
  return complaints.filter(c => c.ownerKey === key && new Date(c.createdAt) >= since).length;
}
async function mine(userId) {
  const key = ownerKey(userId);
  const rows = db() ? await Complaint.find({ ownerKey: key }).sort({ createdAt: -1 }) : complaints.filter(c => c.ownerKey === key).sort((a, b) => b.createdAt - a.createdAt);
  return rows.map(strip);
}
async function listAll(status) {
  const f = status ? { status } : {};
  const rows = db() ? await Complaint.find(f).sort({ createdAt: -1 }) : complaints.filter(c => !status || c.status === status).sort((a, b) => b.createdAt - a.createdAt);
  return rows.map(strip);
}
async function update(id, { status, adminReply }) {
  if (db()) {
    const c = await Complaint.findById(id); if (!c) return null;
    if (status) c.status = status;
    if (adminReply !== undefined) { c.adminReply = adminReply; c.repliedAt = new Date(); }
    await c.save(); return strip(c);
  }
  const c = complaints.find(x => String(x._id) === String(id)); if (!c) return null;
  if (status) c.status = status;
  if (adminReply !== undefined) { c.adminReply = adminReply; c.repliedAt = new Date(); }
  return strip(c);
}
async function stats() {
  const all = await listAll();
  return { total: all.length, open: all.filter(c => c.status === 'open').length, in_review: all.filter(c => c.status === 'in_review').length, resolved: all.filter(c => c.status === 'resolved').length };
}
module.exports = { create, countToday, mine, listAll, update, stats };

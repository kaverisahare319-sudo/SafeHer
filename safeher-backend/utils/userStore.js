// One interface for users whether MongoDB is connected or the in-memory fallback is used.
const mongoose = require('mongoose');
const User = require('../models/User');
const { users } = require('./memoryStore');

const db = () => mongoose.connection.readyState === 1;

async function findByEmail(email) {
  return db() ? User.findOne({ email }) : users.find(u => u.email === email) || null;
}
async function findById(id) {
  if (!id) return null;
  if (db()) { try { return await User.findById(id); } catch { return null; } }
  return users.find(u => String(u._id) === String(id)) || null;
}
async function create(data) {
  if (db()) return User.create(data);
  const u = { _id: 'user-' + Date.now() + Math.random().toString(36).slice(2, 6), emergencyContacts: [], createdAt: new Date(), ...data };
  users.push(u);
  return u;
}
// `doc` is the object returned by find/create; mutate it then call save(doc).
async function save(doc) {
  if (db() && typeof doc.save === 'function') await doc.save();
  return doc;
}
async function list(filter = {}) {
  if (db()) return User.find(filter).sort({ createdAt: -1 });
  return users.filter(u => Object.entries(filter).every(([k, v]) => u[k] === v))
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}
async function count(filter = {}) {
  return (await list(filter)).length;
}
module.exports = { findByEmail, findById, create, save, list, count };

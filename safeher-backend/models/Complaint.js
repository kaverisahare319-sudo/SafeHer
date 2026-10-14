const mongoose = require('mongoose');

// NOTE: there is intentionally NO userId / name / email field here.
// `ownerKey` is a one-way HMAC so a student can see her own complaints and so
// we can rate-limit, but it is never returned by any API.
const complaintSchema = new mongoose.Schema({
  ownerKey: { type: String, required: true, index: true },
  category: { type: String, default: 'General' },
  location: { type: String },
  description: { type: String, required: true },
  status: { type: String, enum: ['open', 'in_review', 'resolved'], default: 'open' },
  adminReply: { type: String },
  repliedAt: { type: Date }
}, { timestamps: true });

module.exports = mongoose.model('Complaint', complaintSchema);

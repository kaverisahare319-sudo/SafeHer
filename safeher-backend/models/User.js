const mongoose = require('mongoose');

const contactSchema = new mongoose.Schema({
  name: { type: String, required: true },
  phone: { type: String, required: true }
}, { _id: false });

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  phone: { type: String, required: true },
  password: { type: String, required: true },
  college: { type: String },
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  // pending -> approved | rejected (set by admin after checking the college ID card)
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  rejectReason: { type: String },
  emailVerified: { type: Boolean, default: false },
  idCardImage: { type: String }, // data URL of the college ID card photo
  otpHash: { type: String },
  otpPurpose: { type: String }, // 'verify' | 'reset'
  otpExpires: { type: Date },
  otpAttempts: { type: Number, default: 0 },
  emergencyContacts: { type: [contactSchema], default: [] },
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);

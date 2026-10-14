const express = require('express');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const userStore = require('../utils/userStore');
const sendMail = require('../utils/mailer');
const rateLimit = require('../utils/rateLimit');

const router = express.Router();
router.use(rateLimit({ max: Number(process.env.AUTH_RATE_MAX || 40) }));

const OTP_TTL_MS = 10 * 60 * 1000;
const MAX_OTP_ATTEMPTS = 5;
const MAX_ID_CARD_CHARS = 2_500_000; // ~1.8 MB image as base64

const cleanEmail = (e) => String(e || '').toLowerCase().trim();
const otpHash = (email, otp) =>
  crypto.createHmac('sha256', process.env.JWT_SECRET).update(`${email}:${otp}`).digest('hex');

function allowedDomain(email) {
  const list = (process.env.ALLOWED_EMAIL_DOMAINS || '').split(',').map(s => s.trim().toLowerCase()).filter(Boolean);
  if (!list.length) return true;
  return list.includes(email.split('@')[1]);
}

async function issueOtp(user, purpose) {
  const otp = String(crypto.randomInt(100000, 1000000));
  user.otpHash = otpHash(user.email, otp);
  user.otpPurpose = purpose;
  user.otpExpires = new Date(Date.now() + OTP_TTL_MS);
  user.otpAttempts = 0;
  await userStore.save(user);
  const subject = purpose === 'reset' ? 'SafeHer password reset code' : 'Verify your SafeHer email';
  const text = `Your SafeHer ${purpose === 'reset' ? 'password reset' : 'verification'} code is ${otp}.\nIt is valid for 10 minutes. If you did not request it, ignore this email.`;
  const result = await sendMail(user.email, subject, text);
  const out = {};
  if (!result.sent && process.env.DEV_SHOW_OTP === 'true') out.devOtp = otp; // local testing only
  return out;
}

async function checkOtp(user, purpose, otp) {
  if (!user || !user.otpHash || user.otpPurpose !== purpose) return 'Invalid or expired code.';
  if (!user.otpExpires || new Date(user.otpExpires) < new Date()) return 'Code expired. Request a new one.';
  if ((user.otpAttempts || 0) >= MAX_OTP_ATTEMPTS) return 'Too many wrong attempts. Request a new code.';
  const given = otpHash(user.email, String(otp || '').trim());
  const ok = given.length === user.otpHash.length &&
    crypto.timingSafeEqual(Buffer.from(given), Buffer.from(user.otpHash));
  if (!ok) {
    user.otpAttempts = (user.otpAttempts || 0) + 1;
    await userStore.save(user);
    return 'Incorrect code.';
  }
  user.otpHash = undefined; user.otpPurpose = undefined; user.otpExpires = undefined; user.otpAttempts = 0;
  return null;
}

const publicUser = (u) => ({ id: u._id, name: u.name, email: u.email, role: u.role || 'user', college: u.college });
const signToken = (u) => jwt.sign({ userId: String(u._id), role: u.role || 'user' }, process.env.JWT_SECRET, { expiresIn: '30d' });

// POST /api/auth/signup  -> account is created as pending; email OTP sent; admin must approve ID card
router.post('/signup', async (req, res) => {
  try {
    const { name, phone, password, idCardImage, declaration } = req.body;
    const email = cleanEmail(req.body.email);

    if (!name || !email || !phone || !password) {
      return res.status(400).json({ message: 'Name, email, phone and password are required.' });
    }
    if (!/^\S+@\S+\.\S+$/.test(email)) return res.status(400).json({ message: 'Enter a valid email address.' });
    if (!allowedDomain(email)) return res.status(400).json({ message: 'Please use your college email address.' });
    if (!/^\+?[0-9 ]{10,15}$/.test(String(phone).trim())) return res.status(400).json({ message: 'Enter a valid phone number.' });
    if (String(password).length < 8) return res.status(400).json({ message: 'Password must be at least 8 characters.' });
    if (declaration !== true) return res.status(400).json({ message: 'Please confirm that you are a female student of this college.' });
    if (!/^data:image\/(jpeg|png|webp);base64,/.test(String(idCardImage || ''))) {
      return res.status(400).json({ message: 'Upload a photo of your college ID card.' });
    }
    if (idCardImage.length > MAX_ID_CARD_CHARS) return res.status(400).json({ message: 'ID card image is too large (max ~1.8 MB).' });

    let user = await userStore.findByEmail(email);
    const hashed = await bcrypt.hash(password, 10);

    if (user) {
      if (user.emailVerified) return res.status(409).json({ message: 'An account with this email already exists.' });
      // Unverified earlier attempt: let her retry with fresh details.
      Object.assign(user, { name: name.trim(), phone: String(phone).trim(), password: hashed, idCardImage, college: process.env.COLLEGE_NAME });
      await userStore.save(user);
    } else {
      user = await userStore.create({
        name: name.trim(), email, phone: String(phone).trim(), password: hashed,
        college: process.env.COLLEGE_NAME || 'College', role: 'user', status: 'pending',
        emailVerified: false, idCardImage
      });
    }

    const extra = await issueOtp(user, 'verify');
    res.status(201).json({ message: 'Account created. Enter the code we emailed to verify your email.', email, ...extra });
  } catch (err) {
    console.error('Signup error:', err);
    res.status(500).json({ message: 'Something went wrong. Try again.' });
  }
});

// POST /api/auth/verify-email
router.post('/verify-email', async (req, res) => {
  try {
    const email = cleanEmail(req.body.email);
    const user = await userStore.findByEmail(email);
    const err = await checkOtp(user, 'verify', req.body.otp);
    if (err) return res.status(400).json({ message: err });
    user.emailVerified = true;
    await userStore.save(user);
    res.json({ message: 'Email verified. Your college ID is now waiting for admin approval.', status: user.status });
  } catch (e) {
    console.error('Verify error:', e);
    res.status(500).json({ message: 'Something went wrong. Try again.' });
  }
});

// POST /api/auth/resend-otp  { email, purpose? }
router.post('/resend-otp', async (req, res) => {
  try {
    const user = await userStore.findByEmail(cleanEmail(req.body.email));
    let extra = {};
    if (user && !user.emailVerified) extra = await issueOtp(user, 'verify');
    res.json({ message: 'If this email needs verification, a new code has been sent.', ...extra });
  } catch (e) {
    res.status(500).json({ message: 'Something went wrong. Try again.' });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const email = cleanEmail(req.body.email);
    const { password } = req.body;
    if (!email || !password) return res.status(400).json({ message: 'Email and password are required.' });

    const user = await userStore.findByEmail(email);
    const match = user ? await bcrypt.compare(password, user.password) : false;
    if (!user || !match) return res.status(401).json({ message: 'Invalid email or password.' });

    if (user.role !== 'admin') {
      if (!user.emailVerified) {
        return res.status(403).json({ code: 'EMAIL_NOT_VERIFIED', message: 'Please verify your email first.', email });
      }
      if (user.status === 'pending') {
        return res.status(403).json({ code: 'PENDING_APPROVAL', message: 'Your college ID is being checked by the admin. You will be able to sign in once approved.' });
      }
      if (user.status === 'rejected') {
        return res.status(403).json({ code: 'REJECTED', message: user.rejectReason ? `Your registration was rejected: ${user.rejectReason}` : 'Your registration was rejected by the admin.' });
      }
    }
    res.json({ token: signToken(user), user: publicUser(user) });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: 'Something went wrong. Try again.' });
  }
});

// POST /api/auth/forgot-password  { email }  (always same answer, so emails can't be probed)
router.post('/forgot-password', async (req, res) => {
  try {
    const user = await userStore.findByEmail(cleanEmail(req.body.email));
    let extra = {};
    if (user && user.emailVerified) extra = await issueOtp(user, 'reset');
    res.json({ message: 'If an account exists for this email, a reset code has been sent.', ...extra });
  } catch (e) {
    res.status(500).json({ message: 'Something went wrong. Try again.' });
  }
});

// POST /api/auth/reset-password  { email, otp, newPassword }
router.post('/reset-password', async (req, res) => {
  try {
    const { otp, newPassword } = req.body;
    if (!newPassword || String(newPassword).length < 8) return res.status(400).json({ message: 'Password must be at least 8 characters.' });
    const user = await userStore.findByEmail(cleanEmail(req.body.email));
    const err = await checkOtp(user, 'reset', otp);
    if (err) return res.status(400).json({ message: err });
    user.password = await bcrypt.hash(newPassword, 10);
    await userStore.save(user);
    res.json({ message: 'Password updated. You can sign in now.' });
  } catch (e) {
    console.error('Reset error:', e);
    res.status(500).json({ message: 'Something went wrong. Try again.' });
  }
});

module.exports = router;

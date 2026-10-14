require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');

// Feature Routers
const authRoutes = require('./routes/auth');
const contactsRoutes = require('./routes/contacts');
const sosRoutes = require('./routes/sos');
const locationRoutes = require('./routes/location');
const nightoutRoutes = require('./routes/nightout');
const campusRoutes = require('./routes/campus');
const reportsRoutes = require('./routes/reports');
const complaintsRoutes = require('./routes/complaints');
const adminRoutes = require('./routes/admin');
const bcrypt = require('bcryptjs');
const userStore = require('./utils/userStore');

if (!process.env.JWT_SECRET) {
  if (process.env.NODE_ENV === 'production') { console.error('JWT_SECRET is required in production.'); process.exit(1); }
  process.env.JWT_SECRET = require('crypto').randomBytes(32).toString('hex');
  console.warn('⚠️ JWT_SECRET not set: using a temporary random secret (logins reset on restart).');
}

const app = express();
app.disable('x-powered-by');

// Configure CORS
const allowedOrigins = (process.env.FRONTEND_URL || 'http://localhost:3000,http://localhost:5173,http://localhost:5500')
  .split(',')
  .map(s => s.trim())
  .filter(Boolean);

app.use(cors({
  origin: function (origin, callback) {
    // No Origin header: mobile apps, curl, server-to-server
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin) || /^https?:\/\/localhost(:\d+)?$/.test(origin)) return callback(null, true);
    return callback(new Error('Origin not allowed'));
  }
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health Check
app.get('/', (req, res) => {
  res.json({
    status: 'SafeHer backend is running.',
    version: '2.0.0',
    suite: 'Women Safety & Campus Protection Suite',
    dbMode: connectDB.isConnected() ? 'MongoDB Connected' : 'In-Memory Resilient Fallback Store'
  });
});

app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date(),
    uptimeSeconds: Math.round(process.uptime()),
    features: [
      'Auth & JWT',
      'Emergency Contacts',
      'Loud & Silent SOS',
      'Low Battery Dead-man Switch',
      'Walk Me Home Live Tracking',
      'Drink Spiked Silent Trigger',
      'Verified Ride Cross-Check',
      'Buddy Matching',
      'Campus Escort Request',
      'Safety Heatmap & Pins',
      'Hostel Panic Broadcast',
      'Anonymous Incident Pattern Detection',
      '7-Day Expiring Community Feed'
    ]
  });
});

// Route Mounts
app.use('/api/auth', authRoutes);
app.use('/api/contacts', contactsRoutes);
app.use('/api/sos', sosRoutes);
app.use('/api/location', locationRoutes);
app.use('/api/nightout', nightoutRoutes);
app.use('/api/campus', campusRoutes);
app.use('/api/reports', reportsRoutes);
app.use('/api/complaints', complaintsRoutes);
app.use('/api/admin', adminRoutes);

// Error Handling Middleware
app.use((err, req, res, next) => {
  console.error('Server error handler:', err);
  res.status(500).json({ message: 'Internal Server Error', error: err.message });
});

const PORT = process.env.PORT || 5000;

async function seedAdmin() {
  const email = (process.env.ADMIN_EMAIL || '').toLowerCase().trim();
  const password = process.env.ADMIN_PASSWORD;
  if (!email || !password) { console.warn('⚠️ ADMIN_EMAIL / ADMIN_PASSWORD not set: no admin account exists.'); return; }
  let admin = await userStore.findByEmail(email);
  const hashed = await bcrypt.hash(password, 10);
  if (!admin) {
    await userStore.create({
      name: process.env.ADMIN_NAME || 'College Admin', email, phone: process.env.ADMIN_PHONE || '0000000000', password: hashed,
      college: process.env.COLLEGE_NAME || 'College', role: 'admin', status: 'approved', emailVerified: true
    });
    console.log(`👤 Admin account created for ${email}`);
  } else {
    Object.assign(admin, { role: 'admin', status: 'approved', emailVerified: true, password: hashed });
    await userStore.save(admin);
  }
}

connectDB().then(seedAdmin).then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 SafeHer backend successfully running on port ${PORT}`);
    console.log(`📡 Healthcheck available at: http://localhost:${PORT}/api/health`);
  });
});
console.log(
  'MongoDB URI loaded:',
  Boolean(process.env.MONGO_URI)
);
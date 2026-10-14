const mongoose = require('mongoose');

let isConnected = false;

async function connectDB() {
  const uri = process.env.MONGO_URI;

  if (!uri) {
    console.warn('⚠️ [SafeHer DB] No MONGO_URI specified in .env. Server will run with in-memory persistence fallback.');
    return false;
  }

  try {
    // Attempt connection with a short timeout to prevent blocking startup
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 3000,
    });
    isConnected = true;
    console.log('✅ [SafeHer DB] MongoDB successfully connected to:', uri.split('@').pop());
    return true;
  } catch (err) {
    console.warn(`⚠️ [SafeHer DB] MongoDB connection failed (${err.message}).`);
    console.log('ℹ️ [SafeHer DB] Server will run with in-memory mock store fallback so all endpoints remain operational.');
    return false;
  }
}

connectDB.isConnected = () => isConnected;

module.exports = connectDB;

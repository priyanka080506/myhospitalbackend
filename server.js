// server.js - Complete Fixed Version
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const app = express();

// ======================
// 1. ERROR HANDLING SETUP
// ======================
process.on('uncaughtException', (err) => {
  console.error('💥 CRITICAL UNCAUGHT EXCEPTION! Shutting down...');
  console.error(err.name, err.message);
  process.exit(1);
});

// ======================
// 2. DATABASE CONNECTION
// ======================
const DB = process.env.MONGODB_URI.replace(
  '<PASSWORD>',
  process.env.DB_PASSWORD
);

mongoose.connect(DB)
  .then(() => console.log('✅ Database connection successful!'))
  .catch(err => {
    console.error('❌ DATABASE CONNECTION ERROR:', err);
    process.exit(1);
  });

// ======================
// 3. MIDDLEWARE
// ======================
app.use(express.json());
app.use(express.static('public'));

// ======================
// 4. ROUTES
// ======================
// Mount routes with proper paths
app.use('/api/patients', require('./routes/patientRoutes'));
app.use('/api/reports', require('./routes/reportRoutes'));
app.use('/api/appointments', require('./routes/appointmentRoutes'));
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/users', require('./routes/userRoutes'));

// ======================
// 5. TEST ROUTE
// ======================
app.get('/api/test/:param', (req, res) => {
  res.json({ 
    status: 'working',
    param: req.params.param,
    timestamp: new Date() 
  });
});

// ======================
// 6. START SERVER
// ======================
const PORT = process.env.PORT || 3000;
const server = app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🔗 Test endpoint: http://localhost:${PORT}/api/test/123`);
});

// Handle promise rejections
process.on('unhandledRejection', (err) => {
  console.error('UNHANDLED REJECTION! Shutting down...');
  console.error(err.name, err.message);
  server.close(() => process.exit(1));
});
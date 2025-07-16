const express = require('express');
const app = express();

// Correct way to mount routes:
app.use('/api/appointments', require('./routes/appointmentRoutes')); 
app.use('/api/patients', require('./routes/patientRoutes'));
app.use('/api/reports', require('./routes/reportRoutes'));
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/users', require('./routes/userRoutes'));

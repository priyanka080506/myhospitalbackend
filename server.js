// server.js

// 1. Load environment variables from .env file FIRST.
// This line must be at the very top of your file to ensure process.env variables are loaded.
require('dotenv').config();

// --- DEBUGGING LOGS: START ---
console.log('--- Server Startup Debugging Check ---');
console.log('Current working directory:', process.cwd());
console.log('process.env.NODE_ENV:', process.env.NODE_ENV);
console.log('process.env.PORT:', process.env.PORT);
console.log('process.env.MONGO_URI (raw from process.env):', process.env.MONGO_URI ? '****** (present)' : 'NOT SET');
console.log('process.env.JWT_SECRET (raw from process.env):', process.env.JWT_SECRET ? '****** (present)' : 'NOT SET');
console.log('-----------------------------------------');
// --- DEBUGGING LOGS: END ---


// 2. Import necessary libraries
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

// --- Import all your route files ---
// *************************************************************************
// ******* IMPORTANT: ONLY 'doctorRoutes' IS UNCOMMENTED FOR THIS STEP ******
// *************************************************************************
const authRoutes = require('./routes/authRoutes'); // COMMENTED OUT for debugging
const doctorRoutes = require('./routes/doctorRoutes'); // LEAVE THIS ONE UNCOMMENTED
const patientRoutes = require('./routes/patientRoutes'); // COMMENTED OUT for debugging
const appointmentRoutes = require('./routes/appointmentRoutes'); // COMMENTED OUT for debugging
const reportRoutes = require('./routes/reportRoutes'); // COMMENTED OUT for debugging
const userRoutes = require('./routes/userRoutes'); // COMMENTED OUT for debugging


// 3. Initialize Express app
const app = express();

// 4. Get PORT and MongoDB URI from environment variables
const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGO_URI;

// --- DEBUGGING LOG: Check MONGODB_URI and JWT_SECRET after assignment ---
console.log('MONGODB_URI variable after assignment:', MONGODB_URI ? '****** (assigned)' : 'NOT ASSIGNED');
// --- DEBUGGING LOG: END ---

// --- 5. Middleware ---
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));


// --- 6. MongoDB Connection ---
mongoose.connect(MONGODB_URI)
    .then(() => {
        console.log('MongoDB connected successfully!');
        app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
            console.log(`Access your frontend at: http://localhost:${PORT}`);
            console.log(`API endpoints will be at: http://localhost:${PORT}/api/...`);
        });
    })
    .catch(err => {
        console.error('MongoDB connection error:');
        console.error(err);
        process.exit(1);
    });

// --- 7. API Routes ---
// *************************************************************************
// ******* IMPORTANT: ONLY 'doctorRoutes' IS UNCOMMENTED FOR THIS STEP ******
// *************************************************************************
app.use('/api/users', userRoutes); // COMMENTED OUT for debugging
app.use('/api/auth', authRoutes); // COMMENTED OUT for debugging
app.use('/api/doctors', doctorRoutes); // LEAVE THIS ONE UNCOMMENTED
app.use('/api/patients', patientRoutes); // COMMENTED OUT for debugging
app.use('/api/appointments', appointmentRoutes); // COMMENTED OUT for debugging
app.use('/api/reports', reportRoutes); // COMMENTED OUT for debugging


// --- 8. Serve Frontend (Catch-all for non-API routes) ---
app.get('*', (req, res) => {
    if (req.path.startsWith('/api/')) {
        res.status(404).json({ message: "API endpoint not found" });
    } else {
        res.sendFile(path.join(__dirname, 'public', 'index2.html'));
    }
});


// --- 9. Global Error Handling Middleware ---
app.use((err, req, res, next) => {
    console.error('Global Error Handler:', err.stack);
    res.status(err.status || 500).json({
        message: err.message || 'Something went wrong on the server!',
        error: process.env.NODE_ENV === 'production' ? {} : err
    });
});
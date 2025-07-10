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
// ******* ALL OTHER ROUTE REQUIRES ARE TEMPORARILY COMMENTED OUT **********
// *************************************************************************
// const authRoutes = require('./routes/authRoutes');
const doctorRoutes = require('./routes/doctorRoutes'); // <-- THIS ONE IS UNCOMMENTED
// const patientRoutes = require('./routes/patientRoutes');
// const appointmentRoutes = require('./routes/appointmentRoutes');
// const reportRoutes = require('./routes/reportRoutes');
// const userRoutes = require('./routes/userRoutes');


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
        // process.exit(1); // <--- THIS LINE SHOULD BE COMMENTED OUT FOR DEBUGGING
    });

// --- 7. API Routes ---
// *************************************************************************
// ******* IMPORTANT: ONLY 'doctorRoutes' IS UNCOMMENTED FOR THIS STEP ******
// ******* ALL OTHER APP.USE LINES ARE TEMPORARILY COMMENTED OUT ***********
// *************************************************************************
// app.use('/api/users', userRoutes);
// app.use('/api/auth', authRoutes);
app.use('/api/doctors', doctorRoutes); // <-- THIS ONE IS UNCOMMENTED
// app.use('/api/patients', patientRoutes);
// app.use('/api/appointments', appointmentRoutes);
// app.use('/api/reports', reportRoutes);


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
// server.js

// 1. Load environment variables from .env file FIRST.
// This line must be at the very top of your file.
require('dotenv').config();

// 2. Import necessary libraries
const express = require('express');
const mongoose = require('mongoose'); // For MongoDB interaction
const cors = require('cors');         // For Cross-Origin Resource Sharing
const path = require('path');         // Node.js built-in module for working with file and directory paths

// --- ADDED FOR AUTHENTICATION ROUTES ---
const authRoutes = require('./routes/authRoutes');

// --- ADDED FOR DOCTOR ROUTES ---
const doctorRoutes = require('./routes/doctorRoutes');

// --- ADDED FOR PATIENT ROUTES ---
const patientRoutes = require('./routes/patientRoutes');

// --- ADDED FOR APPOINTMENT ROUTES ---
const appointmentRoutes = require('./routes/appointmentRoutes'); // <-- NEW LINE ADDED HERE!

// 3. Initialize Express app
const app = express();

// 4. Get PORT and MongoDB URI from environment variables
const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI;

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
        console.error('MongoDB connection error:', err);
        process.exit(1);
    });

// --- 7. API Routes ---
const userRoutes = require('./routes/userRoutes');
app.use('/api/users', userRoutes);

app.use('/api/auth', authRoutes);

app.use('/api/doctors', doctorRoutes);

app.use('/api/patients', patientRoutes);

app.use('/api/appointments', appointmentRoutes); // <-- NEW LINE ADDED HERE!


// Example for Doctors API (assuming you create routes/doctors.js with a 'router' export)
// const doctorsRouter = require('./routes/doctors');
// app.use('/api/doctors', doctorsRouter);

// Example for Patients API (assuming you create routes/patients.js with a 'router' export)
// const patientsRouter = require('./routes/patients');
// app.use('/api/patients', patientsRouter);

// Add other API routes as you build them, e.g.:
// app.use('/api/services', require('./routes/services'));


// --- 8. Catch-all for undefined API routes (Optional) ---
app.use((req, res, next) => {
    if (req.path.startsWith('/api/')) {
        res.status(404).json({ message: "API endpoint not found" });
    } else {
        res.status(404).send("Page not found");
    }
});


// --- 9. Global Error Handling Middleware (Optional but Recommended) ---
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: 'Something went wrong on the server!', error: err.message });
});
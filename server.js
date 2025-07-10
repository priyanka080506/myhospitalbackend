// server.js

// 1. Load environment variables from .env file FIRST.
// This line must be at the very top of your file.
require('dotenv').config();

// --- DEBUGGING LOGS: START ---
console.log('--- Render Deployment Debugging Check ---');
console.log('Current working directory:', process.cwd());
console.log('process.env.NODE_ENV:', process.env.NODE_ENV); // Render usually sets this to 'production'
console.log('process.env.PORT:', process.env.PORT); // Render sets its own PORT
console.log('process.env.MONGO_URI (raw from process.env):', process.env.MONGO_URI); // THIS IS THE KEY ONE
console.log('process.env.JWT_SECRET (raw from process.env):', process.env.JWT_SECRET);
console.log('-----------------------------------------');
// --- DEBUGGING LOGS: END ---


// 2. Import necessary libraries
const express = require('express');
const mongoose = require('mongoose'); // For MongoDB interaction
const cors = require('cors');         // For Cross-Origin Resource Sharing
const path = require('path');         // Node.js built-in module for working with file and directory paths

// --- Import all your route files ---
const authRoutes = require('./routes/authRoutes');
const doctorRoutes = require('./routes/doctorRoutes'); // Ensure this is imported
const patientRoutes = require('./routes/patientRoutes');
const appointmentRoutes = require('./routes/appointmentRoutes');
// Assuming userRoutes exists, if not, remove or create it
const userRoutes = require('./routes/userRoutes'); 


// 3. Initialize Express app
const app = express();

// 4. Get PORT and MongoDB URI from environment variables
const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGO_URI;

// --- DEBUGGING LOG: Check MONGODB_URI after assignment ---
console.log('MONGODB_URI variable after assignment:', MONGODB_URI);
// --- DEBUGGING LOG: END ---

// --- 5. Middleware ---
app.use(cors());
app.use(express.json());
// Serve static files from the 'public' directory
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
// Mount your route files here
app.use('/api/users', userRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/doctors', doctorRoutes); // Ensure this line is present and correct
app.use('/api/patients', patientRoutes);
app.use('/api/appointments', appointmentRoutes);


// --- 8. Catch-all for undefined API routes (Optional, but useful for debugging) ---
app.use((req, res, next) => {
    if (req.path.startsWith('/api/')) {
        // If it's an API path but no route matched, send 404 JSON
        res.status(404).json({ message: "API endpoint not found" });
    } else {
        // For non-API paths, let Express handle static files or send a generic 404 HTML
        res.status(404).send("Page not found");
    }
});


// --- 9. Global Error Handling Middleware (Optional but Recommended) ---
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: 'Something went wrong on the server!', error: err.message });
});

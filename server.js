// server.js

// 1. Load environment variables from .env file FIRST.
// This line must be at the very top of your file to ensure process.env variables are loaded.
require('dotenv').config();

// --- DEBUGGING LOGS: START ---
// These logs are extremely helpful for verifying environment variables
// both locally and in deployment environments like Render.
console.log('--- Server Startup Debugging Check ---');
console.log('Current working directory:', process.cwd());
console.log('process.env.NODE_ENV:', process.env.NODE_ENV); // Render usually sets this to 'production'
console.log('process.env.PORT:', process.env.PORT); // Render sets its own PORT, or defaults to 5000 locally
console.log('process.env.MONGO_URI (raw from process.env):', process.env.MONGO_URI ? '****** (present)' : 'NOT SET'); // Masking for security
console.log('process.env.JWT_SECRET (raw from process.env):', process.env.JWT_SECRET ? '****** (present)' : 'NOT SET'); // Masking for security
console.log('-----------------------------------------');
// --- DEBUGGING LOGS: END ---


// 2. Import necessary libraries
const express = require('express');
const mongoose = require('mongoose'); // For MongoDB interaction
const cors = require('cors');         // For Cross-Origin Resource Sharing
const path = require('path');         // Node.js built-in module for working with file and directory paths

// --- Import all your route files ---
// Ensure these paths are correct relative to your server.js file
const authRoutes = require('./routes/authRoutes');
const doctorRoutes = require('./routes/doctorRoutes');
const patientRoutes = require('./routes/patientRoutes');
const appointmentRoutes = require('./routes/appointmentRoutes');
const reportRoutes = require('./routes/reportRoutes'); // Make sure you have a reportRoutes file
const userRoutes = require('./routes/userRoutes'); // Assuming userRoutes exists, if not, remove or create it


// 3. Initialize Express app
const app = express();

// 4. Get PORT and MongoDB URI from environment variables
// Use process.env.PORT for deployment, fallback to 5000 for local development.
const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGO_URI;

// --- DEBUGGING LOG: Check MONGODB_URI and JWT_SECRET after assignment ---
console.log('MONGODB_URI variable after assignment:', MONGODB_URI ? '****** (assigned)' : 'NOT ASSIGNED');
// JWT_SECRET is typically used inside auth middleware, so no direct log here,
// but its presence is checked above.
// --- DEBUGGING LOG: END ---

// --- 5. Middleware ---
// Enable CORS for all origins during development. For production, restrict to your frontend's domain.
app.use(cors());

// Parse JSON request bodies (for POST/PUT requests)
app.use(express.json());

// Serve static files from the 'public' directory.
// This is crucial for serving your HTML, CSS, and JS frontend files.
// The 'public' directory should contain index2.html, report.html, styles2.css, stylesr.css, script2.js, scriptr.js
app.use(express.static(path.join(__dirname, 'public')));


// --- 6. MongoDB Connection ---
mongoose.connect(MONGODB_URI)
    .then(() => {
        console.log('MongoDB connected successfully!');
        // Start the server ONLY after a successful database connection.
        app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
            console.log(`Access your frontend at: http://localhost:${PORT}`);
            console.log(`API endpoints will be at: http://localhost:${PORT}/api/...`);
        });
    })
    .catch(err => {
        console.error('MongoDB connection error:');
        console.error(err); // Log the full error object for detailed information
        process.exit(1); // Exit the process with an error code if DB connection fails
    });

// --- 7. API Routes ---
// Mount your route files under specific API paths.
// Ensure your route files (e.g., authRoutes.js) export an Express router.
app.use('/api/users', userRoutes);         // KEEP ONLY THIS ONE UNCOMMENTED FOR NOW
// app.use('/api/auth', authRoutes);
// app.use('/api/doctors', doctorRoutes);
// app.use('/api/patients', patientRoutes);
// app.use('/api/appointments', appointmentRoutes);
// app.use('/api/reports', reportRoutes);


// --- 8. Serve Frontend (Catch-all for non-API routes) ---
// For any GET request that doesn't match an API route, serve your main HTML file.
// This is common for Single Page Applications (SPAs) or when directly serving HTML.
// It ensures that if a user navigates directly to a frontend route (e.g., /dashboard),
// your index2.html is served, and the client-side router takes over.
app.get('*', (req, res) => {
    // Check if the request path starts with '/api/', if so, it means no API route matched.
    // Otherwise, assume it's a request for a frontend resource.
    if (req.path.startsWith('/api/')) {
        res.status(404).json({ message: "API endpoint not found" });
    } else {
        // Serve your main index file. Make sure this path is correct.
        // It assumes index2.html is directly in the 'public' directory.
        res.sendFile(path.join(__dirname, 'public', 'index2.html'));
    }
});


// --- 9. Global Error Handling Middleware ---
// This middleware catches errors thrown by other middleware or route handlers.
// It should be the last app.use() call.
app.use((err, req, res, next) => {
    console.error('Global Error Handler:', err.stack); // Log the full stack trace for debugging
    res.status(err.status || 500).json({
        message: err.message || 'Something went wrong on the server!',
        error: process.env.NODE_ENV === 'production' ? {} : err // Send less detail in production
    });
});
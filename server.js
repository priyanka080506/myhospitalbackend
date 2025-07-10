// server.js

require('dotenv').config(); // Load environment variables from .env file

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path'); // Core Node.js module for handling file paths

// --- Import Route Files ---
const patientRoutes = require('./routes/patientRoutes');
const appointmentRoutes = require('./routes/appointmentRoutes');
const doctorRoutes = require('./routes/doctorRoutes'); // NEW: Import doctor routes

const app = express();

// --- Database Connection ---
const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB Connected...');
    } catch (err) {
        console.error('MongoDB Connection Error:', err.message);
        // Exit process with failure
        process.exit(1);
    }
};

// Connect to Database
connectDB();

// --- Middleware ---
// Enable CORS for all origins (adjust in production for specific origins)
app.use(cors());

// Body parser middleware to handle JSON data
app.use(express.json());

// --- Serve Static Assets in Production ---
// Check if in production environment
if (process.env.NODE_ENV === 'production') {
    // Set static folder
    app.use(express.static(path.join(__dirname, 'public')));

    // Serve index.html for any unknown routes
    app.get('*', (req, res) => {
        res.sendFile(path.resolve(__dirname, 'public', 'index.html'));
    });
} else {
    // In development, you might just serve directly from public or use a dev server
    // For now, let's also serve static files from 'public' in development for easy access
    app.use(express.static(path.join(__dirname, 'public')));
    console.log('Serving static files from /public in development mode.');
}


// --- Define API Routes ---
app.use('/api/patients', patientRoutes); // Patient registration, profile, reports etc.
app.use('/api/appointments', appointmentRoutes); // Appointment booking (public and patient specific)
app.use('/api/doctors', doctorRoutes); // Doctor registration, login, profile, schedule, reports etc.


// --- Basic Root Route (Optional, if not covered by static serving) ---
app.get('/', (req, res) => {
    res.send('API is running...');
});


// --- Server Start ---
const PORT = process.env.PORT || 5000; // Use port from .env or default to 5000

app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
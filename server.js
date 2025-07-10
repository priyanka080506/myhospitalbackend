// server.js

require('dotenv').config(); // Load environment variables from .env file

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path'); // Core Node.js module for handling file paths

// --- Import Route Files ---
const patientRoutes = require('./routes/patientRoutes');
const appointmentRoutes = require('./routes/appointmentRoutes');
const doctorRoutes = require('./routes/doctorRoutes');

const app = express();

// --- Debugging startup logs ---
console.log('Server starting...');
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('MONGO_URI:', process.env.MONGO_URI ? '*********** (set)' : 'MONGO_URI is NOT set');
console.log('JWT_SECRET:', process.env.JWT_SECRET ? '*********** (set)' : 'JWT_SECRET is NOT set');


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

// --- Basic Health Check Route (Added as a very first route for testing) ---
// This route is placed very early to test basic Express functionality.
app.get('/api/health', (req, res) => {
    res.status(200).json({ status: 'ok', message: 'API is healthy and basic routes work.' });
    console.log('Health check route hit successfully.');
});


// --- Define API Routes with Error Catching ---
console.log('Attempting to register API routes...');
try {
    app.use('/api/patients', patientRoutes);
    console.log('Successfully registered /api/patients routes.');
} catch (e) {
    console.error('CRITICAL ERROR during /api/patients route registration:', e.message);
    process.exit(1); // Exit to make error clear in logs
}

try {
    app.use('/api/appointments', appointmentRoutes);
    console.log('Successfully registered /api/appointments routes.');
} catch (e) {
    console.error('CRITICAL ERROR during /api/appointments route registration:', e.message);
    process.exit(1); // Exit to make error clear in logs
}

try {
    app.use('/api/doctors', doctorRoutes);
    console.log('Successfully registered /api/doctors routes.');
} catch (e) {
    console.error('CRITICAL ERROR during /api/doctors route registration:', e.message);
    process.exit(1); // Exit to make error clear in logs
}
console.log('All API routes registration attempts completed.');


// --- Serve Static Assets in Production ---
// Check if in production environment
if (process.env.NODE_ENV === 'production') {
    // Set static folder
    app.use(express.static(path.join(__dirname, 'public')));
    console.log('Serving static files from /public in production mode.');

    // Serve index.html for any unknown routes
    app.get('*', (req, res) => {
        res.sendFile(path.resolve(__dirname, 'public', 'index.html'));
        console.log('Serving index.html for production client routes.');
    });
} else {
    // In development, serve static files from 'public' as well
    app.use(express.static(path.join(__dirname, 'public')));
    console.log('Serving static files from /public in development mode.');
    // Simple root route for dev
    app.get('/', (req, res) => {
        res.send('API is running in development...');
        console.log('Dev root route hit.');
    });
}


// --- Server Start ---
const PORT = process.env.PORT || 5000; // Use port from .env or default to 5000

app.listen(PORT, () => console.log(`Server started on port ${PORT}`));

// --- Global Error Handling (Catch-all for unhandled errors) ---
app.use((err, req, res, next) => {
    console.error('-------------------------------------------');
    console.error('GLOBAL UNHANDLED ERROR CAUGHT:');
    console.error(err.stack); // Log the full stack trace of any unhandled error
    console.error('-------------------------------------------');
    res.status(500).send('Server Error: Something went wrong!');
});
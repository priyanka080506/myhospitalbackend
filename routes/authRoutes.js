// routes/authRoutes.js

const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs'); // For comparing passwords
const jwt = require('jsonwebtoken'); // For creating JWTs
const Patient = require('../models/Patient'); // Import the Patient model for patient login
// If you also have a separate Doctor model for doctor logins, you'd import it here too:
// const Doctor = require('../models/Doctor');

// Load environment variables (ensure JWT_SECRET is in your .env)
// This is typically handled once in server.js, so no need to uncomment here.

// @route   POST /api/auth/login
// @desc    Authenticate user (Patient) & get token
// @access  Public
router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    // --- DEBUGGING LINE: Log the received login payload ---
    console.log('Backend received login payload:', req.body);
    // --- END DEBUGGING LINE ---

    try {
        // 1. Check if patient exists in the Patient collection
        // We need to select the password explicitly because it's set to 'select: false' in the schema
        const patient = await Patient.findOne({ email }).select('+password');
        
        // --- DEBUGGING LINE: Log found patient ---
        console.log('Found patient for login:', patient ? patient.email : 'None');
        // --- END DEBUGGING LINE ---

        if (!patient) {
            return res.status(400).json({ message: 'Invalid Credentials (Account not found)' });
        }

        // 2. Compare provided password with hashed password in DB
        const isMatch = await bcrypt.compare(password, patient.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid Credentials (Password incorrect)' });
        }

        // 3. If credentials are valid, create and sign a JSON Web Token (JWT)
        const payload = {
            patient: { // Use 'patient' in payload to indicate it's a patient
                id: patient.id, // Mongoose virtual 'id' for '_id'
                // You can add more patient-specific data to the payload if needed
            },
        };

        // Sign the token with your secret key (from .env)
        jwt.sign(
            payload,
            process.env.JWT_SECRET, // Your secret key, defined in .env
            { expiresIn: '1h' },    // Token expires in 1 hour
            (err, token) => {
                if (err) throw err; // If there's an error signing the token
                // Send the token and patient data back to the client
                res.json({
                    token,
                    patient: { // Send back relevant patient data (excluding password)
                        _id: patient._id,
                        id: patient.id,
                        name: patient.name,
                        email: patient.email,
                        phone: patient.phone,
                        dateOfBirth: patient.dateOfBirth,
                        gender: patient.gender
                        // Add any other patient fields your frontend expects for currentUser
                    }
                });
            }
        );

    } catch (err) {
        console.error('Login Error:', err.message); // Log the actual error for debugging on the server side
        res.status(500).send('Server Error'); // Generic server error message for the client
    }
});

module.exports = router;

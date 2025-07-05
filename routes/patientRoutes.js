// routes/patientRoutes.js

const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs'); // For hashing passwords
const jwt = require('jsonwebtoken'); // For creating JWTs
const Patient = require('../models/Patient'); // Import the Patient model
// const authMiddleware = require('../middleware/authMiddleware'); // You'll use this later for protected routes

// @route   POST /api/patients/register
// @desc    Register a new patient
// @access  Public (for initial registration)
router.post('/register', async (req, res) => {
    // --- DEBUGGING LINE: Log the received payload ---
    console.log('Backend received patient registration payload:', req.body);
    // --- END DEBUGGING LINE ---

    // Correctly destructure dateOfBirth and gender from req.body
    const { name, email, phone, dateOfBirth, gender, password } = req.body;

    try {
        // 1. Check if patient with this email already exists
        let patient = await Patient.findOne({ email });
        if (patient) {
            return res.status(400).json({ message: 'Registration failed: User with this email already exists.' });
        }

        // 2. Create a new Patient instance using the correct field names
        patient = new Patient({
            name,
            email,
            phone,
            dateOfBirth, // Use dateOfBirth as per frontend payload and Patient model schema
            gender,      // Use gender as per frontend payload and Patient model schema
            password     // This will be hashed below
        });

        // 3. Hash the password before saving
        const salt = await bcrypt.genSalt(10); // Generate a salt
        patient.password = await bcrypt.hash(password, salt); // Hash the password with the salt

        // 4. Save the patient to the database
        await patient.save();

        // 5. Create and sign a JSON Web Token (JWT) for immediate login
        const payload = {
            patient: {
                id: patient.id, // Mongoose virtual 'id' for '_id'
            },
        };

        jwt.sign(
            payload,
            process.env.JWT_SECRET, // Your secret key from .env
            { expiresIn: '1h' },    // Token expires in 1 hour
            (err, token) => {
                if (err) throw err;
                // Send success message, token, and patient data back to the client
                res.status(201).json({
                    message: 'Patient account created successfully!',
                    token,
                    patient: { // Send back relevant patient data (excluding password)
                        _id: patient._id,
                        id: patient.id,
                        name: patient.name,
                        email: patient.email,
                        phone: patient.phone,
                        dateOfBirth: patient.dateOfBirth, // Send back dateOfBirth
                        gender: patient.gender             // Send back gender
                    }
                });
            }
        );

    } catch (err) {
        console.error('Patient Registration Error:', err.message); // Log the actual error for debugging
        // Handle validation errors from Mongoose
        if (err.name === 'ValidationError') {
            let errors = {};
            Object.keys(err.errors).forEach((key) => {
                errors[key] = err.errors[key].message;
            });
            return res.status(400).json({ message: 'Validation Error', errors });
        }
        res.status(500).send('Server Error during patient registration');
    }
});

// @route   GET /api/patients
// @desc    Get all patients
// @access  Public (for now) / Private (e.g., Doctors, Admins later)
router.get('/', async (req, res) => {
    try {
        const patients = await Patient.find().select('-password'); // Find all patients, exclude password

        // Respond with the list of patients
        res.json(patients);

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   GET /api/patients/profile
// @desc    Get current patient's profile (used for re-authentication)
// @access  Private (requires auth token)
// You will need to implement an auth middleware to protect this route
// Example: router.get('/profile', authMiddleware, async (req, res) => { ... });
router.get('/profile', async (req, res) => {
    // This route needs an authentication middleware to identify the patient.
    // For now, it's a placeholder. Assuming you'll pass email as query for testing,
    // but in production, you'd get patient ID from the JWT token in authMiddleware.
    const { email } = req.query; // For testing without auth middleware

    try {
        const patient = await Patient.findOne({ email }).select('-password');
        if (!patient) {
            return res.status(404).json({ message: 'Patient profile not found' });
        }
        res.json(patient);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   GET /api/patients/reports/:patientId
// @desc    Get medical reports for a specific patient
// @access  Private (e.g., Patient themselves, Doctors, Admins)
// You will need to implement this to fetch actual reports from your database
router.get('/reports/:patientId', async (req, res) => {
    try {
        const { patientId } = req.params;
        // In a real app, you'd fetch reports related to this patientId from your database
        // For now, sending mock data
        const mockReports = [
            { id: 1, title: "Blood Test Results", date: "2024-06-15", type: "Laboratory", doctor: "Dr. Raksha", status: "final", summary: "Complete blood count and lipid panel within normal ranges" },
            { id: 2, title: "Chest X-Ray", date: "2024-05-20", type: "Radiology", doctor: "Dr. Brunda S", status: "final", summary: "No abnormalities detected, clear lung fields" },
            // ... more mock reports
        ];
        res.json(mockReports);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});


module.exports = router;

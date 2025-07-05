// routes/doctorRoutes.js

const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs'); // For hashing passwords
const jwt = require('jsonwebtoken'); // For creating JWTs
const Doctor = require('../models/Doctor'); // Import the Doctor model

// @route   POST /api/doctors/register
// @desc    Register a new doctor
// @access  Public (for initial registration)
router.post('/register', async (req, res) => {
    const { name, email, phone, specialty, license, password, workingPlaces, photo } = req.body;

    try {
        // 1. Check if doctor with this email already exists
        let doctor = await Doctor.findOne({ email });
        if (doctor) {
            return res.status(400).json({ message: 'Registration failed: Doctor with this email already exists.' });
        }

        // 2. Create a new Doctor instance
        doctor = new Doctor({
            name,
            email,
            phone,
            specialty,
            license,
            password, // This will be hashed below
            workingPlaces: workingPlaces || [], // Ensure it's an array, even if empty
            photo: photo || 'https://i.pravatar.cc/80?img=1' // Default photo if not provided
        });

        // 3. Hash the password before saving
        const salt = await bcrypt.genSalt(10); // Generate a salt
        doctor.password = await bcrypt.hash(password, salt); // Hash the password with the salt

        // 4. Save the doctor to the database
        await doctor.save();

        // 5. Create and sign a JSON Web Token (JWT) for immediate login
        const payload = {
            doctor: {
                id: doctor.id, // Mongoose virtual 'id' for '_id'
                // You can add more doctor-specific data to the payload if needed
            },
        };

        jwt.sign(
            payload,
            process.env.JWT_SECRET, // Your secret key from .env
            { expiresIn: '1h' },    // Token expires in 1 hour
            (err, token) => {
                if (err) throw err;
                // Send success message, token, and doctor data back to the client
                res.status(201).json({
                    message: 'Doctor account created successfully!',
                    token,
                    doctor: { // Send back relevant doctor data (excluding password)
                        _id: doctor._id,
                        id: doctor.id,
                        name: doctor.name,
                        email: doctor.email,
                        phone: doctor.phone,
                        specialty: doctor.specialty,
                        license: doctor.license,
                        workingPlaces: doctor.workingPlaces,
                        photo: doctor.photo
                    }
                });
            }
        );

    } catch (err) {
        console.error('Doctor Registration Error:', err.message); // Log the actual error for debugging
        // Handle validation errors from Mongoose
        if (err.name === 'ValidationError') {
            let errors = {};
            Object.keys(err.errors).forEach((key) => {
                errors[key] = err.errors[key].message;
            });
            return res.status(400).json({ message: 'Validation Error', errors });
        }
        res.status(500).send('Server Error during doctor registration');
    }
});

// @route   GET /api/doctors
// @desc    Get all doctors
// @access  Public or Private (e.g., Any logged-in user)
router.get('/', async (req, res) => {
    try {
        const doctors = await Doctor.find().select('-password'); // Find all doctors, exclude password

        // Respond with the list of doctors
        res.json(doctors);

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   GET /api/doctors/profile
// @desc    Get current doctor's profile (used for re-authentication)
// @access  Private (requires auth token)
// You will need to implement an auth middleware to protect this route
// Example: router.get('/profile', authMiddleware, async (req, res) => { ... });
router.get('/profile', async (req, res) => {
    // This route needs an authentication middleware to identify the doctor.
    // For now, it's a placeholder. Assuming you'll pass email as query for testing,
    // but in production, you'd get doctor ID from the JWT token in authMiddleware.
    const { email } = req.query; // For testing without auth middleware

    try {
        const doctor = await Doctor.findOne({ email }).select('-password');
        if (!doctor) {
            return res.status(404).json({ message: 'Doctor profile not found' });
        }
        res.json(doctor);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   GET /api/doctors/schedule/:doctorId
// @desc    Get a doctor's schedule (appointments)
// @access  Private (e.g., Doctor themselves or admin)
// You will need to implement this to fetch actual appointments from your database
router.get('/schedule/:doctorId', async (req, res) => {
    try {
        const { doctorId } = req.params;
        // In a real app, you'd fetch appointments related to this doctorId from your database
        // For now, sending mock data
        const mockSchedule = [
            { id: 1, time: "09:00 AM", duration: "30 min", patient: "Mega", patientId: "PT-2024-001", type: "Follow-up", status: "confirmed", condition: "Hypertension check", notes: "Regular blood pressure monitoring", date: "2025-07-05" },
            { id: 2, time: "09:30 AM", duration: "45 min", patient: "Punith", patientId: "PT-2024-047", type: "Consultation", status: "confirmed", condition: "Chest pain evaluation", notes: "New patient, requires ECG", date: "2025-07-05" },
            // ... more mock appointments
        ];
        res.json(mockSchedule);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   GET /api/doctors/patient-reports/:doctorId
// @desc    Get patient reports relevant to a doctor
// @access  Private (e.g., Doctor themselves or admin)
// You will need to implement this to fetch actual patient reports from your database
router.get('/patient-reports/:doctorId', async (req, res) => {
    try {
        const { doctorId } = req.params;
        // In a real app, you'd fetch reports where this doctor is involved or has access
        // For now, sending mock data
        const mockReports = [
            { id: 1, patient: "Mega", patientId: "PT-2024-001", lastVisit: "2024-06-15", condition: "Hypertension", urgency: "medium", summary: "Blood pressure remains elevated despite medication.", nextAction: "Schedule follow-up in 2 weeks" },
            { id: 2, patient: "Punith", patientId: "PT-2024-047", lastVisit: "2024-06-18", condition: "Chest Pain", urgency: "high", summary: "ECG shows minor abnormalities. Stress test recommended.", nextAction: "Schedule stress test immediately" },
            // ... more mock reports
        ];
        res.json(mockReports);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});


module.exports = router;

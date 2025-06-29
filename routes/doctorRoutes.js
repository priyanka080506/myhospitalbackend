// routes/doctorRoutes.js

const express = require('express');
const router = express.Router();
const Doctor = require('../models/Doctor'); // Import the Doctor model
// const authMiddleware = require('../middleware/authMiddleware'); // You'll use this later for protected routes
// const adminMiddleware = require('../middleware/adminMiddleware'); // And this for admin-only routes

// @route   POST /api/doctors
// @desc    Add a new doctor
// @access  Private (e.g., Admin only) - We'll add authMiddleware later
router.post('/', async (req, res) => {
    try {
        // Create a new Doctor instance with data from the request body
        const newDoctor = new Doctor(req.body);

        // Save the doctor to the database
        const doctor = await newDoctor.save();

        // Respond with the created doctor (201 Created status)
        res.status(201).json(doctor);

    } catch (err) {
        console.error(err.message);
        // Handle validation errors from Mongoose
        if (err.name === 'ValidationError') {
            let errors = {};
            Object.keys(err.errors).forEach((key) => {
                errors[key] = err.errors[key].message;
            });
            return res.status(400).json({ message: 'Validation Error', errors });
        }
        res.status(500).send('Server Error');
    }
});

// @route   GET /api/doctors
// @desc    Get all doctors
// @access  Public or Private (e.g., Any logged-in user) - We'll add authMiddleware later
router.get('/', async (req, res) => {
    try {
        const doctors = await Doctor.find(); // Find all doctors

        // Respond with the list of doctors
        res.json(doctors);

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});


module.exports = router;
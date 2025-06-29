// routes/patientRoutes.js

const express = require('express');
const router = express.Router();
const Patient = require('../models/Patient'); // Import the Patient model
// const authMiddleware = require('../middleware/authMiddleware'); // You'll use this later for protected routes

// @route   POST /api/patients
// @desc    Add a new patient
// @access  Public (for now) / Private (e.g., Doctors, Admins later)
router.post('/', async (req, res) => {
    try {
        // Create a new Patient instance with data from the request body
        const newPatient = new Patient(req.body);

        // Save the patient to the database
        const patient = await newPatient.save();

        // Respond with the created patient (201 Created status)
        res.status(201).json(patient);

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

// @route   GET /api/patients
// @desc    Get all patients
// @access  Public (for now) / Private (e.g., Doctors, Admins later)
router.get('/', async (req, res) => {
    try {
        const patients = await Patient.find(); // Find all patients

        // Respond with the list of patients
        res.json(patients);

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});


module.exports = router;
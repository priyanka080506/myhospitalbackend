// routes/appointmentRoutes.js

const express = require('express');
const router = express.Router();
const Appointment = require('../models/Appointment'); // Import the Appointment model
// const authMiddleware = require('../middleware/authMiddleware'); // You'll use this later for protected routes

// @route   POST /api/appointments
// @desc    Add a new appointment
// @access  Public (for now) / Private (e.g., Doctors, Admins, Patients later)
router.post('/', async (req, res) => {
    try {
        // Create a new Appointment instance with data from the request body
        // Ensure req.body contains patient and doctor IDs
        const newAppointment = new Appointment(req.body);

        // Save the appointment to the database
        const appointment = await newAppointment.save();

        // Respond with the created appointment (201 Created status)
        res.status(201).json(appointment);

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

// @route   GET /api/appointments
// @desc    Get all appointments
// @access  Public (for now) / Private (e.g., Doctors, Admins, Patients later)
router.get('/', async (req, res) => {
    try {
        // Find all appointments and populate the 'patient' and 'doctor' fields
        // .populate() replaces the ObjectId with the actual document data
        const appointments = await Appointment.find()
            .populate('patient', 'name contact.email') // Selects only 'name' and 'email' from patient
            .populate('doctor', 'name specialization contact.email'); // Selects 'name', 'specialization', 'email' from doctor

        // Respond with the list of appointments
        res.json(appointments);

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});


module.exports = router;
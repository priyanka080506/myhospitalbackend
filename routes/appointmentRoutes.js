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

// @route   GET /api/appointments/:patientId
// @desc    Get appointments for a specific patient
// @access  Public (for now) / Private (e.g., Patient themselves, Doctors, Admins later)
router.get('/:patientId', async (req, res) => {
    // --- DEBUGGING LINE: Log the patient ID received ---
    console.log('Backend received request for appointments for patientId:', req.params.patientId);
    // --- END DEBUGGING LINE ---

    try {
        const patientId = req.params.patientId;

        // Find appointments where the 'patient' field matches the patientId
        // This assumes your Appointment model has a 'patient' field that's a reference to the Patient model
        const appointments = await Appointment.find({ patient: patientId })
            .populate('patient', 'name email phone dateOfBirth gender') // Populate relevant patient fields
            .populate('doctor', 'name specialization'); // Populate relevant doctor fields

        // --- DEBUGGING LINE: Log found appointments ---
        console.log(`Found ${appointments.length} appointments for patient ${patientId}`);
        // --- END DEBUGGING LINE ---

        res.json(appointments);

    } catch (err) {
        console.error('Error fetching appointments by patient ID:', err.message);
        res.status(500).send('Server Error fetching patient appointments');
    }
});

module.exports = router;

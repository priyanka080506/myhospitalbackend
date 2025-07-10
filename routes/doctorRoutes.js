// routes/doctorRoutes.js

const express = require('express');
const router = express.Router();
// const bcrypt = require('bcryptjs'); // For hashing and comparing passwords (temporarily commented)
// const jwt = require('jsonwebtoken'); // For creating JWTs (temporarily commented)
// const Doctor = require('../models/Doctor'); // Import the Doctor model (temporarily commented)
// const Patient = require('../models/Patient'); // Import Patient model to populate patient details in reports (temporarily commented)
// const Report = require('../models/Report');  // Import the Report model (temporarily commented)
// const doctorAuthMiddleware = require('../middleware/doctorAuthMiddleware'); // NEW: Specific middleware for doctors (temporarily commented)

// --- DEBUGGING LOG ---
console.log('doctorRoutes.js loaded');
// --- END DEBUGGING LOG ---

// *******************************************************************
// ******* IMPORTANT: ALL ROUTES BELOW ARE TEMPORARILY COMMENTED *******
// *******************************************************************

// @route   POST /api/doctors/register
// @desc    Register a new doctor
// @access  Public (for initial registration)
// router.post('/register', async (req, res) => {
//     console.log('Backend received doctor registration payload:', req.body);
//     const { name, email, phone, specialty, license, password, workingPlaces, photo, appointmentFees } = req.body;
//     try {
//         // ... (rest of route logic)
//     } catch (err) {
//         // ...
//     }
// });

// @route   POST /api/doctors/login
// @desc    Authenticate doctor & get token
// @access  Public
// router.post('/login', async (req, res) => {
//     // ...
// });

// @route   GET /api/doctors
// @desc    Get all doctors
// @access  Public (e.g., for patient booking forms to list doctors)
// router.get('/', async (req, res) => {
//     // ...
// });

// @route   GET /api/doctors/profile
// @desc    Get current doctor's profile (used for dashboard load)
// @access  Private (requires doctorAuthMiddleware to populate req.doctor.id)
// router.get('/profile', doctorAuthMiddleware, async (req, res) => {
//     // ...
// });

// @route   GET /api/doctors/:id
// @desc    Get a single doctor by ID
// @access  Private (e.g., Admin, or potentially doctor themselves via different route)
// router.get('/:id', doctorAuthMiddleware, async (req, res) => {
//     // ...
// });

// @route   PUT /api/doctors/:id
// @desc    Update a doctor's profile
// @access  Private (Doctor themselves or Admin)
// router.put('/:id', doctorAuthMiddleware, async (req, res) => {
//     // ...
// });

// @route   DELETE /api/doctors/:id
// @desc    Delete a doctor
// @access  Private (Admin only)
// router.delete('/:id', doctorAuthMiddleware, async (req, res) => {
//     // ...
// });

// @route   GET /api/doctors/schedule/:doctorId
// @desc    Get a doctor's schedule (appointments)
// @access  Private (e.g., Doctor themselves or admin)
// router.get('/schedule/:doctorId', doctorAuthMiddleware, async (req, res) => {
//     // ...
// });

// @route   GET /api/doctors/patient-reports/:doctorId
// @desc    Get patient reports relevant to a doctor
// @access  Private (e.g., Doctor themselves or admin)
// router.get('/patient-reports/:doctorId', doctorAuthMiddleware, async (req, res) => {
//     // ...
// });

// @route   POST /api/doctors/add-report
// @desc    Add a new medical report for a patient by a doctor
// @access  Private (requires doctorAuthMiddleware)
// router.post('/add-report', doctorAuthMiddleware, async (req, res) => {
//     // ...
// });

// *******************************************************************

module.exports = router;
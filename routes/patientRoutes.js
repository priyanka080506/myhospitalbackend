// routes/patientRoutes.js

const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs'); // For hashing passwords
const jwt = require('jsonwebtoken'); // For creating JWTs
const Patient = require('../models/Patient'); // Import the Patient model
const Report = require('../models/Report');   // Import the Report model
const authMiddleware = require('../middleware/authMiddleware'); // Assuming you will create this middleware

// --- DEBUGGING LOG ---
console.log('patientRoutes.js loaded');
// --- END DEBUGGING LOG ---

// @route   POST /api/patients/register
// @desc    Register a new patient
// @access  Public (for initial registration)
router.post('/register', async (req, res) => {
    // --- DEBUGGING LINE: Log the received payload ---
    console.log('Backend received patient registration payload:', req.body);
    // --- END DEBUGGING LINE ---

    // Destructure fields as per your Patient model and frontend form
    const { name, email, phone, dateOfBirth, gender, password } = req.body;

    try {
        // 1. Check if patient with this email already exists
        let patient = await Patient.findOne({ email });
        if (patient) {
            console.log('Registration failed: User with this email already exists.');
            return res.status(400).json({ message: 'Registration failed: User with this email already exists.' });
        }

        // 2. Hash the password before saving
        const salt = await bcrypt.genSalt(10); // Generate a salt
        const hashedPassword = await bcrypt.hash(password, salt); // Hash the password with the salt

        // 3. Create a new Patient instance
        patient = new Patient({
            name,
            email,
            phone,
            dateOfBirth, // Ensure this matches your Patient model field
            gender,      // Ensure this matches your Patient model field
            password: hashedPassword // Store the hashed password
        });

        // 4. Save the patient to the database
        await patient.save();
        console.log('Patient registered successfully:', patient._id);

        // 5. Create and sign a JSON Web Token (JWT) for immediate login
        const payload = {
            patient: {
                id: patient.id, // Mongoose virtual 'id' for '_id'
            },
        };

        jwt.sign(
            payload,
            process.env.JWT_SECRET, // Your secret key from .env
            { expiresIn: '1h' },    // Token expires in 1 hour
            (err, token) => {
                if (err) {
                    console.error('JWT sign error:', err.message);
                    return res.status(500).json({ message: 'Server Error: Could not generate token.' });
                }
                // Send success message, token, and relevant patient data back to the client
                res.status(201).json({
                    message: 'Patient account created successfully!',
                    token,
                    patient: { // Send back relevant patient data (excluding password)
                        _id: patient._id,
                        name: patient.name,
                        email: patient.email,
                        phone: patient.phone,
                        dateOfBirth: patient.dateOfBirth,
                        gender: patient.gender,
                        address: patient.address, // Include address if present
                    }
                });
            }
        );

    } catch (err) {
        console.error('Patient Registration Error:', err.message);
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

// @route   GET /api/patients
// @desc    Get all patients
// @access  Private (e.g., Doctors, Admins - requires authMiddleware)
// router.get('/', authMiddleware, async (req, res) => { // Uncomment authMiddleware when ready
router.get('/', async (req, res) => {
    // --- DEBUGGING LOG ---
    console.log('Received GET /api/patients (get all) request.');
    // --- END DEBUGGING LOG ---
    try {
        // Find all patients, exclude password field
        const patients = await Patient.find().select('-password');

        res.json(patients);

    } catch (err) {
        console.error('Error in GET /api/patients (get all):', err.message);
        res.status(500).send('Server Error');
    }
});

// @route   GET /api/patients/profile
// @desc    Get current patient's profile (used for re-authentication/dashboard load)
// @access  Private (requires auth token - authMiddleware will populate req.patient.id)
router.get('/profile', authMiddleware, async (req, res) => {
    // --- DEBUGGING LOG ---
    console.log('Received GET /api/patients/profile request for patient ID:', req.patient.id);
    // --- END DEBUGGING LOG ---
    try {
        // req.patient.id is populated by authMiddleware after token verification
        const patient = await Patient.findById(req.patient.id).select('-password');
        if (!patient) {
            console.log('Patient profile not found for ID:', req.patient.id);
            return res.status(404).json({ message: 'Patient profile not found' });
        }
        res.json(patient);
    } catch (err) {
        console.error('Error in GET /api/patients/profile:', err.message);
        res.status(500).send('Server Error');
    }
});

// @route   GET /api/patients/:id
// @desc    Get a single patient by ID
// @access  Private (e.g., Doctors, Admins - requires authMiddleware)
// router.get('/:id', authMiddleware, async (req, res) => { // Uncomment authMiddleware when ready
router.get('/:id', async (req, res) => {
    // --- DEBUGGING LOG ---
    console.log('Received GET /api/patients/:id request for ID:', req.params.id);
    // --- END DEBUGGING LOG ---
    try {
        const patient = await Patient.findById(req.params.id).select('-password');
        if (!patient) {
            console.log('Patient not found for ID:', req.params.id);
            return res.status(404).json({ message: 'Patient not found' });
        }
        res.json(patient);
    } catch (err) {
        console.error('Error in GET /api/patients/:id:', err.message);
        // Handle invalid ObjectId format
        if (err.kind === 'ObjectId') {
            return res.status(400).json({ message: 'Invalid Patient ID format.' });
        }
        res.status(500).send('Server Error');
    }
});

// @route   PUT /api/patients/:id
// @desc    Update a patient's profile
// @access  Private (Patient themselves or Admin - requires authMiddleware)
// router.put('/:id', authMiddleware, async (req, res) => { // Uncomment authMiddleware when ready
router.put('/:id', async (req, res) => {
    // --- DEBUGGING LOG ---
    console.log('Received PUT /api/patients/:id request for ID:', req.params.id, 'with body:', req.body);
    // --- END DEBUGGING LOG ---
    try {
        const { name, email, phone, dateOfBirth, gender, address, medicalHistory } = req.body;
        const patientId = req.params.id;

        // Optional: Add authorization check here if authMiddleware is enabled
        // if (req.patient.id !== patientId && req.user.role !== 'admin') {
        //   return res.status(403).json({ message: 'Not authorized to update this patient profile.' });
        // }

        const updatedPatient = await Patient.findByIdAndUpdate(
            patientId,
            { name, email, phone, dateOfBirth, gender, address, medicalHistory },
            { new: true, runValidators: true } // Return the updated document, run schema validators
        ).select('-password'); // Exclude password from the response

        if (!updatedPatient) {
            console.log('Patient not found for update with ID:', patientId);
            return res.status(404).json({ message: 'Patient not found' });
        }
        res.json(updatedPatient);

    } catch (err) {
        console.error('Error in PUT /api/patients/:id:', err.message);
        if (err.name === 'ValidationError') {
            let errors = {};
            Object.keys(err.errors).forEach((key) => {
                errors[key] = err.errors[key].message;
            });
            return res.status(400).json({ message: 'Validation Error', errors });
        }
        if (err.code === 11000) { // Duplicate key error
            return res.status(409).json({ message: 'Email already in use by another patient.' });
        }
        res.status(500).send('Server Error during patient update');
    }
});

// @route   DELETE /api/patients/:id
// @desc    Delete a patient
// @access  Private (Admin only - requires authMiddleware)
// router.delete('/:id', authMiddleware, async (req, res) => { // Uncomment authMiddleware when ready
router.delete('/:id', async (req, res) => {
    // --- DEBUGGING LOG ---
    console.log('Received DELETE /api/patients/:id request for ID:', req.params.id);
    // --- END DEBUGGING LOG ---
    try {
        // Optional: Add role-based authorization check here (e.g., only 'admin' can delete)
        // if (req.user.role !== 'admin') {
        //   return res.status(403).json({ message: 'Not authorized to delete patient accounts.' });
        // }

        const patient = await Patient.findByIdAndDelete(req.params.id);

        if (!patient) {
            console.log('Patient not found for deletion with ID:', req.params.id);
            return res.status(404).json({ message: 'Patient not found' });
        }
        res.json({ message: 'Patient removed successfully' });

    } catch (err) {
        console.error('Error in DELETE /api/patients/:id:', err.message);
        if (err.kind === 'ObjectId') {
            return res.status(400).json({ message: 'Invalid Patient ID format.' });
        }
        res.status(500).send('Server Error during patient deletion');
    }
});

// @route   GET /api/patients/reports/:patientId
// @desc    Get medical reports for a specific patient
// @access  Private (e.g., Patient themselves, Doctors, Admins - requires authMiddleware)
// router.get('/reports/:patientId', authMiddleware, async (req, res) => { // Uncomment authMiddleware when ready
router.get('/reports/:patientId', async (req, res) => {
    // --- DEBUGGING LINE: Log the patient ID received ---
    console.log('Backend received request for reports for patientId:', req.params.patientId);
    // --- END DEBUGGING LINE ---

    try {
        const patientId = req.params.patientId;

        // Optional: Add authorization check here if authMiddleware is enabled
        // if (req.patient.id !== patientId && req.user.role !== 'admin' && req.user.role !== 'doctor') {
        //   return res.status(403).json({ message: 'Not authorized to view these reports.' });
        // }

        // Find reports where the patient field matches the provided patientId
        // Populate the 'doctor' field to get doctor's name and specialty
        const reports = await Report.find({ patient: patientId })
                                    .populate('doctor', 'name specialization _id') // Select only necessary doctor fields
                                    .sort({ date: -1 }); // Sort by newest first

        // Transform reports to match frontend's expected structure
        const formattedReports = reports.map(report => ({
            id: report._id,
            title: report.title,
            date: report.date ? report.date.toISOString().split('T')[0] : (report.lastVisit ? report.lastVisit.toISOString().split('T')[0] : 'N/A'), // Ensure date is formatted
            type: report.type,
            doctor: report.doctor ? `Dr. ${report.doctor.name} (${report.doctor.specialization})` : 'N/A', // Use specialization
            doctorId: report.doctor ? report.doctor._id : 'N/A',
            status: report.status,
            summary: report.summary,
            nextAction: report.nextAction,
            // Add a mock imageUrl for demonstration. In a real app, this would come from storage.
            imageUrl: `https://placehold.co/600x400/cccccc/333333?text=Report+Image+${report.id.toString().substring(0,4)}`
        }));

        res.json(formattedReports);
    } catch (err) {
        console.error('Error fetching patient reports for patient:', err.message);
        if (err.kind === 'ObjectId') {
            return res.status(400).json({ message: 'Invalid Patient ID format.' });
        }
        res.status(500).send('Server Error fetching patient reports');
    }
});

// @route   POST /api/patients/add-report
// @desc    Add a new medical report by a patient (self-report)
// @access  Private (requires patient auth - authMiddleware will populate req.patient.id)
router.post('/add-report', authMiddleware, async (req, res) => { // Uncomment authMiddleware when ready
    // For a real app, you'd get patientId from authMiddleware (req.patient.id)
    // For now, let's assume patientId is sent in the body for testing, or use currentUser._id from frontend
    const { title, date, type, status, summary, nextAction, doctorId } = req.body;
    const patientId = req.patient.id; // Get patient ID from authenticated user

    // --- DEBUGGING LINE: Log the received add-report payload ---
    console.log('Backend received patient self-report payload:', req.body, 'for patient:', patientId);
    // --- END DEBUGGING LINE ---

    try {
        // Basic validation
        if (!patientId || !title || !summary) {
            return res.status(400).json({ message: 'Missing required report fields (patientId, title, summary).' });
        }

        // Verify patient exists (optional but recommended for data integrity)
        const patientExists = await Patient.findById(patientId);
        if (!patientExists) {
            return res.status(404).json({ message: 'Patient not found.' });
        }
        
        // For patient-added reports, the doctor field can be null or selected
        let doctorRef = null;
        if (doctorId) {
            const foundDoctor = await Doctor.findById(doctorId);
            if (foundDoctor) {
                doctorRef = foundDoctor._id;
            } else {
                console.warn(`Doctor ID ${doctorId} not found for report. Proceeding without doctor link.`);
            }
        }

        const newReport = new Report({
            patient: patientId,
            doctor: doctorRef, // Link to doctor if found
            title,
            date: date || Date.now(), // Use provided date or default to now
            type: type || 'Other',
            status: status || 'pending', // Patient reports might start as pending review
            summary,
            nextAction
        });

        await newReport.save();
        res.status(201).json({ message: 'Report added successfully!', report: newReport });

    } catch (err) {
        console.error('Error adding patient self-report:', err.message);
        // Handle validation errors from Mongoose
        if (err.name === 'ValidationError') {
            let errors = {};
            Object.keys(err.errors).forEach((key) => {
                errors[key] = err.errors[key].message;
            });
            return res.status(400).json({ message: 'Validation Error', errors });
        }
        res.status(500).send('Server Error adding patient self-report');
    }
});


module.exports = router;
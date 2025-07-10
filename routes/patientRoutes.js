// routes/patientRoutes.js

const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs'); // For hashing and comparing passwords
const jwt = require('jsonwebtoken'); // For creating JWTs
const Patient = require('../models/Patient'); // Import the Patient model
const authMiddleware = require('../middleware/authMiddleware'); // Middleware to protect routes
const Report = require('../models/Report'); // Import Report model

// --- DEBUGGING LOG ---
console.log('patientRoutes.js loaded');
// --- END DEBUGGING LOG ---


// @route   POST /api/patients/register
// @desc    Register a new patient
// @access  Public
router.post('/register', async (req, res) => {
    // --- DEBUGGING LINE: Log the received registration payload ---
    console.log('Backend received patient registration payload:', req.body);
    // --- END DEBUGGING LINE ---

    const { name, email, phone, password, dateOfBirth, gender, address } = req.body;

    try {
        // 1. Check if patient with this email already exists
        let patient = await Patient.findOne({ email });
        if (patient) {
            console.log('Registration failed: Patient with this email already exists.');
            return res.status(400).json({ message: 'Registration failed: Patient with this email already exists.' });
        }

        // 2. Hash the password before saving
        const salt = await bcrypt.genSalt(10); // Generate a salt
        const hashedPassword = await bcrypt.hash(password, salt); // Hash the password with the salt

        // 3. Create a new Patient instance
        patient = new Patient({
            name,
            email,
            phone,
            password: hashedPassword, // Store the hashed password
            dateOfBirth,
            gender,
            address,
        });

        // 4. Save the patient to the database
        await patient.save();
        console.log('Patient registered successfully:', patient._id);

        // 5. Create and sign a JSON Web Token (JWT) for immediate login
        const payload = {
            patient: { // Use 'patient' in payload to indicate it's a patient (for authMiddleware)
                id: patient.id, // Mongoose virtual 'id' for '_id'
            },
        };

        jwt.sign(
            payload,
            process.env.JWT_SECRET, // Your secret key from .env
            { expiresIn: '1h' },    // Token expires in 1 hour
            (err, token) => {
                if (err) {
                    console.error('JWT sign error during patient registration:', err.message);
                    return res.status(500).json({ message: 'Server Error: Could not generate token.' });
                }
                // Send success message, token, and patient data back to the client
                res.status(201).json({
                    message: 'Account created successfully!',
                    token,
                    patient: { // Send back relevant patient data (excluding password)
                        _id: patient._id,
                        id: patient.id,
                        name: patient.name,
                        email: patient.email,
                        phone: patient.phone,
                        dateOfBirth: patient.dateOfBirth,
                        gender: patient.gender,
                        address: patient.address
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
        // Handle duplicate email specifically (Mongoose often throws this as a MongoError with code 11000)
        if (err.code === 11000) {
            return res.status(409).json({ message: 'A patient with this email already exists.' });
        }
        res.status(500).send('Server Error during patient registration');
    }
});

// @route   POST /api/patients/login
// @desc    Authenticate patient & get token
// @access  Public
router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    // --- DEBUGGING LINE: Log the received login payload ---
    console.log('Backend received patient login payload:', req.body);
    // --- END DEBUGGING LINE ---

    try {
        // 1. Check if patient exists in the Patient collection
        // Select the password explicitly because it's set to 'select: false' in the schema
        const patient = await Patient.findOne({ email }).select('+password');

        // --- DEBUGGING LINE: Log found patient ---
        console.log('Found patient for login:', patient ? patient.email : 'None');
        // --- END DEBUGGING LINE ---


        if (!patient) {
            return res.status(400).json({ message: 'Invalid Credentials (Patient account not found)' });
        }

        // 2. Compare provided password with hashed password in DB
        const isMatch = await bcrypt.compare(password, patient.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid Credentials (Password incorrect)' });
        }

        // 3. If credentials are valid, create and sign a JSON Web Token (JWT)
        const payload = {
            patient: { // Use 'patient' in payload to indicate it's a patient (for authMiddleware)
                id: patient.id, // Mongoose virtual 'id' for '_id'
            },
        };

        // Sign the token with your secret key (from .env)
        jwt.sign(
            payload,
            process.env.JWT_SECRET, // Your secret key, defined in .env
            { expiresIn: '1h' },    // Token expires in 1 hour
            (err, token) => {
                if (err) {
                    console.error('JWT sign error during patient login:', err.message);
                    return res.status(500).json({ message: 'Server Error: Could not generate token.' });
                }
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
                        gender: patient.gender,
                        address: patient.address
                    }
                });
            }
        );

    } catch (err) {
        console.error('Patient Login Error:', err.message);
        res.status(500).send('Server Error');
    }
});


// @route   GET /api/patients/profile
// @desc    Get current patient's profile (used for dashboard load)
// @access  Private (requires authMiddleware to populate req.patient.id)
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


// @route   PUT /api/patients/profile
// @desc    Update current patient's profile
// @access  Private
router.put('/profile', authMiddleware, async (req, res) => {
    // --- DEBUGGING LOG ---
    console.log('Received PUT /api/patients/profile request for ID:', req.patient.id, 'with body:', req.body);
    // --- END DEBUGGING LOG ---
    try {
        const { name, email, phone, dateOfBirth, gender, address } = req.body;
        const patientId = req.patient.id;

        const updatedPatient = await Patient.findByIdAndUpdate(
            patientId,
            { name, email, phone, dateOfBirth, gender, address },
            { new: true, runValidators: true } // Return the updated document, run schema validators
        ).select('-password'); // Exclude password from the response

        if (!updatedPatient) {
            console.log('Patient not found for update with ID:', patientId);
            return res.status(404).json({ message: 'Patient not found' });
        }
        res.json(updatedPatient);

    } catch (err) {
        console.error('Error in PUT /api/patients/profile:', err.message);
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
        res.status(500).send('Server Error during patient profile update');
    }
});


// @route   GET /api/patients/reports/:patientId
// @desc    Get medical reports for a specific patient
// @access  Private (requires authentication - patient themselves or authorized doctor/admin)
router.get('/reports/:patientId', authMiddleware, async (req, res) => {
    try {
        const { patientId } = req.params;

        // Ensure the authenticated patient is only requesting their own reports,
        // or add logic for doctors/admins to view other patient reports
        if (req.patient.id !== patientId) {
            console.log(`Unauthorized attempt to access patient reports. User ID: ${req.patient.id}, Requested Patient ID: ${patientId}`);
            return res.status(403).json({ message: 'Not authorized to view these reports.' });
        }

        const reports = await Report.find({ patient: patientId })
                                    .populate('doctor', 'name specialization') // Populate doctor details
                                    .sort({ date: -1 }); // Sort by newest first

        // --- DEBUGGING LOG ---
        console.log(`Found ${reports.length} reports for patient ${patientId}`);
        // --- END DEBUGGING LOG ---

        // Format reports for frontend display
        const formattedReports = reports.map(report => ({
            id: report._id,
            title: report.title,
            date: report.date ? report.date.toISOString().split('T')[0] : 'N/A', // Format date
            doctorName: report.doctor ? `Dr. ${report.doctor.name}` : 'N/A',
            doctorSpecialty: report.doctor ? report.doctor.specialization : 'N/A',
            summary: report.summary,
            type: report.type,
            status: report.status,
            nextAction: report.nextAction,
            imageUrl: `https://placehold.co/600x400/cccccc/333333?text=Report+Image+${report._id.toString().substring(0,4)}` // Example placeholder image
        }));

        res.json(formattedReports);

    } catch (err) {
        console.error('Error fetching patient reports:', err.message);
        if (err.kind === 'ObjectId') {
            return res.status(400).json({ message: 'Invalid Patient ID format.' });
        }
        res.status(500).send('Server Error fetching patient reports');
    }
});


module.exports = router;
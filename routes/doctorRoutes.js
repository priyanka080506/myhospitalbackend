// routes/doctorRoutes.js

const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs'); // For hashing and comparing passwords
const jwt = require('jsonwebtoken'); // For creating JWTs
const Doctor = require('../models/Doctor'); // Import the Doctor model
const Patient = require('../models/Patient'); // Import Patient model to populate patient details
const Report = require('../models/Report');   // Import the Report model

// Middleware for authentication (placeholder for now, you'd implement this fully)
// const authMiddleware = require('../middleware/authMiddleware');

// @route   POST /api/doctors/register
// @desc    Register a new doctor
// @access  Public (for initial registration)
router.post('/register', async (req, res) => {
    // --- DEBUGGING LINE: Log the received registration payload ---
    console.log('Backend received doctor registration payload:', req.body);
    // --- END DEBUGGING LINE ---

    const { name, email, phone, specialty, license, password, workingPlaces, photo, appointmentFees } = req.body;

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
            photo: photo || 'https://i.pravatar.cc/80?img=1', // Default photo if not provided
            appointmentFees // Include appointmentFees
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
                        photo: doctor.photo,
                        appointmentFees: doctor.appointmentFees // Include appointmentFees
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

// @route   POST /api/doctors/login
// @desc    Authenticate doctor & get token
// @access  Public
router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    // --- DEBUGGING LINE: Log the received login payload ---
    console.log('Backend received doctor login payload:', req.body);
    // --- END DEBUGGING LINE ---

    try {
        // 1. Check if doctor exists in the Doctor collection
        // Select the password explicitly because it's set to 'select: false' in the schema
        const doctor = await Doctor.findOne({ email }).select('+password');
        
        // --- DEBUGGING LINE: Log found doctor ---
        console.log('Found doctor for login:', doctor ? doctor.email : 'None');
        // --- END DEBUGGING LINE ---

        if (!doctor) {
            return res.status(400).json({ message: 'Invalid Credentials (Doctor account not found)' });
        }

        // 2. Compare provided password with hashed password in DB
        const isMatch = await bcrypt.compare(password, doctor.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid Credentials (Password incorrect)' });
        }

        // 3. If credentials are valid, create and sign a JSON Web Token (JWT)
        const payload = {
            doctor: { // Use 'doctor' in payload to indicate it's a doctor
                id: doctor.id, // Mongoose virtual 'id' for '_id'
            },
        };

        // Sign the token with your secret key (from .env)
        jwt.sign(
            payload,
            process.env.JWT_SECRET, // Your secret key, defined in .env
            { expiresIn: '1h' },    // Token expires in 1 hour
            (err, token) => {
                if (err) throw err; // If there's an error signing the token
                // Send the token and doctor data back to the client
                res.json({
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
                        photo: doctor.photo,
                        appointmentFees: doctor.appointmentFees // Include appointmentFees
                    }
                });
            }
        );

    } catch (err) {
        console.error('Doctor Login Error:', err.message); // Log the actual error for debugging on the server side
        res.status(500).send('Server Error'); // Generic server error message for the client
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
// This route needs an authentication middleware to identify the doctor.
// For now, it's a placeholder. Assuming you'll pass email as query for testing,
// but in production, you'd get doctor ID from the JWT token in authMiddleware.
router.get('/profile', async (req, res) => {
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
router.get('/patient-reports/:doctorId', async (req, res) => {
    try {
        const { doctorId } = req.params;

        // Find reports where the doctor field matches the provided doctorId
        // Populate the 'patient' field to get patient's name and ID
        const reports = await Report.find({ doctor: doctorId })
                                    .populate('patient', 'name email _id') // Select only necessary patient fields
                                    .sort({ date: -1 }); // Sort by newest first

        // Transform reports to match frontend's expected structure
        const formattedReports = reports.map(report => ({
            id: report._id,
            patient: report.patient ? report.patient.name : 'N/A',
            patientId: report.patient ? report.patient._id : 'N/A', // Assuming patientId is patient's _id
            lastVisit: report.date, // Using report date as last visit for simplicity
            condition: report.summary, // Using summary as condition for display
            urgency: report.status, // Using report status as urgency for display
            summary: report.summary,
            nextAction: report.nextAction,
            title: report.title,
            type: report.type,
            doctor: report.doctor, // This is the doctor's ObjectId, might need to populate if doctor's name is needed
            // ADDED: Placeholder image URL for reports
            imageUrl: `https://placehold.co/600x400/cccccc/333333?text=Report+Image+${report._id.toString().substring(0,4)}`
        }));

        res.json(formattedReports);
    } catch (err) {
        console.error('Error fetching patient reports for doctor:', err.message);
        res.status(500).send('Server Error fetching patient reports');
    }
});

// @route   POST /api/doctors/add-report
// @desc    Add a new medical report for a patient by a doctor
// @access  Private (requires doctor auth) - you'll need auth middleware
router.post('/add-report', async (req, res) => {
    // For a real app, you'd get doctorId from authMiddleware (req.doctor.id)
    // For now, let's assume doctorId is sent in the body for testing, or use currentDoctor._id from frontend
    const { patientId, doctorId, title, date, type, status, summary, nextAction } = req.body;

    // --- DEBUGGING LINE: Log the received add-report payload ---
    console.log('Backend received add-report payload:', req.body);
    // --- END DEBUGGING LINE ---

    try {
        // Basic validation
        if (!patientId || !doctorId || !title || !summary) {
            return res.status(400).json({ message: 'Missing required report fields.' });
        }

        // Verify patient and doctor exist (optional but recommended for data integrity)
        const patientExists = await Patient.findById(patientId);
        if (!patientExists) {
            return res.status(404).json({ message: 'Patient not found.' });
        }
        const doctorExists = await Doctor.findById(doctorId);
        if (!doctorExists) {
            return res.status(404).json({ message: 'Doctor not found.' });
        }

        const newReport = new Report({
            patient: patientId,
            doctor: doctorId,
            title,
            date: date || Date.now(), // Use provided date or default to now
            type: type || 'Other',
            status: status || 'pending',
            summary,
            nextAction
        });

        await newReport.save();
        res.status(201).json({ message: 'Report added successfully!', report: newReport });

    } catch (err) {
        console.error('Error adding report:', err.message);
        // Handle validation errors from Mongoose
        if (err.name === 'ValidationError') {
            let errors = {};
            Object.keys(err.errors).forEach((key) => {
                errors[key] = err.errors[key].message;
            });
            return res.status(400).json({ message: 'Validation Error', errors });
        }
        res.status(500).send('Server Error adding report');
    }
});


module.exports = router;

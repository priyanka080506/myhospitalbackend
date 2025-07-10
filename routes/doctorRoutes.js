// routes/doctorRoutes.js

const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs'); // For hashing and comparing passwords
const jwt = require('jsonwebtoken'); // For creating JWTs
const Doctor = require('../models/Doctor'); // Import the Doctor model
const Patient = require('../models/Patient'); // Import Patient model to populate patient details in reports
const Report = require('../models/Report');   // Import the Report model
const doctorAuthMiddleware = require('../middleware/doctorAuthMiddleware'); // NEW: Specific middleware for doctors

// --- DEBUGGING LOG ---
console.log('doctorRoutes.js loaded');
// --- END DEBUGGING LOG ---

// @route   POST /api/doctors/register
// @desc    Register a new doctor
// @access  Public (for initial registration)
router.post('/register', async (req, res) => {
    // --- DEBUGGING LINE: Log the received registration payload ---
    console.log('Backend received doctor registration payload:', req.body);
    // --- END DEBUGGING LINE ---

    const { name, email, phone, specialty, license, password, workingPlaces, photo, appointmentFees } = req.body;

    try {
        // 1. Check if doctor with this email already exists
        let doctor = await Doctor.findOne({ email });
        if (doctor) {
            console.log('Registration failed: Doctor with this email already exists.');
            return res.status(400).json({ message: 'Registration failed: Doctor with this email already exists.' });
        }

        // 2. Hash the password before saving
        const salt = await bcrypt.genSalt(10); // Generate a salt
        const hashedPassword = await bcrypt.hash(password, salt); // Hash the password with the salt

        // 3. Create a new Doctor instance
        doctor = new Doctor({
            name,
            email,
            phone,
            specialty,
            license,
            password: hashedPassword, // Store the hashed password
            workingPlaces: workingPlaces || [], // Ensure it's an array, even if empty
            photo: photo || 'https://i.pravatar.cc/80?img=1', // Default photo if not provided
            appointmentFees // Include appointmentFees
        });

        // 4. Save the doctor to the database
        await doctor.save();
        console.log('Doctor registered successfully:', doctor._id);

        // 5. Create and sign a JSON Web Token (JWT) for immediate login
        const payload = {
            doctor: { // Use 'doctor' in payload to indicate it's a doctor (for doctorAuthMiddleware)
                id: doctor.id, // Mongoose virtual 'id' for '_id'
            },
        };

        jwt.sign(
            payload,
            process.env.JWT_SECRET, // Your secret key from .env
            { expiresIn: '1h' },    // Token expires in 1 hour
            (err, token) => {
                if (err) {
                    console.error('JWT sign error during doctor registration:', err.message);
                    return res.status(500).json({ message: 'Server Error: Could not generate token.' });
                }
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
                        appointmentFees: doctor.appointmentFees
                    }
                });
            }
        );

    } catch (err) {
        console.error('Doctor Registration Error:', err.message);
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
            return res.status(409).json({ message: 'A doctor with this email already exists.' });
        }
        res.status(500).send('Server Error during doctor registration');
    }
});

// @route   POST /api/doctors/login
// @desc    Authenticate doctor & get token
// @access  Public
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
            doctor: { // Use 'doctor' in payload to indicate it's a doctor (for doctorAuthMiddleware)
                id: doctor.id, // Mongoose virtual 'id' for '_id'
            },
        };

        // Sign the token with your secret key (from .env)
        jwt.sign(
            payload,
            process.env.JWT_SECRET, // Your secret key, defined in .env
            { expiresIn: '1h' },    // Token expires in 1 hour
            (err, token) => {
                if (err) {
                    console.error('JWT sign error during doctor login:', err.message);
                    return res.status(500).json({ message: 'Server Error: Could not generate token.' });
                }
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
                        appointmentFees: doctor.appointmentFees
                    }
                });
            }
        );

    } catch (err) {
        console.error('Doctor Login Error:', err.message);
        res.status(500).send('Server Error');
    }
});

// @route   GET /api/doctors
// @desc    Get all doctors
// @access  Public (e.g., for patient booking forms to list doctors)
router.get('/', async (req, res) => {
    // --- DEBUGGING LOG ---
    console.log('Received GET /api/doctors (get all) request.');
    // --- END DEBUGGING LOG ---
    try {
        const doctors = await Doctor.find().select('-password'); // Find all doctors, exclude password

        res.json(doctors);

    } catch (err) {
        console.error('Error in GET /api/doctors (get all):', err.message);
        res.status(500).send('Server Error');
    }
});

// @route   GET /api/doctors/profile
// @desc    Get current doctor's profile (used for dashboard load)
// @access  Private (requires doctorAuthMiddleware to populate req.doctor.id)
router.get('/profile', doctorAuthMiddleware, async (req, res) => {
    // --- DEBUGGING LOG ---
    console.log('Received GET /api/doctors/profile request for doctor ID:', req.doctor.id);
    // --- END DEBUGGING LOG ---
    try {
        // req.doctor.id is populated by doctorAuthMiddleware after token verification
        const doctor = await Doctor.findById(req.doctor.id).select('-password');
        if (!doctor) {
            console.log('Doctor profile not found for ID:', req.doctor.id);
            return res.status(404).json({ message: 'Doctor profile not found' });
        }
        res.json(doctor);
    } catch (err) {
        console.error('Error in GET /api/doctors/profile:', err.message);
        res.status(500).send('Server Error');
    }
});

// @route   GET /api/doctors/:id
// @desc    Get a single doctor by ID
// @access  Private (e.g., Admin, or potentially doctor themselves via different route)
router.get('/:id', doctorAuthMiddleware, async (req, res) => { // Consider role-based access control here
    // --- DEBUGGING LOG ---
    console.log('Received GET /api/doctors/:id request for ID:', req.params.id);
    // --- END DEBUGGING LOG ---
    try {
        const doctor = await Doctor.findById(req.params.id).select('-password');
        if (!doctor) {
            console.log('Doctor not found for ID:', req.params.id);
            return res.status(404).json({ message: 'Doctor not found' });
        }
        res.json(doctor);
    } catch (err) {
        console.error('Error in GET /api/doctors/:id:', err.message);
        if (err.kind === 'ObjectId') {
            return res.status(400).json({ message: 'Invalid Doctor ID format.' });
        }
        res.status(500).send('Server Error');
    }
});

// @route   PUT /api/doctors/:id
// @desc    Update a doctor's profile
// @access  Private (Doctor themselves or Admin)
router.put('/:id', doctorAuthMiddleware, async (req, res) => {
    // --- DEBUGGING LOG ---
    console.log('Received PUT /api/doctors/:id request for ID:', req.params.id, 'with body:', req.body);
    // --- END DEBUGGING LOG ---
    try {
        const { name, email, phone, specialty, license, workingPlaces, photo, appointmentFees } = req.body;
        const doctorId = req.params.id;

        // Optional: Add authorization check here (e.g., only self or admin can update)
        // if (req.doctor.id !== doctorId && req.user.role !== 'admin') { // assuming req.user if generic auth
        //   return res.status(403).json({ message: 'Not authorized to update this doctor profile.' });
        // }

        const updatedDoctor = await Doctor.findByIdAndUpdate(
            doctorId,
            { name, email, phone, specialty, license, workingPlaces, photo, appointmentFees },
            { new: true, runValidators: true } // Return the updated document, run schema validators
        ).select('-password'); // Exclude password from the response

        if (!updatedDoctor) {
            console.log('Doctor not found for update with ID:', doctorId);
            return res.status(404).json({ message: 'Doctor not found' });
        }
        res.json(updatedDoctor);

    } catch (err) {
        console.error('Error in PUT /api/doctors/:id:', err.message);
        if (err.name === 'ValidationError') {
            let errors = {};
            Object.keys(err.errors).forEach((key) => {
                errors[key] = err.errors[key].message;
            });
            return res.status(400).json({ message: 'Validation Error', errors });
        }
        if (err.code === 11000) { // Duplicate key error
            return res.status(409).json({ message: 'Email already in use by another doctor.' });
        }
        res.status(500).send('Server Error during doctor update');
    }
});

// @route   DELETE /api/doctors/:id
// @desc    Delete a doctor
// @access  Private (Admin only)
router.delete('/:id', doctorAuthMiddleware, async (req, res) => { // Consider role-based access control here
    // --- DEBUGGING LOG ---
    console.log('Received DELETE /api/doctors/:id request for ID:', req.params.id);
    // --- END DEBUGGING LOG ---
    try {
        // Optional: Add role-based authorization check here (e.g., only 'admin' can delete)
        // if (req.user.role !== 'admin') { // assuming req.user if generic auth
        //   return res.status(403).json({ message: 'Not authorized to delete doctor accounts.' });
        // }

        const doctor = await Doctor.findByIdAndDelete(req.params.id);

        if (!doctor) {
            console.log('Doctor not found for deletion with ID:', req.params.id);
            return res.status(404).json({ message: 'Doctor not found' });
        }
        res.json({ message: 'Doctor removed successfully' });

    } catch (err) {
        console.error('Error in DELETE /api/doctors/:id:', err.message);
        if (err.kind === 'ObjectId') {
            return res.status(400).json({ message: 'Invalid Doctor ID format.' });
        }
        res.status(500).send('Server Error during doctor deletion');
    }
});


// @route   GET /api/doctors/schedule/:doctorId
// @desc    Get a doctor's schedule (appointments)
// @access  Private (e.g., Doctor themselves or admin)
router.get('/schedule/:doctorId', doctorAuthMiddleware, async (req, res) => {
    try {
        const { doctorId } = req.params;

        // Optional: Add authorization check (doctor can only see their own schedule, or admin can see all)
        // if (req.doctor.id !== doctorId && req.user.role !== 'admin') {
        //   return res.status(403).json({ message: 'Not authorized to view this schedule.' });
        // }

        // IMPORTANT: You need to fetch actual appointments from your Appointment model here
        // Example (assuming Appointment model is available and linked):
        const Appointment = require('../models/Appointment'); // Ensure this is imported

        const appointments = await Appointment.find({ doctor: doctorId })
            .populate('patient', 'name email phone') // Populate patient details
            .sort({ date: 1, time: 1 }); // Sort by date then time

        // Format for frontend, if needed
        const formattedSchedule = appointments.map(appt => ({
            id: appt._id,
            time: appt.time,
            // duration: "30 min", // You might need to calculate or store this
            patient: appt.patient ? appt.patient.name : 'N/A',
            patientId: appt.patient ? appt.patient._id : 'N/A',
            type: appt.service, // Use 'service' from Appointment model
            status: appt.status,
            condition: appt.notes, // Using notes as condition, adjust as needed
            notes: appt.notes,
            date: appt.date.toISOString().split('T')[0] // Format as YYYY-MM-DD
        }));

        res.json(formattedSchedule);

    } catch (err) {
        console.error('Error fetching doctor schedule:', err.message);
        if (err.kind === 'ObjectId') {
            return res.status(400).json({ message: 'Invalid Doctor ID format.' });
        }
        res.status(500).send('Server Error');
    }
});

// @route   GET /api/doctors/patient-reports/:doctorId
// @desc    Get patient reports relevant to a doctor
// @access  Private (e.g., Doctor themselves or admin)
router.get('/patient-reports/:doctorId', doctorAuthMiddleware, async (req, res) => {
    try {
        const { doctorId } = req.params;

        // Optional: Add authorization check (doctor can only see their own reports, or admin can see all)
        // if (req.doctor.id !== doctorId && req.user.role !== 'admin') {
        //   return res.status(403).json({ message: 'Not authorized to view these reports.' });
        // }

        // Find reports where the doctor field matches the provided doctorId
        const reports = await Report.find({ doctor: doctorId })
                                    .populate('patient', 'name email _id') // Select only necessary patient fields
                                    .sort({ date: -1 }); // Sort by newest first

        // Transform reports to match frontend's expected structure
        const formattedReports = reports.map(report => ({
            id: report._id,
            patient: report.patient ? report.patient.name : 'N/A',
            patientId: report.patient ? report.patient._id : 'N/A',
            lastVisit: report.date ? report.date.toISOString().split('T')[0] : 'N/A', // Using report date, format it
            condition: report.summary, // Using summary as condition for display
            urgency: report.status, // Using report status as urgency for display
            summary: report.summary,
            nextAction: report.nextAction,
            title: report.title,
            type: report.type,
            doctor: report.doctor, // This is the doctor's ObjectId, consider populating if doctor's name needed here
            imageUrl: `https://placehold.co/600x400/cccccc/333333?text=Report+Image+${report._id.toString().substring(0,4)}`
        }));

        res.json(formattedReports);
    } catch (err) {
        console.error('Error fetching patient reports for doctor:', err.message);
        if (err.kind === 'ObjectId') {
            return res.status(400).json({ message: 'Invalid Doctor ID format.' });
        }
        res.status(500).send('Server Error fetching patient reports');
    }
});

// @route   POST /api/doctors/add-report
// @desc    Add a new medical report for a patient by a doctor
// @access  Private (requires doctorAuthMiddleware)
router.post('/add-report', doctorAuthMiddleware, async (req, res) => {
    const { patientId, title, date, type, status, summary, nextAction } = req.body;
    const doctorId = req.doctor.id; // Get doctor ID from authenticated user

    // --- DEBUGGING LINE: Log the received add-report payload ---
    console.log('Backend received add-report payload from doctor:', req.body, 'for patient:', patientId, 'by doctor:', doctorId);
    // --- END DEBUGGING LINE ---

    try {
        // Basic validation
        if (!patientId || !title || !summary) {
            return res.status(400).json({ message: 'Missing required report fields (patientId, title, summary).' });
        }

        // Verify patient exists (doctor is already authenticated)
        const patientExists = await Patient.findById(patientId);
        if (!patientExists) {
            return res.status(404).json({ message: 'Patient not found for this report.' });
        }
        
        const newReport = new Report({
            patient: patientId,
            doctor: doctorId, // Set the doctor from the authenticated user
            title,
            date: date || Date.now(), // Use provided date or default to now
            type: type || 'Diagnosis', // Default type for doctor-added reports
            status: status || 'finalized', // Doctor reports are often finalized
            summary,
            nextAction
        });

        await newReport.save();
        res.status(201).json({ message: 'Report added successfully!', report: newReport });

    } catch (err) {
        console.error('Error adding report by doctor:', err.message);
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
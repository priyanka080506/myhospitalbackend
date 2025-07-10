// routes/appointmentRoutes.js

const express = require('express');
const router = express.Router();
const Appointment = require('../models/Appointment'); // Import the Appointment model
const Patient = require('../models/Patient');       // Import Patient model (needed for linking/populating)
const Doctor = require('../models/Doctor');         // Import Doctor model (needed for linking/populating)
// const authMiddleware = require('../middleware/authMiddleware'); // You'll use this later for protected routes

// --- DEBUGGING LOG ---
console.log('appointmentRoutes.js loaded');
// --- END DEBUGGING LOG ---

// @route   POST /api/appointments/public-book
// @desc    Allows a public user to book an appointment (from index.html via script.js)
// @access  Public
router.post('/public-book', async (req, res) => {
    // --- DEBUGGING LOG ---
    console.log('Received POST /api/appointments/public-book request:', req.body);
    // --- END DEBUGGING LOG ---

    try {
        const { firstName, lastName, email, phone, address, service, doctor, appointmentDate, appointmentTime, notes } = req.body;

        // Basic server-side validation
        if (!firstName || !lastName || !email || !phone || !service || !doctor || !appointmentDate || !appointmentTime) {
            return res.status(400).json({ message: 'Missing required fields for appointment booking.' });
        }

        // Optional: Find the doctor by name to get their ObjectId for linking
        // This assumes doctor names from frontend match the 'name' field in your Doctor model
        let doctorId = null;
        let doctorNameForDb = doctor; // Default to the name received from frontend
        try {
            // Attempt to clean the doctor name for search (e.g., remove 'Dr. ' and anything in parentheses)
            const searchName = doctor.startsWith('Dr. ') ? doctor.substring(4).split(' (')[0].trim() : doctor.split(' (')[0].trim();
            const foundDoctor = await Doctor.findOne({ name: searchName });
            if (foundDoctor) {
                doctorId = foundDoctor._id;
                doctorNameForDb = foundDoctor.name; // Use the name from the DB if a match is found
                console.log(`Found doctor ${foundDoctor.name} with ID: ${foundDoctor._id}`);
            } else {
                console.warn(`Doctor "${searchName}" not found in DB. Storing name as provided in form.`);
            }
        } catch (docErr) {
            console.error('Error in doctor lookup for public booking:', docErr.message);
        }

        // Create a new Appointment instance
        const newAppointment = new Appointment({
            // These fields should correspond to your Appointment Mongoose Schema
            patientName: `${firstName} ${lastName}`, // Combined for simplicity, adjust if your model has separate fields
            patientEmail: email,
            patientPhone: phone,
            patientAddress: address, // Optional field
            serviceType: service,
            doctor: doctorId,           // Link to Doctor _id if found, otherwise will be null
            doctorName: doctorNameForDb, // Store doctor's name as a string for display/fallback
            date: new Date(appointmentDate),    // Convert date string to Date object
            time: appointmentTime,
            notes: notes,              // Optional field
            status: 'Pending',         // Default status for new public bookings
            createdAt: new Date()      // Timestamp of creation
        });

        const savedAppointment = await newAppointment.save();
        console.log('Public appointment saved:', savedAppointment);
        res.status(201).json({ message: 'Appointment booked successfully!', appointment: savedAppointment });

    } catch (err) {
        console.error('Error in POST /api/appointments/public-book:', err.message);
        if (err.name === 'ValidationError') {
            let errors = {};
            Object.keys(err.errors).forEach((key) => {
                errors[key] = err.errors[key].message;
            });
            return res.status(400).json({ message: 'Validation Error', errors });
        }
        res.status(500).json({ message: 'Server Error during appointment booking', error: err.message });
    }
});


// @route   POST /api/appointments
// @desc    Add a new appointment (This route is typically for internal use or logged-in users booking for themselves/others)
// @access  Public (for now) / Private (e.g., Doctors, Admins, Patients later with authMiddleware)
router.post('/', async (req, res) => {
    // --- DEBUGGING LOG ---
    console.log('Received POST /api/appointments (general) request:', req.body);
    // --- END DEBUGGING LOG ---
    try {
        // This route expects 'patient' and 'doctor' fields to be ObjectIds if they are references in your model
        const newAppointment = new Appointment(req.body);
        const appointment = await newAppointment.save();
        res.status(201).json(appointment);

    } catch (err) {
        console.error('Error in POST /api/appointments (general):', err.message);
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

// @route   GET /api/appointments
// @desc    Get all appointments
// @access  Public (for now) / Private (e.g., Doctors, Admins later with authMiddleware)
router.get('/', async (req, res) => {
    // --- DEBUGGING LOG ---
    console.log('Received GET /api/appointments (get all) request.');
    // --- END DEBUGGING LOG ---
    try {
        const appointments = await Appointment.find()
            .populate('patient', 'name contact.email') // Ensure 'contact.email' matches your Patient model schema
            .populate('doctor', 'name specialization contact.email'); // Ensure these fields match your Doctor model schema

        res.json(appointments);

    } catch (err) {
        console.error('Error in GET /api/appointments (get all):', err.message);
        res.status(500).send('Server Error');
    }
});

// @route   GET /api/appointments/patient/:patientId
// @desc    Get appointments for a specific patient (for logged-in patient dashboard)
// @access  Public (for now) / Private (e.g., Patient themselves, Doctors, Admins later with authMiddleware)
router.get('/patient/:patientId', async (req, res) => {
    // --- DEBUGGING LOG ---
    console.log('Received GET /api/appointments/patient/:patientId request for patientId:', req.params.patientId);
    // --- END DEBUGGING LOG ---

    try {
        const patientId = req.params.patientId;

        // Validate if patientId is a valid MongoDB ObjectId
        if (!patientId.match(/^[0-9a-fA-F]{24}$/)) {
            console.error('Invalid Patient ID format received for appointments lookup:', patientId);
            return res.status(400).json({ message: 'Invalid Patient ID format.' });
        }

        // Find appointments where the 'patient' field references the patientId
        // This assumes your Appointment model has a 'patient' field that's a Mongoose.Schema.Types.ObjectId ref to 'Patient'
        const appointments = await Appointment.find({ patient: patientId })
            .populate('patient', 'name email phone dateOfBirth gender') // Populate relevant patient fields from Patient model
            .populate('doctor', 'name specialization'); // Populate relevant doctor fields from Doctor model

        console.log(`Found ${appointments.length} appointments for patient ${patientId}`);

        // --- Important: Format the data for your frontend dashboard ---
        // Your frontend's `renderAppointments` function (in `script2.js` or `dashboard.js`)
        // expects specific field names and structure. Adjust this `map` function accordingly.
        const formattedAppointments = appointments.map(appt => ({
            id: appt._id,
            title: appt.serviceType || 'Medical Appointment', // Or use appt.reasonForVisit if you have it
            date: appt.date.toISOString().split('T')[0], // Format date as YYYY-MM-DD
            time: appt.time,
            status: appt.status,
            doctorName: appt.doctor ? `Dr. ${appt.doctor.name}` : appt.doctorName || 'N/A', // Prefer populated doctor name, fallback to string
            doctorSpecialty: appt.doctor ? appt.doctor.specialization : 'N/A', // If populated
            location: appt.location || 'Hospital Main Branch', // Default if not in model
            notes: appt.notes || ''
            // Add any other fields your frontend expects for display
        }));

        res.json(formattedAppointments);

    } catch (err) {
        console.error('Error in GET /api/appointments/patient/:patientId:', err.message);
        res.status(500).send('Server Error fetching patient appointments');
    }
});


// @route   GET /api/appointments/:id
// @desc    Get a single appointment by ID
// @access  Public (for now) / Private
router.get('/:id', async (req, res) => {
    // --- DEBUGGING LOG ---
    console.log('Received GET /api/appointments/:id request for ID:', req.params.id);
    // --- END DEBUGGING LOG ---
    try {
        const appointment = await Appointment.findById(req.params.id)
            .populate('patient', 'name contact.email')
            .populate('doctor', 'name specialization contact.email');

        if (!appointment) {
            return res.status(404).json({ message: 'Appointment not found' });
        }
        res.json(appointment);
    } catch (err) {
        console.error('Error in GET /api/appointments/:id:', err.message);
        res.status(500).send('Server Error');
    }
});


// @route   PUT /api/appointments/:id
// @desc    Update an appointment by ID
// @access  Public (for now) / Private
router.put('/:id', async (req, res) => {
    // --- DEBUGGING LOG ---
    console.log('Received PUT /api/appointments/:id request for ID:', req.params.id, 'with body:', req.body);
    // --- END DEBUGGING LOG ---
    try {
        const appointment = await Appointment.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true } // Return the updated document, run schema validators
        );

        if (!appointment) {
            return res.status(404).json({ message: 'Appointment not found' });
        }
        res.json(appointment);
    } catch (err) {
        console.error('Error in PUT /api/appointments/:id:', err.message);
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

// @route   DELETE /api/appointments/:id
// @desc    Delete an appointment by ID
// @access  Public (for now) / Private
router.delete('/:id', async (req, res) => {
    // --- DEBUGGING LOG ---
    console.log('Received DELETE /api/appointments/:id request for ID:', req.params.id);
    // --- END DEBUGGING LOG ---
    try {
        const appointment = await Appointment.findByIdAndDelete(req.params.id);

        if (!appointment) {
            return res.status(404).json({ message: 'Appointment not found' });
        }
        res.json({ message: 'Appointment removed' });
    } catch (err) {
        console.error('Error in DELETE /api/appointments/:id:', err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
// routes/reportRoutes.js
const express = require('express');
const router = express.Router();
const Report = require('../models/Report'); // Assuming you have a Report model
const Patient = require('../models/Patient'); // Assuming you have a Patient model
const auth = require('../middleware/authMiddleware'); // Assuming you have auth middleware
const upload = require('../middleware/uploadMiddleware'); // Assuming you have file upload middleware (e.g., multer)

// Optional: For debugging, you can add a console log here
console.log('reportRoutes.js loaded');

// --- GET all reports (for an admin, or remove if not needed) ---
// This route is typically for administrators or internal use.
router.get('/', auth, async (req, res) => {
    try {
        // Only allow if user is admin, or remove this check if you don't have roles
        // if (req.user.role !== 'admin') {
        //     return res.status(403).json({ message: 'Access denied. Admins only.' });
        // }
        const reports = await Report.find({});
        res.json(reports);
    } catch (err) {
        console.error('Error fetching all reports:', err);
        res.status(500).json({ message: 'Server error' });
    }
});

// --- GET reports for a specific patient ---
// This is the endpoint your frontend will likely use.
// patientId should be passed in the URL (e.g., /api/reports/patient/60c72b2f9f1b2c001c8e4d6a)
router.get('/patient/:patientId', auth, async (req, res) => {
    try {
        const { patientId } = req.params;

        // Ensure the logged-in user is either the patient themselves or an authorized doctor/admin
        if (req.user.role === 'patient' && req.user.id !== patientId) {
            return res.status(403).json({ message: 'Access denied. You can only view your own reports.' });
        }

        const reports = await Report.find({ patient: patientId }).sort({ date: -1 }); // Sort by newest first
        res.json(reports);
    } catch (err) {
        console.error(`Error fetching reports for patient ${req.params.patientId}:`, err);
        res.status(500).json({ message: 'Server error' });
    }
});

// --- GET a single report by ID ---
router.get('/:id', auth, async (req, res) => {
    try {
        const report = await Report.findById(req.params.id);
        if (!report) {
            return res.status(404).json({ message: 'Report not found' });
        }

        // Ensure the logged-in user is authorized to view this specific report
        if (req.user.role === 'patient' && report.patient.toString() !== req.user.id) {
            return res.status(403).json({ message: 'Access denied. You can only view your own reports.' });
        }

        res.json(report);
    } catch (err) {
        console.error('Error fetching report by ID:', err);
        res.status(500).json({ message: 'Server error' });
    }
});

// --- POST/CREATE a new report ---
// This route will handle the file upload.
// 'file' is the field name expected from the FormData on the frontend.
router.post('/', auth, upload.single('file'), async (req, res) => {
    try {
        // Doctors or authorized personnel should be able to add reports.
        // If a patient adds their own report, ensure validation.
        // Example: if (req.user.role === 'patient' && req.user.id !== req.body.patientId) {
        //     return res.status(403).json({ message: 'Cannot add reports for other patients.' });
        // }

        // Data from the form (req.body)
        const { title, type, doctorName, date, summary, patientId, imageUrl } = req.body;

        // Check if patientId exists
        const patientExists = await Patient.findById(patientId);
        if (!patientExists) {
            return res.status(400).json({ message: 'Patient not found for the given patientId.' });
        }

        let fileUrl = null;
        // If a file was uploaded, set the fileUrl.
        // Render will typically store files in a cloud storage (like Render's disk, or AWS S3 if configured).
        // For local development, multer's diskStorage might save to a local 'uploads' folder.
        if (req.file) {
            // Adjust this path based on where Render or your local setup makes files accessible.
            // For Render, it might be accessible via a specific URL or CDN path if you integrate S3.
            // For local, if you serve static files from '/uploads', it might be /uploads/filename.
            fileUrl = `/uploads/${req.file.filename}`; // This assumes you have a static route for /uploads
            // Or if you're directly storing a public URL from a cloud storage after upload, use that.
        }

        const newReport = new Report({
            patient: patientId, // Link to the Patient model
            title,
            type,
            doctorName,
            date,
            summary,
            fileUrl: fileUrl, // Path to the uploaded PDF/image
            imageUrl: imageUrl || null, // Direct image URL if provided
            status: 'Final', // Default status
        });

        await newReport.save();
        res.status(201).json({ message: 'Report added successfully!', report: newReport });
    } catch (err) {
        console.error('Error adding report:', err);
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});

// --- UPDATE a report (e.g., status, notes) ---
router.put('/:id', auth, async (req, res) => {
    try {
        // Only allow doctors/admins to update reports, or the patient for specific fields
        // if (req.user.role === 'patient' && some_fields_cannot_be_updated_by_patient) {
        //     return res.status(403).json({ message: 'Access denied.' });
        // }

        const report = await Report.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        if (!report) {
            return res.status(404).json({ message: 'Report not found' });
        }
        res.json({ message: 'Report updated successfully!', report });
    } catch (err) {
        console.error('Error updating report:', err);
        res.status(500).json({ message: 'Server error' });
    }
});

// --- DELETE a report ---
router.delete('/:id', auth, async (req, res) => {
    try {
        // Only allow admins or authorized doctors to delete reports
        // if (req.user.role !== 'admin') {
        //     return res.status(403).json({ message: 'Access denied. Admins only.' });
        // }

        const report = await Report.findByIdAndDelete(req.params.id);
        if (!report) {
            return res.status(404).json({ message: 'Report not found' });
        }
        res.json({ message: 'Report deleted successfully!' });
    } catch (err) {
        console.error('Error deleting report:', err);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
// models/Report.js
const mongoose = require('mongoose');

const ReportSchema = new mongoose.Schema({
    patient: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Patient', // Reference to the Patient model
        required: true
    },
    title: {
        type: String,
        required: true,
        trim: true
    },
    type: {
        type: String,
        enum: ['Laboratory', 'Radiology', 'Cardiology', 'General', 'Other'], // Define allowed report types
        required: true
    },
    doctorName: {
        type: String,
        required: true,
        trim: true
    },
    date: {
        type: Date,
        required: true
    },
    summary: {
        type: String,
        trim: true
    },
    fileUrl: { // URL to the uploaded file (PDF, image, etc.)
        type: String,
        trim: true
    },
    imageUrl: { // Optional: for reports that are purely images and you want to link directly
        type: String,
        trim: true
    },
    status: {
        type: String,
        enum: ['Final', 'Preliminary', 'Pending Review'],
        default: 'Final'
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Report', ReportSchema);
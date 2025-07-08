// models/Report.js

const mongoose = require('mongoose');

const ReportSchema = new mongoose.Schema({
    patient: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Patient', // Reference to the Patient model
        required: [true, 'Patient ID is required for a report']
    },
    doctor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Doctor', // Reference to the Doctor model
        required: [true, 'Doctor ID is required for a report']
    },
    title: {
        type: String,
        required: [true, 'Report title is required'],
        trim: true
    },
    date: {
        type: Date,
        default: Date.now // Defaults to the current date
    },
    type: {
        type: String,
        enum: ['Laboratory', 'Radiology', 'Consultation', 'Prescription', 'Other'],
        default: 'Other'
    },
    status: {
        type: String,
        enum: ['pending', 'final', 'reviewed'],
        default: 'pending'
    },
    summary: {
        type: String,
        trim: true
    },
    nextAction: {
        type: String,
        trim: true
    }
}, {
    timestamps: true // Adds createdAt and updatedAt timestamps
});

const Report = mongoose.model('Report', ReportSchema);

module.exports = Report;

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
        // This can be null for patient self-reports, but required for doctor-added reports
        // You might want to make this `required: true` if all reports MUST have a doctor,
        // or handle it conditionally in your routes. For now, it's optional here.
        default: null
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
        enum: ['Laboratory', 'Radiology', 'Consultation', 'Prescription', 'Symptoms Log', 'Home Monitoring', 'Questionnaire', 'Other'], // Expanded types
        default: 'Other'
    },
    status: {
        type: String,
        enum: ['pending', 'final', 'reviewed'],
        default: 'pending'
    },
    summary: {
        type: String,
        trim: true,
        required: [true, 'Report summary is required']
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

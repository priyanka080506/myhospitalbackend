// models/Appointment.js

const mongoose = require('mongoose');

const AppointmentSchema = new mongoose.Schema({
    patient: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Patient', // Reference to the Patient model
        required: [true, 'Patient ID is required']
    },
    doctor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Doctor', // Reference to the Doctor model
        required: [true, 'Doctor ID is required']
    },
    service: { // Previously serviceType in script.js, now just 'service'
        type: String,
        required: [true, 'Service is required'],
        trim: true
    },
    date: {
        type: Date,
        required: [true, 'Appointment date is required']
    },
    time: {
        type: String,
        required: [true, 'Appointment time is required'],
        trim: true
    },
    notes: {
        type: String,
        trim: true
    },
    status: {
        type: String,
        enum: ['Scheduled', 'Confirmed', 'Completed', 'Cancelled'],
        default: 'Scheduled'
    },
    // NEW FIELDS ADDED FOR FRONTEND COMPATIBILITY
    doctorName: { // To store the doctor's name directly for easier display in patient portal
        type: String,
        trim: true
    },
    appointmentFees: { // To store the fee at the time of booking
        type: Number,
        default: 0,
        min: [0, 'Appointment fees cannot be negative']
    }
}, {
    timestamps: true // Adds createdAt and updatedAt timestamps
});

const Appointment = mongoose.model('Appointment', AppointmentSchema);

module.exports = Appointment;
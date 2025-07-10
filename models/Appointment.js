// models/Appointment.js

const mongoose = require('mongoose');

const AppointmentSchema = new mongoose.Schema({
    patient: {
        type: mongoose.Schema.Types.ObjectId, // This is a special Mongoose type for Object IDs
        ref: 'Patient', // This tells Mongoose that this ObjectId refers to the 'Patient' model
        required: [true, 'Patient is required for the appointment']
    },
    doctor: {
        type: mongoose.Schema.Types.ObjectId, // Reference to Doctor model
        ref: 'Doctor', // This refers to the 'Doctor' model
        required: [true, 'Doctor is required for the appointment']
    },
    date: {
        type: Date,
        required: [true, 'Appointment date is required']
    },
    time: {
        type: String, // You could use a Date type here too, but string is simpler for just time
        required: [true, 'Appointment time is required'],
        trim: true
    },
    reason: {
        type: String,
        required: [true, 'Reason for appointment is required'],
        trim: true
    },
    status: {
        type: String,
        enum: ['Scheduled', 'Confirmed', 'Cancelled', 'Completed'], // Possible statuses
        default: 'Scheduled'
    },
    notes: {
        type: String,
        trim: true
    }
}, {
    timestamps: true // Adds createdAt and updatedAt timestamps automatically
});

// Create the Mongoose Model from the Schema
const Appointment = mongoose.model('Appointment', AppointmentSchema);

module.exports = Appointment;
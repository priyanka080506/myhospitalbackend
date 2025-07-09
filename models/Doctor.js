// models/Doctor.js

const mongoose = require('mongoose');

const DoctorSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Doctor name is required'],
        trim: true
    },
    specialty: { // Changed to 'specialty' to match frontend
        type: String,
        required: [true, 'Specialty is required'],
        trim: true
    },
    email: { // Moved to top-level to match frontend payload
        type: String,
        required: [true, 'Doctor email is required'],
        unique: true,
        trim: true,
        lowercase: true,
        match: [/.+@.+\..+/, 'Please fill a valid email address']
    },
    phone: { // Moved to top-level to match frontend payload
        type: String,
        required: [true, 'Phone number is required'],
        trim: true,
        sparse: true
    },
    license: { // NEW: Added license field
        type: String,
        required: [true, 'Medical license number is required'],
        unique: true, // Assuming license numbers are unique
        trim: true
    },
    workingPlaces: [{ // NEW: Added workingPlaces array of objects
        place: {
            type: String,
            required: [true, 'Working place is required'],
            trim: true
        },
        timing: {
            type: String,
            required: [true, 'Working timing is required'],
            trim: true
        }
    }],
    password: { // NEW: Added password field for authentication
        type: String,
        required: [true, 'Password is required'],
        minlength: [6, 'Password must be at least 6 characters long'],
        select: false // Do not return the password by default in queries
    },
    photo: { // NEW: Added photo field
        type: String,
        default: 'https://i.pravatar.cc/80?img=1' // Default photo URL
    },
    experienceYears: {
        type: Number,
        min: [0, 'Experience years cannot be negative'],
        default: 0
    },
    availableForAppointments: {
        type: Boolean,
        default: true
    },
    appointmentFees: { // NEW: Added appointmentFees field
        type: Number,
        default: 0,
        min: [0, 'Appointment fees cannot be negative']
    }
}, {
    timestamps: true
});

const Doctor = mongoose.model('Doctor', DoctorSchema);

module.exports = Doctor;

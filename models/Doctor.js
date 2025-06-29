// models/Doctor.js

const mongoose = require('mongoose');

const DoctorSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Doctor name is required'],
        trim: true
    },
    specialization: {
        type: String,
        required: [true, 'Specialization is required'],
        trim: true
    },
    contact: { // Using a nested object for contact details
        phone: {
            type: String,
            trim: true,
            sparse: true // Allows nulls, but unique if present
        },
        email: {
            type: String,
            required: [true, 'Doctor email is required'],
            unique: true, // Doctors should have unique emails
            trim: true,
            lowercase: true,
            match: [/.+@.+\..+/, 'Please fill a valid email address']
        }
    },
    // You might want to reference the User model if doctors also have login accounts
    // user: {
    //     type: mongoose.Schema.Types.ObjectId,
    //     ref: 'User',
    //     unique: true, // One user account per doctor
    //     sparse: true // Allows nulls
    // },
    experienceYears: {
        type: Number,
        min: [0, 'Experience years cannot be negative'],
        default: 0
    },
    // Example for availability (can be more complex later)
    availableForAppointments: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true // Adds createdAt and updatedAt timestamps automatically
});

// Create the Mongoose Model from the Schema
const Doctor = mongoose.model('Doctor', DoctorSchema);

module.exports = Doctor;
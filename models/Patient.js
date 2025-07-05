// models/Patient.js

const mongoose = require('mongoose');

const PatientSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Patient name is required'],
        trim: true
    },
    // Changed email and phone to be top-level fields to match frontend payload
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true, // Ensure email is unique for each patient
        trim: true,
        lowercase: true,
        match: [/.+@.+\..+/, 'Please fill a valid email address']
    },
    phone: {
        type: String,
        required: [true, 'Phone number is required'], // Made phone required
        trim: true,
        sparse: true // Allows nulls, but unique if present (though unique is not set here)
    },
    // Removed the 'contact' nested object as email and phone are now top-level
    
    // Corrected field name to match frontend payload and validation error
    dateOfBirth: {
        type: Date,
        required: [true, 'Date of birth is required']
    },
    gender: {
        type: String,
        enum: ['Male', 'Female', 'Other', 'Prefer not to say'], // Enforce specific values
        required: [true, 'Gender is required']
    },
    // NEW: Added password field for authentication
    password: {
        type: String,
        required: [true, 'Password is required'],
        minlength: [6, 'Password must be at least 6 characters long'],
        select: false // Do not return the password by default in queries
    },
    medicalHistory: [{ // Array of strings for simplicity, can be objects later
        type: String,
        trim: true
    }],
    // You might want to add an address field if you collect it
    address: {
        type: String,
        trim: true
    }
}, {
    timestamps: true // Adds createdAt and updatedAt timestamps automatically
});

// Create the Mongoose Model from the Schema
const Patient = mongoose.model('Patient', PatientSchema);

module.exports = Patient;

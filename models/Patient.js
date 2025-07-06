// models/Patient.js

const mongoose = require('mongoose');

const PatientSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Patient name is required'],
        trim: true
    },
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
    dateOfBirth: { // This field name must match 'dateOfBirth' exactly
        type: Date,
        required: [true, 'Date of birth is required']
    },
    gender: { // This field name must match 'gender' exactly
        type: String,
        enum: ['Male', 'Female', 'Other', 'Prefer not to say'], // Enforce specific values
        required: [true, 'Gender is required']
    },
    password: { // This field must exist for hashing
        type: String,
        required: [true, 'Password is required'],
        minlength: [6, 'Password must be at least 6 characters long'],
        select: false // Do not return the password by default in queries
    },
    medicalHistory: [{
        type: String,
        trim: true
    }],
    address: {
        type: String,
        trim: true
    }
}, {
    timestamps: true
});

const Patient = mongoose.model('Patient', PatientSchema);

module.exports = Patient;

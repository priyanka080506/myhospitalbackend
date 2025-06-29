// models/Patient.js

const mongoose = require('mongoose');

const PatientSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Patient name is required'],
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
            trim: true,
            lowercase: true,
            match: [/.+@.+\..+/, 'Please fill a valid email address']
        },
        address: {
            type: String,
            trim: true
        }
    },
    dateOfBirth: {
        type: Date,
        required: [true, 'Date of birth is required']
    },
    gender: {
        type: String,
        enum: ['Male', 'Female', 'Other', 'Prefer not to say'], // Enforce specific values
        required: [true, 'Gender is required']
    },
    medicalHistory: [{ // Array of strings for simplicity, can be objects later
        type: String,
        trim: true
    }],
    // You might want to reference the User model if patients also have login accounts
    // user: {
    //     type: mongoose.Schema.Types.ObjectId,
    //     ref: 'User',
    //     unique: true, // One user account per patient
    //     sparse: true // Allows nulls
    // }
}, {
    timestamps: true // Adds createdAt and updatedAt timestamps automatically
});

// Create the Mongoose Model from the Schema
const Patient = mongoose.model('Patient', PatientSchema);

module.exports = Patient;
// models/User.js

const mongoose = require('mongoose'); // Import Mongoose

// Define the schema for your User model
const userSchema = new mongoose.Schema({
  // Field 1: name
  name: {
    type: String,     // Data type is String
    required: true,   // This field is mandatory
    trim: true        // Remove whitespace from both ends
  },
  // Field 2: email
  email: {
    type: String,
    required: true,
    unique: true,     // Each email must be unique in the collection
    lowercase: true,  // Store email in lowercase
    // You can add more complex validation with regex or custom functions
    match: [/.+@.+\..+/, 'Please fill a valid email address']
  },
  // Field 3: password
  password: {
    type: String,
    required: true,
    minlength: 6      // Minimum length for the password
  },
  // Field 4: Optional - isAdmin (for roles)
  isAdmin: {
    type: Boolean,
    default: false    // Default value is false if not provided
  },
  // Field 5: createdAt (for tracking when the user was created)
  createdAt: {
    type: Date,
    default: Date.now // Default value is the current date/time when created
  },
  // Field 6: Optional - an array of posts (if a user can have multiple posts)
  // This is how you might define an array of embedded documents or references
  posts: [{
    type: mongoose.Schema.Types.ObjectId, // This means it will store MongoDB Object IDs
    ref: 'Post' // This refers to another model named 'Post' (for linking)
  }]
}, {
  // Optional: Schema options
  timestamps: true // Automatically adds `createdAt` and `updatedAt` fields
                   // If you use this, you might not need `createdAt` above,
                   // unless you want a custom name for it.
});

// Compile the schema into a Model and export it
// The first argument 'User' will be the name of your collection in MongoDB (lowercase and pluralized by Mongoose, so 'users')
module.exports = mongoose.model('User', userSchema);
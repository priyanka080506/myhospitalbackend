// routes/authRoutes.js

const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs'); // For comparing passwords
const jwt = require('jsonwebtoken'); // For creating JWTs
const User = require('../models/User'); // Import your User model

// Load environment variables (you'll need to add JWT_SECRET to your .env)
// For security, never hardcode your secret key!
// const dotenv = require('dotenv');
// dotenv.config();

// @route   POST /api/auth/login
// @desc    Authenticate user & get token
// @access  Public
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    // 1. Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      // Use 400 Bad Request for invalid credentials to avoid giving hints to attackers
      return res.status(400).json({ message: 'Invalid Credentials (User not found)' });
    }

    // 2. Compare provided password with hashed password in DB
    // bcrypt.compare returns true if they match, false otherwise
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid Credentials (Password incorrect)' });
    }

    // 3. If credentials are valid, create and sign a JSON Web Token (JWT)
    // The payload contains data you want to embed in the token (e.g., user ID, isAdmin status)
    const payload = {
      user: {
        id: user.id, // Mongoose virtual 'id' for '_id'
        isAdmin: user.isAdmin,
        // You can add more data here if needed, but keep it minimal
      },
    };

    // Sign the token with your secret key (from .env)
    // The token expires in a certain time (e.g., 1 hour)
    jwt.sign(
      payload,
      process.env.JWT_SECRET, // Your secret key, defined in .env
      { expiresIn: '1h' },    // Token expires in 1 hour
      (err, token) => {
        if (err) throw err; // If there's an error signing the token
        res.json({ token }); // Send the token back to the client
      }
    );

  } catch (err) {
    console.error(err.message); // Log the actual error for debugging on the server side
    res.status(500).send('Server Error'); // Generic server error message for the client
  }
});

module.exports = router;
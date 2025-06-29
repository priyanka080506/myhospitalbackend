// routes/userRoutes.js

const express = require('express');
const router = express.Router();
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const auth = require('../middleware/authMiddleware'); // Import your auth middleware

// --- Middleware to get a specific user by ID (Helper Function) ---
// This middleware will run for any route that has ':id' in its path
async function getUser(req, res, next) {
  let user;
  try {
    user = await User.findById(req.params.id).select('-password'); // Exclude password
    if (user == null) {
      return res.status(404).json({ message: 'Cannot find user' });
    }
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
  res.user = user;
  next();
}


// GET all users
// Endpoint: GET /api/users
// Protected: Requires JWT
router.get('/', auth, async (req, res) => { // <-- ADD 'auth' HERE
  try {
    // req.user will be available here due to auth middleware
    console.log('User accessing GET all users:', req.user.id); // For testing: See who made the request
    const users = await User.find().select('-password');
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST a new user (REGISTER)
// Endpoint: POST /api/users
// NOT Protected: This is for new user registration
router.post('/', async (req, res) => {
  const { name, email, password } = req.body;

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User with that email already exists.' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = new User({
      name,
      email,
      password: hashedPassword,
    });

    const newUser = await user.save();

    res.status(201).json({
      _id: newUser._id,
      name: newUser.name,
      email: newUser.email,
      isAdmin: newUser.isAdmin,
      createdAt: newUser.createdAt
    });

  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});


// GET a single user
// Endpoint: GET /api/users/:id
// Protected: Requires JWT
router.get('/:id', auth, getUser, (req, res) => { // <-- ADD 'auth' HERE
  console.log('User accessing GET single user:', req.user.id); // For testing
  res.json(res.user);
});

// UPDATE a user
// Endpoint: PUT /api/users/:id
// Protected: Requires JWT
router.put('/:id', auth, getUser, async (req, res) => { // <-- ADD 'auth' HERE
  console.log('User attempting to update user:', req.user.id); // For testing
  // You might add logic here to ensure only the user themselves or an admin can update
  // if (String(req.user.id) !== String(req.params.id) && !req.user.isAdmin) {
  //   return res.status(403).json({ message: 'Not authorized to update this user' });
  // }

  if (req.body.name != null) {
    res.user.name = req.body.name;
  }
  if (req.body.email != null) {
    if (req.body.email !== res.user.email) {
      const existingUser = await User.findOne({ email: req.body.email });
      if (existingUser && String(existingUser._id) !== String(res.user._id)) {
        return res.status(400).json({ message: 'Email already in use by another user.' });
      }
    }
    res.user.email = req.body.email;
  }
  if (req.body.isAdmin != null) {
      res.user.isAdmin = req.body.isAdmin;
  }

  try {
    const updatedUser = await res.user.save();
    res.json({
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        isAdmin: updatedUser.isAdmin,
        createdAt: updatedUser.createdAt,
        updatedAt: updatedUser.updatedAt
    });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// DELETE a user
// Endpoint: DELETE /api/users/:id
// Protected: Requires JWT
router.delete('/:id', auth, getUser, async (req, res) => { // <-- ADD 'auth' HERE
  console.log('User attempting to delete user:', req.user.id); // For testing
  // You might add logic here to ensure only the user themselves or an admin can delete
  // if (String(req.user.id) !== String(req.params.id) && !req.user.isAdmin) {
  //   return res.status(403).json({ message: 'Not authorized to delete this user' });
  // }

  try {
    await res.user.deleteOne();
    res.json({ message: 'User deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
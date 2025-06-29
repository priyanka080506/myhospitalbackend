// middleware/authMiddleware.js

const jwt = require('jsonwebtoken'); // For verifying JWTs

// This middleware will protect your routes
module.exports = function(req, res, next) {
  // 1. Get token from header
  // When sending requests with a token, it's typically sent in the
  // Authorization header like: "Bearer TOKEN_STRING"
  const token = req.header('Authorization');

  // Check if no token
  if (!token) {
    return res.status(401).json({ message: 'No token, authorization denied' });
  }

  // Expecting format: "Bearer <token>"
  // We need to split to get just the token string
  const tokenParts = token.split(' ');
  if (tokenParts.length !== 2 || tokenParts[0] !== 'Bearer') {
    return res.status(401).json({ message: 'Token format is "Bearer <token>"' });
  }

  const tokenString = tokenParts[1]; // Get the actual token string

  try {
    // 2. Verify token
    // jwt.verify() decodes the token using your secret key.
    // If successful, it returns the payload (the 'user' object we put in it).
    const decoded = jwt.verify(tokenString, process.env.JWT_SECRET);

    // 3. Attach user from token payload to the request object
    // This makes user data available in subsequent route handlers
    req.user = decoded.user; // 'user' is the key we used in the payload when signing the token
    next(); // Move to the next middleware or the route handler
  } catch (err) {
    // If token verification fails (e.g., expired, invalid secret)
    res.status(401).json({ message: 'Token is not valid' });
  }
};
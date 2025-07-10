// middleware/authMiddleware.js

const jwt = require('jsonwebtoken'); // For verifying JWTs

// This middleware will protect your routes
module.exports = function(req, res, next) {
    // 1. Get token from header
    // When sending requests with a token, it's typically sent in the
    // Authorization header like: "Bearer TOKEN_STRING"
    const authHeader = req.header('Authorization');

    // Check if no token or incorrect format
    if (!authHeader) {
        return res.status(401).json({ message: 'No token provided, authorization denied.' });
    }

    // Expecting format: "Bearer <token>"
    // We need to split to get just the token string
    const tokenParts = authHeader.split(' ');
    if (tokenParts.length !== 2 || tokenParts[0] !== 'Bearer') {
        return res.status(401).json({ message: 'Token format is "Bearer <token>". Authorization denied.' });
    }

    const tokenString = tokenParts[1]; // Get the actual token string

    try {
        // 2. Verify token
        // jwt.verify() decodes the token using your secret key.
        // If successful, it returns the payload (the 'patient' object we put in it).
        const decoded = jwt.verify(tokenString, process.env.JWT_SECRET);

        // --- CRUCIAL CHANGE HERE ---
        // 3. Attach patient from token payload to the request object
        // This makes patient data available in subsequent route handlers (e.g., req.patient.id)
        // We assume your JWT payload has a 'patient' object (with an 'id' field)
        req.patient = decoded.patient; 
        // --- END CRUCIAL CHANGE ---

        // Debugging log:
        console.log('Auth Middleware: Token verified. Patient ID:', req.patient.id);

        next(); // Move to the next middleware or the route handler
    } catch (err) {
        // If token verification fails (e.g., expired, invalid secret, malformed token)
        console.error('Auth Middleware: Token verification failed. Error:', err.message);
        res.status(401).json({ message: 'Token is not valid. Authorization denied.' });
    }
};
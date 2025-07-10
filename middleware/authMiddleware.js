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
        console.log('Auth Middleware: No token provided. Authorization denied.'); // Added log
        return res.status(401).json({ message: 'No token, authorization denied' });
    }

    // Expecting format: "Bearer <token>"
    // We need to split to get just the token string
    const tokenParts = token.split(' ');
    if (tokenParts.length !== 2 || tokenParts[0] !== 'Bearer') {
        console.log('Auth Middleware: Token format incorrect. Expected "Bearer <token>".'); // Added log
        return res.status(401).json({ message: 'Token format is "Bearer <token>"' });
    }

    const tokenString = tokenParts[1]; // Get the actual token string

    try {
        // 2. Verify token
        // jwt.verify() decodes the token using your secret key.
        // If successful, it returns the payload (the 'patient' object we put in it).
        const decoded = jwt.verify(tokenString, process.env.JWT_SECRET);

        // --- DEBUGGING LOG ---
        console.log('Auth Middleware: Token decoded successfully.');
        console.log('Auth Middleware: Decoded payload:', decoded);
        // --- END DEBUGGING LOG ---

        // Crucial Change: Attach the patient object from the token payload to req.patient
        // Your JWT payload has a 'patient' key as seen in patientRoutes.js when signing.
        if (!decoded.patient || !decoded.patient.id) { // Defensive check
             console.log('Auth Middleware: Decoded token does not contain expected patient ID in payload.');
             return res.status(401).json({ message: 'Token is not valid: Missing patient ID in payload' });
        }
        req.patient = decoded.patient; // <--- CHANGED FROM req.user TO req.patient
        console.log('Auth Middleware: req.patient set to:', req.patient.id); // Added log

        next(); // Move to the next middleware or the route handler
    } catch (err) {
        // If token verification fails (e.g., expired, invalid secret)
        console.error('Auth Middleware: Token verification failed:', err.message); // Added log
        res.status(401).json({ message: 'Token is not valid' });
    }
};
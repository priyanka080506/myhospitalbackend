// middleware/doctorAuthMiddleware.js

const jwt = require('jsonwebtoken');

const doctorAuthMiddleware = (req, res, next) => {
    // Get token from header
    const token = req.header('x-auth-token'); // Common header for JWT

    // Check if no token
    if (!token) {
        return res.status(401).json({ message: 'No token, authorization denied' });
    }

    // Verify token
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // IMPORTANT: Ensure your JWT payload for doctors looks like:
        // { doctor: { id: 'theDoctorId' } }
        // If your payload structure is different (e.g., { user: { id: 'theDoctorId', role: 'doctor' } }),
        // you'll need to adjust `decoded.doctor` accordingly.
        if (!decoded.doctor || !decoded.doctor.id) {
            console.log('JWT decoded, but no doctor ID found in payload:', decoded);
            return res.status(401).json({ message: 'Token is not valid for a doctor account' });
        }
        
        req.doctor = decoded.doctor; // Attach doctor payload to the request object
        console.log('doctorAuthMiddleware: Token verified, doctor ID:', req.doctor.id);
        next(); // Proceed to the next middleware/route handler
    } catch (err) {
        console.error('doctorAuthMiddleware: Token verification failed:', err.message);
        // Token is not valid (e.g., expired, malformed)
        return res.status(401).json({ message: 'Token is not valid' });
    }
};

module.exports = doctorAuthMiddleware;
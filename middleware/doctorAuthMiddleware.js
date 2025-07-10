// middleware/doctorAuthMiddleware.js

const jwt = require('jsonwebtoken');

module.exports = function(req, res, next) {
    const authHeader = req.header('Authorization');

    if (!authHeader) {
        return res.status(401).json({ message: 'No token provided, authorization denied for doctor.' });
    }

    const tokenParts = authHeader.split(' ');
    if (tokenParts.length !== 2 || tokenParts[0] !== 'Bearer') {
        return res.status(401).json({ message: 'Token format is "Bearer <token>". Authorization denied for doctor.' });
    }

    const tokenString = tokenParts[1];

    try {
        const decoded = jwt.verify(tokenString, process.env.JWT_SECRET);
        // Assuming JWT payload has a 'doctor' object with an 'id' field
        req.doctor = decoded.doctor;
        console.log('Doctor Auth Middleware: Token verified. Doctor ID:', req.doctor.id);
        next();
    } catch (err) {
        console.error('Doctor Auth Middleware: Token verification failed. Error:', err.message);
        res.status(401).json({ message: 'Doctor Token is not valid. Authorization denied.' });
    }
};
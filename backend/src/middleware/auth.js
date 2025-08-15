const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Authentication middleware
const authenticate = async (req, res, next) => {
    try {
        let token;

        // Check for token in Authorization header
        if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
            token = req.headers.authorization.split(' ')[1];
        }

        if (!token) {
            return res.status(401).json({
                error: 'Access denied. No token provided.'
            });
        }

        try {
            // Verify token
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            // Get user from database
            const user = await User.findById(decoded.userId).select('-password');

            if (!user) {
                return res.status(401).json({
                    error: 'Token is valid but user not found'
                });
            }

            req.user = user;
            next();
        } catch (error) {
            res.status(401).json({
                error: 'Invalid token'
            });
        }
    } catch (error) {
        console.error('Authentication middleware error:', error);
        res.status(500).json({
            error: 'Authentication error'
        });
    }
};

// Authorization middleware (check roles)
const authorize = (...roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({
                error: 'Access denied. Please authenticate first.'
            });
        }

        if (!roles.includes(req.user.role)) {
            return res.status(403).json({
                error: 'Access denied. Insufficient permissions.'
            });
        }

        next();
    };
};

// Generate JWT token
const generateToken = (userId) => {
    return jwt.sign(
        { userId },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );
};

// Error handling middleware
const errorHandler = (err, req, res, next) => {
    console.error('Error:', err);

    // Mongoose validation error
    if (err.name === 'ValidationError') {
        const errors = Object.values(err.errors).map(e => e.message);
        return res.status(400).json({
            error: 'Validation Error',
            details: errors
        });
    }

    // Mongoose duplicate key error
    if (err.code === 11000) {
        const field = Object.keys(err.keyValue)[0];
        return res.status(400).json({
            error: `${field} already exists`
        });
    }

    // JWT errors
    if (err.name === 'JsonWebTokenError') {
        return res.status(401).json({
            error: 'Invalid token'
        });
    }

    if (err.name === 'TokenExpiredError') {
        return res.status(401).json({
            error: 'Token expired'
        });
    }

    // Default error
    res.status(err.statusCode || 500).json({
        error: err.message || 'Internal Server Error'
    });
};

// Optional authentication middleware (doesn't fail if no token)
const optionalAuth = async (req, res, next) => {
    try {
        let token;

        if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
            token = req.headers.authorization.split(' ')[1];
        }

        if (token) {
            try {
                const decoded = jwt.verify(token, process.env.JWT_SECRET);
                const user = await User.findById(decoded.userId).select('-password');
                req.user = user;
            } catch (error) {
                // Token invalid, but continue without user
                console.log('Optional auth: Invalid token, continuing without authentication');
            }
        }

        next();
    } catch (error) {
        console.error('Optional authentication error:', error);
        next();
    }
};

module.exports = {
    authenticate,
    authorize,
    generateToken,
    errorHandler,
    optionalAuth
};
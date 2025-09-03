require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

// --- All Route Imports ---
const searchRoutes = require('./routes/search');
const meetingRoutes = require('./routes/meetings'); // Corrected import
const ideaRoutes = require('./routes/ideas');
const newsletterRoutes = require('./routes/newsletters');
const profileRoutes = require('./routes/profile');
const insightRoutes = require('./routes/insights');
const analystRoutes = require('./routes/analyst');
const demoRoutes = require('./routes/demo');
const audioRoutes = require('./routes/audio');

// Import middleware
const { errorHandler } = require('./middleware/auth');

// Initialize the Express app
const app = express();

// --- Middleware Configuration ---

// CORS Options
const allowedOrigins = [
    'https://execmind-frontend.onrender.com', // Your frontend URL
    'http://localhost:3001'
];
const corsOptions = {
    origin: function (origin, callback) {
        if (!origin || allowedOrigins.indexOf(origin) !== -1) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    }
};
app.use(cors(corsOptions)); // Use CORS with options ONCE

// Other Middleware
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/execmind')
    .then(() => console.log('Connected to MongoDB'))
    .catch((error) => console.error('MongoDB connection error:', error));

// --- Register All Routes ---
app.use('/api/search', searchRoutes);
app.use('/api/meetings', meetingRoutes); // Correctly uses meetingRoutes
app.use('/api/ideas', ideaRoutes);
app.use('/api/newsletters', newsletterRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/insights', insightRoutes);
app.use('/api/analyst', analystRoutes);
app.use('/api/demo', demoRoutes);
app.use('/api/audio', audioRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        uptime: process.uptime()
    });
});

// Default route
app.get('/', (req, res) => {
    res.json({
        message: 'ExecMind CEO Companion Agent API',
        version: '1.0.0',
        endpoints: [
            '/api/meetings',
            '/api/ideas',
            '/api/newsletters',
            '/api/profile',
            '/api/insights',
            '/api/search',
            '/api/analyst',
            '/api/health'
        ]
    });
});

// Error handling middleware
app.use(errorHandler);

// 404 handler
app.use('*', (req, res) => {
    res.status(404).json({
        error: 'Route not found',
        path: req.originalUrl
    });
});

const PORT = process.env.PORT || 3000;
const HOST = '0.0.0.0'; // Listen on all network interfaces

app.listen(PORT, HOST, () => {
    console.log(`Server is running on port ${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV || 'production'}`);
});
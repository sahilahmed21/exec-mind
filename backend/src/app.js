require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

// Import routes
const meetingRoutes = require('./routes/meetings');
const ideaRoutes = require('./routes/ideas');
const newsletterRoutes = require('./routes/newsletters');
const profileRoutes = require('./routes/profile');

// Import middleware
const { errorHandler } = require('./middleware/auth');

const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/execmind')
    .then(() => console.log('Connected to MongoDB'))
    .catch((error) => console.error('MongoDB connection error:', error));

// Routes
app.use('/api/meetings', meetingRoutes);
app.use('/api/ideas', ideaRoutes);
app.use('/api/newsletters', newsletterRoutes);
app.use('/api/profile', profileRoutes);

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

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});
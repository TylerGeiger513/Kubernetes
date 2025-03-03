// backend/src/app.js
const express = require('express');
const mongoose = require('mongoose');
const Redis = require('ioredis');
const config = require('./config/configData');
const testRoutes = require('./routes/testRoutes');

const app = express();

// Connect to MongoDB
mongoose.connect(config.mongoURI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error('MongoDB connection error:', err));

// Connect to Redis
const redis = new Redis(config.redisURI);
redis.on('connect', () => console.log('Connected to Redis'));
redis.on('error', (err) => console.error('Redis error:', err));

// Middleware to parse JSON
app.use(express.json());

// Set up routes
app.use('/api/tests', testRoutes);
// log all incoming requests
app.use((req, res, next) => {
    console.log(`${req.method} ${req.path}`);
    next();
});

// Basic error handling middleware
app.use((err, req, res, next) => {
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
});

// Start the server
app.listen(config.backendPort, config.host, () => {
    console.log(`Express server running at http://${config.host}:${config.backendPort}`);
});

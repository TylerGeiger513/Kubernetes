// backend/src/routes/testRoutes.js
const express = require('express');
const router = express.Router();

// GET /api/tests
router.get('/', (req, res) => {
  res.json({ message: 'API test successful! Backend is connected to MongoDB and Redis.' });
});

module.exports = router;

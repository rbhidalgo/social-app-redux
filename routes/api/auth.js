const express = require('express');
const router = express.Router();

// GET route api/auth
// Auth route
// Public access
router.get('/', (req, res) => res.send('auth route'));

module.exports = router;
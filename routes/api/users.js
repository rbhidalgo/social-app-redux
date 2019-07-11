const express = require('express');
const router = express.Router();

// GET route api/users
// Test route
// Public access
router.get('/', (req, res) => res.send('user route'));

module.exports = router;
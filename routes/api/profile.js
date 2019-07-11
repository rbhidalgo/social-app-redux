const express = require('express');
const router = express.Router();

// GET route api/profile
// Profile route
// Public access
router.get('/', (req, res) => res.send('profile route'));

module.exports = router;
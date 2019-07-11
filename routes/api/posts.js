const express = require('express');
const router = express.Router();

// GET route api/post
// Post route
// Public access
router.get('/', (req, res) => res.send('Post route'));

module.exports = router;
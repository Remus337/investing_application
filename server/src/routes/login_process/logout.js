const express = require('express');
const router = express.Router();

// Assuming a stateless logout, this endpoint just provides a response.
router.post('/', (req, res) => {
    // If using sessions:
    // req.session.destroy();

    res.status(200).json({ message: 'Logged out successfully' });
});

module.exports = router;

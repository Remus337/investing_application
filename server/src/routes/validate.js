const express = require('express');
const db = require('../config/db');
require('dotenv').config();

const router = express.Router();

router.post('/', (req, res) => {
    const { email, validationKey } = req.body;

    db.query('SELECT * FROM users WHERE email = ?', [email], (err, results) => {
        if (err || results.length === 0) {
            return res.status(400).send('Invalid email or key');
        }

        const user = results[0];
        if (user.validation_key === validationKey) {
            db.query('UPDATE users SET is_validated = 1 WHERE email = ?', [email], (err) => {
                if (err) {
                    console.error(err);
                    return res.status(500).send('Error updating user validation');
                }
                res.status(200).send('Validation successful, you can now log in');
            });
        } else {
            res.status(400).send('Invalid validation key');
        }
    });
});

module.exports = router;

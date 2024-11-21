const express = require('express');
const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer');
const db = require('../config/db');
require('dotenv').config();

const router = express.Router();

router.post('/', (req, res) => {
    const { email, password } = req.body;

    db.query('SELECT * FROM users WHERE email = ?', [email], async (err, results) => {
        if (err || results.length === 0) {
            return res.status(400).send('Invalid credentials');
        }

        const user = results[0];
        const match = await bcrypt.compare(password, user.password);
        if (!match) {
            return res.status(400).send('Invalid credentials');
        }

        if (user.is_validated === 0) {
            // Send validation email
            const transporter = nodemailer.createTransport({
                service: 'gmail',
                auth: {
                    user: process.env.EMAIL_USER,
                    pass: process.env.EMAIL_PASS
                }
            });

            const mailOptions = {
                from: process.env.EMAIL_USER,
                to: email,
                subject: 'Validate your account',
                text: `Your validation key is: ${user.validation_key}`
            };

            transporter.sendMail(mailOptions, (error) => {
                if (error) {
                    console.error(error);
                    return res.status(500).send('Error sending validation email');
                }
                // Send response indicating user is not validated yet
                return res.status(200).json({ message: 'Account not validated', is_validated: false });
            });
        } else {
            // User is validated, send success response
            return res.status(200).json({ message: 'Login successful', is_validated: true });
        }
    });
});

module.exports = router;

const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const db = require('../../config/db');
require('dotenv').config();

const router = express.Router();

router.post('/', async (req, res) => {
    const { name, surname, nickname, email, password } = req.body;

    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const validationKey = jwt.sign({ email }, process.env.JWT_SECRET, { expiresIn: '1d' });

        db.query(
            'INSERT INTO users (name, surname, nickname, email, password, validation_key) VALUES (?, ?, ?, ?, ?, ?)',
            [name, surname, nickname, email, hashedPassword, validationKey],
            (err) => {
                if (err) {
                    console.error(err);
                    return res.status(500).send('Error saving user');
                }

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
                    subject: 'Please validate your email',
                    text: `Use this validation key: ${validationKey}`
                };

                transporter.sendMail(mailOptions, (error) => {
                    if (error) {
                        console.error(error);
                        return res.status(500).send('Error sending email');
                    }
                    res.status(201).send('User registered, please validate your email');
                });
            }
        );
    } catch (error) {
        console.error(error);
        res.status(500).send('Error registering user');
    }
});

module.exports = router;

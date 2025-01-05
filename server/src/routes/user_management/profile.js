const express = require('express');
const bcrypt = require('bcryptjs');
const db = require('../../config/db');
const router = express.Router();

// Fetch user profile
router.get('/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const [results] = await db.promise().query('SELECT id, name, surname, email, nickname, is_admin, is_superadmin FROM users WHERE id = ?', [id]);

        if (results.length === 0) {
            return res.status(404).send({ error: 'User not found' });
        }

        res.json(results[0]); // Send the user's profile details
    } catch (error) {
        console.error('Error fetching user profile:', error);
        res.status(500).send({ error: 'Failed to fetch user profile' });
    }
});

// Update user profile
router.put('/:id', async (req, res) => {
    const { id } = req.params;
    const { name, surname, email, nickname } = req.body;
    try {
        const [result] = await db.promise().query(
            'UPDATE users SET name = ?, surname = ?, email = ?, nickname = ? WHERE id = ?',
            [name, surname, email, nickname, id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).send('User not found or no changes were made.');
        }

        res.status(200).send('Profile updated successfully.');
    } catch (error) {
        console.error('Error updating profile:', error);
        res.status(500).send('Failed to update profile: ' + error);
    }
});

// Change password
router.put('/:id/password', async (req, res) => {
    const { id } = req.params; // Corrected parameter
    const { oldPassword, newPassword } = req.body;
    try {
        const [user] = await db.promise().query('SELECT password FROM users WHERE id = ?', [id]); // Use `id` instead of `userId`

        if (user.length === 0) {
            return res.status(404).send('User not found.');
        }

        const validPassword = await bcrypt.compare(oldPassword, user[0].password);

        if (!validPassword) {
            return res.status(400).send('Old password is incorrect.');
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);
        await db.promise().query('UPDATE users SET password = ? WHERE id = ?', [hashedPassword, id]); // Use `id` instead of `userId`
        res.status(200).send('Password updated successfully.');
    } catch (error) {
        console.error('Error changing password:', error);
        res.status(500).send('Failed to change password: ' + error);
    }
});

module.exports = router;

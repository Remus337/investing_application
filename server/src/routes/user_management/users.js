const express = require('express');
const db = require('../../config/db');
const router = express.Router();

router.get('/', async (req, res) => {
    try {
        const [users] = await db.promise().query('SELECT id, name, surname, email, nickname, is_admin FROM users');
        res.json(users);
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).send('Failed to fetch users.');
    }
});

router.get('/search', async (req, res) => {
    const { nickname } = req.query;

    try {
        const [users] = await db.promise().query(
            'SELECT id, name, surname, email, nickname FROM users WHERE nickname LIKE ?',
            [`%${nickname}%`]
        );
        res.json(users);
    } catch (error) {
        console.error('Error searching users:', error);
        res.status(500).send('Failed to search users.');
    }
});

router.put('/:id', async (req, res) => {
    const { id } = req.params;
    const { name, surname, email, nickname, is_admin } = req.body;

    try {
        // Fetch current user data
        const [currentData] = await db.promise().query(
            'SELECT name, surname, email, nickname, is_admin, is_superadmin FROM users WHERE id = ?',
            [id]
        );

        if (currentData.length === 0) {
            return res.status(404).send('User not found.');
        }

        if (currentData[0].is_superadmin === 1 && is_admin !== undefined) {
            return res
                .status(400)
                .send('Cannot change personal data for a superadmin.');
        }

        const updatedData = {
            name: name !== undefined ? name : currentData[0].name,
            surname: surname !== undefined ? surname : currentData[0].surname,
            email: email !== undefined ? email : currentData[0].email,
            nickname: nickname !== undefined ? nickname : currentData[0].nickname,
            is_admin: is_admin !== undefined ? is_admin : currentData[0].is_admin,
        };

        await db.promise().query(
            'UPDATE users SET name = ?, surname = ?, email = ?, nickname = ?, is_admin = ? WHERE id = ?',
            [updatedData.name, updatedData.surname, updatedData.email, updatedData.nickname, updatedData.is_admin, id]
        );

        res.status(200).send('User data updated successfully.');
    } catch (error) {
        res.status(500).send('Failed to update user data.');
    }
});

router.delete('/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const [currentData] = await db.promise().query( 'SELECT is_superadmin FROM users WHERE id = ?', [id]);

        if (currentData[0].is_superadmin === 1 && is_admin !== undefined) {
            return res
                .status(400)
                .send('Cannot change personal data for a superadmin.');
        }

        await db.promise().query('DELETE FROM users WHERE id = ?', [id]);
        res.status(200).send('User deleted successfully.');
    } catch (error) {
        res.status(500).send('Failed to delete user.');
    }
});


router.get('/:id/posts', async (req, res) => {
    const { id } = req.params;

    try {
        const [posts] = await db.promise().query(
            'SELECT p.id, p.title, p.content, p.created_at FROM posts p WHERE p.user_id = ?',
            [id]
        );
        res.json(posts);
    } catch (error) {
        console.error('Error fetching user posts:', error);
        res.status(500).send('Failed to fetch user posts.');
    }
});

router.delete('/:userId/posts', async (req, res) => {
    const { userId } = req.params;
    try {
        await db.promise().query('DELETE FROM posts WHERE user_id = ?', [userId]);
        res.status(200).send('All posts deleted successfully.');
    } catch (error) {
        console.error('Error deleting posts:', error);
        res.status(500).send('Failed to delete posts.');
    }
});


router.get('/:id/comments', async (req, res) => {
    const { id } = req.params;

    try {
        const [comments] = await db.promise().query(
            `SELECT c.id, c.comment, c.created_at, p.title AS post_title 
             FROM comments c 
             JOIN posts p ON c.post_id = p.id 
             WHERE c.user_id = ?`,
            [id]
        );
        res.json(comments);
    } catch (error) {
        console.error('Error fetching user comments:', error);
        res.status(500).send('Failed to fetch user comments.');
    }
});

router.delete('/:userId/comments', async (req, res) => {
    const { userId } = req.params;
    try {
        await db.promise().query('DELETE FROM comments WHERE user_id = ?', [userId]);
        res.status(200).send('All comments deleted successfully.');
    } catch (error) {
        console.error('Error deleting comments:', error);
        res.status(500).send('Failed to delete comments.');
    }
});

module.exports = router;

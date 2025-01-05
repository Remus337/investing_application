const express = require('express');
const db = require('../../config/db');

const router = express.Router();

// Add a new comment
router.post('/', (req, res) => {
    const { post_id, user_id, comment } = req.body;

    db.query(
        'INSERT INTO comments (post_id, user_id, comment) VALUES (?, ?, ?)',
        [post_id, user_id, comment],
        (err, results) => {
            if (err) {
                console.error('Error adding comment:', err);
                return res.status(500).send('Error adding comment');
            }

            // Fetch the nickname of the comment author
            db.query(
                'SELECT comments.*, users.nickname AS author_nickname FROM comments JOIN users ON comments.user_id = users.id WHERE comments.id = ?',
                [results.insertId],
                (err, commentData) => {
                    if (err) {
                        console.error('Error fetching comment nickname:', err);
                        return res.status(500).send('Error fetching comment');
                    }
                    res.status(201).json(commentData[0]);
                }
            );
        }
    );
});

// Delete a comment
router.delete('/:id', (req, res) => {
    const { id } = req.params;

    db.query('DELETE FROM comments WHERE id = ?', [id], (err, results) => {
        if (err) {
            console.error('Error deleting comment:', err);
            return res.status(500).send('Error deleting comment');
        }
        if (results.affectedRows === 0) {
            return res.status(404).send('Comment not found');
        }
        res.status(200).json({ message: 'Comment deleted' });
    });
});

// Edit a comment
router.put('/:id', (req, res) => {
    const { id } = req.params;
    const { comment } = req.body;

    db.query(
        'UPDATE comments SET comment = ? WHERE id = ?',
        [comment, id],
        (err, results) => {
            if (err) {
                console.error('Error updating comment:', err);
                return res.status(500).send('Error updating comment');
            }
            if (results.affectedRows === 0) {
                return res.status(404).send('Comment not found');
            }
            res.status(200).json({ message: 'Comment updated' });
        }
    );
});

// Get all comments for a post
router.get('/post/:post_id', (req, res) => {
    const { post_id } = req.params;

    db.query(
        `SELECT comments.*, users.nickname AS author_nickname 
         FROM comments 
         JOIN users ON comments.user_id = users.id 
         WHERE comments.post_id = ?`,
        [post_id],
        (err, results) => {
            if (err) {
                console.error('Error fetching comments:', err);
                return res.status(500).send('Error fetching comments');
            }
            res.status(200).json(results);
        }
    );
});

module.exports = router;

const express = require('express');
const db = require('../../config/db');

const router = express.Router();

// Add a new post
router.post('/', (req, res) => {
    const { user_id, title, content } = req.body;

    console.log('POST request received:', req.body); // Debug log

    db.query(
        'INSERT INTO posts (user_id, title, content) VALUES (?, ?, ?)',
        [user_id, title, content],
        (err, results) => {
            if (err) {
                console.error('Error adding post:', err);
                return res.status(500).send('Error adding post');
            }

            // Fetch the nickname of the post author
            db.query(
                'SELECT posts.*, users.nickname AS author_nickname FROM posts JOIN users ON posts.user_id = users.id WHERE posts.id = ?',
                [results.insertId],
                (err, postData) => {
                    if (err) {
                        console.error('Error fetching post nickname:', err);
                        return res.status(500).send('Error fetching post');
                    }
                    console.log('Post added:', postData[0]); // Debug log
                    res.status(201).json(postData[0]);
                }
            );
        }
    );
});

// Delete a post
router.delete('/:id', (req, res) => {
    const { id } = req.params;

    console.log('Attempting to delete post with id:', id); // Debugging log

    db.query('DELETE FROM posts WHERE id = ?', [id], (err, results) => {
        if (err) {
            console.error('Error deleting post:', err);
            return res.status(500).send('Error deleting post');
        }
        console.log('Results:', results); // Debugging log
        if (results.affectedRows === 0) {
            console.log('Post not found'); // Debugging log
            return res.status(404).send('Post not found');
        }
        res.status(200).json({ message: 'Post deleted' });
    });
});


// Edit a post
router.put('/:id', (req, res) => {
    const { id } = req.params;
    const { title, content } = req.body;

    db.query(
        'UPDATE posts SET title = ?, content = ? WHERE id = ?',
        [title, content, id],
        (err, results) => {
            if (err) {
                console.error('Error updating post:', err);
                return res.status(500).send('Error updating post');
            }
            if (results.affectedRows === 0) {
                return res.status(404).send('Post not found');
            }
            res.status(200).json({ message: 'Post updated' });
        }
    );
});

// Get all posts
router.get('/', (req, res) => {
    db.query(
        `SELECT posts.*, users.nickname AS author_nickname 
         FROM posts 
         JOIN users ON posts.user_id = users.id`,
        (err, results) => {
            if (err) {
                console.error('Error fetching posts:', err);
                return res.status(500).send('Error fetching posts');
            }
            res.status(200).json(results);
        }
    );
});

module.exports = router;

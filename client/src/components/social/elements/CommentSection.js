import React, { useState, useEffect } from 'react';
import axios from 'axios';

function CommentsSection({ postId, postAuthorId }) {
    const userId = Number(localStorage.getItem('user_id'));
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchComments();
    }, []);

    // Fetch comments for a specific post
    const fetchComments = async () => {
        setLoading(true);
        try {
            const response = await axios.get(`http://localhost:3001/comments/post/${postId}`);
            setComments(response.data);
        } catch (error) {
            console.error('Error fetching comments:', error);
        } finally {
            setLoading(false);
        }
    };

    // Add a new comment
    const handleAddComment = async () => {
        try {
            const response = await axios.post('http://localhost:3001/comments', {
                user_id: userId,
                post_id: postId,
                comment: newComment,
            });
    
            // Add the full comment data (including author_nickname) to the state
            setComments([...comments, response.data]);
            setNewComment('');
        } catch (error) {
            console.error('Error adding comment:', error);
        }
    };    

    // Delete a comment
    const handleDeleteComment = async (commentId) => {
        try {
            await axios.delete(`http://localhost:3001/comments/${commentId}`);
            setComments(comments.filter((comment) => comment.id !== commentId));
        } catch (error) {
            console.error('Error deleting comment:', error);
        }
    };

    return (
        <div className="comments-section">
            <h4>Comments</h4>
            {loading ? (
                <p>Loading comments...</p>
            ) : (
                <div>
                    {comments.map((comment) => (
                        <div key={comment.id} className="comment">
                            <p>{comment.comment}</p>
                            <p>By: {comment.author_nickname}</p> {/* Display comment author nickname */}
                            {(comment.user_id === userId || postAuthorId === userId) && (
                                <button
                                    className="btn btn-danger btn-sm"
                                    onClick={() => handleDeleteComment(comment.id)}
                                >
                                    Delete
                                </button>
                            )}
                        </div>
                    ))}
                </div>
            )}
            <input
                type="text"
                className="form-control my-2"
                placeholder="Add a comment"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
            />
            <button className="btn btn-primary" onClick={handleAddComment}>
                Add Comment
            </button>
        </div>
    );
}

export default CommentsSection;

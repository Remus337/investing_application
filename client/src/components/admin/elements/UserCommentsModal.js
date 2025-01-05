import React, { useEffect, useState } from 'react';
import axios from 'axios';

function UserCommentsModal({ userId, onClose }) {
    const [comments, setComments] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchComments();
    }, []);

    const fetchComments = async () => {
        setLoading(true);
        try {
            const response = await axios.get(`http://localhost:3001/users/${userId}/comments`);
            setComments(response.data);
        } catch (error) {
            console.error('Error fetching user comments:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteComment = async (commentId) => {
        try {
            await axios.delete(`http://localhost:3001/comments/${commentId}`);
            setComments(comments.filter((comment) => comment.id !== commentId));
        } catch (error) {
            console.error('Error deleting comment:', error);
        }
    };

    const handleDeleteAllComments = async () => {
        try {
            await axios.delete(`http://localhost:3001/users/${userId}/comments`);
            setComments([]);
        } catch (error) {
            console.error('Error deleting all comments:', error);
        }
    };

    return (
        <div
            className="modal fade show"
            style={{ display: 'block', backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
        >
            <div className="modal-dialog modal-lg">
                <div className="modal-content">
                    <div className="modal-header">
                        <h5 className="modal-title">Comments by User {userId}</h5>
                        <button type="button" className="btn-close" onClick={onClose}></button>
                    </div>
                    <div className="modal-body">
                        {loading ? (
                            <p>Loading comments...</p>
                        ) : comments.length > 0 ? (
                            <ul className="list-group">
                                {comments.map((comment) => (
                                    <li key={comment.id} className="list-group-item">
                                        <strong>Post:</strong> {comment.post_title}
                                        <p>{comment.comment}</p>
                                        <button
                                            className="btn btn-danger btn-sm"
                                            onClick={() => handleDeleteComment(comment.id)}
                                        >
                                            Delete
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p>No comments found.</p>
                        )}
                    </div>
                    <div className="modal-footer">
                        <button className="btn btn-danger" onClick={handleDeleteAllComments}>
                            Delete All Comments
                        </button>
                        <button className="btn btn-secondary" onClick={onClose}>
                            Close
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default UserCommentsModal;

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import CommentsSection from './CommentSection';

function PostModal({ post, onClose, onDeletePost, onEditPost }) {
    const userId = Number(sessionStorage.getItem('user_id'));
    const [postDetails, setPostDetails] = useState(post);
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState('');
    const [loading, setLoading] = useState(false);
    const [rewriting, setRewriting] = useState(false);

    useEffect(() => {
        if (post) {
            fetchPostDetails();
            fetchComments();
        }
    }, [post]);

    const fetchPostDetails = async () => {
        setLoading(true);
        try {
            const response = await axios.get(`http://localhost:3001/posts/${post.id}`);
            setPostDetails(response.data);
        } catch (error) {
            console.error('Error fetching post details:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchComments = async () => {
        setLoading(true);
        try {
            const response = await axios.get(`http://localhost:3001/comments/post/${post.id}`);
            setComments(response.data);
        } catch (error) {
            console.error('Error fetching comments:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAddComment = async () => {
        try {
            const response = await axios.post('http://localhost:3001/comments', {
                user_id: userId,
                post_id: post.id,
                comment: newComment,
            });
            setComments([...comments, response.data]);
            setNewComment('');
        } catch (error) {
            console.error('Error adding comment:', error);
        }
    };

    const handleRewriteComment = async () => {
        if (!newComment.trim()) {
            alert('Comment is empty. Please write something before rewriting.');
            return;
        }

        setRewriting(true);
        try {
            const response = await axios.post('http://localhost:3001/investbot/rewrite-comment', {
                comment: newComment,
            });
            setNewComment(response.data.rewrittenComment);
        } catch (error) {
            console.error('Error rewriting comment:', error);
            alert('Failed to rewrite comment. Please try again.');
        } finally {
            setRewriting(false);
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

    const handleDelete = () => {
        if (onDeletePost) {
            onDeletePost(post.id);
            onClose();
        }
    };

    const handleEdit = () => {
        if (onEditPost) {
            onEditPost(post);
            onClose();
        }
    };

    if (!postDetails) return null;

    return (
        <div
            className="modal fade show"
            tabIndex="-1"
            style={{ display: 'block', backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
        >
            <div className="modal-dialog modal-lg">
                <div className="modal-content">
                    <div className="modal-header">
                        <h5 className="modal-title">{postDetails.title}</h5>
                        <button
                            type="button"
                            className="btn-close"
                            onClick={onClose}
                        ></button>
                    </div>
                    <div className="modal-body">
                        <p className="text-muted fs-6 fw-light">By: {postDetails.author_nickname}</p>
                        <p style={{ wordWrap: 'break-word', whiteSpace: 'pre-wrap' }}>{postDetails.content}</p>
                        <hr />
                        <CommentsSection
                            comments={comments}
                            onDeleteComment={handleDeleteComment}
                            userId={userId}
                            postAuthorId={postDetails.user_id}
                        />
                    </div>
                    <div className="sticky-bottom bg-light pt-3 rounded-bottom">
                        <div className="add-comment-section mb-3 px-2">
                            <div className="input-group">
                                <input
                                    type="text"
                                    className="form-control"
                                    placeholder="Write your comment..."
                                    value={newComment}
                                    onChange={(e) => setNewComment(e.target.value)}
                                />
                                <button
                                    className="btn btn-primary"
                                    onClick={handleAddComment}
                                    disabled={!newComment.trim() || rewriting}
                                >
                                    Add
                                </button>
                                <button
                                    className="btn btn-success"
                                    onClick={handleRewriteComment}
                                    disabled={!newComment.trim() || rewriting}
                                >
                                    {rewriting ? 'Rewriting...' : 'AI Rewrite'}
                                </button>
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button
                                type="button"
                                className="btn btn-secondary"
                                onClick={onClose}
                            >
                                Close
                            </button>
                            {postDetails.user_id === userId && (
                                <>
                                    <button
                                        type="button"
                                        className="btn btn-warning"
                                        onClick={handleEdit}
                                    >
                                        Edit
                                    </button>
                                    <button
                                        type="button"
                                        className="btn btn-danger"
                                        onClick={handleDelete}
                                    >
                                        Delete
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default PostModal;

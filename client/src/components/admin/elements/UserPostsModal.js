import React, { useEffect, useState } from 'react';
import axios from 'axios';

function UserPostsModal({ userId, onClose }) {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchPosts();
    }, []);

    const fetchPosts = async () => {
        setLoading(true);
        try {
            const response = await axios.get(`http://localhost:3001/users/${userId}/posts`);
            setPosts(response.data);
        } catch (error) {
            console.error('Error fetching user posts:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDeletePost = async (postId) => {
        try {
            await axios.delete(`http://localhost:3001/posts/${postId}`);
            setPosts(posts.filter((post) => post.id !== postId));
        } catch (error) {
            console.error('Error deleting post:', error);
        }
    };

    const handleDeleteAllPosts = async () => {
        try {
            await axios.delete(`http://localhost:3001/users/${userId}/posts`);
            setPosts([]);
        } catch (error) {
            console.error('Error deleting all posts:', error);
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
                        <h5 className="modal-title">Posts by User {userId}</h5>
                        <button type="button" className="btn-close" onClick={onClose}></button>
                    </div>
                    <div className="modal-body">
                        {loading ? (
                            <p>Loading posts...</p>
                        ) : posts.length > 0 ? (
                            <ul className="list-group">
                                {posts.map((post) => (
                                    <li key={post.id} className="list-group-item">
                                        <h6>{post.title}</h6>
                                        <p>{post.content}</p>
                                        <button
                                            className="btn btn-danger btn-sm"
                                            onClick={() => handleDeletePost(post.id)}
                                        >
                                            Delete
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p>No posts found.</p>
                        )}
                    </div>
                    <div className="modal-footer">
                        <button className="btn btn-danger" onClick={handleDeleteAllPosts}>
                            Delete All Posts
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

export default UserPostsModal;

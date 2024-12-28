import React, { useState, useEffect } from 'react';
import axios from 'axios';
import CommentsSection from './CommentSection';
import AddEditPostModal from './AddEditPostModal';

function Social() {
    const userId = Number(localStorage.getItem('user_id')); // Convert to a number
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedPost, setSelectedPost] = useState(null); // Post being edited
    const [showModal, setShowModal] = useState(false);

    useEffect(() => {
        fetchPosts();
    }, []);

    // Fetch posts from the backend
    const fetchPosts = async () => {
        setLoading(true);
        try {
            const response = await axios.get('http://localhost:3001/posts');
            console.log(response.data);
            setPosts(response.data);
        } catch (error) {
            console.error('Error fetching posts:', error);
        } finally {
            setLoading(false);
        }
    };

    // Handle adding a new post
    const handlePostAdded = (newPost) => {
        setPosts((prevPosts) => [...prevPosts, newPost]); // Only update the state; do not call the API here
    };    

    // Handle editing an existing post
    const handlePostEdited = (updatedPost) => {
        setPosts(posts.map((post) => (post.id === updatedPost.id ? updatedPost : post)));
    };

    // Handle deleting a post
    const handleDeletePost = async (postId) => {
        try {
            console.log('Deleting post with id:', postId); // Debugging log
            await axios.delete(`http://localhost:3001/posts/${postId}`);
            setPosts(posts.filter((post) => post.id !== postId));
        } catch (error) {
            console.error('Error deleting post:', error);
        }
    };

    return (
        <div className="social-page">
            <h2>Social Page</h2>

            {loading ? (
                <p>Loading posts...</p>
            ) : (
                <div>
                    {posts.map((post) => (
                        <div key={post.id} className="post">
                            <h3>{post.title}</h3>
                            <p>By: {post.author_nickname}</p> {/* Display post author nickname */}
                            <p>{post.content}</p>
                            {post.user_id === userId ? (
                                <>
                                    <button
                                        className="btn btn-danger btn-sm"
                                        onClick={() => handleDeletePost(post.id)}
                                    >
                                        Delete
                                    </button>
                                    <button
                                        className="btn btn-warning btn-sm"
                                        onClick={() => {
                                            setSelectedPost(post);
                                            setShowModal(true);
                                        }}
                                    >
                                        Edit
                                    </button>
                                </>
                            ) : null}
                            <CommentsSection postId={post.id} postAuthorId={post.user_id} />
                        </div>
                    ))}
                </div>
            )}

            {/* Floating Button for Adding a New Post */}
            <button
                className="btn btn-primary btn-lg rounded-circle"
                style={{
                    position: 'fixed',
                    bottom: '20px',
                    right: '20px',
                    width: '60px',
                    height: '60px',
                }}
                onClick={() => {
                    setSelectedPost(null); // No post selected, means adding
                    setShowModal(true);
                }}
            >
                +
            </button>

            {/* Add/Edit Modal */}
            {showModal && (
                <AddEditPostModal
                    userId={userId}
                    post={selectedPost}
                    onPostAdded={handlePostAdded}
                    onPostEdited={handlePostEdited}
                    onClose={() => setShowModal(false)}
                />
            )}
        </div>
    );
}

export default Social;

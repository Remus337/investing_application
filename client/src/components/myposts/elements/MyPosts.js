import React, { useState, useEffect } from 'react';
import axios from 'axios';
import AddEditPostModal from '../../social/elements/AddEditPostModal';
import PostModal from '../../social/elements/PostModal';

function MyPosts() {
    const userId = Number(sessionStorage.getItem('user_id')); // Convert to a number
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedPost, setSelectedPost] = useState(null); // Post to view in modal
    const [showPostModal, setShowPostModal] = useState(false); // Show post modal
    const [searchQuery, setSearchQuery] = useState('');
    const [sortOrder, setSortOrder] = useState('newest'); // Sort order: 'newest' or 'oldest'
    const [showAddEditModal, setShowAddEditModal] = useState(false); // Show edit modal

    useEffect(() => {
        fetchMyPosts();
    }, []);

    const fetchMyPosts = async () => {
        setLoading(true);
        try {
            const response = await axios.get(`http://localhost:3001/posts?user_id=${userId}`);
            setPosts(response.data);
        } catch (error) {
            console.error('Error fetching my posts:', error);
        } finally {
            setLoading(false);
        }
    };

    const handlePostAdded = (newPost) => {
        setPosts((prevPosts) => [...prevPosts, newPost]);
    };

    const handlePostEdited = (updatedPost) => {
        setPosts(posts.map((post) => (post.id === updatedPost.id ? updatedPost : post)));
    };

    const handleDeletePost = async (postId) => {
        try {
            await axios.delete(`http://localhost:3001/posts/${postId}`);
            setPosts(posts.filter((post) => post.id !== postId));
        } catch (error) {
            console.error('Error deleting post:', error);
        }
    };

    const handleOpenPostModal = (post) => {
        setSelectedPost(post);
        setShowPostModal(true);
    };

    const filteredPosts = posts.filter(
        (post) =>
            post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            post.content.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const sortedPosts = [...filteredPosts].sort((a, b) => {
        if (sortOrder === 'newest') {
            return new Date(b.created_at) - new Date(a.created_at);
        }
        return new Date(a.created_at) - new Date(b.created_at);
    });

    return (
        <div className="my-posts-page">
            <div className="d-flex justify-content-between align-items-center mb-3 pt-1">
                <div className="sort-dropdown">
                    <select
                        id="sortOrder"
                        className="form-select form-select-sm"
                        value={sortOrder}
                        onChange={(e) => setSortOrder(e.target.value)}
                    >
                        <option value="newest">Newest</option>
                        <option value="oldest">Oldest</option>
                    </select>
                </div>

                <div className="search-bar">
                    <input
                        type="text"
                        className="form-control form-control-sm"
                        placeholder="Search your posts..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
            </div>

            {loading ? (
                <p>Loading your posts...</p>
            ) : (
                <div>
                    {sortedPosts.map((post) => (
                        <div
                            key={post.id}
                            className="post card shadow mb-3"
                            onClick={() => handleOpenPostModal(post)}
                            style={{ cursor: 'pointer' }}
                        >
                            <div className="card-body">
                                <h3 className="card-title">{post.title}</h3>
                                <p className="card-subtitle mb-2 text-muted fs-6 fw-light">By: {post.author_nickname}</p>
                                <p className="card-text">
                                    {post.content.length > 300
                                        ? `${post.content.slice(0, 300)}... Read More`
                                        : post.content}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            )}

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
                    setSelectedPost(null);
                    setShowAddEditModal(true);
                }}
            >
                +
            </button>

            {showPostModal && selectedPost && (
                <PostModal
                    post={selectedPost}
                    onClose={() => setShowPostModal(false)}
                    onDeletePost={handleDeletePost}
                    onEditPost={(post) => {
                        setSelectedPost(post);
                        setShowAddEditModal(true);
                    }}
                />
            )}

            {showAddEditModal && (
                <AddEditPostModal
                    userId={userId}
                    post={selectedPost}
                    onPostAdded={handlePostAdded}
                    onPostEdited={handlePostEdited}
                    onClose={() => setShowAddEditModal(false)}
                />
            )}
        </div>
    );
}

export default MyPosts;

import React, { useState, useEffect } from 'react';
import axios from 'axios';

function AddEditPostModal({ userId, post, onPostAdded, onPostEdited, onClose }) {
    const isEditing = !!post;
    const [postDetails, setPostDetails] = useState({
        user_id: userId || '',
        title: '',
        content: '',
    });
    const [loading, setLoading] = useState(false);
    const [generating, setGenerating] = useState(false);

    useEffect(() => {
        if (post) {
            setPostDetails({
                user_id: post.user_id,
                title: post.title,
                content: post.content,
            });
        }
    }, [post]);

    const handleSubmit = async () => {
        setLoading(true);
        try {
            if (isEditing) {
                await axios.put(`http://localhost:3001/posts/${post.id}`, postDetails);
                onPostEdited({ ...post, ...postDetails });
            } else {
                const response = await axios.post('http://localhost:3001/posts', postDetails);
                onPostAdded(response.data);
            }
            onClose();
        } catch (error) {
            console.error('Error saving post:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleGenerateContent = async () => {
        if (!postDetails.content.trim()) {
            alert('Content is required to rewrite.');
            return;
        }

        setGenerating(true);
        try {
            const response = await axios.post('http://localhost:3001/investbot/generate-content', {
                title: postDetails.title,
                content: postDetails.content,
            });
            setPostDetails({ ...postDetails, content: response.data.content });
        } catch (error) {
            console.error('Error generating content:', error);
            alert('Failed to rewrite content.');
        } finally {
            setGenerating(false);
        }
    };

    return (
        <div
            className="modal fade show"
            tabIndex="-1"
            style={{ display: 'block', backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
        >
            <div className="modal-dialog">
                <div className="modal-content">
                    <div className="modal-header">
                        <h5 className="modal-title">{isEditing ? 'Edit Post' : 'Add New Post'}</h5>
                        <button type="button" className="btn-close" onClick={onClose}></button>
                    </div>
                    <div className="modal-body">
                        <input
                            type="text"
                            className="form-control mb-3"
                            placeholder="Title"
                            value={postDetails.title}
                            onChange={(e) => setPostDetails({ ...postDetails, title: e.target.value })}
                        />
                        <textarea
                            className="form-control"
                            placeholder="Content"
                            value={postDetails.content}
                            onChange={(e) => setPostDetails({ ...postDetails, content: e.target.value })}
                        ></textarea>
                        <button
                            type="button"
                            className="btn btn-success mt-2"
                            onClick={handleGenerateContent}
                            disabled={generating}
                        >
                            {generating ? 'Generating...' : 'AI Rewrite'}
                        </button>
                    </div>
                    <div className="modal-footer">
                        <button type="button" className="btn btn-secondary" onClick={onClose}>
                            Cancel
                        </button>
                        <button
                            type="button"
                            className="btn btn-primary"
                            onClick={handleSubmit}
                            disabled={loading}
                        >
                            {loading ? 'Saving...' : isEditing ? 'Save Changes' : 'Add Post'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default AddEditPostModal;

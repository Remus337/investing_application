import React from 'react';

function CommentsSection({ comments, onDeleteComment, userId, postAuthorId }) {
    return (
        <div className="comments-section">
            <h4>Comments</h4>
            {comments.length === 0 ? (
                <p>No comments yet.</p>
            ) : (
                <div>
                    {comments.map((comment) => (
                        <div key={comment.id} className="comment">
                            <p>{comment.comment}</p>
                            <p>By: {comment.author_nickname}</p>
                            {(comment.user_id === userId || postAuthorId === userId) && (
                                <button
                                    className="btn btn-danger btn-sm"
                                    onClick={() => onDeleteComment(comment.id)}
                                >
                                    Delete
                                </button>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default CommentsSection;

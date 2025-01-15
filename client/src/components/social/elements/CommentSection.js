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
                        <div key={comment.id} className="comment mb-2 p-2 shadow rounded">
                            <p className="text-muted fs-6 fw-light">{comment.author_nickname}: </p>
                            <p style={{ wordWrap: 'break-word', whiteSpace: 'pre-wrap' }}>{comment.comment}</p>
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

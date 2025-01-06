import React, { useState } from 'react';
import axios from 'axios';

function InvestBot() {
    const [question, setQuestion] = useState('');
    const [response, setResponse] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleAsk = async () => {
        if (!question.trim()) {
            alert('Please enter a question.');
            return;
        }

        setLoading(true);
        setError('');
        setResponse('');

        try {
            const res = await axios.post('http://localhost:3001/investbot', { question });
            setResponse(res.data.response);
        } catch (err) {
            console.error('Error fetching response:', err);
            setError('Failed to fetch response from InvestBot.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="invest-bot">
            <h2>InvestBot - Your Investment Assistant</h2>
            <div className="mb-3">
                <label htmlFor="questionInput" className="form-label">Ask a question about investing:</label>
                <textarea
                    id="questionInput"
                    className="form-control"
                    rows="3"
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                    placeholder="e.g., What is the best strategy for investing in stocks?"
                />
            </div>
            <button className="btn btn-primary mb-3" onClick={handleAsk} disabled={loading}>
                {loading ? 'Thinking...' : 'Ask InvestBot'}
            </button>
            {response && (
                <div className="alert alert-success">
                    <strong>InvestBot:</strong> {response}
                </div>
            )}
            {error && (
                <div className="alert alert-danger">
                    <strong>Error:</strong> {error}
                </div>
            )}
        </div>
    );
}

export default InvestBot;

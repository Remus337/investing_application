// Updated Validate Component
import React, { useState } from 'react';
import axios from 'axios';

function Validate({ onSuccess, onLogout }) {
  const [formData, setFormData] = useState({ email: '', validationKey: '' });
  const [message, setMessage] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:3001/validate', formData);
      if (response.status === 200) {
        setMessage('Validation successful. Redirecting to charts...');
        setTimeout(() => {
          onSuccess(); // Redirect to Charts page after successful validation
        }, 1500);
      }
    } catch (error) {
      setMessage('Validation failed: ' + (error.response?.data || error.message));
    }
  };

  return (
    <div>
      <h2>Validate Account</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="email"
          name="email"
          placeholder="Email"
          value={formData.email}
          onChange={handleChange}
          required
        />
        <input
          type="text"
          name="validationKey"
          placeholder="Validation Key"
          value={formData.validationKey}
          onChange={handleChange}
          required
        />
        <button type="submit">Validate</button>
      </form>
      <button onClick={onLogout}>Logout</button>
      {message && <p>{message}</p>}
    </div>
  );
}

export default Validate;

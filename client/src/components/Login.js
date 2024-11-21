// Updated Login Component
import React, { useState } from 'react';
import axios from 'axios';

function Login({ setIsAuthenticated, onSuccess, onValidationRequired }) {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [message, setMessage] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:3001/login', formData);
      
      if (response.data.is_validated) {
        // User is successfully logged in and validated
        setIsAuthenticated(true);
        onSuccess(); // Navigate to the Charts page
      } else {
        // User is logged in but not validated
        setIsAuthenticated(true);
        onValidationRequired(); // Navigate to the Validate page
      }
    } catch (error) {
      setMessage('Login failed: ' + (error.response?.data || error.message));
    }
  };

  return (
    <div>
      <h2>Login</h2>
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
          type="password"
          name="password"
          placeholder="Password"
          value={formData.password}
          onChange={handleChange}
          required
        />
        <button type="submit">Login</button>
      </form>
      {message && <p>{message}</p>}
    </div>
  );
}

export default Login;

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

function Login({ setIsAuthenticated, onSuccess }) {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:3001/login', formData);

      if (response.data.is_validated) {
        localStorage.setItem('nickname', response.data.nickname); // Save to localStorage
        localStorage.setItem('user_id', response.data.user_id); // Save to localStorage
        setIsAuthenticated(true);
        onSuccess(); // Navigate to Charts page
      } else {
        setIsAuthenticated(false);
        navigate('/validate', { state: { email: formData.email } }); // Redirect with email
      }
    } catch (error) {
      setMessage('Login failed: ' + (error.response?.data || error.message));
    }
  };

  return (
    <div>
      <nav className="bg-dark text-white">
        <ul>
          <li>
            <Link to="/register">
              <button className="btn btn-primary">Register</button>
            </Link>
          </li>
        </ul>
      </nav>
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

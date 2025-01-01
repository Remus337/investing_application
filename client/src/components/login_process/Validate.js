import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import axios from 'axios';

function Validate({ onSuccess }) {
  const location = useLocation();
  const [formData, setFormData] = useState({
    email: location.state?.email || '',
    validationKey: '',
  });
  const [message, setMessage] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:3001/validate', formData);
      if (response.status === 200) {
        setMessage('Validation successful. Redirecting to login...');
        setTimeout(() => {
          onSuccess();
        }, 1500);
      }
    } catch (error) {
      setMessage('Validation failed: ' + (error.response?.data || error.message));
    }
  };

  return (
    <div>
      <nav className="bg-dark text-white">
        <ul>
          <>
            <li>
              <Link to="/login">
                <button className="btn btn-primary">Login</button>
              </Link>
            </li>
            <li>
              <Link to="/register">
                <button className="btn btn-primary">Register</button>
              </Link>
            </li>
          </>
        </ul>
      </nav>
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
      {message && <p>{message}</p>}
    </div>
  );
}

export default Validate;

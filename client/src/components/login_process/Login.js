import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { use } from 'react';

function Login({ setIsAuthenticated, setIsValidated, onSuccess, setUserId }) {
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
        sessionStorage.setItem('user_id', response.data.user_id); // Save to sessionStorage
        setIsAuthenticated(true);
        setIsValidated(true);
        setUserId(response.data.user_id);
        onSuccess(); // Navigate to Charts page
      } else {
        setIsAuthenticated(false);
        setIsValidated(false);
        navigate('/validate', { state: { email: formData.email } }); // Redirect with email
      }
    } catch (error) {
      setMessage('Login failed: ' + (error.response?.data || error.message));
    }
  };

  return (
    <div className='vh-100 vw-100 bg-dark'>
      <div className='container text-center h-100'>
        <div className='mt-5 rounded bg-dark bg-gradient shadow p-5 row h-75 mx-3 justify-content-center align-items-center'>
          <div className="col-xl-3 col-md-3 col-12">
            <img src="../../logo.svg" alt="Logo" />
          </div>
          <div className="col-xl-9 col-md-9 col-12 text-light px-5">
            <h5 className='mt-5'>Login</h5>
            <form onSubmit={handleSubmit}>
              <div className='form-outline mb-2'>
                <input
                  type="email"
                  name="email"
                  className='form-control mb-2'
                  placeholder="Email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className='form-outline mb-2'>
                <input
                  type="password"
                  name="password"
                  className='form-control mt-2 mb-2'
                  placeholder="Password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
              </div>
              <button type="submit" className='btn btn-light'>Login</button>
            </form>
            <p>Don't have an account? <Link to="/register">Register</Link></p>
            {message && <p>{message}</p>}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;

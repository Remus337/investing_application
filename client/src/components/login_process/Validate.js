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
    <div className='vh-100 vw-100 bg-dark'>
      <div className='container text-center h-100'>
        <div className='mt-5 rounded bg-dark bg-gradient shadow p-5 row h-75 mx-3 justify-content-center align-items-center'>
          <div className="col-xl-3 col-md-3 col-12">
            <img src="../../logo.svg" alt="Logo" />
          </div>
          <div className="col-xl-9 col-md-9 col-12 text-light px-5">
            <h5 className='mt-5'>Validate your account</h5>
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
                  type="text"
                  name="validationKey"
                  className='form-control mb-2'
                  placeholder="Validation Key"
                  value={formData.validationKey}
                  onChange={handleChange}
                  required
                />
              </div>
              <button type="submit" className='btn btn-light'>Validate</button>
            </form>
            <p>Already validated? <Link to="/login">Login</Link></p>
            {message && <p>{message}</p>}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Validate;

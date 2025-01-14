import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

function Register() {
  const [formData, setFormData] = useState({
    name: '',
    surname: '',
    nickname: '',
    email: '',
    password: ''
  });
  const [message, setMessage] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:3001/register', formData);
      setMessage(response.data);
    } catch (error) {
      setMessage('Registration failed: ' + error.response.data);
    }
  };

  return (
    <div className='vh-100 vw-100 bg-dark'>
      <div className='container text-center h-100'>
        <div className='mt-5 rounded bg-dark bg-gradient shadow p-5 row mx-3 justify-content-center align-items-center'>
          <div className="col-xl-3 col-md-3 col-12">
            <img src="../../logo.svg" alt="Logo" />
          </div>
          <div className="col-xl-9 col-md-9 col-12 text-light px-5">
            <h5 className='mt-5'>Register</h5>
            <form onSubmit={handleSubmit}>
              <div className='form-outline mb-2'>
                <input type="text" name="name" className='form-control mt-2 mb-2' placeholder="Name" value={formData.name} onChange={handleChange} required />
              </div>
              <div className='form-outline mb-2'>
                <input type="text" name="surname" className='form-control mt-2 mb-2' placeholder="Surname" value={formData.surname} onChange={handleChange} required />
              </div>
              <div className='form-outline mb-2'>
                <input type="text" name="nickname" className='form-control mt-2 mb-2' placeholder="Nickname" value={formData.nickname} onChange={handleChange} required />
              </div>
              <div className='form-outline mb-2'>
                <input type="email" name="email" className='form-control mt-2 mb-2' placeholder="Email" value={formData.email} onChange={handleChange} required />
              </div>
              <div className='form-outline mb-2'>
                <input type="password" name="password" className='form-control mt-2 mb-2' placeholder="Password" value={formData.password} onChange={handleChange} required />
              </div>
              <button type="submit" className='btn btn-light'>Register</button>
            </form>
            <p>Already have an account? <Link to="/login">Login</Link></p>
            {message && <p>{message}</p>}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Register;
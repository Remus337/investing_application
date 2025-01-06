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
    <div>
      <nav className='bg-dark text-white'>
        <ul>
            <>
              <li><Link to="/login"><button className='btn btn-primary'>Login</button></Link></li>
            </>
        </ul>
      </nav>
      <h2>Register</h2>
      <form onSubmit={handleSubmit}>
        <input type="text" name="name" placeholder="Name" value={formData.name} onChange={handleChange} required />
        <input type="text" name="surname" placeholder="Surname" value={formData.surname} onChange={handleChange} required />
        <input type="text" name="nickname" placeholder="Nickname" value={formData.nickname} onChange={handleChange} required />
        <input type="email" name="email" placeholder="Email" value={formData.email} onChange={handleChange} required />
        <input type="password" name="password" placeholder="Password" value={formData.password} onChange={handleChange} required />
        <button type="submit">Register</button>
      </form>
      {message && <p>{message}</p>}
    </div>
  );
}

export default Register;
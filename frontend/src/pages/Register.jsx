// frontend/src/pages/Register.jsx

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Auth.css';

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      // --- URL FIXED ---
      const { data } = await axios.post('/api/auth/register', {
        name,
        email,
        phone,
        password,
      });

      alert('Registration Success');
      localStorage.setItem('userInfo', JSON.stringify(data));
      navigate('/dashboard');

    } catch (err) {
      if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else {
        setError(`Registration Failed: ${err.message}`);
      }
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-form">
        <h2>Users Registration</h2>
        {error && <p className="auth-error">{error}</p>}
        <form onSubmit={handleSubmit}>
          <div className="form-group"><label>Name</label><input type="text" value={name} onChange={(e) => setName(e.target.value)} required /></div>
          <div className="form-group"><label>Email</label><input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required /></div>
          <div className="form-group"><label>Phone</label><input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} required /></div>
          <div className="form-group"><label>Password</label><input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required /></div>
          <button type="submit" className="auth-button">SUBMIT</button>
        </form>
        <div className="auth-links-container" style={{justifyContent: 'center'}}>
          <Link to="/login" className="auth-link">Already a user? Login</Link>
        </div>
      </div>
    </div>
  );
};

export default Register;
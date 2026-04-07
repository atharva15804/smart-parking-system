// frontend/src/pages/Login.jsx

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Auth.css'; 

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      // --- URL FIXED ---
      const { data } = await axios.post('/api/auth/login', {
        email,
        password,
      });

      localStorage.setItem('userInfo', JSON.stringify(data));
      alert('Login Success');

      if (data.role === 'admin') {
        navigate('/admin');
      } else if (data.role === 'checker') {
        navigate('/checker');
      } else {
        navigate('/dashboard');
      }

    } catch (err) {
      if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else {
        setError(`Login Failed: ${err.message}`);
      }
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-form">
        <h2>Users Login</h2>
        {error && <p className="auth-error">{error}</p>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="auth-button">
            SUBMIT
          </button>
        </form>
        <div className="auth-links-container">
          <Link to="/register" className="auth-link">NEW USER REGISTRATION</Link>
          <Link to="/forgot-password" className="auth-link">Forgot Password?</Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
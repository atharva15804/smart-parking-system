// frontend/src/pages/ForgotPassword.jsx

import React, { useState } from 'react';
import axios from 'axios';
import './Auth.css'; 

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    try {
      // --- URL FIXED ---
      const { data } = await axios.post('/api/auth/forgot-password', { email });
      setMessage(data.message);
    } catch (err) {
      setError(err.response?.data?.message || 'Error sending email');
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-form">
        <h2>Forgot Password</h2>
        <p style={{color: '#555', fontSize: '0.9rem'}}>Enter your email and we'll send you a reset link.</p>
        
        {message && <div className="profile-message success">{message}</div>}
        {error && <div className="profile-message error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group"><label>Email</label><input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required /></div>
          <button type="submit" className="auth-button">
            Send Reset Link
          </button>
        </form>
      </div>
    </div>
  );
};

export default ForgotPassword;
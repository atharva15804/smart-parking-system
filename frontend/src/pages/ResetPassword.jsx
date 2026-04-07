// frontend/src/pages/ResetPassword.jsx

import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Auth.css'; 

const ResetPassword = () => {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const { token } = useParams(); 
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    try {
      // --- URL FIXED ---
      const { data } = await axios.post(
        `/api/auth/reset-password/${token}`, 
        { newPassword }
      );
      setMessage(data.message);
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Error resetting password');
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-form">
        <h2>Set New Password</h2>
        
        {message && <div className="profile-message success">{message}</div>}
        {error && <div className="profile-message error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group"><label>New Password</label><input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required /></div>
          <div className="form-group"><label>Confirm New Password</label><input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required /></div>
          <button type="submit" className="auth-button">
            Reset Password
          </button>
        </form>
      </div>
    </div>
  );
};

export default ResetPassword;
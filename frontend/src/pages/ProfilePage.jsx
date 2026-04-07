// frontend/src/pages/ProfilePage.jsx - FINAL MINIMALIST UI FIXED VERSION

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './ProfilePage.css'; 

const ProfilePage = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    
    const [oldPassword, setOldPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const [showPasswordFields, setShowPasswordFields] = useState(false);

    const [message, setMessage] = useState('');
    const [passwordMessage, setPasswordMessage] = useState('');
    
    const userInfo = JSON.parse(localStorage.getItem('userInfo'));
    const token = userInfo ? userInfo.token : null;

    const config = {
        headers: { Authorization: `Bearer ${token}` },
    };

    useEffect(() => {
        const fetchProfile = async () => {
            if (!token) return;
            try {
                const { data } = await axios.get('/api/users/profile', config);
                setName(data.name);
                setEmail(data.email);
                setPhone(data.phone);
            } catch (error) {
                setMessage('Could not fetch profile');
            }
        };
        fetchProfile();
    }, [token]);

    const handleProfileUpdate = async (e) => {
        e.preventDefault();
        setMessage('');
        try {
            const { data } = await axios.put('/api/users/profile', { name, phone }, config);
            localStorage.setItem('userInfo', JSON.stringify({ ...userInfo, name: data.name, phone: data.phone }));
            setMessage('Profile Updated Successfully!');
            setPasswordMessage(''); 
        } catch (error) {
            setMessage(error.response?.data?.message || 'Error updating profile');
        }
    };

    const handleChangePassword = async (e) => {
        e.preventDefault();
        setPasswordMessage('');
        if (newPassword !== confirmPassword) {
            setPasswordMessage('New passwords do not match');
            return;
        }
        try {
            const { data } = await axios.put('/api/users/change-password', { oldPassword, newPassword }, config);
            setPasswordMessage(data.message); 
            setMessage(''); 
            setOldPassword('');
            setNewPassword('');
            setConfirmPassword('');
            setShowPasswordFields(false); 
        } catch (error) {
            setPasswordMessage(error.response?.data?.message || 'Error changing password');
        }
    };

    return (
        <div className="profile-container">
            <div className="profile-form">
                
                <form onSubmit={handleProfileUpdate}>
                    <h2>My Profile</h2>
                    {message && <div className="profile-message success">{message}</div>}
                    <div className="form-group"><label>Name</label><input type="text" value={name} onChange={(e) => setName(e.target.value)} required /></div>
                    <div className="form-group"><label>Email (Cannot be changed)</label><input type="email" value={email} disabled /></div>
                    <div className="form-group"><label>Phone</label><input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} required /></div>
                    {/* FIX 1: Reduced top margin on Update button */}
                    <button type="submit" className="profile-button" style={{ marginTop: '1.25rem' }}> 
                        Update Profile
                    </button>
                </form>

                {/* FIX 2: Reduced margin around the horizontal rule */}
                <hr className="divider" style={{ margin: '1.5rem 0' }} /> 

                <div className="password-section">
                    {!showPasswordFields ? (
                        <button 
                            onClick={() => setShowPasswordFields(true)} 
                            className="profile-button-alt"
                        >
                            Change Password
                        </button>
                    ) : (
                        <form onSubmit={handleChangePassword}>
                            {passwordMessage && <div className={`profile-message ${passwordMessage.includes('successfully') ? 'success' : 'error'}`}>{passwordMessage}</div>}
                            <div className="form-group"><label>Old Password</label><input type="password" value={oldPassword} onChange={(e) => setOldPassword(e.target.value)} required /></div>
                            <div className="form-group"><label>New Password</label><input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required /></div>
                            <div className="form-group"><label>Confirm New Password</label><input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required /></div>
                            
                            {/* FIX 3: Reduced top margin on Submit button */}
                            <button type="submit" className="profile-button" style={{ marginTop: '1.25rem' }}> 
                                Submit New Password
                            </button>
                            {/* FIX 4: Added a small top margin to Cancel button to separate it from Submit */}
                            <button 
                                type="button" 
                                onClick={() => setShowPasswordFields(false)} 
                                className="profile-button-alt"
                                style={{ marginTop: '0.5rem' }} 
                            >
                                Cancel
                            </button>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ProfilePage;
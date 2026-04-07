// frontend/src/components/PrivateRoute.jsx

import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

const PrivateRoute = ({ allowedRole }) => {
  const userInfo = JSON.parse(localStorage.getItem('userInfo'));

  // 1. Check if user is logged in
  if (!userInfo) {
    return <Navigate to="/login" replace />;
  }

  // --- THIS IS THE FIX ---
  // 2. Check if an allowedRole is provided
  if (allowedRole) {
    // If allowedRole is an array (e.g., ["admin", "user"]), check if user's role is in it
    if (Array.isArray(allowedRole) && !allowedRole.includes(userInfo.role)) {
      return <Navigate to="/" replace />; // Not authorized, go home
    }
    
    // If allowedRole is a single string (e.g., "admin"), check for a match
    if (typeof allowedRole === 'string' && userInfo.role !== allowedRole) {
       return <Navigate to="/" replace />; // Not authorized, go home
    }
  }

  // 3. If all checks pass (or if no allowedRole was specified), show the page
  return <Outlet />;
};

export default PrivateRoute;
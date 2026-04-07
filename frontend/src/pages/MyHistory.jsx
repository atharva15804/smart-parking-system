// frontend/src/pages/MyHistory.jsx

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './MyBookings.css'; 
import './AdminDashboard.css'; 

const formatDate = (dateString) => {
  const options = { year: 'numeric', month: '2-digit', day: '2-digit' };
  return new Date(dateString).toLocaleDateString(undefined, options);
};

const formatTime = (dateString) => {
  const options = { hour: '2-digit', minute: '2-digit', hour12: true };
  return new Date(dateString).toLocaleTimeString(undefined, options);
};

const MyHistory = () => {
  const [history, setHistory] = useState([]);

  const { token } = JSON.parse(localStorage.getItem('userInfo'));
  const config = {
    headers: { Authorization: `Bearer ${token}` },
  };

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        // --- URL FIXED ---
        const { data } = await axios.get('/api/bookings/myhistory', config);
        setHistory(data);
      } catch (error) {
        console.error('Failed to fetch booking history', error);
      }
    };
    fetchHistory();
  }, []);

  return (
    <div className="my-bookings-container">
      <h2>// MY PARKING HISTORY //</h2>
      <h3>Your Past Bookings</h3>
      <table className="data-table">
        <thead>
          <tr>
            <th>Parking Date</th>
            <th>Start Time</th>
            <th>End Time</th>
            <th>Slot Name</th>
            <th>Status</th>
            <th>Vehicle No.</th>
          </tr>
        </thead>
        <tbody>
          {history.length > 0 ? (
            history.map((booking) => (
              <tr key={booking._id}>
                <td>{formatDate(booking.parkingDate)}</td>
                <td>{formatTime(booking.startTime)}</td>
                <td>{formatTime(booking.endTime)}</td>
                <td>{booking.slotId}</td>
                <td>
                  <span className={`status-badge status-${booking.status.toLowerCase()}`}>
                    {booking.status}
                  </span>
                </td>
                <td>{booking.vehicleNumber || 'N/A'}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="6" style={{ textAlign: 'center' }}>You have no past bookings.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default MyHistory;
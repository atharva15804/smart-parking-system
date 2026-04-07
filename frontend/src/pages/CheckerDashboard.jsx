// frontend/src/pages/CheckerDashboard.jsx

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Html5QrcodeScanner } from 'html5-qrcode'; 
import './CheckerDashboard.css';
import './AdminDashboard.css'; 

const CheckerDashboard = () => {
  const [page, setPage] = useState('home'); 
  const [logs, setLogs] = useState([]);
  const [scannedBooking, setScannedBooking] = useState(null);
  const [vehicleNumber, setVehicleNumber] = useState('');
  const { token } = JSON.parse(localStorage.getItem('userInfo'));
  const config = {
    headers: { Authorization: `Bearer ${token}` },
  };

  useEffect(() => {
    if (page === 'scanner') {
      const scanner = new Html5QrcodeScanner(
        'qr-reader', { qrbox: { width: 250, height: 250 }, fps: 10, }, false 
      );
      const onScanSuccess = (decodedText, decodedResult) => {
        scanner.clear(); 
        verifyScannedTicket(decodedText); 
      };
      const onScanError = (errorMessage) => {};
      scanner.render(onScanSuccess, onScanError);
      return () => {
        scanner.clear();
      };
    }
  }, [page]); 

  const fetchLogs = async () => {
    try {
      // --- URL FIXED ---
      const { data } = await axios.get('/api/checker/logs', config);
      setLogs(data);
      setPage('logs'); 
    } catch (error) {
      console.error('Failed to fetch logs', error);
      alert('Failed to fetch logs');
    }
  };

  const verifyScannedTicket = async (bookingId) => {
    setPage('loading'); 
    try {
      // --- URL FIXED ---
      const { data } = await axios.post('/api/checker/verify', { bookingId }, config);
      alert(data.message); 
      setScannedBooking(data.booking);
      setPage('logVehicle'); 
    } catch (error) {
      alert(error.response.data.message); 
      setPage('home'); 
    }
  };

  const handleLogVehicle = async (e) => {
    e.preventDefault();
    try {
      // --- URL FIXED ---
      const { data } = await axios.post('/api/checker/log', { 
        bookingId: scannedBooking._id, 
        vehicleNumber 
      }, config);
      alert(data.message); 
      setVehicleNumber('');
      setScannedBooking(null);
      fetchLogs(); 
    } catch (error) {
      alert('Failed to log vehicle');
      setPage('home');
    }
  };

  const CheckerNav = () => (
    <div className="checker-nav">
      <button onClick={() => setPage('home')}>HOME</button>
      <button onClick={() => setPage('scanner')}>CHECK PARKING TICKET</button>
      <button onClick={fetchLogs}>PARKING LOGS</button>
    </div>
  );

  return (
    <div className="checker-container">
      <CheckerNav />
      {page === 'home' && (<div className="checker-section"><h2>// TICKET CHECKER HOME //</h2></div>)}
      {page === 'scanner' && (
        <div className="checker-section">
          <h2>// SHOW THE QR CODE //</h2>
          <div className="scanner-container"><div id="qr-reader"></div></div>
        </div>
      )}
      {page === 'loading' && (<div className="checker-section"><h2>Verifying Ticket...</h2></div>)}
      {page === 'logVehicle' && (
        <div className="checker-section">
          <h2>// PARKING DETAILS //</h2>
          <h3>Please Fill the Vehicle Number</h3>
          <form className="log-vehicle-form" onSubmit={handleLogVehicle}>
            <div className="form-group"><label>Vehicle Number</label><input type="text" value={vehicleNumber} onChange={(e) => setVehicleNumber(e.target.value)} required /></div>
            <button type="submit" className="auth-button">SUBMIT</button>
          </form>
        </div>
      )}
      {page === 'logs' && (
        <div className="checker-section">
          <h2>// PARKING LOGS //</h2>
          <table className="data-table">
            <thead><tr><th>ID</th><th>Ticket ID</th><th>Vehicle Number</th><th>Username</th><th>Slot Name</th><th>Timestamp</th></tr></thead>
            <tbody>
              {logs.map((log) => (
                <tr key={log._id}>
                  <td>{log._id}</td><td>{log.ticketId}</td><td>{log.vehicleNumber}</td><td>{log.username}</td><td>{log.slotName}</td><td>{new Date(log.timestamp).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
export default CheckerDashboard;
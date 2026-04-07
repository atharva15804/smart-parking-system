// frontend/src/pages/MyBookings.jsx

import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { saveAs } from 'file-saver';
import { toPng } from 'html-to-image';
import ParkingTicket from '../components/ParkingTicket';
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

const MyBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [ticketToDownload, setTicketToDownload] = useState(null);
  const ticketRef = useRef(null);

  const { token } = JSON.parse(localStorage.getItem('userInfo'));
  const config = {
    headers: { Authorization: `Bearer ${token}` },
  };

  // --- URL FIXED ---
  const API_URL = '/api/bookings'; 

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        // --- URL FIXED ---
        const { data } = await axios.get(`${API_URL}/mybookings`, config);
        setBookings(data);
      } catch (error) {
        console.error('Failed to fetch bookings', error);
      }
    };
    fetchBookings();
  }, []);

  useEffect(() => {
    if (ticketToDownload && ticketRef.current) {
      toPng(ticketRef.current, { cacheBust: true, pixelRatio: 2 })
        .then((dataUrl) => {
          saveAs(dataUrl, `ParkingTicket-${ticketToDownload.slotId}.png`);
          setTicketToDownload(null);
        })
        .catch((error) => {
          console.error('Error generating ticket image:', error);
          setTicketToDownload(null);
        });
    }
  }, [ticketToDownload]);

  const handleDownloadTicket = (booking) => {
    setTicketToDownload(booking);
  };

  const handleCancelBooking = async (bookingId) => {
    if (window.confirm('Are you sure you want to cancel this booking?')) {
      try {
        // --- URL FIXED ---
        await axios.delete(`${API_URL}/mybookings/${bookingId}`, config);
        alert('Booking canceled successfully');
        setBookings(bookings.filter((b) => b._id !== bookingId));
      } catch (error) {
        alert(error.response?.data?.message || 'Failed to cancel booking');
      }
    }
  };


  return (
    <>
      <div className="my-bookings-container">
        <h2>// BOOKING //</h2>
        <h3>Slot Booking Cost</h3>
        <table className="data-table">
          <thead>
            <tr>
              <th>Parking Date</th>
              <th>Start Time</th>
              <th>End Time</th>
              <th>Slot Name</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {bookings.length > 0 ? (
              bookings.map((booking) => (
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
                  <td className="action-buttons">
                    {booking.status === 'Booked' && (
                      <>
                        <button 
                          className="btn-download"
                          onClick={() => handleDownloadTicket(booking)}
                        >
                          Download
                        </button>
                        <button 
                          className="btn-cancel-user" 
                          onClick={() => handleCancelBooking(booking._id)}
                        >
                          Cancel
                        </button>
                      </>
                    )}
                    {booking.status !== 'Booked' && (
                      <span>-</span>
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" style={{ textAlign: 'center' }}>You have no upcoming bookings.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {ticketToDownload && (
        <div style={{ position: 'absolute', left: '-9999px', top: 0 }}>
          <ParkingTicket booking={ticketToDownload} ref={ticketRef} />
        </div>
      )}
    </>
  );
};

export default MyBookings;
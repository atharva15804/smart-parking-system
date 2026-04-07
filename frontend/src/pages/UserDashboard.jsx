// frontend/src/pages/UserDashboard.jsx

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './UserDashboard.css'; 
import { useNavigate } from 'react-router-dom'; 
import MapSelection from '../components/MapSelection';

const slotsLayout = [
  ['A1', 'A2', 'A3', 'A4', 'A5', 'A6', 'A7', 'A8', 'A9', 'A10'],
  ['B1', 'B2', 'B3', 'B4', 'B5', 'B6', 'B7', 'B8', 'B9', 'B10'],
  ['C1', 'C2', 'C3', 'C4', 'C5', 'C6', 'C7', 'C8', 'C9', 'C10'],
];

const UserDashboard = () => {
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [startTime, setStartTime] = useState('09:00');
  const [duration, setDuration] = useState(1);
  const [perHourRate, setPerHourRate] = useState(0);
  
  const [step, setStep] = useState(0); // Step 0 is Map Selection
  const [selectedLocationName, setSelectedLocationName] = useState(null);
  const [bookedSlots, setBookedSlots] = useState([]);
  const [bookingDetails, setBookingDetails] = useState(null);
  const [selectedSlot, setSelectedSlot] = useState(null);
  
  const navigate = useNavigate(); 

  const userInfoString = localStorage.getItem('userInfo');
  const token = userInfoString ? JSON.parse(userInfoString).token : null;
  
  const config = {
    headers: { Authorization: `Bearer ${token}` },
  };

  useEffect(() => {
    const fetchCost = async () => {
      try {
        const { data } = await axios.get('/api/bookings/cost', config);
        setPerHourRate(data.perHourRate);
      } catch (error) {
        console.error(error);
      }
    };
    if (token) fetchCost();
  }, [token]);

  const handleLocationConfirm = (locationName) => {
    setSelectedLocationName(locationName);
    setStep(1);
  };

  const handleCheckAvailability = async (e) => {
    e.preventDefault();
    try {
      const { data } = await axios.post(
        '/api/bookings/availability',
        { date, startTime, duration },
        config
      );
      setBookedSlots(data.bookedSlots);
      setBookingDetails({
        date,
        startTime: data.startTime,
        endTime: data.endTime,
        durationHours: duration,
        cost: duration * perHourRate,
        locationName: selectedLocationName
      });
      setStep(2);
    } catch (error) {
      console.error(error);
      alert('Error checking availability');
    }
  };
  
  const handleProceedToPayment = () => {
    if (!selectedSlot) {
      alert('Please select a slot first!');
      return;
    }
    
    // Format slot ID to include location if that's how we uniquely identify
    // E.g., "City Centre Mall - A1"
    const finalSlotId = `${selectedLocationName} - ${selectedSlot}`;
    
    navigate('/payment', { 
      state: { 
        bookingDetails: {
          ...bookingDetails,
          slotId: finalSlotId
        } 
      } 
    });
  };

  const renderTimeOptions = () => {
    let times = [];
    for (let i = 6; i <= 18; i++) {
      times.push(`${String(i).padStart(2, '0')}:00`);
    }
    return times.map(time => <option key={time} value={time}>{time}</option>);
  };

  return (
    <div className="booking-container bg-premium">
      {step === 0 && (
        <MapSelection onLocationConfirm={handleLocationConfirm} />
      )}

      {step === 1 && (
        <form className="booking-form premium-card fade-in" onSubmit={handleCheckAvailability}>
          <div className="form-header">
            <h2>// BOOKING DETAILS //</h2>
            <h3>{selectedLocationName}</h3>
            <p className="subtitle">Select date and parking duration</p>
          </div>

          <div className="form-group premium-input">
            <label>Select Date</label>
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} min={new Date().toISOString().split('T')[0]} required />
          </div>
          <div className="form-group premium-input">
            <label>Arrival Time</label>
            <select value={startTime} onChange={(e) => setStartTime(e.target.value)}>{renderTimeOptions()}</select>
          </div>
          <div className="form-group premium-input">
            <label>Duration (Hours)</label>
            <select value={duration} onChange={(e) => setDuration(Number(e.target.value))}>
              <option value={1}>1 Hour</option><option value={2}>2 Hours</option><option value={3}>3 Hours</option><option value={4}>4 Hours</option><option value={5}>5 Hours</option><option value={6}>6 Hours</option><option value={8}>8 Hours</option><option value={12}>12 Hours</option>
            </select>
          </div>
          
          <div className="form-actions">
            <button type="button" onClick={() => setStep(0)} className="btn-back-outline">Change Location</button>
            <button type="submit" className="btn-select-slot premium-btn primary">CHECK SLOTS</button>
          </div>
        </form>
      )}

      {step === 2 && (
        <div className="slot-selection fade-in">
          <div className="slot-selection-header">
            <h2>// SLOT SELECTION //</h2>
            <h3>{selectedLocationName}</h3>
          </div>
          <div className="slot-details-container premium-card-transparent">
            
            <div className="slot-booking-info premium-panel">
              <h4>Booking Summary</h4>
              <div className="summary-row"><span>Date:</span> <strong>{new Date(bookingDetails.date).toLocaleDateString()}</strong></div>
              <div className="summary-row"><span>Arriving:</span> <strong>{new Date(bookingDetails.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</strong></div>
              <div className="summary-row"><span>Duration:</span> <strong>{bookingDetails.durationHours} hr(s)</strong></div>
              <div className="summary-row total-cost"><span>Total Cost:</span> <strong>Rs. {bookingDetails.cost}</strong></div>
              
              <div className="summary-row selected-slot-display">
                <span>Selected Slot:</span> 
                <strong className={selectedSlot ? 'highlight' : ''}>{selectedSlot || '--'}</strong>
              </div>
              
              <div className="panel-actions">
                <button onClick={() => setStep(1)} className="btn-back premium-btn secondary">Back</button>
                <button 
                  onClick={handleProceedToPayment} 
                  className="btn-book-final premium-btn primary" 
                  disabled={!selectedSlot}
                >
                  Proceed to Pay
                </button>
              </div>
            </div>

            <div className="slot-grid-container premium-panel">
              <div className="grid-legend">
                <span className="legend-item"><div className="box avail"></div> Available</span>
                <span className="legend-item"><div className="box booked"></div> Booked</span>
                <span className="legend-item"><div className="box selected"></div> Selected</span>
              </div>
              <div className="slot-grid">
                {slotsLayout.flat().map(slot => {
                  const globalSlotId = `${selectedLocationName} - ${slot}`;
                  const isBooked = bookedSlots.includes(globalSlotId);
                  const isSelected = selectedSlot === slot;
                  
                  return (
                    <button
                      key={slot}
                      className={`slot-box ${isBooked ? 'booked' : ''} ${isSelected ? 'selected' : ''}`}
                      onClick={() => !isBooked && setSelectedSlot(slot)}
                      disabled={isBooked}
                    >
                      {slot}
                    </button>
                  );
                })}
              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  );
};

export default UserDashboard;
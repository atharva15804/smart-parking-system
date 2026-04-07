// frontend/src/components/ParkingTicket.jsx

import React from 'react';
import { QRCodeCanvas } from 'qrcode.react';
// We do NOT import the CSS file

// We wrap the component in React.forwardRef to get its DOM node
const ParkingTicket = React.forwardRef(({ booking }, ref) => {

  // --- ALL STYLES ARE DEFINED HERE ---
  const ticketStyle = {
    fontFamily: 'Arial, sans-serif',
    padding: '2rem',
    width: '400px',
    border: '3px solid #d9232d', // Red border
    borderRadius: '8px',
    background: '#ffffff',
    color: '#000',
  };

  const headerStyle = {
    textAlign: 'center',
    color: '#000',
    textTransform: 'uppercase',
    fontSize: '1.75rem',
    fontWeight: '700',
    borderBottom: '2px dashed #ccc',
    paddingBottom: '1rem',
    marginBottom: '1.5rem',
  };

  const bodyStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  };

  const infoStyle = {
    margin: '0.75rem 0',
    fontSize: '1.1rem',
  };
  
  const infoStrongStyle = {
    color: '#333',
  };

  const qrStyle = {
    padding: '10px',
    background: 'white',
    border: '1px solid #ccc',
    borderRadius: '4px',
  };
  // --- END OF STYLES ---

  return (
    // We apply the styles directly to the elements
    <div style={ticketStyle} ref={ref}>
      <h2 style={headerStyle}>
        Parking Ticket
      </h2>
      <div style={bodyStyle}>
        <div className="ticket-info">
          <p style={infoStyle}><strong style={infoStrongStyle}>Date:</strong> {new Date(booking.parkingDate).toLocaleDateString()}</p>
          <p style={infoStyle}>
            <strong style={infoStrongStyle}>Time:</strong>
            {` ${new Date(booking.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - ${new Date(booking.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`}
          </p>
          <p style={infoStyle}><strong style={infoStrongStyle}>Location:</strong> {booking.slotId}</p>
          <p style={infoStyle}><strong style={infoStrongStyle}>Cost:</strong> Rs. {booking.cost}</p>
        </div>
        <div style={qrStyle}>
          <QRCodeCanvas 
            value={booking._id} // The QR code just contains the unique Booking ID
            size={128} 
          />
        </div>
      </div>
    </div>
  );
});

export default ParkingTicket;
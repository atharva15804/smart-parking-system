// backend/models/ParkingLog.js

const mongoose = require('mongoose');

const ParkingLogSchema = new mongoose.Schema({
  booking: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Booking',
  },
  ticketId: {
    type: String, // We'll store the booking's _id as a string
    required: true,
  },
  vehicleNumber: {
    type: String,
    required: true,
  },
  username: {
    type: String, // Store the username for easy display
    required: true,
  },
  slotName: {
    type: String,
    required: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('ParkingLog', ParkingLogSchema);
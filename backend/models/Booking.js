// backend/models/Booking.js

const mongoose = require('mongoose');

const BookingSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  slotId: {
    type: String,
    required: true,
  },
  parkingDate: {
    type: Date,
    required: true,
  },
  startTime: {
    type: Date,
    required: true,
  },
  endTime: {
    type: Date,
    required: true,
  },
  durationHours: {
    type: Number,
    required: true,
  },
  cost: {
    type: Number,
    required: true,
  },
  status: {
    type: String,
    enum: ['Booked', 'Completed', 'Expired'],
    default: 'Booked',
  },
  vehicleNumber: {
    type: String, // Will be added by the ticket checker on check-in
    default: null,
  },
}, { timestamps: true });

// Create a compound index to ensure a slot isn't double-booked
// A slotId can only be booked once for a time that overlaps
BookingSchema.index({ slotId: 1, parkingDate: 1, startTime: 1, endTime: 1 }, { unique: true });

module.exports = mongoose.model('Booking', BookingSchema);
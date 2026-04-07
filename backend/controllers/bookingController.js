// backend/controllers/bookingController.js

const Booking = require('../models/Booking');
const Settings = require('../models/Settings');
const User = require('../models/User');

// @desc    Get the current parking cost per hour
// @route   GET /api/bookings/cost
exports.getParkingCost = async (req, res) => {
  try {
    let settings = await Settings.findOne();
    if (!settings) {
      settings = await Settings.create({ perHourRate: 40 });
    }
    res.json(settings);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Get available slots for a given time
// @route   POST /api/bookings/availability
exports.getAvailableSlots = async (req, res) => {
  const { date, startTime, duration } = req.body;

  try {
    const start = new Date(`${date}T${startTime}:00`);
    const end = new Date(start.getTime() + duration * 60 * 60 * 1000); 
    const dayStart = new Date(start);
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(start);
    dayEnd.setHours(23, 59, 59, 999);

    const overlappingBookings = await Booking.find({
      parkingDate: { 
        $gte: dayStart,
        $lte: dayEnd,
      },
      $or: [
        { startTime: { $lt: end }, endTime: { $gt: start } }, 
      ],
    });

    const bookedSlots = overlappingBookings.map(booking => booking.slotId);
    res.json({ bookedSlots, startTime: start, endTime: end }); 

  } catch (error) {
    res.status(500).json({ message: 'Server Error: ' + error.message });
  }
};

// @desc    Get *upcoming* bookings for the logged-in user
// @route   GET /api/bookings/mybookings
exports.getMyBookings = async (req, res) => {
  try {
    // Only get bookings that are not completed or expired
    const bookings = await Booking.find({ 
      user: req.user._id,
      status: 'Booked' 
    }).sort({ createdAt: -1 });
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    User cancels their own booking
// @route   DELETE /api/bookings/mybookings/:id
exports.cancelMyBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }
    if (booking.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized' });
    }
    if (booking.status !== 'Booked') {
      return res.status(400).json({ message: 'Cannot cancel this booking' });
    }

    await booking.deleteOne();
    res.json({ message: 'Booking canceled successfully' });

  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

// --- THIS IS THE NEW FUNCTION ---
// @desc    Get *past* bookings for the logged-in user
// @route   GET /api/bookings/myhistory
exports.getMyBookingHistory = async (req, res) => {
  try {
    // Only get bookings that ARE completed or expired
    const bookings = await Booking.find({ 
      user: req.user._id,
      status: { $in: ['Completed', 'Expired'] } 
    }).sort({ createdAt: -1 });
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};
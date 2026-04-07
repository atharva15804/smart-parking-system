// backend/controllers/checkerController.js

const Booking = require('../models/Booking');
const ParkingLog = require('../models/ParkingLog');
const User = require('../models/User');

// @desc    Verify a ticket by its booking ID
// @route   POST /api/checker/verify
exports.verifyTicket = async (req, res) => {
  const { bookingId } = req.body;

  try {
    const booking = await Booking.findById(bookingId);

    // 1. Check if booking exists
    if (!booking) {
      return res.status(404).json({ message: 'Invalid Ticket' });
    }

    // 2. Check if ticket is already used (as seen in video at 16:11)
    if (booking.status !== 'Booked') {
      return res.status(400).json({ message: 'Ticket Already Used Or Expired' });
    }

    // 3. If valid
    res.status(200).json({ message: 'Ticket Verified', booking });
  } catch (error) {
    res.status(500).json({ message: 'Server Error: ' + error.message });
  }
};

// @desc    Log the vehicle check-in
// @route   POST /api/checker/log
exports.logVehicle = async (req, res) => {
  const { bookingId, vehicleNumber } = req.body;

  try {
    const booking = await Booking.findById(bookingId).populate('user', 'name');

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // 1. Update the booking status to "Completed"
    booking.status = 'Completed';
    booking.vehicleNumber = vehicleNumber;
    await booking.save();

    // 2. Create a new ParkingLog entry (as seen in video at 15:35)
    await ParkingLog.create({
      booking: booking._id,
      ticketId: booking._id.toString(), // Store as string
      vehicleNumber: vehicleNumber,
      username: booking.user.name,
      slotName: booking.slotId,
      timestamp: new Date(),
    });

    res.status(200).json({ message: 'Log Details Added' });
  } catch (error) {
    res.status(500).json({ message: 'Server Error: ' + error.message });
  }
};

// @desc    Get all parking logs for the checker
// @route   GET /api/checker/logs
exports.getCheckerLogs = async (req, res) => {
  try {
    const logs = await ParkingLog.find({}).sort({ timestamp: -1 });
    res.json(logs);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};
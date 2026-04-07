// backend/routes/bookingRoutes.js

const express = require('express');
const router = express.Router();
const {
  getParkingCost,
  getAvailableSlots,
  getMyBookings,
  cancelMyBooking,
  getMyBookingHistory, // <-- ADDED
} = require('../controllers/bookingController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

// GET /api/bookings/cost
router.get('/cost', getParkingCost);

// POST /api/bookings/availability
router.post('/availability', getAvailableSlots);

// GET /api/bookings/mybookings (Upcoming)
router.get('/mybookings', getMyBookings);

// DELETE /api/bookings/mybookings/:id (Cancel)
router.delete('/mybookings/:id', cancelMyBooking);

// GET /api/bookings/myhistory (Past)
router.get('/myhistory', getMyBookingHistory); // <-- ADDED

module.exports = router;
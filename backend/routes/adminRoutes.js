// backend/routes/adminRoutes.js - RESTORED DASHBOARD ROUTES

const express = require('express');
const router = express.Router();
const {
    // 1. ADDED BACK the required stats function
    getDashboardStats, 
    getAllUsers,
    getSettings,
    updateSettings,
    getAllBookings,
    getAllParkingLogs,
    cancelBooking,
    deleteUser,
} = require('../controllers/adminController'); // Ensure getDashboardStats is available here
const { protect, admin } = require('../middleware/authMiddleware');

// All routes in this file are protected and require admin access
router.use(protect, admin);

// --- Dashboard Stats Route ---
// 2. ADDED BACK the route endpoint
router.get('/stats', getDashboardStats); 

// --- User Routes ---
router.get('/users', getAllUsers);
router.delete('/users/:id', deleteUser);

// --- Settings Routes ---
router.get('/settings', getSettings);
router.put('/settings', updateSettings);

// --- Booking Routes ---
router.get('/bookings', getAllBookings);
router.delete('/bookings/:id', cancelBooking);

// --- Log Routes ---
router.get('/logs', getAllParkingLogs);

module.exports = router;
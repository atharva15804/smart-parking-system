// backend/routes/paymentRoutes.js

const express = require('express');
const router = express.Router();
const { createOrder, verifyPayment, getRazorpayKey } = require('../controllers/paymentController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

// GET /api/payment/getkey
// Gets the Razorpay Key ID for the frontend
router.get('/getkey', getRazorpayKey);

// POST /api/payment/orders
// Creates a new Razorpay order
router.post('/orders', createOrder);

// POST /api/payment/verify
// Verifies the payment and saves the booking
router.post('/verify', verifyPayment);

module.exports = router;
// backend/routes/authRoutes.js

const express = require('express');
const router = express.Router();
const { 
  registerUser, 
  loginUser,
  forgotPassword, // <-- ADDED
  resetPassword   // <-- ADDED
} = require('../controllers/authController');

router.post('/register', registerUser);
router.post('/login', loginUser);

// --- NEW ROUTES ---
router.post('/forgot-password', forgotPassword);
router.post('/reset-password/:token', resetPassword);

module.exports = router;
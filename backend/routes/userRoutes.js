// backend/routes/userRoutes.js

const express = require('express');
const router = express.Router();
const {
  getUserProfile,
  updateUserProfile,
  changePassword,
} = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');

// All these routes are protected
router.use(protect);

// GET /api/users/profile
router.get('/profile', getUserProfile);

// PUT /api/users/profile
router.put('/profile', updateUserProfile);

// PUT /api/users/change-password
router.put('/change-password', changePassword);

module.exports = router;
// backend/controllers/userController.js

const User = require('../models/User');
const bcrypt = require('bcryptjs');

// @desc    Get user profile
// @route   GET /api/users/profile
exports.getUserProfile = async (req, res) => {
  // req.user is added by our 'protect' middleware
  const user = await User.findById(req.user._id);

  if (user) {
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
    });
  } else {
    res.status(404).json({ message: 'User not found' });
  }
};

// @desc    Update user profile
// @route   PUT /api/users/profile
exports.updateUserProfile = async (req, res) => {
  const user = await User.findById(req.user._id);

  if (user) {
    user.name = req.body.name || user.name;
    user.phone = req.body.phone || user.phone;
    // We don't let them update email, as it's a unique ID
    // We don't update password here, that's a separate function

    const updatedUser = await user.save();

    res.json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      phone: updatedUser.phone,
      role: updatedUser.role,
      token: req.headers.authorization.split(' ')[1], // Send back the same token
    });
  } else {
    res.status(404).json({ message: 'User not found' });
  }
};

// @desc    Change user password
// @route   PUT /api/users/change-password
exports.changePassword = async (req, res) => {
  const { oldPassword, newPassword } = req.body;

  if (!oldPassword || !newPassword) {
    return res.status(400).json({ message: 'Please provide old and new passwords' });
  }

  const user = await User.findById(req.user._id);

  // 1. Check if user exists and old password is correct
  if (user && (await bcrypt.compare(oldPassword, user.password))) {
    // 2. Hash the new password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);

    await user.save();
    res.json({ message: 'Password updated successfully' });
  } else {
    res.status(401).json({ message: 'Invalid old password' });
  }
};
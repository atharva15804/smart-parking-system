// backend/models/Settings.js

const mongoose = require('mongoose');

const SettingsSchema = new mongoose.Schema({
  perHourRate: {
    type: Number,
    required: true,
    default: 40, // Set the default cost to 40, like in the video
  },
});

module.exports = mongoose.model('Settings', SettingsSchema);
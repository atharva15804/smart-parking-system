const mongoose = require('mongoose');
require('dotenv').config();
const User = require('./models/User');
const Booking = require('./models/Booking');

mongoose.connect(process.env.MONGO_URI).then(async () => {
    const booking = await Booking.findOne().sort({ createdAt: -1 });
    if (!booking) {
        console.log("No bookings found.");
        process.exit();
    }
    const user = await User.findById(booking.user);
    console.log("==========");
    console.log("LATEST BOOKING WAS FOR:", user.email);
    console.log("==========");
    process.exit(0);
});

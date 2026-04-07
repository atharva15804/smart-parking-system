// backend/server.js

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const User = require('./models/User');
const Booking = require('./models/Booking');
const bcrypt = require('bcryptjs');
const cron = require('node-cron');

// --- Import Routes ---
const authRoutes = require('./routes/authRoutes');
const adminRoutes = require('./routes/adminRoutes');
const bookingRoutes = require('./routes/bookingRoutes');
const checkerRoutes = require('./routes/checkerRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const userRoutes = require('./routes/userRoutes');

// --- Connect to Database FIRST ---
const app = express();

connectDB()
  .then(() => {
    console.log('✅ MongoDB Connected Successfully');
    createDefaultAccounts(); // Create default admin/checker
    startBookingExpiryJob(); // Start expiry scheduler
  })
  .catch((err) => console.error('❌ MongoDB connection failed:', err));

// --- Middleware ---
app.use(cors());
app.use(express.json());

// --- Use Routes ---
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/checker', checkerRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/users', userRoutes);

// --- Default Route (optional sanity check) ---
app.get('/', (req, res) => {
  res.send('Smart Parking System Backend Running 🚗');
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));

// --- Cron Job for Auto Expiry ---
const startBookingExpiryJob = () => {
  cron.schedule('0 * * * *', async () => {
    console.log('Running scheduled job: Expiring old bookings...');
    try {
      const now = new Date();
      const result = await Booking.updateMany(
        {
          status: 'Booked',
          endTime: { $lt: now },
        },
        { $set: { status: 'Expired' } }
      );

      if (result.modifiedCount > 0) {
        console.log(`Expired ${result.modifiedCount} bookings.`);
      } else {
        console.log('No bookings to expire.');
      }
    } catch (error) {
      console.error('Error expiring bookings:', error);
    }
  });
};

// --- Default Accounts Creation (Admin + Checker) ---
const createDefaultAccounts = async () => {
  try {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('12345', salt);

    // --- Admin Account ---
    let admin = await User.findOne({ email: 'admin@gmail.com' });
    if (!admin) {
      await User.create({
        name: 'Administrator',
        email: 'admin@gmail.com',
        password: hashedPassword,
        phone: '9999999999',
        role: 'admin',
      });
      console.log('✅ Default Admin user created');
    }

    // --- Checker Account ---
    let checker = await User.findOne({ email: 'ticketchecker@gmail.com' });
    if (!checker) {
      await User.create({
        name: 'Ticket Checker',
        email: 'ticketchecker@gmail.com',
        password: hashedPassword,
        phone: '8888888888',
        role: 'checker',
      });
      console.log('✅ Default Ticket Checker user created');
    }
  } catch (error) {
    console.error('Error creating default accounts:', error);
  }
};

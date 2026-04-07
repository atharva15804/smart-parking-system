// backend/controllers/adminController.js - RESTORED DASHBOARD STATS

const User = require('../models/User');
const Settings = require('../models/Settings');
const Booking = require('../models/Booking'); 
const ParkingLog = require('../models/ParkingLog'); 

// @desc    Get dashboard statistics
// @route   GET /api/admin/stats  <-- RESTORED FUNCTION
exports.getDashboardStats = async (req, res) => {
    try {
        // 1. Total Users (excluding admin/checker roles)
        const totalUsers = await User.countDocuments({ role: 'user' });

        // 2. Bookings Today
        const today = new Date();
        today.setHours(0, 0, 0, 0); 
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1); 

        const bookingsToday = await Booking.countDocuments({
            createdAt: { $gte: today, $lt: tomorrow }
        });

        // 3. Current Occupancy (Booked and currently active)
        const now = new Date();
        const currentOccupancy = await Booking.countDocuments({
            startTime: { $lte: now },
            endTime: { $gte: now },
            status: 'Booked' // Only count active, non-completed bookings
        });

        // 4. Total Revenue (from Completed bookings)
        const revenueResult = await Booking.aggregate([
            { $match: { status: { $in: ['Completed', 'Booked'] } } }, // Sum revenue from completed and current booked
            { $group: { _id: null, total: { $sum: '$cost' } } }
        ]);
        const totalRevenue = revenueResult.length > 0 ? revenueResult[0].total : 0;

        res.json({
            totalUsers,
            bookingsToday,
            currentOccupancy,
            totalRevenue
        });
    } catch (error) {
        // Log the error to your server console
        console.error('Error fetching dashboard stats:', error); 
        res.status(500).json({ message: 'Server Error fetching stats: ' + error.message });
    }
};


// @desc    Get all users (with search)
// @route   GET /api/admin/users
exports.getAllUsers = async (req, res) => {
    try {
        const { search } = req.query; 
        
        let filter = {};
        if (search) {
            filter = {
                $or: [
                    { name: { $regex: search, $options: 'i' } }, 
                    { email: { $regex: search, $options: 'i' } }
                ]
            };
        }

        // Exclude admin, checker, and password from the results
        const users = await User.find({ ...filter, role: { $nin: ['admin', 'checker'] } })
            .select('-password')
            .sort({ role: 1 });

        res.json(users);
    } catch (error) {
        res.status(500).json({ message: 'Server Error: ' + error.message });
    }
};

// @desc    Get system settings
// @route   GET /api/admin/settings
exports.getSettings = async (req, res) => {
    try {
        let settings = await Settings.findOne();
        if (!settings) {
            // Create default settings if none exist
            settings = await Settings.create({ perHourRate: 40 });
        }
        res.json(settings);
    } catch (error) {
        res.status(500).json({ message: 'Server Error: ' + error.message });
    }
};

// @desc    Update system settings
// @route   PUT /api/admin/settings
exports.updateSettings = async (req, res) => {
    const { perHourRate } = req.body;
    if (!perHourRate || isNaN(perHourRate)) {
        return res.status(400).json({ message: 'Invalid parking rate' });
    }
    try {
        let settings = await Settings.findOne();
        if (settings) {
            settings.perHourRate = perHourRate;
            await settings.save();
        } else {
            // Create settings if they don't exist
            settings = await Settings.create({ perHourRate });
        }
        res.json(settings);
    } catch (error) {
        res.status(500).json({ message: 'Server Error: ' + error.message });
    }
};

// @desc    Get all bookings
// @route   GET /api/admin/bookings
exports.getAllBookings = async (req, res) => {
    try {
        // Populate user details: name and email
        const bookings = await Booking.find({}).populate('user', 'name email'); 
        res.json(bookings);
    } catch (error) {
        res.status(500).json({ message: 'Server Error: ' + error.message });
    }
};

// @desc    Get all parking logs (with search)
// @route   GET /api/admin/logs
exports.getAllParkingLogs = async (req, res) => {
    try {
        const { search } = req.query; 

        let filter = {};
        if (search) {
            filter = {
                vehicleNumber: { $regex: search, $options: 'i' }
            };
        }

        const logs = await ParkingLog.find(filter).sort({ timestamp: -1 });
        res.json(logs);
    } catch (error) {
        res.status(500).json({ message: 'Server Error: ' + error.message });
    }
};

// @desc    Cancel/Delete a booking
// @route   DELETE /api/admin/bookings/:id
exports.cancelBooking = async (req, res) => {
    try {
        const booking = await Booking.findById(req.params.id);
        if (!booking) {
            return res.status(404).json({ message: 'Booking not found' });
        }
        // Use findByIdAndDelete for cleaner removal
        await Booking.findByIdAndDelete(req.params.id); 
        res.json({ message: 'Booking canceled' });
    } catch (error) {
        res.status(500).json({ message: 'Server Error: ' + error.message });
    }
};

// @desc    Delete a user
// @route   DELETE /api/admin/users/:id
exports.deleteUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (user) {
            if (user.role === 'admin') {
                return res.status(400).json({ message: 'Cannot delete admin user' });
            }
            // Use findByIdAndDelete for cleaner removal
            await User.findByIdAndDelete(req.params.id);
            res.json({ message: 'User removed' });
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server Error: ' + error.message });
    }
};
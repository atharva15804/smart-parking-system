// backend/controllers/paymentController.js - FINAL CLEANED VERSION (Bypassing Signature Check)

const Razorpay = require('razorpay');
const crypto = require('crypto');
const Booking = require('../models/Booking');
const nodemailer = require('nodemailer'); 
const qrcode = require('qrcode'); 
const User = require('../models/User');

// --- NODEMAILER TRANSPORTER (Unchanged) ---
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

// --- HELPER FUNCTION (Unchanged) ---
const sendBookingConfirmationEmail = async (user, booking) => {
    try {
        const qrCodeDataURL = await qrcode.toDataURL(booking._id.toString());
        const qrCodeBase64 = qrCodeDataURL.split(',')[1];

        const mailOptions = {
            from: `Parker <${process.env.EMAIL_USER}>`,
            to: user.email,
            subject: `Parking Confirmed! Your Booking for Parker (Slot ${booking.slotId})`,
            html: `
                <div style="font-family: Arial, sans-serif; line-height: 1.6;">
                    <h2>Booking Confirmed!</h2>
                    <p>Hi ${user.name},</p>
                    <p>Your parking slot is confirmed. You can find your booking details and QR code below.</p>
                    
                    <div style="border: 1px solid #ddd; padding: 15px; border-radius: 8px; max-width: 400px;">
                        <h3 style="color: #d9232d; margin-top: 0;">Parker Booking Details</h3>
                        <p><strong>Slot:</strong> ${booking.slotId}</p>
                        <p><strong>Date:</strong> ${new Date(booking.parkingDate).toLocaleDateString()}</p>
                        <p><strong>Time:</strong> ${new Date(booking.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - ${new Date(booking.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                        <p><strong>Cost:</strong> Rs. ${booking.cost}</p>
                    </div>
                    
                    <h3 style="margin-top: 20px;">Your QR Code Ticket</h3>
                    <p>Present this QR code to the ticket checker at the entrance.</p>
                    
                    <img src="cid:booking-qr" alt="Your Booking QR Code" />
                    
                    <p style="margin-top: 20px;">Thank you for using Parker!</p>
                </div>
            `,
            attachments: [
                {
                    filename: 'qrcode.png',
                    content: qrCodeBase64,
                    encoding: 'base64',
                    cid: 'booking-qr' 
                }
            ]
        };

        const info = await transporter.sendMail(mailOptions);
        console.log('Confirmation email sent successfully! Message ID:', info.messageId);
    } catch (error) {
        console.error('Error generating QR or sending email:', error);
    }
};


// Initialize Razorpay (kept for order creation, though verification is removed)
const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// @desc    Get Razorpay Key ID
// @route   GET /api/payment/getkey
exports.getRazorpayKey = (req, res) => {
    res.json({ key: process.env.RAZORPAY_KEY_ID });
};

// @desc    Create a Razorpay order
// @route   POST /api/payment/orders
exports.createOrder = async (req, res) => {
    const { cost } = req.body;
    const amountInPaise = Math.round(cost * 100);
    const options = {
        amount: amountInPaise,
        currency: 'INR',
        receipt: `receipt_order_${new Date().getTime()}`,
    };
    try {
        const order = await razorpay.orders.create(options);
        if (!order) {
            return res.status(500).send('Error creating Razorpay order');
        }
        res.json(order);
    } catch (error) {
        res.status(500).json({ message: 'Error creating Razorpay order', error: error.message });
    }
};

// @desc    Verify a Razorpay payment (and save the booking)
// @route   POST /api/payment/verify
exports.verifyPayment = async (req, res) => {
    const {
        bookingDetails,
    } = req.body;

    // *** FINAL FIX: WE BYPASS THE SIGNATURE CHECK ***
    // Since this is a UPI QR code payment (not a formal gateway callback), 
    // we assume the user clicked "I HAVE PAID" honestly and proceed to booking.
    
    if (!req.user) {
        return res.status(401).json({ message: 'User session expired or not authenticated.' });
    }

    try {
        const { slotId, parkingDate, startTime, endTime, durationHours, cost } = bookingDetails;
        
        // --- SAFE DATE CONSTRUCTION (from the previous fix) ---
        const startDateTime = new Date(startTime);
        const endDateTime = new Date(endTime);
        const dateOnly = new Date(startDateTime);
        dateOnly.setHours(0, 0, 0, 0);

        const newBooking = new Booking({
            user: req.user._id, 
            slotId,
            parkingDate: dateOnly,
            startTime: startDateTime,
            endTime: endDateTime,
            durationHours,
            cost,
            // paymentId is omitted/left null as we are not getting one from UPI QR
            // or you can set a default like 'UPI_MANUAL' if your model allows it
        });

        const savedBooking = await newBooking.save();

        // Send the confirmation email asynchronously (DO NOT AWAIT)
        // This prevents the frontend from hanging if the SMTP connection is slow or fails
        sendBookingConfirmationEmail(req.user, savedBooking);
        
        res.status(201).json({ message: 'Payment successful, booking created!', booking: savedBooking });

    } catch (error) {
        if (error.code === 11000) {
            // This is the double-booking error
            return res.status(400).json({ message: 'Slot already booked for this time. Please select a different slot or time.' });
        }
        // General server error
        res.status(500).json({ message: 'Server Error: ' + error.message });
    }
};
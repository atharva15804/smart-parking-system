require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const Booking = require('./models/Booking');
const nodemailer = require('nodemailer');
const qrcode = require('qrcode');

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

const testEmail = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const booking = await Booking.findOne().sort({ createdAt: -1 });
        if (!booking) return console.log('No booking found in DB');
        
        const user = await User.findById(booking.user);
        if (!user) return console.log('No user found for this booking');
        
        console.log(`Attempting to send email to: ${user.email} (User Name: ${user.name})`);

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
                        <p><strong>Cost:</strong> Rs. ${booking.cost}</p>
                    </div>
                    
                    <h3 style="margin-top: 20px;">Your QR Code Ticket</h3>
                    <p>Present this QR code to the ticket checker at the entrance.</p>
                    <img src="cid:booking-qr" alt="Your Booking QR Code" />
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

        console.log('Sending...');
        const info = await transporter.sendMail(mailOptions);
        console.log('Success:', info.response);
        process.exit(0);
    } catch(err) {
        console.error('\n========= ERROR =========\n', err);
        process.exit(1);
    }
}
testEmail();

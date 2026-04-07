import nodemailer from 'nodemailer';
import qrcode from 'qrcode';

// Vercel Serverless Function to handle email sending directly from frontend
export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method Not Allowed' });
    }

    const { user, booking } = req.body;

    if (!user || !booking) {
        return res.status(400).json({ message: 'Missing user or booking data' });
    }

    try {
        const transporter = nodemailer.createTransport({
            host: 'smtp.gmail.com',
            port: 587,
            secure: false, // true for 465, false for 587
            requireTLS: true,
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            },
        });

        // Generate QR code for the ticket
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
        return res.status(200).json({ success: true, messageId: info.messageId });

    } catch (error) {
        console.error('Error sending Vercel email:', error);
        return res.status(500).json({ error: error.message });
    }
}

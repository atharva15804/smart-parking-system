const nodemailer = require('nodemailer');
require('dotenv').config();

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER || 'atharvaghorpade95@gmail.com',
        pass: process.env.EMAIL_PASS || 'sjiagyyubxvzrbok'
    }
});

transporter.verify(function(error, success) {
    if (error) {
        console.log("Verify Error:", error);
    } else {
        console.log("Server is ready to take our messages");
    }
});

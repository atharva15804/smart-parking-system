const nodemailer = require('nodemailer');
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'atharvaghorpade95@gmail.com',
        pass: 'sjiagyyubxvzrbok'
    }
});

transporter.verify(function(error, success) {
    if (error) {
        console.log("Error:", error);
    } else {
        console.log("Server is ready to take our messages");
    }
});

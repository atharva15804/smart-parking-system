const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const qrcode = require('qrcode'); // for later use

// --- NODEMAILER TRANSPORTER ---
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// --- FRONTEND URL ---
const FRONTEND_URL = "http://localhost:5173";

// --- JWT GENERATOR ---
const generateToken = (id, expiresIn = '30d') => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'your_jwt_secret', { expiresIn });
};

// ======================== REGISTER ========================
const registerUser = async (req, res) => {
  const { name, email, password, phone, role } = req.body;
  try {
    const userExists = await User.findOne({ email });
    if (userExists) return res.status(400).json({ message: 'User already exists' });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({
      name,
      email,
      phone,
      password: hashedPassword,
      role: role || 'user',
    });

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: generateToken(user._id),
    });
  } catch (error) {
    res.status(500).json({ message: 'Server Error: ' + error.message });
  }
};

// ======================== LOGIN ========================
const loginUser = async (req, res) => {
  const { email, password } = req.body;
  try {
    if (!email || !password)
      return res.status(400).json({ message: 'Please provide both email and password' });

    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ message: 'Invalid credentials' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ message: 'Invalid credentials' });

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: generateToken(user._id),
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server Error: ' + error.message });
  }
};

// ======================== FORGOT PASSWORD ========================
const forgotPassword = async (req, res) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user)
      return res.status(200).json({ message: 'If user exists, reset link has been sent' });

    const resetToken = generateToken(user._id, '15m');
    const resetUrl = `${FRONTEND_URL}/reset-password/${resetToken}`;

    const mailOptions = {
      from: `Parker <${process.env.EMAIL_USER}>`,
      to: user.email,
      subject: 'Parker - Password Reset Request',
      html: `
        <p>You requested a password reset for your Parker account.</p>
        <p>Please click the link below to set a new password (valid for 15 minutes).</p>
        <a href="${resetUrl}" 
           style="background-color: #d9232d; color: white; padding: 10px 15px; text-decoration: none; border-radius: 4px;">
           Reset Password
        </a>
        <p>If you did not request this, please ignore this email.</p>
      `,
    };

    await transporter.sendMail(mailOptions);
    res.status(200).json({ message: 'Password reset link sent to your email' });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ message: 'Server Error: ' + error.message });
  }
};

// ======================== RESET PASSWORD ========================
const resetPassword = async (req, res) => {
  const { token } = req.params;
  const { newPassword } = req.body;
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret');
    const user = await User.findById(decoded.id);
    if (!user)
      return res.status(400).json({ message: 'Invalid token. User not found.' });

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    await user.save();

    res.json({ message: 'Password has been reset successfully!' });
  } catch (error) {
    res.status(401).json({ message: 'Invalid or expired reset token.' });
  }
};

// ✅ FIX: ensure all are exported
module.exports = {
  registerUser,
  loginUser,
  forgotPassword,
  resetPassword,
};

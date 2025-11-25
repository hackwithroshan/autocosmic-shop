
const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/User');
const { sendWelcomeEmail, sendPasswordResetEmail } = require('../utils/emailService');

const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET || 'your_default_jwt_secret';

// Helper to check if a user is admin
const isUserAdmin = (user) => {
    if (user.isAdmin === true) return true;
    if (!user.role) return false;
    const role = user.role.toLowerCase().trim();
    const adminRoles = ['super admin', 'manager', 'admin', 'administrator'];
    return adminRoles.includes(role);
};

// Register
router.post('/register', async (req, res) => {
  const { name, email, password } = req.body;
  try {
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    user = new User({
      name,
      email,
      password: hashedPassword,
    });

    await user.save();

    // Send Welcome Email from Backend
    sendWelcomeEmail(user).catch(err => console.error("Welcome email failed:", err));

    const isAdmin = isUserAdmin(user);

    const payload = {
      user: {
        id: user.id,
        isAdmin: isAdmin,
      },
    };

    jwt.sign(payload, JWT_SECRET, { expiresIn: '5h' }, (err, token) => {
      if (err) throw err;
      res.json({ 
          token, 
          user: {
              id: user.id, 
              name: user.name, 
              email: user.email, 
              isAdmin: isAdmin, 
              role: user.role,
              avatarUrl: user.avatarUrl
          } 
      });
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// Login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const isAdmin = isUserAdmin(user);

    const payload = {
      user: {
        id: user.id,
        isAdmin: isAdmin,
      },
    };

    jwt.sign(payload, JWT_SECRET, { expiresIn: '5h' }, (err, token) => {
      if (err) throw err;
      res.json({ 
          token, 
          user: {
              id: user.id, 
              name: user.name, 
              email: user.email, 
              isAdmin: isAdmin, 
              role: user.role,
              avatarUrl: user.avatarUrl
          } 
      });
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// 1. Forgot Password
router.post('/forgot-password', async (req, res) => {
    const { email } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: 'User with this email does not exist' });
        }

        const otp = crypto.randomInt(100000, 999999).toString();
        
        user.resetPasswordOtp = otp;
        user.resetPasswordExpires = Date.now() + 10 * 60 * 1000;

        await user.save();

        // Send OTP Email
        console.log(`Attempting to send OTP to ${email}...`);
        const emailResult = await sendPasswordResetEmail(email, otp);
        
        if (!emailResult.success) {
            console.error("Email sending failed:", emailResult.error);
            // 500 error will trigger the "Server error" message on frontend
            // We pass the specific error so the frontend can potentially show it
            return res.status(500).json({ 
                message: 'Failed to send email. Please contact support.', 
                details: emailResult.error 
            });
        }
        
        res.json({ message: 'OTP Sent to email' });

    } catch (err) {
        console.error("Forgot Password Error:", err);
        res.status(500).json({ message: 'Server error during password reset' });
    }
});

// 2. Reset Password
router.post('/reset-password', async (req, res) => {
    const { email, otp, newPassword } = req.body;
    try {
        const user = await User.findOne({ 
            email,
            resetPasswordOtp: otp,
            resetPasswordExpires: { $gt: Date.now() } 
        });

        if (!user) {
            return res.status(400).json({ message: 'Invalid or expired OTP' });
        }

        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(newPassword, salt);

        user.resetPasswordOtp = undefined;
        user.resetPasswordExpires = undefined;

        await user.save();

        res.json({ message: 'Password has been reset successfully' });

    } catch (err) {
        console.error("Reset Password Error:", err);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;

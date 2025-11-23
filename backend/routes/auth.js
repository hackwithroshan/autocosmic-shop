
const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/User');
const { sendWelcomeEmail, sendPasswordResetEmail } = require('../utils/emailService');

const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET || 'your_default_jwt_secret';

// Helper to check if a role is an admin role (Case Insensitive & Robust)
const isUserAdmin = (user) => {
    // 1. Check explicit boolean flag
    if (user.isAdmin === true) return true;
    
    // 2. Check role string
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

    // Send Welcome Email
    sendWelcomeEmail(user);

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
    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Robust Admin Check
    const isAdmin = isUserAdmin(user);

    // Create JWT Payload
    const payload = {
      user: {
        id: user.id,
        isAdmin: isAdmin, // embed computed admin status in token
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
              isAdmin: isAdmin, // Return computed admin status to frontend
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

// 1. Forgot Password - Generate OTP & Send Email
router.post('/forgot-password', async (req, res) => {
    const { email } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: 'User with this email does not exist' });
        }

        // Generate 6-digit OTP
        const otp = crypto.randomInt(100000, 999999).toString();
        
        // Set Expiry (10 minutes from now)
        user.resetPasswordOtp = otp;
        user.resetPasswordExpires = Date.now() + 10 * 60 * 1000;

        await user.save();

        // Send Email
        const result = await sendPasswordResetEmail(email, otp);

        // Pass back previewUrl if it exists (dev/test mode)
        res.json({ 
            message: 'OTP sent to your email',
            previewUrl: result?.previewUrl 
        });

    } catch (err) {
        console.error("Forgot Password Error:", err);
        res.status(500).json({ message: 'Server error' });
    }
});

// 2. Reset Password - Verify OTP & Update Password
router.post('/reset-password', async (req, res) => {
    const { email, otp, newPassword } = req.body;
    try {
        const user = await User.findOne({ 
            email,
            resetPasswordOtp: otp,
            resetPasswordExpires: { $gt: Date.now() } // Check if not expired
        });

        if (!user) {
            return res.status(400).json({ message: 'Invalid or expired OTP' });
        }

        // Hash new password
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(newPassword, salt);

        // Clear reset fields
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

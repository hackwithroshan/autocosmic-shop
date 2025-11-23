
const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

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

    // Determine admin status based on role if user provided one (usually not allowed in public register, but handled here for seeding/completeness)
    // Note: Public registration defaults to 'User' role in model
    
    await user.save();

    // Re-evaluate admin status after save (in case model hooks altered it)
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

module.exports = router;

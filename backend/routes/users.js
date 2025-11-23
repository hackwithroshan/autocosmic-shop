
const express = require('express');
const User = require('../models/User');
const Order = require('../models/Order');
const authMiddleware = require('../middleware/authMiddleware');
const router = express.Router();

// Get all users with calculated stats (Admin only)
router.get('/', authMiddleware(true), async (req, res) => {
  try {
    const users = await User.find().select('-password').lean();
    const orders = await Order.find({});

    // Map orders to users to calculate stats dynamically
    const usersWithStats = users.map(user => {
      const userOrders = orders.filter(order => order.userId && order.userId.toString() === user._id.toString());
      const totalOrders = userOrders.length;
      const totalSpent = userOrders.reduce((sum, order) => sum + order.total, 0);
      
      let segment = 'New';
      if (totalSpent > 1000) segment = 'VIP';
      else if (totalSpent > 500) segment = 'High-Value';
      else if (totalOrders > 1) segment = 'Returning';

      return {
        ...user,
        id: user._id, // Ensure ID is present for frontend
        totalOrders,
        totalSpent,
        segment
      };
    });

    res.json(usersWithStats);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server Error' });
  }
});

// Update User (Admin Only)
router.put('/:id', authMiddleware(true), async (req, res) => {
    try {
        const { name, email, role } = req.body;
        const updateData = {};
        if (name) updateData.name = name;
        if (email) updateData.email = email;
        if (role) updateData.role = role;

        const user = await User.findByIdAndUpdate(
            req.params.id, 
            updateData, 
            { new: true }
        ).select('-password');

        if (!user) return res.status(404).json({ message: 'User not found' });
        res.json(user);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Delete User (Admin Only)
router.delete('/:id', authMiddleware(true), async (req, res) => {
    try {
        const user = await User.findByIdAndDelete(req.params.id);
        if (!user) return res.status(404).json({ message: 'User not found' });
        
        // Optional: Delete user's orders or keep them? Keeping them for records usually better, but anonymizing might be needed.
        // For now, we just delete the user.
        res.json({ message: 'User deleted successfully' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;

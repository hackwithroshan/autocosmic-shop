
const express = require('express');
const Discount = require('../models/Discount');
const authMiddleware = require('../middleware/authMiddleware');
const router = express.Router();

// Get all discounts
router.get('/', authMiddleware(true), async (req, res) => {
  try {
    const discounts = await Discount.find().sort({ expiry: 1 });
    res.json(discounts);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Create discount
router.post('/', authMiddleware(true), async (req, res) => {
  try {
    const newDiscount = new Discount(req.body);
    const discount = await newDiscount.save();
    res.status(201).json(discount);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Delete discount
router.delete('/:id', authMiddleware(true), async (req, res) => {
  try {
    await Discount.findByIdAndDelete(req.params.id);
    res.json({ message: 'Discount deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;

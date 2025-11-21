
const express = require('express');
const Slide = require('../models/Slide');
const authMiddleware = require('../middleware/authMiddleware');
const router = express.Router();

// Get all slides (public)
router.get('/', async (req, res) => {
  try {
    const slides = await Slide.find().sort({ createdAt: 1 });
    res.json(slides);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server Error' });
  }
});

// Create a new slide (Admin only)
router.post('/', authMiddleware(true), async (req, res) => {
  try {
    const newSlide = new Slide(req.body);
    const slide = await newSlide.save();
    res.json(slide);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server Error' });
  }
});

// Update a slide (Admin only)
router.put('/:id', authMiddleware(true), async (req, res) => {
  try {
    const slide = await Slide.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!slide) return res.status(404).json({ message: 'Slide not found' });
    res.json(slide);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server Error' });
  }
});

// Delete a slide (Admin only)
router.delete('/:id', authMiddleware(true), async (req, res) => {
  try {
    const slide = await Slide.findByIdAndDelete(req.params.id);
    if (!slide) return res.status(404).json({ message: 'Slide not found' });
    res.json({ message: 'Slide removed' });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server Error' });
  }
});

module.exports = router;

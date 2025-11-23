const express = require('express');
const ShoppableVideo = require('../models/ShoppableVideo');
const Testimonial = require('../models/Testimonial');
const authMiddleware = require('../middleware/authMiddleware');
const router = express.Router();

// --- VIDEOS ---

// Get all videos
router.get('/videos', async (req, res) => {
  try {
    const videos = await ShoppableVideo.find().sort({ sortOrder: 1, createdAt: -1 });
    res.json(videos);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Create/Update Video (Admin)
router.post('/videos', authMiddleware(true), async (req, res) => {
  try {
    const newVideo = new ShoppableVideo(req.body);
    const saved = await newVideo.save();
    res.status(201).json(saved);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.delete('/videos/:id', authMiddleware(true), async (req, res) => {
  try {
    await ShoppableVideo.findByIdAndDelete(req.params.id);
    res.json({ message: 'Video deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// --- TESTIMONIALS ---

// Get all testimonials
router.get('/testimonials', async (req, res) => {
  try {
    const reviews = await Testimonial.find().sort({ createdAt: -1 });
    res.json(reviews);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Create Testimonial (Admin)
router.post('/testimonials', authMiddleware(true), async (req, res) => {
  try {
    const newReview = new Testimonial(req.body);
    const saved = await newReview.save();
    res.status(201).json(saved);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.delete('/testimonials/:id', authMiddleware(true), async (req, res) => {
  try {
    await Testimonial.findByIdAndDelete(req.params.id);
    res.json({ message: 'Review deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
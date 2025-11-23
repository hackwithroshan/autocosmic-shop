
const express = require('express');
const Media = require('../models/Media');
const authMiddleware = require('../middleware/authMiddleware');
const router = express.Router();

// Get all media
router.get('/', authMiddleware(true), async (req, res) => {
  try {
    const media = await Media.find().sort({ createdAt: -1 });
    res.json(media);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Save new media (metadata only, file is on Cloudinary)
router.post('/', authMiddleware(true), async (req, res) => {
  try {
    const newMedia = new Media(req.body);
    const savedMedia = await newMedia.save();
    res.status(201).json(savedMedia);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Delete media from DB (Note: Does not delete from Cloudinary without Admin Secret)
router.delete('/:id', authMiddleware(true), async (req, res) => {
  try {
    await Media.findByIdAndDelete(req.params.id);
    res.json({ message: 'Media removed from database' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;

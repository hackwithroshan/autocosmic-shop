
const express = require('express');
const Collection = require('../models/Collection');
const authMiddleware = require('../middleware/authMiddleware');
const router = express.Router();

// Get all collections
router.get('/', async (req, res) => {
  try {
    const collections = await Collection.find({ isActive: true })
      .sort({ sortOrder: 1, createdAt: -1 })
      .populate('products');
    res.json(collections);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get all collections (Admin - includes inactive)
router.get('/admin', authMiddleware(true), async (req, res) => {
  try {
    const collections = await Collection.find()
      .sort({ sortOrder: 1, createdAt: -1 })
      .populate('products');
    res.json(collections);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get single collection
router.get('/:id', async (req, res) => {
  try {
    const collection = await Collection.findById(req.params.id).populate('products');
    if (!collection) return res.status(404).json({ message: 'Collection not found' });
    res.json(collection);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Create Collection
router.post('/', authMiddleware(true), async (req, res) => {
  try {
    const newCollection = new Collection(req.body);
    const saved = await newCollection.save();
    res.status(201).json(saved);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Update Collection
router.put('/:id', authMiddleware(true), async (req, res) => {
  try {
    const updated = await Collection.findByIdAndUpdate(req.params.id, req.body, { new: true }).populate('products');
    if (!updated) return res.status(404).json({ message: 'Collection not found' });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Delete Collection
router.delete('/:id', authMiddleware(true), async (req, res) => {
  try {
    await Collection.findByIdAndDelete(req.params.id);
    res.json({ message: 'Collection deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;

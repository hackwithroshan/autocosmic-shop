
const express = require('express');
const Page = require('../models/Page');
const authMiddleware = require('../middleware/authMiddleware');
const router = express.Router();

// Get all pages (Public, optionally filtered)
router.get('/', async (req, res) => {
  try {
    const query = req.query.admin ? {} : { status: 'Published' };
    const pages = await Page.find(query).sort({ title: 1 });
    res.json(pages);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get single page by slug (Public)
router.get('/:slug', async (req, res) => {
  try {
    // Only show published pages to public
    const query = { slug: req.params.slug, status: 'Published' };
    
    // Note: If we wanted admin preview, we'd check a token here, but keeping it simple for now
    
    const page = await Page.findOne(query);
    if (!page) return res.status(404).json({ message: 'Page not found' });
    res.json(page);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Create Page (Admin)
router.post('/', authMiddleware(true), async (req, res) => {
  try {
    const newPage = new Page(req.body);
    const savedPage = await newPage.save();
    res.status(201).json(savedPage);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Update Page (Admin)
router.put('/:id', authMiddleware(true), async (req, res) => {
  try {
    const updatedPage = await Page.findByIdAndUpdate(
        req.params.id, 
        { ...req.body, updatedAt: Date.now() }, 
        { new: true }
    );
    if (!updatedPage) return res.status(404).json({ message: 'Page not found' });
    res.json(updatedPage);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Delete Page (Admin)
router.delete('/:id', authMiddleware(true), async (req, res) => {
  try {
    await Page.findByIdAndDelete(req.params.id);
    res.json({ message: 'Page deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;

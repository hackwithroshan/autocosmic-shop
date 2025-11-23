
const express = require('express');
const Product = require('../models/Product');
const Category = require('../models/Category');
const authMiddleware = require('../middleware/authMiddleware');
const router = express.Router();

// Get all products
router.get('/', async (req, res) => {
  try {
    const products = await Product.find();
    res.json(products);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server Error' });
  }
});

// Get all categories
router.get('/categories', async (req, res) => {
  try {
    const categories = await Category.find();
    res.json(categories);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server Error' });
  }
});

// Create a category (Admin only)
router.post('/categories', authMiddleware(true), async (req, res) => {
  try {
    const { name } = req.body;
    // Create a simple slug-like ID
    const id = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    
    let category = await Category.findOne({ id });
    if (category) {
        return res.status(400).json({ message: 'Category already exists' });
    }

    const newCategory = new Category({
        name,
        id,
        subcategories: []
    });
    await newCategory.save();
    res.json(newCategory);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server Error' });
  }
});

// Update a category (Admin only)
router.put('/categories/:id', authMiddleware(true), async (req, res) => {
  try {
    const { name } = req.body;
    const category = await Category.findOneAndUpdate(
      { id: req.params.id }, 
      { name }, 
      { new: true }
    );
    if (!category) return res.status(404).json({ message: 'Category not found' });
    res.json(category);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server Error' });
  }
});

// Delete a category (Admin only)
router.delete('/categories/:id', authMiddleware(true), async (req, res) => {
  try {
    const category = await Category.findOneAndDelete({ id: req.params.id });
    if (!category) return res.status(404).json({ message: 'Category not found' });
    res.json({ message: 'Category removed' });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server Error' });
  }
});

// Create a product (Admin only)
router.post('/', authMiddleware(true), async (req, res) => {
  try {
    const newProduct = new Product(req.body);
    const product = await newProduct.save();
    res.status(201).json(product);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server Error' });
  }
});

// Update a product (Admin only)
router.put('/:id', authMiddleware(true), async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json(product);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server Error' });
  }
});

// Delete a product (Admin only)
router.delete('/:id', authMiddleware(true), async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json({ message: 'Product removed' });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server Error' });
  }
});


module.exports = router;

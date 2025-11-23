
const express = require('express');
const Product = require('../models/Product');
const router = express.Router();

// Get Facebook Product Feed (CSV/XML)
// Access at: /api/feed/facebook.csv or /api/feed/facebook.xml
router.get('/facebook.csv', async (req, res) => {
  try {
    const products = await Product.find({ status: 'Active' });
    
    // CSV Header
    let csv = 'id,title,description,availability,condition,price,link,image_link,brand\n';
    
    // Base URL needed for links (You should set this in env vars in real deployment)
    // For now, using a placeholder or grabbing from request host if possible, or user must set it
    const baseUrl = process.env.FRONTEND_URL || `https://${req.get('host')}`; 

    products.forEach(product => {
      const id = product._id;
      const title = `"${product.name.replace(/"/g, '""')}"`; // Escape quotes
      const description = `"${product.description.replace(/"/g, '""').replace(/\n/g, ' ')}"`;
      const availability = product.stock > 0 ? 'in stock' : 'out of stock';
      const condition = 'new';
      const price = `${product.price} INR`;
      const link = `${baseUrl}/product/${product._id}`; // Direct link to product
      const image_link = product.imageUrl;
      const brand = product.brand ? `"${product.brand}"` : "Ladies Smart Choice";

      csv += `${id},${title},${description},${availability},${condition},${price},${link},${image_link},${brand}\n`;
    });

    res.header('Content-Type', 'text/csv');
    res.attachment('facebook_product_feed.csv');
    return res.send(csv);

  } catch (err) {
    console.error(err);
    res.status(500).send('Error generating feed');
  }
});

module.exports = router;

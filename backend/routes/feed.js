const express = require('express');
const Product = require('../models/Product');
const router = express.Router();

// Get Facebook Product Feed (CSV)
router.get('/facebook.csv', async (req, res) => {
  try {
    const products = await Product.find({ status: 'Active' });
    
    let csv = 'id,title,description,availability,condition,price,link,image_link,brand\n';
    
    const baseUrl = process.env.FRONTEND_URL || `https://${req.get('host')}`; 

    products.forEach(product => {
      const id = product._id;
      const title = `"${product.name.replace(/"/g, '""')}"`;
      const description = `"${(product.shortDescription || product.description).replace(/"/g, '""').replace(/\n/g, ' ')}"`;
      const availability = product.stock > 0 ? 'in stock' : 'out of stock';
      const condition = 'new';
      const price = `${product.price} INR`;
      const link = `${baseUrl}/product/${product._id}`;
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

// --- NEW: Google Shopping Feed (XML) ---
router.get('/google.xml', async (req, res) => {
    try {
        const products = await Product.find({ status: 'Active' });
        const baseUrl = process.env.FRONTEND_URL || `https://${req.get('host')}`;

        const escapeXML = (str) => {
            return str.replace(/[<>&'"]/g, (c) => {
                switch (c) {
                    case '<': return '&lt;';
                    case '>': return '&gt;';
                    case '&': return '&amp;';
                    case '\'': return '&apos;';
                    case '"': return '&quot;';
                }
                return c;
            });
        };

        let xml = `<?xml version="1.0"?>
<rss xmlns:g="http://base.google.com/ns/1.0" version="2.0">
<channel>
<title>Ladies Smart Choice Product Feed</title>
<link>${baseUrl}</link>
<description>Product feed for Google Shopping.</description>
`;

        products.forEach(product => {
            xml += `
<item>
    <g:id>${product._id}</g:id>
    <g:title>${escapeXML(product.name)}</g:title>
    <g:description>${escapeXML(product.shortDescription || product.description)}</g:description>
    <g:link>${baseUrl}/product/${product._id}</g:link>
    <g:image_link>${escapeXML(product.imageUrl)}</g:image_link>
    <g:availability>${product.stock > 0 ? 'in stock' : 'out of stock'}</g:availability>
    <g:price>${product.price} INR</g:price>
    <g:brand>${escapeXML(product.brand || 'Ladies Smart Choice')}</g:brand>
    <g:condition>new</g:condition>
    ${product.barcode ? `<g:gtin>${escapeXML(product.barcode)}</g:gtin>` : ''}
</item>
`;
        });

        xml += `
</channel>
</rss>`;

        res.header('Content-Type', 'application/xml');
        res.send(xml);

    } catch (err) {
        console.error(err);
        res.status(500).send('Error generating Google feed');
    }
});


module.exports = router;
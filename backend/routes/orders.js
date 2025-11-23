
const express = require('express');
const Order = require('../models/Order');
const authMiddleware = require('../middleware/authMiddleware');
const router = express.Router();

// Get all orders (Admin only) - Populated
router.get('/', authMiddleware(true), async (req, res) => {
  try {
    const orders = await Order.find()
        .sort({ date: -1 })
        .populate('items.productId', 'name imageUrl price sku'); // Populate product info
    res.json(orders);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server Error' });
  }
});

// Update an order (Admin only)
router.put('/:id', authMiddleware(true), async (req, res) => {
    try {
        const order = await Order.findByIdAndUpdate(
            req.params.id, 
            req.body, 
            { new: true }
        ).populate('items.productId', 'name imageUrl price sku');

        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }
        res.json(order);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ message: 'Server Error' });
    }
});

// Get orders for the logged-in user
router.get('/my-orders', authMiddleware(), async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.user.id })
        .sort({ date: -1 })
        .populate('items.productId', 'name imageUrl');
    res.json(orders);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server Error' });
  }
});

// Create a new order
router.post('/', async (req, res) => {
  const { items, total, customerName, customerEmail, customerPhone, shippingAddress, userId } = req.body;

  if (!items || items.length === 0) {
    return res.status(400).json({ message: 'No items in order' });
  }

  try {
    const newOrder = new Order({
      userId: userId || null, // Optional for guest checkout
      customerName,
      customerEmail,
      customerPhone,
      shippingAddress,
      items: items.map(item => ({
        productId: item.id,
        quantity: item.quantity
      })),
      total,
      status: 'Pending'
    });

    const savedOrder = await newOrder.save();
    res.status(201).json(savedOrder);
  } catch (err) {
    console.error("Error creating order:", err);
    res.status(500).json({ message: 'Failed to create order' });
  }
});

module.exports = router;

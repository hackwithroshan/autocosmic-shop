
const express = require('express');
const Order = require('../models/Order');
const Product = require('../models/Product');
const User = require('../models/User'); // Import User model
const authMiddleware = require('../middleware/authMiddleware');
const crypto = require('crypto');
const bcrypt = require('bcryptjs'); // Import bcrypt for password hashing
// const { sendOrderConfirmation } = require('../utils/emailService'); // REMOVED: Using Vercel for emails
const router = express.Router();

// Initialize Razorpay
// We use the keys provided by the user as fallback if process.env is not set
const RAZORPAY_KEY_ID = process.env.RAZORPAY_KEY_ID || 'rzp_test_RQTvH0CUj36MkY';
const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET || 'JBTBuMVLAChX2Da7wINyZj9L';

let razorpayInstance = null;
try {
    const Razorpay = require('razorpay');
    razorpayInstance = new Razorpay({
        key_id: RAZORPAY_KEY_ID,
        key_secret: RAZORPAY_KEY_SECRET
    });
    console.log("Razorpay Initialized with Key ID:", RAZORPAY_KEY_ID);
} catch (error) {
    console.warn("⚠️ Warning: 'razorpay' module not found or initialization failed.");
}

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

// Resend Order Email (Admin Only) - Kept for manual admin triggers if needed via backend logic in future
router.post('/:id/resend-email', authMiddleware(true), async (req, res) => {
    // Currently disabled on backend side to enforce Vercel usage logic
    // In a full migration, this would call an external service or be removed.
    res.status(200).json({ message: 'Email sending is handled by Frontend/Vercel.' });
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

// --- RAZORPAY ROUTES ---

// 1. Create Razorpay Order (Pre-payment)
router.post('/razorpay-order', async (req, res) => {
    if (!razorpayInstance) {
        return res.status(500).json({ message: "Payment gateway not initialized. Contact admin." });
    }

    try {
        const { amount, currency } = req.body;
        
        const options = {
            amount: Math.round(amount * 100), // Amount in paise (must be integer)
            currency: currency || "INR",
            receipt: `receipt_${Date.now()}`,
        };

        const order = await razorpayInstance.orders.create(options);

        // Return order details and the PUBLIC key_id so frontend can use it
        res.json({
            order_id: order.id,
            amount: order.amount,
            currency: order.currency,
            key_id: RAZORPAY_KEY_ID
        });
    } catch (error) {
        console.error("Razorpay Order Creation Failed:", error);
        res.status(500).json({ message: "Could not create payment order", error: error.message });
    }
});

// 2. Create/Save Order (Post-payment Verification) & Guest Checkout Handling
router.post('/', async (req, res) => {
  const { items, total, customerName, customerEmail, customerPhone, shippingAddress, userId, paymentInfo } = req.body;

  if (!items || items.length === 0) {
    return res.status(400).json({ message: 'No items in order' });
  }

  let orderStatus = 'Pending';

  // Verify Payment if paymentInfo is provided (Razorpay flow)
  if (paymentInfo && razorpayInstance) {
      const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = paymentInfo;
      
      const generated_signature = crypto
        .createHmac('sha256', RAZORPAY_KEY_SECRET)
        .update(razorpay_order_id + "|" + razorpay_payment_id)
        .digest('hex');

      if (generated_signature === razorpay_signature) {
          orderStatus = 'Processing'; // Payment Verified
      } else {
          console.error("Signature Mismatch: ", generated_signature, " vs ", razorpay_signature);
          return res.status(400).json({ message: 'Payment verification failed. Invalid signature.' });
      }
  }

  let finalUserId = userId;
  let accountCreated = false;
  let passwordUsed = null;

  try {
    // --- Automatic Account Creation Logic ---
    // If user was not logged in (no userId), check if email exists.
    if (!finalUserId && customerEmail) {
        let user = await User.findOne({ email: customerEmail });
        
        if (!user) {
            // Create new user
            // Default password is the mobile number provided
            if (customerPhone) {
                passwordUsed = customerPhone;
                const salt = await bcrypt.genSalt(10);
                const hashedPassword = await bcrypt.hash(passwordUsed, salt);

                user = new User({
                    name: customerName,
                    email: customerEmail,
                    password: hashedPassword,
                    role: 'User'
                });

                await user.save();
                finalUserId = user._id;
                accountCreated = true;
                console.log(`Auto-created account for ${customerEmail}`);
            }
        } else {
            // Link to existing user
            finalUserId = user._id;
        }
    }

    const newOrder = new Order({
      userId: finalUserId || null,
      customerName,
      customerEmail,
      customerPhone,
      shippingAddress,
      items: items.map(item => ({
        productId: item.id,
        quantity: item.quantity
      })),
      total,
      status: orderStatus,
      // paymentDetails: paymentInfo 
    });

    const savedOrder = await newOrder.save();

    // NOTE: We removed sendOrderConfirmation() from here.
    // The Frontend will handle sending the email via Vercel API.

    res.status(201).json({ 
        ...savedOrder.toJSON(), 
        accountCreated: accountCreated,
        passwordUsed: passwordUsed // Send back password so frontend can include in email
    });

  } catch (err) {
    console.error("Error creating order:", err);
    res.status(500).json({ message: 'Failed to create order' });
  }
});

module.exports = router;

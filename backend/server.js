
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const productRoutes = require('./routes/products');
const orderRoutes = require('./routes/orders');
const userRoutes = require('./routes/users');
const settingsRoutes = require('./routes/settings');
const slideRoutes = require('./routes/slides');
const campaignRoutes = require('./routes/campaigns');
const discountRoutes = require('./routes/discounts');
const mediaRoutes = require('./routes/media');
const blogRoutes = require('./routes/blogs');
const pageRoutes = require('./routes/pages');
const seedDatabase = require('./seed');

const app = express();
const PORT = process.env.PORT || 5001;

// Middleware

// --- CORS Configuration ---
// FIXED: When using origin: '*', credentials must be false.
// Since we use Bearer Tokens (Headers) and not Cookies, credentials: false is the correct setting.
const corsOptions = {
    origin: '*', 
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    allowedHeaders: ['Content-Type', 'Authorization'],
    preflightContinue: false,
    optionsSuccessStatus: 204,
    credentials: false // Must be false if origin is '*'
};

app.use(cors(corsOptions));

// Explicitly handle OPTIONS for preflight checks
app.options('*', cors(corsOptions));

app.use(express.json());

// --- Request Logger ---
// This helps us see in Railway logs if the request is even reaching the server
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// --- MongoDB Connection ---
// Support MONGO_URI (Standard) or DATABASE_URL (Railway default)
const MONGO_URI = process.env.MONGO_URI || process.env.DATABASE_URL || 'mongodb://localhost:27017/autocosmic';

const connectDB = async () => {
  try {
    await mongoose.connect(MONGO_URI, {
      serverSelectionTimeoutMS: 5000 // Timeout after 5s instead of 30s to show errors faster
    });
    console.log('MongoDB Connected Successfully');
  } catch (err) {
    console.error('MongoDB Connection Failed:', err.message);
    
    // Check for specific IP Whitelist error from Atlas
    if (err.message.includes('whitelisted') || err.message.includes('Could not connect to any servers')) {
        console.log('\n\x1b[33m%s\x1b[0m', '⚠️  CONNECTION ERROR DETECTED: IP Whitelist Issue');
        console.log('\x1b[33m%s\x1b[0m', '---------------------------------------------------');
        console.log('\x1b[33m%s\x1b[0m', 'Your IP address is being blocked by MongoDB Atlas.');
        console.log('\x1b[33m%s\x1b[0m', 'HOW TO FIX:');
        console.log('\x1b[33m%s\x1b[0m', '1. Go to your MongoDB Atlas Dashboard (cloud.mongodb.com).');
        console.log('\x1b[33m%s\x1b[0m', '2. Click on "Network Access" in the left sidebar.');
        console.log('\x1b[33m%s\x1b[0m', '3. Click "Add IP Address".');
        console.log('\x1b[33m%s\x1b[0m', '4. Select "Add Current IP Address" (for local) or "Allow Access from Anywhere" (0.0.0.0/0).');
        console.log('\x1b[33m%s\x1b[0m', '5. Click Confirm and wait 1 minute.');
        console.log('\x1b[33m%s\x1b[0m', '---------------------------------------------------\n');
    }
  }
};

// Connect to DB
connectDB();

// --- API Routes ---
app.get('/', (req, res) => {
  res.send('AutoCosmic Backend Server is Running. Access API at /api');
});

// Health Check Route (Useful for debugging)
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'Backend is reachable' });
});

app.get('/api', (req, res) => {
  res.json({ message: 'Welcome to the AutoCosmic Backend API!' });
});

// Seeding Endpoint
app.get('/api/seed', async (req, res) => {
    try {
        await seedDatabase();
        res.json({ message: 'Database seeded successfully!' });
    } catch (error) {
        res.status(500).json({ message: 'Seeding failed', error: error.message });
    }
});

app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/users', userRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/slides', slideRoutes);
app.use('/api/campaigns', campaignRoutes);
app.use('/api/discounts', discountRoutes);
app.use('/api/media', mediaRoutes);
app.use('/api/blogs', blogRoutes);
app.use('/api/pages', pageRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!', error: err.message });
});

// Start Server
// Listen on 0.0.0.0 to accept connections from outside the container
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server is running on port ${PORT}`);
});

module.exports = app;


const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

// --- GLOBAL ERROR HANDLERS (Prevent Crash) ---
process.on('uncaughtException', (err) => {
  console.error('🚨 UNCAUGHT EXCEPTION:', err);
  // Keep running if possible, but log it critical
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('🚨 UNHANDLED REJECTION:', reason);
});

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
const contentRoutes = require('./routes/content');
const collectionRoutes = require('./routes/collections');
const feedRoutes = require('./routes/feed'); 
const seedDatabase = require('./seed');

const app = express();
const PORT = process.env.PORT || 5001;

// --- HEALTH CHECK (CRITICAL FOR RAILWAY) ---
// Defined immediately to ensure Railway gets a 200 OK instantly
app.get('/', (req, res) => {
  res.status(200).send('AutoCosmic Backend Server is Running.');
});

app.get('/api/health', (req, res) => {
  res.status(200).json({ 
      status: 'ok', 
      message: 'Backend is reachable', 
      dbState: mongoose.connection.readyState,
      uptime: process.uptime()
  });
});

// Middleware
const corsOptions = {
    origin: '*', 
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    allowedHeaders: ['Content-Type', 'Authorization'],
    preflightContinue: false,
    optionsSuccessStatus: 204,
    credentials: false 
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));
app.use(express.json());

app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// --- API Routes ---
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
app.use('/api/content', contentRoutes);
app.use('/api/collections', collectionRoutes);
app.use('/api/feed', feedRoutes);

// Error Handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!', error: err.message });
});

// --- Start Server & Connect DB ---
// 1. Start Listening immediately to pass Railway Health Check
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Server is listening on port ${PORT}`);
  console.log("--- DIAGNOSTICS ---");
  console.log(`NODE_ENV: ${process.env.NODE_ENV}`);
  console.log(`FRONTEND_URL: ${process.env.FRONTEND_URL || "MISSING (Email triggers will fail)"}`);
  console.log("-------------------");
});

// 2. Configure Keep-Alive to prevent Railway 502 Errors
server.keepAliveTimeout = 120 * 1000;
server.headersTimeout = 120 * 1000;

// 3. Connect to MongoDB in background
const MONGO_URI = process.env.MONGO_URI || process.env.DATABASE_URL || 'mongodb://localhost:27017/autocosmic';

// Log masked URI for debugging
const maskedURI = MONGO_URI.replace(/:([^:@]+)@/, ':****@');
console.log(`Connecting to MongoDB: ${maskedURI}`);

mongoose.connect(MONGO_URI, {
  serverSelectionTimeoutMS: 5000
})
.then(() => console.log('✅ MongoDB Connected Successfully'))
.catch(err => {
    console.error('❌ MongoDB Connection Failed:', err.message);
    // Do not exit process, let the server stay alive for health checks
});

module.exports = app;

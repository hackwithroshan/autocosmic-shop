
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
const seedDatabase = require('./seed');

const app = express();
const PORT = process.env.PORT || 5001;

// Middleware
app.use(cors());
app.use(express.json());

// --- MongoDB Connection (Serverless Optimized) ---
// Use env variable for connection string
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/autocosmic';

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

async function connectDB() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
    };

    cached.promise = mongoose.connect(MONGO_URI, opts).then((mongoose) => {
      return mongoose;
    });
  }
  
  try {
    cached.conn = await cached.promise;
    console.log('MongoDB Connected');
  } catch (e) {
    cached.promise = null;
    throw e;
  }

  return cached.conn;
}

// --- Vercel Middleware for DB Connection ---
// Important: Await DB connection inside the request loop for serverless reliability
app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (error) {
    console.error("Database connection failed:", error);
    res.status(500).json({ message: "Database connection failed", error: error.message });
  }
});

// --- API Routes ---
app.get('/api', (req, res) => {
  res.json({ message: 'Welcome to the AutoCosmic Backend API!' });
});

// Seeding Route (Run this once after deployment)
app.get('/api/seed', async (req, res) => {
  try {
    // Ensure connection is established (handled by middleware, but safe to call again)
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

// Error handling middleware for JSON errors
app.use((err, req, res, next) => {
  console.error(err.stack);
  // Ensure we always return JSON, preventing "Unexpected token S" on frontend
  res.status(500).json({ message: 'Something went wrong!', error: err.message });
});

// --- Start Server (Only if running directly) ---
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
  });
}

// Export the app for Vercel
module.exports = app;

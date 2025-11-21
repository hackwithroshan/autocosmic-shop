
const seedDatabase = require('../backend/seed.js');
const mongoose = require('mongoose');
require('dotenv').config();

// Ensure DB connection for the seed script
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/autocosmic';

let cached = global.mongoose;
if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

async function connectDB() {
  if (cached.conn) return cached.conn;
  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGO_URI, { bufferCommands: false }).then((mongoose) => mongoose);
  }
  cached.conn = await cached.promise;
  return cached.conn;
}

module.exports = async (req, res) => {
  try {
    await connectDB();
    await seedDatabase();
    res.json({ message: 'Database seeded successfully!' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Seeding failed', error: error.message });
  }
};


const mongoose = require('mongoose');

const TargetSchema = new mongoose.Schema({
  type: { type: String, enum: ['product', 'category', 'custom'], required: true },
  id: { type: String, required: true }, // Product ID, Collection ID, or URL path
  name: { type: String, required: true } // Display name for the target
}, { _id: false });

const ShoppableVideoSchema = new mongoose.Schema({
  title: { type: String, required: true },
  videoUrl: { type: String, required: true },
  thumbnailUrl: { type: String }, // Optional custom poster
  price: { type: String }, // Display price e.g., "₹1,499"
  
  // Legacy field (kept for backward compatibility if needed, but targets is preferred)
  productLink: { type: String }, 
  
  // New Multi-Targeting System
  targets: [TargetSchema], 

  sortOrder: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now }
});

ShoppableVideoSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: function (doc, ret) { delete ret._id }
});

module.exports = mongoose.model('ShoppableVideo', ShoppableVideoSchema);

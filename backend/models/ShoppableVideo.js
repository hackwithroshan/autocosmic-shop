const mongoose = require('mongoose');

const ShoppableVideoSchema = new mongoose.Schema({
  title: { type: String, required: true },
  videoUrl: { type: String, required: true },
  thumbnailUrl: { type: String, required: true },
  price: { type: String }, // Display price e.g., "₹1,499"
  productLink: { type: String }, // Link to product page
  sortOrder: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now }
});

ShoppableVideoSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: function (doc, ret) { delete ret._id }
});

module.exports = mongoose.model('ShoppableVideo', ShoppableVideoSchema);

const mongoose = require('mongoose');

const SlideSchema = new mongoose.Schema({
  imageUrl: { type: String, required: true },
  title: { type: String, required: true },
  subtitle: { type: String, required: true },
  buttonText: { type: String, required: true },
  createdAt: { type: Date, default: Date.now } // Optional: for sorting
});

module.exports = mongoose.model('Slide', SlideSchema);

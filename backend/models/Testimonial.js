const mongoose = require('mongoose');

const TestimonialSchema = new mongoose.Schema({
  name: { type: String, required: true },
  role: { type: String, default: 'Verified Buyer' },
  comment: { type: String, required: true },
  rating: { type: Number, default: 5 },
  imageUrl: { type: String },
  createdAt: { type: Date, default: Date.now }
});

TestimonialSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: function (doc, ret) { delete ret._id }
});

module.exports = mongoose.model('Testimonial', TestimonialSchema);

const mongoose = require('mongoose');

const DiscountSchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true },
  type: { type: String, enum: ['Percentage', 'Flat', 'Free Shipping'], required: true },
  value: { type: Number, default: 0 },
  usageCount: { type: Number, default: 0 },
  maxUsage: { type: Number, default: 1000 },
  expiry: { type: Date, required: true },
});

DiscountSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: function (doc, ret) { delete ret._id }
});

module.exports = mongoose.model('Discount', DiscountSchema);

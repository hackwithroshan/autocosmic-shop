
const mongoose = require('mongoose');

const PageSchema = new mongoose.Schema({
  title: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  content: { type: String, required: true },
  status: { type: String, enum: ['Published', 'Hidden'], default: 'Hidden' },
  updatedAt: { type: Date, default: Date.now }
});

PageSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: function (doc, ret) { delete ret._id }
});

module.exports = mongoose.model('Page', PageSchema);

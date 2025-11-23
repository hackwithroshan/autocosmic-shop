
const mongoose = require('mongoose');

const BlogSchema = new mongoose.Schema({
  title: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  content: { type: String, required: true },
  excerpt: { type: String },
  imageUrl: { type: String },
  author: { type: String, default: 'Admin' },
  status: { type: String, enum: ['Published', 'Draft'], default: 'Draft' },
  createdAt: { type: Date, default: Date.now }
});

BlogSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: function (doc, ret) { delete ret._id }
});

module.exports = mongoose.model('Blog', BlogSchema);

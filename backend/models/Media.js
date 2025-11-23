
const mongoose = require('mongoose');

const MediaSchema = new mongoose.Schema({
  url: { type: String, required: true },
  public_id: { type: String, required: true },
  format: { type: String },
  type: { type: String, enum: ['image', 'video'], default: 'image' },
  createdAt: { type: Date, default: Date.now }
});

MediaSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: function (doc, ret) { delete ret._id }
});

module.exports = mongoose.model('Media', MediaSchema);

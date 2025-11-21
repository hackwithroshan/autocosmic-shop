const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
  name: { type: String, required: true },
  category: { type: String, required: true },
  price: { type: Number, required: true },
  stock: { type: Number, required: true },
  imageUrl: { type: String, required: true },
  description: { type: String, required: true },
});

// To use the 'id' virtual field provided by Mongoose instead of '_id'
ProductSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: function (doc, ret) { delete ret._id }
});

module.exports = mongoose.model('Product', ProductSchema);

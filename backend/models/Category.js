const mongoose = require('mongoose');

const SubcategorySchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
});

const CategorySchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  subcategories: [SubcategorySchema],
});

module.exports = mongoose.model('Category', CategorySchema);

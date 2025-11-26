
const mongoose = require('mongoose');

const VariantOptionSchema = new mongoose.Schema({
  value: { type: String, required: true },
  price: { type: Number },
  stock: { type: Number },
  image: { type: String }
});

const VariantSchema = new mongoose.Schema({
  name: { type: String, required: true }, // e.g., Size, Color
  options: [VariantOptionSchema]
});

const ReviewSchema = new mongoose.Schema({
  name: { type: String, required: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  comment: { type: String, required: true },
  date: { type: Date, default: Date.now }
});

const ProductSchema = new mongoose.Schema({
  // Basic
  name: { type: String, required: true },
  slug: { type: String, unique: true, index: true },
  description: { type: String, required: true },
  shortDescription: { type: String },
  brand: { type: String },
  sku: { type: String },
  barcode: { type: String },

  // Organization
  category: { type: String, required: true },
  subCategory: { type: String },
  tags: [{ type: String }],
  status: { 
    type: String, 
    enum: ['Active', 'Draft', 'Archived'], 
    default: 'Active' 
  },

  // Pricing
  price: { type: Number, required: true },
  mrp: { type: Number },
  costPrice: { type: Number },
  taxRate: { type: Number },

  // Inventory
  stock: { type: Number, required: true },
  lowStockThreshold: { type: Number },
  allowBackorders: { type: Boolean, default: false },

  // Media
  imageUrl: { type: String, required: true }, // Main
  galleryImages: [{ type: String }], // Additional
  videoUrl: { type: String },

  // Shipping
  weight: { type: Number },
  dimensions: {
    length: { type: Number },
    width: { type: Number },
    height: { type: Number },
  },

  // SEO
  seoTitle: { type: String },
  seoDescription: { type: String },
  seoKeywords: [{ type: String }],

  // Variants
  hasVariants: { type: Boolean, default: false },
  variants: [VariantSchema],

  // Reviews
  reviews: [ReviewSchema],

  createdAt: { type: Date, default: Date.now }
});

// Pre-save hook to generate slug automatically
ProductSchema.pre('save', async function(next) {
  if (this.isModified('name') || !this.slug) {
    let slug = this.name.toLowerCase()
      .replace(/&/g, 'and')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');

    // Ensure slug is unique
    let existingProduct = await mongoose.model('Product').findOne({ slug: slug, _id: { $ne: this._id } });
    let count = 0;
    while (existingProduct) {
      count++;
      slug = `${slug}-${count}`;
      existingProduct = await mongoose.model('Product').findOne({ slug: slug, _id: { $ne: this._id } });
    }
    this.slug = slug;
  }
  next();
});

// To use the 'id' virtual field provided by Mongoose instead of '_id'
ProductSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: function (doc, ret) { delete ret._id }
});

module.exports = mongoose.model('Product', ProductSchema);
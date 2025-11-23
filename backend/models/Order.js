
const mongoose = require('mongoose');

const OrderItemSchema = new mongoose.Schema({
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  quantity: { type: Number, required: true },
});

const OrderSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // Optional
  customerName: { type: String, required: true },
  customerEmail: { type: String, required: true },
  customerPhone: { type: String },
  shippingAddress: {
    address: { type: String },
    city: { type: String },
    postalCode: { type: String },
    country: { type: String },
  },
  trackingInfo: {
    carrier: { type: String },
    trackingNumber: { type: String },
  },
  date: { type: Date, default: Date.now },
  total: { type: Number, required: true },
  status: {
    type: String,
    enum: ['Pending', 'Processing', 'Packed', 'Shipped', 'Delivered', 'Returned', 'Cancelled'],
    default: 'Pending',
  },
  items: [OrderItemSchema],
});

// To use the 'id' virtual field provided by Mongoose instead of '_id'
OrderSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: function (doc, ret) { delete ret._id }
});

module.exports = mongoose.model('Order', OrderSchema);

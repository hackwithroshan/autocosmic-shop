
const mongoose = require('mongoose');

const ShippingZoneSchema = new mongoose.Schema({
  name: { type: String, required: true },
  price: { type: Number, required: true },
  description: { type: String }
});

const SiteSettingsSchema = new mongoose.Schema({
  uniqueId: { type: String, default: 'main_site_settings', unique: true },
  currency: { type: String, default: 'USD' },
  taxRate: { type: Number, default: 0 },
  taxIncluded: { type: Boolean, default: false },
  shippingZones: [ShippingZoneSchema],
  facebookPixelId: { type: String, default: '' },
  googlePixelId: { type: String, default: '' },
  videoAutoplay: { type: Boolean, default: false } // New Field
});

module.exports = mongoose.model('SiteSettings', SiteSettingsSchema);

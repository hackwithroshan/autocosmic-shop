
const mongoose = require('mongoose');

const LinkSchema = new mongoose.Schema({
  text: { type: String, required: true },
  url: { type: String, required: true, default: '#' },
});

const HeaderSettingSchema = new mongoose.Schema({
  // Using a unique key to enforce a single settings document
  uniqueId: { type: String, default: 'main_header_settings', unique: true },
  logoText: { type: String, default: 'Ladies Smart Choice' },
  logoUrl: { type: String },
  brandColor: { type: String, default: '#E11D48' }, // Default Rose-600
  phoneNumber: { type: String, default: '+91 987 654 3210' },
  topBarLinks: [LinkSchema],
  mainNavLinks: [LinkSchema],
});

module.exports = mongoose.model('HeaderSetting', HeaderSettingSchema);

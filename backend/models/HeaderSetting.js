
const mongoose = require('mongoose');

const LinkSchema = new mongoose.Schema({
  text: { type: String, required: true },
  url: { type: String, required: true, default: '#' },
});

const HeaderSettingSchema = new mongoose.Schema({
  // Using a unique key to enforce a single settings document
  uniqueId: { type: String, default: 'main_header_settings', unique: true },
  logoText: { type: String, default: 'AutoCosmic' },
  phoneNumber: { type: String, default: '+001 123 456 789' },
  topBarLinks: [LinkSchema],
  mainNavLinks: [LinkSchema],
});

module.exports = mongoose.model('HeaderSetting', HeaderSettingSchema);

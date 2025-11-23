
const mongoose = require('mongoose');

const FooterLinkSchema = new mongoose.Schema({
  text: { type: String, required: true },
  url: { type: String, required: true, default: '#' },
});

const FooterColumnSchema = new mongoose.Schema({
  title: { type: String, required: true },
  links: [FooterLinkSchema]
});

const SocialLinkSchema = new mongoose.Schema({
  platform: { type: String, required: true },
  url: { type: String, required: true }
});

const FooterSettingSchema = new mongoose.Schema({
  uniqueId: { type: String, default: 'main_footer_settings', unique: true },
  brandDescription: { type: String, default: 'Your ultimate destination for trendy women\'s fashion.' },
  copyrightText: { type: String, default: '© 2024 Ladies Smart Choice. All rights reserved.' },
  socialLinks: [SocialLinkSchema],
  columns: [FooterColumnSchema]
});

module.exports = mongoose.model('FooterSetting', FooterSettingSchema);


const mongoose = require('mongoose');

const CampaignSchema = new mongoose.Schema({
  name: { type: String, required: true },
  type: { type: String, enum: ['Email', 'SMS', 'WhatsApp', 'Push'], required: true },
  status: { type: String, enum: ['Draft', 'Scheduled', 'Sent'], default: 'Draft' },
  sentCount: { type: Number, default: 0 },
  openRate: { type: Number, default: 0 },
  clickRate: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now }
});

CampaignSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: function (doc, ret) { delete ret._id }
});

module.exports = mongoose.model('Campaign', CampaignSchema);

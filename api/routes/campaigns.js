
const express = require('express');
const Campaign = require('../models/Campaign');
const authMiddleware = require('../middleware/authMiddleware');
const router = express.Router();

// Get all campaigns
router.get('/', authMiddleware(true), async (req, res) => {
  try {
    const campaigns = await Campaign.find().sort({ createdAt: -1 });
    res.json(campaigns);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Create campaign
router.post('/', authMiddleware(true), async (req, res) => {
  try {
    const newCampaign = new Campaign(req.body);
    const campaign = await newCampaign.save();
    res.status(201).json(campaign);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

module.exports = router;

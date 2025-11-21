
const express = require('express');
const HeaderSetting = require('../models/HeaderSetting');
const SiteSettings = require('../models/SiteSettings');
const authMiddleware = require('../middleware/authMiddleware');
const router = express.Router();

// --- Header Settings ---
router.get('/header', async (req, res) => {
  try {
    const settings = await HeaderSetting.findOne({ uniqueId: 'main_header_settings' });
    if (!settings) {
      return res.status(404).json({ message: 'Header settings not found.' });
    }
    res.json(settings);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server Error' });
  }
});

router.put('/header', authMiddleware(true), async (req, res) => {
  const { logoText, phoneNumber, topBarLinks, mainNavLinks } = req.body;
  try {
    let settings = await HeaderSetting.findOneAndUpdate(
      { uniqueId: 'main_header_settings' },
      { logoText, phoneNumber, topBarLinks, mainNavLinks },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );
    res.json(settings);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server Error' });
  }
});

// --- Site Settings (Tax, Shipping, Pixels) ---
router.get('/site', async (req, res) => {
  try {
    let settings = await SiteSettings.findOne({ uniqueId: 'main_site_settings' });
    if (!settings) {
       settings = await SiteSettings.create({});
    }
    res.json(settings);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server Error' });
  }
});

router.put('/site', authMiddleware(true), async (req, res) => {
  try {
    const settings = await SiteSettings.findOneAndUpdate(
      { uniqueId: 'main_site_settings' },
      req.body,
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );
    res.json(settings);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server Error' });
  }
});

module.exports = router;

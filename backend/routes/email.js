
const express = require('express');
const router = express.Router();

// This route is deprecated. 
// Email functionality has been moved to the Frontend/Vercel Serverless Function (/api/send-email).
// The Railway backend no longer handles SMTP connections directly to improve stability.

router.post('/', (req, res) => {
    res.status(410).json({ 
        message: 'This endpoint is deprecated. Please use the Vercel /api/send-email endpoint instead.' 
    });
});

module.exports = router;

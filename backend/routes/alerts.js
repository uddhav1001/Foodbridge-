const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');

// POST /api/alerts/send - simulated SMS/notification
router.post('/send', protect, async (req, res) => {
    try {
        const { to, message, language = 'en' } = req.body;

        // Simulated SMS (console log instead of actual Twilio)
        const translations = {
            en: `[SMS → ${to}] ${message}`,
            hi: `[SMS → ${to}] ${message} (हिन्दी अनुवाद)`,
            ta: `[SMS → ${to}] ${message} (தமிழ் மொழிபெயர்ப்பு)`,
            te: `[SMS → ${to}] ${message} (తెలుగు అనువాదం)`
        };

        const smsContent = translations[language] || translations.en;
        console.log(`📱 SIMULATED SMS: ${smsContent}`);

        res.json({
            success: true,
            message: 'Alert sent (simulated)',
            smsContent,
            to,
            language,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;

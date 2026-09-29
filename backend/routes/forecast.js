const express = require('express');
const router = express.Router();
const DemandForecast = require('../models/DemandForecast');
const Donation = require('../models/Donation');
const { protect } = require('../middleware/auth');

// GET /api/forecast/:donorId - predict surplus for next 7 days
router.get('/:donorId', protect, async (req, res) => {
    try {
        const { donorId } = req.params;

        // Get historical donation data for this donor (last 30 days)
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const pastDonations = await Donation.find({
            donor: donorId,
            createdAt: { $gte: thirtyDaysAgo },
            status: { $in: ['delivered', 'available', 'claimed', 'picked'] }
        }).sort('createdAt');

        // Group by day of week
        const dayTotals = {};
        const dayCounts = {};

        pastDonations.forEach(d => {
            const day = new Date(d.createdAt).getDay();
            dayTotals[day] = (dayTotals[day] || 0) + d.quantity;
            dayCounts[day] = (dayCounts[day] || 0) + 1;
        });

        // Generate 7-day forecast using moving average by day-of-week
        const forecast = [];
        for (let i = 0; i < 7; i++) {
            const futureDate = new Date();
            futureDate.setDate(futureDate.getDate() + i);
            const dayOfWeek = futureDate.getDay();
            const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

            const avgSurplus = dayCounts[dayOfWeek]
                ? Math.round(dayTotals[dayOfWeek] / dayCounts[dayOfWeek])
                : Math.round(pastDonations.length ? pastDonations.reduce((s, d) => s + d.quantity, 0) / pastDonations.length : 0);

            forecast.push({
                date: futureDate.toISOString().split('T')[0],
                dayName: dayNames[dayOfWeek],
                predictedSurplus: avgSurplus,
                confidence: dayCounts[dayOfWeek] ? Math.min(dayCounts[dayOfWeek] / 4, 1) : 0.2
            });
        }

        res.json({
            donorId,
            totalHistoricalDonations: pastDonations.length,
            forecast
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// POST /api/forecast/record - record actual surplus data
router.post('/record', protect, async (req, res) => {
    try {
        const { donorId, date, actualSurplus, foodType } = req.body;

        const record = await DemandForecast.create({
            donor: donorId || req.user._id,
            date: date || new Date(),
            actualSurplus: actualSurplus || 0,
            foodType: foodType || 'mixed'
        });

        res.status(201).json(record);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;

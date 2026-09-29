const express = require('express');
const router = express.Router();
const Donation = require('../models/Donation');
const User = require('../models/User');
const ImpactReport = require('../models/ImpactReport');
const { protect, authorize } = require('../middleware/auth');

// GET /api/impact/report?period=monthly - generate impact report
router.get('/report', protect, async (req, res) => {
    try {
        const { period = 'monthly' } = req.query;
        const now = new Date();
        let startDate;

        if (period === 'weekly') {
            startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        } else if (period === 'monthly') {
            startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        } else if (period === 'yearly') {
            startDate = new Date(now.getFullYear(), 0, 1);
        } else {
            startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        }

        const deliveredDonations = await Donation.find({
            status: 'delivered',
            updatedAt: { $gte: startDate }
        }).populate('donor', 'name');

        const totalMealsSaved = deliveredDonations.reduce((sum, d) => sum + d.quantity, 0);
        const totalWeight = totalMealsSaved * 0.4; // ~0.4 kg per serving estimate
        const co2Avoided = Math.round(totalWeight * 2.5 * 10) / 10; // 2.5 kg CO2 per kg food waste

        // Per-donor breakdown
        const donorMap = {};
        deliveredDonations.forEach(d => {
            const donorId = d.donor?._id?.toString() || 'unknown';
            if (!donorMap[donorId]) {
                donorMap[donorId] = {
                    donor: d.donor?._id,
                    donorName: d.donor?.name || 'Unknown',
                    meals: 0,
                    donations: 0,
                    co2: 0
                };
            }
            donorMap[donorId].meals += d.quantity;
            donorMap[donorId].donations += 1;
            donorMap[donorId].co2 += Math.round(d.quantity * 0.4 * 2.5 * 10) / 10;
        });

        const donorBreakdown = Object.values(donorMap).sort((a, b) => b.meals - a.meals);

        // Count stats
        const totalDonors = await User.countDocuments({ role: 'donor' });
        const totalVolunteers = await User.countDocuments({ role: 'volunteer' });
        const totalShelters = await User.countDocuments({ role: 'ngo', verified: true });
        const totalActiveDonations = await Donation.countDocuments({ status: 'available' });

        res.json({
            period,
            startDate,
            endDate: now,
            totalMealsSaved,
            totalDonations: deliveredDonations.length,
            co2Avoided,
            totalWeight,
            donorBreakdown,
            stats: { totalDonors, totalVolunteers, totalShelters, totalActiveDonations }
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// GET /api/impact/stats - quick stats
router.get('/stats', async (req, res) => {
    try {
        const totalMeals = await Donation.aggregate([
            { $match: { status: 'delivered' } },
            { $group: { _id: null, total: { $sum: '$quantity' } } }
        ]);
        const totalDonors = await User.countDocuments({ role: 'donor' });
        const totalVolunteers = await User.countDocuments({ role: 'volunteer' });
        const totalShelters = await User.countDocuments({ role: 'ngo' });
        const totalDonations = await Donation.countDocuments({ status: 'delivered' });

        res.json({
            totalMealsSaved: totalMeals[0]?.total || 0,
            totalDonors,
            totalVolunteers,
            totalShelters,
            totalDonations,
            co2Avoided: Math.round((totalMeals[0]?.total || 0) * 0.4 * 2.5 * 10) / 10
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;

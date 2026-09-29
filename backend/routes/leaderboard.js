const express = require('express');
const router = express.Router();
const Leaderboard = require('../models/Leaderboard');
const { protect } = require('../middleware/auth');

// GET /api/leaderboard?role=donor - get leaderboard
router.get('/', async (req, res) => {
    try {
        const { role, limit = 20 } = req.query;
        const filter = {};
        if (role) filter.role = role;

        const leaderboard = await Leaderboard.find(filter)
            .sort('-totalPoints')
            .limit(parseInt(limit))
            .populate('user', 'name email');

        // Assign ranks
        const ranked = leaderboard.map((entry, idx) => ({
            ...entry.toObject(),
            rank: idx + 1
        }));

        res.json(ranked);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// GET /api/leaderboard/me - my rank
router.get('/me', protect, async (req, res) => {
    try {
        const myEntry = await Leaderboard.findOne({ user: req.user._id });
        if (!myEntry) return res.json({ rank: 0, totalPoints: 0 });

        const higherCount = await Leaderboard.countDocuments({
            role: myEntry.role,
            totalPoints: { $gt: myEntry.totalPoints }
        });

        res.json({ ...myEntry.toObject(), rank: higherCount + 1 });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;

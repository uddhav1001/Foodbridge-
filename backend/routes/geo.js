const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Donation = require('../models/Donation');
const { protect } = require('../middleware/auth');

// GET /api/geo/nearby/volunteers - find volunteers near a location
router.get('/nearby/volunteers', protect, async (req, res) => {
    try {
        const { lat, lng, radius = 10 } = req.query;

        if (!lat || !lng) {
            return res.status(400).json({ message: 'lat and lng are required' });
        }

        const volunteers = await User.find({
            role: 'volunteer',
            location: {
                $near: {
                    $geometry: {
                        type: 'Point',
                        coordinates: [parseFloat(lng), parseFloat(lat)]
                    },
                    $maxDistance: parseInt(radius) * 1000
                }
            }
        }).select('name phone location').limit(20);

        res.json(volunteers);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// GET /api/geo/heatmap - donation coordinates for heatmap
router.get('/heatmap', protect, async (req, res) => {
    try {
        const donations = await Donation.find({
            'location.coordinates': { $ne: [0, 0] }
        }).select('location quantity status createdAt').limit(500);

        const heatmapData = donations.map(d => ({
            lat: d.location.coordinates[1],
            lng: d.location.coordinates[0],
            intensity: d.quantity,
            status: d.status
        }));

        res.json(heatmapData);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;

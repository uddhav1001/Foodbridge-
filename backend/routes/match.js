const express = require('express');
const router = express.Router();
const Donation = require('../models/Donation');
const User = require('../models/User');
const { protect } = require('../middleware/auth');

// POST /api/match/:donationId - auto-match donation to best shelter
router.post('/:donationId', protect, async (req, res) => {
    try {
        const donation = await Donation.findById(req.params.donationId);
        if (!donation) return res.status(404).json({ message: 'Donation not found' });

        // Find verified NGOs/shelters near the donation
        const shelters = await User.find({
            role: 'ngo',
            verified: true,
            location: {
                $near: {
                    $geometry: {
                        type: 'Point',
                        coordinates: donation.location.coordinates
                    },
                    $maxDistance: 20000 // 20 km
                }
            }
        }).limit(10);

        if (shelters.length === 0) {
            return res.json({ message: 'No nearby shelters found', matched: null });
        }

        // Score shelters by proximity + capacity
        const scored = shelters.map(s => {
            const dist = Math.sqrt(
                Math.pow(s.location.coordinates[0] - donation.location.coordinates[0], 2) +
                Math.pow(s.location.coordinates[1] - donation.location.coordinates[1], 2)
            );
            const capacityScore = s.capacity > 0 ? Math.min(donation.quantity / s.capacity, 1) : 0.5;
            const ratingScore = s.rating / 5;
            const score = (1 / (dist + 0.001)) * 0.5 + capacityScore * 0.3 + ratingScore * 0.2;

            return { shelter: s, score, distance: dist };
        });

        scored.sort((a, b) => b.score - a.score);
        const bestMatch = scored[0];

        // Update donation
        donation.matchedShelter = bestMatch.shelter._id;
        await donation.save();

        const io = req.app.get('io');
        if (io) {
            io.emit('donation-matched', {
                donationId: donation._id,
                shelter: bestMatch.shelter.name || bestMatch.shelter.organizationName
            });
        }

        res.json({
            matched: {
                shelter: bestMatch.shelter.name || bestMatch.shelter.organizationName,
                shelterId: bestMatch.shelter._id,
                score: Math.round(bestMatch.score * 100),
                rating: bestMatch.shelter.rating
            },
            alternatives: scored.slice(1, 4).map(s => ({
                name: s.shelter.name || s.shelter.organizationName,
                score: Math.round(s.score * 100)
            }))
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;

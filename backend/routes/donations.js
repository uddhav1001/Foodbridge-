const express = require('express');
const router = express.Router();
const QRCode = require('qrcode');
const Donation = require('../models/Donation');
const User = require('../models/User');
const Leaderboard = require('../models/Leaderboard');
const { protect, authorize } = require('../middleware/auth');
const upload = require('../middleware/upload');

// POST /api/donations - create new donation
router.post('/', protect, authorize('donor'), async (req, res) => {
    try {
        const { foodType, description, quantity, unit, preparedAt, expiresAt, pickupAddress, notes, location } = req.body;

        const donation = await Donation.create({
            donor: req.user._id,
            foodType,
            description: description || '',
            quantity,
            unit: unit || 'servings',
            preparedAt,
            expiresAt,
            pickupAddress: pickupAddress || req.user.address || '',
            notes: notes || '',
            location: location || req.user.location
        });

        // Generate QR code
        const qrData = JSON.stringify({ donationId: donation._id, donor: req.user.name, foodType, quantity });
        const qrCodeUrl = await QRCode.toDataURL(qrData);
        donation.qrCode = qrCodeUrl;

        // Set freshness badge
        const now = new Date();
        const expiry = new Date(expiresAt);
        const hoursLeft = (expiry - now) / (1000 * 60 * 60);
        if (hoursLeft > 6) donation.freshnessBadge = 'fresh';
        else if (hoursLeft > 0) donation.freshnessBadge = 'caution';
        else donation.freshnessBadge = 'expired';

        await donation.save();

        // Update leaderboard
        await Leaderboard.findOneAndUpdate(
            { user: req.user._id },
            { $inc: { totalDonations: 1, totalPoints: 10 } }
        );
        await User.findByIdAndUpdate(req.user._id, { $inc: { points: 10 } });

        // Emit socket event
        const io = req.app.get('io');
        if (io) {
            io.emit('new-donation', {
                _id: donation._id,
                foodType: donation.foodType,
                quantity: donation.quantity,
                donor: req.user.name,
                location: donation.location,
                pickupAddress: donation.pickupAddress
            });
        }

        res.status(201).json(donation);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// GET /api/donations - list donations with filters
router.get('/', protect, async (req, res) => {
    try {
        const { status, donorId, limit = 50 } = req.query;
        const filter = {};
        if (status) filter.status = status;
        if (donorId) filter.donor = donorId;

        const donations = await Donation.find(filter)
            .populate('donor', 'name email phone address')
            .populate('claimedBy', 'name')
            .populate('matchedShelter', 'name organizationName')
            .populate('volunteer', 'name')
            .sort('-createdAt')
            .limit(parseInt(limit));

        res.json(donations);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// GET /api/donations/:id - single donation
router.get('/:id', protect, async (req, res) => {
    try {
        const donation = await Donation.findById(req.params.id)
            .populate('donor', 'name email phone address')
            .populate('claimedBy', 'name')
            .populate('matchedShelter', 'name organizationName')
            .populate('volunteer', 'name');

        if (!donation) return res.status(404).json({ message: 'Donation not found' });
        res.json(donation);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// PATCH /api/donations/:id/claim - volunteer claims a donation
router.patch('/:id/claim', protect, authorize('volunteer'), async (req, res) => {
    try {
        const donation = await Donation.findById(req.params.id);
        if (!donation) return res.status(404).json({ message: 'Donation not found' });
        if (donation.status !== 'available') return res.status(400).json({ message: 'Donation is no longer available' });

        donation.status = 'claimed';
        donation.volunteer = req.user._id;
        await donation.save();

        const io = req.app.get('io');
        if (io) {
            io.emit('donation-claimed', { donationId: donation._id, volunteer: req.user.name });
        }

        res.json(donation);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// PATCH /api/donations/:id/pickup - mark as picked up
router.patch('/:id/pickup', protect, authorize('volunteer'), async (req, res) => {
    try {
        const donation = await Donation.findById(req.params.id);
        if (!donation) return res.status(404).json({ message: 'Donation not found' });

        donation.status = 'picked';
        donation.pickupVerified = true;
        await donation.save();

        const io = req.app.get('io');
        if (io) io.emit('donation-picked', { donationId: donation._id });

        res.json(donation);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// PATCH /api/donations/:id/complete - mark donation as delivered
router.patch('/:id/complete', protect, async (req, res) => {
    try {
        const donation = await Donation.findById(req.params.id);
        if (!donation) return res.status(404).json({ message: 'Donation not found' });

        donation.status = 'delivered';
        donation.handoverVerified = true;
        await donation.save();

        // Update leaderboard for volunteer
        if (donation.volunteer) {
            await Leaderboard.findOneAndUpdate(
                { user: donation.volunteer },
                { $inc: { totalDeliveries: 1, totalPoints: 15, totalMeals: donation.quantity } }
            );
            await User.findByIdAndUpdate(donation.volunteer, { $inc: { points: 15 } });

            // Check for badges
            const lb = await Leaderboard.findOne({ user: donation.volunteer });
            if (lb && lb.totalDeliveries === 1) {
                lb.badges.push({ name: 'First Delivery', icon: '🚀' });
                await lb.save();
            }
            if (lb && lb.totalDeliveries === 10) {
                lb.badges.push({ name: 'Speed Demon', icon: '⚡' });
                await lb.save();
            }
        }

        // Update donor leaderboard
        await Leaderboard.findOneAndUpdate(
            { user: donation.donor },
            { $inc: { totalMeals: donation.quantity, totalPoints: 5 } }
        );

        // Check donor badges
        const donorLb = await Leaderboard.findOne({ user: donation.donor });
        if (donorLb && donorLb.totalMeals >= 100 && !donorLb.badges.find(b => b.name === '100 Meals Saved')) {
            donorLb.badges.push({ name: '100 Meals Saved', icon: '🏆' });
            await donorLb.save();
        }

        const io = req.app.get('io');
        if (io) io.emit('donation-delivered', { donationId: donation._id, meals: donation.quantity });

        res.json(donation);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// POST /api/donations/:id/photo - upload food photo
router.post('/:id/photo', protect, upload.single('photo'), async (req, res) => {
    try {
        const donation = await Donation.findById(req.params.id);
        if (!donation) return res.status(404).json({ message: 'Donation not found' });

        if (req.file) {
            donation.photos.push(`/uploads/${req.file.filename}`);
            await donation.save();
        }

        res.json({ photos: donation.photos });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;

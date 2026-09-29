const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { protect, authorize } = require('../middleware/auth');

// GET /api/users/ngos - list all NGOs
router.get('/ngos', protect, async (req, res) => {
    try {
        const ngos = await User.find({ role: 'ngo' }).select('-password');
        res.json(ngos);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// GET /api/users/all - admin get all users
router.get('/all', protect, authorize('admin'), async (req, res) => {
    try {
        const users = await User.find().select('-password').sort('-createdAt');
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// PATCH /api/users/:id/verify - admin verifies an NGO
router.patch('/:id/verify', protect, authorize('admin'), async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ message: 'User not found' });

        user.verified = req.body.verified !== undefined ? req.body.verified : true;
        await user.save();

        res.json({ message: `User ${user.verified ? 'verified' : 'unverified'} successfully`, user });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// PATCH /api/users/:id/rate - rate a user
router.patch('/:id/rate', protect, async (req, res) => {
    try {
        const { rating } = req.body;
        if (!rating || rating < 1 || rating > 5) {
            return res.status(400).json({ message: 'Rating must be between 1 and 5' });
        }

        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ message: 'User not found' });

        const newCount = user.ratingCount + 1;
        const newRating = ((user.rating * user.ratingCount) + rating) / newCount;

        user.rating = Math.round(newRating * 10) / 10;
        user.ratingCount = newCount;
        await user.save();

        res.json({ message: 'Rating updated', rating: user.rating, ratingCount: user.ratingCount });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// PATCH /api/users/profile - update own profile
router.patch('/profile', protect, async (req, res) => {
    try {
        const { name, phone, language, location, address, organizationName, capacity, dietaryPreferences } = req.body;
        const user = await User.findById(req.user._id);

        if (name) user.name = name;
        if (phone) user.phone = phone;
        if (language) user.language = language;
        if (location) user.location = location;
        if (address) user.address = address;
        if (organizationName) user.organizationName = organizationName;
        if (capacity) user.capacity = capacity;
        if (dietaryPreferences) user.dietaryPreferences = dietaryPreferences;

        await user.save();
        res.json(user);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;

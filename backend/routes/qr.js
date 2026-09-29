const express = require('express');
const router = express.Router();
const QRCode = require('qrcode');
const Donation = require('../models/Donation');
const { protect } = require('../middleware/auth');

// GET /api/qr/:donationId - generate QR code
router.get('/:donationId', protect, async (req, res) => {
    try {
        const donation = await Donation.findById(req.params.donationId).populate('donor', 'name');
        if (!donation) return res.status(404).json({ message: 'Donation not found' });

        if (!donation.qrCode) {
            const qrData = JSON.stringify({
                donationId: donation._id,
                donor: donation.donor?.name,
                foodType: donation.foodType,
                quantity: donation.quantity,
                timestamp: Date.now()
            });
            donation.qrCode = await QRCode.toDataURL(qrData);
            await donation.save();
        }

        res.json({ qrCode: donation.qrCode, donationId: donation._id });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// POST /api/qr/verify - verify QR handover
router.post('/verify', protect, async (req, res) => {
    try {
        const { donationId, type } = req.body; // type: 'pickup' or 'delivery'

        const donation = await Donation.findById(donationId);
        if (!donation) return res.status(404).json({ message: 'Donation not found' });

        if (type === 'pickup') {
            donation.pickupVerified = true;
            donation.status = 'picked';
        } else if (type === 'delivery') {
            donation.handoverVerified = true;
            donation.status = 'delivered';
        }

        await donation.save();

        const io = req.app.get('io');
        if (io) {
            io.emit('qr-verified', { donationId, type, status: donation.status });
        }

        res.json({ message: `${type} verified successfully`, donation });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;

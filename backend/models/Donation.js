const mongoose = require('mongoose');

const DonationSchema = new mongoose.Schema({
    donor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    foodType: { type: String, required: true },
    description: { type: String, default: '' },
    quantity: { type: Number, required: true },
    unit: { type: String, default: 'servings' },
    preparedAt: { type: Date, required: true },
    expiresAt: { type: Date, required: true },
    status: {
        type: String,
        enum: ['available', 'claimed', 'picked', 'delivered', 'expired'],
        default: 'available'
    },
    photos: [String],
    freshnessBadge: {
        type: String,
        enum: ['fresh', 'caution', 'expired'],
        default: 'fresh'
    },
    qrCode: { type: String, default: '' },
    claimedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    matchedShelter: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    volunteer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    handoverVerified: { type: Boolean, default: false },
    pickupVerified: { type: Boolean, default: false },
    location: {
        type: { type: String, enum: ['Point'], default: 'Point' },
        coordinates: { type: [Number], default: [0, 0] }
    },
    pickupAddress: { type: String, default: '' },
    notes: { type: String, default: '' }
}, { timestamps: true });

DonationSchema.index({ location: '2dsphere' });
DonationSchema.index({ status: 1, expiresAt: 1 });

module.exports = mongoose.model('Donation', DonationSchema);

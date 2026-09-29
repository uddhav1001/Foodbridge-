const mongoose = require('mongoose');

const RouteSchema = new mongoose.Schema({
    volunteer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    waypoints: [{
        donationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Donation' },
        lat: Number,
        lng: Number,
        address: String
    }],
    optimizedOrder: [Number],
    totalDistance: { type: Number, default: 0 },
    estimatedTime: { type: Number, default: 0 },
    status: { type: String, enum: ['planned', 'in-progress', 'completed'], default: 'planned' }
}, { timestamps: true });

module.exports = mongoose.model('Route', RouteSchema);

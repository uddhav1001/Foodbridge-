const mongoose = require('mongoose');

const LeaderboardSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    name: { type: String, required: true },
    role: { type: String, enum: ['donor', 'volunteer', 'ngo'], required: true },
    totalPoints: { type: Number, default: 0 },
    totalMeals: { type: Number, default: 0 },
    totalDonations: { type: Number, default: 0 },
    totalDeliveries: { type: Number, default: 0 },
    rank: { type: Number, default: 0 },
    badges: [{ name: String, icon: String, earnedAt: { type: Date, default: Date.now } }]
}, { timestamps: true });

LeaderboardSchema.index({ role: 1, totalPoints: -1 });

module.exports = mongoose.model('Leaderboard', LeaderboardSchema);

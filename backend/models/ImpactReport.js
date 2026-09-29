const mongoose = require('mongoose');

const ImpactReportSchema = new mongoose.Schema({
    period: { type: String, required: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    totalMealsSaved: { type: Number, default: 0 },
    totalDonations: { type: Number, default: 0 },
    co2Avoided: { type: Number, default: 0 },
    totalWeight: { type: Number, default: 0 },
    donorBreakdown: [{
        donor: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        donorName: String,
        meals: Number,
        donations: Number,
        co2: Number
    }],
    shelterBreakdown: [{
        shelter: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        shelterName: String,
        mealsReceived: Number
    }]
}, { timestamps: true });

module.exports = mongoose.model('ImpactReport', ImpactReportSchema);

const mongoose = require('mongoose');

const DemandForecastSchema = new mongoose.Schema({
    donor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    date: { type: Date, required: true },
    predictedSurplus: { type: Number, default: 0 },
    actualSurplus: { type: Number, default: 0 },
    foodType: { type: String, default: 'mixed' }
}, { timestamps: true });

DemandForecastSchema.index({ donor: 1, date: -1 });

module.exports = mongoose.model('DemandForecast', DemandForecastSchema);

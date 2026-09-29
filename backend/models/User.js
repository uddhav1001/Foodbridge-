const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true, minlength: 6 },
    role: { type: String, enum: ['donor', 'volunteer', 'ngo', 'admin'], required: true },
    phone: { type: String, default: '' },
    language: { type: String, default: 'en' },
    verified: { type: Boolean, default: false },
    documents: [{ name: String, url: String, uploadedAt: { type: Date, default: Date.now } }],
    rating: { type: Number, default: 0, min: 0, max: 5 },
    ratingCount: { type: Number, default: 0 },
    points: { type: Number, default: 0 },
    badges: [{ name: String, icon: String, earnedAt: { type: Date, default: Date.now } }],
    location: {
        type: { type: String, enum: ['Point'], default: 'Point' },
        coordinates: { type: [Number], default: [0, 0] }
    },
    capacity: { type: Number, default: 0 },
    dietaryPreferences: [String],
    organizationName: { type: String, default: '' },
    address: { type: String, default: '' }
}, { timestamps: true });

UserSchema.index({ location: '2dsphere' });

UserSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

UserSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', UserSchema);

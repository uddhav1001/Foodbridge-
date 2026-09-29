const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const connectDB = require('./config/db');

// Connect to MongoDB
connectDB();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: { origin: '*', methods: ['GET', 'POST', 'PATCH', 'DELETE'] }
});

// Make io accessible to routes
app.set('io', io);

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// API Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));
app.use('/api/donations', require('./routes/donations'));
app.use('/api/forecast', require('./routes/forecast'));
app.use('/api/routes', require('./routes/routes'));
app.use('/api/match', require('./routes/match'));
app.use('/api/qr', require('./routes/qr'));
app.use('/api/leaderboard', require('./routes/leaderboard'));
app.use('/api/impact', require('./routes/impact'));
app.use('/api/geo', require('./routes/geo'));
app.use('/api/alerts', require('./routes/alerts'));

// Health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Socket.IO
io.on('connection', (socket) => {
    console.log(`⚡ Socket connected: ${socket.id}`);

    socket.on('join-role', (role) => {
        socket.join(role);
        console.log(`👤 ${socket.id} joined room: ${role}`);
    });

    socket.on('disconnect', () => {
        console.log(`❌ Socket disconnected: ${socket.id}`);
    });
});

// Auto-expire donations (runs every 5 minutes)
setInterval(async () => {
    try {
        const Donation = require('./models/Donation');
        const result = await Donation.updateMany(
            { status: { $in: ['available', 'claimed'] }, expiresAt: { $lt: new Date() } },
            { $set: { status: 'expired', freshnessBadge: 'expired' } }
        );
        if (result.modifiedCount > 0) {
            console.log(`🕐 Auto-expired ${result.modifiedCount} donations`);
            io.emit('donations-expired', { count: result.modifiedCount });
        }
    } catch (err) {
        console.error('Auto-expire error:', err.message);
    }
}, 5 * 60 * 1000);

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
    console.log(`🚀 FoodBridge API running on port ${PORT}`);
    console.log(`📡 Socket.IO ready`);
});

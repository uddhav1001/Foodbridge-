const express = require('express');
const router = express.Router();
const geolib = require('geolib');
const RouteModel = require('../models/Route');
const { protect, authorize } = require('../middleware/auth');

// POST /api/routes/optimize - optimize multi-stop route
router.post('/optimize', protect, authorize('volunteer'), async (req, res) => {
    try {
        const { waypoints } = req.body;

        if (!waypoints || waypoints.length < 2) {
            return res.status(400).json({ message: 'At least 2 waypoints are required' });
        }

        // Nearest-neighbor algorithm
        const visited = new Set();
        const order = [];
        let current = 0;
        visited.add(0);
        order.push(0);

        while (visited.size < waypoints.length) {
            let nearestIdx = -1;
            let nearestDist = Infinity;

            for (let i = 0; i < waypoints.length; i++) {
                if (visited.has(i)) continue;

                const dist = geolib.getDistance(
                    { latitude: waypoints[current].lat, longitude: waypoints[current].lng },
                    { latitude: waypoints[i].lat, longitude: waypoints[i].lng }
                );

                if (dist < nearestDist) {
                    nearestDist = dist;
                    nearestIdx = i;
                }
            }

            if (nearestIdx !== -1) {
                visited.add(nearestIdx);
                order.push(nearestIdx);
                current = nearestIdx;
            }
        }

        // Calculate total distance
        let totalDistance = 0;
        for (let i = 0; i < order.length - 1; i++) {
            totalDistance += geolib.getDistance(
                { latitude: waypoints[order[i]].lat, longitude: waypoints[order[i]].lng },
                { latitude: waypoints[order[i + 1]].lat, longitude: waypoints[order[i + 1]].lng }
            );
        }

        // Estimate time (avg 30 km/h in city)
        const estimatedTimeMinutes = Math.round((totalDistance / 1000) / 30 * 60);

        // Save route
        const route = await RouteModel.create({
            volunteer: req.user._id,
            waypoints,
            optimizedOrder: order,
            totalDistance: Math.round(totalDistance / 1000 * 10) / 10,
            estimatedTime: estimatedTimeMinutes
        });

        res.json({
            route,
            optimizedWaypoints: order.map(i => waypoints[i]),
            totalDistanceKm: route.totalDistance,
            estimatedTimeMinutes
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// GET /api/routes/my - get volunteer's routes
router.get('/my', protect, authorize('volunteer'), async (req, res) => {
    try {
        const routes = await RouteModel.find({ volunteer: req.user._id }).sort('-createdAt').limit(10);
        res.json(routes);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;

import { useState, useEffect } from 'react';
import api from '../../api/axios';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { MapContainer, TileLayer, CircleMarker } from 'react-leaflet';

export const AdminDashboard = () => {
    const [stats, setStats] = useState({ donors: 124, ngos: 45, vols: 89, meals: 8520, co2: 3400 });
    const [heatmapData, setHeatmapData] = useState([]);

    const impactData = [
        { month: 'May', meals: 1200 },
        { month: 'Jun', meals: 1500 },
        { month: 'Jul', meals: 1800 },
        { month: 'Aug', meals: 2200 },
        { month: 'Sep', meals: 2800 }
    ];

    useEffect(() => {
        // Generate dummy heatmap data focused on a city
        const data = [];
        for (let i = 0; i < 100; i++) {
            data.push([
                28.7041 + (Math.random() - 0.5) * 0.1,
                77.1025 + (Math.random() - 0.5) * 0.1,
                Math.random() * 50
            ]);
        }
        setHeatmapData(data);
    }, []);

    return (
        <div className="page-wrapper container">
            <h2>Admin Control Center</h2>

            <div className="grid-4" style={{ marginTop: '30px' }}>
                <div className="glass-card" style={{ textAlign: 'center' }}>
                    <h3 className="gradient-text" style={{ fontSize: '32px' }}>{stats.meals}</h3>
                    <p className="mono" style={{ color: 'var(--muted)', fontSize: '12px' }}>TOTAL MEALS SAVED</p>
                </div>
                <div className="glass-card" style={{ textAlign: 'center' }}>
                    <h3 className="gradient-text" style={{ fontSize: '32px' }}>{stats.co2} kg</h3>
                    <p className="mono" style={{ color: 'var(--muted)', fontSize: '12px' }}>CO₂ AVOIDED</p>
                </div>
                <div className="glass-card" style={{ textAlign: 'center' }}>
                    <h3 style={{ fontSize: '32px', color: '#fff' }}>{stats.donors}</h3>
                    <p className="mono" style={{ color: 'var(--muted)', fontSize: '12px' }}>ACTIVE DONORS</p>
                </div>
                <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                    <button className="btn-primary" style={{ padding: '8px' }}>Verify 3 Pending NGOs</button>
                    <button className="btn-outline" style={{ padding: '8px', marginTop: '8px' }}>Download CSR Report (CSV)</button>
                </div>
            </div>

            <div className="grid-2" style={{ marginTop: '24px' }}>
                {/* Impact Bar Chart */}
                <div className="glass-card">
                    <h3 style={{ marginBottom: '20px' }}>Monthly Impact Growth</h3>
                    <div style={{ width: '100%', height: '300px' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={impactData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#1e1e2e" vertical={false} />
                                <XAxis dataKey="month" stroke="#888" fontSize={12} />
                                <YAxis stroke="#888" fontSize={12} />
                                <Tooltip cursor={{ fill: '#1a1a24' }} contentStyle={{ backgroundColor: '#12121a', borderColor: '#00b4d8' }} />
                                <Bar dataKey="meals" fill="#00b4d8" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Heatmap */}
                <div className="glass-card">
                    <h3 style={{ marginBottom: '20px' }}>Donation Density Heatmap</h3>
                    <div style={{ width: '100%', height: '300px', borderRadius: '12px', overflow: 'hidden' }}>
                        <MapContainer center={[28.7041, 77.1025]} zoom={11} style={{ height: '100%', width: '100%' }}>
                            {heatmapData.map((point, idx) => (
                                <CircleMarker
                                    key={idx}
                                    center={[point[0], point[1]]}
                                    radius={point[2] * 0.4}
                                    pathOptions={{
                                        color: 'transparent',
                                        fillColor: point[2] > 30 ? '#ff4466' : point[2] > 15 ? '#ffc800' : '#00b4d8',
                                        fillOpacity: 0.6
                                    }}
                                />
                            ))}
                            <TileLayer
                                url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                                attribution="&copy; OpenStreetMap"
                            />
                        </MapContainer>
                    </div>
                </div>
            </div>
        </div>
    );
};

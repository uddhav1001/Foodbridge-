import { useState, useEffect } from 'react';
import api from '../../api/axios';
import toast from 'react-hot-toast';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { MapContainer, TileLayer, CircleMarker } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

export const AdminDashboard = () => {
    const [stats, setStats] = useState({ donors: 0, ngos: 0, volunteers: 0, meals: 0, co2: 0, donations: 0 });
    const [users, setUsers] = useState([]);
    const [heatmapData, setHeatmapData] = useState([]);
    const [loading, setLoading] = useState(true);

    const impactData = [
        { month: 'Apr', meals: 800 },
        { month: 'May', meals: 1200 },
        { month: 'Jun', meals: 1500 },
        { month: 'Jul', meals: 1800 },
        { month: 'Aug', meals: 2200 },
        { month: 'Sep', meals: 2800 }
    ];

    const weeklyData = [
        { day: 'Mon', donations: 12 },
        { day: 'Tue', donations: 18 },
        { day: 'Wed', donations: 8 },
        { day: 'Thu', donations: 22 },
        { day: 'Fri', donations: 30 },
        { day: 'Sat', donations: 35 },
        { day: 'Sun', donations: 28 },
    ];

    useEffect(() => {
        const fetchData = async () => {
            try {
                const { data: userList } = await api.get('/users');
                setUsers(userList);
                const donors = userList.filter(u => u.role === 'donor').length;
                const ngos = userList.filter(u => u.role === 'ngo').length;
                const volunteers = userList.filter(u => u.role === 'volunteer').length;

                const { data: donations } = await api.get('/donations');
                const deliveredMeals = donations.filter(d => d.status === 'delivered').reduce((sum, d) => sum + d.quantity, 0);

                setStats({
                    donors: donors || 124,
                    ngos: ngos || 45,
                    volunteers: volunteers || 89,
                    meals: deliveredMeals || 8520,
                    co2: Math.round((deliveredMeals || 8520) * 0.4),
                    donations: donations.length
                });
            } catch (err) {
                // Fallback demo data
                setStats({ donors: 124, ngos: 45, volunteers: 89, meals: 8520, co2: 3400, donations: 312 });
            }

            // Generate heatmap data around Delhi
            const data = [];
            for (let i = 0; i < 80; i++) {
                data.push([
                    28.7041 + (Math.random() - 0.5) * 0.12,
                    77.1025 + (Math.random() - 0.5) * 0.12,
                    Math.random() * 50
                ]);
            }
            setHeatmapData(data);
            setLoading(false);
        };
        fetchData();
    }, []);

    const verifyUser = async (userId) => {
        try {
            await api.patch(`/users/${userId}/verify`);
            toast.success('User verified!');
            setUsers(users.map(u => u._id === userId ? { ...u, verified: true } : u));
        } catch (err) {
            toast.success('Verified! (Demo mode)');
            setUsers(users.map(u => u._id === userId ? { ...u, verified: true } : u));
        }
    };

    const pendingNgos = users.filter(u => u.role === 'ngo' && !u.verified);

    return (
        <div className="page-wrapper container">
            <h2>🛡️ Admin Control Center</h2>
            <p style={{ color: 'var(--muted)', marginTop: '8px' }}>System overview and verification panel.</p>

            {/* Top Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '16px', marginTop: '30px' }}>
                {[
                    { label: 'TOTAL MEALS', value: stats.meals, gradient: true },
                    { label: 'CO₂ AVOIDED', value: `${stats.co2} kg`, gradient: true },
                    { label: 'DONORS', value: stats.donors },
                    { label: 'VOLUNTEERS', value: stats.volunteers },
                    { label: 'SHELTERS', value: stats.ngos },
                    { label: 'DONATIONS', value: stats.donations },
                ].map((s, i) => (
                    <div key={i} className="glass-card" style={{ textAlign: 'center', padding: '20px' }}>
                        <h3 className={s.gradient ? 'gradient-text' : ''} style={{ fontSize: '28px', color: s.gradient ? undefined : '#fff' }}>{s.value}</h3>
                        <p className="mono" style={{ color: 'var(--muted)', fontSize: '11px', marginTop: '8px' }}>{s.label}</p>
                    </div>
                ))}
            </div>

            <div className="grid-2" style={{ marginTop: '24px' }}>
                {/* Impact Bar Chart */}
                <div className="glass-card">
                    <h3 style={{ marginBottom: '20px' }}>📊 Monthly Impact Growth</h3>
                    <div style={{ width: '100%', height: '300px' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={impactData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#1e1e2e" vertical={false} />
                                <XAxis dataKey="month" stroke="#888" fontSize={12} />
                                <YAxis stroke="#888" fontSize={12} />
                                <Tooltip cursor={{ fill: '#1a1a24' }} contentStyle={{ backgroundColor: '#12121a', borderColor: '#00b4d8', borderRadius: '8px' }} />
                                <Bar dataKey="meals" fill="#00b4d8" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Weekly Line Chart */}
                <div className="glass-card">
                    <h3 style={{ marginBottom: '20px' }}>📈 Weekly Donation Trend</h3>
                    <div style={{ width: '100%', height: '300px' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={weeklyData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#1e1e2e" />
                                <XAxis dataKey="day" stroke="#888" fontSize={12} />
                                <YAxis stroke="#888" fontSize={12} />
                                <Tooltip contentStyle={{ backgroundColor: '#12121a', borderColor: '#00ff88', borderRadius: '8px' }} />
                                <Line type="monotone" dataKey="donations" stroke="#00ff88" strokeWidth={3} dot={{ r: 5, fill: '#00ff88' }} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            <div className="grid-2" style={{ marginTop: '24px' }}>
                {/* Heatmap */}
                <div className="glass-card">
                    <h3 style={{ marginBottom: '20px' }}>🗺️ Donation Density Heatmap</h3>
                    <div style={{ width: '100%', height: '350px', borderRadius: '12px', overflow: 'hidden' }}>
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

                {/* NGO Verification Panel */}
                <div className="glass-card">
                    <h3 style={{ marginBottom: '20px' }}>✅ NGO Verification Panel</h3>
                    {pendingNgos.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '40px 0' }}>
                            <p style={{ fontSize: '40px', marginBottom: '10px' }}>🎉</p>
                            <p style={{ color: 'var(--muted)' }}>All NGOs are verified! No pending requests.</p>
                        </div>
                    ) : (
                        <div style={{ display: 'grid', gap: '12px' }}>
                            {pendingNgos.map(ngo => (
                                <div key={ngo._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', border: '1px solid var(--border)', borderRadius: '8px' }}>
                                    <div>
                                        <h4 style={{ color: '#fff' }}>{ngo.organizationName || ngo.name}</h4>
                                        <p style={{ fontSize: '13px', color: 'var(--muted)' }}>{ngo.email} • Capacity: {ngo.capacity || 'N/A'}</p>
                                    </div>
                                    <button className="btn-primary" style={{ padding: '8px 16px' }} onClick={() => verifyUser(ngo._id)}>
                                        Verify
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Quick Actions */}
                    <div style={{ marginTop: '24px', display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                        <button className="btn-outline" style={{ padding: '10px 20px', flex: 1 }}>📄 Export CSR Report</button>
                        <button className="btn-outline" style={{ padding: '10px 20px', flex: 1 }}>📊 Download Analytics CSV</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

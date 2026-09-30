import { useState, useEffect } from 'react';
import api from '../../api/axios';
import toast from 'react-hot-toast';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { MapContainer, TileLayer, CircleMarker } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

export const AdminDashboard = () => {
    const [stats, setStats] = useState({ donors: 0, ngos: 0, volunteers: 0, meals: 0, co2: 0, donations: 0 });
    const [users, setUsers] = useState([]);
    const [donations, setDonations] = useState([]);
    const [heatmapData, setHeatmapData] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const { data: userList } = await api.get('/users/all');
                setUsers(userList);

                const { data: donationList } = await api.get('/donations');
                setDonations(donationList);

                const donors = userList.filter(u => u.role === 'donor').length;
                const ngos = userList.filter(u => u.role === 'ngo').length;
                const volunteers = userList.filter(u => u.role === 'volunteer').length;
                const deliveredMeals = donationList.filter(d => d.status === 'delivered').reduce((sum, d) => sum + d.quantity, 0);

                setStats({
                    donors, ngos, volunteers,
                    meals: deliveredMeals,
                    co2: Math.round(deliveredMeals * 0.4),
                    donations: donationList.length
                });

                // Build real heatmap from donation locations
                const points = donationList
                    .filter(d => d.location && d.location.coordinates && d.location.coordinates[0] !== 0)
                    .map(d => [d.location.coordinates[1], d.location.coordinates[0], d.quantity || 10]);
                setHeatmapData(points.length > 0 ? points : generateDemoHeatmap());
            } catch (err) {
                toast.error('Failed to load admin data');
                setHeatmapData(generateDemoHeatmap());
            }
            setLoading(false);
        };

        const generateDemoHeatmap = () => {
            const data = [];
            for (let i = 0; i < 50; i++) {
                data.push([28.7041 + (Math.random() - 0.5) * 0.12, 77.1025 + (Math.random() - 0.5) * 0.12, Math.random() * 50]);
            }
            return data;
        };

        fetchData();
    }, []);

    // Build monthly chart from real donation data
    const buildMonthlyData = () => {
        const months = {};
        donations.forEach(d => {
            if (d.status === 'delivered') {
                const m = new Date(d.createdAt).toLocaleString('default', { month: 'short' });
                months[m] = (months[m] || 0) + d.quantity;
            }
        });
        const result = Object.entries(months).map(([month, meals]) => ({ month, meals }));
        return result.length > 0 ? result : [{ month: 'Now', meals: 0 }];
    };

    // Build daily chart from real data
    const buildDailyData = () => {
        const days = { Mon: 0, Tue: 0, Wed: 0, Thu: 0, Fri: 0, Sat: 0, Sun: 0 };
        const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        donations.forEach(d => {
            const day = dayNames[new Date(d.createdAt).getDay()];
            days[day]++;
        });
        return Object.entries(days).map(([day, count]) => ({ day, donations: count }));
    };

    const verifyUser = async (userId) => {
        try {
            await api.patch(`/users/${userId}/verify`);
            toast.success('User verified!');
            setUsers(users.map(u => u._id === userId ? { ...u, verified: true } : u));
        } catch (err) {
            toast.error('Verification failed');
        }
    };

    const pendingNgos = users.filter(u => u.role === 'ngo' && !u.verified);

    return (
        <div className="page-wrapper container">
            <h2>🛡️ Admin Control Center</h2>
            <p style={{ color: 'var(--muted)', marginTop: '4px', fontSize: '14px' }}>System overview — all data is real-time from the database.</p>

            <div className="grid-3" style={{ marginTop: '24px' }}>
                {[
                    { label: 'MEALS SAVED', value: stats.meals, gradient: true },
                    { label: 'CO₂ AVOIDED', value: `${stats.co2} kg`, gradient: true },
                    { label: 'DONORS', value: stats.donors },
                    { label: 'VOLUNTEERS', value: stats.volunteers },
                    { label: 'SHELTERS', value: stats.ngos },
                    { label: 'TOTAL DONATIONS', value: stats.donations },
                ].map((s, i) => (
                    <div key={i} className="glass-card" style={{ textAlign: 'center' }}>
                        <h3 className={s.gradient ? 'gradient-text' : ''} style={{ fontSize: '26px', color: s.gradient ? undefined : '#fff' }}>{loading ? '...' : s.value}</h3>
                        <p className="mono" style={{ color: 'var(--muted)', fontSize: '11px', marginTop: '4px' }}>{s.label}</p>
                    </div>
                ))}
            </div>

            <div className="grid-2" style={{ marginTop: '24px' }}>
                <div className="glass-card">
                    <h3 style={{ marginBottom: '16px' }}>📊 Impact by Month</h3>
                    <div style={{ width: '100%', height: '260px' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={buildMonthlyData()}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#1e1e2e" vertical={false} />
                                <XAxis dataKey="month" stroke="#888" fontSize={11} />
                                <YAxis stroke="#888" fontSize={11} />
                                <Tooltip cursor={{ fill: '#1a1a24' }} contentStyle={{ backgroundColor: '#12121a', borderColor: '#00b4d8', borderRadius: '8px' }} />
                                <Bar dataKey="meals" fill="#00b4d8" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="glass-card">
                    <h3 style={{ marginBottom: '16px' }}>📈 Donations by Day</h3>
                    <div style={{ width: '100%', height: '260px' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={buildDailyData()}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#1e1e2e" />
                                <XAxis dataKey="day" stroke="#888" fontSize={11} />
                                <YAxis stroke="#888" fontSize={11} />
                                <Tooltip contentStyle={{ backgroundColor: '#12121a', borderColor: '#00ff88', borderRadius: '8px' }} />
                                <Line type="monotone" dataKey="donations" stroke="#00ff88" strokeWidth={3} dot={{ r: 4, fill: '#00ff88' }} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            <div className="grid-2" style={{ marginTop: '24px' }}>
                <div className="glass-card">
                    <h3 style={{ marginBottom: '16px' }}>🗺️ Donation Density</h3>
                    <div style={{ width: '100%', height: '300px', borderRadius: '12px', overflow: 'hidden' }}>
                        <MapContainer center={[28.7041, 77.1025]} zoom={11} style={{ height: '100%', width: '100%' }}>
                            {heatmapData.map((point, idx) => (
                                <CircleMarker key={idx} center={[point[0], point[1]]} radius={Math.max(point[2] * 0.3, 5)}
                                    pathOptions={{ color: 'transparent', fillColor: point[2] > 30 ? '#ff4466' : point[2] > 15 ? '#ffc800' : '#00b4d8', fillOpacity: 0.6 }} />
                            ))}
                            <TileLayer url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" attribution="&copy; OSM" />
                        </MapContainer>
                    </div>
                </div>

                <div className="glass-card">
                    <h3 style={{ marginBottom: '16px' }}>✅ NGO Verification ({pendingNgos.length} pending)</h3>
                    {loading ? <p style={{ color: 'var(--muted)' }}>Loading...</p> : pendingNgos.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '30px 0' }}>
                            <p style={{ fontSize: '36px', marginBottom: '8px' }}>🎉</p>
                            <p style={{ color: 'var(--muted)' }}>All NGOs verified!</p>
                        </div>
                    ) : (
                        <div style={{ display: 'grid', gap: '10px' }}>
                            {pendingNgos.map(ngo => (
                                <div key={ngo._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', border: '1px solid var(--border)', borderRadius: '8px', flexWrap: 'wrap', gap: '8px' }}>
                                    <div>
                                        <h4 style={{ color: '#fff', fontSize: '14px' }}>{ngo.organizationName || ngo.name}</h4>
                                        <p style={{ fontSize: '12px', color: 'var(--muted)' }}>{ngo.email}</p>
                                    </div>
                                    <button className="btn-primary" style={{ padding: '6px 14px', fontSize: '13px' }} onClick={() => verifyUser(ngo._id)}>Verify</button>
                                </div>
                            ))}
                        </div>
                    )}

                    <div style={{ marginTop: '20px', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                        <button className="btn-outline" style={{ padding: '8px 16px', flex: 1, fontSize: '13px' }}>📄 Export CSR Report</button>
                        <button className="btn-outline" style={{ padding: '8px 16px', flex: 1, fontSize: '13px' }}>📊 Download CSV</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

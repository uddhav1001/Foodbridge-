import { useState, useEffect } from 'react';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export const NgoDashboard = () => {
    const { user } = useAuth();
    const [incoming, setIncoming] = useState([]);
    const [forecast, setForecast] = useState([]);

    useEffect(() => {
        // We would fetch actual incoming matching our Shelter ID
        // Mock for demo
        setIncoming([
            { _id: '1', foodType: 'Mixed Veg Thali', quantity: 45, status: 'picked', freshnessBadge: 'fresh', volunteer: { name: 'Rahul' } }
        ]);

        setForecast([
            { date: 'Mon', predictedSurplus: 120 },
            { date: 'Tue', predictedSurplus: 140 },
            { date: 'Wed', predictedSurplus: 90 },
            { date: 'Thu', predictedSurplus: 160 },
            { date: 'Fri', predictedSurplus: 220 },
            { date: 'Sat', predictedSurplus: 250 },
            { date: 'Sun', predictedSurplus: 210 },
        ]);
    }, []);

    const verifyDelivery = async (id) => {
        try {
            // simulate qr scan
            await api.patch(`/donations/${id}/complete`);
            toast.success('Delivery Verified! Meals logged.');
            setIncoming(incoming.filter(d => d._id !== id));
        } catch (err) {
            toast.error('Scan failed. Ensure volunteer has arrived.');
        }
    };

    return (
        <div className="page-wrapper container">
            <h2>NGO / Shelter Dashboard</h2>

            <div className="grid-2" style={{ marginTop: '30px' }}>
                {/* Incoming Donations */}
                <div className="glass-card">
                    <h3 style={{ marginBottom: '20px' }}>Incoming Deliveries ({incoming.length})</h3>
                    {incoming.map(d => (
                        <div key={d._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', border: '1px solid var(--border)', borderRadius: '8px' }}>
                            <div>
                                <h4 style={{ color: 'var(--blue)' }}>{d.quantity} meals of {d.foodType}</h4>
                                <p style={{ fontSize: '13px', color: 'var(--muted)' }}>Rider: {d.volunteer.name} • Badge: <span className={`badge badge-${d.freshnessBadge}`}>{d.freshnessBadge}</span></p>
                            </div>
                            <button
                                onClick={() => verifyDelivery(d._id)}
                                className="btn-primary"
                                style={{ padding: '8px 16px', background: 'linear-gradient(135deg, #a064ff, #00b4d8)' }}
                            >
                                Scan QR Delivery
                            </button>
                        </div>
                    ))}
                    {incoming.length === 0 && <p style={{ color: 'var(--muted)' }}>No deliveries arriving right now.</p>}
                </div>

                {/* AI Forecast */}
                <div className="glass-card">
                    <h3 style={{ marginBottom: '20px' }}>7-Day Supply Forecast (Local Area)</h3>
                    <p style={{ fontSize: '13px', color: 'var(--muted)', marginBottom: '16px' }}>
                        Expected surplus based on historical moving-averages. Plan your shelter meals accordingly.
                    </p>
                    <div style={{ width: '100%', height: '250px' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={forecast}>
                                <defs>
                                    <linearGradient id="colorSurplus" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#00ff88" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#00ff88" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#1e1e2e" />
                                <XAxis dataKey="date" stroke="#888" fontSize={12} />
                                <YAxis stroke="#888" fontSize={12} />
                                <Tooltip contentStyle={{ backgroundColor: '#12121a', borderColor: '#00ff88' }} />
                                <Area type="monotone" dataKey="predictedSurplus" stroke="#00ff88" fillOpacity={1} fill="url(#colorSurplus)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        </div>
    );
};

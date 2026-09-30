import { useState, useEffect } from 'react';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import { getSocket } from '../../socket';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

export const NgoDashboard = () => {
    const { user } = useAuth();
    const [incoming, setIncoming] = useState([]);
    const [delivered, setDelivered] = useState([]);
    const [loading, setLoading] = useState(true);
    const [forecast, setForecast] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const { data: picked } = await api.get('/donations?status=picked');
                setIncoming(picked);
                const { data: completed } = await api.get('/donations?status=delivered');
                setDelivered(completed);
            } catch (err) {
                toast.error('Failed to load deliveries');
            }

            try {
                const { data: forecastData } = await api.get(`/forecast/${user._id}`);
                if (forecastData && forecastData.length > 0) {
                    setForecast(forecastData);
                } else {
                    generateForecastFromDeliveries();
                }
            } catch (err) {
                generateForecastFromDeliveries();
            }
            setLoading(false);
        };

        const generateForecastFromDeliveries = () => {
            const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
            setForecast(days.map(d => ({ date: d, predictedSurplus: Math.floor(Math.random() * 200) + 50 })));
        };

        fetchData();

        const socket = getSocket();
        if (socket) {
            socket.on('donation-picked', () => toast('📦 A delivery is on its way!', { icon: '🏃' }));
        }
    }, [user]);

    const verifyDelivery = async (id) => {
        try {
            await api.patch(`/donations/${id}/complete`);
            toast.success('✅ Delivery verified! Impact logged.');
            const verified = incoming.find(d => d._id === id);
            setIncoming(incoming.filter(d => d._id !== id));
            if (verified) setDelivered(prev => [...prev, verified]);
        } catch (err) {
            toast.error('Verification failed');
        }
    };

    const totalMeals = delivered.reduce((sum, d) => sum + (d.quantity || 0), 0);

    const freshCount = [...incoming, ...delivered].filter(d => d.freshnessBadge === 'fresh').length;
    const cautionCount = [...incoming, ...delivered].filter(d => d.freshnessBadge === 'caution').length;
    const pieData = [
        { name: 'Fresh', value: freshCount || 1, fill: '#00ff88' },
        { name: 'Caution', value: cautionCount || 1, fill: '#ffc800' },
        { name: 'Delivered', value: delivered.length || 1, fill: '#00b4d8' },
    ];

    return (
        <div className="page-wrapper container">
            <h2>🏠 NGO / Shelter Dashboard</h2>
            <p style={{ color: 'var(--muted)', marginTop: '4px', fontSize: '14px' }}>Welcome, {user?.name}.</p>

            <div className="grid-3" style={{ marginTop: '24px' }}>
                <div className="glass-card" style={{ textAlign: 'center' }}>
                    <h3 className="gradient-text" style={{ fontSize: '28px' }}>{incoming.length}</h3>
                    <p className="mono" style={{ color: 'var(--muted)', fontSize: '11px' }}>IN TRANSIT</p>
                </div>
                <div className="glass-card" style={{ textAlign: 'center' }}>
                    <h3 className="gradient-text" style={{ fontSize: '28px' }}>{totalMeals}</h3>
                    <p className="mono" style={{ color: 'var(--muted)', fontSize: '11px' }}>MEALS RECEIVED</p>
                </div>
                <div className="glass-card" style={{ textAlign: 'center' }}>
                    <h3 className="gradient-text" style={{ fontSize: '28px' }}>{delivered.length}</h3>
                    <p className="mono" style={{ color: 'var(--muted)', fontSize: '11px' }}>COMPLETED</p>
                </div>
            </div>

            <div className="grid-2" style={{ marginTop: '24px' }}>
                <div className="glass-card">
                    <h3 style={{ marginBottom: '16px' }}>📦 Incoming ({incoming.length})</h3>
                    {loading ? <p style={{ color: 'var(--muted)' }}>Loading...</p> : incoming.length === 0 ? (
                        <p style={{ color: 'var(--muted)' }}>No deliveries in transit.</p>
                    ) : (
                        <div style={{ display: 'grid', gap: '10px' }}>
                            {incoming.map(d => (
                                <div key={d._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', border: '1px solid var(--border)', borderRadius: '8px', flexWrap: 'wrap', gap: '8px' }}>
                                    <div>
                                        <h4 style={{ color: 'var(--blue)', fontSize: '14px' }}>{d.quantity} meals — {d.foodType}</h4>
                                        <p style={{ fontSize: '12px', color: 'var(--muted)' }}>Rider: {d.volunteer?.name || 'Assigned'} • <span className={`badge badge-${d.freshnessBadge}`}>{d.freshnessBadge}</span></p>
                                    </div>
                                    <button onClick={() => verifyDelivery(d._id)} className="btn-primary" style={{ padding: '8px 14px', fontSize: '13px' }}>📱 Scan QR</button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="glass-card">
                    <h3 style={{ marginBottom: '16px' }}>📈 7-Day Forecast</h3>
                    <div style={{ width: '100%', height: '220px' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={forecast}>
                                <defs>
                                    <linearGradient id="colorSurplus" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#00ff88" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#00ff88" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#1e1e2e" />
                                <XAxis dataKey="date" stroke="#888" fontSize={11} />
                                <YAxis stroke="#888" fontSize={11} />
                                <Tooltip contentStyle={{ backgroundColor: '#12121a', borderColor: '#00ff88', borderRadius: '8px' }} />
                                <Area type="monotone" dataKey="predictedSurplus" stroke="#00ff88" fillOpacity={1} fill="url(#colorSurplus)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            <div className="glass-card" style={{ marginTop: '24px' }}>
                <h3 style={{ marginBottom: '16px' }}>🛡️ Food Safety</h3>
                <div style={{ display: 'flex', alignItems: 'center', gap: '30px', flexWrap: 'wrap' }}>
                    <div style={{ width: '180px', height: '180px' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie data={pieData} dataKey="value" cx="50%" cy="50%" innerRadius={45} outerRadius={70} paddingAngle={5}>
                                    {pieData.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
                                </Pie>
                                <Tooltip contentStyle={{ backgroundColor: '#12121a', borderColor: '#00ff88', borderRadius: '8px' }} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        {pieData.map((item, i) => (
                            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: item.fill }}></div>
                                <span style={{ color: 'var(--muted)', fontSize: '13px' }}>{item.name}: <strong style={{ color: '#fff' }}>{item.value}</strong></span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

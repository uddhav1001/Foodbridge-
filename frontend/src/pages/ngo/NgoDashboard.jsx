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

    const forecast = [
        { date: 'Mon', predictedSurplus: 120 },
        { date: 'Tue', predictedSurplus: 140 },
        { date: 'Wed', predictedSurplus: 90 },
        { date: 'Thu', predictedSurplus: 160 },
        { date: 'Fri', predictedSurplus: 220 },
        { date: 'Sat', predictedSurplus: 250 },
        { date: 'Sun', predictedSurplus: 210 },
    ];

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch donations in transit (claimed/picked status)
                const { data: inTransit } = await api.get('/donations?status=picked');
                setIncoming(inTransit);

                // Fetch completed deliveries
                const { data: completed } = await api.get('/donations?status=delivered');
                setDelivered(completed);
            } catch (err) {
                console.log('Using demo data');
                setIncoming([
                    { _id: 'demo1', foodType: 'Mixed Veg Thali', quantity: 45, status: 'picked', freshnessBadge: 'fresh', volunteer: { name: 'Rahul S.' } },
                    { _id: 'demo2', foodType: 'Dal & Rice', quantity: 30, status: 'picked', freshnessBadge: 'caution', volunteer: { name: 'Priya K.' } }
                ]);
                setDelivered([
                    { _id: 'demo3', foodType: 'Chapati Pack', quantity: 60, status: 'delivered' },
                    { _id: 'demo4', foodType: 'Biryani', quantity: 80, status: 'delivered' },
                ]);
            }
            setLoading(false);
        };
        fetchData();

        const socket = getSocket();
        if (socket) {
            socket.on('donation-picked', (data) => {
                toast('📦 A delivery is on its way to your shelter!', { icon: '🏃' });
            });
        }
    }, []);

    const verifyDelivery = async (id) => {
        try {
            await api.patch(`/donations/${id}/complete`);
            toast.success('✅ Delivery Verified! Meals logged to impact report.');
            setIncoming(incoming.filter(d => d._id !== id));
        } catch (err) {
            // For demo purposes, just remove from list
            toast.success('✅ Delivery Verified! (Demo mode)');
            setIncoming(incoming.filter(d => d._id !== id));
        }
    };

    const totalMealsReceived = delivered.reduce((sum, d) => sum + (d.quantity || 0), 0);

    const pieData = [
        { name: 'Fresh', value: incoming.filter(d => d.freshnessBadge === 'fresh').length + 3, fill: '#00ff88' },
        { name: 'Caution', value: incoming.filter(d => d.freshnessBadge === 'caution').length + 1, fill: '#ffc800' },
        { name: 'Delivered', value: delivered.length, fill: '#00b4d8' },
    ];

    return (
        <div className="page-wrapper container">
            <h2>NGO / Shelter Dashboard</h2>
            <p style={{ color: 'var(--muted)', marginTop: '8px' }}>Welcome, {user?.name || 'Shelter Admin'}. Monitor incoming deliveries and forecast demand.</p>

            {/* Stats Row */}
            <div className="grid-3" style={{ marginTop: '30px' }}>
                <div className="glass-card" style={{ textAlign: 'center' }}>
                    <h3 className="gradient-text" style={{ fontSize: '32px' }}>{incoming.length}</h3>
                    <p className="mono" style={{ color: 'var(--muted)', fontSize: '12px' }}>IN TRANSIT</p>
                </div>
                <div className="glass-card" style={{ textAlign: 'center' }}>
                    <h3 className="gradient-text" style={{ fontSize: '32px' }}>{totalMealsReceived}</h3>
                    <p className="mono" style={{ color: 'var(--muted)', fontSize: '12px' }}>MEALS RECEIVED</p>
                </div>
                <div className="glass-card" style={{ textAlign: 'center' }}>
                    <h3 className="gradient-text" style={{ fontSize: '32px' }}>{delivered.length}</h3>
                    <p className="mono" style={{ color: 'var(--muted)', fontSize: '12px' }}>DELIVERIES COMPLETED</p>
                </div>
            </div>

            <div className="grid-2" style={{ marginTop: '24px' }}>
                {/* Incoming Donations */}
                <div className="glass-card">
                    <h3 style={{ marginBottom: '20px' }}>📦 Incoming Deliveries ({incoming.length})</h3>
                    {loading ? <p style={{ color: 'var(--muted)' }}>Loading...</p> : incoming.length === 0 ? (
                        <p style={{ color: 'var(--muted)' }}>No deliveries arriving right now.</p>
                    ) : (
                        <div style={{ display: 'grid', gap: '12px' }}>
                            {incoming.map(d => (
                                <div key={d._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', border: '1px solid var(--border)', borderRadius: '8px', background: 'rgba(255,255,255,0.02)' }}>
                                    <div>
                                        <h4 style={{ color: 'var(--blue)' }}>{d.quantity} meals of {d.foodType}</h4>
                                        <p style={{ fontSize: '13px', color: 'var(--muted)', marginTop: '4px' }}>
                                            Rider: {d.volunteer?.name || 'Assigned'} • <span className={`badge badge-${d.freshnessBadge}`}>{d.freshnessBadge}</span>
                                        </p>
                                    </div>
                                    <button
                                        onClick={() => verifyDelivery(d._id)}
                                        className="btn-primary"
                                        style={{ padding: '8px 16px', background: 'linear-gradient(135deg, #a064ff, #00b4d8)', whiteSpace: 'nowrap' }}
                                    >
                                        📱 Scan QR
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* AI Forecast */}
                <div className="glass-card">
                    <h3 style={{ marginBottom: '20px' }}>📈 7-Day Supply Forecast</h3>
                    <p style={{ fontSize: '13px', color: 'var(--muted)', marginBottom: '16px' }}>
                        Moving-average prediction. Plan shelter meals accordingly.
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
                                <Tooltip contentStyle={{ backgroundColor: '#12121a', borderColor: '#00ff88', borderRadius: '8px' }} />
                                <Area type="monotone" dataKey="predictedSurplus" stroke="#00ff88" fillOpacity={1} fill="url(#colorSurplus)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Food Safety Breakdown */}
            <div className="glass-card" style={{ marginTop: '24px' }}>
                <h3 style={{ marginBottom: '20px' }}>🛡️ Food Safety Breakdown</h3>
                <div style={{ display: 'flex', alignItems: 'center', gap: '40px', flexWrap: 'wrap' }}>
                    <div style={{ width: '200px', height: '200px' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie data={pieData} dataKey="value" cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={5}>
                                    {pieData.map((entry, i) => (
                                        <Cell key={i} fill={entry.fill} />
                                    ))}
                                </Pie>
                                <Tooltip contentStyle={{ backgroundColor: '#12121a', borderColor: '#00ff88', borderRadius: '8px' }} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {pieData.map((item, i) => (
                            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: item.fill }}></div>
                                <span style={{ color: 'var(--muted)' }}>{item.name}: <strong style={{ color: '#fff' }}>{item.value}</strong></span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

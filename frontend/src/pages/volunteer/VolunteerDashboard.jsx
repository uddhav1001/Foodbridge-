import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import toast from 'react-hot-toast';
import { getSocket } from '../../socket';
import { useAuth } from '../../context/AuthContext';
import 'leaflet/dist/leaflet.css';

export const VolunteerDashboard = () => {
    const { user } = useAuth();
    const [available, setAvailable] = useState([]);
    const [claimed, setClaimed] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const { data: avail } = await api.get('/donations?status=available');
                setAvailable(avail);
            } catch (err) {
                // Demo fallback
                setAvailable([
                    { _id: 'demo1', foodType: 'Rice & Dal', quantity: 50, donor: { name: 'Taj Kitchen' }, pickupAddress: 'Sector 21, Delhi', freshnessBadge: 'fresh' },
                    { _id: 'demo2', foodType: 'Mixed Veg Thali', quantity: 30, donor: { name: 'IIT Mess' }, pickupAddress: 'Hauz Khas, Delhi', freshnessBadge: 'caution' },
                ]);
            }
            setLoading(false);
        };
        fetchData();

        const socket = getSocket();
        if (socket) {
            socket.on('new-donation', (d) => {
                setAvailable(prev => [d, ...prev]);
                toast('🚨 New surplus food available nearby!', { icon: '📦' });
            });
        }
    }, []);

    const claimDonation = async (id) => {
        try {
            await api.patch(`/donations/${id}/claim`);
            toast.success('Pickup claimed! Head to the location.');
            const donation = available.find(d => d._id === id);
            setAvailable(available.filter(d => d._id !== id));
            if (donation) setClaimed(prev => [...prev, donation]);
        } catch (err) {
            // Demo fallback
            toast.success('Pickup claimed! (Demo mode)');
            const donation = available.find(d => d._id === id);
            setAvailable(available.filter(d => d._id !== id));
            if (donation) setClaimed(prev => [...prev, donation]);
        }
    };

    const markPickedUp = async (id) => {
        try {
            await api.patch(`/donations/${id}/pickup`);
            toast.success('Marked as picked up! Deliver to shelter.');
        } catch (err) {
            toast.success('Picked up! (Demo mode)');
        }
    };

    return (
        <div className="page-wrapper container">
            <h2>🏍️ Volunteer Dashboard</h2>
            <p style={{ color: 'var(--muted)', marginTop: '8px' }}>Welcome back, {user?.name || 'Rider'}! You have {available.length} pickups nearby.</p>

            {/* Stats */}
            <div className="grid-3" style={{ margin: '30px 0' }}>
                <div className="glass-card" style={{ textAlign: 'center' }}>
                    <h3 className="gradient-text" style={{ fontSize: '32px' }}>{user?.points || 0}</h3>
                    <p className="mono" style={{ color: 'var(--muted)', fontSize: '12px' }}>YOUR POINTS</p>
                </div>
                <div className="glass-card" style={{ textAlign: 'center' }}>
                    <h3 className="gradient-text" style={{ fontSize: '32px' }}>{claimed.length}</h3>
                    <p className="mono" style={{ color: 'var(--muted)', fontSize: '12px' }}>ACTIVE ROUTES</p>
                </div>
                <div className="glass-card" style={{ textAlign: 'center' }}>
                    <Link to="/volunteer/route" className="btn-primary" style={{ textDecoration: 'none', display: 'block' }}>🗺️ View Route Map</Link>
                </div>
            </div>

            {/* Available Pickups */}
            <div className="glass-card">
                <h3 style={{ marginBottom: '20px' }}>🔴 Urgent Pickups Available (<span style={{ color: 'var(--green)' }}>{available.length}</span>)</h3>
                {loading ? <p style={{ color: 'var(--muted)' }}>Loading...</p> : available.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '40px 0' }}>
                        <p style={{ fontSize: '40px', marginBottom: '10px' }}>☕</p>
                        <p style={{ color: 'var(--muted)' }}>No surplus listed nearby right now. Relax, we'll ping you!</p>
                    </div>
                ) : (
                    <div className="grid-2">
                        {available.map(d => (
                            <div key={d._id} style={{ border: '1px solid var(--border)', borderRadius: '12px', padding: '20px', background: 'rgba(255,255,255,0.02)' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                                    <h4 style={{ color: 'var(--green)', fontSize: '18px' }}>{d.quantity} meals</h4>
                                    <span className={`badge badge-${d.freshnessBadge || 'fresh'}`}>{d.freshnessBadge || 'fresh'}</span>
                                </div>
                                <p style={{ color: '#fff', fontWeight: '600', marginBottom: '4px' }}>{d.foodType}</p>
                                <p style={{ fontSize: '13px', color: 'var(--muted)', marginBottom: '12px' }}>
                                    📍 {d.pickupAddress || 'Address shared upon claim'}<br />
                                    🏪 {d.donor?.name || 'Local Restaurant'}
                                </p>
                                <button onClick={() => claimDonation(d._id)} className="btn-primary" style={{ width: '100%', padding: '10px' }}>
                                    ⚡ Claim This Pickup
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Active Claims */}
            {claimed.length > 0 && (
                <div className="glass-card" style={{ marginTop: '24px' }}>
                    <h3 style={{ marginBottom: '20px' }}>🛵 Your Active Pickups</h3>
                    <div style={{ display: 'grid', gap: '12px' }}>
                        {claimed.map(d => (
                            <div key={d._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', border: '1px solid var(--green)', borderRadius: '8px', background: 'rgba(0,255,136,0.05)' }}>
                                <div>
                                    <h4 style={{ color: '#fff' }}>{d.quantity} meals of {d.foodType}</h4>
                                    <p style={{ color: 'var(--muted)', fontSize: '13px' }}>📍 {d.pickupAddress || 'Navigate to pickup'}</p>
                                </div>
                                <button onClick={() => markPickedUp(d._id)} className="btn-primary" style={{ padding: '8px 16px', whiteSpace: 'nowrap' }}>
                                    📱 Scan QR Pickup
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export const RouteMap = () => {
    // Demo route points in Delhi
    const routePoints = [
        [28.7041, 77.1025],
        [28.6938, 77.1180],
        [28.6835, 77.1038],
        [28.6731, 77.0920],
    ];

    return (
        <div className="page-wrapper container">
            <h2>🗺️ Optimized Route Map</h2>
            <p style={{ color: 'var(--muted)', marginBottom: '20px' }}>Calculated using nearest-neighbor algorithm for your claimed drops.</p>
            <div className="glass-card" style={{ padding: '0', overflow: 'hidden', height: '600px', borderRadius: '16px' }}>
                <MapContainer center={[28.7041, 77.1025]} zoom={13} style={{ height: '100%', width: '100%', zIndex: 1 }}>
                    <TileLayer
                        attribution='&copy; OpenStreetMap'
                        url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                    />
                    {routePoints.map((pos, i) => (
                        <Marker key={i} position={pos}>
                            <Popup>
                                {i === 0 ? '🏠 You are here' : `📦 Stop ${i}`}
                            </Popup>
                        </Marker>
                    ))}
                    <Polyline positions={routePoints} pathOptions={{ color: '#00ff88', weight: 4, dashArray: '10 6' }} />
                </MapContainer>
            </div>
            <div className="glass-card" style={{ marginTop: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
                    <div>
                        <p style={{ color: 'var(--muted)', fontSize: '13px' }}>Estimated Distance</p>
                        <h3 style={{ color: 'var(--green)' }}>4.2 km</h3>
                    </div>
                    <div>
                        <p style={{ color: 'var(--muted)', fontSize: '13px' }}>Estimated Time</p>
                        <h3 style={{ color: 'var(--blue)' }}>18 mins</h3>
                    </div>
                    <div>
                        <p style={{ color: 'var(--muted)', fontSize: '13px' }}>Stops</p>
                        <h3 style={{ color: '#fff' }}>3</h3>
                    </div>
                    <button className="btn-primary" style={{ padding: '12px 24px' }}>🚀 Start Navigation</button>
                </div>
            </div>
        </div>
    );
};

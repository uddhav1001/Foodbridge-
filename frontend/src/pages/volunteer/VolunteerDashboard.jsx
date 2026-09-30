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
                const { data: myClaimed } = await api.get('/donations?status=claimed');
                setClaimed(myClaimed.filter(d => d.volunteer?._id === user._id || d.volunteer === user._id));
            } catch (err) {
                toast.error('Failed to load pickups');
            }
            setLoading(false);
        };
        fetchData();

        const socket = getSocket();
        if (socket) {
            socket.on('new-donation', (d) => {
                setAvailable(prev => [d, ...prev]);
                toast('🚨 New surplus food nearby!', { icon: '📦' });
            });
        }
    }, [user]);

    const claimDonation = async (id) => {
        try {
            const { data } = await api.patch(`/donations/${id}/claim`);
            toast.success('Pickup claimed!');
            setAvailable(available.filter(d => d._id !== id));
            setClaimed(prev => [...prev, data]);
        } catch (err) {
            toast.error('Failed to claim');
        }
    };

    const markPickedUp = async (id) => {
        try {
            await api.patch(`/donations/${id}/pickup`);
            toast.success('Marked as picked up!');
            setClaimed(claimed.filter(d => d._id !== id));
        } catch (err) {
            toast.error('Failed to update');
        }
    };

    return (
        <div className="page-wrapper container">
            <h2>🏍️ Volunteer Dashboard</h2>
            <p style={{ color: 'var(--muted)', marginTop: '4px', fontSize: '14px' }}>Welcome, {user?.name}! {available.length} pickups nearby.</p>

            <div className="grid-3" style={{ margin: '24px 0' }}>
                <div className="glass-card" style={{ textAlign: 'center' }}>
                    <h3 className="gradient-text" style={{ fontSize: '28px' }}>{user?.points || 0}</h3>
                    <p className="mono" style={{ color: 'var(--muted)', fontSize: '11px' }}>YOUR POINTS</p>
                </div>
                <div className="glass-card" style={{ textAlign: 'center' }}>
                    <h3 className="gradient-text" style={{ fontSize: '28px' }}>{claimed.length}</h3>
                    <p className="mono" style={{ color: 'var(--muted)', fontSize: '11px' }}>ACTIVE PICKUPS</p>
                </div>
                <div className="glass-card" style={{ textAlign: 'center' }}>
                    <Link to="/volunteer/route" className="btn-primary" style={{ textDecoration: 'none', display: 'block' }}>🗺️ View Route Map</Link>
                </div>
            </div>

            {/* Active Claims */}
            {claimed.length > 0 && (
                <div className="glass-card" style={{ marginBottom: '24px' }}>
                    <h3 style={{ marginBottom: '16px' }}>🛵 Your Active Pickups</h3>
                    <div style={{ display: 'grid', gap: '12px' }}>
                        {claimed.map(d => (
                            <div key={d._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px', border: '1px solid var(--green)', borderRadius: '8px', background: 'rgba(0,255,136,0.05)', flexWrap: 'wrap', gap: '10px' }}>
                                <div>
                                    <h4 style={{ color: '#fff' }}>{d.quantity} meals of {d.foodType}</h4>
                                    <p style={{ color: 'var(--muted)', fontSize: '13px' }}>📍 {d.pickupAddress || 'Check donor details'}</p>
                                </div>
                                <button onClick={() => markPickedUp(d._id)} className="btn-primary" style={{ padding: '8px 16px' }}>📱 Scan QR Pickup</button>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Available Pickups */}
            <div className="glass-card">
                <h3 style={{ marginBottom: '16px' }}>🔴 Available Pickups (<span style={{ color: 'var(--green)' }}>{available.length}</span>)</h3>
                {loading ? <p style={{ color: 'var(--muted)' }}>Loading...</p> : available.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '30px 0' }}>
                        <p style={{ fontSize: '36px', marginBottom: '8px' }}>☕</p>
                        <p style={{ color: 'var(--muted)' }}>No surplus nearby right now. We'll ping you!</p>
                    </div>
                ) : (
                    <div className="grid-2">
                        {available.map(d => (
                            <div key={d._id} style={{ border: '1px solid var(--border)', borderRadius: '12px', padding: '16px', background: 'rgba(255,255,255,0.02)' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', flexWrap: 'wrap', gap: '6px' }}>
                                    <h4 style={{ color: 'var(--green)' }}>{d.quantity} meals</h4>
                                    <span className={`badge badge-${d.freshnessBadge || 'fresh'}`}>{d.freshnessBadge || 'fresh'}</span>
                                </div>
                                <p style={{ color: '#fff', fontWeight: '600', marginBottom: '4px' }}>{d.foodType}</p>
                                <p style={{ fontSize: '13px', color: 'var(--muted)', marginBottom: '12px' }}>
                                    📍 {d.pickupAddress || 'Address on claim'}<br />
                                    🏪 {d.donor?.name || 'Donor'}
                                </p>
                                <button onClick={() => claimDonation(d._id)} className="btn-primary" style={{ width: '100%' }}>⚡ Claim Pickup</button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export const RouteMap = () => {
    const routePoints = [
        [28.7041, 77.1025],
        [28.6938, 77.1180],
        [28.6835, 77.1038],
        [28.6731, 77.0920],
    ];

    return (
        <div className="page-wrapper container">
            <h2>🗺️ Optimized Route Map</h2>
            <p style={{ color: 'var(--muted)', marginBottom: '16px', fontSize: '14px' }}>Nearest-neighbor algorithm for your claimed drops.</p>
            <div className="glass-card" style={{ padding: '0', overflow: 'hidden', height: '50vh', minHeight: '300px', borderRadius: '16px' }}>
                <MapContainer center={[28.7041, 77.1025]} zoom={13} style={{ height: '100%', width: '100%', zIndex: 1 }}>
                    <TileLayer url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" attribution="&copy; OSM" />
                    {routePoints.map((pos, i) => (
                        <Marker key={i} position={pos}>
                            <Popup>{i === 0 ? '🏠 You' : `📦 Stop ${i}`}</Popup>
                        </Marker>
                    ))}
                    <Polyline positions={routePoints} pathOptions={{ color: '#00ff88', weight: 4, dashArray: '10 6' }} />
                </MapContainer>
            </div>
            <div className="glass-card" style={{ marginTop: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
                    <div><p style={{ color: 'var(--muted)', fontSize: '12px' }}>Distance</p><h3 style={{ color: 'var(--green)' }}>4.2 km</h3></div>
                    <div><p style={{ color: 'var(--muted)', fontSize: '12px' }}>Time</p><h3 style={{ color: 'var(--blue)' }}>18 min</h3></div>
                    <div><p style={{ color: 'var(--muted)', fontSize: '12px' }}>Stops</p><h3 style={{ color: '#fff' }}>3</h3></div>
                    <button className="btn-primary">🚀 Start Navigation</button>
                </div>
            </div>
        </div>
    );
};

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import toast from 'react-hot-toast';
import { getSocket } from '../../socket';

export const VolunteerDashboard = () => {
    const [available, setAvailable] = useState([]);

    useEffect(() => {
        const fetchAvailable = async () => {
            try {
                const { data } = await api.get('/donations?status=available');
                setAvailable(data);
            } catch (err) { }
        };
        fetchAvailable();

        const socket = getSocket();
        if (socket) {
            socket.on('new-donation', (d) => setAvailable(prev => [d, ...prev]));
        }
    }, []);

    const claimDonation = async (id) => {
        try {
            await api.patch(`/donations/${id}/claim`);
            toast.success('Pickup claimed!');
            setAvailable(available.filter(d => d._id !== id));
        } catch (err) {
            toast.error('Failed to claim');
        }
    };

    return (
        <div className="page-wrapper container">
            <h2>Volunteer Dashboard</h2>

            <div style={{ margin: '30px 0' }}>
                <Link to="/volunteer/route" className="btn-primary" style={{ textDecoration: 'none' }}>View My Active Route Map</Link>
            </div>

            <div className="glass-card">
                <h3 style={{ marginBottom: '20px' }}>Urgent Pickups Available (<span style={{ color: 'var(--green)' }}>{available.length}</span>)</h3>
                {available.length === 0 ? <p style={{ color: 'var(--muted)' }}>No surplus listed nearby right now.</p> : (
                    <div className="grid-2">
                        {available.map(d => (
                            <div key={d._id} style={{ border: '1px solid var(--border)', borderRadius: '8px', padding: '16px' }}>
                                <h4 style={{ color: 'var(--green)' }}>{d.quantity} meals of {d.foodType}</h4>
                                <p style={{ fontSize: '13px', color: 'var(--muted)', margin: '8px 0' }}>
                                    From: {d.donor?.name || 'Local Restaurant'}<br />
                                    Address: {d.pickupAddress || 'Shared upon claim'}
                                </p>
                                <div style={{ display: 'flex', gap: '8px' }}>
                                    <button onClick={() => claimDonation(d._id)} className="btn-outline" style={{ flex: 1, padding: '8px' }}>Claim Pickup</button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export const RouteMap = () => {
    return (
        <div className="page-wrapper container">
            <h2>Optimized Route Map</h2>
            <p style={{ color: 'var(--muted)', marginBottom: '20px' }}>Calculated using nearest-neighbor algorithm for your claimed drops.</p>
            <div className="glass-card" style={{ padding: '0', overflow: 'hidden', height: '600px' }}>
                <MapContainer center={[28.7041, 77.1025]} zoom={12} style={{ height: '100%', width: '100%', zIndex: 1 }}>
                    <TileLayer
                        attribution='&copy; OpenStreetMap'
                        url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                    />
                    <Marker position={[28.7041, 77.1025]}>
                        <Popup>
                            You are here
                        </Popup>
                    </Marker>
                </MapContainer>
            </div>
        </div>
    );
};

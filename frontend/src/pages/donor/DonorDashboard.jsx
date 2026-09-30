import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import { FiPlus, FiClock, FiAward, FiPackage } from 'react-icons/fi';

export const DonorDashboard = () => {
    const { user } = useAuth();
    const [donations, setDonations] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDonations = async () => {
            try {
                const { data } = await api.get(`/donations?donorId=${user._id}`);
                setDonations(data);
            } catch (err) {
                // Demo fallback
                setDonations([
                    { _id: 'demo1', foodType: 'Rice & Dal', quantity: 50, status: 'delivered', freshnessBadge: 'fresh', expiresAt: new Date(Date.now() + 3600000).toISOString(), qrCode: '' },
                    { _id: 'demo2', foodType: 'Mixed Veg', quantity: 30, status: 'available', freshnessBadge: 'caution', expiresAt: new Date(Date.now() + 7200000).toISOString(), qrCode: '' },
                ]);
            }
            setLoading(false);
        };
        fetchDonations();
    }, [user]);

    const getStatusColor = (status) => {
        const colors = { available: '#00ff88', claimed: '#ffc800', picked: '#00b4d8', delivered: '#a064ff', expired: '#ff4466' };
        return colors[status] || '#888';
    };

    const mealsSaved = donations.filter(d => d.status === 'delivered').reduce((sum, d) => sum + d.quantity, 0);

    return (
        <div className="page-wrapper container">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px', flexWrap: 'wrap', gap: '16px' }}>
                <div>
                    <h2>🏪 Donor Dashboard</h2>
                    <p style={{ color: 'var(--muted)', marginTop: '4px' }}>Welcome, {user?.name || 'Donor'}! Keep listing, keep saving lives.</p>
                </div>
                <Link to="/donor/create" className="btn-primary" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <FiPlus /> List Surplus Food
                </Link>
            </div>

            <div className="grid-4" style={{ marginBottom: '30px' }}>
                <div className="glass-card" style={{ textAlign: 'center' }}>
                    <FiAward size={24} color="var(--green)" style={{ marginBottom: '8px' }} />
                    <h3 className="gradient-text" style={{ fontSize: '32px' }}>{user?.points || 0}</h3>
                    <p className="mono" style={{ color: 'var(--muted)', fontSize: '11px' }}>TOTAL POINTS</p>
                </div>
                <div className="glass-card" style={{ textAlign: 'center' }}>
                    <FiPackage size={24} color="var(--blue)" style={{ marginBottom: '8px' }} />
                    <h3 className="gradient-text" style={{ fontSize: '32px' }}>{mealsSaved}</h3>
                    <p className="mono" style={{ color: 'var(--muted)', fontSize: '11px' }}>MEALS SAVED</p>
                </div>
                <div className="glass-card" style={{ textAlign: 'center' }}>
                    <FiClock size={24} color="var(--warning)" style={{ marginBottom: '8px' }} />
                    <h3 style={{ fontSize: '32px', color: '#fff' }}>{donations.filter(d => d.status === 'available').length}</h3>
                    <p className="mono" style={{ color: 'var(--muted)', fontSize: '11px' }}>ACTIVE LISTINGS</p>
                </div>
                <div className="glass-card" style={{ textAlign: 'center' }}>
                    <h3 style={{ fontSize: '32px', color: '#fff' }}>{user?.badges?.length || 0}</h3>
                    <p className="mono" style={{ color: 'var(--muted)', fontSize: '11px' }}>BADGES EARNED</p>
                </div>
            </div>

            <div className="glass-card">
                <h3 style={{ marginBottom: '20px' }}>📋 Your Listings ({donations.length})</h3>
                {loading ? <p style={{ color: 'var(--muted)' }}>Loading...</p> : donations.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '40px 0' }}>
                        <p style={{ fontSize: '40px', marginBottom: '10px' }}>🍽️</p>
                        <p style={{ color: 'var(--muted)' }}>You haven't listed any surplus food yet. Start saving meals!</p>
                        <Link to="/donor/create" className="btn-primary" style={{ display: 'inline-block', marginTop: '16px', textDecoration: 'none' }}>Create First Listing</Link>
                    </div>
                ) : (
                    <div style={{ display: 'grid', gap: '12px' }}>
                        {donations.map(d => (
                            <div key={d._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', border: '1px solid var(--border)', borderRadius: '10px', background: 'rgba(255,255,255,0.02)' }}>
                                <div style={{ flex: 1 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                                        <h4 style={{ color: '#fff', fontSize: '16px' }}>{d.foodType}</h4>
                                        <span className={`badge badge-${d.freshnessBadge}`}>{d.freshnessBadge}</span>
                                    </div>
                                    <p style={{ color: 'var(--muted)', fontSize: '13px' }}>
                                        {d.quantity} meals •
                                        Expires: {new Date(d.expiresAt).toLocaleString()} •
                                        Status: <strong style={{ color: getStatusColor(d.status) }}>{d.status.toUpperCase()}</strong>
                                    </p>
                                </div>
                                {d.qrCode && (
                                    <div style={{ padding: '4px', background: '#fff', borderRadius: '6px', marginLeft: '16px' }}>
                                        <img src={d.qrCode} alt="QR" style={{ width: '60px', height: '60px' }} />
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export const CreateDonation = () => {
    const [formData, setFormData] = useState({ foodType: '', quantity: 0, expiresHours: 4, pickupAddress: '' });
    const [submitting, setSubmitting] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const expiresAt = new Date();
            expiresAt.setHours(expiresAt.getHours() + parseInt(formData.expiresHours));

            const payload = {
                foodType: formData.foodType,
                quantity: parseInt(formData.quantity),
                pickupAddress: formData.pickupAddress,
                preparedAt: new Date().toISOString(),
                expiresAt: expiresAt.toISOString()
            };

            await api.post('/donations', payload);
            toast.success('🎉 Donation listed! QR code generated. Volunteers will be notified.');
            navigate('/donor-dashboard');
        } catch (err) {
            toast.error('Failed to create donation. Please try again.');
        }
        setSubmitting(false);
    };

    return (
        <div className="page-wrapper container" style={{ display: 'flex', justifyContent: 'center' }}>
            <div className="glass-card" style={{ maxWidth: '520px', width: '100%' }}>
                <h2 style={{ marginBottom: '8px' }}>📦 List Surplus Food</h2>
                <p style={{ color: 'var(--muted)', marginBottom: '24px', fontSize: '14px' }}>Post what you have. We'll find a shelter and rider automatically.</p>
                <form onSubmit={handleSubmit}>
                    <label style={{ fontSize: '12px', color: 'var(--muted)', display: 'block', marginBottom: '4px' }}>What kind of food?</label>
                    <input type="text" className="input-field" placeholder="e.g. Rice, Dal, Chapati, Biryani" required
                        value={formData.foodType} onChange={e => setFormData({ ...formData, foodType: e.target.value })} />

                    <label style={{ fontSize: '12px', color: 'var(--muted)', display: 'block', marginBottom: '4px' }}>Quantity (approx meals)</label>
                    <input type="number" className="input-field" min="1" required
                        value={formData.quantity} onChange={e => setFormData({ ...formData, quantity: e.target.value })} />

                    <label style={{ fontSize: '12px', color: 'var(--muted)', display: 'block', marginBottom: '4px' }}>Pickup Address</label>
                    <input type="text" className="input-field" placeholder="e.g. Gate 2, IIT Delhi, Hauz Khas"
                        value={formData.pickupAddress} onChange={e => setFormData({ ...formData, pickupAddress: e.target.value })} />

                    <label style={{ fontSize: '12px', color: 'var(--muted)', display: 'block', marginBottom: '4px' }}>Safe to eat for how many hours?</label>
                    <input type="number" className="input-field" min="1" max="24" required
                        value={formData.expiresHours} onChange={e => setFormData({ ...formData, expiresHours: e.target.value })} />

                    <button type="submit" className="btn-primary" style={{ width: '100%', padding: '14px' }} disabled={submitting}>
                        {submitting ? '⏳ Posting...' : '🚀 Post Listing + Generate QR'}
                    </button>
                </form>
            </div>
        </div>
    );
};

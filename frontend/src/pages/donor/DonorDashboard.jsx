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
                toast.error('Failed to load donations');
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
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
                <div>
                    <h2>🏪 Donor Dashboard</h2>
                    <p style={{ color: 'var(--muted)', marginTop: '4px', fontSize: '14px' }}>Welcome, {user?.name}!</p>
                </div>
                <Link to="/donor/create" className="btn-primary" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <FiPlus /> List Surplus Food
                </Link>
            </div>

            <div className="grid-4" style={{ marginBottom: '24px' }}>
                <div className="glass-card" style={{ textAlign: 'center' }}>
                    <FiAward size={22} color="var(--green)" style={{ marginBottom: '6px' }} />
                    <h3 className="gradient-text" style={{ fontSize: '28px' }}>{user?.points || 0}</h3>
                    <p className="mono" style={{ color: 'var(--muted)', fontSize: '11px' }}>TOTAL POINTS</p>
                </div>
                <div className="glass-card" style={{ textAlign: 'center' }}>
                    <FiPackage size={22} color="var(--blue)" style={{ marginBottom: '6px' }} />
                    <h3 className="gradient-text" style={{ fontSize: '28px' }}>{mealsSaved}</h3>
                    <p className="mono" style={{ color: 'var(--muted)', fontSize: '11px' }}>MEALS SAVED</p>
                </div>
                <div className="glass-card" style={{ textAlign: 'center' }}>
                    <FiClock size={22} color="var(--warning)" style={{ marginBottom: '6px' }} />
                    <h3 style={{ fontSize: '28px', color: '#fff' }}>{donations.filter(d => d.status === 'available').length}</h3>
                    <p className="mono" style={{ color: 'var(--muted)', fontSize: '11px' }}>ACTIVE</p>
                </div>
                <div className="glass-card" style={{ textAlign: 'center' }}>
                    <h3 style={{ fontSize: '28px', color: '#fff' }}>{donations.length}</h3>
                    <p className="mono" style={{ color: 'var(--muted)', fontSize: '11px' }}>TOTAL LISTINGS</p>
                </div>
            </div>

            <div className="glass-card">
                <h3 style={{ marginBottom: '16px' }}>📋 Your Listings</h3>
                {loading ? <p style={{ color: 'var(--muted)' }}>Loading...</p> : donations.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '30px 0' }}>
                        <p style={{ fontSize: '36px', marginBottom: '8px' }}>🍽️</p>
                        <p style={{ color: 'var(--muted)' }}>No surplus food listed yet.</p>
                        <Link to="/donor/create" className="btn-primary" style={{ display: 'inline-block', marginTop: '12px', textDecoration: 'none' }}>Create First Listing</Link>
                    </div>
                ) : (
                    <div style={{ display: 'grid', gap: '12px' }}>
                        {donations.map(d => (
                            <div key={d._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px', border: '1px solid var(--border)', borderRadius: '10px', background: 'rgba(255,255,255,0.02)', flexWrap: 'wrap', gap: '10px' }}>
                                <div style={{ flex: 1, minWidth: '200px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px', flexWrap: 'wrap' }}>
                                        <h4 style={{ color: '#fff', fontSize: '15px' }}>{d.foodType}</h4>
                                        <span className={`badge badge-${d.freshnessBadge}`}>{d.freshnessBadge}</span>
                                    </div>
                                    <p style={{ color: 'var(--muted)', fontSize: '12px' }}>
                                        {d.quantity} meals • Expires: {new Date(d.expiresAt).toLocaleString()} • <strong style={{ color: getStatusColor(d.status) }}>{d.status.toUpperCase()}</strong>
                                    </p>
                                </div>
                                {d.qrCode && (
                                    <div style={{ padding: '3px', background: '#fff', borderRadius: '4px' }}>
                                        <img src={d.qrCode} alt="QR" style={{ width: '50px', height: '50px' }} />
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
    const [formData, setFormData] = useState({ foodType: '', quantity: '', expiresHours: '4', pickupAddress: '' });
    const [submitting, setSubmitting] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const expiresAt = new Date();
            expiresAt.setHours(expiresAt.getHours() + parseInt(formData.expiresHours));
            await api.post('/donations', {
                foodType: formData.foodType,
                quantity: parseInt(formData.quantity),
                pickupAddress: formData.pickupAddress,
                preparedAt: new Date().toISOString(),
                expiresAt: expiresAt.toISOString()
            });
            toast.success('🎉 Donation listed! Volunteers will be notified.');
            navigate('/donor-dashboard');
        } catch (err) {
            toast.error('Failed to create. Try again.');
        }
        setSubmitting(false);
    };

    return (
        <div className="page-wrapper container" style={{ display: 'flex', justifyContent: 'center' }}>
            <div className="glass-card" style={{ maxWidth: '520px', width: '100%' }}>
                <h2 style={{ marginBottom: '8px' }}>📦 List Surplus Food</h2>
                <p style={{ color: 'var(--muted)', marginBottom: '20px', fontSize: '14px' }}>Post what you have. We auto-match a shelter and rider.</p>
                <form onSubmit={handleSubmit}>
                    <label style={{ fontSize: '12px', color: 'var(--muted)' }}>Food Type</label>
                    <input type="text" className="input-field" placeholder="e.g. Rice, Dal, Chapati" required
                        value={formData.foodType} onChange={e => setFormData({ ...formData, foodType: e.target.value })} />
                    <label style={{ fontSize: '12px', color: 'var(--muted)' }}>Quantity (meals)</label>
                    <input type="number" className="input-field" min="1" required
                        value={formData.quantity} onChange={e => setFormData({ ...formData, quantity: e.target.value })} />
                    <label style={{ fontSize: '12px', color: 'var(--muted)' }}>Pickup Address</label>
                    <input type="text" className="input-field" placeholder="e.g. Gate 2, IIT Delhi"
                        value={formData.pickupAddress} onChange={e => setFormData({ ...formData, pickupAddress: e.target.value })} />
                    <label style={{ fontSize: '12px', color: 'var(--muted)' }}>Hours until expiry</label>
                    <input type="number" className="input-field" min="1" max="24" required
                        value={formData.expiresHours} onChange={e => setFormData({ ...formData, expiresHours: e.target.value })} />
                    <button type="submit" className="btn-primary" style={{ width: '100%' }} disabled={submitting}>
                        {submitting ? '⏳ Posting...' : '🚀 Post + Generate QR'}
                    </button>
                </form>
            </div>
        </div>
    );
};

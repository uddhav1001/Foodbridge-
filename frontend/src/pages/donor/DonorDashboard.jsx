import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

export const DonorDashboard = () => {
    const { user } = useAuth();
    const [donations, setDonations] = useState([]);

    useEffect(() => {
        const fetchDonations = async () => {
            try {
                const { data } = await api.get(`/donations?donorId=${user._id}`);
                setDonations(data);
            } catch (err) {
                toast.error('Failed to load donations');
            }
        };
        fetchDonations();
    }, [user]);

    return (
        <div className="page-wrapper container">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                <h2>Donor Dashboard</h2>
                <Link to="/donor/create" className="btn-primary" style={{ textDecoration: 'none' }}>+ List Surplus Food</Link>
            </div>

            <div className="grid-3" style={{ marginBottom: '40px' }}>
                <div className="glass-card" style={{ textAlign: 'center' }}>
                    <h3 className="gradient-text" style={{ fontSize: '32px' }}>{user.points}</h3>
                    <p className="mono" style={{ color: 'var(--muted)', fontSize: '12px' }}>TOTAL POINTS</p>
                </div>
                <div className="glass-card" style={{ textAlign: 'center' }}>
                    <h3 className="gradient-text" style={{ fontSize: '32px' }}>{donations.filter(d => d.status === 'delivered').reduce((sum, d) => sum + d.quantity, 0)}</h3>
                    <p className="mono" style={{ color: 'var(--muted)', fontSize: '12px' }}>MEALS SAVED</p>
                </div>
                <div className="glass-card" style={{ textAlign: 'center' }}>
                    <h3 className="gradient-text" style={{ fontSize: '32px' }}>{user.badges?.length || 0}</h3>
                    <p className="mono" style={{ color: 'var(--muted)', fontSize: '12px' }}>BADGES EARNED</p>
                </div>
            </div>

            <div className="glass-card">
                <h3 style={{ marginBottom: '20px' }}>Your Listings</h3>
                {donations.length === 0 ? (
                    <p style={{ color: 'var(--muted)' }}>You haven't listed any surplus food yet.</p>
                ) : (
                    <div style={{ display: 'grid', gap: '16px' }}>
                        {donations.map(d => (
                            <div key={d._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', border: '1px solid var(--border)', borderRadius: '8px', background: 'rgba(255,255,255,0.02)' }}>
                                <div>
                                    <h4 style={{ color: '#fff', fontSize: '16px' }}>{d.foodType} <span className={`badge badge-${d.freshnessBadge}`}>{d.freshnessBadge}</span></h4>
                                    <p style={{ color: 'var(--muted)', fontSize: '13px', marginTop: '4px' }}>
                                        {d.quantity} meals • Expires: {new Date(d.expiresAt).toLocaleTimeString()} • Status: <strong style={{ color: 'var(--green)' }}>{d.status.toUpperCase()}</strong>
                                    </p>
                                </div>
                                {d.qrCode && (
                                    <div style={{ padding: '4px', background: '#fff', borderRadius: '4px' }}>
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
    const [formData, setFormData] = useState({ foodType: '', quantity: 0, expiresHours: 4 });
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const expiresAt = new Date();
            expiresAt.setHours(expiresAt.getHours() + parseInt(formData.expiresHours));

            const payload = {
                ...formData,
                preparedAt: new Date().toISOString(),
                expiresAt: expiresAt.toISOString()
            };

            await api.post('/donations', payload);
            toast.success('Donation listed successfully!');
            navigate('/donor-dashboard');
        } catch (err) {
            toast.error('Failed to create donation');
        }
    };

    return (
        <div className="page-wrapper container" style={{ display: 'flex', justifyContent: 'center' }}>
            <div className="glass-card" style={{ maxWidth: '500px', width: '100%' }}>
                <h2 style={{ marginBottom: '24px' }}>List Surplus Food</h2>
                <form onSubmit={handleSubmit}>
                    <label style={{ fontSize: '12px', color: 'var(--muted)' }}>What kind of food?</label>
                    <input type="text" className="input-field" placeholder="e.g. Rice, Dal, Chapati" required
                        value={formData.foodType} onChange={e => setFormData({ ...formData, foodType: e.target.value })} />

                    <label style={{ fontSize: '12px', color: 'var(--muted)' }}>Quantity (approx meals)</label>
                    <input type="number" className="input-field" min="1" required
                        value={formData.quantity} onChange={e => setFormData({ ...formData, quantity: parseInt(e.target.value) })} />

                    <label style={{ fontSize: '12px', color: 'var(--muted)' }}>Safe to eat for how many hours?</label>
                    <input type="number" className="input-field" min="1" max="24" required
                        value={formData.expiresHours} onChange={e => setFormData({ ...formData, expiresHours: parseInt(e.target.value) })} />

                    <button type="submit" className="btn-primary" style={{ width: '100%' }}>Post listing + Generate QR</button>
                </form>
            </div>
        </div>
    );
};

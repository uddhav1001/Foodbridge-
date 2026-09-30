import { useState, useEffect } from 'react';
import api from '../api/axios';
import toast from 'react-hot-toast';

const Leaderboard = () => {
    const [tab, setTab] = useState('donor');
    const [leaders, setLeaders] = useState([]);
    const [loading, setLoading] = useState(true);

    // Demo fallback data
    const demoDonors = [
        { rank: 1, name: 'Taj Palace Hotel', totalPoints: 450, totalMeals: 2500, badges: [{ icon: '🏆' }, { icon: '✨' }] },
        { rank: 2, name: 'IIT Delhi Mess', totalPoints: 320, totalMeals: 1800, badges: [{ icon: '🏆' }] },
        { rank: 3, name: 'Sharma Caterers', totalPoints: 210, totalMeals: 950, badges: [{ icon: '🚀' }] },
        { rank: 4, name: 'Rajesh Dhaba', totalPoints: 140, totalMeals: 420, badges: [] },
        { rank: 5, name: 'Campus Cafe', totalPoints: 90, totalMeals: 200, badges: [] },
    ];

    const demoVolunteers = [
        { rank: 1, name: 'Rahul S.', totalPoints: 850, totalDeliveries: 120, badges: [{ icon: '⚡' }, { icon: '🏍️' }] },
        { rank: 2, name: 'Priya K.', totalPoints: 620, totalDeliveries: 95, badges: [{ icon: '⚡' }] },
        { rank: 3, name: 'Amit J.', totalPoints: 410, totalDeliveries: 50, badges: [{ icon: '🚀' }] },
        { rank: 4, name: 'Sneha M.', totalPoints: 280, totalDeliveries: 35, badges: [] },
    ];

    useEffect(() => {
        const fetchLeaderboard = async () => {
            setLoading(true);
            try {
                const { data } = await api.get(`/leaderboard?role=${tab}`);
                if (data && data.length > 0) {
                    setLeaders(data.map((entry, i) => ({ ...entry, rank: i + 1 })));
                } else {
                    setLeaders(tab === 'donor' ? demoDonors : demoVolunteers);
                }
            } catch (err) {
                setLeaders(tab === 'donor' ? demoDonors : demoVolunteers);
            }
            setLoading(false);
        };
        fetchLeaderboard();
    }, [tab]);

    return (
        <div className="page-wrapper container" style={{ maxWidth: '900px' }}>
            <h2 style={{ textAlign: 'center', marginBottom: '10px' }}>🏅 Community Leaderboard</h2>
            <p style={{ textAlign: 'center', color: 'var(--muted)', marginBottom: '30px' }}>
                Celebrating the heroes fighting food waste. Earn points, unlock badges, climb the ranks!
            </p>

            <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', marginBottom: '24px' }}>
                <button
                    onClick={() => setTab('donor')}
                    className={tab === 'donor' ? 'btn-primary' : 'btn-outline'}
                >
                    🏪 Top Donors
                </button>
                <button
                    onClick={() => setTab('volunteer')}
                    className={tab === 'volunteer' ? 'btn-primary' : 'btn-outline'}
                >
                    🏍️ Top Volunteers
                </button>
            </div>

            {/* Top 3 Podium */}
            {!loading && leaders.length >= 3 && (
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'flex-end', gap: '16px', marginBottom: '32px' }}>
                    {/* 2nd Place */}
                    <div className="glass-card" style={{ textAlign: 'center', flex: 1, padding: '20px', maxWidth: '200px' }}>
                        <div style={{ fontSize: '32px', marginBottom: '8px' }}>🥈</div>
                        <h4 style={{ color: '#fff', fontSize: '14px' }}>{leaders[1]?.name}</h4>
                        <p className="mono" style={{ color: 'var(--blue)', fontSize: '18px', fontWeight: '700' }}>{leaders[1]?.totalPoints} pts</p>
                    </div>
                    {/* 1st Place */}
                    <div className="glass-card" style={{ textAlign: 'center', flex: 1, padding: '28px', maxWidth: '220px', border: '1px solid var(--green)', boxShadow: '0 0 30px rgba(0,255,136,0.1)' }}>
                        <div style={{ fontSize: '40px', marginBottom: '8px' }}>🥇</div>
                        <h4 style={{ color: '#fff', fontSize: '16px' }}>{leaders[0]?.name}</h4>
                        <p className="mono gradient-text" style={{ fontSize: '22px', fontWeight: '800' }}>{leaders[0]?.totalPoints} pts</p>
                    </div>
                    {/* 3rd Place */}
                    <div className="glass-card" style={{ textAlign: 'center', flex: 1, padding: '20px', maxWidth: '200px' }}>
                        <div style={{ fontSize: '32px', marginBottom: '8px' }}>🥉</div>
                        <h4 style={{ color: '#fff', fontSize: '14px' }}>{leaders[2]?.name}</h4>
                        <p className="mono" style={{ color: 'var(--warning)', fontSize: '18px', fontWeight: '700' }}>{leaders[2]?.totalPoints} pts</p>
                    </div>
                </div>
            )}

            {/* Full Table */}
            <div className="glass-card" style={{ padding: '0', overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead>
                        <tr style={{ borderBottom: '2px solid var(--border)', background: 'rgba(255,255,255,0.02)' }}>
                            <th style={{ padding: '16px', color: 'var(--green)', width: '60px' }}>Rank</th>
                            <th style={{ padding: '16px' }}>Name</th>
                            <th style={{ padding: '16px' }}>{tab === 'donor' ? 'Meals Saved' : 'Deliveries'}</th>
                            <th style={{ padding: '16px' }}>Points</th>
                            <th style={{ padding: '16px' }}>Badges</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan={5} style={{ padding: '24px', textAlign: 'center', color: 'var(--muted)' }}>Loading...</td></tr>
                        ) : leaders.map((d, i) => (
                            <tr key={i} style={{ borderBottom: '1px solid var(--border)', background: i < 3 ? 'rgba(0,255,136,0.03)' : 'transparent' }}>
                                <td style={{ padding: '16px', fontWeight: 'bold', color: i < 3 ? 'var(--green)' : 'var(--muted)' }}>#{d.rank}</td>
                                <td style={{ padding: '16px', color: '#fff', fontWeight: '600' }}>{d.name}</td>
                                <td style={{ padding: '16px', color: 'var(--muted)' }}>{tab === 'donor' ? (d.totalMeals || 0) : (d.totalDeliveries || 0)}</td>
                                <td style={{ padding: '16px' }}>
                                    <span style={{ color: 'var(--blue)', fontWeight: 'bold' }}>{d.totalPoints || 0}</span> pts
                                </td>
                                <td style={{ padding: '16px', letterSpacing: '4px', fontSize: '18px' }}>
                                    {(d.badges || []).map(b => b.icon || b.name).join(' ') || '—'}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Gamification Info */}
            <div className="glass-card" style={{ marginTop: '24px' }}>
                <h3 style={{ marginBottom: '16px' }}>🎮 How Gamification Works</h3>
                <div className="grid-3">
                    <div style={{ padding: '16px', border: '1px solid var(--border)', borderRadius: '8px', textAlign: 'center' }}>
                        <p style={{ fontSize: '24px', marginBottom: '8px' }}>📦</p>
                        <p style={{ color: '#fff', fontWeight: '600' }}>+10 pts</p>
                        <p style={{ color: 'var(--muted)', fontSize: '12px' }}>Per Donation Listed</p>
                    </div>
                    <div style={{ padding: '16px', border: '1px solid var(--border)', borderRadius: '8px', textAlign: 'center' }}>
                        <p style={{ fontSize: '24px', marginBottom: '8px' }}>🚀</p>
                        <p style={{ color: '#fff', fontWeight: '600' }}>+15 pts</p>
                        <p style={{ color: 'var(--muted)', fontSize: '12px' }}>Per Delivery Completed</p>
                    </div>
                    <div style={{ padding: '16px', border: '1px solid var(--border)', borderRadius: '8px', textAlign: 'center' }}>
                        <p style={{ fontSize: '24px', marginBottom: '8px' }}>🏆</p>
                        <p style={{ color: '#fff', fontWeight: '600' }}>Badge</p>
                        <p style={{ color: 'var(--muted)', fontSize: '12px' }}>At 100 Meals Milestone</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Leaderboard;

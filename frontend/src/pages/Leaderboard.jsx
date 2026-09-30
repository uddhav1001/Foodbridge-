import { useState, useEffect } from 'react';
import api from '../api/axios';

const Leaderboard = () => {
    const [tab, setTab] = useState('donor');
    const [leaders, setLeaders] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchLeaderboard = async () => {
            setLoading(true);
            try {
                const { data } = await api.get(`/leaderboard?role=${tab}`);
                setLeaders(data.map((entry, i) => ({ ...entry, rank: i + 1 })));
            } catch (err) {
                setLeaders([]);
            }
            setLoading(false);
        };
        fetchLeaderboard();
    }, [tab]);

    return (
        <div className="page-wrapper container" style={{ maxWidth: '900px' }}>
            <h2 style={{ textAlign: 'center', marginBottom: '8px' }}>🏅 Community Leaderboard</h2>
            <p style={{ textAlign: 'center', color: 'var(--muted)', marginBottom: '24px', fontSize: '14px' }}>
                Earn points, unlock badges, climb the ranks!
            </p>

            <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', marginBottom: '24px', flexWrap: 'wrap' }}>
                <button onClick={() => setTab('donor')} className={tab === 'donor' ? 'btn-primary' : 'btn-outline'}>🏪 Donors</button>
                <button onClick={() => setTab('volunteer')} className={tab === 'volunteer' ? 'btn-primary' : 'btn-outline'}>🏍️ Volunteers</button>
            </div>

            {/* Podium */}
            {!loading && leaders.length >= 3 && (
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'flex-end', gap: '12px', marginBottom: '24px', flexWrap: 'wrap' }}>
                    <div className="glass-card" style={{ textAlign: 'center', flex: 1, maxWidth: '180px', padding: '16px' }}>
                        <div style={{ fontSize: '28px' }}>🥈</div>
                        <h4 style={{ color: '#fff', fontSize: '13px', marginTop: '4px' }}>{leaders[1]?.name}</h4>
                        <p className="mono" style={{ color: 'var(--blue)', fontSize: '16px', fontWeight: '700' }}>{leaders[1]?.totalPoints} pts</p>
                    </div>
                    <div className="glass-card" style={{ textAlign: 'center', flex: 1, maxWidth: '200px', padding: '20px', border: '1px solid var(--green)', boxShadow: '0 0 20px rgba(0,255,136,0.08)' }}>
                        <div style={{ fontSize: '36px' }}>🥇</div>
                        <h4 style={{ color: '#fff', fontSize: '15px', marginTop: '4px' }}>{leaders[0]?.name}</h4>
                        <p className="mono gradient-text" style={{ fontSize: '20px', fontWeight: '800' }}>{leaders[0]?.totalPoints} pts</p>
                    </div>
                    <div className="glass-card" style={{ textAlign: 'center', flex: 1, maxWidth: '180px', padding: '16px' }}>
                        <div style={{ fontSize: '28px' }}>🥉</div>
                        <h4 style={{ color: '#fff', fontSize: '13px', marginTop: '4px' }}>{leaders[2]?.name}</h4>
                        <p className="mono" style={{ color: 'var(--warning)', fontSize: '16px', fontWeight: '700' }}>{leaders[2]?.totalPoints} pts</p>
                    </div>
                </div>
            )}

            <div className="glass-card" style={{ padding: '0', overflow: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '450px' }}>
                    <thead>
                        <tr style={{ borderBottom: '2px solid var(--border)', background: 'rgba(255,255,255,0.02)' }}>
                            <th style={{ padding: '14px 12px', color: 'var(--green)' }}>Rank</th>
                            <th style={{ padding: '14px 12px' }}>Name</th>
                            <th style={{ padding: '14px 12px' }}>{tab === 'donor' ? 'Meals' : 'Deliveries'}</th>
                            <th style={{ padding: '14px 12px' }}>Points</th>
                            <th style={{ padding: '14px 12px' }}>Badges</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan={5} style={{ padding: '24px', textAlign: 'center', color: 'var(--muted)' }}>Loading...</td></tr>
                        ) : leaders.length === 0 ? (
                            <tr><td colSpan={5} style={{ padding: '24px', textAlign: 'center', color: 'var(--muted)' }}>No leaderboard data yet. Start donating or delivering to appear here!</td></tr>
                        ) : leaders.map((d, i) => (
                            <tr key={i} style={{ borderBottom: '1px solid var(--border)', background: i < 3 ? 'rgba(0,255,136,0.03)' : 'transparent' }}>
                                <td style={{ padding: '14px 12px', fontWeight: 'bold', color: i < 3 ? 'var(--green)' : 'var(--muted)' }}>#{d.rank}</td>
                                <td style={{ padding: '14px 12px', color: '#fff', fontWeight: '600' }}>{d.name}</td>
                                <td style={{ padding: '14px 12px', color: 'var(--muted)' }}>{tab === 'donor' ? (d.totalMeals || 0) : (d.totalDeliveries || 0)}</td>
                                <td style={{ padding: '14px 12px' }}><span style={{ color: 'var(--blue)', fontWeight: 'bold' }}>{d.totalPoints || 0}</span></td>
                                <td style={{ padding: '14px 12px', letterSpacing: '3px', fontSize: '16px' }}>
                                    {(d.badges || []).map(b => b.icon || '').join(' ') || '—'}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div className="glass-card" style={{ marginTop: '24px' }}>
                <h3 style={{ marginBottom: '12px' }}>🎮 How Points Work</h3>
                <div className="grid-3">
                    {[
                        { emoji: '📦', pts: '+10 pts', desc: 'Per Donation' },
                        { emoji: '🚀', pts: '+15 pts', desc: 'Per Delivery' },
                        { emoji: '🏆', pts: 'Badge', desc: '100 Meals Milestone' },
                    ].map((item, i) => (
                        <div key={i} style={{ padding: '14px', border: '1px solid var(--border)', borderRadius: '8px', textAlign: 'center' }}>
                            <p style={{ fontSize: '22px', marginBottom: '6px' }}>{item.emoji}</p>
                            <p style={{ color: '#fff', fontWeight: '600' }}>{item.pts}</p>
                            <p style={{ color: 'var(--muted)', fontSize: '12px' }}>{item.desc}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Leaderboard;

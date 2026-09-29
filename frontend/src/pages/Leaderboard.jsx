import { useState } from 'react';

const Leaderboard = () => {
    const [tab, setTab] = useState('donor'); // donor or volunteer

    const data = tab === 'donor' ? [
        { rank: 1, name: 'Taj Palace Hotel', pts: 450, meals: 2500, badges: ['🏆', '✨'] },
        { rank: 2, name: 'IIT Mess', pts: 320, meals: 1800, badges: ['🏆'] },
        { rank: 3, name: 'Sharma Caterers', pts: 210, meals: 950, badges: ['🚀'] },
        { rank: 4, name: 'You (Demo Donor)', pts: 10, meals: 45, badges: [] },
    ] : [
        { rank: 1, name: 'Rahul S.', pts: 850, deliveries: 120, badges: ['⚡', '🏍️'] },
        { rank: 2, name: 'Priya K.', pts: 620, deliveries: 95, badges: ['⚡'] },
        { rank: 3, name: 'Amit J.', pts: 410, deliveries: 50, badges: ['🚀'] }
    ];

    return (
        <div className="page-wrapper container" style={{ maxWidth: '800px' }}>
            <h2 style={{ textAlign: 'center', marginBottom: '10px' }}>Community Leaderboard</h2>
            <p style={{ textAlign: 'center', color: 'var(--muted)', marginBottom: '30px' }}>
                Celebrating the heroes fighting food waste.
            </p>

            <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', marginBottom: '24px' }}>
                <button
                    onClick={() => setTab('donor')}
                    className={tab === 'donor' ? 'btn-primary' : 'btn-outline'}
                >
                    Top Donors
                </button>
                <button
                    onClick={() => setTab('volunteer')}
                    className={tab === 'volunteer' ? 'btn-primary' : 'btn-outline'}
                >
                    Top Volunteers
                </button>
            </div>

            <div className="glass-card" style={{ padding: '0', overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead>
                        <tr style={{ borderBottom: '2px solid var(--border)', background: 'rgba(255,255,255,0.02)' }}>
                            <th style={{ padding: '16px', color: 'var(--green)' }}>Rank</th>
                            <th style={{ padding: '16px' }}>Name</th>
                            <th style={{ padding: '16px' }}>{tab === 'donor' ? 'Meals Saved' : 'Deliveries'}</th>
                            <th style={{ padding: '16px' }}>Points</th>
                            <th style={{ padding: '16px' }}>Badges</th>
                        </tr>
                    </thead>
                    <tbody>
                        {data.map(d => (
                            <tr key={d.rank} style={{ borderBottom: '1px solid var(--border)' }}>
                                <td style={{ padding: '16px', fontWeight: 'bold' }}>#{d.rank}</td>
                                <td style={{ padding: '16px', color: '#fff', fontWeight: '600' }}>{d.name}</td>
                                <td style={{ padding: '16px', color: 'var(--muted)' }}>{tab === 'donor' ? d.meals : d.deliveries}</td>
                                <td style={{ padding: '16px' }}>
                                    <span style={{ color: 'var(--blue)', fontWeight: 'bold' }}>{d.pts}</span> pts
                                </td>
                                <td style={{ padding: '16px', letterSpacing: '4px' }}>{d.badges.join('')}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default Leaderboard;

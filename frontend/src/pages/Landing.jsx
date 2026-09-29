import { Link } from 'react-router-dom';
import CountUp from 'react-countup';

const Landing = () => {
    return (
        <div className="page-wrapper" style={{ overflow: 'hidden' }}>
            {/* Hero Section */}
            <section className="container" style={{ textAlign: 'center', padding: '100px 0 60px' }}>
                <h1 style={{ fontSize: '64px', fontWeight: '900', marginBottom: '20px', lineHeight: '1.2' }}>
                    Stop Food Waste.<br />
                    Start a <span className="gradient-text">Movement.</span>
                </h1>
                <p style={{ fontSize: '20px', color: 'var(--muted)', maxWidth: '600px', margin: '0 auto 40px' }}>
                    FoodBridge connects surplus food from restaurants and messes to verified NGO shelters via an intelligent volunteer network.
                </p>
                <div style={{ display: 'flex', justifyContent: 'center', gap: '20px' }}>
                    <Link to="/register" className="btn-primary" style={{ fontSize: '18px', padding: '16px 32px', textDecoration: 'none' }}>Join the Mission</Link>
                    <a href="#how-it-works" className="btn-outline" style={{ fontSize: '18px', padding: '16px 32px', textDecoration: 'none' }}>How it Works</a>
                </div>
            </section>

            {/* Stats Section */}
            <section className="container" style={{ padding: '60px 0' }}>
                <div className="grid-4" style={{ textAlign: 'center' }}>
                    <div className="glass-card">
                        <h2 className="gradient-text" style={{ fontSize: '40px', marginBottom: '10px' }}>
                            <CountUp end={8520} duration={2.5} separator="," />+
                        </h2>
                        <p style={{ color: 'var(--muted)', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '1px' }}>Meals Saved</p>
                    </div>
                    <div className="glass-card">
                        <h2 className="gradient-text" style={{ fontSize: '40px', marginBottom: '10px' }}>
                            <CountUp end={3400} duration={2.5} separator="," />kg
                        </h2>
                        <p style={{ color: 'var(--muted)', fontWeight: '600', textTransform: 'uppercase' }}>CO₂ Avoided</p>
                    </div>
                    <div className="glass-card">
                        <h2 className="gradient-text" style={{ fontSize: '40px', marginBottom: '10px' }}>
                            <CountUp end={124} duration={2.5} />
                        </h2>
                        <p style={{ color: 'var(--muted)', fontWeight: '600', textTransform: 'uppercase' }}>Active Donors</p>
                    </div>
                    <div className="glass-card">
                        <h2 className="gradient-text" style={{ fontSize: '40px', marginBottom: '10px' }}>
                            <CountUp end={45} duration={2.5} />
                        </h2>
                        <p style={{ color: 'var(--muted)', fontWeight: '600', textTransform: 'uppercase' }}>Verified Shelters</p>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section id="how-it-works" className="container" style={{ padding: '80px 0' }}>
                <h2 style={{ textAlign: 'center', fontSize: '36px', marginBottom: '60px' }}>Powered by <span className="gradient-text">Advanced Tech</span></h2>
                <div className="grid-3">
                    <div className="glass-card">
                        <div style={{ fontSize: '40px', marginBottom: '20px' }}>⚡</div>
                        <h3>Real-time Matching</h3>
                        <p style={{ color: 'var(--muted)' }}>Socket.IO instantly alerts nearby volunteers when a donor lists surplus food.</p>
                    </div>
                    <div className="glass-card">
                        <div style={{ fontSize: '40px', marginBottom: '20px' }}>🗺️</div>
                        <h3>Route Optimization</h3>
                        <p style={{ color: 'var(--muted)' }}>Nearest-neighbor algorithms batch pickups to save our riders time and fuel.</p>
                    </div>
                    <div className="glass-card">
                        <div style={{ fontSize: '40px', marginBottom: '20px' }}>📱</div>
                        <h3>QR Handover</h3>
                        <p style={{ color: 'var(--muted)' }}>Keep the chain of custody secure with mandatory QR code scanning at every step.</p>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Landing;

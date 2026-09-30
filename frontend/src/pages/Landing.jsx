import { Link } from 'react-router-dom';
import CountUp from 'react-countup';
import { useTranslation } from 'react-i18next';
import { FiArrowRight, FiZap, FiMap, FiSmartphone, FiBarChart2, FiShield, FiGlobe } from 'react-icons/fi';

const Landing = () => {
    const { t } = useTranslation();

    const features = [
        { icon: <FiZap size={28} />, title: 'Real-time Matching', desc: 'Socket.IO instantly alerts nearby volunteers when a donor lists surplus food.', color: '#00ff88' },
        { icon: <FiMap size={28} />, title: 'Route Optimization', desc: 'Nearest-neighbor algorithms batch pickups to save riders time and fuel.', color: '#00b4d8' },
        { icon: <FiSmartphone size={28} />, title: 'QR Handover', desc: 'Secure chain of custody with mandatory QR code scanning at every step.', color: '#a064ff' },
        { icon: <FiBarChart2 size={28} />, title: 'AI Demand Forecasting', desc: 'Moving-average model predicts 7-day surplus to help shelters plan meals.', color: '#ffc800' },
        { icon: <FiShield size={28} />, title: 'Food Safety Audit', desc: 'Photo uploads with freshness badges ensure only safe food reaches shelters.', color: '#ff4466' },
        { icon: <FiGlobe size={28} />, title: 'Multilingual Support', desc: 'English & Hindi (i18n) so every user can participate in their language.', color: '#00b4d8' },
    ];

    const howItWorks = [
        { step: '01', title: 'Donor Lists Surplus', desc: 'Restaurant/mess posts excess food with quantity, type, and expiry window. A QR code is auto-generated.' },
        { step: '02', title: 'AI Matches Nearby Shelters', desc: 'Smart algorithm scores shelters by proximity, capacity, and rating, then suggests the best match.' },
        { step: '03', title: 'Volunteer Claims Pickup', desc: 'Nearest volunteer gets a real-time push notification and claims the delivery route.' },
        { step: '04', title: 'QR-Verified Delivery', desc: 'Volunteer scans QR at pickup and shelter scans at delivery. Points awarded, impact logged.' },
    ];

    return (
        <div className="page-wrapper" style={{ overflow: 'hidden' }}>
            {/* Hero Section */}
            <section className="container" style={{ textAlign: 'center', padding: '120px 0 80px' }}>
                <div style={{ display: 'inline-block', padding: '6px 16px', borderRadius: '50px', border: '1px solid rgba(0,255,136,0.3)', background: 'rgba(0,255,136,0.08)', marginBottom: '24px', fontSize: '13px', color: 'var(--green)', fontWeight: '600' }}>
                    🏆 Built for Zero Hunger Hackathon — Track 1
                </div>
                <h1 style={{ fontSize: 'clamp(36px, 6vw, 72px)', fontWeight: '900', marginBottom: '20px', lineHeight: '1.1' }}>
                    Stop Food Waste.<br />
                    Start a <span className="gradient-text">Movement.</span>
                </h1>
                <p style={{ fontSize: '20px', color: 'var(--muted)', maxWidth: '650px', margin: '0 auto 40px', lineHeight: '1.7' }}>
                    FoodBridge is an AI-powered platform connecting surplus food from restaurants and messes to verified NGO shelters, powered by real-time matching, route optimization, and QR verification.
                </p>
                <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', flexWrap: 'wrap' }}>
                    <Link to="/register" className="btn-primary" style={{ fontSize: '18px', padding: '16px 36px', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        Join the Mission <FiArrowRight />
                    </Link>
                    <a href="#how-it-works" className="btn-outline" style={{ fontSize: '18px', padding: '16px 36px', textDecoration: 'none' }}>
                        How it Works
                    </a>
                </div>
            </section>

            {/* Stats Section */}
            <section className="container" style={{ padding: '60px 0' }}>
                <div className="grid-4" style={{ textAlign: 'center' }}>
                    {[
                        { end: 8520, suffix: '+', label: 'Meals Saved' },
                        { end: 3400, suffix: 'kg', label: 'CO₂ Avoided' },
                        { end: 124, suffix: '', label: 'Active Donors' },
                        { end: 45, suffix: '', label: 'Verified Shelters' },
                    ].map((stat, i) => (
                        <div key={i} className="glass-card">
                            <h2 className="gradient-text" style={{ fontSize: '40px', marginBottom: '10px' }}>
                                <CountUp end={stat.end} duration={2.5} separator="," />{stat.suffix}
                            </h2>
                            <p className="mono" style={{ color: 'var(--muted)', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '1px', fontSize: '12px' }}>{stat.label}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* How It Works */}
            <section id="how-it-works" className="container" style={{ padding: '80px 0' }}>
                <h2 style={{ textAlign: 'center', fontSize: '36px', marginBottom: '16px' }}>How <span className="gradient-text">FoodBridge</span> Works</h2>
                <p style={{ textAlign: 'center', color: 'var(--muted)', marginBottom: '60px', maxWidth: '500px', margin: '0 auto 60px' }}>End-to-end food rescue in 4 simple steps.</p>
                <div className="grid-4">
                    {howItWorks.map((step) => (
                        <div key={step.step} className="glass-card" style={{ position: 'relative', paddingTop: '40px' }}>
                            <div style={{ position: 'absolute', top: '-16px', left: '24px', background: 'linear-gradient(135deg, #00d270, #00b4d8)', color: '#0a0a0f', padding: '4px 14px', borderRadius: '20px', fontWeight: '800', fontSize: '14px' }}>
                                STEP {step.step}
                            </div>
                            <h3 style={{ marginBottom: '10px', fontSize: '18px' }}>{step.title}</h3>
                            <p style={{ color: 'var(--muted)', fontSize: '14px', lineHeight: '1.6' }}>{step.desc}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* Features Grid */}
            <section className="container" style={{ padding: '80px 0' }}>
                <h2 style={{ textAlign: 'center', fontSize: '36px', marginBottom: '60px' }}>Powered by <span className="gradient-text">Advanced Tech</span></h2>
                <div className="grid-3">
                    {features.map((f, i) => (
                        <div key={i} className="glass-card">
                            <div style={{ width: '50px', height: '50px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: `${f.color}15`, border: `1px solid ${f.color}33`, color: f.color, marginBottom: '20px' }}>
                                {f.icon}
                            </div>
                            <h3 style={{ marginBottom: '8px' }}>{f.title}</h3>
                            <p style={{ color: 'var(--muted)', fontSize: '14px', lineHeight: '1.6' }}>{f.desc}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* Tech Stack */}
            <section className="container" style={{ padding: '60px 0 100px' }}>
                <div className="glass-card" style={{ textAlign: 'center', padding: '48px' }}>
                    <h2 style={{ marginBottom: '16px' }}>Built With <span className="gradient-text">MERN Stack</span></h2>
                    <p style={{ color: 'var(--muted)', marginBottom: '32px' }}>Production-grade architecture designed for scale</p>
                    <div style={{ display: 'flex', justifyContent: 'center', gap: '24px', flexWrap: 'wrap' }}>
                        {['MongoDB Atlas', 'Express.js', 'React + Vite', 'Node.js', 'Socket.IO', 'Leaflet.js', 'Recharts', 'i18next'].map(tech => (
                            <span key={tech} className="mono" style={{ padding: '8px 16px', border: '1px solid var(--border)', borderRadius: '8px', fontSize: '13px', color: 'var(--green)' }}>{tech}</span>
                        ))}
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer style={{ borderTop: '1px solid var(--border)', padding: '32px 0', textAlign: 'center' }}>
                <p style={{ color: 'var(--muted)', fontSize: '14px' }}>
                    © 2026 FoodBridge — Smart Surplus Food Redistribution Platform | Zero Hunger Hackathon
                </p>
            </footer>
        </div>
    );
};

export default Landing;

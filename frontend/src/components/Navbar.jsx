import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';
import { FiHome, FiAward, FiLogOut, FiLogIn, FiUserPlus } from 'react-icons/fi';

const Navbar = () => {
    const { user, logout } = useAuth();
    const { t, i18n } = useTranslation();
    const navigate = useNavigate();
    const location = useLocation();

    const toggleLanguage = () => {
        const newLang = i18n.language === 'en' ? 'hi' : 'en';
        i18n.changeLanguage(newLang);
    };

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    const isActive = (path) => location.pathname.includes(path);

    // Dynamic routing for home based on role
    const homeRoute = user ? `/${user.role}-dashboard` : '/';

    return (
        <>
            {/* Desktop Top Navbar */}
            <nav className="desktop-nav" style={{
                background: 'rgba(10, 10, 15, 0.9)',
                backdropFilter: 'blur(12px)',
                borderBottom: '1px solid var(--border)',
                position: 'fixed',
                top: 0, width: '100%', zIndex: 100,
                padding: '12px 0'
            }}>
                <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Link to="/" style={{ textDecoration: 'none', fontSize: '22px', fontWeight: '800' }}>
                        🌉 <span className="gradient-text">{t('app_name')}</span>
                    </Link>

                    <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
                        <button onClick={toggleLanguage} style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', fontSize: '14px' }}>
                            🌐 {i18n.language.toUpperCase()}
                        </button>

                        {user ? (
                            <>
                                <Link to={homeRoute} style={{ color: '#fff', textDecoration: 'none' }}>{t('dashboard')}</Link>
                                <Link to="/leaderboard" style={{ color: '#fff', textDecoration: 'none' }}>{t('leaderboard')}</Link>
                                <div style={{ padding: '4px 12px', background: 'var(--card)', borderRadius: '20px', border: '1px solid var(--border)', fontSize: '14px' }}>
                                    {user.points || 0} ✨
                                </div>
                                <button className="btn-outline" onClick={handleLogout} style={{ padding: '8px 16px' }}>{t('logout')}</button>
                            </>
                        ) : (
                            <>
                                <Link to="/login" style={{ color: '#fff', textDecoration: 'none' }}>{t('login')}</Link>
                                <Link to="/register" className="btn-primary" style={{ textDecoration: 'none', padding: '8px 16px' }}>{t('register')}</Link>
                            </>
                        )}
                    </div>
                </div>
            </nav>

            {/* Mobile Bottom Tab Bar (App-like experience) */}
            <nav className="mobile-bottom-nav">
                <Link to={homeRoute} className={`bottom-tab ${isActive('dashboard') || (location.pathname === '/' && !user) ? 'active' : ''}`}>
                    <FiHome size={22} />
                    <span>Home</span>
                </Link>

                <Link to="/leaderboard" className={`bottom-tab ${isActive('/leaderboard') ? 'active' : ''}`}>
                    <FiAward size={22} />
                    <span>Rank</span>
                </Link>

                {user ? (
                    <button className="bottom-tab" onClick={handleLogout} style={{ background: 'none', border: 'none' }}>
                        <FiLogOut size={22} />
                        <span>Logout</span>
                    </button>
                ) : (
                    <>
                        <Link to="/login" className={`bottom-tab ${isActive('/login') ? 'active' : ''}`}>
                            <FiLogIn size={22} />
                            <span>Login</span>
                        </Link>
                        <Link to="/register" className={`bottom-tab ${isActive('/register') ? 'active' : ''}`}>
                            <FiUserPlus size={22} />
                            <span>Join</span>
                        </Link>
                    </>
                )}
            </nav>
        </>
    );
};

export default Navbar;

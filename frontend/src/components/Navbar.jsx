import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';
import { useState } from 'react';
import { FiMenu, FiX } from 'react-icons/fi';

const Navbar = () => {
    const { user, logout } = useAuth();
    const { t, i18n } = useTranslation();
    const navigate = useNavigate();
    const [menuOpen, setMenuOpen] = useState(false);

    const toggleLanguage = () => {
        const newLang = i18n.language === 'en' ? 'hi' : 'en';
        i18n.changeLanguage(newLang);
    };

    const handleLogout = () => {
        logout();
        setMenuOpen(false);
        navigate('/');
    };

    const closeMenu = () => setMenuOpen(false);

    return (
        <nav style={{
            background: 'rgba(10, 10, 15, 0.9)',
            backdropFilter: 'blur(12px)',
            borderBottom: '1px solid var(--border)',
            position: 'fixed',
            top: 0, width: '100%', zIndex: 100,
            padding: '12px 0'
        }}>
            <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Link to="/" style={{ textDecoration: 'none', fontSize: '22px', fontWeight: '800' }} onClick={closeMenu}>
                    🌉 <span className="gradient-text">{t('app_name')}</span>
                </Link>

                {/* Hamburger Button - visible only on mobile via CSS */}
                <button
                    className="hamburger"
                    onClick={() => setMenuOpen(!menuOpen)}
                    style={{
                        display: 'none',
                        background: 'none',
                        border: 'none',
                        color: '#fff',
                        cursor: 'pointer',
                        fontSize: '24px',
                        alignItems: 'center',
                        justifyContent: 'center',
                    }}
                >
                    {menuOpen ? <FiX size={24} /> : <FiMenu size={24} />}
                </button>

                {/* Nav Links */}
                <div className={`nav-links ${menuOpen ? 'open' : ''}`} style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
                    <button onClick={toggleLanguage} style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', fontSize: '14px' }}>
                        🌐 {i18n.language.toUpperCase()}
                    </button>

                    {user ? (
                        <>
                            <Link to={`/${user.role}-dashboard`} style={{ color: '#fff', textDecoration: 'none' }} onClick={closeMenu}>{t('dashboard')}</Link>
                            <Link to="/leaderboard" style={{ color: '#fff', textDecoration: 'none' }} onClick={closeMenu}>{t('leaderboard')}</Link>
                            <div style={{ padding: '4px 12px', background: 'var(--card)', borderRadius: '20px', border: '1px solid var(--border)', fontSize: '14px' }}>
                                {user.points || 0} ✨
                            </div>
                            <button className="btn-outline" onClick={handleLogout} style={{ padding: '8px 16px' }}>{t('logout')}</button>
                        </>
                    ) : (
                        <>
                            <Link to="/login" style={{ color: '#fff', textDecoration: 'none' }} onClick={closeMenu}>{t('login')}</Link>
                            <Link to="/register" className="btn-primary" style={{ textDecoration: 'none', padding: '8px 16px' }} onClick={closeMenu}>{t('register')}</Link>
                        </>
                    )}
                </div>
            </div>
        </nav>
    );
};

export default Navbar;

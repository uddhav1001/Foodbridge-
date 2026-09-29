import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';
import { useState } from 'react';

const Navbar = () => {
    const { user, logout } = useAuth();
    const { t, i18n } = useTranslation();
    const navigate = useNavigate();

    const toggleLanguage = () => {
        const newLang = i18n.language === 'en' ? 'hi' : 'en';
        i18n.changeLanguage(newLang);
    };

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    return (
        <nav style={{
            background: 'rgba(10, 10, 15, 0.8)',
            backdropFilter: 'blur(10px)',
            borderBottom: '1px solid var(--border)',
            position: 'fixed',
            top: 0, width: '100%', zIndex: 100,
            padding: '16px 0'
        }}>
            <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Link to="/" style={{ textDecoration: 'none', fontSize: '24px', fontWeight: '800' }}>
                    🌉 <span className="gradient-text">{t('app_name')}</span>
                </Link>
                <div style={{ display: 'flex', gap: '24px', alignItems: 'center' }}>
                    <button onClick={toggleLanguage} style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer' }}>
                        🌐 {i18n.language.toUpperCase()}
                    </button>

                    {user ? (
                        <>
                            <Link to={`/${user.role}-dashboard`} style={{ color: '#fff', textDecoration: 'none' }}>{t('dashboard')}</Link>
                            <Link to="/leaderboard" style={{ color: '#fff', textDecoration: 'none' }}>{t('leaderboard')}</Link>
                            <div style={{ padding: '4px 12px', background: 'var(--card)', borderRadius: '20px', border: '1px solid var(--border)' }}>
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
    );
};

export default Navbar;

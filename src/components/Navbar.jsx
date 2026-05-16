import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

export default function Navbar() {
  const { user, userProfile, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
      toast.success('Logged out successfully');
    } catch {
      toast.error('Failed to log out');
    }
  };

  const navLinks = [
    { path: '/dashboard', label: '🏠 Dashboard', id: 'nav-dashboard' },
    { path: '/progress', label: '📈 Progress', id: 'nav-progress' },
  ];

  return (
    <nav style={{
      position: 'sticky',
      top: 0,
      zIndex: 100,
      background: 'rgba(13, 27, 42, 0.85)',
      backdropFilter: 'blur(20px)',
      WebkitBackdropFilter: 'blur(20px)',
      borderBottom: '1px solid var(--color-border)',
      padding: '0 24px',
    }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        height: '64px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '16px',
      }}>
        {/* Logo */}
        <Link to="/dashboard" id="nav-logo" style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          textDecoration: 'none',
        }}>
          <div style={{
            width: '36px',
            height: '36px',
            background: 'var(--gradient-blue)',
            borderRadius: '10px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '18px',
            boxShadow: 'var(--shadow-glow-blue)',
          }}>
            🎙️
          </div>
          <span style={{
            fontFamily: 'var(--font-display)',
            fontWeight: 800,
            fontSize: '1.1rem',
            background: 'var(--gradient-blue)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}>
            SpeakUp Coach
          </span>
        </Link>

        {/* Nav Links */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              id={link.id}
              style={{
                padding: '8px 16px',
                borderRadius: 'var(--radius-md)',
                fontWeight: 500,
                fontSize: '0.875rem',
                color: location.pathname === link.path
                  ? 'var(--color-accent-blue)'
                  : 'var(--color-text-secondary)',
                background: location.pathname === link.path
                  ? 'rgba(10, 132, 255, 0.1)'
                  : 'transparent',
                transition: 'all var(--transition-fast)',
                textDecoration: 'none',
                border: location.pathname === link.path
                  ? '1px solid rgba(10, 132, 255, 0.2)'
                  : '1px solid transparent',
              }}
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* User + Logout */}
        {user && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {/* Streak Badge */}
            {userProfile?.streak > 0 && (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 12px',
                background: 'rgba(255, 159, 10, 0.12)',
                border: '1px solid rgba(255, 159, 10, 0.25)',
                borderRadius: 'var(--radius-full)',
                fontSize: '0.8rem',
                color: 'var(--color-accent-orange)',
                fontWeight: 600,
              }}>
                🔥 {userProfile.streak}
              </div>
            )}

            {/* Avatar */}
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              background: 'var(--gradient-purple)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '14px',
              fontWeight: 700,
              color: 'white',
              border: '2px solid var(--color-border)',
              flexShrink: 0,
            }}>
              {(userProfile?.name || user.email || 'U').charAt(0).toUpperCase()}
            </div>

            <button
              id="btn-logout"
              className="btn-ghost"
              onClick={handleLogout}
              style={{ padding: '6px 14px', fontSize: '0.8rem' }}
            >
              Sign Out
            </button>
          </div>
        )}
      </div>
    </nav>
  );
}

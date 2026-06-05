import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const TopNav = () => {
  const { user, notifications, markNotificationRead, isAdmin } = useAuth();
  const [showNotifs, setShowNotifs] = useState(false);
  const navigate = useNavigate();

  return (
    <>
      <nav className="top-nav">
        <div className="logo">MAIN<span> EDIT</span></div>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          {isAdmin && (
            <button className="btn btn-sm" style={{ background: 'rgba(124,92,252,0.2)', color: '#7c5cfc', border: '1px solid rgba(124,92,252,0.4)', padding: '6px 12px', borderRadius: 8, fontSize: 12, fontWeight: 600 }} onClick={() => navigate('/admin')}>
              👑 Admin
            </button>
          )}
          {user && (
            <button className="notif-btn" onClick={() => setShowNotifs(!showNotifs)}>
              🔔
              {notifications.length > 0 && (
                <span className="notif-badge">{notifications.length > 9 ? '9+' : notifications.length}</span>
              )}
            </button>
          )}
        </div>
      </nav>

      {showNotifs && user && (
        <div className="notif-panel">
          {notifications.length === 0 ? (
            <div style={{ padding: 16, textAlign: 'center', color: 'var(--text2)', fontSize: 13 }}>
              No new notifications
            </div>
          ) : (
            notifications.map(n => (
              <div key={n.id} className="notif-item" onClick={() => { markNotificationRead(n.id); setShowNotifs(false); }}>
                <div style={{ fontSize: 13, fontWeight: 500 }}>{n.title}</div>
                <div style={{ fontSize: 12, color: 'var(--text2)', marginTop: 2 }}>{n.message}</div>
                <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 4 }}>Tap to dismiss</div>
              </div>
            ))
          )}
        </div>
      )}

      {showNotifs && <div onClick={() => setShowNotifs(false)} style={{ position: 'fixed', inset: 0, zIndex: 140 }} />}
    </>
  );
};

const NAV_ITEMS = [
  { path: '/', icon: '🏠', label: 'Home' },
  { path: '/effects', icon: '🎭', label: 'Effects' },
  { path: '/dashboard', icon: '📊', label: 'Dashboard', auth: true },
  { path: '/wallet', icon: '💳', label: 'Wallet', auth: true },
  { path: '/lessons', icon: '🎓', label: 'Lessons' },
];

export const BottomNav = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const items = NAV_ITEMS.filter(item => !item.auth || user);

  return (
    <nav className="bottom-nav">
      {items.map(item => (
        <button
          key={item.path}
          className={`nav-item ${location.pathname === item.path ? 'active' : ''}`}
          onClick={() => navigate(item.path)}
        >
          <span className="icon">{item.icon}</span>
          {item.label}
        </button>
      ))}
      {!user && (
        <button className="nav-item" onClick={() => navigate('/login')}>
          <span className="icon">👤</span>
          Login
        </button>
      )}
    </nav>
  );
};

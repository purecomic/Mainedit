import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { EFFECTS, EFFECT_CATEGORIES } from '../lib/data';

export default function Home() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const featured = EFFECTS.filter(e => e.featured).slice(0, 4);

  return (
    <div className="page hero-gradient">
      <div className="container">

        {/* Hero */}
        <div style={{ textAlign: 'center', padding: '32px 0 24px' }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--accent)', letterSpacing: 3, textTransform: 'uppercase', marginBottom: 12 }}>
            ✦ Professional Video Effects ✦
          </div>
          <h1 style={{ fontSize: 52, lineHeight: 1, marginBottom: 12 }}>
            MAKE YOUR
            <br />
            <span style={{ background: 'linear-gradient(135deg, var(--accent), var(--accent2))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>VIDEOS</span>
            <br />
            LEGENDARY
          </h1>
          <p style={{ color: 'var(--text2)', fontSize: 15, lineHeight: 1.6, maxWidth: 300, margin: '0 auto 24px' }}>
            Download stunning video effects, overlays & sounds for your content
          </p>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
            <button className="btn btn-primary" style={{ width: 'auto', padding: '12px 24px' }} onClick={() => navigate('/effects')}>
              Browse Effects
            </button>
            {!user && (
              <button className="btn btn-secondary" style={{ width: 'auto', padding: '12px 24px' }} onClick={() => navigate('/signup')}>
                Get Started
              </button>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-number">30+</div>
            <div className="stat-label">Effects Available</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">8</div>
            <div className="stat-label">Categories</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">50K+</div>
            <div className="stat-label">Downloads</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">12</div>
            <div className="stat-label">Currencies</div>
          </div>
        </div>

        {/* Categories */}
        <div className="section-header">
          <h2 className="section-title">Categories</h2>
          <button onClick={() => navigate('/effects')} style={{ background: 'none', color: 'var(--accent)', fontSize: 13, fontWeight: 600, border: 'none', cursor: 'pointer' }}>
            View All →
          </button>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10, marginBottom: 24 }}>
          {EFFECT_CATEGORIES.map(cat => (
            <button
              key={cat.id}
              onClick={() => navigate(`/effects?cat=${cat.id}`)}
              style={{
                background: `rgba(${hexToRgb(cat.color)}, 0.08)`,
                border: `1px solid rgba(${hexToRgb(cat.color)}, 0.25)`,
                borderRadius: 14,
                padding: '14px 8px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 6,
                cursor: 'pointer',
                transition: 'transform 0.2s',
              }}
            >
              <span style={{ fontSize: 24 }}>{cat.emoji}</span>
              <span style={{ fontSize: 11, color: 'var(--text2)', fontWeight: 500 }}>{cat.name}</span>
            </button>
          ))}
        </div>

        {/* Featured Effects */}
        <div className="section-header">
          <h2 className="section-title">⭐ Featured</h2>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 24 }}>
          {featured.map(effect => (
            <div key={effect.id} className="effect-card" style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={{ width: 48, height: 48, borderRadius: 12, background: 'var(--bg3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24 }}>
                {effect.emoji}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, marginBottom: 2 }}>{effect.name}</div>
                <div style={{ fontSize: 12, color: 'var(--text2)' }}>{effect.description}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontWeight: 700, color: 'var(--accent)', fontSize: 15 }}>${effect.price}</div>
                <div style={{ fontSize: 11, color: 'var(--text3)' }}>{effect.downloads.toLocaleString()} dl</div>
              </div>
            </div>
          ))}
        </div>

        {/* Lesson CTA */}
        <div className="lesson-bar" style={{ marginBottom: 24 }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--accent3)', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 8 }}>Private Lessons</div>
          <h3 style={{ fontSize: 22, marginBottom: 6 }}>LEARN FROM THE EDITOR</h3>
          <p style={{ fontSize: 13, color: 'var(--text2)', marginBottom: 14 }}>1-on-1 video editing lessons with Main Edit's founder</p>
          <button className="btn btn-purple" style={{ width: 'auto', padding: '10px 20px', fontSize: 14 }} onClick={() => navigate('/lessons')}>
            Book a Lesson →
          </button>
        </div>

      </div>
    </div>
  );
}

function hexToRgb(hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}` : '124, 92, 252';
}

import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

export default function Lessons() {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.from('lesson_contacts').select('*').order('created_at', { ascending: true })
      .then(({ data }) => { setContacts(data || []); setLoading(false); });
  }, []);

  const PLATFORM_ICONS = {
    whatsapp: '📱', telegram: '✈️', instagram: '📸', twitter: '🐦', email: '📧', phone: '📞', youtube: '▶️', tiktok: '🎵', other: '🔗'
  };

  return (
    <div className="page">
      <div className="container" style={{ paddingTop: 20 }}>

        {/* Hero */}
        <div style={{
          background: 'linear-gradient(135deg, rgba(124,92,252,0.2), rgba(255,60,110,0.1))',
          border: '1px solid rgba(124,92,252,0.3)',
          borderRadius: 24, padding: 28, marginBottom: 24, textAlign: 'center', position: 'relative', overflow: 'hidden'
        }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>🎬</div>
          <h1 style={{ fontSize: 36, marginBottom: 8 }}>PRIVATE LESSONS</h1>
          <p style={{ color: 'var(--text2)', fontSize: 14, lineHeight: 1.7, maxWidth: 300, margin: '0 auto 16px' }}>
            Learn professional video editing directly from the Main Edit founder. 1-on-1 personalized sessions.
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            {['🎯 Personalized', '⏰ Flexible Schedule', '💡 Pro Tips', '🏆 Certificate'].map(tag => (
              <span key={tag} style={{ background: 'rgba(124,92,252,0.15)', border: '1px solid rgba(124,92,252,0.3)', borderRadius: 20, padding: '4px 12px', fontSize: 12, color: 'var(--accent3)', fontWeight: 600 }}>{tag}</span>
            ))}
          </div>
        </div>

        {/* What You'll Learn */}
        <div className="card" style={{ marginBottom: 20 }}>
          <h3 style={{ fontSize: 20, marginBottom: 14 }}>📚 WHAT YOU'LL LEARN</h3>
          {[
            { icon: '🎭', title: 'Effect Application', desc: 'How to apply and blend video effects professionally' },
            { icon: '🎨', title: 'Color Grading', desc: 'Match cinematic color tones used by top creators' },
            { icon: '✂️', title: 'Precise Cutting', desc: 'Rhythm-based editing that keeps viewers hooked' },
            { icon: '🔊', title: 'Sound Design', desc: 'Layer audio effects for maximum impact' },
            { icon: '📱', title: 'Mobile Editing', desc: 'Edit like a pro straight from your phone' },
          ].map(item => (
            <div key={item.title} style={{ display: 'flex', gap: 12, alignItems: 'flex-start', marginBottom: 14 }}>
              <div style={{ fontSize: 22, width: 36, flexShrink: 0 }}>{item.icon}</div>
              <div>
                <div style={{ fontWeight: 600, fontSize: 14 }}>{item.title}</div>
                <div style={{ color: 'var(--text2)', fontSize: 13 }}>{item.desc}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Contact Section */}
        <div className="section-header">
          <h2 className="section-title">📞 Book a Lesson</h2>
        </div>
        <p style={{ color: 'var(--text2)', fontSize: 14, marginBottom: 16 }}>
          Reach out through any of the platforms below to schedule your private lesson:
        </p>

        {loading ? (
          <div className="spinner" />
        ) : contacts.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: 32 }}>
            <div style={{ fontSize: 36, marginBottom: 10 }}>🚧</div>
            <div style={{ fontWeight: 600, marginBottom: 6 }}>Contact Details Coming Soon</div>
            <div style={{ color: 'var(--text2)', fontSize: 14 }}>Check back shortly for booking information</div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {contacts.map(contact => (
              <a
                key={contact.id}
                href={contact.platform === 'whatsapp' ? `https://wa.me/${contact.handle.replace(/[^0-9]/g,'')}` : contact.platform === 'telegram' ? `https://t.me/${contact.handle}` : contact.link || '#'} target='_blank' rel='noopener noreferrer'
                target="_blank"
                rel="noopener noreferrer"
                style={{ textDecoration: 'none' }}
              >
                <div className="card" style={{ display: 'flex', alignItems: 'center', gap: 14, transition: 'border-color 0.2s', borderColor: 'var(--border)' }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--accent3)'}
                  onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
                >
                  <div style={{ width: 48, height: 48, borderRadius: 14, background: 'linear-gradient(135deg, rgba(124,92,252,0.2), rgba(255,60,110,0.1))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24 }}>
                    {PLATFORM_ICONS[contact.platform] || '🔗'}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, fontSize: 15, textTransform: 'capitalize' }}>{contact.platform}</div>
                    <div style={{ fontSize: 13, color: 'var(--accent3)' }}>{contact.handle}</div>
                  </div>
                  <div style={{ color: 'var(--text3)', fontSize: 18 }}>→</div>
                </div>
              </a>
            ))}
          </div>
        )}

        {/* Note */}
        <div className="alert alert-info" style={{ marginTop: 20 }}>
          💡 <strong>Tip:</strong> When reaching out, mention "Main Edit Private Lesson" and your preferred schedule for a faster response.
        </div>

        <div style={{ height: 20 }} />
      </div>
    </div>
  );
}

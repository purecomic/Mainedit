import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { EFFECTS, CURRENCIES } from '../lib/data';

export default function Dashboard() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [downloads, setDownloads] = useState([]);
  const [currency, setCurrency] = useState('USD');
  const [loading, setLoading] = useState(true);

  const selectedCurrency = CURRENCIES.find(c => c.code === currency);

  useEffect(() => {
    if (!user) { navigate('/login'); return; }
    loadData();
  }, [user]);

  const loadData = async () => {
    const { data: prof } = await supabase.from('profiles').select('*').eq('id', user.id).single();
    const { data: dl } = await supabase.from('downloads').select('*').eq('user_id', user.id).order('created_at', { ascending: false });
    setProfile(prof);
    setDownloads(dl || []);
    setLoading(false);
  };

  const convertPrice = (usd) => {
    const rate = selectedCurrency?.rate || 1;
    return (usd * rate).toFixed(2);
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  if (loading) return <div className="page"><div className="spinner" /></div>;

  const balance = profile?.balance || 0;
  const balanceConverted = convertPrice(balance);

  return (
    <div className="page">
      <div className="container" style={{ paddingTop: 20 }}>

        {/* Profile Header */}
        <div className="card-glass" style={{ marginBottom: 20, display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{
            width: 56, height: 56, borderRadius: '50%',
            background: 'linear-gradient(135deg, var(--accent), var(--accent3))',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 24, fontWeight: 700, color: 'white'
          }}>
            {(profile?.full_name || user.email)[0].toUpperCase()}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 700, fontSize: 16 }}>{profile?.full_name || 'User'}</div>
            <div style={{ color: 'var(--text2)', fontSize: 13 }}>{user.email}</div>
          </div>
          <button onClick={handleSignOut} style={{ background: 'rgba(239,68,68,0.1)', color: 'var(--danger)', border: '1px solid rgba(239,68,68,0.2)', padding: '6px 12px', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
            Logout
          </button>
        </div>

        {/* Currency Selector */}
        <div style={{ marginBottom: 16 }}>
          <label style={{ fontSize: 12, color: 'var(--text2)', display: 'block', marginBottom: 6 }}>Display Currency</label>
          <select className="input-field" value={currency} onChange={e => setCurrency(e.target.value)} style={{ padding: '10px 14px', fontSize: 14 }}>
            {CURRENCIES.map(c => (
              <option key={c.code} value={c.code}>{c.code} — {c.name}</option>
            ))}
          </select>
        </div>

        {/* Balance Card */}
        <div style={{
          background: 'linear-gradient(135deg, rgba(255,60,110,0.15), rgba(124,92,252,0.15))',
          border: '1px solid rgba(255,60,110,0.25)',
          borderRadius: 20,
          padding: 24,
          marginBottom: 20,
          textAlign: 'center'
        }}>
          <div style={{ fontSize: 13, color: 'var(--text2)', marginBottom: 6 }}>Account Balance</div>
          <div style={{ fontFamily: "'Bebas Neue', cursive", fontSize: 48, letterSpacing: 2, background: 'linear-gradient(135deg, var(--accent), var(--accent2))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            {selectedCurrency?.symbol}{balanceConverted}
          </div>
          <div style={{ fontSize: 12, color: 'var(--text3)', marginTop: 4 }}>≈ ${balance.toFixed(2)} USD</div>
          <div style={{ display: 'flex', gap: 10, marginTop: 16, justifyContent: 'center' }}>
            <button className="btn btn-success btn-sm" onClick={() => navigate('/wallet')}>+ Deposit</button>
            <button className="btn btn-secondary btn-sm" onClick={() => navigate('/wallet?tab=withdraw')}>Withdraw</button>
          </div>
        </div>

        {/* Stats */}
        <div className="stats-grid" style={{ marginBottom: 20 }}>
          <div className="stat-card">
            <div className="stat-number">{downloads.length}</div>
            <div className="stat-label">Effects Downloaded</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">{selectedCurrency?.symbol}{convertPrice(downloads.reduce((a, d) => a + (d.price || 0), 0))}</div>
            <div className="stat-label">Total Spent</div>
          </div>
        </div>

        {/* Downloaded Effects */}
        <div className="section-header">
          <h2 className="section-title">📥 My Downloads</h2>
          <span style={{ fontSize: 13, color: 'var(--text2)' }}>{downloads.length} effects</span>
        </div>

        {downloads.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: 32 }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>🎭</div>
            <div style={{ fontWeight: 600, marginBottom: 6 }}>No downloads yet</div>
            <div style={{ color: 'var(--text2)', fontSize: 14, marginBottom: 16 }}>Browse effects and start your collection</div>
            <button className="btn btn-primary" style={{ width: 'auto', padding: '10px 20px', margin: '0 auto' }} onClick={() => navigate('/effects')}>
              Browse Effects
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {downloads.map(dl => {
              const effect = EFFECTS.find(e => e.id === dl.effect_id);
              return (
                <div key={dl.id} className="card" style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                  <div style={{ width: 44, height: 44, borderRadius: 10, background: 'var(--bg3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22 }}>
                    {effect?.emoji || '🎬'}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, fontSize: 14 }}>{effect?.name || dl.effect_name || 'Effect'}</div>
                    <div style={{ fontSize: 12, color: 'var(--text2)' }}>{new Date(dl.created_at).toLocaleDateString()}</div>
                  </div>
                  <div style={{ color: 'var(--accent)', fontWeight: 700, fontSize: 14 }}>
                    {selectedCurrency?.symbol}{convertPrice(dl.price || 0)}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <div style={{ height: 20 }} />
      </div>
    </div>
  );
}

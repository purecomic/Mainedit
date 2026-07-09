import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';

export default function Effects() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [effects, setEffects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [purchasing, setPurchasing] = useState(false);
  const [msg, setMsg] = useState('');
  const [ownedIds, setOwnedIds] = useState([]);
  const [playing, setPlaying] = useState(null);
  const [activeCategory, setActiveCategory] = useState('all');
  const audioRef = useRef(null);
  const [duration, setDuration] = useState({});
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    loadEffects();
    if (user) {
      supabase.from('downloads').select('effect_id').eq('user_id', user.id)
        .then(({ data }) => setOwnedIds((data || []).map(d => d.effect_id)));
    }
  }, [user]);

  const loadEffects = async () => {
    const { data } = await supabase.from('effects').select('*').order('created_at', { ascending: false });
    setEffects(data || []);
    setLoading(false);
  };

  const categories = ['all', ...new Set((effects || []).map(e => e.category).filter(Boolean))];

  const filtered = activeCategory === 'all' ? effects : effects.filter(e => e.category === activeCategory);

  const handlePlay = (effect) => {
    if (playing === effect.id) {
      audioRef.current?.pause();
      setPlaying(null);
    } else {
      if (audioRef.current) audioRef.current.pause();
      audioRef.current = new Audio(effect.preview_url || effect.audio_url);
      audioRef.current.play();
      audioRef.current.onended = () => { setPlaying(null); setProgress(0); };
      audioRef.current.onloadedmetadata = () => {
        const d = audioRef.current.duration;
        const mins = Math.floor(d/60);
        const secs = Math.floor(d%60).toString().padStart(2,'0');
        setDuration(prev => ({...prev, [effect.id]: mins+':'+secs}));
      };
      audioRef.current.ontimeupdate = () => {
        if(audioRef.current.duration) setProgress((audioRef.current.currentTime/audioRef.current.duration)*100);
      };
      setPlaying(effect.id);
    }
  };

  const handleBuy = async (effect) => {
    if (!user) { navigate('/login'); return; }
    setPurchasing(true);
    setMsg('');
    const { data: prof } = await supabase.from('profiles').select('balance, referral_balance').eq('id', user.id).single();
    const totalBal = (prof?.balance || 0) + (prof?.referral_balance || 0);
    if (totalBal < effect.price) {
      setMsg('❌ Insufficient balance. Please deposit funds.');
      setPurchasing(false);
      return;
    }
    // Use referral_balance first
    let refBal = prof?.referral_balance || 0;
    let mainBal = prof?.balance || 0;
    if (refBal >= effect.price) {
      refBal -= effect.price;
    } else {
      const remainder = effect.price - refBal;
      refBal = 0;
      mainBal -= remainder;
    }
    await supabase.from('profiles').update({ balance: mainBal, referral_balance: refBal }).eq('id', user.id);
    await supabase.from('downloads').insert({ user_id: user.id, effect_id: effect.id, effect_name: effect.title, price: effect.price });
    await supabase.from('effects').update({ downloads: (effect.downloads || 0) + 1 }).eq('id', effect.id);
    setOwnedIds(prev => [...prev, effect.id]);
    setMsg('✅ Effect purchased! Go to Dashboard to download.');
    setPurchasing(false);
    loadEffects();
  };

  if (loading) return <div className="page"><div className="container" style={{ paddingTop: 40, textAlign: 'center' }}>Loading effects...</div></div>;

  return (
    <div className="page">
      <div className="container" style={{ paddingTop: 20 }}>
        <div className="section-header">
          <h2 className="section-title">🎵 Sound Effects</h2>
        </div>

        <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 12, marginBottom: 16, scrollbarWidth: 'none' }}>
          {categories.map(cat => (
            <button key={cat} onClick={() => setActiveCategory(cat)} style={{ flexShrink: 0, padding: '6px 14px', borderRadius: 20, fontSize: 12, fontWeight: 600, cursor: 'pointer', background: activeCategory === cat ? 'var(--accent3)' : 'var(--bg3)', color: activeCategory === cat ? 'white' : 'var(--text2)', border: '1px solid ' + (activeCategory === cat ? 'var(--accent3)' : 'var(--border)') }}>
              {cat.charAt(0).toUpperCase() + cat.slice(1)}
            </button>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="card" style={{ textAlign: 'center', padding: 40 }}>
            <div style={{ fontSize: 40, marginBottom: 10 }}>🎵</div>
            <div style={{ color: 'var(--text2)' }}>No effects available yet</div>
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {filtered.map(effect => (
            <div key={effect.id} className="card" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 50, height: 50, borderRadius: 10, background: 'var(--bg3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, flexShrink: 0, overflow: 'hidden' }}>
                {effect.cover_url ? <img src={effect.cover_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 10 }} /> : '🎵'}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 600, fontSize: 14 }}>{effect.title}</div>
                <div style={{ fontSize: 11, color: 'var(--text2)', marginTop: 2 }}>{effect.description}</div>
                <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 2, textTransform: 'capitalize' }}>{effect.category}</div>
              {duration[effect.id] && <div style={{ fontSize: 10, color: 'var(--accent)', marginTop: 2 }}>⏱ {duration[effect.id]}</div>}
              {playing === effect.id && <div style={{ height: 3, background: 'var(--bg3)', borderRadius: 2, marginTop: 4 }}><div style={{ height: '100%', width: progress+'%', background: 'var(--accent)', borderRadius: 2, transition: 'width 0.3s' }}></div></div>}
              </div>
              <div style={{ textAlign: 'right', flexShrink: 0 }}>
                <div style={{ fontWeight: 700, color: 'var(--accent)', fontSize: 15 }}>${effect.price}</div>
                <div style={{ display: 'flex', gap: 6, marginTop: 6 }}>
                  {(effect.preview_url || effect.audio_url) && (
                    <button className="btn btn-secondary btn-sm" onClick={() => handlePlay(effect)} style={{ fontSize: 11, padding: '3px 8px' }}>
                      {playing === effect.id ? '⏹' : '▶'}
                    </button>
                  )}
                  {ownedIds.includes(effect.id) ? (
                    <a href={effect.audio_url} download className="btn btn-success btn-sm" style={{ fontSize: 11, padding: '3px 8px', textDecoration: 'none' }}>⬇ Get</a>
                  ) : (
                    <button className="btn btn-primary btn-sm" onClick={() => { setSelected(effect); setMsg(''); }} style={{ fontSize: 11, padding: '3px 8px' }}>Buy</button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {selected && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 20 }}>
            <div className="card" style={{ width: '100%', maxWidth: 360 }}>
              <h3 style={{ fontSize: 18, marginBottom: 8 }}>{selected.title}</h3>
              <p style={{ color: 'var(--text2)', fontSize: 13, marginBottom: 16 }}>{selected.description}</p>
              <div style={{ fontSize: 28, fontWeight: 700, color: 'var(--accent)', marginBottom: 16 }}>${selected.price}</div>
              {msg && <div className={`alert ${msg.startsWith('✅') ? 'alert-success' : 'alert-error'}`} style={{ marginBottom: 12 }}>{msg}</div>}
              <button className="btn btn-primary" onClick={() => handleBuy(selected)} disabled={purchasing}>
                {purchasing ? '⏳ Processing...' : `🛒 Buy for $${selected.price}`}
              </button>
              <button className="btn btn-secondary" style={{ marginTop: 10 }} onClick={() => { setSelected(null); setMsg(''); }}>Cancel</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

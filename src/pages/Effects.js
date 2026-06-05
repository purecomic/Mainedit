import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { EFFECTS, EFFECT_CATEGORIES, CURRENCIES } from '../lib/data';

export default function Effects() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [activeCategory, setActiveCategory] = useState(searchParams.get('cat') || 'all');
  const [currency, setCurrency] = useState('USD');
  const [selected, setSelected] = useState(null);
  const [purchasing, setPurchasing] = useState(false);
  const [msg, setMsg] = useState('');
  const [ownedIds, setOwnedIds] = useState([]);

  const selectedCurrency = CURRENCIES.find(c => c.code === currency);

  useEffect(() => {
    if (user) {
      supabase.from('downloads').select('effect_id').eq('user_id', user.id)
        .then(({ data }) => setOwnedIds((data || []).map(d => d.effect_id)));
    }
  }, [user]);

  const filtered = activeCategory === 'all' ? EFFECTS : EFFECTS.filter(e => e.category === activeCategory);

  const convertPrice = (usd) => {
    const rate = selectedCurrency?.rate || 1;
    return (usd * rate).toFixed(2);
  };

  const handleBuy = async (effect) => {
    if (!user) { navigate('/login'); return; }
    setPurchasing(true);
    setMsg('');
    // Check balance
    const { data: prof } = await supabase.from('profiles').select('balance').eq('id', user.id).single();
    if (!prof || prof.balance < effect.price) {
      setMsg('❌ Insufficient balance. Please deposit funds.');
      setPurchasing(false);
      return;
    }
    // Deduct balance
    await supabase.from('profiles').update({ balance: prof.balance - effect.price }).eq('id', user.id);
    // Record download
    await supabase.from('downloads').insert({ user_id: user.id, effect_id: effect.id, effect_name: effect.name, price: effect.price });
    setOwnedIds(prev => [...prev, effect.id]);
    setMsg('✅ Effect purchased and added to your downloads!');
    setPurchasing(false);
  };

  return (
    <div className="page">
      <div className="container" style={{ paddingTop: 20 }}>

        <div className="section-header">
          <h2 className="section-title">🎭 All Effects</h2>
          <select className="input-field" value={currency} onChange={e => setCurrency(e.target.value)}
            style={{ padding: '6px 10px', fontSize: 12, width: 'auto', borderRadius: 8 }}>
            {CURRENCIES.map(c => <option key={c.code} value={c.code}>{c.code}</option>)}
          </select>
        </div>

        {/* Category Scroll */}
        <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 12, marginBottom: 16, scrollbarWidth: 'none' }}>
          <button
            onClick={() => setActiveCategory('all')}
            style={{
              flexShrink: 0, padding: '8px 16px', borderRadius: 20, fontSize: 13, fontWeight: 600, cursor: 'pointer',
              background: activeCategory === 'all' ? 'var(--accent)' : 'var(--bg3)',
              color: activeCategory === 'all' ? 'white' : 'var(--text2)',
              border: '1px solid ' + (activeCategory === 'all' ? 'var(--accent)' : 'var(--border)')
            }}>
            All ({EFFECTS.length})
          </button>
          {EFFECT_CATEGORIES.map(cat => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              style={{
                flexShrink: 0, padding: '8px 16px', borderRadius: 20, fontSize: 13, fontWeight: 600, cursor: 'pointer',
                background: activeCategory === cat.id ? cat.color : 'var(--bg3)',
                color: activeCategory === cat.id ? 'white' : 'var(--text2)',
                border: '1px solid ' + (activeCategory === cat.id ? cat.color : 'var(--border)')
              }}>
              {cat.emoji} {cat.name}
            </button>
          ))}
        </div>

        {/* Effects Grid */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {filtered.map(effect => {
            const owned = ownedIds.includes(effect.id);
            return (
              <div key={effect.id} className="effect-card" onClick={() => setSelected(effect)} style={{ cursor: 'pointer' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                  <div style={{ width: 52, height: 52, borderRadius: 14, background: 'var(--bg3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26 }}>
                    {effect.emoji}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3 }}>
                      <span style={{ fontWeight: 700, fontSize: 15 }}>{effect.name}</span>
                      {effect.featured && <span className="badge badge-orange" style={{ fontSize: 9 }}>HOT</span>}
                      {owned && <span className="badge badge-green" style={{ fontSize: 9 }}>OWNED</span>}
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--text2)' }}>{effect.description}</div>
                    <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 3 }}>⬇️ {effect.downloads.toLocaleString()} downloads</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontWeight: 700, color: 'var(--accent)', fontSize: 16 }}>
                      {selectedCurrency?.symbol}{convertPrice(effect.price)}
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--text3)' }}>{currency}</div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div style={{ height: 20 }} />
      </div>

      {/* Effect Detail Modal */}
      {selected && (
        <div className="modal-overlay" onClick={() => { setSelected(null); setMsg(''); }}>
          <div className="modal-sheet" onClick={e => e.stopPropagation()}>
            <div style={{ width: 40, height: 4, background: 'var(--border)', borderRadius: 2, margin: '0 auto 20px' }} />
            <div style={{ textAlign: 'center', marginBottom: 20 }}>
              <div style={{ fontSize: 56, marginBottom: 10 }}>{selected.emoji}</div>
              <h2 style={{ fontSize: 28, marginBottom: 6 }}>{selected.name.toUpperCase()}</h2>
              <p style={{ color: 'var(--text2)', fontSize: 14 }}>{selected.description}</p>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-around', marginBottom: 20 }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontFamily: "'Bebas Neue'", fontSize: 24, color: 'var(--accent)' }}>{selectedCurrency?.symbol}{convertPrice(selected.price)}</div>
                <div style={{ fontSize: 11, color: 'var(--text3)' }}>Price ({currency})</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontFamily: "'Bebas Neue'", fontSize: 24, color: 'var(--accent3)' }}>{selected.downloads.toLocaleString()}</div>
                <div style={{ fontSize: 11, color: 'var(--text3)' }}>Downloads</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                {(() => { const cat = EFFECT_CATEGORIES.find(c => c.id === selected.category); return <>
                  <div style={{ fontSize: 24 }}>{cat?.emoji}</div>
                  <div style={{ fontSize: 11, color: 'var(--text3)' }}>{cat?.name}</div>
                </>; })()}
              </div>
            </div>
            {msg && <div className={`alert ${msg.startsWith('✅') ? 'alert-success' : 'alert-error'}`}>{msg}</div>}
            {ownedIds.includes(selected.id) ? (
              <button className="btn btn-secondary" disabled>✅ Already Owned</button>
            ) : (
              <button className="btn btn-primary" onClick={() => handleBuy(selected)} disabled={purchasing}>
                {purchasing ? '⏳ Processing...' : `🛒 Buy for ${selectedCurrency?.symbol}${convertPrice(selected.price)}`}
              </button>
            )}
            <button className="btn btn-secondary" style={{ marginTop: 10 }} onClick={() => { setSelected(null); setMsg(''); }}>Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
}

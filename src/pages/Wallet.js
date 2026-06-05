import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { CURRENCIES } from '../lib/data';

export default function Wallet() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [tab, setTab] = useState(searchParams.get('tab') === 'withdraw' ? 'withdraw' : 'deposit');
  const [profile, setProfile] = useState(null);
  const [amount, setAmount] = useState('');
  const [currency, setCurrency] = useState('USD');
  const [method, setMethod] = useState('card');
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');
  const [transactions, setTransactions] = useState([]);

  const selectedCurrency = CURRENCIES.find(c => c.code === currency);

  useEffect(() => {
    if (!user) { navigate('/login'); return; }
    loadData();
  }, [user]);

  const loadData = async () => {
    const { data: prof } = await supabase.from('profiles').select('*').eq('id', user.id).single();
    const { data: tx } = await supabase.from('transactions').select('*').eq('user_id', user.id).order('created_at', { ascending: false }).limit(20);
    setProfile(prof);
    setTransactions(tx || []);
  };

  const usdAmount = () => {
    const rate = selectedCurrency?.rate || 1;
    return (parseFloat(amount || 0) / rate).toFixed(2);
  };

  const handleDeposit = async () => {
    setMsg('');
    const usd = parseFloat(usdAmount());
    if (!amount || usd < 1) return setMsg('❌ Minimum deposit is equivalent to $1 USD.');
    setLoading(true);
    // In a real app you'd process payment here. For now we simulate.
    const { data: prof } = await supabase.from('profiles').select('balance').eq('id', user.id).single();
    const newBal = (prof?.balance || 0) + usd;
    await supabase.from('profiles').update({ balance: newBal }).eq('id', user.id);
    await supabase.from('transactions').insert({ user_id: user.id, type: 'deposit', amount: usd, currency, display_amount: amount, method, status: 'completed' });
    setProfile(prev => ({ ...prev, balance: newBal }));
    setTransactions(prev => [{ id: Date.now(), type: 'deposit', amount: usd, currency, display_amount: amount, method, status: 'completed', created_at: new Date().toISOString() }, ...prev]);
    setAmount('');
    setMsg('✅ Deposit successful! Balance updated.');
    setLoading(false);
  };

  const handleWithdraw = async () => {
    setMsg('');
    const usd = parseFloat(usdAmount());
    if (!amount || usd < 1) return setMsg('❌ Minimum withdrawal is equivalent to $1 USD.');
    const bal = profile?.balance || 0;
    if (usd > bal) return setMsg('❌ Insufficient balance.');
    setLoading(true);
    const newBal = bal - usd;
    await supabase.from('profiles').update({ balance: newBal }).eq('id', user.id);
    await supabase.from('transactions').insert({ user_id: user.id, type: 'withdrawal', amount: usd, currency, display_amount: amount, method, status: 'pending' });
    setProfile(prev => ({ ...prev, balance: newBal }));
    setTransactions(prev => [{ id: Date.now(), type: 'withdrawal', amount: usd, currency, display_amount: amount, method, status: 'pending', created_at: new Date().toISOString() }, ...prev]);
    setAmount('');
    setMsg('✅ Withdrawal request submitted. Processing within 24–48 hours.');
    setLoading(false);
  };

  const balance = profile?.balance || 0;
  const sc = selectedCurrency;

  return (
    <div className="page">
      <div className="container" style={{ paddingTop: 20 }}>
        <h2 className="section-title" style={{ marginBottom: 20 }}>💳 Wallet</h2>

        {/* Balance */}
        <div style={{
          background: 'linear-gradient(135deg, #1a1a2e, #16213e)',
          border: '1px solid rgba(124,92,252,0.3)',
          borderRadius: 20, padding: 24, marginBottom: 20, textAlign: 'center'
        }}>
          <div style={{ fontSize: 12, color: 'var(--text3)', marginBottom: 4, textTransform: 'uppercase', letterSpacing: 2 }}>Available Balance</div>
          <div style={{ fontFamily: "'Bebas Neue'", fontSize: 44, color: 'var(--success)', letterSpacing: 2 }}>
            ${balance.toFixed(2)} <span style={{ fontSize: 20, color: 'var(--text3)' }}>USD</span>
          </div>
        </div>

        {/* Tabs */}
        <div className="tabs">
          <button className={`tab ${tab === 'deposit' ? 'active' : ''}`} onClick={() => { setTab('deposit'); setMsg(''); }}>💰 Deposit</button>
          <button className={`tab ${tab === 'withdraw' ? 'active' : ''}`} onClick={() => { setTab('withdraw'); setMsg(''); }}>🏦 Withdraw</button>
          <button className={`tab ${tab === 'history' ? 'active' : ''}`} onClick={() => setTab('history')}>📜 History</button>
        </div>

        {(tab === 'deposit' || tab === 'withdraw') && (
          <div className="card">
            <div className="input-group">
              <label>Currency</label>
              <select className="input-field" value={currency} onChange={e => setCurrency(e.target.value)}>
                {CURRENCIES.map(c => <option key={c.code} value={c.code}>{c.symbol} {c.code} — {c.name}</option>)}
              </select>
            </div>
            <div className="input-group">
              <label>Amount ({currency})</label>
              <input className="input-field" type="number" placeholder={`Enter amount in ${currency}`} value={amount} onChange={e => setAmount(e.target.value)} />
              {amount && <div style={{ fontSize: 12, color: 'var(--text2)', marginTop: 4 }}>≈ ${usdAmount()} USD</div>}
            </div>
            <div className="input-group">
              <label>Payment Method</label>
              <select className="input-field" value={method} onChange={e => setMethod(e.target.value)}>
                <option value="card">💳 Debit/Credit Card</option>
                <option value="bank">🏦 Bank Transfer</option>
                <option value="mobile_money">📱 Mobile Money</option>
                <option value="crypto">₿ Cryptocurrency</option>
                <option value="paypal">🅿️ PayPal</option>
              </select>
            </div>
            {msg && <div className={`alert ${msg.startsWith('✅') ? 'alert-success' : 'alert-error'}`}>{msg}</div>}

            {tab === 'deposit' ? (
              <button className="btn btn-success" onClick={handleDeposit} disabled={loading}>
                {loading ? '⏳ Processing...' : `💰 Deposit ${amount ? `${sc?.symbol}${amount}` : ''}`}
              </button>
            ) : (
              <>
                <div className="alert alert-info" style={{ marginBottom: 12 }}>
                  ℹ️ Withdrawals are reviewed within 24–48 hours. Make sure your payment details are correct.
                </div>
                <button className="btn btn-primary" onClick={handleWithdraw} disabled={loading}>
                  {loading ? '⏳ Processing...' : `🏦 Withdraw ${amount ? `${sc?.symbol}${amount}` : ''}`}
                </button>
              </>
            )}
          </div>
        )}

        {tab === 'history' && (
          <div>
            {transactions.length === 0 ? (
              <div className="card" style={{ textAlign: 'center', padding: 32 }}>
                <div style={{ fontSize: 36, marginBottom: 10 }}>📭</div>
                <div style={{ color: 'var(--text2)' }}>No transactions yet</div>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {transactions.map((tx, i) => (
                  <div key={tx.id || i} className="card" style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                    <div style={{ fontSize: 28 }}>{tx.type === 'deposit' ? '⬇️' : '⬆️'}</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600, fontSize: 14, textTransform: 'capitalize' }}>{tx.type}</div>
                      <div style={{ fontSize: 12, color: 'var(--text2)' }}>{tx.method} • {new Date(tx.created_at).toLocaleDateString()}</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontWeight: 700, color: tx.type === 'deposit' ? 'var(--success)' : 'var(--accent)', fontSize: 15 }}>
                        {tx.type === 'deposit' ? '+' : '-'}${parseFloat(tx.amount).toFixed(2)}
                      </div>
                      <span className={`badge ${tx.status === 'completed' ? 'badge-green' : 'badge-orange'}`} style={{ fontSize: 9 }}>
                        {tx.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        <div style={{ height: 20 }} />
      </div>
    </div>
  );
}

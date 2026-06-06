import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { CURRENCIES } from '../lib/data';

const BANK_ACCOUNTS = [
  { bank: 'Opay', name: 'Kingsley', number: '8135929265', icon: '🟢' },
  { bank: 'Palmpay', name: 'Kingsley', number: '8135929265', icon: '🔵' },
];

const NGN_RATE = 1580;

export default function Wallet() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [tab, setTab] = useState(searchParams.get('tab') === 'withdraw' ? 'withdraw' : 'deposit');
  const [profile, setProfile] = useState(null);
  const [amount, setAmount] = useState('');
  const [currency, setCurrency] = useState('USD');
  const [method, setMethod] = useState('bank');
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');
  const [transactions, setTransactions] = useState([]);
  const [copied, setCopied] = useState('');
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

  const toNGN = (amt, fromCurrency) => {
    const rate = CURRENCIES.find(c => c.code === fromCurrency)?.rate || 1;
    const usd = parseFloat(amt || 0) / rate;
    return (usd * NGN_RATE).toLocaleString('en-NG', { maximumFractionDigits: 0 });
  };

  const toUSD = () => {
    const rate = selectedCurrency?.rate || 1;
    return (parseFloat(amount || 0) / rate).toFixed(2);
  };

  const copyToClipboard = (text, label) => {
    navigator.clipboard.writeText(text);
    setCopied(label);
    setTimeout(() => setCopied(''), 2000);
  };

  const handleDeposit = async () => {
    setMsg('');
    const usd = parseFloat(toUSD());
    if (!amount || usd < 1) return setMsg('Minimum deposit is 1 USD equivalent.');
    setLoading(true);
    const { data: txData, error: txError } = await supabase.from('transactions').insert({ user_id: user.id, type: 'deposit', amount: usd, currency, display_amount: amount, method, status: 'pending' }).select();
    console.log('TX INSERT RESULT:', txData, 'ERROR:', txError);
    if (txError) {
      setMsg('Error: ' + txError.message);
      setLoading(false);
      return;
    }
    await loadData();
    setAmount('');
    setMsg('Payment submitted! Admin will confirm within 1-24 hours.');
    setLoading(false);
  };

  const handleWithdraw = async () => {
    setMsg('');
    const usd = parseFloat(toUSD());
    if (!amount || usd < 1) return setMsg('Minimum withdrawal is 1 USD equivalent.');
    const bal = profile?.balance || 0;
    if (usd > bal) return setMsg('Insufficient balance.');
    setLoading(true);
    const newBal = bal - usd;
    await supabase.from('profiles').update({ balance: newBal }).eq('id', user.id);
    await supabase.from('transactions').insert({ user_id: user.id, type: 'withdrawal', amount: usd, currency, display_amount: amount, method, status: 'pending' });
    setProfile(prev => ({ ...prev, balance: newBal }));
    await loadData();
    setAmount('');
    setMsg('Withdrawal submitted. Processing within 24-48 hours.');
    setLoading(false);
  };

  const balance = profile?.balance || 0;

  return (
    <div className="page">
      <div className="container" style={{ paddingTop: 20 }}>
        <h2 className="section-title" style={{ marginBottom: 20 }}>Wallet</h2>
        <div style={{ background: 'linear-gradient(135deg,#1a1a2e,#16213e)', border: '1px solid rgba(124,92,252,0.3)', borderRadius: 20, padding: 24, marginBottom: 20, textAlign: 'center' }}>
          <div style={{ fontSize: 12, color: 'var(--text3)', marginBottom: 4, textTransform: 'uppercase', letterSpacing: 2 }}>Available Balance</div>
          <div style={{ fontFamily: "Bebas Neue", fontSize: 44, color: 'var(--success)' }}>${balance.toFixed(2)} USD</div>
          <div style={{ fontSize: 13, color: 'var(--text2)', marginTop: 4 }}>= N{(balance * NGN_RATE).toLocaleString('en-NG', { maximumFractionDigits: 0 })} NGN</div>
        </div>
        <div className="tabs">
          <button className={"tab " + (tab === 'deposit' ? 'active' : '')} onClick={() => { setTab('deposit'); setMsg(''); }}>Deposit</button>
          <button className={"tab " + (tab === 'withdraw' ? 'active' : '')} onClick={() => { setTab('withdraw'); setMsg(''); }}>Withdraw</button>
          <button className={"tab " + (tab === 'history' ? 'active' : '')} onClick={() => setTab('history')}>History</button>
        </div>

        {tab === 'deposit' && (
          <div>
            <div className="card" style={{ marginBottom: 14 }}>
              <h3 style={{ fontSize: 18, marginBottom: 14 }}>Enter Amount</h3>
              <div className="input-group">
                <label>Your Currency</label>
                <select className="input-field" value={currency} onChange={e => setCurrency(e.target.value)}>
                  {CURRENCIES.map(c => <option key={c.code} value={c.code}>{c.symbol} {c.code} - {c.name}</option>)}
                </select>
              </div>
              <div className="input-group">
                <label>Amount ({currency})</label>
                <input className="input-field" type="number" placeholder={"Enter amount in " + currency} value={amount} onChange={e => setAmount(e.target.value)} />
              </div>
              {amount && (
                <div style={{ background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.2)', borderRadius: 12, padding: 14, marginTop: 8 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text2)', marginBottom: 8 }}>Conversion Summary</div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                    <span style={{ color: 'var(--text2)', fontSize: 13 }}>You send:</span>
                    <span style={{ fontWeight: 700 }}>{selectedCurrency?.symbol}{amount} {currency}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                    <span style={{ color: 'var(--text2)', fontSize: 13 }}>Send in Naira:</span>
                    <span style={{ fontWeight: 700, color: 'var(--success)', fontSize: 16 }}>N{toNGN(amount, currency)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text2)', fontSize: 13 }}>USD value:</span>
                    <span style={{ fontWeight: 700, color: 'var(--accent)' }}>${toUSD()}</span>
                  </div>
                </div>
              )}
            </div>
            {amount && (
              <div className="card" style={{ marginBottom: 14 }}>
                <h3 style={{ fontSize: 18, marginBottom: 6 }}>Send Payment To</h3>
                <p style={{ fontSize: 13, color: 'var(--text2)', marginBottom: 14 }}>Send <strong style={{ color: 'var(--success)' }}>N{toNGN(amount, currency)}</strong> to any account below</p>
                {BANK_ACCOUNTS.map((acc, i) => (
                  <div key={i} style={{ background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: 12, padding: 14, marginBottom: 10 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                      <span style={{ fontSize: 24 }}>{acc.icon}</span>
                      <div>
                        <div style={{ fontWeight: 700 }}>{acc.bank}</div>
                        <div style={{ fontSize: 12, color: 'var(--text2)' }}>{acc.name}</div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div style={{ fontFamily: 'monospace', fontSize: 20, fontWeight: 700, letterSpacing: 2, color: 'var(--accent)' }}>{acc.number}</div>
                      <button onClick={() => copyToClipboard(acc.number, acc.bank)} style={{ background: copied === acc.bank ? 'rgba(34,197,94,0.2)' : 'rgba(124,92,252,0.2)', color: copied === acc.bank ? 'var(--success)' : 'var(--accent3)', border: '1px solid rgba(124,92,252,0.3)', borderRadius: 8, padding: '6px 14px', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
                        {copied === acc.bank ? 'Copied!' : 'Copy'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
            {msg && <div className={"alert " + (msg.startsWith('Payment') ? 'alert-success' : 'alert-error')} style={{ marginBottom: 12 }}>{msg}</div>}
            <button className="btn btn-success" onClick={handleDeposit} disabled={loading || !amount}>
              {loading ? 'Submitting...' : "I Have Paid N" + (amount ? toNGN(amount, currency) : '0')}
            </button>
            <div className="alert alert-info" style={{ marginTop: 14 }}>After sending payment tap the button above. Admin will confirm within 1-24 hours.</div>
          </div>
        )}

        {tab === 'withdraw' && (
          <div className="card">
            <h3 style={{ fontSize: 18, marginBottom: 14 }}>Withdraw Funds</h3>
            <div className="input-group">
              <label>Currency</label>
              <select className="input-field" value={currency} onChange={e => setCurrency(e.target.value)}>
                {CURRENCIES.map(c => <option key={c.code} value={c.code}>{c.symbol} {c.code} - {c.name}</option>)}
              </select>
            </div>
            <div className="input-group">
              <label>Amount ({currency})</label>
              <input className="input-field" type="number" placeholder={"Enter amount in " + currency} value={amount} onChange={e => setAmount(e.target.value)} />
              {amount && <div style={{ fontSize: 12, color: 'var(--text2)', marginTop: 4 }}>= N{toNGN(amount, currency)} - ${toUSD()} USD</div>}
            </div>
            <div className="input-group">
              <label>Method</label>
              <select className="input-field" value={method} onChange={e => setMethod(e.target.value)}>
                <option value="opay">Opay</option>
                <option value="palmpay">Palmpay</option>
                <option value="bank">Bank Transfer</option>
              </select>
            </div>
            {msg && <div className={"alert " + (msg.startsWith('Withdrawal') ? 'alert-success' : 'alert-error')} style={{ marginBottom: 12 }}>{msg}</div>}
            <div className="alert alert-info" style={{ marginBottom: 12 }}>Withdrawals processed within 24-48 hours in NGN.</div>
            <button className="btn btn-primary" onClick={handleWithdraw} disabled={loading}>{loading ? 'Processing...' : 'Request Withdrawal'}</button>
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
                      <div style={{ fontSize: 12, color: 'var(--text2)' }}>{tx.method} - {new Date(tx.created_at).toLocaleDateString()}</div>
                      <div style={{ fontSize: 11, color: 'var(--text3)' }}>= N{(parseFloat(tx.amount) * NGN_RATE).toLocaleString('en-NG', { maximumFractionDigits: 0 })} NGN</div>
    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontWeight: 700, color: tx.type === 'deposit' ? 'var(--success)' : 'var(--accent)', fontSize: 15 }}>{tx.type === 'deposit' ? '+' : '-'}${parseFloat(tx.amount).toFixed(2)}</div>
                      <span className={"badge " + (tx.status === 'completed' ? 'badge-green' : tx.status === 'pending' ? 'badge-orange' : 'badge-red')} style={{ fontSize: 9 }}>{tx.status}</span>
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
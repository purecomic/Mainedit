import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { supabase, ADMIN_EMAIL } from '../lib/supabase';

const ADMIN_PASSWORD = 'Black234';

export default function Admin() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [unlocked, setUnlocked] = useState(false);
  const [pw, setPw] = useState('');
  const [pwError, setPwError] = useState('');
  const [activeTab, setActiveTab] = useState('users');

  // Users
  const [users, setUsers] = useState([]);
  // Notifications
  const [notifTitle, setNotifTitle] = useState('');
  const [notifMsg, setNotifMsg] = useState('');
  const [notifTarget, setNotifTarget] = useState('all');
  const [notifUserId, setNotifUserId] = useState('');
  const [sending, setSending] = useState(false);
  const [notifStatus, setNotifStatus] = useState('');
  // Lesson contacts
  const [contacts, setContacts] = useState([]);
  const [newContact, setNewContact] = useState({ platform: 'whatsapp', handle: '', link: '' });
  const [contactMsg, setContactMsg] = useState('');
  // Transactions
  const [transactions, setTransactions] = useState([]);
  const [stats, setStats] = useState({ users: 0, revenue: 0, downloads: 0 });

  // Guard: must be logged in as admin
  useEffect(() => {
    if (!user) { navigate('/login'); return; }
    if (user.email !== ADMIN_EMAIL) { navigate('/'); return; }
  }, [user]);

  // Load data after unlock
  useEffect(() => {
    if (!unlocked) return;
    loadAll();
  }, [unlocked]);

  const loadAll = async () => {
    const { data: profs } = await supabase.from('profiles').select('*').order('created_at', { ascending: false });
    const { data: tx } = await supabase.from('transactions').select('*').order('created_at', { ascending: false }).limit(50);
    const { data: dl } = await supabase.from('downloads').select('*');
    const { data: ct } = await supabase.from('lesson_contacts').select('*').order('created_at');
    setUsers(profs || []);
    setTransactions(tx || []);
    setStats({ users: (profs||[]).length, revenue: (tx||[]).filter(t=>t.status==="completed").reduce((a,b)=>a+(parseFloat(b.amount)||0),0), downloads: (dl||[]).length });
    setContacts(ct || []);
    const totalRevenue = (tx || []).filter(t => t.type === 'deposit' && t.status === 'completed').reduce((a, t) => a + (t.amount || 0), 0);
    setStats({ users: (profs || []).length, revenue: totalRevenue, downloads: (dl || []).length });
  };

  const handleUnlock = () => {
    if (pw === ADMIN_PASSWORD) { setUnlocked(true); setPwError(''); }
    else setPwError('❌ Incorrect password.');
  };

  const sendNotification = async () => {
    if (!notifTitle || !notifMsg) return setNotifStatus('❌ Title and message required.');
    setSending(true);
    setNotifStatus('');
    if (notifTarget === 'all') {
      const rows = users.map(u => ({ user_id: u.id, title: notifTitle, message: notifMsg, read: false }));
      await supabase.from('notifications').insert(rows);
    } else {
      await supabase.from('notifications').insert({ user_id: notifUserId, title: notifTitle, message: notifMsg, read: false });
    }
    setNotifTitle(''); setNotifMsg(''); setSending(false);
    setNotifStatus('✅ Notification sent successfully!');
  };

  const adjustBalance = async (userId, delta) => {
    const u = users.find(x => x.id === userId);
    if (!u) return;
    const newBal = Math.max(0, (u.balance || 0) + delta);
    await supabase.from('profiles').update({ balance: newBal }).eq('id', userId);
    setUsers(prev => prev.map(x => x.id === userId ? { ...x, balance: newBal } : x));
  };

  const addContact = async () => {
    if (!newContact.handle) return setContactMsg('❌ Handle is required.');
    const { data, error } = await supabase.from('lesson_contacts').insert(newContact).select().single();
    if (error) return setContactMsg('❌ ' + error.message);
    setContacts(prev => [...prev, data]);
    setNewContact({ platform: 'whatsapp', handle: '', link: '' });
    setContactMsg('✅ Contact added!');
  };

  const deleteContact = async (id) => {
    await supabase.from('lesson_contacts').delete().eq('id', id);
    setContacts(prev => prev.filter(c => c.id !== id));
  };

  const updateTxStatus = async (id, status) => {
    await supabase.from('transactions').update({ status }).eq('id', id);
    setTransactions(prev => prev.map(t => t.id === id ? { ...t, status } : t));
  };

  if (!user || user.email !== ADMIN_EMAIL) return null;

  // Password lock screen
  if (!unlocked) {
    return (
      <div className="page-no-nav" style={{ background: 'var(--bg)' }}>
        <div style={{ width: '100%', maxWidth: 400, padding: '0 16px', textAlign: 'center' }}>
          <div style={{ fontSize: 56, marginBottom: 16 }}>👑</div>
          <h2 style={{ fontSize: 32, marginBottom: 8 }}>ADMIN PANEL</h2>
          <p style={{ color: 'var(--text2)', fontSize: 14, marginBottom: 28 }}>Enter the admin password to continue</p>
          {pwError && <div className="alert alert-error">{pwError}</div>}
          <div className="input-group">
            <input className="input-field" type="password" placeholder="Admin password" value={pw}
              onChange={e => setPw(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleUnlock()} />
          </div>
          <button className="btn btn-purple" onClick={handleUnlock}>🔓 Unlock Admin Panel</button>
          <button className="btn btn-secondary" style={{ marginTop: 10 }} onClick={() => navigate('/')}>← Back to Home</button>
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <div className="container" style={{ paddingTop: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
          <div style={{ fontSize: 28 }}>👑</div>
          <div>
            <h2 style={{ fontSize: 26 }}>ADMIN PANEL</h2>
            <div style={{ fontSize: 12, color: 'var(--text3)' }}>Main Edit Control Center</div>
          </div>
        </div>

        {/* Stats */}
        <div className="stats-grid" style={{ marginBottom: 20 }}>
          <div className="stat-card"><div className="stat-number">{stats.users}</div><div className="stat-label">Total Users</div></div>
          <div className="stat-card"><div className="stat-number">${stats.revenue.toFixed(0)}</div><div className="stat-label">Total Revenue</div></div>
          <div className="stat-card"><div className="stat-number">{stats.downloads}</div><div className="stat-label">Downloads</div></div>
          <div className="stat-card"><div className="stat-number">{transactions.filter(t => t.status === 'pending').length}</div><div className="stat-label">Pending TX</div></div>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 6, overflowX: 'auto', paddingBottom: 8, marginBottom: 16, scrollbarWidth: 'none' }}>
          {[['users','👥 Users'], ['notifications','🔔 Notify'], ['contacts','📞 Lessons'], ['transactions','💳 Transactions']].map(([id, label]) => (
            <button key={id} onClick={() => setActiveTab(id)} style={{
              flexShrink: 0, padding: '8px 14px', borderRadius: 10, fontSize: 12, fontWeight: 600, cursor: 'pointer',
              background: activeTab === id ? 'var(--accent3)' : 'var(--bg3)',
              color: activeTab === id ? 'white' : 'var(--text2)',
              border: '1px solid ' + (activeTab === id ? 'var(--accent3)' : 'var(--border)')
            }}>{label}</button>
          ))}
        </div>

        {/* USERS TAB */}
        {activeTab === 'users' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {users.map(u => (
              <div key={u.id} className="card">
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
                  <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'var(--bg3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>
                    {(u.full_name || u.email)[0].toUpperCase()}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, fontSize: 14 }}>{u.full_name || 'No Name'}</div>
                    <div style={{ fontSize: 12, color: 'var(--text2)' }}>{u.email}</div>
                  </div>
                  <div style={{ fontWeight: 700, color: 'var(--success)' }}>${(u.balance || 0).toFixed(2)}</div>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button className="btn btn-success btn-sm" onClick={() => adjustBalance(u.id, 10)}>+$10</button>
                  <button className="btn btn-success btn-sm" onClick={() => adjustBalance(u.id, 50)}>+$50</button>
                  <button className="btn btn-danger btn-sm" onClick={() => adjustBalance(u.id, -10)}>-$10</button>
                  <button className="btn btn-secondary btn-sm" style={{ flex: 1, fontSize: 11 }} onClick={() => { setNotifTarget('specific'); setNotifUserId(u.id); setActiveTab('notifications'); }}>📨 Message</button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* NOTIFICATIONS TAB */}
        {activeTab === 'notifications' && (
          <div className="card">
            <h3 style={{ fontSize: 18, marginBottom: 16 }}>📨 SEND NOTIFICATION</h3>
            <div className="input-group">
              <label>Target</label>
              <select className="input-field" value={notifTarget} onChange={e => setNotifTarget(e.target.value)}>
                <option value="all">📢 All Users</option>
                <option value="specific">👤 Specific User</option>
              </select>
            </div>
            {notifTarget === 'specific' && (
              <div className="input-group">
                <label>Select User</label>
                <select className="input-field" value={notifUserId} onChange={e => setNotifUserId(e.target.value)}>
                  <option value="">-- Choose user --</option>
                  {users.map(u => <option key={u.id} value={u.id}>{u.full_name || u.email}</option>)}
                </select>
              </div>
            )}
            <div className="input-group">
              <label>Title</label>
              <input className="input-field" placeholder="Notification title" value={notifTitle} onChange={e => setNotifTitle(e.target.value)} />
            </div>
            <div className="input-group">
              <label>Message</label>
              <textarea className="input-field" rows={4} placeholder="Write your message..." value={notifMsg} onChange={e => setNotifMsg(e.target.value)} style={{ resize: 'none', lineHeight: 1.5 }} />
            </div>
            {notifStatus && <div className={`alert ${notifStatus.startsWith('✅') ? 'alert-success' : 'alert-error'}`}>{notifStatus}</div>}
            <button className="btn btn-purple" onClick={sendNotification} disabled={sending}>
              {sending ? '⏳ Sending...' : '🔔 Send Notification'}
            </button>
          </div>
        )}

        {/* LESSON CONTACTS TAB */}
        {activeTab === 'contacts' && (
          <div>
            <div className="card" style={{ marginBottom: 16 }}>
              <h3 style={{ fontSize: 18, marginBottom: 14 }}>➕ ADD CONTACT</h3>
              <div className="input-group">
                <label>Platform</label>
                <select className="input-field" value={newContact.platform} onChange={e => setNewContact(p => ({ ...p, platform: e.target.value }))}>
                  {['whatsapp','telegram','instagram','twitter','email','phone','youtube','tiktok','other'].map(p => (
                    <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>
                  ))}
                </select>
              </div>
              <div className="input-group">
                <label>Handle / Username / Number</label>
                <input className="input-field" placeholder="e.g. +2348012345678 or @mainedit" value={newContact.handle} onChange={e => setNewContact(p => ({ ...p, handle: e.target.value }))} />
              </div>
              <div className="input-group">
                <label>Link (optional)</label>
                <input className="input-field" placeholder="https://wa.me/..." value={newContact.link} onChange={e => setNewContact(p => ({ ...p, link: e.target.value }))} />
              </div>
              {contactMsg && <div className={`alert ${contactMsg.startsWith('✅') ? 'alert-success' : 'alert-error'}`}>{contactMsg}</div>}
              <button className="btn btn-primary" onClick={addContact}>➕ Add Contact</button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {contacts.map(c => (
                <div key={c.id} className="card" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, textTransform: 'capitalize' }}>{c.platform}</div>
                    <div style={{ fontSize: 13, color: 'var(--text2)' }}>{c.handle}</div>
                  </div>
                  <button className="btn btn-danger btn-sm" onClick={() => deleteContact(c.id)}>🗑️</button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TRANSACTIONS TAB */}
        {activeTab === 'transactions' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {transactions.map(tx => (
              <div key={tx.id} className="card">
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                  <div style={{ fontSize: 22 }}>{tx.type === 'deposit' ? '⬇️' : '⬆️'}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, fontSize: 13, textTransform: 'capitalize' }}>{tx.type} — {tx.method}</div>
                    <div style={{ fontSize: 11, color: 'var(--text2)' }}>{new Date(tx.created_at).toLocaleString()}</div>
                  </div>
                  <div style={{ fontWeight: 700, color: tx.type === 'deposit' ? 'var(--success)' : 'var(--accent)', fontSize: 15 }}>
                    ${parseFloat(tx.amount).toFixed(2)}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 6 }}>
                  <span className={`badge ${tx.status === 'completed' ? 'badge-green' : tx.status === 'pending' ? 'badge-orange' : 'badge-red'}`}>{tx.status}</span>
                  {tx.status === 'pending' && <>
                    <button className="btn btn-success btn-sm" style={{ padding: '4px 10px', fontSize: 11 }} onClick={() => updateTxStatus(tx.id, 'completed')}>✅ Approve</button>
                    <button className="btn btn-danger btn-sm" style={{ padding: '4px 10px', fontSize: 11 }} onClick={() => updateTxStatus(tx.id, 'rejected')}>❌ Reject</button>
                  </>}
                </div>
              </div>
            ))}
          </div>
        )}

        <div style={{ height: 20 }} />
      </div>
    </div>
  );
}

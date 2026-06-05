import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { signIn } = useAuth();
  const navigate = useNavigate();

  const handle = async () => {
    setError('');
    if (!email || !password) return setError('Please fill in all fields.');
    setLoading(true);
    const { error: err } = await signIn(email, password);
    setLoading(false);
    if (err) return setError('Invalid email or password.');
    navigate('/dashboard');
  };

  return (
    <div className="page-no-nav" style={{ background: 'var(--bg)' }}>
      <div style={{ width: '100%', maxWidth: 420, padding: '0 16px' }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div className="logo" style={{ fontSize: 36, display: 'block', marginBottom: 8 }}>MAIN<span style={{ WebkitTextFillColor: 'var(--text)' }}> EDIT</span></div>
          <h2 style={{ fontSize: 28 }}>WELCOME BACK</h2>
          <p style={{ color: 'var(--text2)', fontSize: 14, marginTop: 6 }}>Log in to your account</p>
        </div>

        {error && <div className="alert alert-error">{error}</div>}

        <div className="input-group">
          <label>Email Address</label>
          <input className="input-field" type="email" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} />
        </div>
        <div className="input-group">
          <label>Password</label>
          <input className="input-field" type="password" placeholder="Your password" value={password} onChange={e => setPassword(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handle()} />
        </div>

        <button className="btn btn-primary" onClick={handle} disabled={loading} style={{ marginTop: 8 }}>
          {loading ? '⏳ Logging In...' : '🔐 Log In'}
        </button>

        <p style={{ textAlign: 'center', marginTop: 20, color: 'var(--text2)', fontSize: 14 }}>
          Don't have an account?{' '}
          <Link to="/signup" style={{ color: 'var(--accent)', fontWeight: 600 }}>Sign Up</Link>
        </p>
      </div>
    </div>
  );
}

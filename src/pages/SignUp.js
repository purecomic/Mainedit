import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function SignUp() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [refCode, setRefCode] = useState('');
  const [success, setSuccess] = useState('');
  const { signUp } = useAuth();
  const navigate = useNavigate();

  const handle = async () => {
    setError('');
    if (!fullName || !email || !password) return setError('All fields are required.');
    if (password !== confirm) return setError('Passwords do not match.');
    if (password.length < 6) return setError('Password must be at least 6 characters.');
    setLoading(true);
    if (refCode) localStorage.setItem('referral_code', refCode);
    const { error: err } = await signUp(email, password, fullName);
    setLoading(false);
    if (err) return setError(err.message);
    setSuccess('Account created! Check your email to confirm, then log in.');
  };

  return (
    <div className="page-no-nav" style={{ background: 'var(--bg)' }}>
      <div style={{ width: '100%', maxWidth: 420, padding: '0 16px' }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div className="logo" style={{ fontSize: 36, display: 'block', marginBottom: 8 }}>MAIN<span style={{ WebkitTextFillColor: 'var(--text)' }}> EDIT</span></div>
          <h2 style={{ fontSize: 28 }}>CREATE ACCOUNT</h2>
          <p style={{ color: 'var(--text2)', fontSize: 14, marginTop: 6 }}>Join thousands of video editors</p>
        </div>

        {error && <div className="alert alert-error">{error}</div>}
        {success && <div className="alert alert-success">{success}</div>}

        {!success && <>
          <div className="input-group">
            <label>Full Name</label>
            <input className="input-field" placeholder="John Doe" value={fullName} onChange={e => setFullName(e.target.value)} />
          </div>
          <div className="input-group">
            <label>Email Address</label>
            <input className="input-field" type="email" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} />
          </div>
          <div className="input-group">
            <label>Password</label>
            <input className="input-field" type="password" placeholder="Min. 6 characters" value={password} onChange={e => setPassword(e.target.value)} />
          </div>
          <div className="input-group">
            <label>Confirm Password</label>
            <input className="input-field" type="password" placeholder="Repeat password" value={confirm} onChange={e => setConfirm(e.target.value)} />
          </div>

          <button className="btn btn-primary" onClick={handle} disabled={loading} style={{ marginTop: 8 }}>
            {loading ? '⏳ Creating Account...' : '🚀 Create Account'}
          </button>
        </>}

        {success && (
          <button className="btn btn-primary" onClick={() => navigate('/login')}>Go to Login →</button>
        )}

        <p style={{ textAlign: 'center', marginTop: 20, color: 'var(--text2)', fontSize: 14 }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color: 'var(--accent)', fontWeight: 600 }}>Log In</Link>
        </p>
      </div>
    </div>
  );
}

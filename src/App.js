import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { TopNav, BottomNav } from './components/Nav';
import './index.css';

import Home from './pages/Home';
import SignUp from './pages/SignUp';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Effects from './pages/Effects';
import Wallet from './pages/Wallet';
import Lessons from './pages/Lessons';
import Admin from './pages/Admin';

const NO_NAV_ROUTES = ['/login', '/signup'];

function AppInner() {
  const { loading } = useAuth();
  const path = window.location.pathname;
  const showNav = !NO_NAV_ROUTES.includes(path);

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)' }}>
        <div>
          <div style={{ fontFamily: "'Bebas Neue', cursive", fontSize: 36, textAlign: 'center', background: 'linear-gradient(135deg, #ff3c6e, #ff7c45)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', marginBottom: 16 }}>
            MAIN EDIT
          </div>
          <div className="spinner" style={{ margin: '0 auto' }} />
        </div>
      </div>
    );
  }

  return (
    <>
      {showNav && <TopNav />}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/effects" element={<Effects />} />
        <Route path="/wallet" element={<Wallet />} />
        <Route path="/lessons" element={<Lessons />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
      {showNav && <BottomNav />}
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppInner />
      </AuthProvider>
    </BrowserRouter>
  );
}

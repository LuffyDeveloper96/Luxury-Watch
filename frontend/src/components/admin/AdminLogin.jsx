import React, { useState } from 'react';
import { useAdminAuth } from '../../context/AdminAuthContext';
import { Lock, Shield, KeyRound, AlertTriangle, ArrowLeft, Sparkles } from 'lucide-react';

export const AdminLogin = ({ onReturnToStore }) => {
  const { loginAdmin, isLockedOut, lockoutTimer } = useAdminAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [secretPin, setSecretPin] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setIsLoading(true);

    try {
      const res = await loginAdmin(email, password, secretPin);
      setIsLoading(false);
      if (!res.success) {
        setErrorMessage(res.message);
      }
    } catch (err) {
      setIsLoading(false);
      setErrorMessage(err.message || 'Authentication error.');
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#07080b',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem 1rem',
      position: 'relative'
    }}>
      {/* Background ambient lighting */}
      <div style={{
        position: 'absolute',
        width: '500px',
        height: '500px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(212, 175, 55, 0.06) 0%, transparent 70%)',
        pointerEvents: 'none'
      }} />

      {/* Return to storefront button */}
      <button
        onClick={onReturnToStore}
        style={{
          position: 'absolute',
          top: '2rem',
          left: '2rem',
          background: 'transparent',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          color: '#cbd5e1',
          padding: '0.5rem 1rem',
          borderRadius: '4px',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          fontSize: '0.8rem'
        }}
      >
        <ArrowLeft size={16} />
        <span>Return to Boutique</span>
      </button>

      {/* Login Card */}
      <div
        className="glass-panel animate-fade-in"
        style={{
          width: '100%',
          maxWidth: '460px',
          backgroundColor: '#0e1118',
          border: '1px solid rgba(212, 175, 55, 0.4)',
          borderRadius: '8px',
          padding: '2.5rem',
          boxShadow: '0 25px 60px rgba(0,0,0,0.9)',
          position: 'relative',
          zIndex: 2
        }}
      >
        {/* Emblem */}
        <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
          <div style={{
            width: '56px',
            height: '56px',
            borderRadius: '50%',
            backgroundColor: 'rgba(212, 175, 55, 0.15)',
            border: '1px solid #d4af37',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1rem auto',
            color: '#d4af37'
          }}>
            <Lock size={26} />
          </div>

          <span className="badge-luxury badge-gold" style={{ marginBottom: '0.4rem' }}>
            MASTER RESTRICTED ACCESS
          </span>

          <h2 style={{ fontSize: '1.4rem', color: '#ffffff', letterSpacing: '0.05em' }}>
            Master Admin Terminal
          </h2>
          <p style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.2rem' }}>
            Authorized Single Master Gmail Access Only
          </p>
        </div>

        {/* Master Gmail Security Info Box */}
        <div style={{
          backgroundColor: 'rgba(212, 175, 55, 0.08)',
          border: '1px solid rgba(212, 175, 55, 0.25)',
          padding: '0.75rem',
          borderRadius: '4px',
          fontSize: '0.72rem',
          color: '#f3e5ab',
          marginBottom: '1.5rem'
        }}>
          <div style={{ fontWeight: 600, marginBottom: '0.2rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <Sparkles size={12} style={{ color: '#d4af37' }} />
            <span>Sole Master Admin Security:</span>
          </div>
          <div>Access is strictly locked to your designated single Master Gmail. Any other account is automatically blocked.</div>
        </div>

        {errorMessage && (
          <div style={{
            backgroundColor: 'rgba(225, 29, 72, 0.15)',
            border: '1px solid rgba(225, 29, 72, 0.4)',
            color: '#fb7185',
            padding: '0.65rem',
            borderRadius: '4px',
            fontSize: '0.75rem',
            marginBottom: '1.25rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            <AlertTriangle size={15} />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '1.2rem' }}>
            <label style={{ display: 'block', fontSize: '0.75rem', color: '#cbd5e1', marginBottom: '0.35rem' }}>
              Authorized Master Gmail *
            </label>
            <input
              type="email"
              required
              placeholder="e.g. admin@luxurywatch.com or your Gmail"
              disabled={isLockedOut}
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="lux-input"
            />
          </div>

          <div style={{ marginBottom: '1.2rem' }}>
            <label style={{ display: 'block', fontSize: '0.75rem', color: '#cbd5e1', marginBottom: '0.35rem' }}>
              Master Key Password *
            </label>
            <input
              type="password"
              required
              placeholder="Enter Master Password"
              disabled={isLockedOut}
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="lux-input"
            />
          </div>

          <div style={{ marginBottom: '1.75rem' }}>
            <label style={{ display: 'block', fontSize: '0.75rem', color: '#cbd5e1', marginBottom: '0.35rem' }}>
              4-Digit Master Security PIN (Optional)
            </label>
            <input
              type="password"
              maxLength={6}
              placeholder="8888"
              disabled={isLockedOut}
              value={secretPin}
              onChange={e => setSecretPin(e.target.value)}
              className="lux-input"
              style={{ letterSpacing: '0.3em', textAlign: 'center', fontWeight: 700 }}
            />
          </div>

          <button
            type="submit"
            disabled={isLoading || isLockedOut}
            className="btn-gold"
            style={{ width: '100%', padding: '0.85rem' }}
          >
            {isLoading ? (
              <span>VERIFYING MASTER ACCESS...</span>
            ) : isLockedOut ? (
              <span>LOCKED ({lockoutTimer}s)</span>
            ) : (
              <>
                <KeyRound size={15} />
                <span>ACCESS COMMAND CENTER</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminLogin;

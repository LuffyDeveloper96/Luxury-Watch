import React, { useState } from 'react';
import { useAdminAuth } from '../../context/AdminAuthContext';
import { ShieldCheck, Lock, Mail, KeyRound, ArrowRight, X, AlertCircle, Sparkles } from 'lucide-react';

export const AdminLogin = ({ onClose, onSuccess }) => {
  const { loginAdmin, isLoading } = useAdminAuth();
  const [email, setEmail] = useState('admin@luxurywatch.com');
  const [password, setPassword] = useState('LuxuryWatch2026!');
  const [passcodePin, setPasscodePin] = useState('8888');
  const [errorMsg, setErrorMsg] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!email.trim() || !password.trim()) {
      setErrorMsg('Please provide your Master Administrator credentials.');
      return;
    }

    try {
      const res = await loginAdmin({
        email: email.trim(),
        password: password.trim(),
        passcodePin: passcodePin.trim()
      });

      if (res.success) {
        if (onSuccess) {
          onSuccess();
        } else if (onClose) {
          onClose();
        }
      } else {
        setErrorMsg(res.message || 'Access Denied: Invalid credentials or unauthorized account.');
      }
    } catch (err) {
      setErrorMsg(err.message || 'Authentication failed. Please verify security parameters.');
    }
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 1300,
      backgroundColor: 'rgba(11, 15, 25, 0.92)',
      backdropFilter: 'blur(16px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '1rem'
    }}>
      <div style={{
        background: '#111827',
        border: '1px solid #d4af37',
        width: '100%',
        maxWidth: '440px',
        borderRadius: '12px',
        boxShadow: '0 25px 60px rgba(0, 0, 0, 0.5), 0 0 40px rgba(212, 175, 55, 0.15)',
        overflow: 'hidden',
        position: 'relative'
      }}>
        {/* Close Button */}
        {onClose && (
          <button
            onClick={onClose}
            style={{
              position: 'absolute',
              top: '1rem',
              right: '1rem',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: '#94a3b8',
              padding: '6px'
            }}
          >
            <X size={18} />
          </button>
        )}

        {/* Header */}
        <div style={{
          padding: '2rem 1.5rem 1.25rem 1.5rem',
          textAlign: 'center',
          background: 'radial-gradient(circle at 50% 0%, rgba(212, 175, 55, 0.15) 0%, transparent 80%)',
          borderBottom: '1px solid #1f2937'
        }}>
          <div style={{
            width: '52px',
            height: '52px',
            borderRadius: '50%',
            background: 'rgba(212, 175, 55, 0.12)',
            border: '1px solid #d4af37',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 0.75rem auto'
          }}>
            <ShieldCheck size={26} color="#f3e5ab" />
          </div>

          <span style={{ fontSize: '0.65rem', letterSpacing: '0.16em', color: '#d4af37', fontWeight: 700, textTransform: 'uppercase' }}>
            HAUTE HORLOGERIE MASTER VAULT
          </span>
          <h2 style={{ fontFamily: 'var(--font-brand)', fontSize: '1.25rem', color: '#ffffff', margin: '4px 0 0 0', letterSpacing: '0.04em' }}>
            ADMINISTRATOR ACCESS
          </h2>
          <p style={{ fontSize: '0.75rem', color: '#94a3b8', margin: '6px 0 0 0' }}>
            Restricted to the single designated Master Account.
          </p>
        </div>

        {/* Form Content */}
        <div style={{ padding: '1.5rem' }}>
          {errorMsg && (
            <div style={{
              background: 'rgba(239, 68, 68, 0.12)',
              border: '1px solid #ef4444',
              color: '#fca5a5',
              padding: '10px 14px',
              borderRadius: '6px',
              fontSize: '0.78rem',
              marginBottom: '1.25rem',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <AlertCircle size={15} style={{ flexShrink: 0 }} />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleLogin}>
            <div style={{ marginBottom: '1rem' }}>
              <label className="lux-label" style={{ color: '#cbd5e1' }}>Designated Admin Email</label>
              <div style={{ position: 'relative' }}>
                <Mail size={15} color="#94a3b8" style={{ position: 'absolute', left: '12px', top: '12px' }} />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@luxurywatch.com"
                  className="lux-input"
                  style={{ background: '#0b0f19', color: '#ffffff', borderColor: '#374151', paddingLeft: '34px' }}
                />
              </div>
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <label className="lux-label" style={{ color: '#cbd5e1' }}>Master Vault Password</label>
              <div style={{ position: 'relative' }}>
                <Lock size={15} color="#94a3b8" style={{ position: 'absolute', left: '12px', top: '12px' }} />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="lux-input"
                  style={{ background: '#0b0f19', color: '#ffffff', borderColor: '#374151', paddingLeft: '34px' }}
                />
              </div>
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <label className="lux-label" style={{ color: '#cbd5e1' }}>Security PIN</label>
              <div style={{ position: 'relative' }}>
                <KeyRound size={15} color="#94a3b8" style={{ position: 'absolute', left: '12px', top: '12px' }} />
                <input
                  type="password"
                  maxLength={6}
                  value={passcodePin}
                  onChange={(e) => setPasscodePin(e.target.value)}
                  placeholder="8888"
                  className="lux-input"
                  style={{ background: '#0b0f19', color: '#ffffff', borderColor: '#374151', paddingLeft: '34px' }}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="btn-gold"
              style={{ width: '100%', padding: '12px', fontSize: '0.85rem' }}
            >
              <span>{isLoading ? 'AUTHENTICATING MASTER VAULT...' : 'AUTHENTICATE SESSION'}</span>
              <ArrowRight size={15} />
            </button>
          </form>

          <div style={{
            marginTop: '1.25rem',
            padding: '10px',
            background: 'rgba(212, 175, 55, 0.06)',
            border: '1px dashed rgba(212, 175, 55, 0.3)',
            borderRadius: '6px',
            fontSize: '0.7rem',
            color: '#d4af37',
            textAlign: 'center'
          }}>
            <span>🔒 Sealed Master Account: <strong>admin@luxurywatch.com</strong></span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;

import React, { useState, useEffect } from 'react';
import { useUserAuth } from '../context/UserAuthContext';
import {
  X, Mail, ShieldCheck, ArrowRight,
  User, Phone, Lock, Eye, EyeOff
} from 'lucide-react';

export const UserAuthModal = () => {
  const {
    isAuthModalOpen,
    closeAuthModal,
    authModalTab,
    setAuthModalTab,
    initiateSignup,
    initiateLogin,
    loading
  } = useUserAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Reset state on open/tab change
  useEffect(() => {
    if (isAuthModalOpen) {
      setErrorMsg('');
      setSuccessMsg('');
    }
  }, [isAuthModalOpen, authModalTab]);

  if (!isAuthModalOpen) return null;

  // Handle Sign In or Create Account Submission
  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!email.trim() || !email.includes('@')) {
      setErrorMsg('Please enter a valid email address.');
      return;
    }

    if (!password || password.length < 6) {
      setErrorMsg('Password must be at least 6 characters in length.');
      return;
    }

    if (authModalTab === 'signup') {
      if (!name.trim()) {
        setErrorMsg('Please enter your full name.');
        return;
      }
      if (password !== confirmPassword) {
        setErrorMsg('Passwords do not match.');
        return;
      }

      try {
        const res = await initiateSignup({
          name: name.trim(),
          email: email.trim(),
          password,
          phone: phone.trim()
        });

        if (!res.success) {
          setErrorMsg(res.message || 'Unable to register.');
        }
      } catch (err) {
        setErrorMsg(err.message || 'Failed to register.');
      }
    } else {
      // Direct Sign In Flow (Email + Password)
      try {
        const res = await initiateLogin({
          email: email.trim(),
          password
        });

        if (!res.success) {
          setErrorMsg(res.message || 'Invalid credentials.');
        }
      } catch (err) {
        setErrorMsg(err.message || 'Authentication failed. Please verify your email and password.');
      }
    }
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 1100,
      backgroundColor: 'rgba(11, 15, 25, 0.88)',
      backdropFilter: 'blur(12px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '1rem'
    }}>
      <div style={{
        background: '#ffffff',
        width: '100%',
        maxWidth: '440px',
        borderRadius: '12px',
        boxShadow: '0 25px 60px rgba(0, 0, 0, 0.35)',
        border: '1px solid rgba(180, 140, 30, 0.3)',
        overflow: 'hidden',
        position: 'relative'
      }}>
        {/* Header */}
        <div style={{
          padding: '1.25rem 1.5rem',
          textAlign: 'center',
          background: 'radial-gradient(circle at 50% 0%, rgba(212, 175, 55, 0.1) 0%, #ffffff 100%)',
          borderBottom: '1px solid rgba(0, 0, 0, 0.06)',
          position: 'relative'
        }}>
          <button
            onClick={closeAuthModal}
            style={{
              position: 'absolute',
              top: '1rem',
              right: '1rem',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: '#64748b',
              padding: '4px'
            }}
          >
            <X size={18} />
          </button>

          <div style={{
            width: '44px',
            height: '44px',
            borderRadius: '50%',
            background: 'rgba(180, 140, 30, 0.1)',
            border: '1px solid rgba(180, 140, 30, 0.3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 0.5rem auto'
          }}>
            <ShieldCheck size={22} color="#8a6709" />
          </div>

          <span style={{ fontSize: '0.62rem', letterSpacing: '0.15em', color: '#8a6709', fontWeight: 700, textTransform: 'uppercase' }}>
            HAUTE HORLOGERIE PATRON ACCESS
          </span>
          <h2 style={{ fontFamily: 'var(--font-brand)', fontSize: '1.2rem', color: '#0f172a', margin: '4px 0 0 0' }}>
            {authModalTab === 'signup' ? 'CREATE PATRON ACCOUNT' : 'PATRON SIGN IN'}
          </h2>
        </div>

        {/* Tab Selector */}
        <div style={{ display: 'flex', borderBottom: '1px solid rgba(0, 0, 0, 0.08)', backgroundColor: '#faf9f5' }}>
          <button
            type="button"
            onClick={() => setAuthModalTab('signin')}
            style={{
              flex: 1,
              padding: '12px',
              border: 'none',
              background: authModalTab === 'signin' ? '#ffffff' : 'transparent',
              borderBottom: authModalTab === 'signin' ? '2px solid #8a6709' : '2px solid transparent',
              color: authModalTab === 'signin' ? '#8a6709' : '#64748b',
              fontWeight: 700,
              fontSize: '0.78rem',
              cursor: 'pointer'
            }}
          >
            SIGN IN
          </button>
          <button
            type="button"
            onClick={() => setAuthModalTab('signup')}
            style={{
              flex: 1,
              padding: '12px',
              border: 'none',
              background: authModalTab === 'signup' ? '#ffffff' : 'transparent',
              borderBottom: authModalTab === 'signup' ? '2px solid #8a6709' : '2px solid transparent',
              color: authModalTab === 'signup' ? '#8a6709' : '#64748b',
              fontWeight: 700,
              fontSize: '0.78rem',
              cursor: 'pointer'
            }}
          >
            CREATE ACCOUNT
          </button>
        </div>

        {/* Modal Body */}
        <div style={{ padding: '1.5rem' }}>
          {errorMsg && (
            <div style={{
              background: '#fef2f2',
              border: '1px solid #f87171',
              color: '#991b1b',
              padding: '8px 12px',
              borderRadius: '6px',
              fontSize: '0.78rem',
              marginBottom: '1rem'
            }}>
              {errorMsg}
            </div>
          )}

          {successMsg && (
            <div style={{
              background: '#f0fdf4',
              border: '1px solid #86efac',
              color: '#166534',
              padding: '8px 12px',
              borderRadius: '6px',
              fontSize: '0.78rem',
              marginBottom: '1rem'
            }}>
              {successMsg}
            </div>
          )}

          {/* Form (Email + Password) */}
          <form onSubmit={handleFormSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {authModalTab === 'signup' && (
              <>
                <div>
                  <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 700, color: '#334155', textTransform: 'uppercase', marginBottom: '4px' }}>
                    Full Name
                  </label>
                  <div style={{ position: 'relative' }}>
                    <User size={16} color="#94a3b8" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                    <input
                      type="text"
                      required
                      placeholder="Enter your full name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '10px 12px 10px 38px',
                        border: '1px solid #cbd5e1',
                        borderRadius: '6px',
                        fontSize: '0.85rem',
                        outline: 'none',
                        boxSizing: 'border-box'
                      }}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 700, color: '#334155', textTransform: 'uppercase', marginBottom: '4px' }}>
                    Phone Number (Optional)
                  </label>
                  <div style={{ position: 'relative' }}>
                    <Phone size={16} color="#94a3b8" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                    <input
                      type="tel"
                      placeholder="Enter phone number"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '10px 12px 10px 38px',
                        border: '1px solid #cbd5e1',
                        borderRadius: '6px',
                        fontSize: '0.85rem',
                        outline: 'none',
                        boxSizing: 'border-box'
                      }}
                    />
                  </div>
                </div>
              </>
            )}

            <div>
              <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 700, color: '#334155', textTransform: 'uppercase', marginBottom: '4px' }}>
                Email Address
              </label>
              <div style={{ position: 'relative' }}>
                <Mail size={16} color="#94a3b8" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                <input
                  type="email"
                  required
                  placeholder="Enter your email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 12px 10px 38px',
                    border: '1px solid #cbd5e1',
                    borderRadius: '6px',
                    fontSize: '0.85rem',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 700, color: '#334155', textTransform: 'uppercase', marginBottom: '4px' }}>
                Password (min 6 characters)
              </label>
              <div style={{ position: 'relative' }}>
                <Lock size={16} color="#94a3b8" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 38px 10px 38px',
                    border: '1px solid #cbd5e1',
                    borderRadius: '6px',
                    fontSize: '0.85rem',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute',
                    right: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: '#94a3b8'
                  }}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {authModalTab === 'signup' && (
              <div>
                <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 700, color: '#334155', textTransform: 'uppercase', marginBottom: '4px' }}>
                  Confirm Password
                </label>
                <div style={{ position: 'relative' }}>
                  <Lock size={16} color="#94a3b8" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="Confirm your password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px 12px 10px 38px',
                      border: '1px solid #cbd5e1',
                      borderRadius: '6px',
                      fontSize: '0.85rem',
                      outline: 'none',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                width: '100%',
                padding: '12px',
                background: 'linear-gradient(135deg, #b48c1e 0%, #8a6709 100%)',
                color: '#ffffff',
                border: 'none',
                borderRadius: '6px',
                fontWeight: 700,
                fontSize: '0.82rem',
                letterSpacing: '0.05em',
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.7 : 1,
                marginTop: '0.5rem',
                transition: 'all 0.2s ease'
              }}
            >
              {loading ? 'AUTHENTICATING...' : authModalTab === 'signup' ? 'COMPLETE REGISTRATION' : 'SIGN IN TO VAULT'}
              {!loading && <ArrowRight size={16} />}
            </button>
          </form>

          {/* Switch tab footer */}
          <div style={{ marginTop: '1.25rem', textAlign: 'center', fontSize: '0.78rem', color: '#64748b' }}>
            {authModalTab === 'signup' ? (
              <span>
                Already a patron?{' '}
                <button
                  type="button"
                  onClick={() => setAuthModalTab('signin')}
                  style={{ background: 'none', border: 'none', color: '#8a6709', fontWeight: 700, cursor: 'pointer', padding: 0 }}
                >
                  Sign In
                </button>
              </span>
            ) : (
              <span>
                New to Luxury Watch?{' '}
                <button
                  type="button"
                  onClick={() => setAuthModalTab('signup')}
                  style={{ background: 'none', border: 'none', color: '#8a6709', fontWeight: 700, cursor: 'pointer', padding: 0 }}
                >
                  Create Patron Account
                </button>
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserAuthModal;

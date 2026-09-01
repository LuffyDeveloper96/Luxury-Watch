import React, { useState, useEffect } from 'react';
import { useUserAuth } from '../context/UserAuthContext';
import {
  X, Mail, ShieldCheck, ArrowRight, RefreshCw, KeyRound,
  Sparkles, User, Phone, Lock, Eye, EyeOff, CheckCircle2
} from 'lucide-react';

export const UserAuthModal = () => {
  const {
    isAuthModalOpen,
    closeAuthModal,
    authModalTab,
    setAuthModalTab,
    initiateSignup,
    verifySignup,
    initiateLogin,
    verifyLogin,
    forgotPassword,
    resetPassword,
    loading
  } = useUserAuth();

  const [step, setStep] = useState('form'); // 'form' | 'otp'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [simulatedOtp, setSimulatedOtp] = useState('');
  const [resendCooldown, setResendCooldown] = useState(0);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    let timer;
    if (resendCooldown > 0) {
      timer = setInterval(() => setResendCooldown(prev => prev - 1), 1000);
    }
    return () => clearInterval(timer);
  }, [resendCooldown]);

  // Reset state on open/tab change
  useEffect(() => {
    if (isAuthModalOpen) {
      setStep('form');
      setOtp(['', '', '', '', '', '']);
      setErrorMsg('');
      setSuccessMsg('');
    }
  }, [isAuthModalOpen, authModalTab]);

  if (!isAuthModalOpen) return null;

  // Step 1: Submit Form (Email + Password validation -> Send OTP)
  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!email.trim() || !email.includes('@')) {
      setErrorMsg('Please enter a valid email address.');
      return;
    }

    if (authModalTab === 'forgot') {
      try {
        const res = await forgotPassword(email.trim());
        if (res.success) {
          setStep('otp');
          setResendCooldown(60);
          setSuccessMsg(`A 6-digit password reset code was dispatched to ${email}.`);
          if (res.simulatedOtp) setSimulatedOtp(res.simulatedOtp);
        } else {
          setErrorMsg(res.message || 'Unable to process password reset.');
        }
      } catch (err) {
        setErrorMsg(err.message || 'Failed to dispatch reset code.');
      }
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
      // Sign In Flow (Email + Password only)
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

  // Step 2: Handle OTP Verification
  const handleOtpChange = (index, value) => {
    if (value.length > 1) {
      const pasted = value.replace(/\D/g, '').slice(0, 6);
      if (pasted.length > 0) {
        const newOtp = [...otp];
        for (let i = 0; i < 6; i++) {
          newOtp[i] = pasted[i] || '';
        }
        setOtp(newOtp);
        const nextInput = document.getElementById(`otp-digit-${Math.min(5, pasted.length)}`);
        if (nextInput) nextInput.focus();
      }
      return;
    }

    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);

    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-digit-${index + 1}`);
      if (nextInput) nextInput.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`otp-digit-${index - 1}`);
      if (prevInput) prevInput.focus();
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    const fullOtp = otp.join('');
    if (fullOtp.length !== 6) {
      setErrorMsg('Please enter all 6 digits of the verification code.');
      return;
    }

    setErrorMsg('');
    try {
      if (authModalTab === 'signup') {
        const res = await verifySignup({ email: email.trim(), otp: fullOtp });
        if (!res?.success) setErrorMsg(res?.message || 'Registration verification failed.');
      } else if (authModalTab === 'forgot') {
        const res = await resetPassword({ email: email.trim(), otp: fullOtp, newPassword: password });
        if (!res?.success) setErrorMsg(res?.message || 'Password reset failed.');
      } else {
        const res = await verifyLogin({ email: email.trim(), otp: fullOtp });
        if (!res?.success) setErrorMsg(res?.message || '2FA Verification failed.');
      }
    } catch (err) {
      setErrorMsg(err.message || 'Invalid or expired verification code.');
    }
  };

  const handleAutoFillPreview = () => {
    if (simulatedOtp && simulatedOtp.length === 6) {
      setOtp(simulatedOtp.split(''));
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
            HAUTE HORLOGERIE 2-FACTOR AUTHENTICATION
          </span>
          <h2 style={{ fontFamily: 'var(--font-brand)', fontSize: '1.2rem', color: '#0f172a', margin: '4px 0 0 0' }}>
            {step === 'form'
              ? (authModalTab === 'signup' ? 'CREATE PATRON ACCOUNT' : authModalTab === 'forgot' ? 'RESET PASSWORD' : 'PATRON SIGN IN')
              : 'ENTER 6-DIGIT EMAIL OTP'}
          </h2>
        </div>

        {/* Tab Selector if in form step */}
        {step === 'form' && authModalTab !== 'forgot' && (
          <div style={{ display: 'flex', borderBottom: '1px solid rgba(0, 0, 0, 0.08)', backgroundColor: '#faf9f5' }}>
            <button
              onClick={() => setAuthModalTab('signin')}
              style={{
                flex: 1,
                padding: '10px',
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
              onClick={() => setAuthModalTab('signup')}
              style={{
                flex: 1,
                padding: '10px',
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
        )}

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

          {/* STEP 1: Form (Email + Password) */}
          {step === 'form' ? (
            <form onSubmit={handleFormSubmit}>
              {/* Sign Up Name Field */}
              {authModalTab === 'signup' && (
                <div style={{ marginBottom: '0.85rem' }}>
                  <label className="lux-label">Full Name *</label>
                  <div style={{ position: 'relative' }}>
                    <User size={15} color="#94a3b8" style={{ position: 'absolute', left: '12px', top: '12px' }} />
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Lord Sterling"
                      className="lux-input"
                      style={{ paddingLeft: '34px' }}
                    />
                  </div>
                </div>
              )}

              {/* Email Address */}
              <div style={{ marginBottom: '0.85rem' }}>
                <label className="lux-label">Email Address *</label>
                <div style={{ position: 'relative' }}>
                  <Mail size={15} color="#94a3b8" style={{ position: 'absolute', left: '12px', top: '12px' }} />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="patron@luxurywatch.com"
                    className="lux-input"
                    style={{ paddingLeft: '34px' }}
                  />
                </div>
              </div>

              {/* Password Field */}
              {authModalTab !== 'forgot' && (
                <div style={{ marginBottom: '0.85rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <label className="lux-label">Password *</label>
                    {authModalTab === 'signin' && (
                      <button
                        type="button"
                        onClick={() => setAuthModalTab('forgot')}
                        style={{ background: 'none', border: 'none', color: '#8a6709', fontSize: '0.68rem', cursor: 'pointer', fontWeight: 600, padding: 0 }}
                      >
                        Forgot Password?
                      </button>
                    )}
                  </div>
                  <div style={{ position: 'relative' }}>
                    <Lock size={15} color="#94a3b8" style={{ position: 'absolute', left: '12px', top: '12px' }} />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••••••"
                      className="lux-input"
                      style={{ paddingLeft: '34px', paddingRight: '34px' }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      style={{ position: 'absolute', right: '10px', top: '10px', background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}
                    >
                      {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                </div>
              )}

              {/* Confirm Password on Sign Up */}
              {authModalTab === 'signup' && (
                <div style={{ marginBottom: '0.85rem' }}>
                  <label className="lux-label">Confirm Password *</label>
                  <div style={{ position: 'relative' }}>
                    <Lock size={15} color="#94a3b8" style={{ position: 'absolute', left: '12px', top: '12px' }} />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••••••"
                      className="lux-input"
                      style={{ paddingLeft: '34px' }}
                    />
                  </div>
                </div>
              )}

              {/* Phone Field on Sign Up */}
              {authModalTab === 'signup' && (
                <div style={{ marginBottom: '1.25rem' }}>
                  <label className="lux-label">Phone Number (Optional)</label>
                  <div style={{ position: 'relative' }}>
                    <Phone size={15} color="#94a3b8" style={{ position: 'absolute', left: '12px', top: '12px' }} />
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+91 98200 98200"
                      className="lux-input"
                      style={{ paddingLeft: '34px' }}
                    />
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="btn-gold"
                style={{ width: '100%', padding: '11px', fontSize: '0.85rem', marginTop: '0.5rem' }}
              >
                <span>
                  {loading
                    ? 'VERIFYING...'
                    : authModalTab === 'signup'
                    ? 'CONTINUE TO EMAIL OTP'
                    : authModalTab === 'forgot'
                    ? 'SEND RESET OTP'
                    : 'SIGN IN & VERIFY OTP'}
                </span>
                <ArrowRight size={15} />
              </button>

              {authModalTab === 'forgot' && (
                <div style={{ textAlign: 'center', marginTop: '1rem' }}>
                  <button
                    type="button"
                    onClick={() => setAuthModalTab('signin')}
                    style={{ background: 'none', border: 'none', color: '#64748b', fontSize: '0.75rem', cursor: 'pointer' }}
                  >
                    Back to Sign In
                  </button>
                </div>
              )}
            </form>
          ) : (
            /* STEP 2: Enter 6-Digit OTP */
            <form onSubmit={handleVerifyOtp}>
              <p style={{ fontSize: '0.78rem', color: '#475569', textAlign: 'center', margin: '0 0 1.25rem 0' }}>
                Enter the 6-digit verification code sent to <strong>{email}</strong>
              </p>

              {/* 6-Digit PIN Boxes */}
              <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', marginBottom: '1.25rem' }}>
                {otp.map((digit, idx) => (
                  <input
                    key={idx}
                    id={`otp-digit-${idx}`}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(idx, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(idx, e)}
                    style={{
                      width: '44px',
                      height: '50px',
                      textAlign: 'center',
                      fontSize: '1.25rem',
                      fontWeight: 700,
                      color: '#0f172a',
                      borderRadius: '6px',
                      border: digit ? '2px solid #8a6709' : '1px solid rgba(0, 0, 0, 0.15)',
                      background: '#ffffff',
                      boxShadow: digit ? '0 0 8px rgba(180, 140, 30, 0.2)' : 'none',
                      outline: 'none'
                    }}
                  />
                ))}
              </div>

              {/* Instant Preview Code Helper */}
              {simulatedOtp && (
                <div
                  style={{
                    padding: '8px 12px',
                    background: 'rgba(212, 175, 55, 0.08)',
                    border: '1px dashed #d4af37',
                    borderRadius: '6px',
                    fontSize: '0.72rem',
                    color: '#8a6709',
                    textAlign: 'center',
                    marginBottom: '1rem',
                    cursor: 'pointer'
                  }}
                  onClick={handleAutoFillPreview}
                >
                  <span>⚡ Instant Preview Code: <strong>{simulatedOtp}</strong> (Click to auto-fill)</span>
                </div>
              )}

              {/* New Password field if in Forgot Password Mode */}
              {authModalTab === 'forgot' && (
                <div style={{ marginBottom: '1rem' }}>
                  <label className="lux-label">Set New Password</label>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Min. 6 characters"
                    className="lux-input"
                  />
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="btn-gold"
                style={{ width: '100%', padding: '11px', fontSize: '0.85rem' }}
              >
                <span>{loading ? 'AUTHENTICATING...' : 'VERIFY & ACCESS VAULT'}</span>
              </button>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '1.25rem', fontSize: '0.75rem' }}>
                <button
                  type="button"
                  onClick={() => setStep('form')}
                  style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer' }}
                >
                  Change Email / Password
                </button>

                <button
                  type="button"
                  disabled={resendCooldown > 0}
                  onClick={handleFormSubmit}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: resendCooldown > 0 ? '#94a3b8' : '#8a6709',
                    fontWeight: 600,
                    cursor: resendCooldown > 0 ? 'default' : 'pointer'
                  }}
                >
                  {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend Code'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserAuthModal;

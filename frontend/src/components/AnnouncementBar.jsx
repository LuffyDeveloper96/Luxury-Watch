import React, { useState, useEffect } from 'react';
import { useStore } from '../context/StoreContext';
import { CURRENCIES } from '../utils/currency';
import { ShieldCheck, Sparkles, Truck, Lock, Package, ChevronRight, Globe } from 'lucide-react';

export const AnnouncementBar = ({ onOpenAdmin, onOpenOrderTracking }) => {
  const { currency, setCurrency } = useStore();
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);

  const messages = [
    { text: "COMPLIMENTARY BESPOKE ENGRAVING & INSURED WORLDWIDE EXPRESS SHIPPING", icon: Sparkles },
    { text: "USE CODE 'LUXE10' FOR 10% OFF ON HIGH HOROLOGY MASTERPIECES", icon: ShieldCheck },
    { text: "OFFICIAL 5-YEAR INTERNATIONAL SWISS WARRANTY WITH CONCIERGE CARE", icon: Truck }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentMessageIndex(prev => (prev + 1) % messages.length);
    }, 4500);
    return () => clearInterval(timer);
  }, [messages.length]);

  const CurrentIcon = messages[currentMessageIndex].icon;

  return (
    <div style={{
      backgroundColor: '#07080b',
      borderBottom: '1px solid rgba(212, 175, 55, 0.2)',
      padding: '0.45rem 1rem',
      fontSize: '0.75rem',
      color: '#cbd5e1'
    }}>
      <div className="luxury-container announcement-bar-container" style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '0.75rem'
      }}>
        {/* Left: Quick utilities */}
        <div className="announcement-side-left" style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
          <button
            onClick={onOpenOrderTracking}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#94a3b8',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem',
              fontSize: '0.72rem',
              transition: 'color 0.2s ease'
            }}
            onMouseEnter={e => e.currentTarget.style.color = '#d4af37'}
            onMouseLeave={e => e.currentTarget.style.color = '#94a3b8'}
          >
            <Package size={13} style={{ color: '#d4af37' }} />
            <span>Track My Timepiece</span>
          </button>

          <span style={{ color: 'rgba(255, 255, 255, 0.15)' }}>|</span>

          <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#10b981', fontSize: '0.7rem' }}>
            <span className="live-pulse" style={{ width: '6px', height: '6px' }}></span>
            <span>Geneva Workshop: Active</span>
          </span>
        </div>

        {/* Center: Rotating text */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          letterSpacing: '0.08em',
          fontWeight: 500,
          color: '#f8fafc',
          textAlign: 'center',
          margin: '0 auto'
        }}>
          <CurrentIcon size={13} style={{ color: '#d4af37', flexShrink: 0 }} />
          <span style={{ transition: 'opacity 0.3s ease' }}>
            {messages[currentMessageIndex].text}
          </span>
        </div>

        {/* Right: Currency & Admin link */}
        <div className="announcement-side-right" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          {/* Currency Display (INR Only) */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.35rem',
            padding: '0.15rem 0.5rem',
            background: 'rgba(212, 175, 55, 0.08)',
            border: '1px solid rgba(212, 175, 55, 0.25)',
            borderRadius: '3px',
            fontSize: '0.72rem',
            color: '#f3e5ab'
          }}>
            <span style={{ fontSize: '0.8rem' }}>🇮🇳</span>
            <span style={{ fontWeight: 600, letterSpacing: '0.05em' }}>INR (₹)</span>
          </div>

          <span style={{ color: 'rgba(255, 255, 255, 0.15)' }}>|</span>

          {/* Master Admin Portal Trigger */}
          <button
            onClick={onOpenAdmin}
            style={{
              background: 'rgba(212, 175, 55, 0.1)',
              border: '1px solid rgba(212, 175, 55, 0.3)',
              color: '#d4af37',
              padding: '0.18rem 0.6rem',
              borderRadius: '3px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem',
              fontSize: '0.7rem',
              fontWeight: 600,
              letterSpacing: '0.05em',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background = '#d4af37';
              e.currentTarget.style.color = '#000';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = 'rgba(212, 175, 55, 0.1)';
              e.currentTarget.style.color = '#d4af37';
            }}
            title="Single Master Admin Control Center"
          >
            <Lock size={11} />
            <span>ADMIN PORTAL</span>
          </button>
        </div>
      </div>
    </div>
  );
};

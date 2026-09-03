import React from 'react';
import { useStore } from '../context/StoreContext';
import { Sparkles, ShieldCheck, Truck } from 'lucide-react';

export const AnnouncementBar = ({ onOpenTracking }) => {
  const { storeSettings, homepageContent } = useStore();

  const announcementText =
    homepageContent?.announcementBar?.text ||
    storeSettings?.announcement ||
    'FREE SHIPPING ABOVE ₹999 | SECURE PAYMENTS | EASY RETURNS';

  return (
    <div
      style={{
        backgroundColor: '#0b0f19',
        color: '#f8fafc',
        borderBottom: '1px solid rgba(180, 140, 30, 0.25)',
        fontSize: 'clamp(0.62rem, 1.8vw, 0.72rem)',
        letterSpacing: '0.12em',
        textTransform: 'uppercase',
        fontWeight: 600,
        minHeight: '36px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        zIndex: 95,
        padding: '0.35rem 0.75rem',
        width: '100%',
        overflow: 'hidden'
      }}
    >
      <div
        className="luxury-container"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          width: '100%',
          gap: '0.5rem'
        }}
      >
        {/* Left: Security Tag (Desktop only) */}
        <div className="desktop-only" style={{ alignItems: 'center', gap: '6px', color: '#f3e5ab', whiteSpace: 'nowrap' }}>
          <ShieldCheck size={13} color="#d4af37" />
          <span>GENEVA VERIFIED • 100% AUTHENTIC</span>
        </div>

        {/* Center: Dynamic Announcement Bar (Always visible) */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
            textAlign: 'center',
            color: '#ffffff',
            margin: '0 auto',
            minWidth: 0,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap'
          }}
        >
          <Sparkles size={12} color="#d4af37" style={{ flexShrink: 0 }} />
          <span style={{ fontWeight: 600, color: '#f3e5ab', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {announcementText}
          </span>
        </div>

        {/* Right: Order Tracking */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', whiteSpace: 'nowrap' }}>
          <button
            onClick={onOpenTracking}
            className="desktop-only"
            style={{
              background: 'none',
              border: 'none',
              color: '#cbd5e1',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              fontSize: 'inherit',
              textTransform: 'uppercase',
              letterSpacing: 'inherit',
              padding: 0
            }}
          >
            <Truck size={13} color="#d4af37" />
            <span>Track Consignment</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default AnnouncementBar;

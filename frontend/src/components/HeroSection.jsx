import React from 'react';
import { ShieldCheck, Award, Sparkles, Gem, ArrowRight, Compass } from 'lucide-react';
import { LuxuryBrandsOrbital } from './LuxuryBrandsOrbital';

export const HeroSection = ({ onShopNow, onExploreSkeleton, onExploreCategory }) => {
  const handleExplore = onShopNow || (() => {
    const el = document.getElementById('catalog-section');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  });

  const handleSkeleton = onExploreSkeleton || (() => {
    if (onExploreCategory) onExploreCategory('Skeletons');
    const el = document.getElementById('catalog-section');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  });

  return (
    <section style={{
      position: 'relative',
      minHeight: '85vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'radial-gradient(circle at 50% 30%, #1c202a 0%, #0c0d12 70%, #060709 100%)',
      overflow: 'hidden',
      padding: '4rem 1.5rem 2rem',
      borderBottom: '1px solid rgba(212, 175, 55, 0.15)'
    }}>
      {/* Background Watch Silhouette / Subtle Visual Accent */}
      <div style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: '650px',
        height: '650px',
        borderRadius: '50%',
        border: '1px solid rgba(212, 175, 55, 0.08)',
        boxShadow: '0 0 120px rgba(212, 175, 55, 0.05)',
        pointerEvents: 'none',
        zIndex: 1
      }}>
        <div style={{
          position: 'absolute',
          inset: '40px',
          borderRadius: '50%',
          border: '1px dashed rgba(212, 175, 55, 0.12)',
          animation: 'rotateSubtle 120s linear infinite'
        }} />
      </div>

      {/* Hero Content Container */}
      <div className="luxury-container" style={{
        position: 'relative',
        zIndex: 2,
        textAlign: 'center',
        maxWidth: '960px'
      }}>
        {/* Top Tagline Badge */}
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.6rem',
          backgroundColor: 'rgba(212, 175, 55, 0.1)',
          border: '1px solid rgba(212, 175, 55, 0.35)',
          padding: '0.4rem 1.2rem',
          borderRadius: '50px',
          marginBottom: '1.75rem',
          boxShadow: '0 4px 20px rgba(0,0,0,0.4)'
        }}>
          <Sparkles size={14} style={{ color: '#f3e5ab' }} />
          <span style={{
            fontSize: '0.72rem',
            fontFamily: 'var(--font-sans)',
            fontWeight: 600,
            letterSpacing: '0.22em',
            textTransform: 'uppercase',
            color: '#f3e5ab'
          }}>
            THE 2026 HOROLOGY COLLECTION • GENEVA & LONDON
          </span>
        </div>

        {/* Main Prestige Headline */}
        <h1 style={{
          fontFamily: 'var(--font-brand)',
          fontSize: 'clamp(2.4rem, 5.5vw, 4.2rem)',
          fontWeight: 700,
          letterSpacing: '0.04em',
          lineHeight: 1.15,
          marginBottom: '1.25rem',
          color: '#ffffff'
        }}>
          TIMEPIECES OF <br />
          <span className="text-gold-gradient">UNRIVALED PRESTIGE</span>
        </h1>

        {/* Subtitle */}
        <p style={{
          fontSize: 'clamp(0.95rem, 1.8vw, 1.15rem)',
          color: '#94a3b8',
          lineHeight: 1.7,
          maxWidth: '720px',
          margin: '0 auto 2.5rem auto',
          fontWeight: 300
        }}>
          Engineered with uncompromising Swiss automatic calibres, scratch-resistant sapphire crystals, and bespoke complimentary caseback engraving. Crafted for those who master time.
        </p>

        {/* CTA Buttons */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '1.2rem',
          flexWrap: 'wrap',
          marginBottom: '2rem'
        }}>
          <button
            onClick={handleExplore}
            className="btn-gold"
            style={{ minWidth: '220px', fontSize: '0.85rem' }}
          >
            <span>EXPLORE MASTERPIECES</span>
            <ArrowRight size={16} />
          </button>

          <button
            onClick={handleSkeleton}
            className="btn-outline-gold"
            style={{ minWidth: '220px', fontSize: '0.85rem' }}
          >
            <span>DISCOVER SKELETONS</span>
            <Gem size={15} />
          </button>
        </div>

        {/* Endless Circular Orbiting Luxury Watch Brands with Authentic Logos */}
        <LuxuryBrandsOrbital
          onSelectBrand={() => {
            const el = document.getElementById('catalog-section');
            if (el) el.scrollIntoView({ behavior: 'smooth' });
          }}
        />

        {/* Trust & Craft Indicators */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: '1.25rem',
          paddingTop: '2.5rem',
          borderTop: '1px solid rgba(255, 255, 255, 0.08)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', justifyContent: 'center' }}>
            <Award size={20} style={{ color: '#d4af37', flexShrink: 0 }} />
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontSize: '0.78rem', fontWeight: 600, color: '#f8fafc' }}>Swiss Calibre</div>
              <div style={{ fontSize: '0.68rem', color: '#64748b' }}>28,800 VPH Precision</div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', justifyContent: 'center' }}>
            <Gem size={20} style={{ color: '#d4af37', flexShrink: 0 }} />
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontSize: '0.78rem', fontWeight: 600, color: '#f8fafc' }}>Sapphire Glass</div>
              <div style={{ fontSize: '0.68rem', color: '#64748b' }}>Double Anti-Reflective</div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', justifyContent: 'center' }}>
            <Sparkles size={20} style={{ color: '#d4af37', flexShrink: 0 }} />
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontSize: '0.78rem', fontWeight: 600, color: '#f8fafc' }}>Custom Engraving</div>
              <div style={{ fontSize: '0.68rem', color: '#64748b' }}>Complimentary on Caseback</div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', justifyContent: 'center' }}>
            <ShieldCheck size={20} style={{ color: '#d4af37', flexShrink: 0 }} />
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontSize: '0.78rem', fontWeight: 600, color: '#f8fafc' }}>5-Year Warranty</div>
              <div style={{ fontSize: '0.68rem', color: '#64748b' }}>Global Concierge Service</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

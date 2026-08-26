import React from 'react';
import { useStore } from '../context/StoreContext';
import { ShieldCheck, Award, Sparkles, Gem, ArrowRight } from 'lucide-react';
import { LuxuryBrandsOrbital } from './LuxuryBrandsOrbital';

export const HeroSection = ({ onShopNow, onExploreSkeleton, onExploreCategory }) => {
  const { homepageContent } = useStore();

  const heroData = homepageContent?.hero || {
    heading: 'TIMELESS STYLE.\nPERFECTLY PRICED.',
    subheading: 'Discover authentic branded watches crafted for every occasion.',
    badgeText: 'THE 2026 HOROLOGY COLLECTION • GENEVA & LONDON',
    ctaPrimaryText: 'SHOP ALL WATCHES',
    ctaSecondaryText: 'EXPLORE SKELETONS'
  };

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
      minHeight: '80vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'radial-gradient(circle at 50% 25%, #ffffff 0%, #faf8f5 55%, #f1eee4 100%)',
      overflow: 'hidden',
      padding: 'clamp(2rem, 4vw, 3.5rem) 0.75rem',
      borderBottom: '1px solid rgba(180, 140, 30, 0.2)',
      width: '100%',
      maxWidth: '100%'
    }}>
      {/* Background Watch Silhouette & Orbital Ring */}
      <div style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: 'min(500px, 85vw)',
        height: 'min(500px, 85vw)',
        borderRadius: '50%',
        border: '1px solid rgba(180, 140, 30, 0.15)',
        boxShadow: '0 0 100px rgba(180, 140, 30, 0.06)',
        pointerEvents: 'none',
        zIndex: 1
      }}>
        <div style={{
          position: 'absolute',
          inset: '30px',
          borderRadius: '50%',
          border: '1px dashed rgba(180, 140, 30, 0.18)',
          animation: 'rotateSubtle 120s linear infinite'
        }} />
      </div>

      {/* Hero Content Container */}
      <div className="luxury-container" style={{
        position: 'relative',
        zIndex: 2,
        textAlign: 'center',
        maxWidth: '900px',
        width: '100%'
      }}>
        {/* Top Tagline Badge */}
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.4rem',
          backgroundColor: 'rgba(180, 140, 30, 0.08)',
          border: '1px solid rgba(180, 140, 30, 0.35)',
          padding: '0.35rem 0.85rem',
          borderRadius: '50px',
          marginBottom: '1.25rem',
          boxShadow: '0 4px 15px rgba(0, 0, 0, 0.04)',
          maxWidth: '100%'
        }}>
          <Sparkles size={13} style={{ color: '#8a6709', flexShrink: 0 }} />
          <span style={{
            fontSize: 'clamp(0.6rem, 1.8vw, 0.72rem)',
            fontFamily: 'var(--font-sans)',
            fontWeight: 700,
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            color: '#8a6709',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis'
          }}>
            {heroData.badgeText || 'THE 2026 HOROLOGY COLLECTION • GENEVA & LONDON'}
          </span>
        </div>

        {/* Main Prestige Headline */}
        <h1 style={{
          fontFamily: 'var(--font-brand)',
          fontSize: 'clamp(1.6rem, 5.2vw, 3.4rem)',
          fontWeight: 700,
          letterSpacing: '0.02em',
          lineHeight: 1.15,
          marginBottom: '1rem',
          color: '#0f172a',
          wordBreak: 'break-word',
          whiteSpace: 'pre-line'
        }}>
          {heroData.heading || 'TIMELESS STYLE.\nPERFECTLY PRICED.'}
        </h1>

        {/* Subtitle */}
        <p style={{
          fontSize: 'clamp(0.82rem, 2vw, 1rem)',
          color: '#475569',
          lineHeight: 1.6,
          maxWidth: '680px',
          margin: '0 auto 1.5rem auto',
          fontWeight: 400
        }}>
          {heroData.subheading || 'Discover authentic branded watches crafted for every occasion.'}
        </p>

        {/* CTA Buttons */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '0.75rem',
          flexWrap: 'wrap',
          marginBottom: '1.5rem',
          width: '100%'
        }}>
          <button
            onClick={handleExplore}
            className="btn-gold"
            style={{ width: 'min(220px, 100%)', fontSize: '0.82rem' }}
          >
            <span>{heroData.ctaPrimaryText || 'SHOP ALL WATCHES'}</span>
            <ArrowRight size={15} />
          </button>

          <button
            onClick={handleSkeleton}
            className="btn-outline-gold"
            style={{ width: 'min(220px, 100%)', fontSize: '0.82rem' }}
          >
            <span>{heroData.ctaSecondaryText || 'EXPLORE SKELETONS'}</span>
            <Gem size={14} />
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
          gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 140px), 1fr))',
          gap: '1rem',
          paddingTop: '2rem',
          borderTop: '1px solid rgba(0, 0, 0, 0.08)',
          width: '100%'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', justifyContent: 'center' }}>
            <Award size={18} style={{ color: '#8a6709', flexShrink: 0 }} />
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#0f172a' }}>Swiss Calibre</div>
              <div style={{ fontSize: '0.65rem', color: '#64748b' }}>28,800 VPH Precision</div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', justifyContent: 'center' }}>
            <Gem size={18} style={{ color: '#8a6709', flexShrink: 0 }} />
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#0f172a' }}>Sapphire Glass</div>
              <div style={{ fontSize: '0.65rem', color: '#64748b' }}>Double Anti-Reflective</div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', justifyContent: 'center' }}>
            <Sparkles size={18} style={{ color: '#8a6709', flexShrink: 0 }} />
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#0f172a' }}>Custom Engraving</div>
              <div style={{ fontSize: '0.65rem', color: '#64748b' }}>Complimentary Caseback</div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', justifyContent: 'center' }}>
            <ShieldCheck size={18} style={{ color: '#8a6709', flexShrink: 0 }} />
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#0f172a' }}>5-Year Warranty</div>
              <div style={{ fontSize: '0.65rem', color: '#64748b' }}>Global Concierge Care</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;

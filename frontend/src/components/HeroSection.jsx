import React from 'react';
import { useStore } from '../context/StoreContext';
import { ShieldCheck, Award, Sparkles, Gem, ArrowRight } from 'lucide-react';
import { LuxuryBrandsOrbital } from './LuxuryBrandsOrbital';
import { Watch3D } from './Watch3D';

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
    <section
      className="hero-luxury-section"
      style={{
        position: 'relative',
        minHeight: 'auto',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'radial-gradient(circle at 50% 20%, #ffffff 0%, #faf8f5 55%, #f1eee4 100%)',
        overflow: 'hidden',
        padding: 'clamp(2rem, 4.5vw, 4rem) 0 1.5rem 0',
        borderBottom: '1px solid rgba(180, 140, 30, 0.2)',
        width: '100%',
        maxWidth: '100%'
      }}
    >
      {/* Background Subtle Horological Radial Aura */}
      <div
        style={{
          position: 'absolute',
          top: '30%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 'min(750px, 95vw)',
          height: 'min(750px, 95vw)',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(212, 175, 55, 0.08) 0%, rgba(212, 175, 55, 0.02) 50%, transparent 70%)',
          pointerEvents: 'none',
          zIndex: 1
        }}
      />

      {/* Main Two-Column Hero Grid Container */}
      <div className="luxury-container" style={{ position: 'relative', zIndex: 2, width: '100%' }}>
        <div className="hero-two-column-grid">
          {/* Left Column: Badge, Typography & Action CTAs */}
          <div className="hero-text-column">
            {/* Top Tagline Badge */}
            <div className="hero-badge">
              <Sparkles size={13} style={{ color: '#8a6709', flexShrink: 0 }} />
              <span className="hero-badge-text">
                {heroData.badgeText || 'THE 2026 HOROLOGY COLLECTION • GENEVA & LONDON'}
              </span>
            </div>

            {/* Main Prestige Headline */}
            <h1 className="hero-main-heading">
              {heroData.heading || 'TIMELESS STYLE.\nPERFECTLY PRICED.'}
            </h1>

            {/* Subtitle Description */}
            <p className="hero-subheading">
              {heroData.subheading || 'Discover authentic branded watches crafted for every occasion.'}
            </p>

            {/* CTA Buttons */}
            <div className="hero-cta-group">
              <button
                onClick={handleExplore}
                className="btn-gold hero-btn-primary"
              >
                <span>{heroData.ctaPrimaryText || 'SHOP ALL WATCHES'}</span>
                <ArrowRight size={15} />
              </button>

              <button
                onClick={handleSkeleton}
                className="btn-outline-gold hero-btn-secondary"
              >
                <span>{heroData.ctaSecondaryText || 'EXPLORE SKELETONS'}</span>
                <Gem size={14} />
              </button>
            </div>
          </div>

          {/* Right Column: Premium 3D Interactive Watch Showcase */}
          <div className="hero-watch-column">
            <Watch3D />
          </div>
        </div>

        {/* Continuous Marquee Brand Showcase */}
        <div style={{ marginTop: 'clamp(1rem, 2.5vw, 2rem)', width: '100%' }}>
          <LuxuryBrandsOrbital
            onSelectBrand={() => {
              const el = document.getElementById('catalog-section');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            }}
          />
        </div>

        {/* Trust & Craft Indicators */}
        <div className="hero-trust-grid">
          <div className="hero-trust-item">
            <Award size={18} style={{ color: '#8a6709', flexShrink: 0 }} />
            <div className="hero-trust-text">
              <div className="hero-trust-title">Swiss Calibre</div>
              <div className="hero-trust-subtitle">28,800 VPH Precision</div>
            </div>
          </div>

          <div className="hero-trust-item">
            <Gem size={18} style={{ color: '#8a6709', flexShrink: 0 }} />
            <div className="hero-trust-text">
              <div className="hero-trust-title">Sapphire Glass</div>
              <div className="hero-trust-subtitle">Double Anti-Reflective</div>
            </div>
          </div>

          <div className="hero-trust-item">
            <Sparkles size={18} style={{ color: '#8a6709', flexShrink: 0 }} />
            <div className="hero-trust-text">
              <div className="hero-trust-title">Custom Engraving</div>
              <div className="hero-trust-subtitle">Complimentary Caseback</div>
            </div>
          </div>

          <div className="hero-trust-item">
            <ShieldCheck size={18} style={{ color: '#8a6709', flexShrink: 0 }} />
            <div className="hero-trust-text">
              <div className="hero-trust-title">5-Year Warranty</div>
              <div className="hero-trust-subtitle">Global Concierge Care</div>
            </div>
          </div>
        </div>
      </div>

      {/* Embedded High-Performance Responsive Layout Styles */}
      <style>{`
        .hero-two-column-grid {
          display: grid;
          grid-template-columns: 1.15fr 0.85fr;
          align-items: center;
          gap: clamp(1.5rem, 3.5vw, 3.5rem);
          width: 100%;
        }

        .hero-text-column {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          text-align: left;
          z-index: 2;
        }

        .hero-watch-column {
          display: flex;
          align-items: center;
          justifyContent: center;
          width: 100%;
          z-index: 2;
        }

        .hero-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.4rem;
          background-color: rgba(180, 140, 30, 0.08);
          border: 1px solid rgba(180, 140, 30, 0.35);
          padding: 0.35rem 0.85rem;
          border-radius: 50px;
          margin-bottom: 1.25rem;
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.04);
          max-width: 100%;
        }

        .hero-badge-text {
          font-size: clamp(0.6rem, 1.6vw, 0.72rem);
          font-family: var(--font-sans);
          font-weight: 700;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: '#8a6709';
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .hero-main-heading {
          font-family: var(--font-brand);
          font-size: clamp(1.8rem, 4.2vw, 3.5rem);
          font-weight: 700;
          letter-spacing: 0.02em;
          line-height: 1.12;
          margin-bottom: 1rem;
          color: #0f172a;
          word-break: break-word;
          white-space: pre-line;
        }

        .hero-subheading {
          font-size: clamp(0.85rem, 1.8vw, 1.05rem);
          color: #475569;
          line-height: 1.6;
          max-width: 580px;
          margin: 0 0 1.75rem 0;
          font-weight: 400;
        }

        .hero-cta-group {
          display: flex;
          align-items: center;
          gap: 0.85rem;
          flex-wrap: wrap;
          width: 100%;
        }

        .hero-btn-primary, .hero-btn-secondary {
          min-width: 180px;
          font-size: 0.82rem;
        }

        .hero-trust-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 1rem;
          padding-top: 1.75rem;
          margin-top: 1rem;
          border-top: 1px solid rgba(0, 0, 0, 0.08);
          width: 100%;
        }

        .hero-trust-item {
          display: flex;
          align-items: center;
          gap: 0.6rem;
          justifyContent: flex-start;
        }

        .hero-trust-text {
          text-align: left;
        }

        .hero-trust-title {
          font-size: 0.75rem;
          font-weight: 600;
          color: #0f172a;
        }

        .hero-trust-subtitle {
          font-size: 0.65rem;
          color: #64748b;
        }

        /* Laptop (1024px - 1440px) */
        @media (max-width: 1440px) {
          .hero-two-column-grid {
            grid-template-columns: 1.1fr 0.9fr;
          }
        }

        /* Tablet (768px - 1023px) */
        @media (max-width: 1023px) {
          .hero-two-column-grid {
            grid-template-columns: 1fr;
            text-align: center;
            gap: 1.75rem;
          }

          .hero-text-column {
            align-items: center;
            text-align: center;
          }

          .hero-subheading {
            margin: 0 auto 1.5rem auto;
          }

          .hero-cta-group {
            justify-content: center;
          }

          .hero-trust-grid {
            grid-template-columns: repeat(2, 1fr);
            gap: 1.25rem;
          }

          .hero-trust-item {
            justify-content: center;
          }
        }

        /* Mobile (320px - 767px) */
        @media (max-width: 767px) {
          .hero-two-column-grid {
            grid-template-columns: 1fr;
            gap: 1.25rem;
          }

          .hero-main-heading {
            font-size: clamp(1.65rem, 6.5vw, 2.3rem);
            line-height: 1.18;
          }

          .hero-subheading {
            font-size: 0.85rem;
            margin-bottom: 1.25rem;
          }

          .hero-cta-group {
            flex-direction: column;
            gap: 0.65rem;
            width: 100%;
          }

          .hero-btn-primary, .hero-btn-secondary {
            width: 100% !important;
            min-width: 100% !important;
            padding: 0.85rem 1rem !important;
          }

          .hero-trust-grid {
            grid-template-columns: repeat(2, 1fr);
            gap: 0.75rem;
            padding-top: 1.25rem;
          }

          .hero-trust-item {
            gap: 0.4rem;
          }

          .hero-trust-title {
            font-size: 0.7rem;
          }

          .hero-trust-subtitle {
            font-size: 0.58rem;
          }
        }

        @media (max-width: 420px) {
          .hero-trust-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </section>
  );
};

export default HeroSection;

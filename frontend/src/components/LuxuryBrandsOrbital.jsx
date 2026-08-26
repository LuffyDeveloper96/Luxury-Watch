import React, { useState, useRef } from 'react';
import { useStore } from '../context/StoreContext';
import { Sparkles, Pause, Play, ChevronRight } from 'lucide-react';

export const LuxuryBrandsOrbital = ({ onSelectBrand }) => {
  const { brands, setActiveBrand, setActiveCategory } = useStore();
  const [isPaused, setIsPaused] = useState(false);
  const scrollRef = useRef(null);

  // Fallback brand logos if logoSvg is not supplied in DB
  const defaultBrands = [
    { id: 'rolex', name: 'Rolex', slug: 'rolex', tagline: 'A Crown for Every Achievement', hallmark: 'Oyster Perpetual & Submariner', color: '#006039' },
    { id: 'titan', name: 'Titan', slug: 'titan', tagline: 'Be More • Timeless Indian Craftsmanship', hallmark: 'Grandmaster & Edge Ceramic', color: '#8a6709' },
    { id: 'casio', name: 'Casio', slug: 'casio', tagline: 'Calculated Precision & Toughness', hallmark: 'G-Shock CasiOak & Edifice Solar', color: '#1e293b' },
    { id: 'fastrack', name: 'Fastrack', slug: 'fastrack', tagline: 'Move On • Edgy Youthful Expression', hallmark: 'Stunners Chrono & Reflex Smart', color: '#e11d48' },
    { id: 'fossil', name: 'Fossil', slug: 'fossil', tagline: 'Authentic Vintage Style with Modern Soul', hallmark: 'Townsman Skeleton & Grant Chrono', color: '#78350f' },
    { id: 'timex', name: 'Timex', slug: 'timex', tagline: 'Takes a Licking and Keeps on Ticking', hallmark: 'Q Reissue 1979 & Marlin Automatic', color: '#0369a1' },
    { id: 'sonata', name: 'Sonata', slug: 'sonata', tagline: 'Style that Resonates with Every Moment', hallmark: 'Poze Dual Tone & Utsav Wedding', color: '#b45309' },
    { id: 'guess', name: 'Guess', slug: 'guess', tagline: 'Glamour, Attitude & Runway Elegance', hallmark: 'Frontier Pavé & Phoenix Barrel', color: '#4c1d95' },
    { id: 'limestone', name: 'Limestone', slug: 'limestone', tagline: 'Clean Minimalist Contemporary Craft', hallmark: 'Diamond-Cut Glass & Chrono Mesh', color: '#0f172a' },
    { id: 'noise', name: 'Noise', slug: 'noise', tagline: 'Listen to the Noise Within', hallmark: 'ColorFit Pro 5 & Diva Diamond', color: '#0284c7' }
  ];

  const brandList = (brands && brands.length > 0) ? brands : defaultBrands;
  // Duplicate for seamless infinite marquee loop
  const displayBrands = [...brandList, ...brandList];

  const handleBrandClick = (brand) => {
    if (setActiveBrand) setActiveBrand(brand.name);
    if (setActiveCategory) setActiveCategory(brand.name);
    if (onSelectBrand) onSelectBrand(brand);
    
    // Smooth scroll to catalog
    const catalogEl = document.getElementById('catalog-section');
    if (catalogEl) {
      catalogEl.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div
      style={{
        margin: '1.5rem 0 1rem 0',
        padding: '1rem 0',
        position: 'relative',
        overflow: 'hidden',
        width: '100%',
        maxWidth: '100%'
      }}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Section Sub-heading */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '1rem',
        padding: '0 0.5rem',
        width: '100%'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', minWidth: 0 }}>
          <Sparkles size={13} color="#8a6709" style={{ flexShrink: 0 }} />
          <span style={{
            fontSize: 'clamp(0.6rem, 1.8vw, 0.72rem)',
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            fontWeight: 700,
            color: '#8a6709',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis'
          }}>
            PRESTIGE BRAND SHOWCASE • CONTINUOUS CAROUSEL
          </span>
        </div>
        <button
          onClick={() => setIsPaused(prev => !prev)}
          style={{
            background: 'none',
            border: 'none',
            color: '#64748b',
            display: 'flex',
            alignItems: 'center',
            gap: '3px',
            fontSize: '0.68rem',
            cursor: 'pointer',
            padding: '4px 6px',
            flexShrink: 0
          }}
          title={isPaused ? "Resume rotation" : "Pause rotation"}
        >
          {isPaused ? <Play size={11} /> : <Pause size={11} />}
          <span>{isPaused ? 'Resume' : 'Pause'}</span>
        </button>
      </div>

      {/* Infinite Horizontal Brand Carousel */}
      <div
        ref={scrollRef}
        style={{
          display: 'flex',
          gap: '1rem',
          width: 'max-content',
          animation: isPaused ? 'none' : 'brandScroll 35s linear infinite',
          padding: '0.25rem 0'
        }}
      >
        {displayBrands.map((brand, idx) => (
          <div
            key={`${brand.id}-${idx}`}
            onClick={() => handleBrandClick(brand)}
            style={{
              width: '160px',
              flexShrink: 0,
              background: '#ffffff',
              border: '1px solid rgba(0, 0, 0, 0.08)',
              borderRadius: '8px',
              padding: '1rem 0.85rem',
              textAlign: 'center',
              cursor: 'pointer',
              boxShadow: '0 4px 14px rgba(15, 23, 42, 0.04)',
              transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
              position: 'relative',
              overflow: 'hidden'
            }}
            className="brand-card-hover"
          >
            {/* Top Accent Strip */}
            <div style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: '3px',
              background: brand.color ? `linear-gradient(90deg, ${brand.color}, #d4af37)` : 'var(--gold-gradient)'
            }} />

            {/* Circular Logo Monogram */}
            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: '50%',
              margin: '0 auto 0.6rem auto',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'radial-gradient(circle, rgba(212, 175, 55, 0.12) 0%, rgba(255, 255, 255, 0.9) 100%)',
              border: '1px solid rgba(180, 140, 30, 0.3)',
              boxShadow: '0 4px 12px rgba(180, 140, 30, 0.12)'
            }}>
              {brand.logoUrl ? (
                <img src={brand.logoUrl} alt={brand.name} style={{ width: '28px', height: '28px', objectFit: 'contain' }} />
              ) : (
                <span style={{
                  fontFamily: 'var(--font-brand)',
                  fontWeight: 700,
                  fontSize: '0.95rem',
                  color: '#8a6709',
                  letterSpacing: '0.05em'
                }}>
                  {brand.name.slice(0, 2).toUpperCase()}
                </span>
              )}
            </div>

            {/* Brand Title */}
            <h3 style={{
              fontFamily: 'var(--font-brand)',
              fontSize: '0.82rem',
              fontWeight: 700,
              letterSpacing: '0.06em',
              color: '#0f172a',
              margin: '0 0 0.25rem 0',
              textTransform: 'uppercase',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis'
            }}>
              {brand.name}
            </h3>

            {/* Tagline / Hallmark */}
            <p style={{
              fontSize: '0.65rem',
              color: '#64748b',
              margin: 0,
              lineHeight: 1.3,
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis'
            }}>
              {brand.hallmark || brand.tagline || brand.origin || 'Swiss Masterpiece'}
            </p>

            {/* Explore indicator */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '2px',
              marginTop: '0.5rem',
              color: '#8a6709',
              fontSize: '0.62rem',
              fontWeight: 600,
              letterSpacing: '0.04em'
            }}>
              <span>EXPLORE</span>
              <ChevronRight size={10} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default LuxuryBrandsOrbital;

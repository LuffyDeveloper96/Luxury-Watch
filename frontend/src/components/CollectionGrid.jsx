import React, { useState } from 'react';
import { ArrowUpRight, Sparkles, Award, Layers } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { INITIAL_BRANDS } from '../data/initialBrands';

export const CollectionGrid = ({ onSelectCategory }) => {
  const [viewMode, setViewMode] = useState('brands'); // 'brands' | 'complications'
  const { brands } = useStore();

  // Dynamic active brands pool from backend / StoreContext, falling back to initial seed
  const rawBrands = (brands && brands.length > 0) ? brands : INITIAL_BRANDS;
  const activeBrands = rawBrands.filter(b => b.active !== false && b.isActive !== false);
  const sortedBrands = [...activeBrands].sort((a, b) => (Number(a.displayOrder) || 0) - (Number(b.displayOrder) || 0));

  // Curated Horology Complications
  const horologyComplications = [
    {
      title: "Royal Chronographs",
      category: "Chronographs",
      subtitle: "Precision stopwatches, tachymeter bezels & dual-pusher calibres",
      image: "/images/watches/omega_speedmaster.jpg",
      tag: "FLAGSHIP CHRONO",
      models: "Speedmaster, Navitimer, Monaco"
    },
    {
      title: "Skeleton Automatics",
      category: "Skeletons",
      subtitle: "Open-worked dial plates revealing balance wheels and gear trains",
      image: "/images/watches/ap_royaloak.jpg",
      tag: "HAUTE HORLOGERIE",
      models: "Royal Oak, Townsman, Phoenix"
    },
    {
      title: "Diamond & Pavé Editions",
      category: "Diamond Editions",
      subtitle: "Brilliant-cut crystals, pavé bezels and sparkling luxury dials",
      image: "/images/watches/cartier_santos.jpg",
      tag: "PRECIOUS GEM",
      models: "Frontier Pavé, Diva Diamond, Sheen"
    },
    {
      title: "Diver & Professional Sport",
      category: "Dive & Sport",
      subtitle: "300M water resistance, unidirectional Cerachrom ceramic bezels & Chromalight",
      image: "/images/watches/rolex_submariner.jpg",
      tag: "HISTORIC DIVER",
      models: "Submariner Date, PRX Powermatic"
    }
  ];

  const handleCardClick = (target) => {
    if (typeof onSelectCategory === 'function') {
      onSelectCategory(target);
    }
    const el = document.getElementById('catalog-section');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section style={{ padding: 'clamp(3rem, 6vw, 5.5rem) 0', backgroundColor: '#fcfbfa', borderBottom: '1px solid rgba(180, 140, 30, 0.15)' }}>
      <div className="luxury-container">
        {/* Section Header */}
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.4rem',
            fontSize: 'clamp(0.6rem, 1.8vw, 0.72rem)',
            fontFamily: 'var(--font-sans)',
            letterSpacing: '0.12em',
            color: '#8a6709',
            textTransform: 'uppercase',
            fontWeight: 700,
            marginBottom: '0.6rem',
            background: 'rgba(180, 140, 30, 0.08)',
            padding: '0.35rem 0.85rem',
            borderRadius: '50px',
            border: '1px solid rgba(180, 140, 30, 0.25)',
            maxWidth: '100%'
          }}>
            <Sparkles size={13} style={{ color: '#8a6709', flexShrink: 0 }} />
            <span>PRESTIGIOUS SWISS WATCH HOUSES</span>
          </div>
          
          <h2 style={{
            fontSize: 'clamp(1.4rem, 4.5vw, 2.5rem)',
            color: '#0f172a',
            fontWeight: 700,
            letterSpacing: '0.02em',
            marginTop: '0.5rem',
            wordBreak: 'break-word'
          }}>
            DISCOVER THE WATCH BRANDS & COLLECTIONS
          </h2>

          <div style={{
            width: '60px',
            height: '2px',
            background: 'var(--gold-gradient)',
            margin: '1rem auto 1.25rem auto'
          }} />

          <p style={{
            color: '#64748b',
            fontSize: 'clamp(0.82rem, 2vw, 0.95rem)',
            maxWidth: '680px',
            margin: '0 auto',
            lineHeight: 1.6
          }}>
            Explore the world's most revered Haute Horlogerie manufactures. Click any brand or complication to filter our authenticated inventory.
          </p>

          {/* Interactive Mode Toggle */}
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            backgroundColor: '#f1eee7',
            padding: '4px',
            borderRadius: '6px',
            marginTop: '1.5rem',
            border: '1px solid rgba(180, 140, 30, 0.25)',
            maxWidth: '100%',
            flexWrap: 'wrap',
            justifyContent: 'center',
            gap: '4px'
          }}>
            <button
              onClick={() => setViewMode('brands')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                padding: '6px 14px',
                borderRadius: '4px',
                fontSize: 'clamp(0.68rem, 2vw, 0.78rem)',
                fontWeight: viewMode === 'brands' ? 700 : 500,
                letterSpacing: '0.04em',
                border: 'none',
                cursor: 'pointer',
                transition: 'all 0.25s ease',
                backgroundColor: viewMode === 'brands' ? '#ffffff' : 'transparent',
                color: viewMode === 'brands' ? '#8a6709' : '#64748b',
                boxShadow: viewMode === 'brands' ? '0 2px 8px rgba(0,0,0,0.08)' : 'none'
              }}
            >
              <Award size={14} />
              <span>LUXURY WATCH BRANDS ({sortedBrands.length})</span>
            </button>

            <button
              onClick={() => setViewMode('complications')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                padding: '6px 14px',
                borderRadius: '4px',
                fontSize: 'clamp(0.68rem, 2vw, 0.78rem)',
                fontWeight: viewMode === 'complications' ? 700 : 500,
                letterSpacing: '0.04em',
                border: 'none',
                cursor: 'pointer',
                transition: 'all 0.25s ease',
                backgroundColor: viewMode === 'complications' ? '#ffffff' : 'transparent',
                color: viewMode === 'complications' ? '#8a6709' : '#64748b',
                boxShadow: viewMode === 'complications' ? '0 2px 8px rgba(0,0,0,0.08)' : 'none'
              }}
            >
              <Layers size={14} />
              <span>HOROLOGY COMPLICATIONS ({horologyComplications.length})</span>
            </button>
          </div>
        </div>

        {/* View Mode 1: Dynamic Luxury Watch Brands Grid */}
        {viewMode === 'brands' && (
          sortedBrands.length === 0 ? (
            <div style={{
              textAlign: 'center',
              padding: '4rem 1.5rem',
              backgroundColor: '#ffffff',
              borderRadius: '8px',
              border: '1px dashed #cbd5e1'
            }}>
              <p style={{ color: '#64748b', fontSize: '0.95rem', fontStyle: 'italic', margin: 0 }}>
                No brand collections available at the moment.
              </p>
            </div>
          ) : (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 260px), 1fr))',
              gap: '1.25rem',
              width: '100%'
            }}>
              {sortedBrands.map((brand) => {
                const bgImage = brand.image || brand.bannerUrl || '/images/watches/rolex_submariner.jpg';
                const originText = brand.origin || (brand.established ? `${brand.location || 'Switzerland'} • Est. ${brand.established}` : (brand.location || 'Switzerland'));
                const badgeText = brand.badge || brand.tag || 'OFFICIAL ICON';
                const modelText = brand.featuredCollection || brand.model || brand.hallmark || '';
                const descText = brand.description || brand.subtitle || brand.tagline || '';
                const filterId = brand.filterTarget || brand.name;

                return (
                  <div
                    key={brand.id || brand.slug}
                    onClick={() => handleCardClick(filterId)}
                    className="glass-card"
                    style={{
                      position: 'relative',
                      minHeight: '410px',
                      cursor: 'pointer',
                      borderRadius: '8px',
                      overflow: 'hidden',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'flex-end',
                      padding: '1.75rem',
                      border: '1px solid rgba(0, 0, 0, 0.12)',
                      boxShadow: '0 8px 24px rgba(15, 23, 42, 0.08)'
                    }}
                  >
                    {/* Background Watch Photo */}
                    <div
                      style={{
                        position: 'absolute',
                        inset: 0,
                        backgroundImage: `url(${bgImage})`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        transition: 'transform 0.7s cubic-bezier(0.16, 1, 0.3, 1)',
                        filter: 'brightness(0.72) contrast(1.05)'
                      }}
                      className="collection-img-zoom"
                    />

                    {/* Rich Gradient Vignette Overlay for High Legibility */}
                    <div
                      style={{
                        position: 'absolute',
                        inset: 0,
                        background: 'linear-gradient(to top, rgba(7, 9, 15, 0.95) 0%, rgba(7, 9, 15, 0.6) 55%, rgba(7, 9, 15, 0.25) 100%)'
                      }}
                    />

                    {/* Top Brand Crest / Provenance Badge */}
                    <div style={{
                      position: 'absolute',
                      top: '1.25rem',
                      left: '1.25rem',
                      right: '1.25rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      zIndex: 2
                    }}>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        background: 'rgba(0, 0, 0, 0.6)',
                        backdropFilter: 'blur(8px)',
                        padding: '0.35rem 0.75rem',
                        borderRadius: '4px',
                        border: '1px solid rgba(212, 175, 55, 0.3)'
                      }}>
                        <span style={{
                          fontSize: '0.68rem',
                          fontWeight: 700,
                          letterSpacing: '0.12em',
                          color: '#f3e5ab',
                          textTransform: 'uppercase'
                        }}>
                          {brand.name}
                        </span>
                      </div>

                      <span className="badge-luxury badge-gold" style={{
                        fontSize: '0.62rem',
                        padding: '0.25rem 0.55rem',
                        backgroundColor: 'rgba(0,0,0,0.6)'
                      }}>
                        {badgeText}
                      </span>
                    </div>

                    {/* Bottom Card Content */}
                    <div style={{ position: 'relative', zIndex: 2 }}>
                      <div style={{
                        fontSize: '0.68rem',
                        color: '#cbd5e1',
                        letterSpacing: '0.08em',
                        marginBottom: '0.3rem',
                        fontWeight: 500
                      }}>
                        {originText}
                      </div>

                      <h3 style={{
                        fontSize: '1.3rem',
                        color: '#ffffff',
                        marginBottom: '0.45rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        fontWeight: 700,
                        lineHeight: 1.25
                      }}>
                        <span>{brand.name}</span>
                        <div style={{
                          width: '32px',
                          height: '32px',
                          borderRadius: '50%',
                          backgroundColor: 'rgba(212, 175, 55, 0.15)',
                          border: '1px solid rgba(212, 175, 55, 0.4)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0
                        }}>
                          <ArrowUpRight size={16} style={{ color: '#d4af37' }} />
                        </div>
                      </h3>

                      {modelText && (
                        <div style={{
                          fontSize: '0.82rem',
                          color: '#f3e5ab',
                          fontWeight: 600,
                          marginBottom: '0.45rem'
                        }}>
                          {modelText}
                        </div>
                      )}

                      {descText && (
                        <p style={{
                          fontSize: '0.78rem',
                          color: '#94a3b8',
                          lineHeight: 1.45,
                          fontWeight: 300,
                          marginBottom: '1rem'
                        }}>
                          {descText}
                        </p>
                      )}

                      <div style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.4rem',
                        fontSize: '0.72rem',
                        color: '#d4af37',
                        fontWeight: 700,
                        letterSpacing: '0.08em',
                        textTransform: 'uppercase'
                      }}>
                        <span>Explore {brand.name} Collection</span>
                        <span>→</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )
        )}

        {/* View Mode 2: Curated Horology Complications Grid */}
        {viewMode === 'complications' && (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '1.75rem'
          }}>
            {horologyComplications.map((col, idx) => (
              <div
                key={idx}
                onClick={() => handleCardClick(col.category)}
                className="glass-card"
                style={{
                  position: 'relative',
                  minHeight: '410px',
                  cursor: 'pointer',
                  borderRadius: '8px',
                  overflow: 'hidden',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'flex-end',
                  padding: '2rem',
                  border: '1px solid rgba(0, 0, 0, 0.12)',
                  boxShadow: '0 8px 24px rgba(15, 23, 42, 0.08)'
                }}
              >
                {/* Background Watch Image */}
                <div
                  style={{
                    position: 'absolute',
                    inset: 0,
                    backgroundImage: `url(${col.image})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    transition: 'transform 0.7s cubic-bezier(0.16, 1, 0.3, 1)',
                    filter: 'brightness(0.72) contrast(1.05)'
                  }}
                  className="collection-img-zoom"
                />

                {/* Gradient Vignette Overlay */}
                <div
                  style={{
                    position: 'absolute',
                    inset: 0,
                    background: 'linear-gradient(to top, rgba(7, 9, 15, 0.95) 0%, rgba(7, 9, 15, 0.55) 50%, rgba(7, 9, 15, 0.25) 100%)'
                  }}
                />

                {/* Card Content */}
                <div style={{ position: 'relative', zIndex: 2 }}>
                  <span className="badge-luxury badge-gold" style={{
                    fontSize: '0.62rem',
                    padding: '0.25rem 0.6rem',
                    marginBottom: '0.75rem',
                    display: 'inline-block'
                  }}>
                    {col.tag}
                  </span>

                  <h3 style={{
                    fontSize: '1.35rem',
                    color: '#ffffff',
                    marginBottom: '0.4rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    fontWeight: 700
                  }}>
                    <span>{col.title}</span>
                    <div style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '50%',
                      backgroundColor: 'rgba(212, 175, 55, 0.15)',
                      border: '1px solid rgba(212, 175, 55, 0.4)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0
                    }}>
                      <ArrowUpRight size={16} style={{ color: '#d4af37' }} />
                    </div>
                  </h3>

                  <div style={{
                    fontSize: '0.78rem',
                    color: '#f3e5ab',
                    fontWeight: 600,
                    marginBottom: '0.4rem'
                  }}>
                    {col.models}
                  </div>

                  <p style={{
                    fontSize: '0.78rem',
                    color: '#cbd5e1',
                    lineHeight: 1.45,
                    marginBottom: '1rem'
                  }}>
                    {col.subtitle}
                  </p>

                  <div style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    fontSize: '0.72rem',
                    color: '#d4af37',
                    fontWeight: 700,
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase'
                  }}>
                    <span>Filter Portfolio</span>
                    <span>→</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default CollectionGrid;

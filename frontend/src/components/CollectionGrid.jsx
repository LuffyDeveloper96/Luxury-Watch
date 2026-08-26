import React, { useState } from 'react';
import { ArrowUpRight, Sparkles, Award, ShieldCheck, Gem, Layers, CheckCircle2 } from 'lucide-react';

export const CollectionGrid = ({ onSelectCategory }) => {
  const [viewMode, setViewMode] = useState('brands'); // 'brands' | 'complications'

  // Top Iconic Brands with Authentic Models & Local Watch Images in Sequence
  const luxuryBrands = [
    {
      id: 'rolex',
      name: 'ROLEX',
      subname: 'GENÈVE',
      model: 'Submariner & Daytona Panda',
      origin: 'Geneva, Switzerland • Est. 1905',
      subtitle: 'Legendary 904L Oystersteel architecture with Cerachrom ceramic bezel & Superlative Chronometer',
      image: '/images/watches/rolex_submariner.jpg',
      tag: 'OFFICIAL ICON',
      filterTarget: 'Rolex',
      accentColor: '#006039',
      badgeClass: 'badge-gold'
    },
    {
      id: 'titan',
      name: 'TITAN',
      subname: 'HOROLOGY',
      model: 'Grandmaster Automatic & Edge Ceramic',
      origin: 'Hosur, India • Est. 1984',
      subtitle: 'Open-heart exhibition mechanical calibres, 3.8mm ultra-slim ceramic and Swarovski Raga collection',
      image: '/images/watches/titan_grandmaster.jpg',
      tag: 'INDIAN ICON',
      filterTarget: 'Titan',
      accentColor: '#8a6709',
      badgeClass: 'badge-gold'
    },
    {
      id: 'casio',
      name: 'CASIO',
      subname: 'JAPAN',
      model: "G-Shock 'CasiOak' & Edifice Solar",
      origin: 'Tokyo, Japan • Est. 1946',
      subtitle: 'Indestructible 200M Carbon Core Guard steel, solar sapphire chronograph & iconic 1980s retro digital',
      image: '/images/watches/casio_gshock.jpg',
      tag: 'TOUGH PRECISION',
      filterTarget: 'Casio',
      accentColor: '#1e293b',
      badgeClass: 'badge-gold'
    },
    {
      id: 'fastrack',
      name: 'FASTRACK',
      subname: 'STREETWEAR',
      model: 'Stunners Chrono & Reflex AMOLED',
      origin: 'Bangalore, India • Est. 1998',
      subtitle: 'Edgy youth expression, bold multi-function sub-dials, curved AMOLED smartwatches & sport bands',
      image: '/images/watches/fastrack_stunners.jpg',
      tag: 'YOUTH ICON',
      filterTarget: 'Fastrack',
      accentColor: '#e11d48',
      badgeClass: 'badge-gold'
    },
    {
      id: 'fossil',
      name: 'FOSSIL',
      subname: 'VINTAGE USA',
      model: 'Townsman Skeleton & Grant Chrono',
      origin: 'Texas, USA • Est. 1984',
      subtitle: 'Exhibition mechanical gear trains, amber crystal accents, Roman numerals & saddle brown leather',
      image: '/images/watches/fossil_townsman.jpg',
      tag: 'VINTAGE AMERICANA',
      filterTarget: 'Fossil',
      accentColor: '#78350f',
      badgeClass: 'badge-gold'
    },
    {
      id: 'timex',
      name: 'TIMEX',
      subname: 'USA 1854',
      model: 'Q Reissue 1979 Diver & Marlin',
      origin: 'Connecticut, USA • Est. 1854',
      subtitle: 'Legendary 1979 diver reissue with rotating Pepsi bezel, woven steel mesh & 21-jewel automatic Marlin',
      image: '/images/watches/timex_q.jpg',
      tag: 'HERITAGE 1854',
      filterTarget: 'Timex',
      accentColor: '#0369a1',
      badgeClass: 'badge-gold'
    },
    {
      id: 'sonata',
      name: 'SONATA',
      subname: 'TATA GROUP',
      model: 'Poze Dual Tone & Utsav Wedding',
      origin: 'Tata Group, India • Est. 1997',
      subtitle: 'Fluted gold bezels, champagne sunray dials, day-date calendar and traditional carved filigree jewellery',
      image: '/images/watches/sonata_poze.jpg',
      tag: 'TATA TRUST',
      filterTarget: 'Sonata',
      accentColor: '#b45309',
      badgeClass: 'badge-gold'
    },
    {
      id: 'guess',
      name: 'GUESS',
      subname: 'LOS ANGELES',
      model: 'Frontier Pavé Crystal & Phoenix',
      origin: 'Los Angeles, USA • Est. 1981',
      subtitle: 'Dazzling hundreds of iced-out pavé crystals, gold multifunction dials & curved tonneau barrel skeletons',
      image: '/images/watches/guess_frontier.jpg',
      tag: 'RUNWAY GLAMOUR',
      filterTarget: 'Guess',
      accentColor: '#4c1d95',
      badgeClass: 'badge-gold'
    },
    {
      id: 'limestone',
      name: 'LIMESTONE',
      subname: 'MINIMALIST',
      model: 'Diamond-Cut Glass & Chrono Look',
      origin: 'New Delhi, India • Est. 2018',
      subtitle: 'Prismatic faceted 3D geometric glass, magnetic Milanese mesh straps & emerald sunburst business dials',
      image: '/images/watches/limestone_diamond.jpg',
      tag: 'CONTEMPORARY',
      filterTarget: 'Limestone',
      accentColor: '#0f172a',
      badgeClass: 'badge-gold'
    },
    {
      id: 'noise',
      name: 'NOISE',
      subname: 'SMART TECH',
      model: 'ColorFit Pro 5 Max & Diva Diamond',
      origin: 'Gurugram, India • Est. 2014',
      subtitle: '1.96-inch HD AMOLED displays, metallic chassis, Bluetooth calling, diamond-cut bezels & metal mesh',
      image: '/images/watches/noise_colorfit.jpg',
      tag: 'SMART WEARABLE',
      filterTarget: 'Noise',
      accentColor: '#0284c7',
      badgeClass: 'badge-gold'
    }
  ];

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
      title: "Skeleton Automatics & Tourbillons",
      category: "Skeletons",
      subtitle: "Openworked architectural gear trains, sapphire bridges & flying tourbillons",
      image: "/images/watches/patek_tourbillon.jpg",
      tag: "AVANT-GARDE",
      models: "Grand Complications, Royal Oak Concept"
    },
    {
      title: "Celestial Diamond Editions",
      category: "Diamond Editions",
      subtitle: "Natural brilliant-cut diamonds, Roman opaline dials & precious metal bezels",
      image: "/images/watches/cartier_santos.jpg",
      tag: "HIGH JEWELLERY",
      models: "Santos de Cartier, Diamond Nautilus"
    },
    {
      title: "Abyss Diver & Heritage Sport",
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
              <span>LUXURY WATCH BRANDS (8)</span>
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
              <span>HOROLOGY COMPLICATIONS (4)</span>
            </button>
          </div>
        </div>

        {/* View Mode 1: Iconic Luxury Watch Brands Grid */}
        {viewMode === 'brands' && (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 260px), 1fr))',
            gap: '1.25rem',
            width: '100%'
          }}>
            {luxuryBrands.map((brand) => (
              <div
                key={brand.id}
                onClick={() => handleCardClick(brand.filterTarget)}
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
                    backgroundImage: `url(${brand.image})`,
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
                    {brand.logoSvg}
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
                    {brand.tag}
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
                    {brand.origin}
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

                  <div style={{
                    fontSize: '0.82rem',
                    color: '#f3e5ab',
                    fontWeight: 600,
                    marginBottom: '0.45rem'
                  }}>
                    {brand.model}
                  </div>

                  <p style={{
                    fontSize: '0.78rem',
                    color: '#94a3b8',
                    lineHeight: 1.45,
                    fontWeight: 300,
                    marginBottom: '1rem'
                  }}>
                    {brand.subtitle}
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
                    <span>Explore {brand.name} Collection</span>
                    <span>→</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
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
                    marginBottom: '0.85rem',
                    backgroundColor: 'rgba(0,0,0,0.6)'
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
                    <ArrowUpRight size={18} style={{ color: '#d4af37' }} />
                  </h3>

                  <div style={{
                    fontSize: '0.78rem',
                    color: '#f3e5ab',
                    fontWeight: 600,
                    marginBottom: '0.45rem'
                  }}>
                    Featuring: {col.models}
                  </div>

                  <p style={{
                    fontSize: '0.8rem',
                    color: '#94a3b8',
                    lineHeight: 1.5,
                    fontWeight: 300,
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
                    <span>View {col.category}</span>
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

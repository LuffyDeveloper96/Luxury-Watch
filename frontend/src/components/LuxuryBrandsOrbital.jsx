import React, { useState, useEffect, useRef } from 'react';
import { Sparkles, Compass, ShieldCheck, Award, Eye, Pause, Play, RotateCw } from 'lucide-react';

// Authentic Luxury Watch Brands with SVGs and Heritage Details
export const LUXURY_BRANDS = [
  {
    id: 'rolex',
    name: 'ROLEX',
    origin: 'Geneva, Switzerland',
    founded: '1905',
    tagline: 'A Crown for Every Achievement',
    hallmark: 'Oyster Perpetual & Cosmograph Daytona',
    color: '#006039',
    goldAccent: '#d4af37',
    logoSvg: (
      <svg viewBox="0 0 100 70" width="46" height="32" fill="currentColor">
        {/* Rolex 5-Point Crown */}
        <path d="M50 8 L57 32 L78 16 L70 42 L88 34 L77 56 L23 56 L12 34 L30 42 L22 16 L43 32 Z" fill="#d4af37" />
        <circle cx="50" cy="7" r="4.5" fill="#f3e5ab" />
        <circle cx="78" cy="15" r="4" fill="#f3e5ab" />
        <circle cx="22" cy="15" r="4" fill="#f3e5ab" />
        <circle cx="88" cy="33" r="3.5" fill="#f3e5ab" />
        <circle cx="12" cy="33" r="3.5" fill="#f3e5ab" />
        <rect x="23" y="58" width="54" height="6" rx="2" fill="#d4af37" />
      </svg>
    )
  },
  {
    id: 'patek',
    name: 'PATEK PHILIPPE',
    subname: 'GENÈVE',
    origin: 'Geneva, Switzerland',
    founded: '1839',
    tagline: 'You never actually own a Patek Philippe',
    hallmark: 'Nautilus, Aquanaut & Grand Complications',
    color: '#3d2b1f',
    goldAccent: '#d4af37',
    logoSvg: (
      <svg viewBox="0 0 100 100" width="38" height="38" fill="currentColor">
        {/* Calatrava Cross */}
        <g fill="#d4af37">
          <path d="M50 10 C53 25 65 30 65 30 C65 30 60 42 50 42 C40 42 35 30 35 30 C35 30 47 25 50 10 Z" />
          <path d="M50 90 C53 75 65 70 65 70 C65 70 60 58 50 58 C40 58 35 70 35 70 C35 70 47 75 50 90 Z" />
          <path d="M10 50 C25 53 30 65 30 65 C30 65 42 60 42 50 C42 40 30 35 30 35 C30 35 25 47 10 50 Z" />
          <path d="M90 50 C75 53 70 65 70 65 C70 65 58 60 58 50 C58 40 70 35 70 35 C70 35 75 47 90 50 Z" />
          <circle cx="50" cy="50" r="7" fill="#f3e5ab" />
        </g>
      </svg>
    )
  },
  {
    id: 'ap',
    name: 'AUDEMARS PIGUET',
    subname: 'LE BRASSUS',
    origin: 'Le Brassus, Switzerland',
    founded: '1875',
    tagline: 'To Break the Rules, You Must First Master Them',
    hallmark: 'Royal Oak & Royal Oak Concept Tourbillon',
    color: '#1a2238',
    goldAccent: '#d4af37',
    logoSvg: (
      <svg viewBox="0 0 100 70" width="46" height="32">
        {/* AP Monogram */}
        <text x="35" y="48" fontFamily="serif" fontSize="46" fontWeight="bold" fill="#d4af37" textAnchor="middle">A</text>
        <text x="65" y="48" fontFamily="serif" fontSize="46" fontWeight="bold" fill="#f3e5ab" textAnchor="middle">P</text>
        <line x1="20" y1="58" x2="80" y2="58" stroke="#d4af37" strokeWidth="2" />
      </svg>
    )
  },
  {
    id: 'vacheron',
    name: 'VACHERON CONSTANTIN',
    subname: 'GENÈVE',
    origin: 'Geneva, Switzerland',
    founded: '1755',
    tagline: 'One of Not Many',
    hallmark: 'Overseas, Patrimony & Les Cabinotiers',
    color: '#2b1b17',
    goldAccent: '#d4af37',
    logoSvg: (
      <svg viewBox="0 0 100 100" width="38" height="38">
        {/* Maltese Cross */}
        <path d="M50 50 L20 15 L35 40 L15 20 L50 50 L85 20 L65 40 L80 15 L50 50 L80 85 L65 60 L85 80 L50 50 L15 80 L35 60 L20 85 Z" fill="#d4af37" />
        <circle cx="50" cy="50" r="5" fill="#f3e5ab" />
      </svg>
    )
  },
  {
    id: 'lange',
    name: 'A. LANGE & SÖHNE',
    subname: 'GLASHÜTTE I/SA',
    origin: 'Glashütte, Germany',
    founded: '1845',
    tagline: 'Never Stand Still',
    hallmark: 'Lange 1, Datograph & Zeitwerk',
    color: '#1a1c23',
    goldAccent: '#d4af37',
    logoSvg: (
      <svg viewBox="0 0 100 60" width="46" height="30">
        <path d="M15 35 Q50 10 85 35" stroke="#d4af37" strokeWidth="3" fill="none" />
        <circle cx="50" cy="22" r="6" fill="#d4af37" />
        <text x="50" y="48" fontFamily="serif" fontSize="13" fontWeight="bold" fill="#f8fafc" textAnchor="middle" letterSpacing="1">LANGE</text>
      </svg>
    )
  },
  {
    id: 'jlc',
    name: 'JAEGER-LECOULTRE',
    subname: 'VALLEE DE JOUX',
    origin: 'Le Sentier, Switzerland',
    founded: '1833',
    tagline: 'The Watchmaker of Watchmakers',
    hallmark: 'Reverso, Master Control & Gyrotourbillon',
    color: '#0f172a',
    goldAccent: '#d4af37',
    logoSvg: (
      <svg viewBox="0 0 100 80" width="42" height="34">
        {/* JL Shield Crest */}
        <ellipse cx="50" cy="40" rx="38" ry="32" stroke="#d4af37" strokeWidth="2.5" fill="none" />
        <path d="M38 25 L38 55 M62 25 L62 55 M38 55 Q50 62 62 55" stroke="#d4af37" strokeWidth="4" strokeLinecap="round" fill="none" />
        <path d="M42 35 Q50 25 58 35 Q50 45 42 35" fill="#f3e5ab" />
      </svg>
    )
  },
  {
    id: 'cartier',
    name: 'CARTIER',
    subname: 'PARIS',
    origin: 'Paris, France',
    founded: '1847',
    tagline: 'The Jeweller of Kings and King of Jewellers',
    hallmark: 'Santos de Cartier, Tank Française & Ballon Bleu',
    color: '#4a0e17',
    goldAccent: '#d4af37',
    logoSvg: (
      <svg viewBox="0 0 100 60" width="46" height="30">
        {/* Cartier Interlocking CC */}
        <path d="M42 30 C30 18 30 42 42 30 Z" stroke="#d4af37" strokeWidth="3" fill="none" />
        <path d="M58 30 C70 18 70 42 58 30 Z" stroke="#d4af37" strokeWidth="3" fill="none" />
        <text x="50" y="52" fontFamily="serif" fontStyle="italic" fontSize="18" fontWeight="bold" fill="#f8fafc" textAnchor="middle">Cartier</text>
      </svg>
    )
  },
  {
    id: 'omega',
    name: 'OMEGA',
    subname: 'BIEL / BIENNE',
    origin: 'Biel/Bienne, Switzerland',
    founded: '1848',
    tagline: 'Exact Time for Life',
    hallmark: 'Speedmaster Moonwatch & Seamaster Diver 300M',
    color: '#8b0000',
    goldAccent: '#d4af37',
    logoSvg: (
      <svg viewBox="0 0 100 80" width="40" height="34">
        {/* Omega Greek Ω */}
        <path d="M26 62 L38 62 C40 45 44 26 50 26 C56 26 60 45 62 62 L74 62 M35 55 C28 48 24 38 24 28 C24 14 36 6 50 6 C64 6 76 14 76 28 C76 38 72 48 65 55" stroke="#d4af37" strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      </svg>
    )
  },
  {
    id: 'rm',
    name: 'RICHARD MILLE',
    subname: 'LES BREULEUX',
    origin: 'Les Breuleux, Switzerland',
    founded: '2001',
    tagline: 'A Racing Machine on the Wrist',
    hallmark: 'RM 011 Flyback Chronograph & RM 27-04 Tourbillon',
    color: '#18181b',
    goldAccent: '#d4af37',
    logoSvg: (
      <svg viewBox="0 0 100 70" width="44" height="32">
        {/* Richard Mille Tonneau Crest */}
        <path d="M30 10 Q50 6 70 10 Q78 35 70 60 Q50 64 30 60 Q22 35 30 10 Z" stroke="#d4af37" strokeWidth="3" fill="none" />
        <text x="50" y="44" fontFamily="monospace" fontSize="22" fontWeight="900" fill="#f8fafc" textAnchor="middle" letterSpacing="1">RM</text>
      </svg>
    )
  },
  {
    id: 'breitling',
    name: 'BREITLING',
    subname: '1884',
    origin: 'Grenchen, Switzerland',
    founded: '1884',
    tagline: 'Squad on a Mission',
    hallmark: 'Navitimer B01, Chronomat & Superocean',
    color: '#0a192f',
    goldAccent: '#d4af37',
    logoSvg: (
      <svg viewBox="0 0 100 60" width="48" height="30">
        {/* Breitling Winged Script B */}
        <path d="M15 30 Q32 15 50 30 Q68 15 85 30 Q68 40 50 30 Q32 40 15 30 Z" fill="#d4af37" opacity="0.4" />
        <path d="M44 14 L44 48 Q54 48 54 36 Q54 26 44 26 Q52 26 52 14 Z" fill="#d4af37" />
        <line x1="50" y1="8" x2="50" y2="52" stroke="#f3e5ab" strokeWidth="2.5" />
      </svg>
    )
  },
  {
    id: 'iwc',
    name: 'IWC SCHAFFHAUSEN',
    subname: 'SWITZERLAND',
    origin: 'Schaffhausen, Switzerland',
    founded: '1868',
    tagline: 'Probus Scafusia (Craftsmanship from Schaffhausen)',
    hallmark: 'Portugieser Perpetual Calendar & Big Pilot',
    color: '#111827',
    goldAccent: '#d4af37',
    logoSvg: (
      <svg viewBox="0 0 100 50" width="50" height="26">
        <text x="50" y="34" fontFamily="serif" fontSize="32" fontWeight="800" fill="#d4af37" letterSpacing="2" textAnchor="middle">IWC</text>
        <line x1="15" y1="44" x2="85" y2="44" stroke="#d4af37" strokeWidth="1" />
      </svg>
    )
  },
  {
    id: 'tagheuer',
    name: 'TAG HEUER',
    subname: 'SWISS AVANT-GARDE',
    origin: 'La Chaux-de-Fonds, Switzerland',
    founded: '1860',
    tagline: "Don't Crack Under Pressure",
    hallmark: 'Monaco Calibre 11 & Carrera Chronograph',
    color: '#1f2937',
    goldAccent: '#d4af37',
    logoSvg: (
      <svg viewBox="0 0 100 80" width="40" height="34">
        {/* TAG Heuer Shield */}
        <polygon points="50,6 88,26 76,74 50,84 24,74 12,26" stroke="#d4af37" strokeWidth="3" fill="#111827" />
        <line x1="16" y1="42" x2="84" y2="42" stroke="#d4af37" strokeWidth="2.5" />
        <text x="50" y="32" fontFamily="sans-serif" fontSize="16" fontWeight="bold" fill="#d4af37" textAnchor="middle">TAG</text>
        <text x="50" y="64" fontFamily="sans-serif" fontSize="13" fontWeight="bold" fill="#f8fafc" textAnchor="middle">HEUER</text>
      </svg>
    )
  },
  {
    id: 'panerai',
    name: 'PANERAI',
    subname: 'FIRENZE 1860',
    origin: 'Florence, Italy & Neuchâtel, Switzerland',
    founded: '1860',
    tagline: 'Laboratorio di Idee',
    hallmark: 'Luminor Marina & Radiomir 8 Days',
    color: '#064e3b',
    goldAccent: '#d4af37',
    logoSvg: (
      <svg viewBox="0 0 100 70" width="46" height="32">
        {/* OP Double Arrows */}
        <circle cx="50" cy="35" r="28" stroke="#d4af37" strokeWidth="2.5" fill="none" />
        <path d="M42 22 L50 14 L58 22 M50 14 L50 56 M42 48 L50 56 L58 48" stroke="#d4af37" strokeWidth="3" strokeLinecap="round" />
        <circle cx="50" cy="35" r="4" fill="#f3e5ab" />
      </svg>
    )
  },
  {
    id: 'hublot',
    name: 'HUBLOT',
    subname: 'GENÈVE',
    origin: 'Nyon, Switzerland',
    founded: '1980',
    tagline: 'The Art of Fusion',
    hallmark: 'Big Bang Unico & Classic Fusion Tourbillon',
    color: '#09090b',
    goldAccent: '#d4af37',
    logoSvg: (
      <svg viewBox="0 0 100 80" width="40" height="34">
        {/* Hublot H Porthole */}
        <circle cx="50" cy="40" r="32" stroke="#d4af37" strokeWidth="3.5" fill="none" />
        <path d="M36 24 L36 56 M64 24 L64 56 M36 40 L64 40" stroke="#d4af37" strokeWidth="4.5" strokeLinecap="square" />
        <circle cx="50" cy="12" r="2.5" fill="#f3e5ab" />
        <circle cx="50" cy="68" r="2.5" fill="#f3e5ab" />
        <circle cx="22" cy="40" r="2.5" fill="#f3e5ab" />
        <circle cx="78" cy="40" r="2.5" fill="#f3e5ab" />
      </svg>
    )
  },
  {
    id: 'blancpain',
    name: 'BLANCPAIN',
    subname: 'MANUFACTURE DE HAUTE HORLOGERIE',
    origin: 'Paudex / Le Brassus, Switzerland',
    founded: '1735',
    tagline: 'Since 1735, there has never been a quartz Blancpain watch',
    hallmark: 'Fifty Fathoms & Villeret Quantième Complet',
    color: '#1e1b4b',
    goldAccent: '#d4af37',
    logoSvg: (
      <svg viewBox="0 0 100 65" width="46" height="30">
        <text x="50" y="32" fontFamily="serif" fontSize="15" fontWeight="bold" fill="#d4af37" textAnchor="middle" letterSpacing="1">BLANCPAIN</text>
        <text x="50" y="48" fontFamily="serif" fontSize="10" fill="#94a3b8" textAnchor="middle">JB 1735</text>
        <line x1="20" y1="56" x2="80" y2="56" stroke="#d4af37" strokeWidth="1" />
      </svg>
    )
  },
  {
    id: 'chopard',
    name: 'CHOPARD',
    subname: 'GENÈVE',
    origin: 'Geneva, Switzerland',
    founded: '1860',
    tagline: 'The Artisan of Emotions',
    hallmark: 'L.U.C Quattro, Alpine Eagle & Mille Miglia',
    color: '#3b0764',
    goldAccent: '#d4af37',
    logoSvg: (
      <svg viewBox="0 0 100 60" width="46" height="30">
        <path d="M25 40 Q40 15 55 40 Q70 15 85 40" stroke="#d4af37" strokeWidth="2.5" fill="none" />
        <text x="50" y="48" fontFamily="serif" fontStyle="italic" fontSize="17" fontWeight="bold" fill="#f3e5ab" textAnchor="middle">Chopard</text>
      </svg>
    )
  }
];

export const LuxuryBrandsOrbital = ({ onSelectBrand }) => {
  const [rotationAngle, setRotationAngle] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [speedMultiplier, setSpeedMultiplier] = useState(1);
  const [activeBrand, setActiveBrand] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const dragStartX = useRef(0);
  const dragStartAngle = useRef(0);
  const requestRef = useRef();

  // Animation Loop for Endless Smooth Circular Orbiting
  useEffect(() => {
    let lastTime = performance.now();

    const animateOrbit = (time) => {
      const delta = (time - lastTime) / 1000;
      lastTime = time;

      if (isPlaying && !isDragging) {
        // Continuous smooth 360 degree rotation (approx 35s per full revolution)
        const speed = (360 / 32) * speedMultiplier;
        setRotationAngle(prev => (prev + speed * delta) % 360);
      }

      requestRef.current = requestAnimationFrame(animateOrbit);
    };

    requestRef.current = requestAnimationFrame(animateOrbit);
    return () => cancelAnimationFrame(requestRef.current);
  }, [isPlaying, speedMultiplier, isDragging]);

  // Touch / Drag to manual spin
  const handleMouseDown = (e) => {
    setIsDragging(true);
    dragStartX.current = e.clientX || (e.touches && e.touches[0].clientX) || 0;
    dragStartAngle.current = rotationAngle;
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    const clientX = e.clientX || (e.touches && e.touches[0].clientX) || 0;
    const diffX = clientX - dragStartX.current;
    setRotationAngle((dragStartAngle.current + diffX * 0.4 + 360) % 360);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const totalBrands = LUXURY_BRANDS.length;
  // Radius for the orbital circle
  const radiusX = 320; // horizontal ellipse radius
  const radiusY = 135; // perspective height radius

  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        margin: '2.5rem 0 1.5rem',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center'
      }}
      onMouseUp={handleMouseUp}
      onTouchEnd={handleMouseUp}
    >
      {/* Section Sub-header */}
      <div style={{ textAlign: 'center', marginBottom: '1.25rem', zIndex: 10 }}>
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.5rem',
          padding: '0.3rem 0.9rem',
          background: 'rgba(212, 175, 55, 0.08)',
          border: '1px solid rgba(212, 175, 55, 0.25)',
          borderRadius: '50px',
          fontSize: '0.68rem',
          color: '#f3e5ab',
          letterSpacing: '0.2em',
          textTransform: 'uppercase',
          fontWeight: 600,
          boxShadow: '0 4px 15px rgba(0,0,0,0.5)'
        }}>
          <Sparkles size={12} color="#d4af37" />
          <span>HAUTE HORLOGERIE ATELIER ORBITAL</span>
          <span className="live-pulse" style={{ width: '5px', height: '5px' }}></span>
        </div>
        <h3 style={{
          fontSize: 'clamp(1.15rem, 2.5vw, 1.6rem)',
          fontFamily: 'var(--font-brand)',
          color: '#ffffff',
          letterSpacing: '0.08em',
          marginTop: '0.4rem'
        }}>
          ICONS OF THE HOROLOGICAL UNIVERSE
        </h3>
        <p style={{ fontSize: '0.75rem', color: '#94a3b8', maxWidth: '520px', margin: '0 auto' }}>
          Continuous 360° circular showcase of world-renowned Swiss & bespoke watchmakers.
        </p>
      </div>

      {/* 3D Circular Orbit Arena */}
      <div
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onTouchStart={handleMouseDown}
        onTouchMove={handleMouseMove}
        style={{
          position: 'relative',
          width: '100%',
          maxWidth: '850px',
          height: '380px',
          perspective: '1200px',
          cursor: isDragging ? 'grabbing' : 'grab',
          userSelect: 'none',
          touchAction: 'pan-y'
        }}
      >
        {/* Orbital Track Visual Ring 1 (Main Gold Dashed Orbit) */}
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          width: `${radiusX * 2}px`,
          height: `${radiusY * 2}px`,
          transform: 'translate(-50%, -50%)',
          borderRadius: '50%',
          border: '1.5px dashed rgba(212, 175, 55, 0.35)',
          boxShadow: '0 0 45px rgba(212, 175, 55, 0.12), inset 0 0 45px rgba(212, 175, 55, 0.08)',
          pointerEvents: 'none'
        }} />

        {/* Orbital Track Visual Ring 2 (Inner Fine Ring) */}
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          width: `${radiusX * 1.5}px`,
          height: `${radiusY * 1.5}px`,
          transform: 'translate(-50%, -50%)',
          borderRadius: '50%',
          border: '1px solid rgba(255, 255, 255, 0.06)',
          pointerEvents: 'none'
        }} />

        {/* Center Tourbillon Gyroscope Hub */}
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '130px',
            height: '130px',
            borderRadius: '50%',
            background: 'radial-gradient(circle at 35% 35%, #242936 0%, #0d0f14 75%, #050608 100%)',
            border: '2px solid rgba(212, 175, 55, 0.6)',
            boxShadow: '0 0 50px rgba(212, 175, 55, 0.35), inset 0 0 25px rgba(0,0,0,0.9)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center',
            padding: '0.5rem',
            zIndex: 5,
            pointerEvents: 'auto'
          }}
        >
          {/* Rotating Escapement Gear Graphic in Core */}
          <div style={{
            position: 'absolute',
            inset: '8px',
            borderRadius: '50%',
            border: '1px dashed rgba(212, 175, 55, 0.4)',
            animation: 'rotateSubtle 20s linear infinite',
            pointerEvents: 'none'
          }} />

          <Award size={26} color="#d4af37" style={{ marginBottom: '2px', filter: 'drop-shadow(0 0 8px rgba(212, 175, 55, 0.6))' }} />
          <span style={{
            fontFamily: 'var(--font-brand)',
            fontSize: '0.68rem',
            fontWeight: 800,
            color: '#f8fafc',
            letterSpacing: '0.15em',
            textTransform: 'uppercase',
            lineHeight: 1.1
          }}>
            GENEVA
          </span>
          <span style={{
            fontSize: '0.52rem',
            color: '#d4af37',
            letterSpacing: '0.25em',
            textTransform: 'uppercase',
            fontWeight: 600,
            marginTop: '2px'
          }}>
            HOROLOGY HUB
          </span>
        </div>

        {/* Orbiting Brand Nodes in 360° Circular Motion */}
        {LUXURY_BRANDS.map((brand, index) => {
          const stepAngle = (360 / totalBrands) * index;
          const currentRad = ((rotationAngle + stepAngle) * Math.PI) / 180;

          // Polar coordinates in 2.5D space
          const posX = radiusX * Math.cos(currentRad);
          const posY = radiusY * Math.sin(currentRad);

          // Perspective depth calculation: front items (sin > 0) are closer, larger and brighter
          const depthFactor = (Math.sin(currentRad) + 1) / 2; // Range 0 (back) to 1 (front)
          const scale = 0.72 + depthFactor * 0.42; // scale 0.72 -> 1.14
          const opacity = 0.55 + depthFactor * 0.45; // opacity 0.55 -> 1.0
          const zIndex = Math.round(depthFactor * 100) + 10;
          const isFront = depthFactor > 0.65;

          const isHovered = activeBrand?.id === brand.id;

          return (
            <div
              key={brand.id}
              onClick={(e) => {
                e.stopPropagation();
                setActiveBrand(brand);
                if (onSelectBrand) onSelectBrand(brand);
              }}
              onMouseEnter={() => setActiveBrand(brand)}
              style={{
                position: 'absolute',
                top: `calc(50% + ${posY}px)`,
                left: `calc(50% + ${posX}px)`,
                transform: `translate(-50%, -50%) scale(${isHovered ? scale * 1.15 : scale})`,
                opacity: isHovered ? 1 : opacity,
                zIndex: isHovered ? 200 : zIndex,
                transition: isDragging ? 'none' : 'transform 0.15s ease, opacity 0.2s ease',
                cursor: 'pointer'
              }}
            >
              {/* Brand Emblem Capsule */}
              <div
                style={{
                  background: isHovered
                    ? 'linear-gradient(135deg, rgba(30, 35, 48, 0.98) 0%, rgba(12, 14, 20, 0.98) 100%)'
                    : 'linear-gradient(135deg, rgba(20, 24, 32, 0.92) 0%, rgba(9, 10, 15, 0.95) 100%)',
                  border: isHovered
                    ? '1.5px solid #d4af37'
                    : isFront
                    ? '1px solid rgba(212, 175, 55, 0.45)'
                    : '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '8px',
                  padding: '0.6rem 0.85rem',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  minWidth: '105px',
                  boxShadow: isHovered
                    ? '0 12px 30px rgba(212, 175, 55, 0.4), 0 0 20px rgba(0,0,0,0.9)'
                    : isFront
                    ? '0 8px 24px rgba(0, 0, 0, 0.8), 0 0 15px rgba(212, 175, 55, 0.15)'
                    : '0 4px 12px rgba(0, 0, 0, 0.6)',
                  backdropFilter: 'blur(8px)',
                  WebkitBackdropFilter: 'blur(8px)'
                }}
              >
                {/* Brand Logo Graphic */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  height: '32px',
                  color: isHovered ? '#f3e5ab' : '#d4af37',
                  filter: isHovered ? 'drop-shadow(0 0 6px rgba(212, 175, 55, 0.6))' : 'none'
                }}>
                  {brand.logoSvg}
                </div>

                {/* Brand Name Typography */}
                <span style={{
                  fontFamily: 'var(--font-brand)',
                  fontSize: '0.68rem',
                  fontWeight: 700,
                  color: isHovered ? '#f8fafc' : isFront ? '#f1f5f9' : '#cbd5e1',
                  letterSpacing: '0.12em',
                  textAlign: 'center',
                  marginTop: '4px',
                  whiteSpace: 'nowrap'
                }}>
                  {brand.name}
                </span>

                {/* Founded Badge */}
                <span style={{
                  fontSize: '0.52rem',
                  color: '#d4af37',
                  letterSpacing: '0.15em',
                  textTransform: 'uppercase',
                  fontWeight: 500
                }}>
                  EST. {brand.founded}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Interactive Orbit Control Bar */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '0.75rem',
        marginTop: '0.5rem',
        zIndex: 10
      }}>
        <button
          onClick={() => setIsPlaying(!isPlaying)}
          className="btn-dark"
          style={{
            padding: '0.35rem 0.75rem',
            fontSize: '0.72rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.35rem'
          }}
          title={isPlaying ? 'Pause Continuous Orbit' : 'Resume Continuous Orbit'}
        >
          {isPlaying ? <Pause size={12} color="#d4af37" /> : <Play size={12} color="#d4af37" />}
          <span>{isPlaying ? 'PAUSE ORBIT' : 'RESUME ORBIT'}</span>
        </button>

        <button
          onClick={() => setSpeedMultiplier(prev => (prev === 1 ? 2 : prev === 2 ? 0.5 : 1))}
          className="btn-dark"
          style={{
            padding: '0.35rem 0.75rem',
            fontSize: '0.72rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.35rem'
          }}
          title="Toggle Rotation Velocity"
        >
          <RotateCw size={12} color="#d4af37" />
          <span>SPEED: {speedMultiplier}x</span>
        </button>
      </div>

      {/* Active Brand Dossier Overlay (When clicked or hovered) */}
      {activeBrand && (
        <div
          className="glass-panel animate-fade-in"
          style={{
            marginTop: '1.25rem',
            padding: '1rem 1.5rem',
            maxWidth: '680px',
            width: '92%',
            backgroundColor: 'rgba(15, 18, 25, 0.95)',
            border: '1px solid #d4af37',
            borderRadius: '6px',
            boxShadow: '0 15px 35px rgba(0,0,0,0.8)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '1rem',
            zIndex: 15
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: '6px',
              background: 'rgba(212, 175, 55, 0.12)',
              border: '1px solid rgba(212, 175, 55, 0.4)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}>
              {activeBrand.logoSvg}
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <h4 style={{ fontFamily: 'var(--font-brand)', fontSize: '1rem', color: '#f8fafc', fontWeight: 700 }}>
                  {activeBrand.name}
                </h4>
                <span style={{ fontSize: '0.65rem', background: 'rgba(212, 175, 55, 0.2)', color: '#f3e5ab', padding: '1px 6px', borderRadius: '3px' }}>
                  {activeBrand.origin}
                </span>
              </div>
              <p style={{ fontSize: '0.75rem', color: '#d4af37', fontStyle: 'italic', marginTop: '2px' }}>
                "{activeBrand.tagline}"
              </p>
              <span style={{ fontSize: '0.72rem', color: '#94a3b8', display: 'block', marginTop: '2px' }}>
                Signature: <strong>{activeBrand.hallmark}</strong>
              </span>
            </div>
          </div>

          <button
            onClick={() => {
              const el = document.getElementById('catalog-section');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            }}
            className="btn-gold"
            style={{ padding: '0.45rem 1rem', fontSize: '0.72rem' }}
          >
            <Eye size={12} />
            <span>EXPLORE CATALOG</span>
          </button>
        </div>
      )}

      {/* Infinite Continuous Brand Marquee Tape underneath */}
      <div style={{
        width: '100vw',
        position: 'relative',
        left: '50%',
        right: '50%',
        marginLeft: '-50vw',
        marginRight: '-50vw',
        marginTop: '2.5rem',
        overflow: 'hidden',
        background: 'linear-gradient(180deg, rgba(14, 16, 22, 0.9) 0%, rgba(8, 9, 13, 0.95) 100%)',
        borderTop: '1px solid rgba(212, 175, 55, 0.15)',
        borderBottom: '1px solid rgba(212, 175, 55, 0.15)',
        padding: '0.9rem 0'
      }}>
        <div style={{
          display: 'flex',
          gap: '3rem',
          width: 'max-content',
          animation: 'infiniteScroll 35s linear infinite'
        }}>
          {[...LUXURY_BRANDS, ...LUXURY_BRANDS].map((b, i) => (
            <div
              key={`${b.id}-${i}`}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                opacity: 0.85,
                transition: 'opacity 0.2s',
                cursor: 'pointer'
              }}
              onMouseEnter={(e) => e.currentTarget.style.opacity = 1}
              onMouseLeave={(e) => e.currentTarget.style.opacity = 0.85}
              onClick={() => setActiveBrand(b)}
            >
              <div style={{ height: '24px', display: 'flex', alignItems: 'center' }}>
                {b.logoSvg}
              </div>
              <span style={{
                fontFamily: 'var(--font-brand)',
                fontSize: '0.82rem',
                fontWeight: 700,
                color: '#f8fafc',
                letterSpacing: '0.15em'
              }}>
                {b.name}
              </span>
              <span style={{ color: '#d4af37', fontSize: '0.75rem' }}>•</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default LuxuryBrandsOrbital;

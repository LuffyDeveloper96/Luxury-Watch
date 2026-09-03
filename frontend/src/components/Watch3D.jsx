import React, { useState, useEffect, useRef, useCallback } from 'react';

/**
 * Premium 3D Luxury Watch Component
 * Aesthetic: Audemars Piguet Royal Oak / Rolex Submariner / Haute Horlogerie Skeleton
 * Features:
 * - Octagonal brushed steel bezel with 8 polished gold hexagonal bolts
 * - Multi-layered 3D depth with sapphire crystal glare sweep
 * - Working precision mechanical sweep with oscillating golden balance wheel & tourbillon cage
 * - Interactive 3D cursor parallax tilt & mobile touch drag
 * - Subtle ambient floating & realistic soft contact shadow
 * - Zero heavy dependencies, 60fps hardware-accelerated rendering
 */
export const Watch3D = ({ className = '', style = {} }) => {
  const containerRef = useRef(null);
  const [rotate, setRotate] = useState({ x: 0, y: 0 });
  const [targetRotate, setTargetRotate] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);
  const [isTouching, setIsTouching] = useState(false);
  const [time, setTime] = useState(new Date());
  const rafId = useRef(null);
  const touchStartRef = useRef({ x: 0, y: 0 });

  // Clock mechanism animation for real-time hands & balance oscillation
  useEffect(() => {
    let animId;
    const updateHands = () => {
      setTime(new Date());
      animId = requestAnimationFrame(updateHands);
    };
    animId = requestAnimationFrame(updateHands);
    return () => cancelAnimationFrame(animId);
  }, []);

  // Smooth lerp physics for 3D tilt
  useEffect(() => {
    let active = true;
    const lerp = (start, end, factor) => start + (end - start) * factor;

    const animateTilt = () => {
      if (!active) return;
      setRotate(prev => ({
        x: lerp(prev.x, targetRotate.x, 0.08),
        y: lerp(prev.y, targetRotate.y, 0.08)
      }));
      rafId.current = requestAnimationFrame(animateTilt);
    };

    rafId.current = requestAnimationFrame(animateTilt);
    return () => {
      active = false;
      if (rafId.current) cancelAnimationFrame(rafId.current);
    };
  }, [targetRotate]);

  // Handle Desktop Mouse Move Parallax
  const handleMouseMove = useCallback((e) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const mouseX = e.clientX - centerX;
    const mouseY = e.clientY - centerY;

    // Max tilt ~15 degrees for subtle, elegant luxury feel
    const tiltY = (mouseX / (rect.width / 2)) * 14;
    const tiltX = -(mouseY / (rect.height / 2)) * 14;

    setTargetRotate({ x: tiltX, y: tiltY });
  }, []);

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setTargetRotate({ x: 0, y: 0 });
  };

  // Handle Mobile Touch Interaction
  const handleTouchStart = (e) => {
    if (!e.touches[0]) return;
    setIsTouching(true);
    touchStartRef.current = {
      x: e.touches[0].clientX,
      y: e.touches[0].clientY
    };
  };

  const handleTouchMove = (e) => {
    if (!containerRef.current || !e.touches[0]) return;
    const deltaX = e.touches[0].clientX - touchStartRef.current.x;
    const deltaY = e.touches[0].clientY - touchStartRef.current.y;

    const tiltY = Math.max(-18, Math.min(18, deltaX * 0.15));
    const tiltX = Math.max(-18, Math.min(18, -deltaY * 0.15));

    setTargetRotate({ x: tiltX, y: tiltY });
  };

  const handleTouchEnd = () => {
    setIsTouching(false);
    setTargetRotate({ x: 0, y: 0 });
  };

  // Clock Hand Calculations
  const ms = time.getMilliseconds();
  const seconds = time.getSeconds() + ms / 1000;
  const minutes = time.getMinutes() + seconds / 60;
  const hours = (time.getHours() % 12) + minutes / 60;

  const secondAngle = seconds * 6; // 360 / 60
  const minuteAngle = minutes * 6; // 360 / 60
  const hourAngle = hours * 30; // 360 / 12

  // Specular sheen highlight calculation based on tilt
  const glareX = 50 + rotate.y * 2.2;
  const glareY = 40 + rotate.x * 2.2;

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      className={`luxury-3d-watch-wrapper ${className}`}
      style={{
        position: 'relative',
        width: '100%',
        maxWidth: '460px',
        aspectRatio: '1 / 1.15',
        margin: '0 auto',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        perspective: '1200px',
        touchAction: 'pan-y',
        userSelect: 'none',
        ...style
      }}
      aria-label="Interactive 3D Luxury Watch Showcase"
    >
      {/* Dynamic 3D Transform Root Container */}
      <div
        className="watch-3d-root"
        style={{
          position: 'relative',
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transformStyle: 'preserve-3d',
          transform: `rotateX(${rotate.x}deg) rotateY(${rotate.y}deg)`,
          transition: isHovered || isTouching ? 'none' : 'transform 0.8s cubic-bezier(0.16, 1, 0.3, 1)'
        }}
      >
        {/* Soft Ambient Contact Shadow */}
        <div
          style={{
            position: 'absolute',
            bottom: '4%',
            left: '50%',
            transform: 'translateX(-50%) translateZ(-40px)',
            width: '68%',
            height: '24px',
            borderRadius: '50%',
            background: 'radial-gradient(ellipse at center, rgba(15, 23, 42, 0.45) 0%, rgba(15, 23, 42, 0.15) 50%, transparent 80%)',
            filter: 'blur(10px)',
            pointerEvents: 'none',
            zIndex: 0
          }}
        />

        {/* Ambient Subtle Floating Wrapper */}
        <div
          className="watch-floating-assembly"
          style={{
            position: 'relative',
            width: '88%',
            height: '92%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transformStyle: 'preserve-3d',
            animation: 'watchSubtleFloat 6s ease-in-out infinite'
          }}
        >
          {/* Top Integrated Bracelet Segment */}
          <div
            style={{
              position: 'absolute',
              top: '2%',
              left: '50%',
              transform: 'translateX(-50%) translateZ(-12px)',
              width: '46%',
              height: '28%',
              background: 'linear-gradient(180deg, #1e293b 0%, #334155 40%, #0f172a 100%)',
              borderRadius: '8px 8px 0 0',
              border: '1px solid rgba(212, 175, 55, 0.4)',
              borderBottom: 'none',
              boxShadow: 'inset 0 4px 12px rgba(255, 255, 255, 0.15), 0 8px 20px rgba(0, 0, 0, 0.35)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-evenly',
              padding: '4px 0',
              overflow: 'hidden',
              zIndex: 1
            }}
          >
            {/* Center Gold Accent Links */}
            <div style={{ position: 'absolute', inset: '0 28%', background: 'linear-gradient(180deg, #d4af37 0%, #b8860b 50%, #996515 100%)', opacity: 0.85, boxShadow: 'inset 0 0 8px rgba(0,0,0,0.4)' }} />
            {/* Bracelet Link Grooves */}
            <div style={{ height: '2px', background: 'rgba(0,0,0,0.6)', width: '100%', zIndex: 2 }} />
            <div style={{ height: '2px', background: 'rgba(0,0,0,0.6)', width: '100%', zIndex: 2 }} />
            <div style={{ height: '2px', background: 'rgba(0,0,0,0.6)', width: '100%', zIndex: 2 }} />
          </div>

          {/* Bottom Integrated Bracelet Segment */}
          <div
            style={{
              position: 'absolute',
              bottom: '2%',
              left: '50%',
              transform: 'translateX(-50%) translateZ(-12px)',
              width: '46%',
              height: '28%',
              background: 'linear-gradient(0deg, #1e293b 0%, #334155 40%, #0f172a 100%)',
              borderRadius: '0 0 8px 8px',
              border: '1px solid rgba(212, 175, 55, 0.4)',
              borderTop: 'none',
              boxShadow: 'inset 0 -4px 12px rgba(255, 255, 255, 0.15), 0 8px 20px rgba(0, 0, 0, 0.35)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-evenly',
              padding: '4px 0',
              overflow: 'hidden',
              zIndex: 1
            }}
          >
            {/* Center Gold Accent Links */}
            <div style={{ position: 'absolute', inset: '0 28%', background: 'linear-gradient(0deg, #d4af37 0%, #b8860b 50%, #996515 100%)', opacity: 0.85, boxShadow: 'inset 0 0 8px rgba(0,0,0,0.4)' }} />
            {/* Bracelet Link Grooves */}
            <div style={{ height: '2px', background: 'rgba(0,0,0,0.6)', width: '100%', zIndex: 2 }} />
            <div style={{ height: '2px', background: 'rgba(0,0,0,0.6)', width: '100%', zIndex: 2 }} />
            <div style={{ height: '2px', background: 'rgba(0,0,0,0.6)', width: '100%', zIndex: 2 }} />
          </div>

          {/* Luxury Crown & Chrono Pushers (Right Side) */}
          <div
            style={{
              position: 'absolute',
              right: '8%',
              top: '47%',
              transform: 'translateY(-50%) translateZ(4px)',
              width: '14px',
              height: '22px',
              background: 'linear-gradient(90deg, #8a6709 0%, #d4af37 60%, #f3e5ab 100%)',
              borderRadius: '2px 5px 5px 2px',
              boxShadow: '2px 2px 8px rgba(0,0,0,0.5)',
              border: '1px solid #d4af37',
              zIndex: 4
            }}
          >
            {/* Crown Knurling Ridges */}
            <div style={{ height: '2px', background: '#644805', margin: '3px 0' }} />
            <div style={{ height: '2px', background: '#644805', margin: '3px 0' }} />
            <div style={{ height: '2px', background: '#644805', margin: '3px 0' }} />
          </div>

          {/* Chrono Top Pusher */}
          <div
            style={{
              position: 'absolute',
              right: '12%',
              top: '36%',
              width: '10px',
              height: '14px',
              background: 'linear-gradient(90deg, #475569 0%, #94a3b8 100%)',
              borderRadius: '2px 4px 4px 2px',
              zIndex: 3
            }}
          />

          {/* Chrono Bottom Pusher */}
          <div
            style={{
              position: 'absolute',
              right: '12%',
              bottom: '36%',
              width: '10px',
              height: '14px',
              background: 'linear-gradient(90deg, #475569 0%, #94a3b8 100%)',
              borderRadius: '2px 4px 4px 2px',
              zIndex: 3
            }}
          />

          {/* Main Watch Case (Stainless Steel & Gold Oyster Case) */}
          <div
            className="watch-main-case"
            style={{
              position: 'relative',
              width: '74%',
              aspectRatio: '1 / 1',
              borderRadius: '50%',
              background: 'radial-gradient(circle at 35% 35%, #475569 0%, #1e293b 55%, #0f172a 100%)',
              padding: '6px',
              boxShadow: '0 25px 60px rgba(0, 0, 0, 0.55), 0 0 35px rgba(212, 175, 55, 0.25), inset 0 2px 6px rgba(255, 255, 255, 0.4)',
              border: '2px solid rgba(212, 175, 55, 0.7)',
              transformStyle: 'preserve-3d',
              transform: 'translateZ(10px)',
              zIndex: 2
            }}
          >
            {/* Octagonal Bezel (Royal Oak Inspired) with 8 Hexagonal Screws */}
            <div
              style={{
                position: 'relative',
                width: '100%',
                height: '100%',
                borderRadius: '50%',
                background: 'conic-gradient(from 45deg, #1e293b 0deg, #475569 45deg, #0f172a 90deg, #475569 135deg, #1e293b 180deg, #475569 225deg, #0f172a 270deg, #475569 315deg, #1e293b 360deg)',
                border: '2px solid #d4af37',
                padding: '10px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: 'inset 0 0 14px rgba(0,0,0,0.8), 0 2px 10px rgba(0,0,0,0.5)'
              }}
            >
              {/* 8 Bezel Screws */}
              {[0, 45, 90, 135, 180, 225, 270, 315].map((deg, i) => {
                const rad = (deg * Math.PI) / 180;
                const r = 44; // percent radius
                const x = 50 + r * Math.sin(rad);
                const y = 50 - r * Math.cos(rad);
                return (
                  <div
                    key={i}
                    style={{
                      position: 'absolute',
                      left: `${x}%`,
                      top: `${y}%`,
                      transform: 'translate(-50%, -50%)',
                      width: '6px',
                      height: '6px',
                      borderRadius: '50%',
                      background: 'radial-gradient(circle, #f3e5ab 0%, #b8860b 80%)',
                      border: '1px solid #644805',
                      boxShadow: '0 1px 2px rgba(0,0,0,0.6)',
                      zIndex: 3
                    }}
                  />
                );
              })}

              {/* Inner Rehaut (Gold Chapter Ring with Tachymetre / Precision Minutes) */}
              <div
                style={{
                  position: 'relative',
                  width: '100%',
                  height: '100%',
                  borderRadius: '50%',
                  background: '#090d16',
                  border: '1.5px solid #d4af37',
                  overflow: 'hidden',
                  boxShadow: 'inset 0 4px 18px rgba(0,0,0,0.95)'
                }}
              >
                {/* Dial Background Pattern (Tapisserie / Guilloché Grid) */}
                <div
                  style={{
                    position: 'absolute',
                    inset: 0,
                    backgroundImage: 'radial-gradient(#1e293b 15%, transparent 16%), radial-gradient(#1e293b 15%, transparent 16%)',
                    backgroundSize: '8px 8px',
                    backgroundPosition: '0 0, 4px 4px',
                    opacity: 0.4
                  }}
                />

                {/* Skeletonised Gear Window (6 o'clock Tourbillon) */}
                <div
                  style={{
                    position: 'absolute',
                    bottom: '16%',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    width: '38%',
                    aspectRatio: '1 / 1',
                    borderRadius: '50%',
                    border: '1.5px solid rgba(212, 175, 55, 0.7)',
                    background: 'radial-gradient(circle, #1a1608 0%, #000000 80%)',
                    boxShadow: 'inset 0 0 10px rgba(0,0,0,0.9), 0 0 8px rgba(212, 175, 55, 0.2)',
                    overflow: 'hidden',
                    zIndex: 2
                  }}
                >
                  {/* Rotating Skeleton Balance Wheel */}
                  <div
                    style={{
                      position: 'absolute',
                      inset: '12%',
                      borderRadius: '50%',
                      border: '2px dashed #d4af37',
                      animation: 'tourbillonOscillate 1.2s ease-in-out infinite alternate'
                    }}
                  />
                  {/* Synthetic Ruby Jewel Pivot */}
                  <div
                    style={{
                      position: 'absolute',
                      top: '50%',
                      left: '50%',
                      transform: 'translate(-50%, -50%)',
                      width: '7px',
                      height: '7px',
                      borderRadius: '50%',
                      background: 'radial-gradient(circle, #ff1744 0%, #880e4f 100%)',
                      boxShadow: '0 0 6px #ff1744',
                      border: '1px solid #f3e5ab'
                    }}
                  />
                </div>

                {/* 12-Hour Luxury Batons / Indices */}
                {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((deg) => (
                  <div
                    key={deg}
                    style={{
                      position: 'absolute',
                      top: '50%',
                      left: '50%',
                      width: deg % 90 === 0 ? '4px' : '2.5px',
                      height: deg % 90 === 0 ? '14px' : '9px',
                      background: 'linear-gradient(180deg, #f3e5ab 0%, #d4af37 60%, #8a6709 100%)',
                      borderRadius: '1px',
                      boxShadow: '0 0 4px rgba(212, 175, 55, 0.5)',
                      transform: `translate(-50%, -50%) rotate(${deg}deg) translateY(-40px)`,
                      transformOrigin: 'center center',
                      zIndex: 3
                    }}
                  />
                ))}

                {/* Luxury Brand Dial Logo Text */}
                <div
                  style={{
                    position: 'absolute',
                    top: '22%',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    textAlign: 'center',
                    zIndex: 3
                  }}
                >
                  <div style={{ fontFamily: 'var(--font-brand)', fontSize: '0.62rem', fontWeight: 800, color: '#f3e5ab', letterSpacing: '0.14em' }}>
                    LUXURY WATCH
                  </div>
                  <div style={{ fontSize: '0.42rem', color: '#94a3b8', letterSpacing: '0.18em', fontWeight: 600 }}>
                    GENÈVE
                  </div>
                  <div style={{ fontSize: '0.36rem', color: '#d4af37', letterSpacing: '0.12em', marginTop: '1px' }}>
                    CHRONOMETER • 300M
                  </div>
                </div>

                {/* Sub-dial 9 o'clock (Day / Energy Reserve) */}
                <div
                  style={{
                    position: 'absolute',
                    left: '16%',
                    top: '48%',
                    transform: 'translateY(-50%)',
                    width: '24%',
                    aspectRatio: '1 / 1',
                    borderRadius: '50%',
                    border: '1px solid rgba(212, 175, 55, 0.4)',
                    background: 'rgba(15, 23, 42, 0.6)'
                  }}
                >
                  <div style={{ position: 'absolute', top: '50%', left: '50%', width: '1px', height: '8px', background: '#d4af37', transform: 'translate(-50%, -100%) rotate(45deg)', transformOrigin: 'bottom center' }} />
                </div>

                {/* Sub-dial 3 o'clock (Date / Dual Time) */}
                <div
                  style={{
                    position: 'absolute',
                    right: '16%',
                    top: '48%',
                    transform: 'translateY(-50%)',
                    width: '24%',
                    aspectRatio: '1 / 1',
                    borderRadius: '50%',
                    border: '1px solid rgba(212, 175, 55, 0.4)',
                    background: 'rgba(15, 23, 42, 0.6)'
                  }}
                >
                  <div style={{ position: 'absolute', top: '50%', left: '50%', width: '1px', height: '8px', background: '#d4af37', transform: 'translate(-50%, -100%) rotate(220deg)', transformOrigin: 'bottom center' }} />
                </div>

                {/* Hands Assembly (Hour, Minute, Sweeping Second Hand) */}
                <div
                  style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    width: 0,
                    height: 0,
                    transform: 'translate(-50%, -50%)',
                    zIndex: 5
                  }}
                >
                  {/* Hour Hand */}
                  <div
                    style={{
                      position: 'absolute',
                      bottom: 0,
                      left: '-3px',
                      width: '6px',
                      height: '28px',
                      background: 'linear-gradient(90deg, #b8860b 0%, #f3e5ab 50%, #8a6709 100%)',
                      borderRadius: '3px 3px 1px 1px',
                      boxShadow: '0 2px 6px rgba(0,0,0,0.6)',
                      transformOrigin: 'bottom center',
                      transform: `rotate(${hourAngle}deg)`
                    }}
                  >
                    {/* Luminescent Inlay */}
                    <div style={{ position: 'absolute', top: '4px', left: '1.5px', width: '3px', height: '14px', background: '#ffffff', borderRadius: '1px', boxShadow: '0 0 4px #86efac' }} />
                  </div>

                  {/* Minute Hand */}
                  <div
                    style={{
                      position: 'absolute',
                      bottom: 0,
                      left: '-2.5px',
                      width: '5px',
                      height: '38px',
                      background: 'linear-gradient(90deg, #d4af37 0%, #ffffff 50%, #b8860b 100%)',
                      borderRadius: '2.5px 2.5px 1px 1px',
                      boxShadow: '0 3px 8px rgba(0,0,0,0.7)',
                      transformOrigin: 'bottom center',
                      transform: `rotate(${minuteAngle}deg)`
                    }}
                  >
                    {/* Luminescent Inlay */}
                    <div style={{ position: 'absolute', top: '5px', left: '1px', width: '3px', height: '22px', background: '#ffffff', borderRadius: '1px', boxShadow: '0 0 4px #86efac' }} />
                  </div>

                  {/* Sweeping Seconds Hand (Gold Needle with Counterweight) */}
                  <div
                    style={{
                      position: 'absolute',
                      bottom: '-10px',
                      left: '-1px',
                      width: '2px',
                      height: '52px',
                      background: '#e11d48', // Crimson second hand tip
                      boxShadow: '0 1px 6px rgba(225, 29, 72, 0.6)',
                      transformOrigin: 'center 42px',
                      transform: `rotate(${secondAngle}deg)`
                    }}
                  >
                    <div style={{ position: 'absolute', bottom: '10px', left: '-3px', width: '8px', height: '8px', borderRadius: '50%', background: '#d4af37' }} />
                  </div>

                  {/* Center Golden Pin Cap */}
                  <div
                    style={{
                      position: 'absolute',
                      top: '50%',
                      left: '50%',
                      transform: 'translate(-50%, -50%)',
                      width: '10px',
                      height: '10px',
                      borderRadius: '50%',
                      background: 'radial-gradient(circle, #ffffff 0%, #d4af37 50%, #644805 100%)',
                      boxShadow: '0 2px 4px rgba(0,0,0,0.8)',
                      zIndex: 6
                    }}
                  />
                </div>

                {/* Sapphire Crystal Glass Glare / Specular Sweep Effect */}
                <div
                  style={{
                    position: 'absolute',
                    inset: 0,
                    borderRadius: '50%',
                    background: `radial-gradient(circle at ${glareX}% ${glareY}%, rgba(255, 255, 255, 0.45) 0%, rgba(212, 175, 55, 0.15) 30%, rgba(30, 58, 138, 0.1) 60%, transparent 80%)`,
                    mixBlendMode: 'screen',
                    pointerEvents: 'none',
                    zIndex: 7
                  }}
                />

                {/* Anti-Reflective Coating Edge Glow */}
                <div
                  style={{
                    position: 'absolute',
                    inset: 0,
                    borderRadius: '50%',
                    boxShadow: 'inset 0 0 15px rgba(56, 189, 248, 0.2), inset 0 0 25px rgba(212, 175, 55, 0.15)',
                    pointerEvents: 'none',
                    zIndex: 8
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Embedded High-Performance CSS Animations */}
      <style>{`
        @keyframes watchSubtleFloat {
          0%, 100% {
            transform: translateY(0px) rotateZ(0deg);
          }
          50% {
            transform: translateY(-10px) rotateZ(0.5deg);
          }
        }

        @keyframes tourbillonOscillate {
          0% {
            transform: rotate(0deg);
          }
          100% {
            transform: rotate(260deg);
          }
        }

        @media (max-width: 768px) {
          .luxury-3d-watch-wrapper {
            max-width: 300px !important;
            aspect-ratio: 1 / 1.1 !important;
          }
        }

        @media (max-width: 480px) {
          .luxury-3d-watch-wrapper {
            max-width: 255px !important;
          }
        }
      `}</style>
    </div>
  );
};

export default Watch3D;

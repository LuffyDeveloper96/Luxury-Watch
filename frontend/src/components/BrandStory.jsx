import React from 'react';
import { Award, ShieldCheck, Sparkles, Compass, Clock, CheckCircle2 } from 'lucide-react';

export const BrandStory = ({ onClose }) => {
  return (
    <section id="heritage-section" style={{
      padding: 'clamp(3rem, 6vw, 5rem) 0',
      background: 'radial-gradient(circle at 50% 30%, #ffffff 0%, #faf8f5 70%, #f3f0e8 100%)',
      borderTop: '1px solid rgba(180, 140, 30, 0.2)',
      borderBottom: '1px solid rgba(180, 140, 30, 0.2)',
      position: 'relative'
    }}>
      <div className="luxury-container">
        {/* Section Header */}
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <span style={{
            fontSize: 'clamp(0.6rem, 1.8vw, 0.72rem)',
            letterSpacing: '0.12em',
            color: '#8a6709',
            textTransform: 'uppercase',
            fontWeight: 700,
            display: 'block',
            marginBottom: '0.5rem'
          }}>
            THE ATELIER HERITAGE
          </span>
          <h2 style={{
            fontSize: 'clamp(1.4rem, 4.5vw, 3rem)',
            color: '#0f172a',
            fontFamily: 'var(--font-brand)',
            fontWeight: 700,
            wordBreak: 'break-word'
          }}>
            THE ART OF HAUTE HORLOGERIE
          </h2>
          <div style={{
            width: '60px',
            height: '2px',
            background: 'var(--gold-gradient)',
            margin: '1rem auto 0'
          }} />
        </div>

        {/* Narrative Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))',
          gap: 'clamp(1.5rem, 4vw, 3.5rem)',
          alignItems: 'center'
        }}>
          {/* Left Column: Visual Montage */}
          <div style={{ position: 'relative' }}>
            <div style={{
              width: '100%',
              paddingTop: '110%',
              borderRadius: '8px',
              overflow: 'hidden',
              backgroundImage: 'url("https://images.unsplash.com/photo-1508057198894-247b23fe5ade?q=80&w=1000&auto=format&fit=crop")',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              border: '1px solid rgba(180, 140, 30, 0.3)',
              boxShadow: '0 15px 45px rgba(15, 23, 42, 0.1)'
            }} />

            <div style={{
              position: 'absolute',
              bottom: '-20px',
              right: '-20px',
              background: '#ffffff',
              border: '1px solid var(--border-gold)',
              backdropFilter: 'blur(12px)',
              padding: '1.25rem',
              borderRadius: '6px',
              maxWidth: '260px',
              boxShadow: '0 10px 30px rgba(15, 23, 42, 0.08)'
            }} className="hidden sm:block">
              <span style={{ fontSize: '0.68rem', color: '#8a6709', letterSpacing: '0.15em', textTransform: 'uppercase', display: 'block', fontWeight: 700 }}>
                GENEVA HOROLOGY LAB
              </span>
              <p style={{ fontSize: '0.78rem', color: '#0f172a', marginTop: '4px', fontStyle: 'italic', lineHeight: 1.5 }}>
                "Every gear teeth is chamfered to micron precision by our master watchmakers."
              </p>
            </div>
          </div>

          {/* Right Column: Story Text & Hallmarks */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <h3 style={{ fontSize: '1.6rem', color: '#0f172a', fontFamily: 'var(--font-brand)', lineHeight: 1.3, fontWeight: 700 }}>
              Born in Mayfair, <span className="text-gold-gradient">Engineered in Geneva</span>
            </h3>

            <p style={{ fontSize: '0.92rem', color: '#334155', lineHeight: 1.8, fontFamily: 'var(--font-sans)', fontWeight: 400 }}>
              Luxury Watch was founded on a singular unyielding conviction: that the grandeur of bespoke design and the relentless precision of Swiss mechanical watchmaking belong together. Each timepiece undergoes over <strong>200 hours</strong> of meticulous hand-assembly, pressure validation, and chronometric calibration.
            </p>

            <p style={{ fontSize: '0.92rem', color: '#334155', lineHeight: 1.8, fontFamily: 'var(--font-sans)', fontWeight: 400 }}>
              From our open-worked flying tourbillon skeleton models to our solid 18K rose gold chronographs, Luxury Watch timepieces are crafted for those who define epochs rather than merely measure time.
            </p>

            {/* 4 Pillars Grid */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '1.25rem',
              marginTop: '1rem',
              paddingTop: '1.25rem',
              borderTop: '1px solid rgba(0, 0, 0, 0.08)'
            }}>
              <div>
                <h4 style={{ fontSize: '0.85rem', color: '#0f172a', fontFamily: 'var(--font-brand)', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 600 }}>
                  <Award size={16} color="#8a6709" />
                  Swiss Calibres
                </h4>
                <p style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '2px' }}>
                  High-beat 28,800 vph automatic escapement wheels.
                </p>
              </div>

              <div>
                <h4 style={{ fontSize: '0.85rem', color: '#0f172a', fontFamily: 'var(--font-brand)', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 600 }}>
                  <ShieldCheck size={16} color="#8a6709" />
                  Domed Sapphire
                </h4>
                <p style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '2px' }}>
                  Dual anti-reflective scratchproof diamond-hardness crystals.
                </p>
              </div>

              <div>
                <h4 style={{ fontSize: '0.85rem', color: '#0f172a', fontFamily: 'var(--font-brand)', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 600 }}>
                  <Sparkles size={16} color="#8a6709" />
                  Surgical 316L/904L
                </h4>
                <p style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '2px' }}>
                  Hand-polished chamfers & 24K gold ion-plating.
                </p>
              </div>

              <div>
                <h4 style={{ fontSize: '0.85rem', color: '#0f172a', fontFamily: 'var(--font-brand)', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 600 }}>
                  <Clock size={16} color="#8a6709" />
                  Bespoke Engraving
                </h4>
                <p style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '2px' }}>
                  Complimentary personalized caseback monogramming.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

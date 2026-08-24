import React from 'react';
import { Award, ShieldCheck, Sparkles, Compass, Clock, CheckCircle2 } from 'lucide-react';

export const BrandStory = ({ onClose }) => {
  return (
    <section id="heritage-section" style={{
      padding: '5rem 0',
      background: 'radial-gradient(circle at 50% 30%, rgba(26, 29, 36, 0.7) 0%, rgba(11, 12, 16, 0.98) 70%)',
      borderTop: '1px solid rgba(212, 175, 55, 0.2)',
      borderBottom: '1px solid rgba(212, 175, 55, 0.2)',
      position: 'relative'
    }}>
      <div className="luxury-container">
        {/* Section Header */}
        <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
          <span style={{
            fontSize: '0.72rem',
            letterSpacing: '0.25em',
            color: '#d4af37',
            textTransform: 'uppercase',
            fontWeight: 600,
            display: 'block',
            marginBottom: '0.5rem'
          }}>
            THE ATELIER HERITAGE
          </span>
          <h2 style={{
            fontSize: 'clamp(2rem, 4vw, 3rem)',
            color: '#f8fafc',
            fontFamily: 'var(--font-brand)'
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
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '3.5rem',
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
              border: '1px solid rgba(212, 175, 55, 0.3)',
              boxShadow: '0 15px 45px rgba(0, 0, 0, 0.7)'
            }} />

            <div style={{
              position: 'absolute',
              bottom: '-20px',
              right: '-20px',
              background: 'rgba(18, 20, 26, 0.95)',
              border: '1px solid var(--border-gold)',
              backdropFilter: 'blur(12px)',
              padding: '1.25rem',
              borderRadius: '6px',
              maxWidth: '260px',
              boxShadow: '0 10px 30px rgba(0,0,0,0.6)'
            }} className="hidden sm:block">
              <span style={{ fontSize: '0.68rem', color: '#d4af37', letterSpacing: '0.15em', textTransform: 'uppercase', display: 'block', fontWeight: 600 }}>
                GENEVA HOROLOGY LAB
              </span>
              <p style={{ fontSize: '0.78rem', color: '#f8fafc', marginTop: '4px', fontStyle: 'italic' }}>
                "Every gear teeth is chamfered to micron precision by our master watchmakers."
              </p>
            </div>
          </div>

          {/* Right Column: Story Text & Hallmarks */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <h3 style={{ fontSize: '1.6rem', color: '#f8fafc', fontFamily: 'var(--font-brand)', lineHeight: 1.3 }}>
              Born in Mayfair, <span className="text-gold-gradient">Engineered in Geneva</span>
            </h3>

            <p style={{ fontSize: '0.92rem', color: '#cbd5e1', lineHeight: 1.8, fontFamily: 'var(--font-sans)', fontWeight: 300 }}>
              Luxury Watch was founded on a singular unyielding conviction: that the grandeur of bespoke design and the relentless precision of Swiss mechanical watchmaking belong together. Each timepiece undergoes over <strong>200 hours</strong> of meticulous hand-assembly, pressure validation, and chronometric calibration.
            </p>

            <p style={{ fontSize: '0.92rem', color: '#cbd5e1', lineHeight: 1.8, fontFamily: 'var(--font-sans)', fontWeight: 300 }}>
              From our open-worked flying tourbillon skeleton models to our solid 18K rose gold chronographs, Luxury Watch timepieces are crafted for those who define epochs rather than merely measure time.
            </p>

            {/* 4 Pillars Grid */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '1.25rem',
              marginTop: '1rem',
              paddingTop: '1.25rem',
              borderTop: '1px solid rgba(255, 255, 255, 0.08)'
            }}>
              <div>
                <h4 style={{ fontSize: '0.85rem', color: '#f3e5ab', fontFamily: 'var(--font-brand)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Award size={16} color="#d4af37" />
                  Swiss Calibres
                </h4>
                <p style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '2px' }}>
                  High-beat 28,800 vph automatic escapement wheels.
                </p>
              </div>

              <div>
                <h4 style={{ fontSize: '0.85rem', color: '#f3e5ab', fontFamily: 'var(--font-brand)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <ShieldCheck size={16} color="#d4af37" />
                  Domed Sapphire
                </h4>
                <p style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '2px' }}>
                  Dual anti-reflective scratchproof diamond-hardness crystals.
                </p>
              </div>

              <div>
                <h4 style={{ fontSize: '0.85rem', color: '#f3e5ab', fontFamily: 'var(--font-brand)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Sparkles size={16} color="#d4af37" />
                  Surgical 316L/904L
                </h4>
                <p style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '2px' }}>
                  Hand-polished chamfers & 24K gold ion-plating.
                </p>
              </div>

              <div>
                <h4 style={{ fontSize: '0.85rem', color: '#f3e5ab', fontFamily: 'var(--font-brand)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Clock size={16} color="#d4af37" />
                  Bespoke Engraving
                </h4>
                <p style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '2px' }}>
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

import React from 'react';
import { ShieldCheck, Truck, Clock, Sparkles, Mail, Lock, Heart, Award, ArrowUp } from 'lucide-react';

export const Footer = ({
  onSelectCategory,
  onOpenAdmin,
  onOpenBrandStory,
  onOpenTracking,
  onOpenReturns
}) => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer style={{ background: '#0b0f19', color: '#f8fafc', borderTop: '1px solid rgba(180, 140, 30, 0.25)', position: 'relative' }}>
      {/* Top Value Propositions */}
      <div style={{ borderBottom: '1px solid #1f2937', padding: '2.5rem 0' }}>
        <div className="luxury-container" style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '2rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'rgba(212, 175, 55, 0.1)', border: '1px solid #d4af37', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Award size={20} color="#f3e5ab" />
            </div>
            <div>
              <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#f3e5ab' }}>100% Certified Authentic</div>
              <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>Transparent provenance & warranty</div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'rgba(212, 175, 55, 0.1)', border: '1px solid #d4af37', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Truck size={20} color="#f3e5ab" />
            </div>
            <div>
              <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#f3e5ab' }}>Complimentary Insured Shipping</div>
              <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>Free on all orders above ₹999</div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'rgba(212, 175, 55, 0.1)', border: '1px solid #d4af37', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Clock size={20} color="#f3e5ab" />
            </div>
            <div>
              <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#f3e5ab' }}>10-Day Easy Returns</div>
              <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>Complimentary insured courier pickup</div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'rgba(212, 175, 55, 0.1)', border: '1px solid #d4af37', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Lock size={20} color="#f3e5ab" />
            </div>
            <div>
              <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#f3e5ab' }}>Razorpay 256-Bit SSL</div>
              <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>Encrypted bank-grade checkout</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="luxury-container" style={{ padding: '3.5rem 1rem 2.5rem 1rem' }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: '2.5rem',
          marginBottom: '3rem'
        }}>
          {/* Brand Info */}
          <div style={{ gridColumn: 'span 1' }}>
            <div style={{ fontFamily: 'var(--font-brand)', fontSize: '1.35rem', fontWeight: 800, color: '#f3e5ab', letterSpacing: '0.1em' }}>
              LUXURY WATCH
            </div>
            <div style={{ fontSize: '0.62rem', letterSpacing: '0.18em', color: '#d4af37', fontWeight: 700, textTransform: 'uppercase', marginTop: '2px' }}>
              TIMELESS WATCHES. EXCEPTIONAL VALUE.
            </div>
            <p style={{ fontSize: '0.78rem', color: '#94a3b8', lineHeight: 1.6, marginTop: '1rem' }}>
              India's premier branded watch marketplace. Curating certified horological icons from Geneva, Le Brassus, and Glashütte.
            </p>
          </div>

          {/* SHOP */}
          <div>
            <h4 style={{ fontSize: '0.82rem', letterSpacing: '0.12em', color: '#f3e5ab', fontWeight: 700, textTransform: 'uppercase', marginBottom: '1rem' }}>
              SHOP BY PORTFOLIO
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.78rem', color: '#cbd5e1' }}>
              {["Men's Watches", "Women's Collection", "Chronographs", "Skeleton Automatics", "Rolex", "Titan", "Casio", "Fastrack", "Fossil", "Timex", "Sonata", "Guess", "Limestone", "Noise"].map(cat => (
                <span
                  key={cat}
                  onClick={() => {
                    if (onSelectCategory) onSelectCategory(cat);
                    const catalogEl = document.getElementById('catalog-section');
                    if (catalogEl) catalogEl.scrollIntoView({ behavior: 'smooth' });
                  }}
                  style={{ cursor: 'pointer', transition: 'color 0.15s ease' }}
                  onMouseEnter={(e) => e.currentTarget.style.color = '#d4af37'}
                  onMouseLeave={(e) => e.currentTarget.style.color = '#cbd5e1'}
                >
                  {cat}
                </span>
              ))}
            </div>
          </div>

          {/* CUSTOMER CONCIERGE */}
          <div>
            <h4 style={{ fontSize: '0.82rem', letterSpacing: '0.12em', color: '#f3e5ab', fontWeight: 700, textTransform: 'uppercase', marginBottom: '1rem' }}>
              CUSTOMER CONCIERGE
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.78rem', color: '#cbd5e1' }}>
              <span onClick={onOpenTracking} style={{ cursor: 'pointer', transition: 'color 0.15s ease' }} onMouseEnter={(e) => e.currentTarget.style.color = '#d4af37'} onMouseLeave={(e) => e.currentTarget.style.color = '#cbd5e1'}>Track Consignment</span>
              <span onClick={onOpenReturns} style={{ cursor: 'pointer', transition: 'color 0.15s ease' }} onMouseEnter={(e) => e.currentTarget.style.color = '#d4af37'} onMouseLeave={(e) => e.currentTarget.style.color = '#cbd5e1'}>Returns & Exchanges</span>
              <span onClick={onOpenBrandStory} style={{ cursor: 'pointer', transition: 'color 0.15s ease' }} onMouseEnter={(e) => e.currentTarget.style.color = '#d4af37'} onMouseLeave={(e) => e.currentTarget.style.color = '#cbd5e1'}>Authenticity & Warranty</span>
              <span>Shipping & Delivery Policy</span>
              <span>24/7 Atelier Support</span>
              <a
                href="#admin"
                onClick={(e) => {
                  e.preventDefault();
                  if (onOpenAdmin) onOpenAdmin();
                }}
                style={{
                  color: '#cbd5e1',
                  textDecoration: 'none',
                  cursor: 'pointer',
                  transition: 'color 0.15s ease'
                }}
                onMouseEnter={(e) => e.currentTarget.style.color = '#d4af37'}
                onMouseLeave={(e) => e.currentTarget.style.color = '#cbd5e1'}
                onFocus={(e) => e.currentTarget.style.color = '#d4af37'}
                onBlur={(e) => e.currentTarget.style.color = '#cbd5e1'}
              >
                Admin Portal
              </a>
            </div>
          </div>

          {/* NEWSLETTER */}
          <div>
            <h4 style={{ fontSize: '0.82rem', letterSpacing: '0.12em', color: '#f3e5ab', fontWeight: 700, textTransform: 'uppercase', marginBottom: '1rem' }}>
              PRIVATE COLLECTOR'S PRIVILEGE
            </h4>
            <p style={{ fontSize: '0.75rem', color: '#94a3b8', lineHeight: 1.5, margin: '0 0 1rem 0' }}>
              Subscribe to receive private allocations, limited edition releases, and VIP invitations.
            </p>
            <div style={{ display: 'flex', gap: '6px' }}>
              <input
                type="email"
                placeholder="Enter your email address"
                className="lux-input"
                style={{ background: '#111827', border: '1px solid #374151', color: '#ffffff', fontSize: '0.75rem', padding: '8px 12px' }}
              />
              <button className="btn-gold" style={{ padding: '8px 14px', fontSize: '0.75rem', flexShrink: 0 }}>
                JOIN
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Bar: Copyright & Scroll to Top */}
        <div style={{
          borderTop: '1px solid #1f2937',
          paddingTop: '1.5rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem',
          fontSize: '0.72rem',
          color: '#64748b'
        }}>
          <div>
            © {new Date().getFullYear()} LUXURY WATCH (India) Private Limited. All Rights Reserved.
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <button
              onClick={scrollToTop}
              style={{
                background: '#111827',
                border: '1px solid #374151',
                color: '#d4af37',
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer'
              }}
              title="Scroll to Top"
            >
              <ArrowUp size={14} />
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { Watch, Mail, Phone, MapPin, ShieldCheck, Sparkles, CheckCircle2, ArrowRight } from 'lucide-react';

export const Footer = ({ onSelectCategory, onOpenAdmin, onOpenBrandStory, onOpenTracking }) => {
  const { storeSettings } = useStore();
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleNewsletterSubmit = (e) => {
    e.preventDefault();
    if (!email.trim()) return;
    setSubscribed(true);
    setEmail('');
  };

  return (
    <footer style={{
      backgroundColor: '#07080a',
      color: '#cbd5e1',
      borderTop: '1px solid rgba(212, 175, 55, 0.25)',
      paddingTop: '4.5rem',
      paddingBottom: '2.5rem',
      position: 'relative'
    }}>
      <div className="luxury-container">
        {/* Newsletter VIP Banner */}
        <div style={{
          background: 'linear-gradient(135deg, rgba(26, 29, 36, 0.8) 0%, rgba(11, 12, 16, 0.95) 100%)',
          border: '1px solid var(--border-gold)',
          borderRadius: '8px',
          padding: '2.5rem 2rem',
          marginBottom: '4.5rem',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
          boxShadow: '0 10px 30px rgba(0, 0, 0, 0.6)'
        }}>
          <Sparkles size={28} color="#d4af37" style={{ marginBottom: '0.75rem' }} />
          <span style={{ fontSize: '0.72rem', letterSpacing: '0.25em', color: '#d4af37', textTransform: 'uppercase', fontWeight: 600 }}>
            PRIVATE HOROLOGY REGISTRY
          </span>
          <h3 style={{ fontSize: 'clamp(1.5rem, 3vw, 2rem)', color: '#f8fafc', fontFamily: 'var(--font-brand)', margin: '6px 0 10px' }}>
            Join the Luxury Watch Private Circle
          </h3>
          <p style={{ fontSize: '0.85rem', color: '#94a3b8', maxWidth: '580px', marginBottom: '1.5rem' }}>
            Receive private vault previews of upcoming numbered skeleton editions, horology whitepapers, and a complimentary <strong>10% acquisition voucher</strong>.
          </p>

          {subscribed ? (
            <div style={{
              background: 'rgba(16, 185, 129, 0.15)',
              border: '1px solid rgba(16, 185, 129, 0.3)',
              color: '#34d399',
              padding: '12px 24px',
              borderRadius: '4px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontSize: '0.85rem'
            }}>
              <CheckCircle2 size={18} />
              <span>Welcome to the Circle. Use VIP Code: <strong>LUXE10</strong> for 10% off your acquisition.</span>
            </div>
          ) : (
            <form onSubmit={handleNewsletterSubmit} style={{ display: 'flex', gap: '8px', width: '100%', maxWidth: '480px', flexWrap: 'wrap' }}>
              <input
                type="email"
                required
                placeholder="Enter your private email address..."
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="lux-input"
                style={{ flex: 1, minWidth: '240px' }}
              />
              <button type="submit" className="btn-gold" style={{ padding: '0.75rem 1.5rem' }}>
                <span>SUBSCRIBE</span>
                <ArrowRight size={14} />
              </button>
            </form>
          )}
        </div>

        {/* Footer 4-Column Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '3rem',
          paddingBottom: '3.5rem',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)'
        }}>
          {/* Column 1: Brand */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1rem' }}>
              <Watch size={20} color="#d4af37" />
              <span style={{ fontFamily: 'var(--font-brand)', fontSize: '1.25rem', fontWeight: 700, letterSpacing: '0.2em', color: '#f8fafc' }}>
                LUXURY <span style={{ color: '#d4af37', fontWeight: 300 }}>WATCH</span>
              </span>
            </div>
            <p style={{ fontSize: '0.8rem', color: '#94a3b8', lineHeight: 1.7, marginBottom: '1.25rem' }}>
              Haute Horlogerie atelier uniting English aesthetic grandeur with Swiss mechanical precision. Certified Swiss movements, domed sapphire glass, and 5-year international warranty.
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#d4af37', fontSize: '0.72rem', fontWeight: 600 }}>
              <ShieldCheck size={14} />
              <span>SWISS ESCROW VERIFIED SETTLEMENT</span>
            </div>
          </div>

          {/* Column 2: Collections Navigation */}
          <div>
            <h4 style={{ fontSize: '0.85rem', color: '#f8fafc', fontFamily: 'var(--font-brand)', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: '1.25rem' }}>
              Timepiece Collections
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.8rem' }}>
              {['Chronograph', 'Skeleton Automatic', 'Diamond Collection', 'Automatic', "Women's Elegance"].map(cat => (
                <button
                  key={cat}
                  onClick={() => {
                    onSelectCategory(cat);
                    const el = document.getElementById('catalog-section');
                    if (el) el.scrollIntoView({ behavior: 'smooth' });
                  }}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#94a3b8',
                    textAlign: 'left',
                    cursor: 'pointer',
                    padding: '2px 0',
                    transition: 'color 0.2s ease'
                  }}
                  onMouseEnter={(e) => e.target.style.color = '#d4af37'}
                  onMouseLeave={(e) => e.target.style.color = '#94a3b8'}
                >
                  {cat}
                </button>
              ))}
              <button
                onClick={onOpenBrandStory}
                style={{ background: 'none', border: 'none', color: '#94a3b8', textAlign: 'left', cursor: 'pointer', padding: '2px 0' }}
                onMouseEnter={(e) => e.target.style.color = '#d4af37'}
                onMouseLeave={(e) => e.target.style.color = '#94a3b8'}
              >
                Mayfair Atelier Story
              </button>
            </div>
          </div>

          {/* Column 3: Concierge & Client Service */}
          <div>
            <h4 style={{ fontSize: '0.85rem', color: '#f8fafc', fontFamily: 'var(--font-brand)', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: '1.25rem' }}>
              Concierge & Services
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.8rem' }}>
              <button
                onClick={onOpenTracking}
                style={{ background: 'none', border: 'none', color: '#d4af37', textAlign: 'left', cursor: 'pointer', fontWeight: 600 }}
              >
                Track Order Delivery Timeline
              </button>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', color: '#94a3b8' }}>
                <Phone size={14} color="#d4af37" style={{ marginTop: '3px', flexShrink: 0 }} />
                <span>+91 98200 12345</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', color: '#94a3b8' }}>
                <Mail size={14} color="#d4af37" style={{ marginTop: '3px', flexShrink: 0 }} />
                <span>concierge@luxurywatch.in</span>
              </div>
              <span style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '4px' }}>
                Hours: Mon - Sat: 10:00 AM - 8:00 PM IST (Pan-India Direct Support)
              </span>
            </div>
          </div>

          {/* Column 4: Flagship Boutiques */}
          <div>
            <h4 style={{ fontSize: '0.85rem', color: '#f8fafc', fontFamily: 'var(--font-brand)', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: '1.25rem' }}>
              Indian Flagship Boutiques
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.78rem', color: '#94a3b8' }}>
              <div>
                <strong style={{ color: '#f8fafc', display: 'block' }}>Mumbai Flagship Maison</strong>
                <span>The Capital, Bandra Kurla Complex (BKC), Mumbai 400051</span>
              </div>
              <div>
                <strong style={{ color: '#f8fafc', display: 'block' }}>New Delhi Luxury Lounge</strong>
                <span>DLF Emporio, Vasant Kunj, New Delhi 110070</span>
              </div>
              <div>
                <strong style={{ color: '#f8fafc', display: 'block' }}>Bengaluru Private Suite</strong>
                <span>UB City, Vittal Mallya Road, Bengaluru 560001</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar: Copyright & Admin Portal Link */}
        <div style={{
          paddingTop: '2rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem',
          fontSize: '0.72rem',
          color: '#64748b'
        }}>
          <div>
            © {new Date().getFullYear()} LUXURY WATCH INDIA • GST COMPLIANT • ALL RIGHTS RESERVED.
          </div>

          {/* Payment Badges Mockup */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: '#94a3b8' }}>
            <span>BHIM UPI</span>
            <span>•</span>
            <span>GOOGLE PAY</span>
            <span>•</span>
            <span>PHONEPE</span>
            <span>•</span>
            <span>RUPAY</span>
            <span>•</span>
            <span>VISA</span>
            <span>•</span>
            <span>NETBANKING</span>
          </div>

          {/* Single Admin Shortcut */}
          <button
            onClick={onOpenAdmin}
            style={{
              background: 'none',
              border: 'none',
              color: '#d4af37',
              cursor: 'pointer',
              fontSize: '0.72rem',
              letterSpacing: '0.1em',
              textTransform: 'uppercase'
            }}
          >
            Sole Administrator Portal
          </button>
        </div>
      </div>
    </footer>
  );
};

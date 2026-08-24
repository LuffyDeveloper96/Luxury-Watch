import React from 'react';
import { ArrowUpRight } from 'lucide-react';

export const CollectionGrid = ({ onSelectCategory }) => {
  const collections = [
    {
      title: "Royal Chronographs",
      category: "Chronographs",
      subtitle: "Precision stopwatches & tachymeter bezels",
      image: "https://images.unsplash.com/photo-1524805444758-089113d48a6d?auto=format&fit=crop&w=800&q=80",
      tag: "FLAGSHIP"
    },
    {
      title: "Skeleton Automatics",
      category: "Skeletons",
      subtitle: "Openworked architectural gear trains & tourbillons",
      image: "https://images.unsplash.com/photo-1547996160-71dfa6358264?auto=format&fit=crop&w=800&q=80",
      tag: "AVANT-GARDE"
    },
    {
      title: "Celestial Diamond Editions",
      category: "Diamond Editions",
      subtitle: "Natural brilliant-cut diamonds & aventurine dials",
      image: "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=800&q=80",
      tag: "HIGH JEWELLERY"
    },
    {
      title: "Heritage 1928",
      category: "Heritage",
      subtitle: "Grand Feu enamel & vintage monopusher designs",
      image: "https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=800&q=80",
      tag: "HISTORIC"
    }
  ];

  return (
    <section style={{ padding: '5rem 0', backgroundColor: '#0b0c10' }}>
      <div className="luxury-container">
        {/* Section Header */}
        <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
          <div style={{
            fontSize: '0.72rem',
            fontFamily: 'var(--font-sans)',
            letterSpacing: '0.25em',
            color: '#d4af37',
            textTransform: 'uppercase',
            fontWeight: 600,
            marginBottom: '0.5rem'
          }}>
            CURATED HOROLOGY TIERS
          </div>
          <h2 style={{
            fontSize: 'clamp(1.8rem, 3.5vw, 2.5rem)',
            color: '#ffffff',
            fontWeight: 600
          }}>
            DISCOVER THE COLLECTIONS
          </h2>
          <div style={{
            width: '60px',
            height: '2px',
            background: 'var(--gold-gradient)',
            margin: '1.2rem auto 0 auto'
          }} />
        </div>

        {/* 4-Card Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '1.75rem'
        }}>
          {collections.map((col, idx) => (
            <div
              key={idx}
              onClick={() => onSelectCategory(col.category)}
              className="glass-card"
              style={{
                position: 'relative',
                height: '380px',
                cursor: 'pointer',
                borderRadius: '6px',
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'flex-end',
                padding: '2rem',
                border: '1px solid rgba(255, 255, 255, 0.08)'
              }}
            >
              {/* Background Image with Dark Vignette */}
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  backgroundImage: `url(${col.image})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  transition: 'transform 0.7s cubic-bezier(0.16, 1, 0.3, 1)',
                  filter: 'brightness(0.65)'
                }}
                className="collection-img-zoom"
              />

              {/* Gradient Overlay */}
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  background: 'linear-gradient(to top, rgba(11, 12, 16, 0.95) 0%, rgba(11, 12, 16, 0.4) 50%, transparent 100%)'
                }}
              />

              {/* Card Content */}
              <div style={{ position: 'relative', zIndex: 2 }}>
                <span className="badge-luxury badge-gold" style={{ marginBottom: '0.75rem' }}>
                  {col.tag}
                </span>
                <h3 style={{
                  fontSize: '1.35rem',
                  color: '#ffffff',
                  marginBottom: '0.4rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}>
                  <span>{col.title}</span>
                  <ArrowUpRight size={18} style={{ color: '#d4af37' }} />
                </h3>
                <p style={{
                  fontSize: '0.8rem',
                  color: '#94a3b8',
                  lineHeight: 1.5,
                  fontWeight: 300
                }}>
                  {col.subtitle}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

import React from 'react';
import { Star, Award, CheckCircle2, Quote } from 'lucide-react';

export const ReviewsSection = () => {
  const pressQuotes = [
    { source: "GQ MAGAZINE", text: "“Luxury Watch delivers the finish and mechanical soul of a ₹20,00,000 Swiss masterpiece at a price that challenges legacy horology.”" },
    { source: "FORBES LUXURY", text: "“An extraordinary British-Swiss hybrid brand setting new benchmarks in open-work skeleton and chronograph craftsmanship.”" },
    { source: "WATCHTIME INTERNATIONAL", text: "“From the domed anti-reflective sapphire to the high-beat movement, every single detail commands respect on the wrist.”" }
  ];

  const clientReviews = [
    {
      author: "Vikramaditya Singhania",
      title: "Collector & Entrepreneur",
      location: "Mumbai",
      watch: "Royal Chrono Sovereign 42mm",
      comment: "Unboxing this watch was an event in itself. The solid rose gold weight, the flawless chronograph pushers, and the bespoke engraving make it an instant heirloom in my collection.",
      rating: 5
    },
    {
      author: "Lord Charles Sterling",
      title: "Haute Horlogerie Aficionado",
      location: "London, Mayfair",
      watch: "Grand Tourbillon Skeleton Masterpiece",
      comment: "The skeleton architecture is mesmerizing. Watching the 33-jewel balance wheel oscillate through the sapphire exhibition back is pure mechanical poetry.",
      rating: 5
    },
    {
      author: "Natasha Kulkarni",
      title: "Architect",
      location: "Bengaluru",
      watch: "Constellation Diamanté 36mm",
      comment: "The natural Tahitian Mother of Pearl dial shifts colors under every light angle. The diamond setting is immaculate. Highly recommend the complimentary engraving!",
      rating: 5
    }
  ];

  return (
    <section style={{ padding: 'clamp(3rem, 6vw, 5rem) 0', background: '#f8f7f4' }}>
      <div className="luxury-container">
        {/* Press Quotes Banner */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 260px), 1fr))',
          gap: '1.5rem',
          paddingBottom: '2.5rem',
          borderBottom: '1px solid rgba(0, 0, 0, 0.08)',
          marginBottom: '3rem'
        }}>
          {pressQuotes.map((item, idx) => (
            <div key={idx} style={{ textAlign: 'center', padding: '0.5rem' }}>
              <div style={{
                fontSize: 'clamp(0.68rem, 2vw, 0.78rem)',
                letterSpacing: '0.15em',
                color: '#8a6709',
                fontWeight: 800,
                marginBottom: '0.5rem'
              }}>
                {item.source}
              </div>
              <p style={{
                fontSize: 'clamp(0.78rem, 2vw, 0.85rem)',
                color: '#475569',
                fontStyle: 'italic',
                lineHeight: 1.6
              }}>
                {item.text}
              </p>
            </div>
          ))}
        </div>

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
            PATRON TESTIMONIALS
          </span>
          <h2 style={{
            fontSize: 'clamp(1.4rem, 4.5vw, 2.5rem)',
            color: '#0f172a',
            fontFamily: 'var(--font-brand)',
            fontWeight: 700,
            wordBreak: 'break-word'
          }}>
            DISTINGUISHED CLIENT VOICES
          </h2>
          <div style={{
            width: '60px',
            height: '2px',
            background: 'var(--gold-gradient)',
            margin: '1rem auto 0'
          }} />
        </div>

        {/* Client Reviews Cards */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))',
          gap: '1.5rem'
        }}>
          {clientReviews.map((rev, idx) => (
            <div
              key={idx}
              className="glass-card"
              style={{
                backgroundColor: '#ffffff',
                border: '1px solid rgba(0, 0, 0, 0.08)',
                boxShadow: 'var(--shadow-sm)',
                padding: '2rem',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                gap: '1.25rem'
              }}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                  <div style={{ display: 'flex', gap: '3px' }}>
                    {[...Array(rev.rating)].map((_, i) => (
                      <Star key={i} size={14} color="#d4af37" fill="#d4af37" />
                    ))}
                  </div>
                  <Quote size={20} color="#8a6709" style={{ opacity: 0.3 }} />
                </div>

                <p style={{ fontSize: '0.88rem', color: '#334155', lineHeight: 1.7, fontStyle: 'italic', marginBottom: '1rem' }}>
                  "{rev.comment}"
                </p>
              </div>

              <div style={{ borderTop: '1px solid rgba(0, 0, 0, 0.06)', paddingTop: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div>
                    <h4 style={{ fontSize: '0.92rem', color: '#0f172a', fontWeight: 700 }}>
                      {rev.author}
                    </h4>
                    <span style={{ fontSize: '0.72rem', color: '#64748b' }}>
                      {rev.title} • {rev.location}
                    </span>
                  </div>
                  <span style={{ fontSize: '0.65rem', background: 'rgba(16, 185, 129, 0.12)', color: '#059669', padding: '2px 6px', borderRadius: '2px', fontWeight: 600 }}>
                    Verified
                  </span>
                </div>
                <span style={{ fontSize: '0.72rem', color: '#8a6709', display: 'block', marginTop: '4px', fontWeight: 600 }}>
                  Timepiece: {rev.watch}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

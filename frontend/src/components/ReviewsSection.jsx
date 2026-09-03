import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { INITIAL_REVIEWS } from '../data/initialReviews';
import { Star, Quote, Pause, Play, Sparkles, Award } from 'lucide-react';

export const ReviewsSection = () => {
  const { reviews } = useStore();
  const [isPaused, setIsPaused] = useState(false);

  // Press editorial accolades
  const pressQuotes = [
    { source: "GQ MAGAZINE", text: "“Luxury Watch delivers the finish and mechanical soul of a ₹20,00,000 Swiss masterpiece at a price that challenges legacy horology.”" },
    { source: "FORBES LUXURY", text: "“An extraordinary British-Swiss hybrid brand setting new benchmarks in open-work skeleton and chronograph craftsmanship.”" },
    { source: "WATCHTIME INTERNATIONAL", text: "“From the domed anti-reflective sapphire to the high-beat movement, every single detail commands respect on the wrist.”" }
  ];

  // Pool of reviews: dynamic store reviews or curated initial reviews (50+ Indian customer reviews)
  const reviewPool = (reviews && reviews.length > 0) ? reviews : INITIAL_REVIEWS;

  // Duplicate the list for a seamless, continuous, zero-jump infinite marquee loop
  const displayReviews = [...reviewPool, ...reviewPool];

  return (
    <section
      id="reviews-section"
      style={{
        padding: 'clamp(3rem, 6vw, 5rem) 0',
        background: '#f8f7f4',
        overflow: 'hidden',
        position: 'relative'
      }}
    >
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
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', marginBottom: '0.5rem' }}>
            <Sparkles size={13} color="#8a6709" />
            <span style={{
              fontSize: 'clamp(0.6rem, 1.8vw, 0.72rem)',
              letterSpacing: '0.14em',
              color: '#8a6709',
              textTransform: 'uppercase',
              fontWeight: 700
            }}>
              WHAT OUR CUSTOMERS SAY • LIVE PATRON FEEDBACK
            </span>
          </div>
          <h2 style={{
            fontSize: 'clamp(1.4rem, 4.5vw, 2.5rem)',
            color: '#0f172a',
            fontFamily: 'var(--font-brand)',
            fontWeight: 700,
            wordBreak: 'break-word',
            margin: '0.25rem 0 0.75rem 0'
          }}>
            DISTINGUISHED CLIENT VOICES
          </h2>
          <div style={{
            width: '60px',
            height: '2px',
            background: 'var(--gold-gradient)',
            margin: '0.75rem auto 1rem auto'
          }} />
          <p style={{
            color: '#64748b',
            fontSize: 'clamp(0.8rem, 2vw, 0.9rem)',
            maxWidth: '680px',
            margin: '0 auto',
            lineHeight: 1.6
          }}>
            A glimpse into genuine experiences from over {reviewPool.length} watch collectors and horology enthusiasts across India.
          </p>
        </div>

        {/* Carousel Control Bar */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '1.25rem',
          padding: '0 0.5rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.72rem', color: '#64748b' }}>
            <span style={{
              background: 'rgba(212, 175, 55, 0.15)',
              color: '#8a6709',
              fontWeight: 700,
              padding: '2px 8px',
              borderRadius: '50px',
              border: '1px solid rgba(180, 140, 30, 0.3)'
            }}>
              {reviewPool.length} Reviews
            </span>
            <span className="desktop-only" style={{ color: '#94a3b8' }}>• Continuous Horizontal Carousel</span>
          </div>

          <button
            onClick={() => setIsPaused(prev => !prev)}
            style={{
              background: '#ffffff',
              border: '1px solid rgba(0, 0, 0, 0.1)',
              borderRadius: '20px',
              color: '#475569',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              fontSize: '0.68rem',
              fontWeight: 600,
              cursor: 'pointer',
              padding: '4px 10px',
              boxShadow: '0 2px 6px rgba(0,0,0,0.04)',
              transition: 'all 0.2s ease'
            }}
            title={isPaused ? "Resume continuous rotation" : "Pause continuous rotation"}
          >
            {isPaused ? <Play size={11} color="#8a6709" /> : <Pause size={11} color="#8a6709" />}
            <span>{isPaused ? 'Resume Carousel' : 'Pause Carousel'}</span>
          </button>
        </div>
      </div>

      {/* Infinite Horizontal Review Carousel (Marquee) */}
      <div
        className="review-marquee-container"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        style={{
          width: '100%',
          overflow: 'hidden',
          position: 'relative',
          padding: '0.75rem 0'
        }}
      >
        <div
          className="review-marquee-track"
          style={{
            display: 'flex',
            gap: '1.25rem',
            width: 'max-content',
            animation: isPaused ? 'none' : 'reviewScroll 135s linear infinite',
            animationPlayState: isPaused ? 'paused' : 'running',
            padding: '0.25rem 1rem'
          }}
        >
          {displayReviews.map((rev, idx) => {
            const initials = rev.avatar || (rev.author ? rev.author.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() : 'LW');
            const ratingCount = Math.min(Math.max(rev.rating || 5, 1), 5);

            return (
              <div
                key={`${rev.id}-${idx}`}
                className="review-card-hover"
                style={{
                  width: 'clamp(280px, 85vw, 340px)',
                  minHeight: '225px',
                  flexShrink: 0,
                  background: '#ffffff',
                  border: '1px solid rgba(0, 0, 0, 0.08)',
                  borderRadius: '10px',
                  padding: '1.25rem',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  boxShadow: '0 4px 18px rgba(15, 23, 42, 0.04)',
                  position: 'relative',
                  overflow: 'hidden'
                }}
              >
                {/* Top Gold Accent Bar */}
                <div style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  height: '3px',
                  background: 'linear-gradient(90deg, #8a6709, #d4af37, #f3e5ab)'
                }} />

                {/* Top Rating & Header */}
                <div>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: '0.65rem'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <div style={{ display: 'flex', gap: '2px' }}>
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            size={13}
                            color="#d4af37"
                            fill={i < ratingCount ? "#d4af37" : "transparent"}
                          />
                        ))}
                      </div>
                      <span style={{ fontSize: '0.68rem', fontWeight: 700, color: '#8a6709', marginLeft: '3px' }}>
                        {ratingCount}.0
                      </span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      {rev.verified && (
                        <span style={{
                          fontSize: '0.6rem',
                          background: 'rgba(16, 185, 129, 0.12)',
                          color: '#059669',
                          padding: '2px 6px',
                          borderRadius: '3px',
                          fontWeight: 700,
                          letterSpacing: '0.02em'
                        }}>
                          Verified
                        </span>
                      )}
                      <Quote size={16} color="#8a6709" style={{ opacity: 0.25 }} />
                    </div>
                  </div>

                  {/* Review Title */}
                  {rev.title && (
                    <h4 style={{
                      fontSize: '0.82rem',
                      fontWeight: 700,
                      color: '#0f172a',
                      margin: '0 0 0.35rem 0',
                      lineHeight: 1.35,
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis'
                    }}>
                      {rev.title}
                    </h4>
                  )}

                  {/* Review Comment Text */}
                  <p style={{
                    fontSize: '0.78rem',
                    color: '#334155',
                    lineHeight: 1.55,
                    fontStyle: 'italic',
                    margin: 0,
                    display: '-webkit-box',
                    WebkitLineClamp: 3,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden'
                  }}>
                    "{rev.comment}"
                  </p>
                </div>

                {/* Bottom Author Credentials */}
                <div style={{
                  borderTop: '1px solid rgba(0, 0, 0, 0.06)',
                  paddingTop: '0.75rem',
                  marginTop: '0.75rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px'
                }}>
                  {/* Avatar Initials Circle */}
                  <div style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    background: 'radial-gradient(circle, rgba(212, 175, 55, 0.15) 0%, #f8fafc 100%)',
                    border: '1px solid rgba(180, 140, 30, 0.3)',
                    color: '#8a6709',
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}>
                    {initials}
                  </div>

                  {/* Author Name, Location & Watch Model */}
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div style={{
                      fontSize: '0.8rem',
                      fontWeight: 700,
                      color: '#0f172a',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis'
                    }}>
                      {rev.author}
                    </div>
                    <div style={{
                      fontSize: '0.68rem',
                      color: '#64748b',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis'
                    }}>
                      {rev.location || 'India'}
                      {rev.watch ? ` • ${rev.watch}` : ''}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default ReviewsSection;

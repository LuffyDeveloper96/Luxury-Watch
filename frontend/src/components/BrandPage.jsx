import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { ProductCard } from './ProductCard';
import {
  ShieldCheck, Award, ArrowLeft, SlidersHorizontal,
  Sparkles, Layers, Clock, Globe
} from 'lucide-react';

export const BrandPage = ({ brandSlug, onBackToStore, onSelectProduct }) => {
  const { products, brands, setSelectedProductDetails } = useStore();
  const [sortBy, setSortBy] = useState('featured'); // 'featured' | 'price-low' | 'price-high' | 'rating'

  // Match brand by slug or name
  const cleanSlug = (brandSlug || '').toLowerCase().trim();
  const brand = brands.find(b =>
    (b.slug && b.slug.toLowerCase() === cleanSlug) ||
    (b.name && b.name.toLowerCase() === cleanSlug) ||
    (b.name && b.name.toLowerCase().replace(/[^a-z0-9]/g, '-') === cleanSlug)
  ) || {
    name: cleanSlug.charAt(0).toUpperCase() + cleanSlug.slice(1),
    slug: cleanSlug,
    description: `Authenticated precision timepieces from ${cleanSlug.toUpperCase()}. Each model undergoes strict chronometer inspection.`,
    origin: 'Switzerland',
    established: '1905',
    badge: 'OFFICIAL ICON'
  };

  // Filter products by brand
  const brandNameLower = brand.name.toLowerCase();
  let brandProducts = products.filter(p => {
    const pBrand = (p.brand || '').toLowerCase();
    return pBrand === brandNameLower || pBrand.includes(brandNameLower) || brandNameLower.includes(pBrand);
  });

  // Apply sorting
  if (sortBy === 'price-low') {
    brandProducts = [...brandProducts].sort((a, b) => (a.price || 0) - (b.price || 0));
  } else if (sortBy === 'price-high') {
    brandProducts = [...brandProducts].sort((a, b) => (b.price || 0) - (a.price || 0));
  } else if (sortBy === 'rating') {
    brandProducts = [...brandProducts].sort((a, b) => (b.rating || 0) - (a.rating || 0));
  }

  const bgBanner = brand.bannerUrl || brand.image || '/images/watches/rolex_submariner.jpg';

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#fcfbfa' }}>
      {/* Brand Hero Showcase Banner */}
      <section style={{
        position: 'relative',
        minHeight: '380px',
        display: 'flex',
        alignItems: 'center',
        background: '#07090f',
        overflow: 'hidden',
        borderBottom: '1px solid rgba(180, 140, 30, 0.3)'
      }}>
        {/* Background Atmosphere Image */}
        <div style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: `url(${bgBanner})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          filter: 'brightness(0.35) contrast(1.1)',
          transform: 'scale(1.03)',
          transition: 'transform 10s ease'
        }} />

        {/* Ambient Gradient Overlay */}
        <div style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(to right, rgba(7, 9, 15, 0.95) 0%, rgba(7, 9, 15, 0.7) 50%, rgba(7, 9, 15, 0.9) 100%)'
        }} />

        <div className="luxury-container" style={{ position: 'relative', zIndex: 2, padding: '3rem 1.5rem' }}>
          {/* Back Button */}
          <button
            onClick={onBackToStore}
            style={{
              background: 'rgba(255, 255, 255, 0.1)',
              border: '1px solid rgba(212, 175, 55, 0.3)',
              borderRadius: '4px',
              color: '#f3e5ab',
              padding: '6px 14px',
              fontSize: '0.75rem',
              fontWeight: 600,
              letterSpacing: '0.08em',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              marginBottom: '1.5rem',
              backdropFilter: 'blur(8px)',
              transition: 'all 0.2s ease'
            }}
          >
            <ArrowLeft size={14} />
            <span>RETURN TO PORTFOLIO</span>
          </button>

          <div style={{ maxWidth: '750px' }}>
            {/* Top Badge */}
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              background: 'rgba(212, 175, 55, 0.15)',
              border: '1px solid rgba(212, 175, 55, 0.4)',
              padding: '4px 10px',
              borderRadius: '50px',
              marginBottom: '0.85rem'
            }}>
              <Award size={13} color="#f3e5ab" />
              <span style={{ fontSize: '0.68rem', letterSpacing: '0.14em', color: '#f3e5ab', fontWeight: 700, textTransform: 'uppercase' }}>
                {brand.badge || 'OFFICIAL ICON & MANUFACTURE'}
              </span>
            </div>

            {/* Brand Title */}
            <h1 style={{
              fontFamily: 'var(--font-brand)',
              fontSize: 'clamp(2rem, 6vw, 3.5rem)',
              color: '#ffffff',
              letterSpacing: '0.04em',
              margin: '0 0 0.75rem 0',
              lineHeight: 1.15
            }}>
              {brand.name}
            </h1>

            {/* Brand Metadata */}
            <div style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '1.25rem',
              fontSize: '0.78rem',
              color: '#cbd5e1',
              marginBottom: '1rem'
            }}>
              {brand.origin && (
                <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <Globe size={14} color="#d4af37" />
                  <span>{brand.origin}</span>
                </span>
              )}
              {brand.established && (
                <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <Clock size={14} color="#d4af37" />
                  <span>Est. {brand.established}</span>
                </span>
              )}
              <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                <Layers size={14} color="#d4af37" />
                <span>{brandProducts.length} Timepieces in Allocation</span>
              </span>
            </div>

            {/* Brand Description */}
            <p style={{
              fontSize: 'clamp(0.85rem, 2vw, 0.98rem)',
              color: '#94a3b8',
              lineHeight: 1.6,
              margin: 0,
              maxWidth: '680px'
            }}>
              {brand.description || brand.story || `Explore our handpicked curation of ${brand.name} timepieces, accompanied by international warranty and authenticity verification.`}
            </p>
          </div>
        </div>
      </section>

      {/* Main Brand Products Catalog */}
      <section style={{ padding: 'clamp(2.5rem, 5vw, 4rem) 0' }}>
        <div className="luxury-container">
          {/* Header Controls Bar */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '1rem',
            marginBottom: '2rem',
            paddingBottom: '1rem',
            borderBottom: '1px solid rgba(0, 0, 0, 0.08)'
          }}>
            <div>
              <h2 style={{
                fontFamily: 'var(--font-brand)',
                fontSize: '1.25rem',
                color: '#0f172a',
                margin: 0
              }}>
                {brand.name} Collections ({brandProducts.length})
              </h2>
              <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                All pieces backed by 2-Year Luxury Watch guarantee & worldwide insured transit
              </span>
            </div>

            {/* Sorter */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <SlidersHorizontal size={14} color="#8a6709" />
              <span style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase' }}>Sort:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="lux-select"
                style={{ padding: '6px 12px', fontSize: '0.78rem', width: 'auto' }}
              >
                <option value="featured">Featured Allocations</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="rating">Highest Rated</option>
              </select>
            </div>
          </div>

          {/* Product Grid or Empty State */}
          {brandProducts.length === 0 ? (
            <div style={{
              textAlign: 'center',
              padding: '4.5rem 1.5rem',
              backgroundColor: '#ffffff',
              borderRadius: '8px',
              border: '1px dashed #cbd5e1',
              maxWidth: '500px',
              margin: '0 auto'
            }}>
              <ShieldCheck size={36} color="#8a6709" style={{ margin: '0 auto 1rem auto' }} />
              <h3 style={{ fontFamily: 'var(--font-brand)', fontSize: '1.2rem', color: '#0f172a', marginBottom: '0.5rem' }}>
                New Allocations Arriving Soon
              </h3>
              <p style={{ color: '#64748b', fontSize: '0.85rem', marginBottom: '1.5rem', lineHeight: 1.5 }}>
                Our curatorial atelier is currently acquiring new authenticated {brand.name} specimens. Check back shortly or browse our other prestigous manufactures.
              </p>
              <button
                onClick={onBackToStore}
                className="btn-gold"
                style={{ padding: '8px 20px', fontSize: '0.8rem' }}
              >
                Browse All Timepieces
              </button>
            </div>
          ) : (
            <div className="product-grid">
              {brandProducts.map(product => (
                <ProductCard
                  key={product.id || product._id}
                  product={product}
                  onSelectProduct={(p) => {
                    if (onSelectProduct) {
                      onSelectProduct(p);
                    } else if (setSelectedProductDetails) {
                      setSelectedProductDetails(p);
                    }
                  }}
                />
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default BrandPage;

import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { X, Search, ArrowRight, Star } from 'lucide-react';

export const SearchModal = () => {
  const {
    isSearchOpen,
    setIsSearchOpen,
    products,
    formatPrice,
    setSelectedProductDetails,
    addToCart
  } = useStore();

  const [query, setQuery] = useState('');

  if (!isSearchOpen) return null;

  const results = query.trim() === ''
    ? products.slice(0, 4)
    : products.filter(p =>
        p.name.toLowerCase().includes(query.toLowerCase()) ||
        p.category.toLowerCase().includes(query.toLowerCase()) ||
        p.subtitle?.toLowerCase().includes(query.toLowerCase()) ||
        p.description?.toLowerCase().includes(query.toLowerCase())
      );

  const quickSearches = ['Chronograph', 'Skeleton Automatic', 'Diamond', 'Rose Gold', '300M Diver', 'Moonphase'];

  return (
    <div className="modal-backdrop" onClick={() => setIsSearchOpen(false)}>
      <div
        className="glass-panel animate-fade-in"
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: '820px',
          maxHeight: '85vh',
          overflowY: 'auto',
          backgroundColor: '#ffffff',
          border: '1px solid var(--border-gold)',
          borderRadius: '8px',
          padding: '2rem',
          position: 'relative',
          boxShadow: '0 25px 60px rgba(15, 23, 42, 0.15)'
        }}
      >
        <button
          onClick={() => setIsSearchOpen(false)}
          style={{
            position: 'absolute',
            top: '1.25rem',
            right: '1.25rem',
            background: 'none',
            border: 'none',
            color: '#64748b',
            cursor: 'pointer'
          }}
        >
          <X size={20} />
        </button>

        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          <span style={{ fontSize: '0.72rem', letterSpacing: '0.2em', color: '#8a6709', textTransform: 'uppercase', fontWeight: 700 }}>
            EXPLORE TIMEPIECE ARCHIVES
          </span>
          <h3 style={{ fontSize: '1.5rem', color: '#0f172a', fontFamily: 'var(--font-brand)', margin: '4px 0', fontWeight: 700 }}>
            Instant Horology Search
          </h3>
        </div>

        {/* Search Bar Input */}
        <div style={{ position: 'relative', marginBottom: '1.25rem' }}>
          <Search size={20} color="#8a6709" style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)' }} />
          <input
            type="text"
            placeholder="Search by model name, movement calibre, complication or metal..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
            className="lux-input"
            style={{ paddingLeft: '48px', fontSize: '1rem', height: '52px' }}
          />
        </div>

        {/* Quick Tags */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: '1.75rem' }}>
          <span style={{ fontSize: '0.72rem', color: '#64748b', textTransform: 'uppercase' }}>Suggested:</span>
          {quickSearches.map(q => (
            <button
              key={q}
              onClick={() => setQuery(q)}
              style={{
                background: '#f8f7f4',
                border: '1px solid rgba(0, 0, 0, 0.08)',
                color: '#475569',
                padding: '4px 10px',
                borderRadius: '2px',
                fontSize: '0.72rem',
                cursor: 'pointer',
                fontWeight: 500
              }}
            >
              {q}
            </button>
          ))}
        </div>

        {/* Results Grid */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <span style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
              {query ? `Search Results (${results.length})` : 'Featured Timepieces'}
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
            {results.map(prod => (
              <div
                key={prod.id}
                onClick={() => {
                  setIsSearchOpen(false);
                  setSelectedProductDetails(prod);
                }}
                style={{
                  background: '#ffffff',
                  border: '1px solid rgba(0, 0, 0, 0.08)',
                  boxShadow: 'var(--shadow-sm)',
                  borderRadius: '6px',
                  padding: '10px',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
              >
                <img
                  src={prod.images?.[0]}
                  alt=""
                  style={{ width: '100%', height: '140px', objectFit: 'cover', borderRadius: '4px', background: '#f8f7f4', marginBottom: '8px' }}
                />
                <span style={{ fontSize: '0.65rem', color: '#8a6709', textTransform: 'uppercase', fontWeight: 600 }}>{prod.category}</span>
                <h4 style={{ fontSize: '0.85rem', color: '#0f172a', fontFamily: 'var(--font-brand)', margin: '2px 0', fontWeight: 700 }}>
                  {prod.name}
                </h4>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '6px' }}>
                  <span style={{ fontSize: '0.9rem', color: '#0f172a', fontWeight: 700 }}>
                    {formatPrice(prod.price)}
                  </span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
                    <Star size={11} color="#d4af37" fill="#d4af37" />
                    <span style={{ fontSize: '0.72rem', color: '#0f172a', fontWeight: 600 }}>{prod.rating}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

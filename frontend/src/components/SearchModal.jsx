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
          backgroundColor: '#0c0e14',
          border: '1px solid var(--border-gold)',
          borderRadius: '8px',
          padding: '2rem',
          position: 'relative'
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
            color: '#cbd5e1',
            cursor: 'pointer'
          }}
        >
          <X size={20} />
        </button>

        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          <span style={{ fontSize: '0.72rem', letterSpacing: '0.2em', color: '#d4af37', textTransform: 'uppercase', fontWeight: 600 }}>
            EXPLORE TIMEPIECE ARCHIVES
          </span>
          <h3 style={{ fontSize: '1.5rem', color: '#f8fafc', fontFamily: 'var(--font-brand)', margin: '4px 0' }}>
            Instant Horology Search
          </h3>
        </div>

        {/* Search Bar Input */}
        <div style={{ position: 'relative', marginBottom: '1.25rem' }}>
          <Search size={20} color="#d4af37" style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)' }} />
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
          <span style={{ fontSize: '0.72rem', color: '#94a3b8', textTransform: 'uppercase' }}>Suggested:</span>
          {quickSearches.map(q => (
            <button
              key={q}
              onClick={() => setQuery(q)}
              style={{
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                color: '#cbd5e1',
                padding: '4px 10px',
                borderRadius: '2px',
                fontSize: '0.72rem',
                cursor: 'pointer'
              }}
            >
              {q}
            </button>
          ))}
        </div>

        {/* Results Grid */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <span style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
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
                  background: '#12141a',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  borderRadius: '6px',
                  padding: '10px',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
              >
                <img
                  src={prod.images?.[0]}
                  alt=""
                  style={{ width: '100%', height: '140px', objectFit: 'cover', borderRadius: '4px', background: '#000', marginBottom: '8px' }}
                />
                <span style={{ fontSize: '0.65rem', color: '#d4af37', textTransform: 'uppercase' }}>{prod.category}</span>
                <h4 style={{ fontSize: '0.85rem', color: '#f8fafc', fontFamily: 'var(--font-brand)', margin: '2px 0' }}>
                  {prod.name}
                </h4>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '6px' }}>
                  <span style={{ fontSize: '0.9rem', color: '#f3e5ab', fontWeight: 700 }}>
                    {formatPrice(prod.price)}
                  </span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
                    <Star size={11} color="#d4af37" fill="#d4af37" />
                    <span style={{ fontSize: '0.72rem', color: '#f8fafc' }}>{prod.rating}</span>
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

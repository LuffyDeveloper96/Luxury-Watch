import React from 'react';
import { useStore } from '../context/StoreContext';
import { X, Heart, ShoppingBag, Trash2, ArrowRight } from 'lucide-react';

export const WishlistDrawer = () => {
  const {
    isWishlistOpen,
    setIsWishlistOpen,
    wishlist,
    toggleWishlist,
    addToCart,
    formatPrice,
    setSelectedProductDetails
  } = useStore();

  if (!isWishlistOpen) return null;

  return (
    <div className="modal-backdrop" onClick={() => setIsWishlistOpen(false)}>
      <div
        className="animate-slide-right"
        onClick={(e) => e.stopPropagation()}
        style={{
          position: 'fixed',
          top: 0,
          right: 0,
          bottom: 0,
          width: '100%',
          maxWidth: '440px',
          backgroundColor: '#0c0e14',
          borderLeft: '1px solid var(--border-gold)',
          boxShadow: '-10px 0 40px rgba(0, 0, 0, 0.8)',
          display: 'flex',
          flexDirection: 'column',
          zIndex: 1000
        }}
      >
        {/* Header */}
        <div style={{
          padding: '1.25rem 1.5rem',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: '#07080a'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Heart size={18} color="#e11d48" fill="#e11d48" />
            <h3 style={{
              fontSize: '1rem',
              color: '#f8fafc',
              fontFamily: 'var(--font-brand)',
              letterSpacing: '0.12em',
              textTransform: 'uppercase'
            }}>
              Private Wishlist ({wishlist.length})
            </h3>
          </div>

          <button
            onClick={() => setIsWishlistOpen(false)}
            style={{
              background: 'none',
              border: 'none',
              color: '#94a3b8',
              cursor: 'pointer',
              padding: '4px'
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Wishlist Items List */}
        <div style={{
          flex: 1,
          overflowY: 'auto',
          padding: '1.25rem 1.5rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '1.25rem'
        }}>
          {wishlist.length === 0 ? (
            <div style={{
              textAlign: 'center',
              padding: '4rem 1rem',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '1rem'
            }}>
              <Heart size={48} color="#475569" strokeWidth={1} />
              <p style={{ color: '#94a3b8', fontSize: '0.9rem' }}>
                Your private horology wishlist is empty.
              </p>
              <button
                onClick={() => setIsWishlistOpen(false)}
                className="btn-outline-gold"
                style={{ padding: '0.75rem 1.5rem', fontSize: '0.78rem' }}
              >
                Explore Catalog
              </button>
            </div>
          ) : (
            wishlist.map(product => (
              <div
                key={product.id}
                style={{
                  display: 'flex',
                  gap: '1rem',
                  paddingBottom: '1rem',
                  borderBottom: '1px solid rgba(255, 255, 255, 0.06)'
                }}
              >
                <img
                  src={product.images?.[0]}
                  alt={product.name}
                  style={{ width: '70px', height: '70px', objectFit: 'cover', borderRadius: '4px', background: '#000', cursor: 'pointer' }}
                  onClick={() => {
                    setIsWishlistOpen(false);
                    setSelectedProductDetails(product);
                  }}
                />

                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <h4
                        onClick={() => {
                          setIsWishlistOpen(false);
                          setSelectedProductDetails(product);
                        }}
                        style={{ fontSize: '0.85rem', color: '#f8fafc', fontFamily: 'var(--font-brand)', cursor: 'pointer' }}
                      >
                        {product.name}
                      </h4>
                      <button
                        onClick={() => toggleWishlist(product)}
                        style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer' }}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                    <span style={{ fontSize: '0.72rem', color: '#d4af37' }}>
                      {product.category}
                    </span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '6px' }}>
                    <span style={{ fontSize: '0.9rem', fontWeight: 700, color: '#f3e5ab' }}>
                      {formatPrice(product.price)}
                    </span>

                    <button
                      onClick={() => {
                        addToCart(product, 1);
                        toggleWishlist(product);
                      }}
                      className="btn-gold"
                      style={{ padding: '0.45rem 0.85rem', fontSize: '0.7rem' }}
                    >
                      <ShoppingBag size={13} />
                      <span>Move to Bag</span>
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

import React from 'react';
import { useStore } from '../context/StoreContext';
import { formatCurrency } from '../utils/currency';
import { X, Heart, ShoppingBag, Trash2, Zap } from 'lucide-react';

export const WishlistModal = ({ isOpen, onClose, onSelectProduct }) => {
  const {
    wishlist,
    products,
    currency,
    toggleWishlist,
    addToCart,
    triggerBuyNow
  } = useStore();

  if (!isOpen) return null;

  const wishlistProducts = products.filter(p => wishlist.includes(p.id));

  return (
    <div className="modal-backdrop animate-fade-in" style={{ zIndex: 1100 }} onClick={onClose}>
      <div
        className="glass-panel"
        onClick={e => e.stopPropagation()}
        style={{
          maxWidth: '750px',
          width: '100%',
          maxHeight: '85vh',
          overflowY: 'auto',
          backgroundColor: '#0c0e14',
          border: '1px solid rgba(212, 175, 55, 0.4)',
          padding: '2rem',
          position: 'relative'
        }}
      >
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '1.25rem',
            right: '1.25rem',
            background: 'rgba(255,255,255,0.06)',
            border: 'none',
            color: '#94a3b8',
            borderRadius: '50%',
            width: '34px',
            height: '34px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <X size={18} />
        </button>

        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', color: '#fb7185', marginBottom: '0.3rem' }}>
            <Heart size={20} fill="#fb7185" />
            <span style={{ fontSize: '0.72rem', letterSpacing: '0.2em', textTransform: 'uppercase', fontWeight: 600 }}>
              YOUR VAULT WISHLIST
            </span>
          </div>
          <h2 style={{ fontSize: '1.5rem', color: '#ffffff' }}>Saved Haute Horlogerie Pieces</h2>
        </div>

        {wishlistProducts.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {wishlistProducts.map(prod => (
              <div
                key={prod.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  backgroundColor: '#12141c',
                  padding: '1rem',
                  borderRadius: '6px',
                  border: '1px solid rgba(255,255,255,0.06)',
                  flexWrap: 'wrap',
                  gap: '1rem'
                }}
              >
                <div
                  style={{ display: 'flex', alignItems: 'center', gap: '1rem', cursor: 'pointer' }}
                  onClick={() => {
                    onSelectProduct(prod);
                    onClose();
                  }}
                >
                  <img
                    src={prod.images[0]}
                    alt={prod.name}
                    style={{ width: '64px', height: '64px', objectFit: 'cover', borderRadius: '4px', backgroundColor: '#07080b' }}
                  />
                  <div>
                    <div style={{ fontSize: '0.7rem', color: '#d4af37', textTransform: 'uppercase' }}>{prod.category}</div>
                    <div style={{ fontSize: '0.95rem', fontWeight: 600, color: '#f8fafc' }}>{prod.name}</div>
                    <div style={{ fontSize: '1rem', fontWeight: 700, color: '#f3e5ab', fontFamily: 'var(--font-brand)' }}>
                      {formatCurrency(prod.price, currency)}
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                  <button
                    onClick={() => {
                      triggerBuyNow(prod, 1);
                      onClose();
                    }}
                    className="btn-buy-now"
                    style={{ padding: '0.5rem 1rem', fontSize: '0.75rem', width: 'auto' }}
                  >
                    <Zap size={13} fill="#d4af37" stroke="#d4af37" />
                    <span>BUY NOW</span>
                  </button>

                  <button
                    onClick={() => {
                      addToCart(prod, 1);
                      onClose();
                    }}
                    className="btn-dark"
                    style={{ padding: '0.5rem 0.9rem', fontSize: '0.75rem' }}
                  >
                    <ShoppingBag size={13} style={{ color: '#d4af37' }} />
                    <span>BAG</span>
                  </button>

                  <button
                    onClick={() => toggleWishlist(prod.id)}
                    style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', padding: '0.4rem' }}
                    title="Remove"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '3rem 1rem', color: '#94a3b8' }}>
            <Heart size={44} style={{ color: 'rgba(251, 113, 133, 0.3)', margin: '0 auto 1rem auto' }} />
            <h4 style={{ color: '#fff', fontSize: '1.1rem', marginBottom: '0.4rem' }}>Your Vault is Empty</h4>
            <p style={{ fontSize: '0.8rem' }}>
              Save your favorite timepieces to compare calibres and reserve for future occasions.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

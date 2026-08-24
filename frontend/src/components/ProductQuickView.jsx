import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { formatCurrency } from '../utils/currency';
import { X, Star, ShieldCheck, Zap, ShoppingBag, Check, Sparkles, Truck, Lock } from 'lucide-react';

export const ProductQuickView = () => {
  const {
    quickViewProduct,
    closeQuickView,
    currency,
    addToCart,
    triggerBuyNow,
    setSelectedProductDetails
  } = useStore();

  const product = quickViewProduct;
  if (!product) return null;

  const [activeImgIdx, setActiveImgIdx] = useState(0);
  const [selectedColor, setSelectedColor] = useState(product.colors?.[0]?.name || '');
  const [selectedStrap, setSelectedStrap] = useState(product.straps?.[0]?.name || '');
  const [engravingText, setEngravingText] = useState('');
  const [quantity, setQuantity] = useState(1);

  const handleAddToCart = () => {
    addToCart(product, quantity, {
      color: selectedColor,
      strap: selectedStrap,
      engraving: engravingText
    });
    closeQuickView();
  };

  const handleBuyNow = () => {
    triggerBuyNow(product, quantity, {
      color: selectedColor,
      strap: selectedStrap,
      engraving: engravingText
    });
    closeQuickView();
  };

  return (
    <div className="modal-backdrop animate-fade-in" onClick={closeQuickView}>
      <div
        className="glass-panel animate-slide-right"
        onClick={e => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: '900px',
          maxHeight: '90vh',
          overflowY: 'auto',
          backgroundColor: '#0e1017',
          border: '1px solid rgba(212, 175, 55, 0.4)',
          position: 'relative',
          padding: '2rem',
          boxShadow: '0 25px 60px rgba(0,0,0,0.9)'
        }}
      >
        {/* Close Button */}
        <button
          onClick={closeQuickView}
          style={{
            position: 'absolute',
            top: '1.25rem',
            right: '1.25rem',
            background: 'rgba(255,255,255,0.06)',
            border: 'none',
            color: '#cbd5e1',
            borderRadius: '50%',
            width: '36px',
            height: '36px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10,
            transition: 'background 0.2s'
          }}
          onMouseEnter={e => e.currentTarget.style.background = 'rgba(225, 29, 72, 0.3)'}
          onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.06)'}
        >
          <X size={18} />
        </button>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '2rem',
          alignItems: 'start'
        }}>
          {/* Gallery Side */}
          <div>
            <div style={{
              position: 'relative',
              borderRadius: '6px',
              overflow: 'hidden',
              backgroundColor: '#07080b',
              aspectRatio: '1',
              marginBottom: '1rem',
              border: '1px solid rgba(255,255,255,0.08)'
            }}>
              <img
                src={product.images[activeImgIdx] || product.images[0]}
                alt={product.name}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
              {product.badge && (
                <span className="badge-luxury badge-gold" style={{ position: 'absolute', top: '12px', left: '12px' }}>
                  {product.badge}
                </span>
              )}
            </div>

            {/* Thumbnails */}
            <div style={{ display: 'flex', gap: '0.6rem' }}>
              {product.images.map((img, idx) => (
                <div
                  key={idx}
                  onClick={() => setActiveImgIdx(idx)}
                  style={{
                    width: '64px',
                    height: '64px',
                    borderRadius: '4px',
                    overflow: 'hidden',
                    cursor: 'pointer',
                    border: activeImgIdx === idx ? '2px solid #d4af37' : '1px solid rgba(255,255,255,0.15)',
                    backgroundColor: '#07080b'
                  }}
                >
                  <img src={img} alt="thumb" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
              ))}
            </div>
          </div>

          {/* Details & Customization Side */}
          <div>
            <div style={{ fontSize: '0.72rem', color: '#d4af37', textTransform: 'uppercase', letterSpacing: '0.15em', fontWeight: 600, marginBottom: '0.3rem' }}>
              {product.category} • SKU: {product.sku}
            </div>

            <h2 style={{ fontSize: '1.45rem', color: '#ffffff', marginBottom: '0.5rem', lineHeight: 1.25 }}>
              {product.name}
            </h2>

            {/* Rating */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
              <div style={{ display: 'flex', color: '#d4af37' }}>
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={14} fill="#d4af37" stroke="#d4af37" />
                ))}
              </div>
              <span style={{ fontSize: '0.8rem', color: '#cbd5e1', fontWeight: 600 }}>{product.rating}</span>
              <span style={{ fontSize: '0.75rem', color: '#64748b' }}>({product.reviewsCount} collector reviews)</span>
            </div>

            {/* Price */}
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.8rem', marginBottom: '1.2rem' }}>
              <span style={{ fontSize: '1.6rem', fontWeight: 700, color: '#f8fafc', fontFamily: 'var(--font-brand)' }}>
                {formatCurrency(product.price, currency)}
              </span>
              {product.comparePrice && (
                <span style={{ fontSize: '0.95rem', color: '#64748b', textDecoration: 'line-through' }}>
                  {formatCurrency(product.comparePrice, currency)}
                </span>
              )}
            </div>

            {/* Stock meter */}
            <div style={{
              backgroundColor: 'rgba(212, 175, 55, 0.08)',
              border: '1px solid rgba(212, 175, 55, 0.25)',
              padding: '0.55rem 0.8rem',
              borderRadius: '4px',
              fontSize: '0.75rem',
              color: '#f3e5ab',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '1.25rem'
            }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <span className="live-pulse"></span>
                <span>Vault Status: <strong>{product.stock} available</strong> in Geneva workshop</span>
              </span>
              <span style={{ color: '#10b981', fontWeight: 600 }}>Ready to Dispatch</span>
            </div>

            {/* Color Dial Selector */}
            {product.colors && product.colors.length > 0 && (
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.75rem', color: '#cbd5e1', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.4rem' }}>
                  Dial & Finish: <strong style={{ color: '#d4af37' }}>{selectedColor}</strong>
                </label>
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  {product.colors.map((c, i) => (
                    <button
                      key={i}
                      onClick={() => {
                        setSelectedColor(c.name);
                        if (c.imageIndex !== undefined) setActiveImgIdx(c.imageIndex);
                      }}
                      style={{
                        background: selectedColor === c.name ? 'rgba(212, 175, 55, 0.2)' : '#141720',
                        border: selectedColor === c.name ? '1px solid #d4af37' : '1px solid rgba(255,255,255,0.1)',
                        color: selectedColor === c.name ? '#f3e5ab' : '#94a3b8',
                        padding: '0.35rem 0.75rem',
                        borderRadius: '3px',
                        fontSize: '0.75rem',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.4rem'
                      }}
                    >
                      <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: c.hex }} />
                      <span>{c.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Strap Selector */}
            {product.straps && product.straps.length > 0 && (
              <div style={{ marginBottom: '1.25rem' }}>
                <label style={{ display: 'block', fontSize: '0.75rem', color: '#cbd5e1', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.4rem' }}>
                  Strap Selection: <strong style={{ color: '#d4af37' }}>{selectedStrap}</strong>
                </label>
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  {product.straps.map((s, i) => (
                    <button
                      key={i}
                      onClick={() => setSelectedStrap(s.name)}
                      style={{
                        background: selectedStrap === s.name ? 'rgba(212, 175, 55, 0.2)' : '#141720',
                        border: selectedStrap === s.name ? '1px solid #d4af37' : '1px solid rgba(255,255,255,0.1)',
                        color: selectedStrap === s.name ? '#f3e5ab' : '#94a3b8',
                        padding: '0.35rem 0.75rem',
                        borderRadius: '3px',
                        fontSize: '0.75rem',
                        cursor: 'pointer'
                      }}
                    >
                      {s.name}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Bespoke Caseback Engraving Field */}
            <div style={{
              backgroundColor: '#12151e',
              border: '1px dashed rgba(212, 175, 55, 0.4)',
              padding: '0.85rem',
              borderRadius: '4px',
              marginBottom: '1.25rem'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
                <label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#f3e5ab', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <Sparkles size={12} style={{ color: '#d4af37' }} />
                  <span>Complimentary Caseback Engraving</span>
                </label>
                <span style={{ fontSize: '0.68rem', color: '#10b981', fontWeight: 600 }}>FREE (VALUED AT ₹15,000)</span>
              </div>
              <input
                type="text"
                maxLength={24}
                placeholder="e.g., A. STERLING • 2026 or INITALS"
                value={engravingText}
                onChange={(e) => setEngravingText(e.target.value.toUpperCase())}
                className="lux-input"
                style={{ fontSize: '0.8rem', padding: '0.5rem 0.75rem', letterSpacing: '0.1em' }}
              />
              <p style={{ fontSize: '0.68rem', color: '#64748b', marginTop: '0.3rem' }}>
                Laser-engraved by Swiss master horologists prior to dispatch ({24 - engravingText.length} characters left).
              </p>
            </div>

            {/* Quantity and Actions */}
            <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '0.8rem' }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                backgroundColor: '#141720',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '3px'
              }}>
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#f8fafc',
                    padding: '0.6rem 0.9rem',
                    cursor: 'pointer',
                    fontSize: '1rem'
                  }}
                >
                  -
                </button>
                <span style={{ padding: '0 0.5rem', fontSize: '0.85rem', fontWeight: 600, color: '#f8fafc' }}>
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#f8fafc',
                    padding: '0.6rem 0.9rem',
                    cursor: 'pointer',
                    fontSize: '1rem'
                  }}
                >
                  +
                </button>
              </div>

              {/* Express Buy Now */}
              <button
                onClick={handleBuyNow}
                className="btn-buy-now"
                style={{ flex: 1 }}
              >
                <Zap size={14} fill="#d4af37" stroke="#d4af37" />
                <span>EXPRESS VIP CHECKOUT</span>
              </button>
            </div>

            {/* Add to Bag */}
            <button
              onClick={handleAddToCart}
              className="btn-dark"
              style={{ width: '100%', marginBottom: '1rem' }}
            >
              <ShoppingBag size={15} style={{ color: '#d4af37' }} />
              <span>ADD TO BESPOKE BAG</span>
            </button>

            {/* Full PDP link */}
            <button
              onClick={() => {
                setSelectedProductDetails(product);
                closeQuickView();
              }}
              style={{
                width: '100%',
                background: 'none',
                border: 'none',
                color: '#d4af37',
                fontSize: '0.75rem',
                textDecoration: 'underline',
                cursor: 'pointer',
                textAlign: 'center'
              }}
            >
              View Full Horology Specifications & Customer Reviews →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

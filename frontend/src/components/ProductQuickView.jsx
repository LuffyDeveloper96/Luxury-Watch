import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { formatCurrency } from '../utils/currency';
import { X, Star, ShieldCheck, Zap, ShoppingBag, Check, Sparkles, Truck, Lock } from 'lucide-react';

export const ProductQuickView = () => {
  const {
    quickViewProduct,
    setQuickViewProduct,
    closeQuickView,
    currency,
    addToCart,
    buyNow,
    triggerBuyNow,
    setSelectedProductDetails
  } = useStore();

  const product = quickViewProduct;
  if (!product) return null;

  const handleClose = () => {
    if (typeof closeQuickView === 'function') {
      closeQuickView();
    } else if (typeof setQuickViewProduct === 'function') {
      setQuickViewProduct(null);
    }
  };

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
    handleClose();
  };

  const handleBuyNow = () => {
    if (typeof buyNow === 'function') {
      buyNow(product, quantity, {
        color: selectedColor,
        strap: selectedStrap,
        engraving: engravingText
      });
    } else if (typeof triggerBuyNow === 'function') {
      triggerBuyNow(product, quantity, {
        color: selectedColor,
        strap: selectedStrap,
        engraving: engravingText
      });
    }
    handleClose();
  };

  return (
    <div className="modal-backdrop animate-fade-in" onClick={handleClose}>
      <div
        className="glass-panel animate-slide-right"
        onClick={e => e.stopPropagation()}
        style={{
          width: 'min(94vw, 900px)',
          maxHeight: '90vh',
          overflowY: 'auto',
          backgroundColor: '#ffffff',
          border: '1px solid rgba(180, 140, 30, 0.35)',
          position: 'relative',
          padding: 'clamp(1rem, 3vw, 2rem)',
          boxShadow: '0 25px 60px rgba(15, 23, 42, 0.15)'
        }}
      >
        {/* Close Button */}
        <button
          onClick={closeQuickView}
          style={{
            position: 'absolute',
            top: '1rem',
            right: '1rem',
            background: 'rgba(0, 0, 0, 0.05)',
            border: 'none',
            color: '#475569',
            borderRadius: '50%',
            width: '36px',
            height: '36px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10,
            transition: 'all 0.2s'
          }}
          onMouseEnter={e => {
            e.currentTarget.style.background = 'rgba(225, 29, 72, 0.15)';
            e.currentTarget.style.color = '#e11d48';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.background = 'rgba(0, 0, 0, 0.05)';
            e.currentTarget.style.color = '#475569';
          }}
        >
          <X size={18} />
        </button>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))',
          gap: '1.5rem',
          alignItems: 'start'
        }}>
          {/* Gallery Side */}
          <div>
            <div style={{
              position: 'relative',
              borderRadius: '6px',
              overflow: 'hidden',
              backgroundColor: '#f8f7f4',
              aspectRatio: '1',
              marginBottom: '1rem',
              border: '1px solid rgba(0, 0, 0, 0.08)'
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
                    border: activeImgIdx === idx ? '2px solid #d4af37' : '1px solid rgba(0, 0, 0, 0.1)',
                    backgroundColor: '#f8f7f4'
                  }}
                >
                  <img src={img} alt="thumb" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
              ))}
            </div>
          </div>

          {/* Details & Customization Side */}
          <div>
            <div style={{ fontSize: '0.72rem', color: '#8a6709', textTransform: 'uppercase', letterSpacing: '0.15em', fontWeight: 700, marginBottom: '0.3rem' }}>
              {product.category} • SKU: {product.sku}
            </div>

            <h2 style={{ fontSize: '1.45rem', color: '#0f172a', marginBottom: '0.5rem', lineHeight: 1.25, fontWeight: 700 }}>
              {product.name}
            </h2>

            {/* Rating */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
              <div style={{ display: 'flex', color: '#d4af37' }}>
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={14} fill="#d4af37" stroke="#d4af37" />
                ))}
              </div>
              <span style={{ fontSize: '0.8rem', color: '#0f172a', fontWeight: 700 }}>{product.rating}</span>
              <span style={{ fontSize: '0.75rem', color: '#64748b' }}>({product.reviewsCount} collector reviews)</span>
            </div>

            {/* Price Row (Flipkart Style) */}
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.8rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '1.6rem', fontWeight: 800, color: '#0f172a', fontFamily: 'var(--font-brand)' }}>
                {formatCurrency(product.price, currency)}
              </span>
              {product.comparePrice && product.comparePrice > product.price && (
                <>
                  <span style={{ fontSize: '0.95rem', color: '#94a3b8', textDecoration: 'line-through' }}>
                    {formatCurrency(product.comparePrice, currency)}
                  </span>
                  <span style={{ fontSize: '0.9rem', color: '#16a34a', fontWeight: 800 }}>
                    {Math.round(((product.comparePrice - product.price) / product.comparePrice) * 100)}% off
                  </span>
                </>
              )}
            </div>

            {/* Stock meter */}
            <div style={{
              backgroundColor: 'rgba(180, 140, 30, 0.08)',
              border: '1px solid rgba(180, 140, 30, 0.25)',
              padding: '0.55rem 0.8rem',
              borderRadius: '4px',
              fontSize: '0.75rem',
              color: '#0f172a',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '1.25rem'
            }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <span className="live-pulse"></span>
                <span>Vault Status: <strong>{product.stock} available</strong> in Geneva workshop</span>
              </span>
              <span style={{ color: '#059669', fontWeight: 700 }}>Ready to Dispatch</span>
            </div>

            {/* Color Dial Selector */}
            {product.colors && product.colors.length > 0 && (
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.75rem', color: '#475569', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.4rem', fontWeight: 600 }}>
                  Dial & Finish: <strong style={{ color: '#8a6709' }}>{selectedColor}</strong>
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
                        background: selectedColor === c.name ? 'rgba(180, 140, 30, 0.12)' : '#ffffff',
                        border: selectedColor === c.name ? '1px solid #d4af37' : '1px solid rgba(0, 0, 0, 0.12)',
                        color: selectedColor === c.name ? '#8a6709' : '#475569',
                        padding: '0.35rem 0.75rem',
                        borderRadius: '3px',
                        fontSize: '0.75rem',
                        fontWeight: selectedColor === c.name ? 700 : 500,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.4rem'
                      }}
                    >
                      <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: c.hex, border: '1px solid rgba(0,0,0,0.15)' }} />
                      <span>{c.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Strap Selector */}
            {product.straps && product.straps.length > 0 && (
              <div style={{ marginBottom: '1.25rem' }}>
                <label style={{ display: 'block', fontSize: '0.75rem', color: '#475569', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.4rem', fontWeight: 600 }}>
                  Strap Selection: <strong style={{ color: '#8a6709' }}>{selectedStrap}</strong>
                </label>
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  {product.straps.map((s, i) => (
                    <button
                      key={i}
                      onClick={() => setSelectedStrap(s.name)}
                      style={{
                        background: selectedStrap === s.name ? 'rgba(180, 140, 30, 0.12)' : '#ffffff',
                        border: selectedStrap === s.name ? '1px solid #d4af37' : '1px solid rgba(0, 0, 0, 0.12)',
                        color: selectedStrap === s.name ? '#8a6709' : '#475569',
                        padding: '0.35rem 0.75rem',
                        borderRadius: '3px',
                        fontSize: '0.75rem',
                        fontWeight: selectedStrap === s.name ? 700 : 500,
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
              backgroundColor: '#fbfbf9',
              border: '1px dashed rgba(180, 140, 30, 0.4)',
              padding: '0.85rem',
              borderRadius: '4px',
              marginBottom: '1.25rem'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
                <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <Sparkles size={12} style={{ color: '#8a6709' }} />
                  <span>Complimentary Caseback Engraving</span>
                </label>
                <span style={{ fontSize: '0.68rem', color: '#059669', fontWeight: 700 }}>FREE (VALUED AT ₹15,000)</span>
              </div>
              <input
                type="text"
                maxLength={24}
                placeholder="e.g., A. STERLING • 2026 or INITALS"
                value={engravingText}
                onChange={(e) => setEngravingText(e.target.value.toUpperCase())}
                className="lux-input"
                style={{ fontSize: '0.8rem', padding: '0.5rem 0.75rem', letterSpacing: '0.1em', fontWeight: 600 }}
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
                backgroundColor: '#ffffff',
                border: '1px solid rgba(0, 0, 0, 0.15)',
                borderRadius: '3px'
              }}>
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#0f172a',
                    padding: '0.6rem 0.9rem',
                    cursor: 'pointer',
                    fontSize: '1rem',
                    fontWeight: 700
                  }}
                >
                  -
                </button>
                <span style={{ padding: '0 0.5rem', fontSize: '0.85rem', fontWeight: 700, color: '#0f172a' }}>
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#0f172a',
                    padding: '0.6rem 0.9rem',
                    cursor: 'pointer',
                    fontSize: '1rem',
                    fontWeight: 700
                  }}
                >
                  +
                </button>
              </div>

              {/* Buy Now */}
              <button
                type="button"
                onClick={handleBuyNow}
                className="btn-buy-now"
                style={{ flex: 1 }}
              >
                <Zap size={14} fill="#d4af37" stroke="#d4af37" />
                <span>BUY NOW</span>
              </button>
            </div>

            {/* Add to Bag */}
            <button
              onClick={handleAddToCart}
              className="btn-dark"
              style={{ width: '100%', marginBottom: '1rem' }}
            >
              <ShoppingBag size={15} style={{ color: '#8a6709' }} />
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
                color: '#8a6709',
                fontSize: '0.75rem',
                textDecoration: 'underline',
                cursor: 'pointer',
                textAlign: 'center',
                fontWeight: 600
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

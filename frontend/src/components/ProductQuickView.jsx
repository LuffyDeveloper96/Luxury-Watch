import React, { useState, useEffect } from 'react';
import { useStore } from '../context/StoreContext';
import { useUserAuth } from '../context/UserAuthContext';
import { formatCurrency } from '../utils/currency';
import { getImageUrl } from '../services/api';
import { normalizeProductMedia } from '../utils/media';
import { X, Star, ShieldCheck, Zap, ShoppingBag, Check, Sparkles, Truck, Lock, Play, Video } from 'lucide-react';

export const ProductQuickView = () => {
  const {
    quickViewProduct,
    setQuickViewProduct,
    closeQuickView,
    currency,
    addToCart,
    buyNow,
    triggerBuyNow,
    openCartCheckout,
    setSelectedProductDetails,
    addToast
  } = useStore();

  const { isAuthenticated, openAuthModal } = useUserAuth();

  const product = quickViewProduct;
  if (!product) return null;

  const handleClose = () => {
    if (typeof closeQuickView === 'function') {
      closeQuickView();
    } else if (typeof setQuickViewProduct === 'function') {
      setQuickViewProduct(null);
    }
  };

  const mediaList = normalizeProductMedia(product).slice(0, 5);
  const [activeMediaIdx, setActiveMediaIdx] = useState(0);
  const [selectedColor, setSelectedColor] = useState(product.colors?.[0]?.name || '');
  const [selectedStrap, setSelectedStrap] = useState(product.straps?.[0]?.name || '');
  const [engravingText, setEngravingText] = useState('');
  const [quantity, setQuantity] = useState(1);

  // Reset active media index and selections whenever opened product changes
  useEffect(() => {
    setActiveMediaIdx(0);
    setSelectedColor(product?.colors?.[0]?.name || '');
    setSelectedStrap(product?.straps?.[0]?.name || '');
    setQuantity(1);
    setEngravingText('');
  }, [product?.id]);

  const activeMedia = mediaList[activeMediaIdx] || mediaList[0] || { type: 'image', url: '/images/watches/rolex_submariner.jpg' };

  const handleAddToCart = () => {
    addToCart(product, quantity, {
      color: selectedColor,
      strap: selectedStrap,
      engraving: engravingText
    });
    handleClose();
  };

  const handleBuyNow = () => {
    if (!isAuthenticated) {
      if (typeof addToCart === 'function') {
        addToCart(product, quantity, {
          color: selectedColor,
          strap: selectedStrap,
          engraving: engravingText
        });
      }
      if (typeof addToast === 'function') {
        addToast('Please sign in or create an account to proceed with your acquisition.', 'info');
      }
      handleClose();
      if (typeof openAuthModal === 'function') {
        openAuthModal('signin', () => {
          if (typeof openCartCheckout === 'function') {
            openCartCheckout();
          } else if (typeof buyNow === 'function') {
            buyNow(product, quantity, {
              color: selectedColor,
              strap: selectedStrap,
              engraving: engravingText
            });
          }
        });
      }
      return;
    }

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
          width: 'min(94vw, 920px)',
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
          gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 340px), 1fr))',
          gap: '1.5rem',
          alignItems: 'start'
        }}>
          {/* Gallery Side: Amazon/Flipkart Multi-Media Gallery (Up to 5 media items) */}
          <div className="quick-inspection-gallery">
            <div className="quick-inspection-gallery-inner" style={{
              display: 'flex',
              gap: '12px',
              flexDirection: 'row',
              alignItems: 'flex-start'
            }}>
              {/* Vertical Thumbnails List (Horizontal on mobile) */}
              <div
                className="quick-inspection-thumbnails"
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px',
                  flexShrink: 0,
                  maxWidth: '70px',
                  maxHeight: '440px',
                  overflowY: 'auto'
                }}
              >
                {mediaList.map((item, idx) => {
                  const isSelected = activeMediaIdx === idx;
                  const isVid = item.type === 'video';
                  return (
                    <button
                      key={item.id || idx}
                      type="button"
                      onClick={() => setActiveMediaIdx(idx)}
                      style={{
                        width: '58px',
                        height: '58px',
                        borderRadius: '4px',
                        overflow: 'hidden',
                        cursor: 'pointer',
                        position: 'relative',
                        padding: 0,
                        border: isSelected ? '2px solid #d4af37' : '1px solid rgba(0, 0, 0, 0.14)',
                        boxShadow: isSelected ? '0 0 10px rgba(212, 175, 55, 0.45)' : 'none',
                        backgroundColor: '#f8f7f4',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: 'all 0.2s ease',
                        flexShrink: 0
                      }}
                      title={isVid ? `Media ${idx + 1}: Video` : `Media ${idx + 1}: Image`}
                      aria-label={isVid ? `View video ${idx + 1}` : `View image ${idx + 1}`}
                    >
                      {isVid ? (
                        <div style={{ width: '100%', height: '100%', background: '#0f172a', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
                          <Play size={18} fill="#d4af37" color="#d4af37" />
                          <span style={{ fontSize: '0.55rem', fontWeight: 800, color: '#f3e5ab', letterSpacing: '0.05em', marginTop: '2px' }}>
                            VIDEO
                          </span>
                        </div>
                      ) : (
                        <img
                          src={getImageUrl(item.url)}
                          alt={`${product.name} thumbnail ${idx + 1}`}
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = getImageUrl(product.images?.[0] || product.image || '/images/watches/rolex_submariner.jpg');
                          }}
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Main Selected Media Stage */}
              <div
                className="quick-inspection-main-media"
                style={{
                  position: 'relative',
                  borderRadius: '6px',
                  overflow: 'hidden',
                  backgroundColor: '#f8f7f4',
                  aspectRatio: '1',
                  flex: 1,
                  minWidth: 0,
                  border: '1px solid rgba(0, 0, 0, 0.08)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                {activeMedia.type === 'video' ? (
                  <video
                    key={activeMedia.url}
                    src={getImageUrl(activeMedia.url)}
                    controls
                    playsInline
                    preload="metadata"
                    style={{
                      width: '100%',
                      height: '100%',
                      maxHeight: '440px',
                      objectFit: 'contain',
                      backgroundColor: '#0b0f19'
                    }}
                  />
                ) : (
                  <img
                    key={activeMedia.url}
                    src={getImageUrl(activeMedia.url)}
                    alt={product.name}
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = getImageUrl(product.images?.[0] || product.image || '/images/watches/rolex_submariner.jpg');
                    }}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'contain',
                      transition: 'opacity 0.25s ease'
                    }}
                  />
                )}

                {product.badge && (
                  <span
                    className="badge-luxury badge-gold"
                    style={{
                      position: 'absolute',
                      top: '12px',
                      left: '12px',
                      zIndex: 2,
                      pointerEvents: 'none'
                    }}
                  >
                    {product.badge}
                  </span>
                )}
              </div>
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
                        if (c.imageIndex !== undefined) setActiveMediaIdx(c.imageIndex);
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

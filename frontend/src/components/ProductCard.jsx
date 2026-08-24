import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { formatCurrency } from '../utils/currency';
import { Heart, Eye, ShoppingBag, Zap, Star, Sparkles } from 'lucide-react';

export const ProductCard = ({ product, onSelectProduct }) => {
  const {
    currency,
    addToCart,
    triggerBuyNow,
    toggleWishlist,
    isInWishlist,
    openQuickView,
    setSelectedProductDetails
  } = useStore();

  const handleSelect = () => {
    if (typeof onSelectProduct === 'function') {
      onSelectProduct(product);
    } else if (typeof setSelectedProductDetails === 'function') {
      setSelectedProductDetails(product);
    }
  };

  const [selectedColorIdx, setSelectedColorIdx] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  const discountPercent = product.comparePrice
    ? Math.round(((product.comparePrice - product.price) / product.comparePrice) * 100)
    : 0;

  const currentImg =
    product.images[selectedColorIdx] ||
    (isHovered && product.images[1] ? product.images[1] : product.images[0]);

  const inWish = isInWishlist(product.id);

  return (
    <div
      className="glass-card"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        position: 'relative',
        backgroundColor: '#12141c',
        border: '1px solid rgba(255, 255, 255, 0.08)'
      }}
    >
      {/* Product Image Stage */}
      <div
        style={{
          position: 'relative',
          paddingTop: '105%',
          backgroundColor: '#0a0a0d',
          overflow: 'hidden',
          cursor: 'pointer'
        }}
        onClick={handleSelect}
      >
        <img
          src={currentImg}
          alt={product.name}
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            transition: 'transform 0.6s cubic-bezier(0.16, 1, 0.3, 1)',
            transform: isHovered ? 'scale(1.06)' : 'scale(1)'
          }}
          loading="lazy"
        />

        {/* Badges Overlay */}
        <div style={{
          position: 'absolute',
          top: '12px',
          left: '12px',
          display: 'flex',
          flexDirection: 'column',
          gap: '6px',
          zIndex: 5
        }}>
          {product.isLimited && (
            <span className="badge-luxury badge-limited">LIMITED</span>
          )}
          {product.isBestSeller && (
            <span className="badge-luxury badge-gold">BESTSELLER</span>
          )}
          {product.isNew && (
            <span className="badge-luxury badge-new">NEW EDITION</span>
          )}
          {discountPercent > 0 && (
            <span style={{
              background: '#10b981',
              color: '#ffffff',
              fontSize: '0.65rem',
              fontWeight: 700,
              padding: '2px 6px',
              borderRadius: '2px'
            }}>
              SAVE {discountPercent}%
            </span>
          )}
        </div>

        {/* Wishlist Icon */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            toggleWishlist(product.id);
          }}
          style={{
            position: 'absolute',
            top: '12px',
            right: '12px',
            background: 'rgba(11, 12, 16, 0.7)',
            backdropFilter: 'blur(8px)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '50%',
            width: '34px',
            height: '34px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            color: inWish ? '#e11d48' : '#cbd5e1',
            zIndex: 6,
            transition: 'all 0.2s ease'
          }}
          title="Save to Vault"
        >
          <Heart size={16} fill={inWish ? '#e11d48' : 'none'} />
        </button>

        {/* Quick View Button Hover Slide */}
        <div
          style={{
            position: 'absolute',
            bottom: '10px',
            left: '10px',
            right: '10px',
            opacity: isHovered ? 1 : 0,
            transform: isHovered ? 'translateY(0)' : 'translateY(10px)',
            transition: 'all 0.3s ease',
            zIndex: 6
          }}
        >
          <button
            onClick={(e) => {
              e.stopPropagation();
              openQuickView(product);
            }}
            style={{
              width: '100%',
              backgroundColor: 'rgba(11, 12, 16, 0.9)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(212, 175, 55, 0.4)',
              color: '#f8fafc',
              padding: '0.55rem',
              fontSize: '0.75rem',
              fontWeight: 600,
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              borderRadius: '3px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem'
            }}
          >
            <Eye size={14} style={{ color: '#d4af37' }} />
            <span>QUICK INSPECTION</span>
          </button>
        </div>
      </div>

      {/* Product Details Section */}
      <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', flex: 1 }}>
        {/* Category & Rating */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
          <span style={{
            fontSize: '0.68rem',
            color: '#d4af37',
            textTransform: 'uppercase',
            letterSpacing: '0.12em',
            fontWeight: 500
          }}>
            {product.category}
          </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.72rem', color: '#f3e5ab' }}>
            <Star size={12} fill="#d4af37" stroke="#d4af37" />
            <span style={{ fontWeight: 600 }}>{product.rating.toFixed(1)}</span>
            <span style={{ color: '#64748b' }}>({product.reviewsCount})</span>
          </div>
        </div>

        {/* Product Title */}
        <h4
          onClick={handleSelect}
          style={{
            fontSize: '0.98rem',
            color: '#f8fafc',
            marginBottom: '0.35rem',
            fontWeight: 600,
            cursor: 'pointer',
            letterSpacing: '0.04em',
            minHeight: '2.4em',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden'
          }}
        >
          {product.name}
        </h4>

        {/* Specs highlight line */}
        <p style={{
          fontSize: '0.75rem',
          color: '#94a3b8',
          marginBottom: '0.8rem',
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis'
        }}>
          {product.subtitle}
        </p>

        {/* Swatch Switcher (if multiple colors) */}
        {product.colors && product.colors.length > 1 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '1rem' }}>
            {product.colors.map((c, idx) => (
              <button
                key={idx}
                onClick={() => setSelectedColorIdx(idx)}
                style={{
                  width: '18px',
                  height: '18px',
                  borderRadius: '50%',
                  backgroundColor: c.hex,
                  border: selectedColorIdx === idx ? '2px solid #d4af37' : '1px solid rgba(255,255,255,0.2)',
                  cursor: 'pointer',
                  padding: 0,
                  boxShadow: selectedColorIdx === idx ? '0 0 8px rgba(212,175,55,0.5)' : 'none'
                }}
                title={c.name}
              />
            ))}
            <span style={{ fontSize: '0.68rem', color: '#64748b', marginLeft: '0.2rem' }}>
              {product.colors[selectedColorIdx]?.name}
            </span>
          </div>
        )}

        {/* Price Row */}
        <div style={{ marginTop: 'auto', paddingTop: '0.5rem', marginBottom: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.6rem' }}>
            <span style={{
              fontSize: '1.2rem',
              fontWeight: 700,
              color: '#f8fafc',
              fontFamily: 'var(--font-brand)'
            }}>
              {formatCurrency(product.price, currency)}
            </span>
            {product.comparePrice && (
              <span style={{
                fontSize: '0.82rem',
                color: '#64748b',
                textDecoration: 'line-through'
              }}>
                {formatCurrency(product.comparePrice, currency)}
              </span>
            )}
          </div>
          <div style={{ fontSize: '0.65rem', color: '#10b981', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
            <Sparkles size={10} />
            <span>Complimentary Bespoke Engraving Included</span>
          </div>
        </div>

        {/* Action Buttons (Express Buy Now & Add to Bag) */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {/* Gokwik / Express Buy Now Button */}
          <button
            onClick={() => triggerBuyNow(product, 1, {
              color: product.colors?.[selectedColorIdx]?.name
            })}
            className="btn-buy-now"
          >
            <Zap size={14} fill="#d4af37" stroke="#d4af37" />
            <span>EXPRESS BUY NOW</span>
          </button>

          {/* Add to Bag Button */}
          <button
            onClick={() => addToCart(product, 1, {
              color: product.colors?.[selectedColorIdx]?.name
            })}
            className="btn-dark"
            style={{ width: '100%', fontSize: '0.78rem', padding: '0.65rem' }}
          >
            <ShoppingBag size={14} style={{ color: '#d4af37' }} />
            <span>ADD TO BAG</span>
          </button>
        </div>
      </div>
    </div>
  );
};

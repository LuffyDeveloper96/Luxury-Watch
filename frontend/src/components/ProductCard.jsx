import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { formatCurrency } from '../utils/currency';
import { Heart, Eye, ShoppingBag, Zap, Star, Sparkles } from 'lucide-react';

export const ProductCard = ({ product, onSelectProduct }) => {
  const {
    currency,
    addToCart,
    buyNow,
    triggerBuyNow,
    toggleWishlist,
    isInWishlist,
    openQuickView,
    setQuickViewProduct,
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

  const handleBuyNowClick = (e) => {
    e.stopPropagation();
    const color = product.colors?.[selectedColorIdx]?.name || product.colors?.[0]?.name || '';
    const strap = product.straps?.[0]?.name || '';
    if (typeof buyNow === 'function') {
      buyNow(product, 1, { color, strap });
    } else if (typeof triggerBuyNow === 'function') {
      triggerBuyNow(product, 1, { color, strap });
    }
  };
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
        backgroundColor: '#ffffff',
        border: '1px solid rgba(0, 0, 0, 0.08)',
        boxShadow: isHovered ? 'var(--shadow-md), 0 0 20px rgba(180, 140, 30, 0.15)' : 'var(--shadow-sm)'
      }}
    >
      {/* Product Image Stage */}
      <div
        style={{
          position: 'relative',
          paddingTop: '105%',
          backgroundColor: '#f8f7f4',
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
              background: '#059669',
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
            background: 'rgba(255, 255, 255, 0.92)',
            backdropFilter: 'blur(8px)',
            border: '1px solid rgba(0, 0, 0, 0.08)',
            borderRadius: '50%',
            width: '34px',
            height: '34px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            color: inWish ? '#e11d48' : '#475569',
            zIndex: 6,
            boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
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
              backgroundColor: 'rgba(255, 255, 255, 0.96)',
              backdropFilter: 'blur(10px)',
              border: '1px solid #d4af37',
              color: '#0f172a',
              padding: '0.55rem',
              fontSize: '0.75rem',
              fontWeight: 700,
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              borderRadius: '3px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              boxShadow: '0 4px 15px rgba(0,0,0,0.08)'
            }}
          >
            <Eye size={14} style={{ color: '#8a6709' }} />
            <span>QUICK INSPECTION</span>
          </button>
        </div>
      </div>

      {/* Product Details Section */}
      <div style={{ padding: '1rem', display: 'flex', flexDirection: 'column', flex: 1 }}>
        {/* Brand & F-Assured Tag */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
          <span style={{
            fontSize: '0.72rem',
            color: '#8a6709',
            textTransform: 'uppercase',
            letterSpacing: '0.1em',
            fontWeight: 800
          }}>
            {product.brand}
          </span>
          <span style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '3px',
            background: 'linear-gradient(135deg, #1e3a8a, #0284c7)',
            color: '#ffffff',
            fontSize: '0.62rem',
            fontWeight: 800,
            padding: '2px 6px',
            borderRadius: '10px',
            letterSpacing: '0.04em'
          }}>
            <span style={{ color: '#facc15' }}>✦</span> F-Assured
          </span>
        </div>

        {/* Product Title (Flipkart Style) */}
        <h4
          onClick={handleSelect}
          style={{
            fontSize: '0.92rem',
            color: '#0f172a',
            marginBottom: '0.35rem',
            fontWeight: 700,
            cursor: 'pointer',
            lineHeight: 1.35,
            minHeight: '2.5em',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden'
          }}
          title={product.name}
        >
          {product.name}
        </h4>

        {/* Rating Pill & Reviews Count */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', marginBottom: '0.45rem' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '2px',
            background: '#16a34a',
            color: '#ffffff',
            fontSize: '0.68rem',
            fontWeight: 800,
            padding: '2px 5px',
            borderRadius: '4px'
          }}>
            <span>{product.rating?.toFixed(1) || '4.9'}</span>
            <Star size={10} fill="#ffffff" stroke="#ffffff" />
          </div>
          <span style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 500 }}>
            ({product.reviewsCount?.toLocaleString('en-IN') || '1,240'})
          </span>
        </div>

        {/* Specs snippet line */}
        <p style={{
          fontSize: '0.72rem',
          color: '#64748b',
          marginBottom: '0.6rem',
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis'
        }}>
          {product.subtitle}
        </p>

        {/* Swatch Switcher (if multiple colors) */}
        {product.colors && product.colors.length > 1 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.75rem' }}>
            {product.colors.map((c, idx) => (
              <button
                key={idx}
                onClick={() => setSelectedColorIdx(idx)}
                style={{
                  width: '16px',
                  height: '16px',
                  borderRadius: '50%',
                  backgroundColor: c.hex,
                  border: selectedColorIdx === idx ? '2px solid #8a6709' : '1px solid rgba(0,0,0,0.15)',
                  cursor: 'pointer',
                  padding: 0,
                  boxShadow: selectedColorIdx === idx ? '0 0 6px rgba(180,140,30,0.4)' : 'none'
                }}
                title={c.name}
              />
            ))}
            <span style={{ fontSize: '0.65rem', color: '#64748b', marginLeft: '0.2rem' }}>
              {product.colors[selectedColorIdx]?.name}
            </span>
          </div>
        )}

        {/* Price Row (Flipkart Price + Strikethrough + % Off) */}
        <div style={{ marginTop: 'auto', paddingTop: '0.4rem', marginBottom: '0.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem', flexWrap: 'wrap' }}>
            <span style={{
              fontSize: '1.22rem',
              fontWeight: 800,
              color: '#0f172a',
              fontFamily: 'var(--font-brand)'
            }}>
              {formatCurrency(product.price, currency)}
            </span>
            {product.comparePrice && product.comparePrice > product.price && (
              <>
                <span style={{
                  fontSize: '0.8rem',
                  color: '#94a3b8',
                  textDecoration: 'line-through'
                }}>
                  {formatCurrency(product.comparePrice, currency)}
                </span>
                <span style={{
                  fontSize: '0.78rem',
                  color: '#16a34a',
                  fontWeight: 800
                }}>
                  {discountPercent}% off
                </span>
              </>
            )}
          </div>
          <div style={{ fontSize: '0.68rem', color: '#0284c7', marginTop: '3px', fontWeight: 600 }}>
            ⚡ Free delivery by Tomorrow
          </div>
        </div>

        {/* Action Buttons (Express Buy Now & Add to Bag) */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {/* Buy Now Button */}
          <button
            type="button"
            onClick={handleBuyNowClick}
            className="btn-buy-now"
          >
            <Zap size={14} fill="#d4af37" stroke="#d4af37" />
            <span>BUY NOW</span>
          </button>

          {/* Add to Bag Button */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              addToCart(product, 1, {
                color: product.colors?.[selectedColorIdx]?.name
              });
            }}
            className="btn-dark"
            style={{ width: '100%', fontSize: '0.78rem', padding: '0.65rem' }}
          >
            <ShoppingBag size={14} style={{ color: '#8a6709' }} />
            <span>ADD TO BAG</span>
          </button>
        </div>
      </div>
    </div>
  );
};

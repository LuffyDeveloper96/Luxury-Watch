import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { useUserAuth } from '../context/UserAuthContext';
import { formatCurrency } from '../utils/currency';
import { getImageUrl } from '../services/api';
import {
  ArrowLeft, Star, ShieldCheck, Zap, ShoppingBag, Truck, Lock,
  Sparkles, Award, RefreshCw, CheckCircle2, ChevronRight, MessageSquare, Send
} from 'lucide-react';

export const ProductDetailsPage = ({ product: propProduct, onBack, onSelectOtherProduct }) => {
  const {
    currency,
    addToCart,
    buyNow,
    triggerBuyNow,
    openCartCheckout,
    toggleWishlist,
    isInWishlist,
    reviews,
    addReview,
    products,
    selectedProductDetails,
    setSelectedProductDetails,
    addToast
  } = useStore();

  const { isAuthenticated, openAuthModal } = useUserAuth();

  const product = propProduct || selectedProductDetails;

  if (!product) {
    return (
      <div style={{ padding: '6rem 1rem', textAlign: 'center', color: '#94a3b8' }}>
        <p>No timepiece selected for inspection.</p>
        <button
          onClick={() => setSelectedProductDetails && setSelectedProductDetails(null)}
          className="btn-gold"
          style={{ marginTop: '1rem' }}
        >
          Return to Collection
        </button>
      </div>
    );
  }

  const [activeImgIdx, setActiveImgIdx] = useState(0);
  const [selectedColor, setSelectedColor] = useState(product?.colors?.[0]?.name || 'Standard Edition');
  const [selectedStrap, setSelectedStrap] = useState(product?.straps?.[0]?.name || 'Default Strap');
  const [engravingText, setEngravingText] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState('specs'); // 'specs' | 'story' | 'warranty' | 'reviews'

  // Review form state
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [newReviewerName, setNewReviewerName] = useState('');
  const [newReviewRating, setNewReviewRating] = useState(5);
  const [newReviewTitle, setNewReviewTitle] = useState('');
  const [newReviewComment, setNewReviewComment] = useState('');
  const [newReviewLocation, setNewReviewLocation] = useState('');

  const inWish = isInWishlist(product.id);
  const productReviews = reviews.filter(r => r.productId === product.id);

  const relatedProducts = products
    .filter(p => p.id !== product.id && (p.category === product.category || p.isBestSeller))
    .slice(0, 3);

  const handleAddToCart = () => {
    addToCart(product, quantity, {
      color: selectedColor,
      strap: selectedStrap,
      engraving: engravingText
    });
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
  };

  const handleSubmitReview = (e) => {
    e.preventDefault();
    if (!newReviewerName.trim() || !newReviewComment.trim()) return;

    addReview({
      productId: product.id,
      userName: newReviewerName,
      rating: newReviewRating,
      title: newReviewTitle || 'Exquisite Horological Timepiece',
      comment: newReviewComment,
      location: newReviewLocation || 'London, UK'
    });

    setNewReviewerName('');
    setNewReviewTitle('');
    setNewReviewComment('');
    setNewReviewLocation('');
    setShowReviewForm(false);
  };

  return (
    <div style={{ backgroundColor: '#ffffff', color: '#0f172a', padding: '2rem 0 5rem 0' }}>
      <div className="luxury-container">
        {/* Navigation Breadcrumb */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          marginBottom: '2rem',
          fontSize: '0.78rem',
          color: '#64748b'
        }}>
          <button
            onClick={onBack}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#8a6709',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              fontWeight: 700
            }}
          >
            <ArrowLeft size={16} />
            <span>RETURN TO COLLECTION</span>
          </button>
          <span>/</span>
          <span>{product.category}</span>
          <span>/</span>
          <span style={{ color: '#0f172a', fontWeight: 600 }}>{product.name}</span>
        </div>

        {/* Main PDP Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 320px), 1fr))',
          gap: 'clamp(1.5rem, 4vw, 3.5rem)',
          alignItems: 'start',
          marginBottom: '5rem'
        }}>
          {/* Left Column: Multi-Angle Gallery & Caseback Visualizer */}
          <div>
            <div style={{
              position: 'relative',
              borderRadius: '8px',
              overflow: 'hidden',
              backgroundColor: '#f8f7f4',
              aspectRatio: '1',
              marginBottom: '1.25rem',
              border: '1px solid rgba(180, 140, 30, 0.25)',
              boxShadow: '0 10px 30px rgba(15, 23, 42, 0.08)'
            }}>
              <img
                src={getImageUrl(product.images[activeImgIdx] || product.images[0])}
                alt={product.name}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />

              {product.badge && (
                <span className="badge-luxury badge-gold" style={{ position: 'absolute', top: '16px', left: '16px' }}>
                  {product.badge}
                </span>
              )}

              {/* Caseback Live Engraving Visual Overlay Preview if user has entered text */}
              {engravingText && (
                <div style={{
                  position: 'absolute',
                  bottom: '16px',
                  right: '16px',
                  background: 'rgba(255, 255, 255, 0.95)',
                  border: '1px solid #d4af37',
                  padding: '0.5rem 0.8rem',
                  borderRadius: '4px',
                  fontSize: '0.72rem',
                  color: '#8a6709',
                  fontFamily: 'monospace',
                  letterSpacing: '0.15em',
                  boxShadow: '0 4px 15px rgba(0,0,0,0.1)'
                }}>
                  <div style={{ fontSize: '0.6rem', color: '#64748b', textTransform: 'uppercase' }}>Laser Engraving Preview:</div>
                  "{engravingText}"
                </div>
              )}
            </div>

            {/* Thumbnail selector */}
            <div style={{ display: 'flex', gap: '0.8rem', marginBottom: '2rem' }}>
              {product.images.map((img, idx) => (
                <div
                  key={idx}
                  onClick={() => setActiveImgIdx(idx)}
                  style={{
                    width: '80px',
                    height: '80px',
                    borderRadius: '6px',
                    overflow: 'hidden',
                    cursor: 'pointer',
                    border: activeImgIdx === idx ? '2px solid #d4af37' : '1px solid rgba(0,0,0,0.1)',
                    backgroundColor: '#f8f7f4',
                    transition: 'all 0.2s'
                  }}
                >
                  <img src={getImageUrl(img)} alt="angle" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
              ))}
            </div>

            {/* Trust Badges in PDP */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '1rem',
              backgroundColor: '#f8f7f4',
              padding: '1.25rem',
              borderRadius: '6px',
              border: '1px solid rgba(0, 0, 0, 0.08)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.75rem', color: '#334155' }}>
                <Truck size={18} style={{ color: '#8a6709' }} />
                <span>Pan-India BlueDart Air</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.75rem', color: '#334155' }}>
                <ShieldCheck size={18} style={{ color: '#8a6709' }} />
                <span>5-Year Official Warranty</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.75rem', color: '#334155' }}>
                <RefreshCw size={18} style={{ color: '#8a6709' }} />
                <span>7-Day Easy Exchange</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.75rem', color: '#334155' }}>
                <Lock size={18} style={{ color: '#8a6709' }} />
                <span>GST Compliant & Vault Card</span>
              </div>
            </div>
          </div>

          {/* Right Column: Title, Price, Customizer, Specs, Express Buy */}
          <div>
            <div style={{
              fontSize: '0.78rem',
              color: '#8a6709',
              textTransform: 'uppercase',
              letterSpacing: '0.15em',
              fontWeight: 700,
              marginBottom: '0.5rem'
            }}>
              {product.category} • SKU: {product.sku}
            </div>

            <h1 style={{
              fontSize: 'clamp(1.8rem, 3.2vw, 2.5rem)',
              color: '#0f172a',
              lineHeight: 1.2,
              marginBottom: '0.75rem',
              fontWeight: 700
            }}>
              {product.name}
            </h1>

            {/* Rating and Reviews Counter */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', color: '#d4af37' }}>
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={16} fill="#d4af37" stroke="#d4af37" />
                ))}
              </div>
              <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0f172a' }}>{product.rating} / 5.0</span>
              <span style={{ color: 'rgba(0,0,0,0.2)' }}>•</span>
              <a
                href="#reviews-section"
                onClick={() => setActiveTab('reviews')}
                style={{ fontSize: '0.8rem', color: '#8a6709', textDecoration: 'none', fontWeight: 600 }}
              >
                {product.reviewsCount} Verified Collector Reviews
              </a>
            </div>

            {/* Price Box */}
            <div style={{
              backgroundColor: '#fbfbf9',
              border: '1px solid rgba(180, 140, 30, 0.3)',
              padding: '1.25rem',
              borderRadius: '6px',
              marginBottom: '1.75rem'
            }}>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '1rem', marginBottom: '0.4rem' }}>
                <span style={{
                  fontSize: '2rem',
                  fontWeight: 700,
                  color: '#0f172a',
                  fontFamily: 'var(--font-brand)'
                }}>
                  {formatCurrency(product.price, currency)}
                </span>
                {product.comparePrice && (
                  <span style={{
                    fontSize: '1.1rem',
                    color: '#94a3b8',
                    textDecoration: 'line-through'
                  }}>
                    {formatCurrency(product.comparePrice, currency)}
                  </span>
                )}
              </div>
              <p style={{ fontSize: '0.78rem', color: '#059669', display: 'flex', alignItems: 'center', gap: '0.35rem', fontWeight: 500 }}>
                <Sparkles size={13} />
                <span>Inclusive of all Swiss import duties, taxes, and bespoke laser engraving</span>
              </p>
            </div>

            {/* Product Narrative Intro */}
            <p style={{
              fontSize: '0.92rem',
              color: '#475569',
              lineHeight: 1.7,
              marginBottom: '1.75rem',
              fontWeight: 400
            }}>
              {product.description}
            </p>

            {/* Dial / Color Finish Swatches */}
            {product.colors && product.colors.length > 0 && (
              <div style={{ marginBottom: '1.5rem' }}>
                <div style={{ fontSize: '0.8rem', color: '#475569', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.6rem', fontWeight: 600 }}>
                  Case & Dial Finish: <strong style={{ color: '#8a6709' }}>{selectedColor}</strong>
                </div>
                <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                  {product.colors.map((c, i) => (
                    <button
                      key={i}
                      onClick={() => {
                        setSelectedColor(c.name);
                        if (c.imageIndex !== undefined) setActiveImgIdx(c.imageIndex);
                      }}
                      style={{
                        background: selectedColor === c.name ? 'rgba(180, 140, 30, 0.12)' : '#ffffff',
                        border: selectedColor === c.name ? '1px solid #d4af37' : '1px solid rgba(0,0,0,0.12)',
                        color: selectedColor === c.name ? '#8a6709' : '#475569',
                        padding: '0.5rem 1rem',
                        borderRadius: '4px',
                        fontSize: '0.8rem',
                        fontWeight: selectedColor === c.name ? 700 : 500,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        transition: 'all 0.2s'
                      }}
                    >
                      <span style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: c.hex, border: '1px solid rgba(0,0,0,0.15)' }} />
                      <span>{c.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Strap Selection */}
            {product.straps && product.straps.length > 0 && (
              <div style={{ marginBottom: '1.75rem' }}>
                <div style={{ fontSize: '0.8rem', color: '#475569', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.6rem', fontWeight: 600 }}>
                  Supplied Horology Strap: <strong style={{ color: '#8a6709' }}>{selectedStrap}</strong>
                </div>
                <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                  {product.straps.map((s, i) => (
                    <button
                      key={i}
                      onClick={() => setSelectedStrap(s.name)}
                      style={{
                        background: selectedStrap === s.name ? 'rgba(180, 140, 30, 0.12)' : '#ffffff',
                        border: selectedStrap === s.name ? '1px solid #d4af37' : '1px solid rgba(0,0,0,0.12)',
                        color: selectedStrap === s.name ? '#8a6709' : '#475569',
                        padding: '0.5rem 1rem',
                        borderRadius: '4px',
                        fontSize: '0.8rem',
                        fontWeight: selectedStrap === s.name ? 700 : 500,
                        cursor: 'pointer',
                        transition: 'all 0.2s'
                      }}
                    >
                      {s.name}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Flipkart-Style Bank Offers Section */}
            <div style={{
              backgroundColor: '#f0fdf4',
              border: '1px solid #bbf7d0',
              borderRadius: '6px',
              padding: '1rem',
              marginBottom: '1.5rem'
            }}>
              <div style={{ fontSize: '0.8rem', fontWeight: 800, color: '#166534', display: 'flex', alignItems: 'center', gap: '5px', marginBottom: '0.5rem' }}>
                <span>🏷️</span>
                <span>AVAILABLE BANK & UPI OFFERS</span>
              </div>
              <ul style={{ margin: 0, paddingLeft: '1.1rem', fontSize: '0.74rem', color: '#15803d', lineHeight: 1.6 }}>
                <li><strong>Bank Offer:</strong> 10% Instant Discount on HDFC, ICICI, SBI, Axis Credit/Debit Cards</li>
                <li><strong>UPI Special:</strong> Extra ₹150 Instant Cashback with PhonePe, Google Pay, or Paytm</li>
                <li><strong>Special Price:</strong> Get 10% off with promo coupon <code style={{ background: '#dcfce7', padding: '1px 5px', borderRadius: '3px', fontWeight: 700 }}>LUXE10</code></li>
                <li><strong>Partner Offer:</strong> Sign up today & receive ₹500 welcome privileges on your next purchase</li>
              </ul>
            </div>

            {/* Flipkart-Style Product Highlights */}
            <div style={{
              backgroundColor: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: '6px',
              padding: '1rem',
              marginBottom: '1.5rem'
            }}>
              <div style={{ fontSize: '0.8rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.6rem', letterSpacing: '0.04em' }}>
                PRODUCT HIGHLIGHTS
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', fontSize: '0.74rem', color: '#334155' }}>
                <div>• <strong>Brand:</strong> {product.brand}</div>
                <div>• <strong>Model:</strong> {product.sku}</div>
                <div>• <strong>Dial:</strong> {product.specs?.caseDiameter || '41 mm'} Round</div>
                <div>• <strong>Strap:</strong> {product.specs?.strap || 'Stainless Steel'}</div>
                <div>• <strong>Water Resistance:</strong> {product.specs?.waterResistance || '50 m'}</div>
                <div>• <strong>Movement:</strong> {product.specs?.movement || 'Japanese Quartz'}</div>
                <div>• <strong>Warranty:</strong> {product.specs?.warranty || '2 Years Official Warranty'}</div>
                <div>• <strong>Assured:</strong> 100% Original Certified</div>
              </div>
            </div>

            {/* Caseback Engraving Customizer Card */}
            <div style={{
              backgroundColor: '#fbfbf9',
              border: '1px dashed rgba(180, 140, 30, 0.5)',
              padding: '1.25rem',
              borderRadius: '6px',
              marginBottom: '1.5rem'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#0f172a', fontWeight: 700, fontSize: '0.85rem' }}>
                  <Sparkles size={15} style={{ color: '#8a6709' }} />
                  <span>Bespoke Caseback Engraving Service</span>
                </div>
                <span className="badge-luxury badge-gold">COMPLIMENTARY</span>
              </div>
              <p style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '0.75rem' }}>
                Personalize your Luxury Watch timepiece with initials, family crest motto, or memorable date.
              </p>
              <input
                type="text"
                maxLength={24}
                placeholder="ENTER ENGRAVING (UP TO 24 CHARS)"
                value={engravingText}
                onChange={(e) => setEngravingText(e.target.value.toUpperCase())}
                className="lux-input"
                style={{ fontSize: '0.85rem', letterSpacing: '0.12em', fontWeight: 600 }}
              />
            </div>

            {/* Quantity and Dual Checkout Buttons */}
            <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                backgroundColor: '#ffffff',
                border: '1px solid rgba(0,0,0,0.15)',
                borderRadius: '4px'
              }}>
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#0f172a',
                    padding: '0.8rem 1.2rem',
                    cursor: 'pointer',
                    fontSize: '1.1rem',
                    fontWeight: 700
                  }}
                >
                  -
                </button>
                <span style={{ fontSize: '0.95rem', fontWeight: 700, padding: '0 0.5rem', color: '#0f172a' }}>
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#0f172a',
                    padding: '0.8rem 1.2rem',
                    cursor: 'pointer',
                    fontSize: '1.1rem',
                    fontWeight: 700
                  }}
                >
                  +
                </button>
              </div>

              {/* Express VIP Buy Now (Gokwik / Instant Checkout) */}
              <button
                type="button"
                onClick={handleBuyNow}
                className="btn-buy-now"
                style={{ flex: 1, padding: '1rem' }}
              >
                <Zap size={16} fill="#d4af37" stroke="#d4af37" />
                <span style={{ fontSize: '0.9rem' }}>BUY NOW</span>
              </button>
            </div>

            {/* Add to Bag Button */}
            <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '2rem' }}>
              <button
                onClick={handleAddToCart}
                className="btn-gold"
                style={{ flex: 1, padding: '0.9rem' }}
              >
                <ShoppingBag size={16} />
                <span>ADD TO BESPOKE SHOPPING BAG</span>
              </button>

              <button
                onClick={() => toggleWishlist(product.id)}
                className="btn-dark"
                style={{ padding: '0.9rem 1.2rem' }}
                title="Save in Vault"
              >
                <Star size={16} fill={inWish ? '#d4af37' : 'none'} color={inWish ? '#8a6709' : '#475569'} />
              </button>
            </div>
          </div>
        </div>

        {/* Tabbed In-Depth Specifications & Reviews Section */}
        <div id="reviews-section" style={{
          backgroundColor: '#fbfbf9',
          borderRadius: '8px',
          border: '1px solid rgba(0, 0, 0, 0.08)',
          padding: '2.5rem',
          marginBottom: '5rem'
        }}>
          {/* Tabs */}
          <div style={{
            display: 'flex',
            gap: '2rem',
            borderBottom: '1px solid rgba(0,0,0,0.08)',
            paddingBottom: '1rem',
            marginBottom: '2rem',
            overflowX: 'auto'
          }}>
            {[
              { id: 'specs', label: 'Technical Specifications' },
              { id: 'story', label: 'Calibre & Craftsmanship' },
              { id: 'warranty', label: 'Warranty & Insured Shipping' },
              { id: 'reviews', label: `Collector Reviews (${productReviews.length})` }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: activeTab === tab.id ? '#8a6709' : '#64748b',
                  fontSize: '0.85rem',
                  fontFamily: 'var(--font-sans)',
                  fontWeight: 700,
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                  cursor: 'pointer',
                  paddingBottom: '0.5rem',
                  borderBottom: activeTab === tab.id ? '2px solid #8a6709' : '2px solid transparent',
                  transition: 'all 0.2s',
                  whiteSpace: 'nowrap'
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab 1: Technical Horology Specs */}
          {activeTab === 'specs' && (
            <div className="animate-fade-in">
              <h3 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', color: '#0f172a', fontWeight: 700 }}>
                Master Specifications Matrix
              </h3>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                gap: '1.25rem'
              }}>
                {Object.entries(product.specs || {}).map(([key, value]) => (
                  <div
                    key={key}
                    style={{
                      backgroundColor: '#ffffff',
                      padding: '1rem 1.25rem',
                      borderRadius: '4px',
                      border: '1px solid rgba(0,0,0,0.08)',
                      boxShadow: 'var(--shadow-sm)'
                    }}
                  >
                    <div style={{
                      fontSize: '0.72rem',
                      color: '#8a6709',
                      textTransform: 'uppercase',
                      letterSpacing: '0.1em',
                      marginBottom: '0.3rem',
                      fontWeight: 700
                    }}>
                      {key.replace(/([A-Z])/g, ' $1').trim()}
                    </div>
                    <div style={{ fontSize: '0.85rem', color: '#0f172a', fontWeight: 600 }}>
                      {value}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tab 2: Calibre & Craftsmanship */}
          {activeTab === 'story' && (
            <div className="animate-fade-in" style={{ maxWidth: '850px', lineHeight: 1.8, color: '#334155' }}>
              <h3 style={{ fontSize: '1.25rem', marginBottom: '1rem', color: '#0f172a', fontWeight: 700 }}>
                Hand-Assembled in Geneva, Designed in London Mayfair
              </h3>
              <p style={{ marginBottom: '1rem' }}>
                Every Luxury Watch timepiece undergoes over 240 individual quality checkpoints. Our calibres are regulated in six positions and tested across diverse thermal environments to ensure chronometric accuracy well exceeding industry benchmarks.
              </p>
              <p>
                From the hand-bevelled bridges to the 22K gold oscillating weight, no detail is spared in pursuing mechanical perfection and heirloom longevity.
              </p>
            </div>
          )}

          {/* Tab 3: Warranty & Shipping */}
          {activeTab === 'warranty' && (
            <div className="animate-fade-in" style={{ maxWidth: '850px', lineHeight: 1.8, color: '#334155' }}>
              <h3 style={{ fontSize: '1.25rem', marginBottom: '1rem', color: '#0f172a', fontWeight: 700 }}>
                5-Year International Concierge Guarantee
              </h3>
              <p style={{ marginBottom: '1rem' }}>
                All Luxury Watch timepieces carry an international 5-year mechanical warranty. Should your watch require maintenance or regulation, our concierge arranges armored courier pickup directly from your residence to our Geneva service centre.
              </p>
              <p>
                Worldwide shipping is fully insured with real-time GPS tracking and tamper-evident diplomatic sealing.
              </p>
            </div>
          )}

          {/* Tab 4: Customer Reviews */}
          {activeTab === 'reviews' && (
            <div className="animate-fade-in">
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '2rem',
                flexWrap: 'wrap',
                gap: '1rem'
              }}>
                <div>
                  <h3 style={{ fontSize: '1.25rem', color: '#0f172a', marginBottom: '0.3rem', fontWeight: 700 }}>
                    Collector Reviews & Testimonials
                  </h3>
                  <p style={{ fontSize: '0.8rem', color: '#64748b' }}>
                    {productReviews.length} authenticated collector submissions for {product.name}
                  </p>
                </div>

                <button
                  onClick={() => setShowReviewForm(!showReviewForm)}
                  className="btn-outline-gold"
                  style={{ fontSize: '0.78rem', padding: '0.6rem 1.2rem' }}
                >
                  <MessageSquare size={14} />
                  <span>{showReviewForm ? 'CANCEL' : 'WRITE A COLLECTOR REVIEW'}</span>
                </button>
              </div>

              {/* Review Submission Form Modal / Box */}
              {showReviewForm && (
                <form
                  onSubmit={handleSubmitReview}
                  style={{
                    backgroundColor: '#ffffff',
                    border: '1px solid rgba(180, 140, 30, 0.4)',
                    padding: '1.75rem',
                    borderRadius: '6px',
                    marginBottom: '2.5rem',
                    boxShadow: 'var(--shadow-md)'
                  }}
                  className="animate-fade-in"
                >
                  <h4 style={{ fontSize: '1rem', color: '#0f172a', marginBottom: '1rem', fontWeight: 700 }}>
                    Submit Your Horology Experience
                  </h4>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.75rem', color: '#475569', marginBottom: '0.3rem', fontWeight: 600 }}>Your Name / Title *</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Lord Harrison Thorne"
                        value={newReviewerName}
                        onChange={e => setNewReviewerName(e.target.value)}
                        className="lux-input"
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '0.75rem', color: '#475569', marginBottom: '0.3rem', fontWeight: 600 }}>City, Country</label>
                      <input
                        type="text"
                        placeholder="e.g. Mayfair, London"
                        value={newReviewLocation}
                        onChange={e => setNewReviewLocation(e.target.value)}
                        className="lux-input"
                      />
                    </div>
                  </div>

                  <div style={{ marginBottom: '1rem' }}>
                    <label style={{ display: 'block', fontSize: '0.75rem', color: '#475569', marginBottom: '0.3rem', fontWeight: 600 }}>Rating</label>
                    <div style={{ display: 'flex', gap: '0.4rem' }}>
                      {[1, 2, 3, 4, 5].map(star => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setNewReviewRating(star)}
                          style={{
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            color: star <= newReviewRating ? '#d4af37' : '#cbd5e1'
                          }}
                        >
                          <Star size={20} fill={star <= newReviewRating ? '#d4af37' : 'none'} />
                        </button>
                      ))}
                    </div>
                  </div>

                  <div style={{ marginBottom: '1rem' }}>
                    <label style={{ display: 'block', fontSize: '0.75rem', color: '#475569', marginBottom: '0.3rem', fontWeight: 600 }}>Review Headline</label>
                    <input
                      type="text"
                      placeholder="e.g. Pure horological perfection"
                      value={newReviewTitle}
                      onChange={e => setNewReviewTitle(e.target.value)}
                      className="lux-input"
                    />
                  </div>

                  <div style={{ marginBottom: '1.25rem' }}>
                    <label style={{ display: 'block', fontSize: '0.75rem', color: '#475569', marginBottom: '0.3rem', fontWeight: 600 }}>Your Review *</label>
                    <textarea
                      required
                      rows={4}
                      placeholder="Describe the finishing, wrist presence, movement accuracy..."
                      value={newReviewComment}
                      onChange={e => setNewReviewComment(e.target.value)}
                      className="lux-input"
                    />
                  </div>

                  <button type="submit" className="btn-gold" style={{ fontSize: '0.8rem', padding: '0.7rem 1.5rem' }}>
                    <Send size={14} />
                    <span>PUBLISH REVIEW</span>
                  </button>
                </form>
              )}

              {/* Reviews List */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                {productReviews.length > 0 ? (
                  productReviews.map(rev => (
                    <div
                      key={rev.id}
                      style={{
                        backgroundColor: '#ffffff',
                        padding: '1.5rem',
                        borderRadius: '6px',
                        border: '1px solid rgba(0,0,0,0.08)',
                        boxShadow: 'var(--shadow-sm)'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                        <div>
                          <span style={{ fontWeight: 700, color: '#0f172a', fontSize: '0.9rem', marginRight: '0.6rem' }}>
                            {rev.userName}
                          </span>
                          {rev.verified && (
                            <span style={{
                              fontSize: '0.68rem',
                              color: '#059669',
                              backgroundColor: 'rgba(16, 185, 129, 0.12)',
                              padding: '2px 6px',
                              borderRadius: '2px',
                              fontWeight: 600
                            }}>
                              ✓ VERIFIED COLLECTOR
                            </span>
                          )}
                        </div>
                        <span style={{ fontSize: '0.72rem', color: '#64748b' }}>
                          {rev.date} • {rev.location || 'London'}
                        </span>
                      </div>

                      <div style={{ display: 'flex', color: '#d4af37', marginBottom: '0.6rem' }}>
                        {[...Array(rev.rating)].map((_, i) => (
                          <Star key={i} size={14} fill="#d4af37" stroke="#d4af37" />
                        ))}
                      </div>

                      <h5 style={{ fontSize: '0.92rem', color: '#8a6709', marginBottom: '0.4rem', fontWeight: 700 }}>
                        {rev.title}
                      </h5>

                      <p style={{ fontSize: '0.85rem', color: '#334155', lineHeight: 1.6 }}>
                        {rev.comment}
                      </p>
                    </div>
                  ))
                ) : (
                  <div style={{ textAlign: 'center', padding: '2rem', color: '#64748b' }}>
                    Be the first distinguished connoisseur to review this masterpiece.
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Related Timepieces */}
        {relatedProducts.length > 0 && (
          <div>
            <h3 style={{ fontSize: '1.5rem', color: '#0f172a', marginBottom: '1.5rem', textAlign: 'center', fontWeight: 700 }}>
              YOU MAY ALSO ADMIRE
            </h3>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '1.75rem'
            }}>
              {relatedProducts.map(rel => (
                <div
                  key={rel.id}
                  onClick={() => {
                    onSelectOtherProduct(rel);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="glass-card"
                  style={{
                    backgroundColor: '#ffffff',
                    padding: '1rem',
                    cursor: 'pointer',
                    border: '1px solid rgba(0,0,0,0.08)',
                    boxShadow: 'var(--shadow-sm)'
                  }}
                >
                  <img
                    src={getImageUrl(rel.images[0])}
                    alt={rel.name}
                    style={{ width: '100%', height: '220px', objectFit: 'cover', borderRadius: '4px', marginBottom: '0.75rem', backgroundColor: '#f8f7f4' }}
                  />
                  <div style={{ fontSize: '0.7rem', color: '#8a6709', textTransform: 'uppercase', fontWeight: 600 }}>{rel.category}</div>
                  <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.4rem' }}>{rel.name}</div>
                  <div style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a', fontFamily: 'var(--font-brand)' }}>
                    {formatCurrency(rel.price, currency)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

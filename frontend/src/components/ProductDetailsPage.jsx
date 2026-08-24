import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { formatCurrency } from '../utils/currency';
import {
  ArrowLeft, Star, ShieldCheck, Zap, ShoppingBag, Truck, Lock,
  Sparkles, Award, RefreshCw, CheckCircle2, ChevronRight, MessageSquare, Send
} from 'lucide-react';

export const ProductDetailsPage = ({ product: propProduct, onBack, onSelectOtherProduct }) => {
  const {
    currency,
    addToCart,
    triggerBuyNow,
    toggleWishlist,
    isInWishlist,
    reviews,
    addReview,
    products,
    selectedProductDetails,
    setSelectedProductDetails
  } = useStore();

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
    triggerBuyNow(product, quantity, {
      color: selectedColor,
      strap: selectedStrap,
      engraving: engravingText
    });
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
    <div style={{ backgroundColor: '#0b0c10', color: '#f8fafc', padding: '2rem 0 5rem 0' }}>
      <div className="luxury-container">
        {/* Navigation Breadcrumb */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          marginBottom: '2rem',
          fontSize: '0.78rem',
          color: '#94a3b8'
        }}>
          <button
            onClick={onBack}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#d4af37',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              fontWeight: 600
            }}
          >
            <ArrowLeft size={16} />
            <span>RETURN TO COLLECTION</span>
          </button>
          <span>/</span>
          <span>{product.category}</span>
          <span>/</span>
          <span style={{ color: '#f8fafc' }}>{product.name}</span>
        </div>

        {/* Main PDP Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
          gap: '3.5rem',
          alignItems: 'start',
          marginBottom: '5rem'
        }}>
          {/* Left Column: Multi-Angle Gallery & Caseback Visualizer */}
          <div>
            <div style={{
              position: 'relative',
              borderRadius: '8px',
              overflow: 'hidden',
              backgroundColor: '#07080b',
              aspectRatio: '1',
              marginBottom: '1.25rem',
              border: '1px solid rgba(212, 175, 55, 0.25)',
              boxShadow: '0 20px 50px rgba(0,0,0,0.8)'
            }}>
              <img
                src={product.images[activeImgIdx] || product.images[0]}
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
                  background: 'rgba(11, 12, 16, 0.92)',
                  border: '1px solid #d4af37',
                  padding: '0.5rem 0.8rem',
                  borderRadius: '4px',
                  fontSize: '0.72rem',
                  color: '#f3e5ab',
                  fontFamily: 'monospace',
                  letterSpacing: '0.15em',
                  boxShadow: '0 4px 15px rgba(0,0,0,0.6)'
                }}>
                  <div style={{ fontSize: '0.6rem', color: '#94a3b8', textTransform: 'uppercase' }}>Laser Engraving Preview:</div>
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
                    border: activeImgIdx === idx ? '2px solid #d4af37' : '1px solid rgba(255,255,255,0.1)',
                    backgroundColor: '#07080b',
                    transition: 'all 0.2s'
                  }}
                >
                  <img src={img} alt="angle" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
              ))}
            </div>

            {/* Trust Badges in PDP */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '1rem',
              backgroundColor: '#12141c',
              padding: '1.25rem',
              borderRadius: '6px',
              border: '1px solid rgba(255,255,255,0.06)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.75rem', color: '#cbd5e1' }}>
                <Truck size={18} style={{ color: '#d4af37' }} />
                <span>Pan-India BlueDart Air</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.75rem', color: '#cbd5e1' }}>
                <ShieldCheck size={18} style={{ color: '#d4af37' }} />
                <span>5-Year Official Warranty</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.75rem', color: '#cbd5e1' }}>
                <RefreshCw size={18} style={{ color: '#d4af37' }} />
                <span>7-Day Easy Exchange</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.75rem', color: '#cbd5e1' }}>
                <Lock size={18} style={{ color: '#d4af37' }} />
                <span>GST Compliant & Vault Card</span>
              </div>
            </div>
          </div>

          {/* Right Column: Title, Price, Customizer, Specs, Express Buy */}
          <div>
            <div style={{
              fontSize: '0.78rem',
              color: '#d4af37',
              textTransform: 'uppercase',
              letterSpacing: '0.15em',
              fontWeight: 600,
              marginBottom: '0.5rem'
            }}>
              {product.category} • SKU: {product.sku}
            </div>

            <h1 style={{
              fontSize: 'clamp(1.8rem, 3.2vw, 2.5rem)',
              color: '#ffffff',
              lineHeight: 1.2,
              marginBottom: '0.75rem'
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
              <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#f8fafc' }}>{product.rating} / 5.0</span>
              <span style={{ color: 'rgba(255,255,255,0.2)' }}>•</span>
              <a
                href="#reviews-section"
                onClick={() => setActiveTab('reviews')}
                style={{ fontSize: '0.8rem', color: '#d4af37', textDecoration: 'none' }}
              >
                {product.reviewsCount} Verified Collector Reviews
              </a>
            </div>

            {/* Price Box */}
            <div style={{
              backgroundColor: '#12151e',
              border: '1px solid rgba(212, 175, 55, 0.3)',
              padding: '1.25rem',
              borderRadius: '6px',
              marginBottom: '1.75rem'
            }}>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '1rem', marginBottom: '0.4rem' }}>
                <span style={{
                  fontSize: '2rem',
                  fontWeight: 700,
                  color: '#f8fafc',
                  fontFamily: 'var(--font-brand)'
                }}>
                  {formatCurrency(product.price, currency)}
                </span>
                {product.comparePrice && (
                  <span style={{
                    fontSize: '1.1rem',
                    color: '#64748b',
                    textDecoration: 'line-through'
                  }}>
                    {formatCurrency(product.comparePrice, currency)}
                  </span>
                )}
              </div>
              <p style={{ fontSize: '0.78rem', color: '#10b981', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <Sparkles size={13} />
                <span>Inclusive of all Swiss import duties, taxes, and bespoke laser engraving</span>
              </p>
            </div>

            {/* Product Narrative Intro */}
            <p style={{
              fontSize: '0.92rem',
              color: '#94a3b8',
              lineHeight: 1.7,
              marginBottom: '1.75rem',
              fontWeight: 300
            }}>
              {product.description}
            </p>

            {/* Dial / Color Finish Swatches */}
            {product.colors && product.colors.length > 0 && (
              <div style={{ marginBottom: '1.5rem' }}>
                <div style={{ fontSize: '0.8rem', color: '#cbd5e1', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.6rem' }}>
                  Case & Dial Finish: <strong style={{ color: '#d4af37' }}>{selectedColor}</strong>
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
                        background: selectedColor === c.name ? 'rgba(212, 175, 55, 0.25)' : '#141720',
                        border: selectedColor === c.name ? '1px solid #d4af37' : '1px solid rgba(255,255,255,0.1)',
                        color: selectedColor === c.name ? '#f3e5ab' : '#94a3b8',
                        padding: '0.5rem 1rem',
                        borderRadius: '4px',
                        fontSize: '0.8rem',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        transition: 'all 0.2s'
                      }}
                    >
                      <span style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: c.hex }} />
                      <span>{c.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Strap Selection */}
            {product.straps && product.straps.length > 0 && (
              <div style={{ marginBottom: '1.75rem' }}>
                <div style={{ fontSize: '0.8rem', color: '#cbd5e1', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.6rem' }}>
                  Supplied Horology Strap: <strong style={{ color: '#d4af37' }}>{selectedStrap}</strong>
                </div>
                <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                  {product.straps.map((s, i) => (
                    <button
                      key={i}
                      onClick={() => setSelectedStrap(s.name)}
                      style={{
                        background: selectedStrap === s.name ? 'rgba(212, 175, 55, 0.25)' : '#141720',
                        border: selectedStrap === s.name ? '1px solid #d4af37' : '1px solid rgba(255,255,255,0.1)',
                        color: selectedStrap === s.name ? '#f3e5ab' : '#94a3b8',
                        padding: '0.5rem 1rem',
                        borderRadius: '4px',
                        fontSize: '0.8rem',
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

            {/* Caseback Engraving Customizer Card */}
            <div style={{
              backgroundColor: '#121520',
              border: '1px dashed rgba(212, 175, 55, 0.5)',
              padding: '1.25rem',
              borderRadius: '6px',
              marginBottom: '2rem'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#f3e5ab', fontWeight: 600, fontSize: '0.85rem' }}>
                  <Sparkles size={15} style={{ color: '#d4af37' }} />
                  <span>Bespoke Caseback Engraving Service</span>
                </div>
                <span className="badge-luxury badge-gold">COMPLIMENTARY</span>
              </div>
              <p style={{ fontSize: '0.75rem', color: '#94a3b8', marginBottom: '0.75rem' }}>
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
                backgroundColor: '#141720',
                border: '1px solid rgba(255,255,255,0.15)',
                borderRadius: '4px'
              }}>
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#fff',
                    padding: '0.8rem 1.2rem',
                    cursor: 'pointer',
                    fontSize: '1.1rem'
                  }}
                >
                  -
                </button>
                <span style={{ fontSize: '0.95rem', fontWeight: 700, padding: '0 0.5rem' }}>
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#fff',
                    padding: '0.8rem 1.2rem',
                    cursor: 'pointer',
                    fontSize: '1.1rem'
                  }}
                >
                  +
                </button>
              </div>

              {/* Express VIP Buy Now (Gokwik / Instant Checkout) */}
              <button
                onClick={handleBuyNow}
                className="btn-buy-now"
                style={{ flex: 1, padding: '1rem' }}
              >
                <Zap size={16} fill="#d4af37" stroke="#d4af37" />
                <span style={{ fontSize: '0.9rem' }}>EXPRESS VIP BUY NOW</span>
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
                <Star size={16} fill={inWish ? '#d4af37' : 'none'} color={inWish ? '#d4af37' : '#fff'} />
              </button>
            </div>
          </div>
        </div>

        {/* Tabbed In-Depth Specifications & Reviews Section */}
        <div id="reviews-section" style={{
          backgroundColor: '#12141c',
          borderRadius: '8px',
          border: '1px solid rgba(255,255,255,0.08)',
          padding: '2.5rem',
          marginBottom: '5rem'
        }}>
          {/* Tabs */}
          <div style={{
            display: 'flex',
            gap: '2rem',
            borderBottom: '1px solid rgba(255,255,255,0.1)',
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
                  color: activeTab === tab.id ? '#d4af37' : '#94a3b8',
                  fontSize: '0.85rem',
                  fontFamily: 'var(--font-sans)',
                  fontWeight: 600,
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                  cursor: 'pointer',
                  paddingBottom: '0.5rem',
                  borderBottom: activeTab === tab.id ? '2px solid #d4af37' : '2px solid transparent',
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
              <h3 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', color: '#ffffff' }}>
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
                      backgroundColor: '#161924',
                      padding: '1rem 1.25rem',
                      borderRadius: '4px',
                      border: '1px solid rgba(255,255,255,0.05)'
                    }}
                  >
                    <div style={{
                      fontSize: '0.72rem',
                      color: '#d4af37',
                      textTransform: 'uppercase',
                      letterSpacing: '0.1em',
                      marginBottom: '0.3rem'
                    }}>
                      {key.replace(/([A-Z])/g, ' $1').trim()}
                    </div>
                    <div style={{ fontSize: '0.85rem', color: '#f8fafc', fontWeight: 500 }}>
                      {value}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tab 2: Calibre & Craftsmanship */}
          {activeTab === 'story' && (
            <div className="animate-fade-in" style={{ maxWidth: '850px', lineHeight: 1.8, color: '#cbd5e1' }}>
              <h3 style={{ fontSize: '1.25rem', marginBottom: '1rem', color: '#ffffff' }}>
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
            <div className="animate-fade-in" style={{ maxWidth: '850px', lineHeight: 1.8, color: '#cbd5e1' }}>
              <h3 style={{ fontSize: '1.25rem', marginBottom: '1rem', color: '#ffffff' }}>
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
                  <h3 style={{ fontSize: '1.25rem', color: '#ffffff', marginBottom: '0.3rem' }}>
                    Collector Reviews & Testimonials
                  </h3>
                  <p style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
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
                    backgroundColor: '#161924',
                    border: '1px solid rgba(212, 175, 55, 0.4)',
                    padding: '1.75rem',
                    borderRadius: '6px',
                    marginBottom: '2.5rem'
                  }}
                  className="animate-fade-in"
                >
                  <h4 style={{ fontSize: '1rem', color: '#f3e5ab', marginBottom: '1rem' }}>
                    Submit Your Horology Experience
                  </h4>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.75rem', color: '#cbd5e1', marginBottom: '0.3rem' }}>Your Name / Title *</label>
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
                      <label style={{ display: 'block', fontSize: '0.75rem', color: '#cbd5e1', marginBottom: '0.3rem' }}>City, Country</label>
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
                    <label style={{ display: 'block', fontSize: '0.75rem', color: '#cbd5e1', marginBottom: '0.3rem' }}>Rating</label>
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
                            color: star <= newReviewRating ? '#d4af37' : '#475569'
                          }}
                        >
                          <Star size={20} fill={star <= newReviewRating ? '#d4af37' : 'none'} />
                        </button>
                      ))}
                    </div>
                  </div>

                  <div style={{ marginBottom: '1rem' }}>
                    <label style={{ display: 'block', fontSize: '0.75rem', color: '#cbd5e1', marginBottom: '0.3rem' }}>Review Headline</label>
                    <input
                      type="text"
                      placeholder="e.g. Pure horological perfection"
                      value={newReviewTitle}
                      onChange={e => setNewReviewTitle(e.target.value)}
                      className="lux-input"
                    />
                  </div>

                  <div style={{ marginBottom: '1.25rem' }}>
                    <label style={{ display: 'block', fontSize: '0.75rem', color: '#cbd5e1', marginBottom: '0.3rem' }}>Your Review *</label>
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
                        backgroundColor: '#161924',
                        padding: '1.5rem',
                        borderRadius: '6px',
                        border: '1px solid rgba(255,255,255,0.06)'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                        <div>
                          <span style={{ fontWeight: 600, color: '#f8fafc', fontSize: '0.9rem', marginRight: '0.6rem' }}>
                            {rev.userName}
                          </span>
                          {rev.verified && (
                            <span style={{
                              fontSize: '0.68rem',
                              color: '#10b981',
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

                      <h5 style={{ fontSize: '0.92rem', color: '#f3e5ab', marginBottom: '0.4rem', fontWeight: 600 }}>
                        {rev.title}
                      </h5>

                      <p style={{ fontSize: '0.85rem', color: '#cbd5e1', lineHeight: 1.6 }}>
                        {rev.comment}
                      </p>
                    </div>
                  ))
                ) : (
                  <div style={{ textAlign: 'center', padding: '2rem', color: '#94a3b8' }}>
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
            <h3 style={{ fontSize: '1.5rem', color: '#ffffff', marginBottom: '1.5rem', textAlign: 'center' }}>
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
                    backgroundColor: '#12141c',
                    padding: '1rem',
                    cursor: 'pointer',
                    border: '1px solid rgba(255,255,255,0.08)'
                  }}
                >
                  <img
                    src={rel.images[0]}
                    alt={rel.name}
                    style={{ width: '100%', height: '220px', objectFit: 'cover', borderRadius: '4px', marginBottom: '0.75rem' }}
                  />
                  <div style={{ fontSize: '0.7rem', color: '#d4af37', textTransform: 'uppercase' }}>{rel.category}</div>
                  <div style={{ fontSize: '0.95rem', fontWeight: 600, color: '#f8fafc', marginBottom: '0.4rem' }}>{rel.name}</div>
                  <div style={{ fontSize: '1rem', fontWeight: 700, color: '#f3e5ab', fontFamily: 'var(--font-brand)' }}>
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

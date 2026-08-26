import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import {
  X, Trash2, ShoppingBag, ArrowRight, ShieldCheck, Tag, Gift,
  Truck, CheckCircle, Sparkles, Zap
} from 'lucide-react';

export const CartDrawer = () => {
  const {
    isCartOpen,
    setIsCartOpen,
    cart,
    updateCartQuantity,
    removeFromCart,
    clearCart,
    cartSubtotal,
    discountAmount,
    appliedCoupon,
    applyCoupon,
    removeCoupon,
    freeShippingThreshold,
    openCartCheckout,
    triggerCartCheckout,
    setIsCheckoutOpen
  } = useStore();

  const [couponCodeInput, setCouponCodeInput] = useState('');
  const [includeGiftWrap, setIncludeGiftWrap] = useState(true);

  if (!isCartOpen) return null;

  // Safe numerical calculations for free shipping
  const threshold = Number(freeShippingThreshold) || 999;
  const currentSubtotal = Number(cartSubtotal) || 0;
  const shippingProgress = Math.min(100, Math.max(0, (currentSubtotal / threshold) * 100));
  const remainingForFreeShipping = Math.max(0, threshold - currentSubtotal);

  const handleApplyCoupon = (e) => {
    e.preventDefault();
    if (couponCodeInput.trim()) {
      const success = applyCoupon(couponCodeInput.trim().toUpperCase());
      if (success) setCouponCodeInput('');
    }
  };

  const finalTotal = Math.max(0, currentSubtotal - (discountAmount || 0));

  const handleProceedToCheckout = () => {
    if (typeof openCartCheckout === 'function') {
      openCartCheckout();
    } else if (typeof triggerCartCheckout === 'function') {
      triggerCartCheckout();
    } else {
      setIsCartOpen(false);
      setIsCheckoutOpen(true);
    }
  };

  return (
    <div
      className="modal-backdrop animate-fade-in"
      style={{ zIndex: 1000, justifyContent: 'flex-end', padding: 0 }}
      onClick={() => setIsCartOpen(false)}
    >
      <div
        className="glass-panel animate-slide-right"
        onClick={e => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: '460px',
          height: '100vh',
          backgroundColor: '#ffffff',
          borderLeft: '1px solid rgba(180, 140, 30, 0.35)',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '-10px 0 40px rgba(15, 23, 42, 0.15)',
          position: 'relative'
        }}
      >
        {/* Drawer Header */}
        <div style={{
          padding: '1.25rem 1.5rem',
          borderBottom: '1px solid rgba(0, 0, 0, 0.08)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          backgroundColor: '#fbfbf9'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <ShoppingBag size={18} style={{ color: '#8a6709' }} />
            <h3 style={{ fontSize: '1rem', color: '#0f172a', letterSpacing: '0.08em', fontWeight: 700, margin: 0 }}>
              BESPOKE SHOPPING BAG ({cart.reduce((acc, it) => acc + it.quantity, 0)})
            </h3>
          </div>

          <button
            onClick={() => setIsCartOpen(false)}
            style={{
              background: 'none',
              border: 'none',
              color: '#64748b',
              cursor: 'pointer',
              padding: '0.2rem',
              display: 'flex',
              alignItems: 'center'
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Free Insured Delivery Progress Bar */}
        <div style={{
          backgroundColor: '#f8f7f4',
          padding: '0.85rem 1.5rem',
          borderBottom: '1px solid rgba(0, 0, 0, 0.06)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.4rem', fontSize: '0.75rem' }}>
            <span style={{ color: '#334155', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <Truck size={14} style={{ color: '#8a6709' }} />
              {currentSubtotal >= threshold ? (
                <strong style={{ color: '#059669' }}>Complimentary Insured Courier Unlocked!</strong>
              ) : (
                <span>Add <strong>₹{remainingForFreeShipping.toLocaleString('en-IN')}</strong> for Free Armoured Courier</span>
              )}
            </span>
            <span style={{ color: '#8a6709', fontWeight: 700 }}>{Math.round(shippingProgress)}%</span>
          </div>

          {/* Bar track */}
          <div style={{ width: '100%', height: '5px', backgroundColor: 'rgba(0, 0, 0, 0.08)', borderRadius: '3px', overflow: 'hidden' }}>
            <div style={{
              width: `${shippingProgress}%`,
              height: '100%',
              background: 'var(--gold-gradient)',
              transition: 'width 0.4s ease'
            }} />
          </div>
        </div>

        {/* Cart Items List */}
        <div style={{
          flex: 1,
          overflowY: 'auto',
          padding: '1.25rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem'
        }}>
          {cart.length > 0 ? (
            cart.map((item, idx) => {
              const prodId = item.product?.id || `prod-${idx}`;
              return (
                <div
                  key={`${prodId}-${idx}`}
                  style={{
                    display: 'flex',
                    gap: '1rem',
                    backgroundColor: '#ffffff',
                    padding: '0.85rem',
                    borderRadius: '6px',
                    border: '1px solid rgba(0, 0, 0, 0.08)',
                    boxShadow: 'var(--shadow-sm)',
                    position: 'relative'
                  }}
                >
                  {/* Item Image */}
                  <img
                    src={item.product?.images?.[0] || '/images/watches/rolex_submariner.jpg'}
                    alt={item.product?.name || 'Watch'}
                    style={{
                      width: '75px',
                      height: '75px',
                      objectFit: 'cover',
                      borderRadius: '4px',
                      backgroundColor: '#f8f7f4',
                      flexShrink: 0
                    }}
                  />

                  {/* Item Details */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                      <h4 style={{
                        fontSize: '0.85rem',
                        color: '#0f172a',
                        fontWeight: 700,
                        lineHeight: 1.3,
                        marginBottom: '0.2rem',
                        paddingRight: '1.2rem',
                        margin: 0
                      }}>
                        {item.product?.name}
                      </h4>

                      {/* Delete Item */}
                      <button
                        onClick={() => removeFromCart(item.product?.id)}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: '#94a3b8',
                          cursor: 'pointer',
                          padding: '0.2rem'
                        }}
                        title="Remove Timepiece"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>

                    <div style={{ fontSize: '0.72rem', color: '#64748b', marginBottom: '0.2rem' }}>
                      Brand: <span style={{ color: '#8a6709', fontWeight: 600 }}>{item.product?.brand}</span>
                    </div>

                    {item.selectedColor && (
                      <div style={{ fontSize: '0.7rem', color: '#64748b', marginBottom: '0.2rem' }}>
                        Edition: <span style={{ color: '#0f172a' }}>{item.selectedColor}</span>
                      </div>
                    )}

                    {/* Price & Quantity Adjuster */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '0.5rem' }}>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        backgroundColor: '#f8f7f4',
                        border: '1px solid rgba(0, 0, 0, 0.12)',
                        borderRadius: '3px'
                      }}>
                        <button
                          onClick={() => updateCartQuantity(item.product?.id, -1)}
                          style={{
                            background: 'none',
                            border: 'none',
                            color: '#0f172a',
                            padding: '0.15rem 0.45rem',
                            cursor: 'pointer',
                            fontSize: '0.85rem',
                            fontWeight: 700
                          }}
                        >
                          -
                        </button>
                        <span style={{ fontSize: '0.8rem', fontWeight: 700, padding: '0 0.4rem', color: '#0f172a' }}>
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateCartQuantity(item.product?.id, 1)}
                          style={{
                            background: 'none',
                            border: 'none',
                            color: '#0f172a',
                            padding: '0.15rem 0.45rem',
                            cursor: 'pointer',
                            fontSize: '0.85rem',
                            fontWeight: 700
                          }}
                        >
                          +
                        </button>
                      </div>

                      <div style={{ fontWeight: 700, color: '#0f172a', fontSize: '0.9rem' }}>
                        ₹{((item.product?.price || 0) * item.quantity).toLocaleString('en-IN')}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div style={{ textAlign: 'center', padding: '4rem 1rem', color: '#94a3b8' }}>
              <ShoppingBag size={42} style={{ color: '#cbd5e1', margin: '0 auto 1rem auto' }} />
              <p style={{ fontSize: '0.9rem', color: '#0f172a', fontWeight: 600 }}>Your bespoke vault bag is empty</p>
              <p style={{ fontSize: '0.78rem', color: '#64748b' }}>Explore our horological catalog to curate your collection.</p>
            </div>
          )}
        </div>

        {/* Drawer Footer / Totals & Checkout */}
        {cart.length > 0 && (
          <div style={{
            padding: '1.25rem 1.5rem',
            borderTop: '1px solid rgba(0, 0, 0, 0.08)',
            backgroundColor: '#fbfbf9'
          }}>
            {/* Promo Code Input */}
            <form onSubmit={handleApplyCoupon} style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
              <input
                type="text"
                value={couponCodeInput}
                onChange={(e) => setCouponCodeInput(e.target.value.toUpperCase())}
                placeholder="PROMO CODE (E.G. LUXE10)"
                className="lux-input"
                style={{ fontSize: '0.78rem', padding: '0.5rem 0.8rem', background: '#ffffff' }}
              />
              <button type="submit" className="btn-outline-gold" style={{ padding: '0.5rem 1rem', fontSize: '0.75rem', flexShrink: 0 }}>
                APPLY
              </button>
            </form>

            {appliedCoupon && (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                backgroundColor: 'rgba(16, 185, 129, 0.1)',
                border: '1px solid rgba(16, 185, 129, 0.3)',
                padding: '0.4rem 0.75rem',
                borderRadius: '4px',
                marginBottom: '0.85rem',
                fontSize: '0.75rem',
                color: '#065f46'
              }}>
                <span>Code <strong>{appliedCoupon.code}</strong> applied ({appliedCoupon.discountPercent}% OFF)</span>
                <button
                  type="button"
                  onClick={removeCoupon}
                  style={{ background: 'none', border: 'none', color: '#dc2626', cursor: 'pointer', fontSize: '0.72rem', fontWeight: 600 }}
                >
                  Remove
                </button>
              </div>
            )}

            {/* Price Calculations */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', fontSize: '0.8rem', marginBottom: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748b' }}>
                <span>Subtotal</span>
                <span style={{ color: '#0f172a', fontWeight: 600 }}>₹{currentSubtotal.toLocaleString('en-IN')}</span>
              </div>

              {discountAmount > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#059669' }}>
                  <span>VIP Privilege Discount</span>
                  <span style={{ fontWeight: 600 }}>-₹{discountAmount.toLocaleString('en-IN')}</span>
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748b' }}>
                <span>Insured Global Shipping</span>
                <span style={{ color: '#059669', fontWeight: 600 }}>
                  {currentSubtotal >= threshold ? 'COMPLIMENTARY' : '₹499'}
                </span>
              </div>

              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                borderTop: '1px solid rgba(0, 0, 0, 0.08)',
                paddingTop: '0.6rem',
                fontSize: '1rem',
                fontWeight: 700,
                color: '#0f172a'
              }}>
                <span>Total Due</span>
                <span style={{ color: '#8a6709', fontSize: '1.15rem' }}>₹{finalTotal.toLocaleString('en-IN')}</span>
              </div>
            </div>

            {/* Buy Now Button */}
            <button
              onClick={handleProceedToCheckout}
              className="btn-gold"
              style={{
                width: '100%',
                padding: '0.95rem',
                fontSize: '0.9rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.6rem',
                letterSpacing: '0.12em'
              }}
            >
              <Zap size={16} fill="#d4af37" stroke="#d4af37" />
              <span>BUY NOW</span>
              <ArrowRight size={16} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CartDrawer;

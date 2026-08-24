import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { formatCurrency } from '../utils/currency';
import {
  X, Trash2, ShoppingBag, ArrowRight, ShieldCheck, Tag, Gift,
  Truck, CheckCircle, Sparkles, Zap
} from 'lucide-react';

export const CartDrawer = () => {
  const {
    isCartOpen,
    setIsCartOpen,
    cart,
    currency,
    updateCartQuantity,
    removeFromCart,
    clearCart,
    cartSubtotal,
    discountAmount,
    appliedCoupon,
    applyCoupon,
    removeCoupon,
    freeShippingThreshold,
    triggerCartCheckout,
    triggerBuyNow
  } = useStore();

  const [couponCodeInput, setCouponCodeInput] = useState('');
  const [includeGiftWrap, setIncludeGiftWrap] = useState(true);

  if (!isCartOpen) return null;

  // Free shipping progress calculation
  const shippingProgress = Math.min(100, (cartSubtotal / freeShippingThreshold) * 100);
  const remainingForFreeShipping = Math.max(0, freeShippingThreshold - cartSubtotal);

  const handleApplyCoupon = (e) => {
    e.preventDefault();
    if (couponCodeInput.trim()) {
      const success = applyCoupon(couponCodeInput);
      if (success) setCouponCodeInput('');
    }
  };

  const finalTotal = Math.max(0, cartSubtotal - discountAmount);

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
          maxWidth: '480px',
          height: '100vh',
          backgroundColor: '#0c0e14',
          borderLeft: '1px solid rgba(212, 175, 55, 0.3)',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '-10px 0 40px rgba(0,0,0,0.9)',
          position: 'relative'
        }}
      >
        {/* Drawer Header */}
        <div style={{
          padding: '1.5rem',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          backgroundColor: '#08090d'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <ShoppingBag size={20} style={{ color: '#d4af37' }} />
            <h3 style={{ fontSize: '1.1rem', color: '#ffffff', letterSpacing: '0.08em' }}>
              BESPOKE SHOPPING BAG
            </h3>
          </div>

          <button
            onClick={() => setIsCartOpen(false)}
            style={{
              background: 'none',
              border: 'none',
              color: '#94a3b8',
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
          backgroundColor: '#12151e',
          padding: '0.85rem 1.5rem',
          borderBottom: '1px solid rgba(255, 255, 255, 0.06)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.4rem', fontSize: '0.75rem' }}>
            <span style={{ color: '#cbd5e1', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <Truck size={14} style={{ color: '#d4af37' }} />
              {cartSubtotal >= freeShippingThreshold ? (
                <strong style={{ color: '#10b981' }}>Complimentary Insured Courier Unlocked!</strong>
              ) : (
                <span>Add <strong>{formatCurrency(remainingForFreeShipping, currency)}</strong> for Free Armoured Courier</span>
              )}
            </span>
            <span style={{ color: '#d4af37', fontWeight: 600 }}>{Math.round(shippingProgress)}%</span>
          </div>

          {/* Bar track */}
          <div style={{ width: '100%', height: '5px', backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: '3px', overflow: 'hidden' }}>
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
          padding: '1.5rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '1.25rem'
        }}>
          {cart.length > 0 ? (
            cart.map((item) => (
              <div
                key={item.cartItemId}
                style={{
                  display: 'flex',
                  gap: '1rem',
                  backgroundColor: '#141722',
                  padding: '1rem',
                  borderRadius: '6px',
                  border: '1px solid rgba(255, 255, 255, 0.06)',
                  position: 'relative'
                }}
              >
                {/* Item Image */}
                <img
                  src={item.product.images[0]}
                  alt={item.product.name}
                  style={{
                    width: '80px',
                    height: '80px',
                    objectFit: 'cover',
                    borderRadius: '4px',
                    backgroundColor: '#07080b',
                    flexShrink: 0
                  }}
                />

                {/* Item Details */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                    <h4 style={{
                      fontSize: '0.88rem',
                      color: '#ffffff',
                      fontWeight: 600,
                      lineHeight: 1.3,
                      marginBottom: '0.2rem',
                      paddingRight: '1.2rem'
                    }}>
                      {item.product.name}
                    </h4>

                    {/* Delete Item */}
                    <button
                      onClick={() => removeFromCart(item.cartItemId)}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: '#64748b',
                        cursor: 'pointer',
                        padding: '0.2rem'
                      }}
                      title="Remove Timepiece"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>

                  <div style={{ fontSize: '0.72rem', color: '#94a3b8', marginBottom: '0.2rem' }}>
                    Edition: <span style={{ color: '#f3e5ab' }}>{item.selectedColor}</span>
                  </div>

                  {item.selectedStrap && (
                    <div style={{ fontSize: '0.72rem', color: '#94a3b8', marginBottom: '0.2rem' }}>
                      Strap: <span style={{ color: '#cbd5e1' }}>{item.selectedStrap}</span>
                    </div>
                  )}

                  {item.engraving && (
                    <div style={{
                      fontSize: '0.7rem',
                      color: '#10b981',
                      backgroundColor: 'rgba(16, 185, 129, 0.1)',
                      padding: '2px 6px',
                      borderRadius: '2px',
                      display: 'inline-block',
                      marginBottom: '0.4rem'
                    }}>
                      Engraved: "{item.engraving}"
                    </div>
                  )}

                  {/* Price & Quantity Adjuster */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '0.5rem' }}>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      backgroundColor: '#0c0e14',
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: '3px'
                    }}>
                      <button
                        onClick={() => updateCartQuantity(item.cartItemId, -1)}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: '#fff',
                          padding: '0.2rem 0.5rem',
                          cursor: 'pointer',
                          fontSize: '0.85rem'
                        }}
                      >
                        -
                      </button>
                      <span style={{ fontSize: '0.8rem', fontWeight: 600, padding: '0 0.4rem' }}>
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateCartQuantity(item.cartItemId, 1)}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: '#fff',
                          padding: '0.2rem 0.5rem',
                          cursor: 'pointer',
                          fontSize: '0.85rem'
                        }}
                      >
                        +
                      </button>
                    </div>

                    <span style={{ fontSize: '0.95rem', fontWeight: 700, color: '#f3e5ab', fontFamily: 'var(--font-brand)' }}>
                      {formatCurrency(item.product.price * item.quantity, currency)}
                    </span>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div style={{ textAlign: 'center', padding: '3rem 1rem', color: '#94a3b8' }}>
              <ShoppingBag size={48} style={{ color: 'rgba(212, 175, 55, 0.3)', margin: '0 auto 1rem auto' }} />
              <h4 style={{ color: '#fff', fontSize: '1.1rem', marginBottom: '0.5rem' }}>Your Bag is Empty</h4>
              <p style={{ fontSize: '0.8rem', marginBottom: '1.5rem' }}>
                Explore our curated horology collections and select your handcrafted timepiece.
              </p>
              <button
                onClick={() => setIsCartOpen(false)}
                className="btn-gold"
                style={{ fontSize: '0.78rem' }}
              >
                EXPLORE TIMEPIECES
              </button>
            </div>
          )}
        </div>

        {/* Drawer Footer (Summary, Coupons, Checkout) */}
        {cart.length > 0 && (
          <div style={{
            padding: '1.5rem',
            borderTop: '1px solid rgba(255, 255, 255, 0.08)',
            backgroundColor: '#08090e'
          }}>
            {/* Promo Code Input */}
            <form onSubmit={handleApplyCoupon} style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
              <div style={{ position: 'relative', flex: 1 }}>
                <input
                  type="text"
                  placeholder="PROMO CODE (e.g. LUXE10)"
                  value={couponCodeInput}
                  onChange={(e) => setCouponCodeInput(e.target.value.toUpperCase())}
                  className="lux-input"
                  style={{ fontSize: '0.78rem', padding: '0.5rem 0.75rem', textTransform: 'uppercase' }}
                />
              </div>
              <button type="submit" className="btn-dark" style={{ padding: '0.5rem 1rem', fontSize: '0.75rem' }}>
                APPLY
              </button>
            </form>

            {appliedCoupon && (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                backgroundColor: 'rgba(16, 185, 129, 0.12)',
                border: '1px solid rgba(16, 185, 129, 0.3)',
                padding: '0.4rem 0.75rem',
                borderRadius: '3px',
                marginBottom: '1rem',
                fontSize: '0.75rem'
              }}>
                <span style={{ color: '#34d399', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                  <Tag size={12} />
                  <span>Code <strong>{appliedCoupon.code}</strong> applied (-{appliedCoupon.discountPercent}%)</span>
                </span>
                <button
                  onClick={removeCoupon}
                  style={{ background: 'none', border: 'none', color: '#fb7185', cursor: 'pointer', fontSize: '0.7rem' }}
                >
                  Remove
                </button>
              </div>
            )}

            {/* Gift Wrap Checkbox */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '1rem',
              padding: '0.5rem',
              backgroundColor: '#12141c',
              borderRadius: '4px',
              border: '1px solid rgba(255,255,255,0.05)'
            }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.75rem', color: '#cbd5e1', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={includeGiftWrap}
                  onChange={(e) => setIncludeGiftWrap(e.target.checked)}
                  style={{ accentColor: '#d4af37' }}
                />
                <Gift size={14} style={{ color: '#d4af37' }} />
                <span>Complimentary Lacquered Wooden Gift Vault</span>
              </label>
              <span style={{ fontSize: '0.68rem', color: '#10b981', fontWeight: 600 }}>FREE</span>
            </div>

            {/* Totals Breakdown */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', marginBottom: '1.25rem', fontSize: '0.82rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#94a3b8' }}>
                <span>Subtotal</span>
                <span>{formatCurrency(cartSubtotal, currency)}</span>
              </div>

              {discountAmount > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#10b981' }}>
                  <span>VIP Discount</span>
                  <span>-{formatCurrency(discountAmount, currency)}</span>
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#94a3b8' }}>
                <span>Insured Global Shipping</span>
                <span style={{ color: '#10b981', fontWeight: 600 }}>COMPLIMENTARY</span>
              </div>

              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                color: '#ffffff',
                fontWeight: 700,
                fontSize: '1.1rem',
                borderTop: '1px solid rgba(255,255,255,0.1)',
                paddingTop: '0.5rem',
                marginTop: '0.2rem'
              }}>
                <span>Total Due</span>
                <span style={{ color: '#f3e5ab', fontFamily: 'var(--font-brand)' }}>
                  {formatCurrency(finalTotal, currency)}
                </span>
              </div>
            </div>

            {/* Actions */}
            <button
              onClick={triggerCartCheckout}
              className="btn-gold"
              style={{ width: '100%', padding: '0.9rem', fontSize: '0.85rem' }}
            >
              <span>PROCEED TO SECURE CHECKOUT</span>
              <ArrowRight size={16} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

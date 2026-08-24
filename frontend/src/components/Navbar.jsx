import React, { useState, useEffect } from 'react';
import { useStore } from '../context/StoreContext';
import { formatCurrency } from '../utils/currency';
import { Search, Heart, ShoppingBag, Menu, X, Shield, Clock, Compass, Sparkles, ChevronDown } from 'lucide-react';

export const Navbar = ({ onSelectCategory, onOpenWishlist, onNavigateHome, onOpenStory }) => {
  const {
    cart,
    wishlist,
    currency,
    cartSubtotal,
    setIsCartOpen,
    searchQuery,
    setSearchQuery,
    products,
    setSelectedProductDetails
  } = useStore();

  const [isScrolled, setIsScrolled] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const totalCartItems = cart.reduce((acc, item) => acc + item.quantity, 0);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 30) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const categories = [
    { label: "All Masterpieces", id: "All" },
    { label: "Chronographs", id: "Chronographs" },
    { label: "Skeleton Automatics", id: "Skeletons" },
    { label: "Diamond Editions", id: "Diamond Editions" },
    { label: "Heritage 1928", id: "Heritage" },
    { label: "Women's Elegance", id: "Women's Collection" }
  ];

  const searchResults = searchQuery.trim()
    ? products.filter(p =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.description.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  return (
    <header
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 90,
        backgroundColor: isScrolled ? 'rgba(11, 12, 16, 0.95)' : 'rgba(11, 12, 16, 0.82)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderBottom: isScrolled ? '1px solid rgba(212, 175, 55, 0.25)' : '1px solid rgba(255, 255, 255, 0.08)',
        transition: 'all 0.35s ease',
        boxShadow: isScrolled ? '0 10px 30px rgba(0, 0, 0, 0.7)' : 'none'
      }}
    >
      <div className="luxury-container" style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        height: '80px'
      }}>
        {/* Left: Mobile Menu Toggle & Brand Story Link */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            style={{
              background: 'none',
              border: 'none',
              color: '#f8fafc',
              cursor: 'pointer',
              display: 'none'
            }}
            className="mobile-menu-btn"
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>

          <button
            onClick={onOpenStory}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#94a3b8',
              fontFamily: 'var(--font-sans)',
              fontSize: '0.78rem',
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              transition: 'color 0.2s ease'
            }}
            onMouseEnter={e => e.currentTarget.style.color = '#d4af37'}
            onMouseLeave={e => e.currentTarget.style.color = '#94a3b8'}
          >
            <Compass size={14} style={{ color: '#d4af37' }} />
            <span className="hidden-sm">Maison & Craft</span>
          </button>
        </div>

        {/* Center: Brand Logo */}
        <div
          onClick={() => {
            onNavigateHome();
            setSelectedProductDetails(null);
          }}
          style={{
            cursor: 'pointer',
            textAlign: 'center',
            userSelect: 'none'
          }}
        >
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem',
            marginBottom: '2px'
          }}>
            <svg width="24" height="24" viewBox="0 0 100 100" fill="none">
              <circle cx="50" cy="50" r="46" stroke="url(#goldGrad)" strokeWidth="4" />
              <circle cx="50" cy="50" r="5" fill="#d4af37" />
              <line x1="50" y1="50" x2="50" y2="18" stroke="#d4af37" strokeWidth="3.5" strokeLinecap="round" />
              <line x1="50" y1="50" x2="74" y2="50" stroke="#d4af37" strokeWidth="2.5" strokeLinecap="round" />
              <defs>
                <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#f3e5ab" />
                  <stop offset="50%" stopColor="#d4af37" />
                  <stop offset="100%" stopColor="#997819" />
                </linearGradient>
              </defs>
            </svg>
            <span style={{
              fontFamily: 'var(--font-brand)',
              fontSize: '1.45rem',
              fontWeight: 800,
              letterSpacing: '0.22em',
              color: '#f8fafc',
              background: 'linear-gradient(135deg, #ffffff 30%, #d4af37 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}>
              LUXURY WATCH
            </span>
          </div>
          <p style={{
            fontSize: '0.62rem',
            letterSpacing: '0.35em',
            color: '#d4af37',
            textTransform: 'uppercase',
            fontWeight: 500,
            marginTop: '-3px'
          }}>
            HAUTE HORLOGERIE • GENÈVE
          </p>
        </div>

        {/* Right: Actions (Search, Wishlist, Bag) */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
          {/* Search Trigger */}
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => setIsSearchOpen(!isSearchOpen)}
              style={{
                background: 'transparent',
                border: 'none',
                color: isSearchOpen ? '#d4af37' : '#cbd5e1',
                cursor: 'pointer',
                padding: '0.4rem',
                display: 'flex',
                alignItems: 'center',
                transition: 'color 0.2s'
              }}
              title="Search Horology Catalog"
            >
              <Search size={19} />
            </button>

            {/* Search Dropdown / Bar */}
            {isSearchOpen && (
              <div
                className="glass-panel animate-fade-in"
                style={{
                  position: 'absolute',
                  right: 0,
                  top: '45px',
                  width: '320px',
                  padding: '1rem',
                  boxShadow: '0 20px 40px rgba(0,0,0,0.8)',
                  zIndex: 100,
                  border: '1px solid rgba(212, 175, 55, 0.4)'
                }}
              >
                <div style={{ position: 'relative', marginBottom: '0.75rem' }}>
                  <input
                    type="text"
                    placeholder="Search watches, tourbillon, gold..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    autoFocus
                    className="lux-input"
                    style={{ paddingRight: '2rem', fontSize: '0.85rem' }}
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      style={{
                        position: 'absolute',
                        right: '8px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        background: 'none',
                        border: 'none',
                        color: '#94a3b8',
                        cursor: 'pointer'
                      }}
                    >
                      <X size={14} />
                    </button>
                  )}
                </div>

                {searchResults.length > 0 ? (
                  <div style={{ maxHeight: '240px', overflowY: 'auto' }}>
                    <div style={{ fontSize: '0.7rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.5rem' }}>
                      Matching Timepieces ({searchResults.length})
                    </div>
                    {searchResults.map(prod => (
                      <div
                        key={prod.id}
                        onClick={() => {
                          setSelectedProductDetails(prod);
                          setIsSearchOpen(false);
                          setSearchQuery('');
                        }}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.75rem',
                          padding: '0.5rem',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          transition: 'background 0.2s',
                          borderBottom: '1px solid rgba(255,255,255,0.05)'
                        }}
                        onMouseEnter={e => e.currentTarget.style.backgroundColor = 'rgba(212, 175, 55, 0.15)'}
                        onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
                      >
                        <img
                          src={prod.images[0]}
                          alt={prod.name}
                          style={{ width: '38px', height: '38px', objectFit: 'cover', borderRadius: '3px' }}
                        />
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <p style={{ fontSize: '0.8rem', fontWeight: 600, color: '#f8fafc', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {prod.name}
                          </p>
                          <p style={{ fontSize: '0.72rem', color: '#d4af37' }}>
                            {formatCurrency(prod.price, currency)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : searchQuery ? (
                  <p style={{ fontSize: '0.8rem', color: '#94a3b8', textAlign: 'center', padding: '0.5rem 0' }}>
                    No timepieces found matching "{searchQuery}"
                  </p>
                ) : (
                  <div style={{ fontSize: '0.72rem', color: '#64748b', textAlign: 'center' }}>
                    Popular: Tourbillon, Rose Gold, Perpetual Moonphase
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Wishlist Button */}
          <button
            onClick={onOpenWishlist}
            style={{
              background: 'transparent',
              border: 'none',
              color: wishlist.length > 0 ? '#fb7185' : '#cbd5e1',
              cursor: 'pointer',
              padding: '0.4rem',
              position: 'relative',
              display: 'flex',
              alignItems: 'center',
              transition: 'color 0.2s'
            }}
            title="Vault Wishlist"
          >
            <Heart size={19} fill={wishlist.length > 0 ? '#fb7185' : 'none'} />
            {wishlist.length > 0 && (
              <span
                style={{
                  position: 'absolute',
                  top: '-2px',
                  right: '-2px',
                  background: '#e11d48',
                  color: 'white',
                  fontSize: '0.62rem',
                  fontWeight: 700,
                  width: '16px',
                  height: '16px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                {wishlist.length}
              </span>
            )}
          </button>

          {/* Shopping Bag Button */}
          <button
            onClick={() => setIsCartOpen(true)}
            style={{
              background: 'rgba(212, 175, 55, 0.12)',
              border: '1px solid rgba(212, 175, 55, 0.35)',
              borderRadius: '4px',
              padding: '0.45rem 0.85rem',
              color: '#f8fafc',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.6rem',
              transition: 'all 0.3s ease'
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background = 'rgba(212, 175, 55, 0.22)';
              e.currentTarget.style.borderColor = '#d4af37';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = 'rgba(212, 175, 55, 0.12)';
              e.currentTarget.style.borderColor = 'rgba(212, 175, 55, 0.35)';
            }}
          >
            <div style={{ position: 'relative' }}>
              <ShoppingBag size={18} style={{ color: '#d4af37' }} />
              {totalCartItems > 0 && (
                <span
                  style={{
                    position: 'absolute',
                    top: '-6px',
                    right: '-8px',
                    background: '#d4af37',
                    color: '#000',
                    fontSize: '0.62rem',
                    fontWeight: 800,
                    width: '16px',
                    height: '16px',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  {totalCartItems}
                </span>
              )}
            </div>

            <div style={{ textAlign: 'left', display: 'none' }} className="cart-total-preview">
              <div style={{ fontSize: '0.65rem', color: '#94a3b8', textTransform: 'uppercase', lineHeight: 1 }}>Bag</div>
              <div style={{ fontSize: '0.78rem', fontWeight: 600, color: '#f3e5ab' }}>
                {formatCurrency(cartSubtotal, currency)}
              </div>
            </div>
          </button>
        </div>
      </div>

      {/* Secondary Category Navigation Bar */}
      <nav
        style={{
          borderTop: '1px solid rgba(255, 255, 255, 0.05)',
          backgroundColor: 'rgba(14, 16, 21, 0.95)',
          overflowX: 'auto',
          scrollbarWidth: 'none'
        }}
      >
        <div
          className="luxury-container"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '2rem',
            padding: '0.65rem 1.5rem',
            whiteSpace: 'nowrap'
          }}
        >
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => {
                onSelectCategory(cat.id);
                setSelectedProductDetails(null);
              }}
              style={{
                background: 'none',
                border: 'none',
                color: '#cbd5e1',
                fontSize: '0.75rem',
                fontFamily: 'var(--font-sans)',
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                fontWeight: 500,
                cursor: 'pointer',
                padding: '0.2rem 0',
                position: 'relative',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={e => {
                e.currentTarget.style.color = '#d4af37';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.color = '#cbd5e1';
              }}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </nav>
    </header>
  );
};

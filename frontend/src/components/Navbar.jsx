import React, { useState, useEffect } from 'react';
import { useStore } from '../context/StoreContext';
import { useUserAuth } from '../context/UserAuthContext';
import {
  Search, Heart, ShoppingBag, Menu, X, ShieldCheck,
  ChevronDown, User, LogOut, Package, Award
} from 'lucide-react';

export const Navbar = ({
  onSelectCategory,
  onSelectBrand,
  onOpenWishlist,
  onNavigateHome,
  onOpenStory,
  onOpenReturns,
  onOpenTracking,
  onOpenAdmin,
  activeCategory
}) => {
  const {
    cart,
    wishlist,
    setIsCartOpen,
    setIsWishlistOpen,
    searchQuery,
    setSearchQuery,
    products,
    brands,
    setSelectedProductDetails
  } = useStore();

  const { user, isAuthenticated, openAuthModal, logout } = useUserAuth();

  const [isScrolled, setIsScrolled] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isBrandsDropdownOpen, setIsBrandsDropdownOpen] = useState(false);

  const totalCartItems = cart.reduce((acc, item) => acc + item.quantity, 0);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navCategories = [
    { label: "All", id: "All" },
    { label: "New Arrivals", id: "New Arrivals" },
    { label: "Men", id: "Men" },
    { label: "Women", id: "Women" },
    { label: "Luxury", id: "Luxury" },
    { label: "Chronographs", id: "Chronographs" },
    { label: "Skeletons", id: "Skeletons" },
    { label: "Offers", id: "Offers" }
  ];

  const brandList = (brands && brands.length > 0 ? brands : [
    { name: 'Rolex', slug: 'rolex' },
    { name: 'Titan', slug: 'titan' },
    { name: 'Casio', slug: 'casio' },
    { name: 'Fastrack', slug: 'fastrack' },
    { name: 'Fossil', slug: 'fossil' },
    { name: 'Timex', slug: 'timex' },
    { name: 'Sonata', slug: 'sonata' },
    { name: 'Guess', slug: 'guess' },
    { name: 'Limestone', slug: 'limestone' },
    { name: 'Noise', slug: 'noise' }
  ]);

  const searchResults = searchQuery.trim()
    ? products.filter(p =>
        p.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.brand?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.category?.toLowerCase().includes(searchQuery.toLowerCase())
      ).slice(0, 6)
    : [];

  const handleBrandSelection = (brandObj) => {
    setIsBrandsDropdownOpen(false);
    setIsMobileMenuOpen(false);
    if (setSelectedProductDetails) setSelectedProductDetails(null);
    const slug = brandObj.slug || brandObj.name.toLowerCase().replace(/[^a-z0-9]/g, '-');
    if (typeof onSelectBrand === 'function') {
      onSelectBrand(slug);
    } else {
      window.history.pushState(null, '', `/brands/${slug}`);
      window.dispatchEvent(new PopStateEvent('popstate'));
    }
  };

  return (
    <header
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 90,
        backgroundColor: isScrolled ? 'rgba(255, 255, 255, 0.98)' : 'rgba(255, 255, 255, 0.96)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        borderBottom: isScrolled ? '1px solid rgba(180, 140, 30, 0.25)' : '1px solid rgba(0, 0, 0, 0.08)',
        transition: 'all 0.3s ease',
        boxShadow: isScrolled ? '0 4px 20px rgba(15, 23, 42, 0.06)' : 'none',
        width: '100%',
        maxWidth: '100vw'
      }}
    >
      <div className="luxury-container" style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        height: '68px',
        position: 'relative',
        width: '100%',
        padding: '0 clamp(0.5rem, 3vw, 1.5rem)'
      }}>
        {/* Left Side: Mobile Menu Button + Brand Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 }}>
          {/* Mobile Menu Toggle Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="mobile-only"
            style={{
              background: 'none',
              border: 'none',
              color: '#0f172a',
              cursor: 'pointer',
              padding: '6px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}
            aria-label="Toggle navigation menu"
          >
            {isMobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>

          {/* Brand Logo */}
          <div
            onClick={() => {
              if (setSelectedProductDetails) setSelectedProductDetails(null);
              if (onNavigateHome) onNavigateHome();
              else if (onSelectCategory) onSelectCategory('All');
              window.history.pushState(null, '', '/');
              window.dispatchEvent(new PopStateEvent('popstate'));
            }}
            style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '7px', minWidth: 0 }}
          >
            <div style={{
              width: '28px',
              height: '28px',
              borderRadius: '50%',
              background: 'radial-gradient(circle, #f3e5ab 0%, #d4af37 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 2px 8px rgba(180, 140, 30, 0.25)',
              flexShrink: 0
            }}>
              <ShieldCheck size={16} color="#0f172a" />
            </div>
            <div style={{ minWidth: 0 }}>
              <div style={{
                fontFamily: 'var(--font-brand)',
                fontSize: 'clamp(0.95rem, 3.2vw, 1.25rem)',
                fontWeight: 800,
                letterSpacing: '0.08em',
                color: '#0f172a',
                lineHeight: 1.1,
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis'
              }}>
                LUXURY WATCH
              </div>
              <div style={{
                fontSize: '0.48rem',
                letterSpacing: '0.16em',
                color: '#8a6709',
                fontWeight: 700,
                textTransform: 'uppercase',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis'
              }}>
                TIMELESS WATCHES. EXCEPTIONAL VALUE.
              </div>
            </div>
          </div>
        </div>

        {/* Center: Desktop Navigation Links */}
        <nav className="desktop-only" style={{ alignItems: 'center', gap: '0.85rem' }}>
          {navCategories.map(cat => {
            const isSelected = activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => {
                  if (setSelectedProductDetails) setSelectedProductDetails(null);
                  if (onSelectCategory) onSelectCategory(cat.id);
                  window.history.pushState(null, '', '/');
                  window.dispatchEvent(new PopStateEvent('popstate'));
                  const catalogEl = document.getElementById('catalog-section');
                  if (catalogEl) catalogEl.scrollIntoView({ behavior: 'smooth' });
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '0.74rem',
                  fontWeight: isSelected ? 700 : 500,
                  letterSpacing: '0.06em',
                  color: isSelected ? '#8a6709' : '#334155',
                  textTransform: 'uppercase',
                  cursor: 'pointer',
                  padding: '6px 2px',
                  borderBottom: isSelected ? '2px solid #8a6709' : '2px solid transparent',
                  transition: 'all 0.2s ease',
                  whiteSpace: 'nowrap'
                }}
              >
                {cat.label}
              </button>
            );
          })}

          {/* Brands Dropdown on Desktop */}
          <div
            style={{ position: 'relative' }}
            onMouseEnter={() => setIsBrandsDropdownOpen(true)}
            onMouseLeave={() => setIsBrandsDropdownOpen(false)}
          >
            <button
              style={{
                background: 'none',
                border: 'none',
                fontSize: '0.74rem',
                fontWeight: 600,
                letterSpacing: '0.06em',
                color: '#334155',
                textTransform: 'uppercase',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '3px',
                padding: '6px 2px'
              }}
            >
              <span>Brands</span>
              <ChevronDown size={13} color="#8a6709" />
            </button>

            {isBrandsDropdownOpen && (
              <div style={{
                position: 'absolute',
                top: '100%',
                left: 0,
                width: '210px',
                background: '#ffffff',
                border: '1px solid rgba(180, 140, 30, 0.3)',
                borderRadius: '8px',
                boxShadow: '0 15px 35px rgba(0, 0, 0, 0.12)',
                padding: '0.5rem',
                zIndex: 100
              }}>
                {brandList.map((b, idx) => (
                  <div
                    key={idx}
                    onClick={() => handleBrandSelection(b)}
                    style={{
                      padding: '7px 10px',
                      fontSize: '0.76rem',
                      color: '#0f172a',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(212, 175, 55, 0.1)'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                  >
                    <span>{b.name}</span>
                    <span style={{ fontSize: '0.65rem', color: '#8a6709', fontWeight: 600 }}>Explore →</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </nav>

        {/* Right Utility Icons: Search, Account, Wishlist, Cart */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 'clamp(0.2rem, 1.5vw, 0.5rem)', flexShrink: 0 }}>
          {/* Search Trigger */}
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => setIsSearchOpen(!isSearchOpen)}
              style={{
                background: 'none',
                border: 'none',
                color: '#0f172a',
                cursor: 'pointer',
                padding: '6px',
                display: 'flex',
                alignItems: 'center'
              }}
              title="Search Catalog"
            >
              <Search size={18} />
            </button>

            {isSearchOpen && (
              <div style={{
                position: 'fixed',
                left: '1rem',
                right: '1rem',
                top: '72px',
                maxWidth: '400px',
                margin: '0 auto',
                background: '#ffffff',
                border: '1px solid rgba(180, 140, 30, 0.3)',
                borderRadius: '8px',
                boxShadow: '0 15px 35px rgba(0, 0, 0, 0.15)',
                padding: '0.75rem',
                zIndex: 100
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#8a6709', textTransform: 'uppercase' }}>Quick Search</span>
                  <button onClick={() => setIsSearchOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}>
                    <X size={14} />
                  </button>
                </div>
                <input
                  type="text"
                  autoFocus
                  placeholder="Search Rolex, Omega, Chronograph..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="lux-input"
                  style={{ fontSize: '0.8rem', padding: '8px 12px', width: '100%' }}
                />
                {searchResults.length > 0 && (
                  <div style={{ marginTop: '0.5rem', maxHeight: '200px', overflowY: 'auto' }}>
                    {searchResults.map(p => (
                      <div
                        key={p.id}
                        onClick={() => {
                          if (setSelectedProductDetails) setSelectedProductDetails(p);
                          setIsSearchOpen(false);
                        }}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          padding: '6px',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          borderBottom: '1px solid rgba(0,0,0,0.04)'
                        }}
                      >
                        <img src={p.images?.[0]} alt={p.name} style={{ width: '28px', height: '28px', objectFit: 'cover', borderRadius: '3px' }} />
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#0f172a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.name}</div>
                          <div style={{ fontSize: '0.68rem', color: '#8a6709' }}>₹{p.price?.toLocaleString('en-IN')}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* User Account Menu */}
          <div style={{ position: 'relative' }}>
            {isAuthenticated ? (
              <button
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                style={{
                  background: 'rgba(180, 140, 30, 0.1)',
                  border: '1px solid rgba(180, 140, 30, 0.3)',
                  borderRadius: '50px',
                  padding: '4px 8px',
                  color: '#8a6709',
                  fontSize: '0.72rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
              >
                <User size={14} />
                <span className="desktop-only">{user?.name?.split(' ')[0] || 'Patron'}</span>
              </button>
            ) : (
              <button
                onClick={() => openAuthModal('signin')}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#0f172a',
                  cursor: 'pointer',
                  padding: '6px',
                  display: 'flex',
                  alignItems: 'center'
                }}
                title="Sign In"
              >
                <User size={18} />
              </button>
            )}

            {isUserMenuOpen && isAuthenticated && (
              <div style={{
                position: 'absolute',
                right: 0,
                top: 'calc(100% + 10px)',
                width: '190px',
                background: '#ffffff',
                border: '1px solid rgba(180, 140, 30, 0.3)',
                borderRadius: '8px',
                boxShadow: '0 15px 35px rgba(0, 0, 0, 0.12)',
                padding: '0.5rem',
                zIndex: 100
              }}>
                <div style={{ padding: '6px 8px', borderBottom: '1px solid rgba(0,0,0,0.06)', marginBottom: '4px' }}>
                  <div style={{ fontWeight: 700, fontSize: '0.75rem', color: '#0f172a' }}>{user?.name}</div>
                  <div style={{ fontSize: '0.65rem', color: '#64748b', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user?.email}</div>
                </div>
                <button
                  onClick={() => {
                    setIsUserMenuOpen(false);
                    window.location.hash = '#orders';
                    if (onOpenTracking) onOpenTracking();
                  }}
                  style={{ width: '100%', background: 'none', border: 'none', padding: '7px 8px', textAlign: 'left', fontSize: '0.75rem', color: '#0f172a', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
                >
                  <Package size={13} color="#8a6709" />
                  <span>My Orders & Tracking</span>
                </button>
                <button
                  onClick={() => {
                    setIsUserMenuOpen(false);
                    logout();
                  }}
                  style={{ width: '100%', background: 'none', border: 'none', padding: '7px 8px', textAlign: 'left', fontSize: '0.75rem', color: '#dc2626', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', borderTop: '1px solid rgba(0,0,0,0.06)' }}
                >
                  <LogOut size={13} />
                  <span>Sign Out</span>
                </button>
              </div>
            )}
          </div>

          {/* Wishlist Icon */}
          <button
            onClick={() => setIsWishlistOpen ? setIsWishlistOpen(true) : onOpenWishlist && onOpenWishlist()}
            style={{
              background: 'none',
              border: 'none',
              color: '#0f172a',
              cursor: 'pointer',
              padding: '6px',
              position: 'relative'
            }}
            title="Private Wishlist"
          >
            <Heart size={18} />
            {wishlist.length > 0 && (
              <span style={{
                position: 'absolute',
                top: '1px',
                right: '1px',
                background: '#8a6709',
                color: '#ffffff',
                fontSize: '0.55rem',
                fontWeight: 700,
                width: '15px',
                height: '15px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                {wishlist.length}
              </span>
            )}
          </button>

          {/* Cart Icon */}
          <button
            onClick={() => setIsCartOpen(true)}
            style={{
              background: 'none',
              border: 'none',
              color: '#0f172a',
              cursor: 'pointer',
              padding: '6px',
              position: 'relative'
            }}
            title="Vault Bag"
          >
            <ShoppingBag size={18} />
            {totalCartItems > 0 && (
              <span style={{
                position: 'absolute',
                top: '1px',
                right: '1px',
                background: '#0f172a',
                color: '#f3e5ab',
                fontSize: '0.55rem',
                fontWeight: 700,
                width: '16px',
                height: '16px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '1px solid #d4af37'
              }}>
                {totalCartItems}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu (Visible only when open on mobile) */}
      {isMobileMenuOpen && (
        <div style={{
          backgroundColor: '#ffffff',
          borderTop: '1px solid rgba(0, 0, 0, 0.08)',
          boxShadow: '0 15px 30px rgba(0, 0, 0, 0.12)',
          padding: '1rem',
          maxHeight: '80vh',
          overflowY: 'auto'
        }}>
          {/* Category Navigation Section */}
          <div style={{
            fontSize: '0.65rem',
            letterSpacing: '0.12em',
            color: '#8a6709',
            fontWeight: 700,
            textTransform: 'uppercase',
            marginBottom: '0.5rem'
          }}>
            Categories
          </div>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
            gap: '6px',
            marginBottom: '1rem'
          }}>
            {navCategories.map(cat => (
              <button
                key={cat.id}
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  if (setSelectedProductDetails) setSelectedProductDetails(null);
                  if (onSelectCategory) onSelectCategory(cat.id);
                  window.history.pushState(null, '', '/');
                  window.dispatchEvent(new PopStateEvent('popstate'));
                  const catalogEl = document.getElementById('catalog-section');
                  if (catalogEl) catalogEl.scrollIntoView({ behavior: 'smooth' });
                }}
                style={{
                  padding: '8px 10px',
                  background: activeCategory === cat.id ? 'rgba(180, 140, 30, 0.12)' : '#f8fafc',
                  border: activeCategory === cat.id ? '1px solid #d4af37' : '1px solid rgba(0,0,0,0.06)',
                  borderRadius: '5px',
                  fontSize: '0.74rem',
                  fontWeight: activeCategory === cat.id ? 700 : 500,
                  color: activeCategory === cat.id ? '#8a6709' : '#0f172a',
                  textAlign: 'left',
                  cursor: 'pointer'
                }}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Curated Brands Section */}
          <div style={{
            fontSize: '0.65rem',
            letterSpacing: '0.12em',
            color: '#8a6709',
            fontWeight: 700,
            textTransform: 'uppercase',
            marginBottom: '0.5rem',
            display: 'flex',
            alignItems: 'center',
            gap: '4px'
          }}>
            <Award size={13} color="#8a6709" />
            <span>Dedicated Brand Houses</span>
          </div>
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '6px',
            marginBottom: '1rem'
          }}>
            {brandList.map((b, idx) => (
              <button
                key={idx}
                onClick={() => handleBrandSelection(b)}
                style={{
                  padding: '5px 10px',
                  background: '#ffffff',
                  border: '1px solid rgba(180, 140, 30, 0.3)',
                  borderRadius: '4px',
                  fontSize: '0.72rem',
                  fontWeight: 600,
                  color: '#0f172a',
                  cursor: 'pointer'
                }}
              >
                {b.name} →
              </button>
            ))}
          </div>

          {/* Account / Tracking Action */}
          <button
            onClick={() => {
              setIsMobileMenuOpen(false);
              window.location.hash = '#orders';
              if (onOpenTracking) onOpenTracking();
            }}
            style={{
              width: '100%',
              padding: '10px',
              background: '#0f172a',
              color: '#f3e5ab',
              border: 'none',
              borderRadius: '6px',
              fontSize: '0.75rem',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px'
            }}
          >
            <Package size={14} color="#f3e5ab" />
            <span>{isAuthenticated ? 'MY ORDERS & CONSIGNMENT TRACKING' : 'TRACK CONSIGNMENT / MY ORDERS'}</span>
          </button>
        </div>
      )}
    </header>
  );
};

export default Navbar;

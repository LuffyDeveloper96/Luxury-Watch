import React, { useState, useEffect } from 'react';
import { StoreProvider, useStore } from './context/StoreContext';
import { AdminAuthProvider, useAdminAuth } from './context/AdminAuthContext';
import { UserAuthProvider, useUserAuth } from './context/UserAuthContext';
import { AnnouncementBar } from './components/AnnouncementBar';
import { Navbar } from './components/Navbar';
import { HeroSection } from './components/HeroSection';
import { ProductCard } from './components/ProductCard';
import { ProductQuickView } from './components/ProductQuickView';
import { ProductDetailsPage } from './components/ProductDetailsPage';
import { CartDrawer } from './components/CartDrawer';
import { WishlistDrawer } from './components/WishlistDrawer';
import { SearchModal } from './components/SearchModal';
import { CheckoutModal } from './components/CheckoutModal';
import { OrderConfirmationModal } from './components/OrderConfirmationModal';
import { OrderTrackingModal } from './components/OrderTrackingModal';
import { UserAuthModal } from './components/UserAuthModal';
import { ReturnRequestModal } from './components/ReturnRequestModal';
import { BrandStory } from './components/BrandStory';
import { ReviewsSection } from './components/ReviewsSection';
import { Footer } from './components/Footer';
import { AdminLogin } from './components/admin/AdminLogin';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { TrackConsignmentPage } from './pages/TrackConsignmentPage';
import { BrandPage } from './components/BrandPage';
import { SlidersHorizontal } from 'lucide-react';

const Storefront = ({
  onOpenAdmin,
  onOpenTracking,
  onOpenBrandStory,
  onOpenReturns,
  onSelectBrand,
  activeCategory,
  setActiveCategory
}) => {
  const {
    products,
    selectedProductDetails,
    setSelectedProductDetails
  } = useStore();

  const [sortBy, setSortBy] = useState('featured'); // 'featured' | 'price-low' | 'price-high' | 'rating'
  const [selectedGender, setSelectedGender] = useState('All');
  const [priceRange, setPriceRange] = useState(10000);

  const categories = [
    { id: 'All', label: 'All Masterpieces' },
    { id: 'Rolex', label: 'Rolex' },
    { id: 'Titan', label: 'Titan' },
    { id: 'Casio', label: 'Casio' },
    { id: 'Fastrack', label: 'Fastrack' },
    { id: 'Fossil', label: 'Fossil' },
    { id: 'Timex', label: 'Timex' },
    { id: 'Sonata', label: 'Sonata' },
    { id: 'Guess', label: 'Guess' },
    { id: 'Limestone', label: 'Limestone' },
    { id: 'Noise', label: 'Noise' },
    { id: 'Chronographs', label: 'Chronographs' },
    { id: 'Skeletons', label: 'Skeleton Automatics' },
    { id: 'Diamond Editions', label: 'Diamond Editions' },
    { id: 'Dive & Sport', label: 'Diver & Sport' }
  ];

  // Filtering products
  let filtered = products.filter(p => {
    // Category or Brand filter
    if (activeCategory && activeCategory !== 'All') {
      const target = activeCategory.toLowerCase();
      const pCat = (p.category || '').toLowerCase();
      const pBrand = (p.brand || '').toLowerCase();

      let matches = false;
      if (pBrand === target || pCat === target || pCat.includes(target)) matches = true;
      if (target === 'men' && (p.gender === 'Men' || p.gender === 'Unisex')) matches = true;
      if (target === 'women' && (p.gender === 'Women' || p.gender === 'Unisex')) matches = true;
      if (target === 'new arrivals' && (p.isNewArrival || p.isNew)) matches = true;
      if (target === 'offers' && (p.comparePrice && p.comparePrice > p.price)) matches = true;
      if (target === 'luxury' && (pBrand.includes('rolex') || pBrand.includes('titan') || pBrand.includes('casio') || pBrand.includes('guess') || pBrand.includes('fossil'))) matches = true;
      if (target === 'chronographs' && (pCat.includes('chrono') || p.specs?.movement?.toLowerCase().includes('chrono'))) matches = true;
      if (target === 'skeletons' && pCat.includes('skeleton')) matches = true;

      if (!matches) return false;
    }

    // Gender Filter
    if (selectedGender !== 'All') {
      if (p.gender && p.gender !== selectedGender && p.gender !== 'Unisex') return false;
    }

    // Price Filter
    if (priceRange && p.price > priceRange) {
      return false;
    }

    return true;
  });

  // Sorting products
  if (sortBy === 'price-low') {
    filtered = [...filtered].sort((a, b) => a.price - b.price);
  } else if (sortBy === 'price-high') {
    filtered = [...filtered].sort((a, b) => b.price - a.price);
  } else if (sortBy === 'rating') {
    filtered = [...filtered].sort((a, b) => b.rating - a.rating);
  }

  // If viewing product details page (PDP)
  if (selectedProductDetails) {
    return (
      <>
        <AnnouncementBar
          onOpenTracking={() => { window.location.hash = '#track-order'; }}
        />
        <Navbar
          onSelectCategory={(cat) => {
            setSelectedProductDetails(null);
            setActiveCategory(cat);
          }}
          onSelectBrand={onSelectBrand}
          activeCategory={activeCategory}
          onNavigateHome={() => {
            setSelectedProductDetails(null);
            setActiveCategory('All');
          }}
          onOpenBrandStory={() => {
            setSelectedProductDetails(null);
            onOpenBrandStory();
          }}
          onOpenAdmin={onOpenAdmin}
          onOpenTracking={() => { window.location.hash = '#track-order'; }}
          onOpenReturns={onOpenReturns}
        />
        <ProductDetailsPage
          product={selectedProductDetails}
          onBack={() => setSelectedProductDetails(null)}
          onSelectOtherProduct={(other) => setSelectedProductDetails(other)}
        />
        <Footer
          onSelectCategory={(cat) => {
            setSelectedProductDetails(null);
            setActiveCategory(cat);
          }}
          onOpenAdmin={onOpenAdmin}
          onOpenBrandStory={onOpenBrandStory}
          onOpenTracking={() => { window.location.hash = '#track-order'; }}
          onOpenReturns={onOpenReturns}
        />
      </>
    );
  }

  return (
    <>
      <AnnouncementBar
        onOpenTracking={() => { window.location.hash = '#track-order'; }}
      />
      <Navbar
        onSelectCategory={setActiveCategory}
        onSelectBrand={onSelectBrand}
        activeCategory={activeCategory}
        onNavigateHome={() => setActiveCategory('All')}
        onOpenBrandStory={onOpenBrandStory}
        onOpenAdmin={onOpenAdmin}
        onOpenTracking={() => { window.location.hash = '#track-order'; }}
        onOpenReturns={onOpenReturns}
      />

      {/* Hero Section */}
      <HeroSection
        onShopNow={() => {
          setActiveCategory('All');
          const el = document.getElementById('catalog-section');
          if (el) el.scrollIntoView({ behavior: 'smooth' });
        }}
        onExploreSkeleton={() => {
          setActiveCategory('Skeletons');
          const el = document.getElementById('catalog-section');
          if (el) el.scrollIntoView({ behavior: 'smooth' });
        }}
      />

      {/* Main Catalog Showcase Section */}
      <section id="catalog-section" style={{ padding: 'clamp(3rem, 6vw, 5rem) 0', background: '#fbfbf9' }}>
        <div className="luxury-container">
          {/* Section Header */}
          <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
            <span style={{
              fontSize: 'clamp(0.6rem, 1.8vw, 0.72rem)',
              letterSpacing: '0.15em',
              color: '#8a6709',
              textTransform: 'uppercase',
              fontWeight: 700,
              display: 'block',
              marginBottom: '0.5rem'
            }}>
              HAUTE HORLOGERIE PORTFOLIO
            </span>
            <h2 style={{
              fontSize: 'clamp(1.4rem, 4.5vw, 2.8rem)',
              color: '#0f172a',
              fontFamily: 'var(--font-brand)',
              wordBreak: 'break-word'
            }}>
              THE MASTERPIECE CATALOG
            </h2>
            <div style={{
              width: '60px',
              height: '2px',
              background: 'var(--gold-gradient)',
              margin: '1rem auto'
            }} />
            <p style={{
              color: '#475569',
              fontSize: 'clamp(0.82rem, 2vw, 0.92rem)',
              maxWidth: '620px',
              margin: '0 auto',
              fontWeight: 400
            }}>
              Direct atelier allocations from Geneva, Le Brassus, and Glashütte. Hand-calibrated with chronometer accuracy certificates.
            </p>
          </div>

          {/* Filter & Sorting Controls */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '1rem',
            marginBottom: '2rem',
            paddingBottom: '1.25rem',
            borderBottom: '1px solid rgba(0, 0, 0, 0.08)'
          }}>
            {/* Category Filter Pills */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              overflowX: 'auto',
              maxWidth: '100%',
              paddingBottom: '6px',
              scrollbarWidth: 'none'
            }}>
              {categories.map(cat => {
                const isSelected = activeCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    onClick={() => setActiveCategory(cat.id)}
                    style={{
                      background: isSelected ? 'rgba(180, 140, 30, 0.12)' : '#ffffff',
                      border: isSelected ? '1px solid #d4af37' : '1px solid rgba(0, 0, 0, 0.08)',
                      color: isSelected ? '#8a6709' : '#475569',
                      padding: '6px 14px',
                      borderRadius: '3px',
                      fontSize: 'clamp(0.72rem, 1.8vw, 0.78rem)',
                      fontWeight: isSelected ? 700 : 500,
                      letterSpacing: '0.04em',
                      cursor: 'pointer',
                      boxShadow: isSelected ? '0 2px 8px rgba(180, 140, 30, 0.15)' : 'none',
                      transition: 'all 0.2s ease',
                      whiteSpace: 'nowrap',
                      flexShrink: 0
                    }}
                  >
                    {cat.label}
                  </button>
                );
              })}
            </div>

            {/* Sorter Selector */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <SlidersHorizontal size={14} color="#8a6709" />
              <span style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase' }}>Sort:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="lux-select"
                style={{ padding: '6px 12px', fontSize: '0.78rem', width: 'auto' }}
              >
                <option value="featured">Featured Curations</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="rating">Highest Rated</option>
              </select>
            </div>
          </div>

          {/* Product Grid */}
          {filtered.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '4rem 1rem', color: '#64748b' }}>
              <p>No timepieces found in this category allocation.</p>
              <button
                onClick={() => setActiveCategory('All')}
                className="btn-gold"
                style={{ marginTop: '1rem', padding: '8px 18px', fontSize: '0.8rem' }}
              >
                View All Timepieces
              </button>
            </div>
          ) : (
            <div className="product-grid">
              {filtered.map(product => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onSelectProduct={(p) => setSelectedProductDetails(p)}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Brand Heritage Story */}
      <BrandStory />

      {/* Client Reviews & Press Accolades */}
      <ReviewsSection />

      {/* Footer */}
      <Footer
        onSelectCategory={setActiveCategory}
        onOpenAdmin={onOpenAdmin}
        onOpenBrandStory={onOpenBrandStory}
        onOpenTracking={() => { window.location.hash = '#track-order'; }}
        onOpenReturns={onOpenReturns}
      />
    </>
  );
};

const MainAppContent = () => {
  const { isAdminAuthenticated } = useAdminAuth();
  const { setSelectedProductDetails } = useStore();
  const [isAdminView, setIsAdminView] = useState(false);
  const [showAdminLoginModal, setShowAdminLoginModal] = useState(false);
  const [activeCategory, setActiveCategory] = useState('All');
  const [activeBrandSlug, setActiveBrandSlug] = useState(null);
  const [isTrackingPageView, setIsTrackingPageView] = useState(false);

  // Returns Modal State
  const [isReturnModalOpen, setIsReturnModalOpen] = useState(false);
  const [returnModalOrderId, setReturnModalOrderId] = useState('');

  // Automatic routing detection (pathname & hash)
  useEffect(() => {
    const checkRoutes = () => {
      const path = window.location.pathname;
      const hash = window.location.hash;

      const isHashAdmin = hash === '#admin' || hash.startsWith('#admin');
      const isPathAdmin = path === '/admin' || path.startsWith('/admin');
      const isHashTrack = hash === '#track-order' || hash === '#orders' || hash === '#my-orders';
      
      setIsTrackingPageView(isHashTrack);

      if (isHashAdmin || isPathAdmin) {
        if (isAdminAuthenticated) {
          setIsAdminView(true);
        } else {
          setShowAdminLoginModal(true);
        }
      }

      // Detect /brands/:brandSlug or #brands/:brandSlug
      if (path.startsWith('/brands/')) {
        const slug = path.replace('/brands/', '').split('/')[0]?.trim();
        if (slug) {
          setActiveBrandSlug(slug);
        } else {
          setActiveBrandSlug(null);
        }
      } else if (hash.startsWith('#brands/') || hash.startsWith('#brand/')) {
        const slug = hash.replace(/^#(brands|brand)\//, '').split('/')[0]?.trim();
        if (slug) {
          setActiveBrandSlug(slug);
        } else {
          setActiveBrandSlug(null);
        }
      } else {
        setActiveBrandSlug(null);
      }
    };

    checkRoutes();
    window.addEventListener('hashchange', checkRoutes);
    window.addEventListener('popstate', checkRoutes);
    return () => {
      window.removeEventListener('hashchange', checkRoutes);
      window.removeEventListener('popstate', checkRoutes);
    };
  }, [isAdminAuthenticated]);

  const handleOpenAdmin = () => {
    if (window.location.hash !== '#admin') {
      window.location.hash = '#admin';
    }
    if (isAdminAuthenticated) {
      setIsAdminView(true);
    } else {
      setShowAdminLoginModal(true);
    }
  };

  const handleSelectBrand = (slug) => {
    if (setSelectedProductDetails) setSelectedProductDetails(null);
    window.history.pushState(null, '', `/brands/${slug}`);
    setActiveBrandSlug(slug);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBackToStore = () => {
    window.history.pushState(null, '', '/');
    setActiveBrandSlug(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenBrandStory = () => {
    const el = document.getElementById('heritage-section');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  const handleOpenReturns = (orderId = '') => {
    setReturnModalOrderId(orderId);
    setIsReturnModalOpen(true);
  };

  return (
    <div>
      {/* View Router */}
      {isTrackingPageView ? (
        <>
          <Navbar 
            onSelectCategory={(cat) => {
              window.location.hash = '';
              setActiveCategory(cat);
            }}
            onSelectBrand={handleSelectBrand}
            activeCategory={activeCategory}
            onNavigateHome={handleBackToStore}
            onOpenBrandStory={() => {
              window.location.hash = '';
              setTimeout(handleOpenBrandStory, 100);
            }}
            onOpenAdmin={handleOpenAdmin}
            onOpenTracking={() => {}}
            onOpenReturns={handleOpenReturns}
          />
          <TrackConsignmentPage 
            onBack={() => { window.location.hash = ''; }}
            onOpenReturnForOrder={handleOpenReturns}
          />
        </>
      ) : isAdminAuthenticated && isAdminView ? (
        <AdminDashboard onBackToStore={() => {
          if (window.location.hash.includes('admin')) {
            window.history.replaceState(null, '', window.location.pathname);
          }
          setIsAdminView(false);
        }} />
      ) : activeBrandSlug ? (
        <>
          <AnnouncementBar
            onOpenTracking={() => { window.location.hash = '#track-order'; }}
          />
          <Navbar
            onSelectCategory={(cat) => {
              handleBackToStore();
              setActiveCategory(cat);
            }}
            onSelectBrand={handleSelectBrand}
            activeCategory={activeCategory}
            onNavigateHome={handleBackToStore}
            onOpenBrandStory={() => {
              handleBackToStore();
              setTimeout(handleOpenBrandStory, 100);
            }}
            onOpenAdmin={handleOpenAdmin}
            onOpenTracking={() => { window.location.hash = '#track-order'; }}
            onOpenReturns={handleOpenReturns}
          />
          <BrandPage
            brandSlug={activeBrandSlug}
            onBackToStore={handleBackToStore}
            onSelectProduct={(p) => {
              if (setSelectedProductDetails) setSelectedProductDetails(p);
            }}
          />
          <Footer
            onSelectCategory={(cat) => {
              handleBackToStore();
              setActiveCategory(cat);
            }}
            onOpenAdmin={handleOpenAdmin}
            onOpenBrandStory={handleOpenBrandStory}
            onOpenTracking={() => { window.location.hash = '#track-order'; }}
            onOpenReturns={handleOpenReturns}
          />
        </>
      ) : (
        <Storefront
          onOpenAdmin={handleOpenAdmin}
          onOpenBrandStory={handleOpenBrandStory}
          onOpenReturns={handleOpenReturns}
          onSelectBrand={handleSelectBrand}
          activeCategory={activeCategory}
          setActiveCategory={setActiveCategory}
        />
      )}

      {/* Admin Login Modal */}
      {showAdminLoginModal && !isAdminAuthenticated && (
        <AdminLogin
          onClose={() => {
            setShowAdminLoginModal(false);
            if (window.location.hash.includes('admin')) {
              window.history.replaceState(null, '', window.location.pathname);
            }
          }}
          onSuccess={() => {
            setShowAdminLoginModal(false);
            setIsAdminView(true);
          }}
        />
      )}

      {/* User Authentication Modal (Direct Email + Password Authentication) */}
      <UserAuthModal />

      {/* Customer Returns & Exchanges Modal */}
      <ReturnRequestModal
        isOpen={isReturnModalOpen}
        onClose={() => setIsReturnModalOpen(false)}
        initialOrderId={returnModalOrderId}
      />

      {/* Global Modals & Drawers */}
      <ProductQuickView />
      <CartDrawer />
      <WishlistDrawer />
      <SearchModal />
      <CheckoutModal />
      <OrderConfirmationModal
        onOpenTracking={() => { window.location.hash = '#orders'; }}
      />
      <OrderTrackingModal
        onOpenReturnForOrder={(orderId) => handleOpenReturns(orderId)}
      />
    </div>
  );
};

export function App() {
  return (
    <StoreProvider>
      <AdminAuthProvider>
        <UserAuthProvider>
          <MainAppContent />
        </UserAuthProvider>
      </AdminAuthProvider>
    </StoreProvider>
  );
}

export default App;

import React, { useState } from 'react';
import { StoreProvider, useStore } from './context/StoreContext';
import { AdminAuthProvider, useAdminAuth } from './context/AdminAuthContext';
import { AnnouncementBar } from './components/AnnouncementBar';
import { Navbar } from './components/Navbar';
import { HeroSection } from './components/HeroSection';
import { CollectionGrid } from './components/CollectionGrid';
import { ProductCard } from './components/ProductCard';
import { ProductQuickView } from './components/ProductQuickView';
import { ProductDetailsPage } from './components/ProductDetailsPage';
import { CartDrawer } from './components/CartDrawer';
import { WishlistDrawer } from './components/WishlistDrawer';
import { SearchModal } from './components/SearchModal';
import { CheckoutModal } from './components/CheckoutModal';
import { OrderConfirmationModal } from './components/OrderConfirmationModal';
import { OrderTrackingModal } from './components/OrderTrackingModal';
import { BrandStory } from './components/BrandStory';
import { ReviewsSection } from './components/ReviewsSection';
import { Footer } from './components/Footer';
import { AdminLogin } from './components/admin/AdminLogin';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { SlidersHorizontal, Sparkles, Watch, ShieldCheck } from 'lucide-react';

const Storefront = ({
  onOpenAdmin,
  onOpenTracking,
  onOpenBrandStory,
  activeCategory,
  setActiveCategory
}) => {
  const { products, selectedProductDetails, setSelectedProductDetails, setIsOrderTrackingOpen } = useStore();
  const [sortBy, setSortBy] = useState('featured'); // 'featured' | 'price-low' | 'price-high' | 'rating'

  const categories = [
    { id: 'All', label: 'All Masterpieces' },
    { id: 'Chronograph', label: 'Chronographs' },
    { id: 'Skeleton Automatic', label: 'Skeleton Automatic' },
    { id: 'Diamond Collection', label: 'Diamond Collection' },
    { id: 'Automatic', label: 'Abyss Diver & GMT' },
    { id: 'Women', label: "Women's Elegance" },
    { id: 'Men', label: "Men's Collection" }
  ];

  // Filtering products
  let filtered = products.filter(p => {
    if (activeCategory === 'All') return true;
    if (activeCategory === 'Men') return p.gender === 'Men' || p.gender === 'Unisex';
    if (activeCategory === 'Women') return p.gender === 'Women' || p.gender === 'Unisex';
    return p.category === activeCategory;
  });

  // Sorting products
  if (sortBy === 'price-low') {
    filtered = [...filtered].sort((a, b) => a.price - b.price);
  } else if (sortBy === 'price-high') {
    filtered = [...filtered].sort((a, b) => b.price - a.price);
  } else if (sortBy === 'rating') {
    filtered = [...filtered].sort((a, b) => b.rating - a.rating);
  }

  // If a user is viewing full product details, display PDP
  if (selectedProductDetails) {
    return (
      <>
        <AnnouncementBar
          onOpenAdmin={onOpenAdmin}
          onOpenTracking={() => setIsOrderTrackingOpen(true)}
        />
        <Navbar
          onSelectCategory={(cat) => {
            setSelectedProductDetails(null);
            setActiveCategory(cat);
          }}
          activeCategory={activeCategory}
          onOpenBrandStory={() => {
            setSelectedProductDetails(null);
            onOpenBrandStory();
          }}
          onOpenAdmin={onOpenAdmin}
          onOpenTracking={() => setIsOrderTrackingOpen(true)}
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
          onOpenTracking={() => setIsOrderTrackingOpen(true)}
        />
      </>
    );
  }

  return (
    <>
      <AnnouncementBar
        onOpenAdmin={onOpenAdmin}
        onOpenTracking={() => setIsOrderTrackingOpen(true)}
      />
      <Navbar
        onSelectCategory={setActiveCategory}
        activeCategory={activeCategory}
        onOpenBrandStory={onOpenBrandStory}
        onOpenAdmin={onOpenAdmin}
        onOpenTracking={() => setIsOrderTrackingOpen(true)}
      />

      {/* Hero Section */}
      <HeroSection
        onShopNow={() => {
          setActiveCategory('All');
          const el = document.getElementById('catalog-section');
          if (el) el.scrollIntoView({ behavior: 'smooth' });
        }}
        onExploreSkeleton={() => {
          setActiveCategory('Skeleton Automatic');
          const el = document.getElementById('catalog-section');
          if (el) el.scrollIntoView({ behavior: 'smooth' });
        }}
      />

      {/* Curated Collections Grid */}
      <CollectionGrid onSelectCategory={setActiveCategory} />

      {/* Main Catalog Showcase Section */}
      <section id="catalog-section" style={{ padding: '5rem 0', background: '#0b0c10' }}>
        <div className="luxury-container">
          {/* Section Header */}
          <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
            <span style={{
              fontSize: '0.72rem',
              letterSpacing: '0.25em',
              color: '#d4af37',
              textTransform: 'uppercase',
              fontWeight: 600,
              display: 'block',
              marginBottom: '0.5rem'
            }}>
              HAUTE HORLOGERIE PORTFOLIO
            </span>
            <h2 style={{
              fontSize: 'clamp(2rem, 4vw, 2.8rem)',
              color: '#f8fafc',
              fontFamily: 'var(--font-brand)'
            }}>
              THE MASTERPIECE CATALOG
            </h2>
            <div style={{
              width: '60px',
              height: '2px',
              background: 'var(--gold-gradient)',
              margin: '1rem auto 0'
            }} />
          </div>

          {/* Category Tabs & Sorter Bar */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '1rem',
            marginBottom: '2.5rem',
            borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
            paddingBottom: '1rem'
          }}>
            {/* Category Filter Pills */}
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {categories.map(cat => {
                const isSelected = activeCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    onClick={() => setActiveCategory(cat.id)}
                    style={{
                      background: isSelected ? 'rgba(212, 175, 55, 0.15)' : '#12141a',
                      border: isSelected ? '1px solid #d4af37' : '1px solid rgba(255, 255, 255, 0.08)',
                      color: isSelected ? '#f3e5ab' : '#cbd5e1',
                      padding: '8px 16px',
                      borderRadius: '3px',
                      fontSize: '0.78rem',
                      fontWeight: isSelected ? 600 : 400,
                      letterSpacing: '0.08em',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    {cat.label}
                  </button>
                );
              })}
            </div>

            {/* Sorter Selector */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <SlidersHorizontal size={14} color="#d4af37" />
              <span style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase' }}>Sort:</span>
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
            <div style={{ textAlign: 'center', padding: '4rem 1rem', color: '#94a3b8' }}>
              <p>No timepieces found in this category allocation.</p>
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
        onOpenTracking={() => setIsOrderTrackingOpen(true)}
      />
    </>
  );
};

const MainAppContent = () => {
  const { isAdminAuthenticated } = useAdminAuth();
  const [isAdminView, setIsAdminView] = useState(false);
  const [showAdminLoginModal, setShowAdminLoginModal] = useState(false);
  const [activeCategory, setActiveCategory] = useState('All');

  const handleOpenAdmin = () => {
    if (isAdminAuthenticated) {
      setIsAdminView(true);
    } else {
      setShowAdminLoginModal(true);
    }
  };

  const handleOpenBrandStory = () => {
    const el = document.getElementById('heritage-section');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div>
      {/* If Admin is Authenticated and in Admin View Mode */}
      {isAdminAuthenticated && isAdminView ? (
        <AdminDashboard onBackToStore={() => setIsAdminView(false)} />
      ) : (
        <Storefront
          onOpenAdmin={handleOpenAdmin}
          onOpenBrandStory={handleOpenBrandStory}
          activeCategory={activeCategory}
          setActiveCategory={setActiveCategory}
        />
      )}

      {/* Admin Login Modal (When clicked while unauthenticated) */}
      {showAdminLoginModal && !isAdminAuthenticated && (
        <AdminLogin
          onClose={() => setShowAdminLoginModal(false)}
        />
      )}

      {/* Global Modals & Drawers */}
      <ProductQuickView />
      <CartDrawer />
      <WishlistDrawer />
      <SearchModal />
      <CheckoutModal />
      <OrderConfirmationModal
        onOpenTracking={() => {}}
      />
      <OrderTrackingModal />
    </div>
  );
};

export function App() {
  return (
    <StoreProvider>
      <AdminAuthProvider>
        <MainAppContent />
      </AdminAuthProvider>
    </StoreProvider>
  );
}

export default App;

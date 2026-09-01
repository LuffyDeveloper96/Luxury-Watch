import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  productsAPI, brandsAPI, categoriesAPI, ordersAPI,
  reviewsAPI, couponsAPI, analyticsAPI, homepageAPI, settingsAPI
} from '../services/api';
import {
  INITIAL_BRANDS,
  INITIAL_PRODUCTS,
  INITIAL_REVIEWS,
  INITIAL_ORDERS,
  INITIAL_COUPONS
} from '../data/initialProducts';
import { formatCurrency } from '../utils/currency';

const StoreContext = createContext();

export const StoreProvider = ({ children }) => {
  // Products Catalog (initialized with built-in catalog, updated when backend responds)
  const [products, setProducts] = useState(INITIAL_PRODUCTS);
  // Brands
  const [brands, setBrands] = useState(INITIAL_BRANDS);
  // Categories
  const [categories, setCategories] = useState([]);
  // Orders
  const [orders, setOrders] = useState(INITIAL_ORDERS);
  // Reviews
  const [reviews, setReviews] = useState(INITIAL_REVIEWS);
  // Coupons
  const [coupons, setCoupons] = useState(INITIAL_COUPONS);

  // Cart state
  const [cart, setCart] = useState(() => {
    try {
      const saved = localStorage.getItem('luxury_cart') || localStorage.getItem('akiki_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Wishlist state
  const [wishlist, setWishlist] = useState(() => {
    try {
      const saved = localStorage.getItem('luxury_wishlist') || localStorage.getItem('akiki_wishlist');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Currency (Locked to INR)
  const [currency, setCurrency] = useState('INR');

  // Applied coupon
  const [appliedCoupon, setAppliedCoupon] = useState(null);

  // Live Activity Log
  const [activityLog, setActivityLog] = useState([
    { id: 'act-1', text: 'Collector in Mumbai viewed Rolex Submariner Date 41mm', time: 'Just now', type: 'view' },
    { id: 'act-2', text: 'New consignment ORD-LW-98421 placed for ₹5,499', time: '12m ago', type: 'order' },
    { id: 'act-3', text: '5-star review posted by Vikramaditya S. (Mumbai)', time: '45m ago', type: 'review' }
  ]);

  // Store Settings & Homepage CMS
  const [storeSettings, setStoreSettings] = useState({
    storeName: 'LUXURY WATCH',
    tagline: 'TIMELESS WATCHES. EXCEPTIONAL VALUE.',
    supportPhone: '+91 22 6940 8800',
    supportEmail: 'concierge@luxurywatch.com',
    announcement: 'FREE SHIPPING ABOVE ₹999 | SECURE PAYMENTS | EASY RETURNS',
    freeShippingThreshold: 999,
    standardShippingFee: 0,
    expressShippingFee: 499,
    warrantyYears: 5
  });

  const [homepageContent, setHomepageContent] = useState(null);

  // Modals & Navigation state
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isWishlistOpen, setIsWishlistOpen] = useState(false);
  const [quickViewProduct, setQuickViewProduct] = useState(null);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [checkoutItems, setCheckoutItems] = useState([]);
  const [isOrderTrackingOpen, setIsOrderTrackingOpen] = useState(false);
  const [selectedProductDetails, setSelectedProductDetails] = useState(null);
  const [activeCategory, setActiveCategory] = useState('All');
  const [activeBrand, setActiveBrand] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [toasts, setToasts] = useState([]);
  const [isBackendConnected, setIsBackendConnected] = useState(false);

  // Toast notification helper
  const addToast = useCallback((message, type = 'success') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  }, []);

  // Sync data with Backend API
  const refreshStoreData = useCallback(async () => {
    try {
      const results = await Promise.allSettled([
        productsAPI.getAll(),
        brandsAPI.getAll(),
        categoriesAPI.getAll(),
        reviewsAPI.getAll(),
        couponsAPI.getAll(),
        analyticsAPI.getActivity(),
        homepageAPI.getContent(),
        settingsAPI.getStoreSettings()
      ]);

      const [prodRes, brandRes, catRes, revRes, cpnRes, actRes, hpRes, setRes] = results;

      if (prodRes.status === 'fulfilled' && Array.isArray(prodRes.value?.products) && prodRes.value.products.length > 0) {
        setProducts(prodRes.value.products);
        setIsBackendConnected(true);
      }
      if (brandRes.status === 'fulfilled' && Array.isArray(brandRes.value?.brands) && brandRes.value.brands.length > 0) {
        setBrands(brandRes.value.brands);
      }
      if (catRes.status === 'fulfilled' && catRes.value?.categories) {
        setCategories(catRes.value.categories);
      }
      if (revRes.status === 'fulfilled' && revRes.value?.reviews) {
        setReviews(revRes.value.reviews);
      }
      if (cpnRes.status === 'fulfilled' && cpnRes.value?.coupons) {
        setCoupons(cpnRes.value.coupons);
      }
      if (actRes.status === 'fulfilled' && actRes.value?.activities) {
        setActivityLog(actRes.value.activities);
      }
      if (hpRes.status === 'fulfilled' && hpRes.value?.content) {
        setHomepageContent(hpRes.value.content);
        if (hpRes.value.content.announcementBar?.text) {
          setStoreSettings(prev => ({
            ...prev,
            announcement: hpRes.value.content.announcementBar.text
          }));
        }
      }
      if (setRes.status === 'fulfilled' && setRes.value?.settings) {
        setStoreSettings(prev => ({ ...prev, ...setRes.value.settings }));
      }
    } catch (err) {
      console.warn('[StoreContext] Backend sync note:', err.message);
    }
  }, []);

  useEffect(() => {
    refreshStoreData();
  }, [refreshStoreData]);

  // Persist Cart
  useEffect(() => {
    localStorage.setItem('luxury_cart', JSON.stringify(cart));
  }, [cart]);

  // Persist Wishlist
  useEffect(() => {
    localStorage.setItem('luxury_wishlist', JSON.stringify(wishlist));
  }, [wishlist]);

  // Cart operations
  const addToCart = (product, quantity = 1, options = {}) => {
    if (!product) return;
    if (product.stock <= 0) {
      addToast(`"${product.name}" is currently out of vault stock.`, 'error');
      return;
    }

    setCart(prev => {
      const existingIdx = prev.findIndex(item => item.product.id === product.id);
      if (existingIdx !== -1) {
        const updated = [...prev];
        const newQty = updated[existingIdx].quantity + quantity;
        if (newQty > product.stock) {
          addToast(`Maximum available vault stock (${product.stock}) reached.`, 'warning');
          updated[existingIdx].quantity = product.stock;
        } else {
          updated[existingIdx].quantity = newQty;
        }
        return updated;
      }
      return [...prev, {
        product,
        quantity: Math.min(quantity, product.stock),
        selectedColor: options.selectedColor || product.colors?.[0]?.name,
        selectedStrap: options.selectedStrap || product.straps?.[0]?.name
      }];
    });

    // Automatically open the cart drawer so the patron is taken directly to the cart
    setIsCartOpen(true);
  };

  const updateCartQuantity = (productId, delta) => {
    setCart(prev => {
      return prev.map(item => {
        if (item.product.id === productId) {
          const newQty = item.quantity + delta;
          if (newQty <= 0) return null;
          if (newQty > item.product.stock) {
            addToast(`Only ${item.product.stock} items remaining in stock.`, 'warning');
            return item;
          }
          return { ...item, quantity: newQty };
        }
        return item;
      }).filter(Boolean);
    });
  };

  const removeFromCart = (productId) => {
    setCart(prev => prev.filter(item => item.product.id !== productId));
  };

  const clearCart = () => {
    setCart([]);
    setAppliedCoupon(null);
  };

  // Wishlist operations
  const toggleWishlist = (product) => {
    if (!product) return;
    setWishlist(prev => {
      const exists = prev.some(p => p.id === product.id);
      if (exists) {
        addToast(`Removed "${product.name}" from Wishlist.`);
        return prev.filter(p => p.id !== product.id);
      }
      addToast(`Added "${product.name}" to Private Wishlist.`);
      return [...prev, product];
    });
  };

  const isInWishlist = (productId) => {
    return wishlist.some(p => p.id === productId);
  };

  const moveWishlistToCart = (product) => {
    addToCart(product, 1);
    toggleWishlist(product);
  };

  // Calculations
  const cartSubtotal = cart.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
  const discountAmount = appliedCoupon ? (cartSubtotal * (appliedCoupon.discountPercent || 0)) / 100 : 0;
  const shippingFee = cartSubtotal >= (storeSettings.freeShippingThreshold || 999) ? 0 : (storeSettings.standardShippingFee || 0);
  const cartTotal = Math.max(0, cartSubtotal - discountAmount + shippingFee);

  // Apply Coupon
  const applyCoupon = async (code) => {
    try {
      const res = await couponsAPI.validate(code, cartSubtotal, cart);
      if (res.success && res.coupon) {
        setAppliedCoupon(res.coupon);
        addToast(`Promotion "${res.coupon.code}" applied: ${res.coupon.discountPercent}% OFF`);
        return { success: true, coupon: res.coupon };
      }
      return { success: false, message: res.message };
    } catch (err) {
      addToast(err.message || 'Invalid promotion code.', 'error');
      return { success: false, message: err.message };
    }
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    addToast('Promotion removed.');
  };

  // Direct Buy Now trigger: adds timepiece to cart and opens cart drawer then payment
  const buyNow = (product, quantity = 1, options = {}) => {
    if (!product) return;
    addToCart(product, quantity, options);
    setIsCartOpen(true);
  };

  const openCartCheckout = () => {
    if (!cart || cart.length === 0) {
      addToast('Your bag is empty. Please select a timepiece first.', 'info');
      return;
    }
    setCheckoutItems([...cart]);
    setIsCartOpen(false);
    setIsCheckoutOpen(true);
  };

  const openQuickView = (product) => {
    setQuickViewProduct(product);
  };

  const closeQuickView = () => {
    setQuickViewProduct(null);
  };

  const formatPrice = (amount) => {
    return formatCurrency(amount, currency);
  };

  return (
    <StoreContext.Provider
      value={{
        products,
        setProducts,
        brands,
        setBrands,
        categories,
        setCategories,
        orders,
        setOrders,
        reviews,
        setReviews,
        coupons,
        setCoupons,
        cart,
        wishlist,
        currency,
        setCurrency,
        cartSubtotal,
        cartTotal,
        discountAmount,
        shippingFee,
        freeShippingThreshold: storeSettings?.freeShippingThreshold || 999,
        appliedCoupon,
        applyCoupon,
        removeCoupon,
        addToCart,
        updateCartQuantity,
        removeFromCart,
        clearCart,
        toggleWishlist,
        isInWishlist,
        moveWishlistToCart,
        buyNow,
        triggerBuyNow: buyNow,
        openCartCheckout,
        triggerCartCheckout: openCartCheckout,
        openQuickView,
        closeQuickView,
        checkoutItems,
        setCheckoutItems,
        isCartOpen,
        setIsCartOpen,
        isWishlistOpen,
        setIsWishlistOpen,
        quickViewProduct,
        setQuickViewProduct,
        isCheckoutOpen,
        setIsCheckoutOpen,
        isOrderTrackingOpen,
        setIsOrderTrackingOpen,
        selectedProductDetails,
        setSelectedProductDetails,
        activeCategory,
        setActiveCategory,
        activeBrand,
        setActiveBrand,
        searchQuery,
        setSearchQuery,
        storeSettings,
        setStoreSettings,
        homepageContent,
        setHomepageContent,
        activityLog,
        toasts,
        addToast,
        formatPrice,
        refreshStoreData,
        isBackendConnected
      }}
    >
      {children}

      {/* Floating Toast Notifications */}
      <div style={{
        position: 'fixed',
        bottom: '24px',
        right: '24px',
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
        pointerEvents: 'none'
      }}>
        {toasts.map(toast => (
          <div
            key={toast.id}
            style={{
              background: toast.type === 'error' ? '#881337' : toast.type === 'warning' ? '#78350f' : '#0f172a',
              border: toast.type === 'error' ? '1px solid #f43f5e' : toast.type === 'warning' ? '1px solid #f59e0b' : '1px solid #d4af37',
              color: '#ffffff',
              padding: '12px 18px',
              borderRadius: '4px',
              fontSize: '0.82rem',
              boxShadow: '0 10px 25px rgba(0, 0, 0, 0.3)',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              animation: 'fadeInUp 0.3s ease-out',
              maxWidth: '360px',
              pointerEvents: 'auto'
            }}
          >
            <span>{toast.message}</span>
          </div>
        ))}
      </div>
    </StoreContext.Provider>
  );
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
};

export default StoreContext;

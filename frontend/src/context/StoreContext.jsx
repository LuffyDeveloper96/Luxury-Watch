import React, { createContext, useContext, useState, useEffect } from 'react';
import { INITIAL_PRODUCTS, INITIAL_ORDERS, INITIAL_REVIEWS, INITIAL_COUPONS } from '../data/initialProducts';
import { productsAPI, ordersAPI, reviewsAPI, couponsAPI, analyticsAPI } from '../services/api';
import { formatCurrency } from '../utils/currency';

const StoreContext = createContext();

export const StoreProvider = ({ children }) => {
  // Products Catalog
  const [products, setProducts] = useState(() => {
    const saved = localStorage.getItem('akiki_products');
    return saved ? JSON.parse(saved) : INITIAL_PRODUCTS;
  });

  // Orders
  const [orders, setOrders] = useState(() => {
    const saved = localStorage.getItem('akiki_orders');
    return saved ? JSON.parse(saved) : INITIAL_ORDERS;
  });

  // Reviews
  const [reviews, setReviews] = useState(() => {
    const saved = localStorage.getItem('akiki_reviews');
    return saved ? JSON.parse(saved) : INITIAL_REVIEWS;
  });

  // Coupons
  const [coupons, setCoupons] = useState(() => {
    const saved = localStorage.getItem('akiki_coupons');
    return saved ? JSON.parse(saved) : INITIAL_COUPONS;
  });

  // Cart state
  const [cart, setCart] = useState(() => {
    const saved = localStorage.getItem('akiki_cart');
    return saved ? JSON.parse(saved) : [];
  });

  // Wishlist state
  const [wishlist, setWishlist] = useState(() => {
    const saved = localStorage.getItem('akiki_wishlist');
    return saved ? JSON.parse(saved) : [];
  });

  // Currency (Locked to INR Only)
  const [currency, setCurrency] = useState('INR');

  // Applied coupon
  const [appliedCoupon, setAppliedCoupon] = useState(null);

  // Live Activity Log
  const [activityLog, setActivityLog] = useState([
    { id: 'act-1', text: 'Collector in Mayfair, London viewed Royal Chronograph Master', time: 'Just now', type: 'view' },
    { id: 'act-2', text: 'New order ORD-AK-98421 placed for ₹4,95,000', time: '12m ago', type: 'order' },
    { id: 'act-3', text: '5-star review posted by Dr. Alistair Sterling (Zurich)', time: '45m ago', type: 'review' }
  ]);

  // Store Settings
  const [storeSettings, setStoreSettings] = useState({
    supportPhone: '+44 (0) 20 7946 0192',
    supportEmail: 'concierge@luxurywatch.com',
    announcement: 'COMPLIMENTARY BESPOKE ENGRAVING & INSURED WORLDWIDE EXPRESS SHIPPING',
    freeShippingThreshold: 250000,
    warrantyYears: 5
  });

  // Modals & Navigation state
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [quickViewProduct, setQuickViewProduct] = useState(null);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [checkoutItems, setCheckoutItems] = useState([]);
  const [isOrderTrackingOpen, setIsOrderTrackingOpen] = useState(false);
  const [selectedProductDetails, setSelectedProductDetails] = useState(null);
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [toasts, setToasts] = useState([]);
  const [isBackendConnected, setIsBackendConnected] = useState(false);

  // Sync with Backend API on mount
  useEffect(() => {
    const syncBackendData = async () => {
      try {
        const token = localStorage.getItem('akiki_admin_token') || localStorage.getItem('luxury_admin_token');
        const fetchTasks = [
          productsAPI.getAll(),
          reviewsAPI.getAll(),
          couponsAPI.getAll(),
          analyticsAPI.getActivity()
        ];
        
        if (token) {
          fetchTasks.push(ordersAPI.getAll());
        }

        const results = await Promise.allSettled(fetchTasks);
        const [prodRes, revRes, cpnRes, actRes, ordRes] = results;

        if (prodRes?.status === 'fulfilled' && prodRes.value?.products) {
          setProducts(prodRes.value.products);
          setIsBackendConnected(true);
        }
        if (revRes?.status === 'fulfilled' && revRes.value?.reviews) {
          setReviews(revRes.value.reviews);
        }
        if (cpnRes?.status === 'fulfilled' && cpnRes.value?.coupons) {
          setCoupons(cpnRes.value.coupons);
        }
        if (actRes?.status === 'fulfilled' && actRes.value?.activityLog) {
          setActivityLog(actRes.value.activityLog);
        }
        if (ordRes?.status === 'fulfilled' && ordRes.value?.orders) {
          setOrders(ordRes.value.orders);
        }
      } catch (err) {
        console.warn('Backend sync failed, using offline storage:', err.message);
      }
    };

    syncBackendData();
  }, []);

  // Persist items locally as cache
  useEffect(() => {
    localStorage.setItem('akiki_products', JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem('akiki_orders', JSON.stringify(orders));
  }, [orders]);

  useEffect(() => {
    localStorage.setItem('akiki_reviews', JSON.stringify(reviews));
  }, [reviews]);

  useEffect(() => {
    localStorage.setItem('akiki_coupons', JSON.stringify(coupons));
  }, [coupons]);

  useEffect(() => {
    localStorage.setItem('akiki_cart', JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    localStorage.setItem('akiki_wishlist', JSON.stringify(wishlist));
  }, [wishlist]);

  useEffect(() => {
    localStorage.setItem('akiki_currency', currency);
  }, [currency]);

  // Log activity helper
  const logActivity = (text, type = 'general') => {
    const newEntry = {
      id: `act-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      text,
      time: 'Just now',
      type
    };
    setActivityLog(prev => [newEntry, ...prev.slice(0, 19)]);

    // Call backend
    analyticsAPI.logActivity(text, type).catch(() => {});
  };

  // Toast Helper
  const showToast = (message, type = 'gold') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  };

  // Cart operations
  const addToCart = (product, quantity = 1, options = {}) => {
    const color = options.color || (product.colors && product.colors[0]?.name) || 'Default Edition';
    const strap = options.strap || (product.straps && product.straps[0]?.name) || 'Default Strap';
    const engraving = options.engraving || '';
    const cartItemId = `${product.id}-${color}-${strap}-${engraving}`;

    setCart(prev => {
      const existing = prev.find(item => item.cartItemId === cartItemId);
      if (existing) {
        return prev.map(item =>
          item.cartItemId === cartItemId
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      } else {
        return [
          ...prev,
          {
            cartItemId,
            product,
            quantity,
            selectedColor: color,
            selectedStrap: strap,
            engraving,
            addedAt: new Date().toISOString()
          }
        ];
      }
    });

    logActivity(`A client added "${product.name}" to bespoke shopping bag`, 'cart');
    showToast(`Added "${product.name}" to your shopping bag`, 'gold');
    setIsCartOpen(true);
  };

  const updateCartQuantity = (cartItemId, delta) => {
    setCart(prev => {
      return prev
        .map(item => {
          if (item.cartItemId === cartItemId) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean);
    });
  };

  const removeFromCart = (cartItemId) => {
    setCart(prev => prev.filter(item => item.cartItemId !== cartItemId));
    showToast("Item removed from bag", "dark");
  };

  const clearCart = () => {
    setCart([]);
  };

  // Instant Buy Now Trigger
  const triggerBuyNow = (product, quantity = 1, options = {}) => {
    const color = options.color || (product.colors && product.colors[0]?.name) || 'Default Edition';
    const strap = options.strap || (product.straps && product.straps[0]?.name) || 'Default Strap';
    const engraving = options.engraving || '';
    const singleCheckoutItem = {
      cartItemId: `buy-now-${product.id}`,
      product,
      quantity,
      selectedColor: color,
      selectedStrap: strap,
      engraving
    };
    setCheckoutItems([singleCheckoutItem]);
    setIsCheckoutOpen(true);
    logActivity(`Initiated instant VIP checkout for "${product.name}"`, 'checkout');
  };

  const triggerCartCheckout = () => {
    if (cart.length === 0) {
      showToast("Your shopping bag is empty", "crimson");
      return;
    }
    setCheckoutItems([...cart]);
    setIsCartOpen(false);
    setIsCheckoutOpen(true);
    logActivity(`Collector entered checkout with ${cart.length} luxury timepiece(s)`, 'checkout');
  };

  // Wishlist operations
  const toggleWishlist = (productId) => {
    const product = products.find(p => p.id === productId);
    const prodName = product ? product.name : 'Timepiece';
    setWishlist(prev => {
      const exists = prev.includes(productId);
      if (exists) {
        showToast(`Removed "${prodName}" from Vault Wishlist`, 'dark');
        return prev.filter(id => id !== productId);
      } else {
        showToast(`Added "${prodName}" to Vault Wishlist`, 'gold');
        logActivity(`Vault Wishlist added: "${prodName}"`, 'wishlist');
        return [...prev, productId];
      }
    });
  };

  const isInWishlist = (productId) => wishlist.includes(productId);

  // Cart calculations
  const cartSubtotal = (checkoutItems.length > 0 && isCheckoutOpen ? checkoutItems : cart).reduce(
    (acc, item) => acc + item.product.price * item.quantity,
    0
  );

  const discountPercent = appliedCoupon ? appliedCoupon.discountPercent : 0;
  const discountAmount = appliedCoupon ? (cartSubtotal * discountPercent) / 100 : 0;
  const freeShippingThreshold = 250000;
  const standardShippingCost = cartSubtotal >= freeShippingThreshold || cartSubtotal === 0 ? 0 : 2500;
  const cartTotal = Math.max(0, cartSubtotal - discountAmount + standardShippingCost);

  // Coupon validation
  const applyCoupon = async (code) => {
    try {
      const res = await couponsAPI.validate(code, cartSubtotal);
      if (res.success && res.coupon) {
        setAppliedCoupon(res.coupon);
        showToast(`Code "${res.coupon.code}" applied: ${res.coupon.discountPercent}% discount`, "gold");
        logActivity(`Promotion code ${res.coupon.code} applied successfully`, 'coupon');
        return true;
      }
    } catch (err) {
      // Fallback local search
      const found = coupons.find(c => c.code.toUpperCase() === code.trim().toUpperCase());
      if (!found) {
        showToast("Invalid promotion code", "crimson");
        return false;
      }
      if (cartSubtotal < found.minSpend) {
        showToast(`Minimum order of ${formatCurrency(found.minSpend, currency)} required for ${found.code}`, "crimson");
        return false;
      }
      setAppliedCoupon(found);
      showToast(`Code "${found.code}" applied: ${found.discountPercent}% discount`, "gold");
      return true;
    }
    return false;
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    showToast("Promotion code removed", "dark");
  };

  // Order Placement
  const placeOrder = async (orderData) => {
    const newOrder = {
      ...orderData,
      id: orderData.id || `ORD-AK-${Math.floor(10000 + Math.random() * 90000)}`,
      date: new Date().toISOString(),
      orderStatus: 'Confirmed',
      paymentStatus: 'Paid',
      trackingNumber: `AK-EXP-${Math.floor(10000000 + Math.random() * 90000000)}`
    };

    // Save locally
    setOrders(prev => [newOrder, ...prev]);

    // Deduct stock locally
    newOrder.items.forEach(item => {
      updateStock(item.product ? item.product.id : item.id, -item.quantity);
    });

    if (checkoutItems.length === cart.length) {
      clearCart();
    }

    logActivity(`🎉 New Order #${newOrder.id} confirmed for ${formatCurrency(newOrder.total, 'INR')} by ${newOrder.customer.fullName}`, 'order');

    // Call Backend API
    try {
      const res = await ordersAPI.create(newOrder);
      if (res.success && res.order) {
        // update with authoritative server order
        setOrders(prev => prev.map(o => o.id === newOrder.id ? res.order : o));
      }
    } catch (err) {
      console.warn('Backend order sync error:', err.message);
    }

    return newOrder;
  };

  // Stock update
  const updateStock = async (productId, delta) => {
    setProducts(prev =>
      prev.map(p => {
        if (p.id === productId) {
          const newStock = Math.max(0, p.stock + delta);
          return { ...p, stock: newStock };
        }
        return p;
      })
    );

    try {
      await productsAPI.updateStock(productId, { delta });
    } catch (err) {
      console.warn('Backend stock sync error:', err.message);
    }
  };

  // Product CRUD
  const addProduct = async (newProd) => {
    const id = newProd.id || `ak-${newProd.category.toLowerCase().slice(0, 4)}-${Date.now().toString().slice(-4)}`;
    const productToAdd = {
      ...newProd,
      id,
      rating: 5.0,
      reviewsCount: 0,
      sku: newProd.sku || `AK-${Math.floor(100 + Math.random() * 900)}`
    };

    setProducts(prev => [productToAdd, ...prev]);
    showToast(`Masterpiece "${productToAdd.name}" added to catalog`, 'gold');

    try {
      const res = await productsAPI.create(productToAdd);
      if (res.success && res.product) {
        setProducts(prev => prev.map(p => p.id === productToAdd.id ? res.product : p));
      }
    } catch (err) {
      console.warn('Backend product creation error:', err.message);
    }

    return productToAdd;
  };

  const updateProduct = async (productId, updatedFields) => {
    setProducts(prev =>
      prev.map(p => (p.id === productId ? { ...p, ...updatedFields } : p))
    );
    showToast("Product updated successfully", "gold");

    try {
      await productsAPI.update(productId, updatedFields);
    } catch (err) {
      console.warn('Backend product update error:', err.message);
    }
  };

  const deleteProduct = async (productId) => {
    setProducts(prev => prev.filter(p => p.id !== productId));
    showToast("Product removed from catalog", "dark");

    try {
      await productsAPI.delete(productId);
    } catch (err) {
      console.warn('Backend product delete error:', err.message);
    }
  };

  // Order Management
  const updateOrderStatus = async (orderId, newStatus) => {
    setOrders(prev =>
      prev.map(o => (o.id === orderId ? { ...o, orderStatus: newStatus } : o))
    );
    showToast(`Order #${orderId} updated to ${newStatus}`, 'gold');

    try {
      await ordersAPI.updateStatus(orderId, newStatus);
    } catch (err) {
      console.warn('Backend order status update error:', err.message);
    }
  };

  // Reviews Management
  const addReview = async (reviewData) => {
    const newRev = {
      ...reviewData,
      id: `rev-${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      verified: true
    };

    setReviews(prev => [newRev, ...prev]);
    showToast("Thank you for sharing your experience. Your review is now live!", "gold");

    try {
      await reviewsAPI.create(newRev);
    } catch (err) {
      console.warn('Backend review create error:', err.message);
    }
  };

  // Quick View helper
  const openQuickView = (product) => {
    setQuickViewProduct(product);
    logActivity(`Quick inspection opened for "${product.name}"`, 'view');
  };

  const closeQuickView = () => {
    setQuickViewProduct(null);
  };

  return (
    <StoreContext.Provider
      value={{
        products,
        orders,
        reviews,
        coupons,
        cart,
        wishlist,
        currency,
        setCurrency,
        appliedCoupon,
        activityLog,
        isBackendConnected,
        isCartOpen,
        setIsCartOpen,
        quickViewProduct,
        openQuickView,
        closeQuickView,
        isCheckoutOpen,
        setIsCheckoutOpen,
        checkoutItems,
        setCheckoutItems,
        triggerBuyNow,
        triggerCartCheckout,
        isOrderTrackingOpen,
        setIsOrderTrackingOpen,
        selectedProductDetails,
        setSelectedProductDetails,
        activeCategory,
        setActiveCategory,
        searchQuery,
        setSearchQuery,
        toasts,
        showToast,
        addToCart,
        updateCartQuantity,
        removeFromCart,
        clearCart,
        toggleWishlist,
        isInWishlist,
        cartSubtotal,
        discountPercent,
        discountAmount,
        standardShippingCost,
        freeShippingThreshold,
        cartTotal,
        applyCoupon,
        removeCoupon,
        placeOrder,
        updateStock,
        addProduct,
        updateProduct,
        deleteProduct,
        updateOrderStatus,
        addReview,
        logActivity,
        storeSettings,
        setStoreSettings,
        formatPrice: (amount) => formatCurrency(amount, currency)
      }}
    >
      {children}
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

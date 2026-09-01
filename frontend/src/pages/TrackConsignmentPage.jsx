import React, { useState, useEffect } from 'react';
import { useStore } from '../context/StoreContext';
import { useUserAuth } from '../context/UserAuthContext';
import { ordersAPI, getImageUrl } from '../services/api';
import { formatCurrency } from '../utils/currency';
import {
  Search, Package, CheckCircle2, Clock, Truck, ShieldCheck,
  AlertCircle, Sparkles, MapPin, ExternalLink, RotateCcw, ArrowLeft, Watch,
  ChevronDown, ChevronUp, ShoppingBag, UserCheck, Calendar, CreditCard
} from 'lucide-react';

export const TrackConsignmentPage = ({ onBack, onOpenReturnForOrder }) => {
  const { orders, currency } = useStore();
  const { user, isAuthenticated, openAuthModal } = useUserAuth();

  const [activeTab, setActiveTab] = useState('orders'); // 'orders' | 'search'
  const [userOrders, setUserOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [expandedOrderId, setExpandedOrderId] = useState(null);

  // Manual Search State
  const [searchQuery, setSearchQuery] = useState('');
  const [searchedOrder, setSearchedOrder] = useState(null);
  const [searchLoading, setSearchLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Automatically scroll to top on mount
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Fetch live orders for authenticated user & merge with local storage orders
  useEffect(() => {
    const loadPurchasedOrders = async () => {
      setLoadingOrders(true);
      let combined = [];

      // 1. Read from localStorage for immediate access
      try {
        const local = JSON.parse(localStorage.getItem('luxury_user_orders') || '[]');
        if (Array.isArray(local)) {
          combined = [...local];
        }
      } catch (e) {
        console.warn('Error reading local orders:', e);
      }

      // 2. If authenticated, fetch directly from backend API
      if (isAuthenticated) {
        try {
          const res = await ordersAPI.getUserOrders();
          if (res?.success && Array.isArray(res.orders)) {
            const fetchedOrders = res.orders;
            // Merge without duplicates
            const fetchedIds = new Set(fetchedOrders.map(o => o.id));
            combined = [...fetchedOrders, ...combined.filter(o => !fetchedIds.has(o.id))];
          }
        } catch (apiErr) {
          console.warn('Failed to load user orders from API:', apiErr.message);
        }
      }

      // Sort by newest first
      combined.sort((a, b) => new Date(b.createdAt || Date.now()) - new Date(a.createdAt || Date.now()));
      setUserOrders(combined);
      setLoadingOrders(false);

      // Default active tab: if user has orders, show 'orders', else show 'search'
      if (combined.length === 0 && !isAuthenticated) {
        setActiveTab('search');
      } else {
        setActiveTab('orders');
        if (combined.length > 0) {
          setExpandedOrderId(combined[0].id);
        }
      }
    };

    loadPurchasedOrders();
  }, [isAuthenticated]);

  const handleSearch = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSearchedOrder(null);
    const clean = searchQuery.trim();
    if (!clean) return;

    setSearchLoading(true);

    // 1. Check local orders first
    const foundLocal = userOrders.find(
      o => o.id?.toUpperCase() === clean.toUpperCase() ||
           o.orderNumber?.toUpperCase() === clean.toUpperCase() ||
           o.customer?.email?.toLowerCase() === clean.toLowerCase()
    );

    if (foundLocal) {
      setSearchedOrder(foundLocal);
      setSearchLoading(false);
      return;
    }

    // 2. Fetch live from backend
    try {
      const res = await ordersAPI.getById(clean);
      if (res?.success && res.order) {
        setSearchedOrder(res.order);
      } else {
        setErrorMessage(`No consignment record found for "${clean}". Please verify your Order ID or registered email.`);
      }
    } catch (err) {
      setErrorMessage(err.message || `No record found for "${clean}".`);
    } finally {
      setSearchLoading(false);
    }
  };

  const getStageIndex = (status) => {
    switch (status) {
      case 'Confirmed': return 1;
      case 'In Assembly': return 2;
      case 'Dispatched': return 3;
      case 'Delivered': return 4;
      default: return 1;
    }
  };

  const stages = [
    { title: "Order Confirmed", desc: "Security validated & allocation finalized" },
    { title: "Atelier Assembly", desc: "Precision regulation & caseback inspection" },
    { title: "Armoured Dispatch", desc: "Sealed & handed to express diplomatic courier" },
    { title: "White-Glove Delivery", desc: "Insured recipient hand-off" }
  ];

  return (
    <div style={{ backgroundColor: '#fbfbf9', minHeight: '100vh', padding: '6rem 1rem 4rem 1rem' }}>
      <div style={{ maxWidth: '900px', margin: '0 auto' }}>
        
        {/* Navigation & Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <button
            onClick={onBack}
            className="btn-outline-gold"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}
          >
            <ArrowLeft size={16} /> Return to Store
          </button>

          {isAuthenticated ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem', color: '#8a6709', fontWeight: 600 }}>
              <UserCheck size={16} />
              <span>Patron: {user?.name || user?.email}</span>
            </div>
          ) : (
            <button
              onClick={() => openAuthModal('signin')}
              className="btn-dark"
              style={{ fontSize: '0.75rem', padding: '6px 14px' }}
            >
              Sign In to View All Orders
            </button>
          )}
        </div>

        <div style={{ 
          backgroundColor: '#ffffff',
          borderRadius: '10px',
          border: '1px solid rgba(180, 140, 30, 0.25)',
          padding: 'clamp(1.5rem, 4vw, 3rem)',
          boxShadow: '0 20px 50px rgba(15, 23, 42, 0.06)'
        }}>
          {/* Header Banner */}
          <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', color: '#8a6709', marginBottom: '0.5rem' }}>
              <Package size={24} />
              <span style={{ fontSize: '0.82rem', letterSpacing: '0.2em', textTransform: 'uppercase', fontWeight: 700 }}>
                HAUTE HORLOGERIE CONCIERGE
              </span>
            </div>
            <h1 style={{ fontSize: 'clamp(1.7rem, 4vw, 2.4rem)', color: '#0f172a', fontFamily: 'var(--font-brand)', margin: '0' }}>
              Purchased Consignments & Tracking
            </h1>
            <p style={{ color: '#64748b', marginTop: '0.6rem', fontSize: '0.92rem' }}>
              View all your acquisition receipts, allocated movements, and live armoured dispatch milestones.
            </p>

            {/* Navigation Tabs */}
            <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginTop: '1.8rem' }}>
              <button
                onClick={() => setActiveTab('orders')}
                style={{
                  padding: '9px 20px',
                  borderRadius: '30px',
                  fontSize: '0.82rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  border: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  backgroundColor: activeTab === 'orders' ? '#0f172a' : '#f1f5f9',
                  color: activeTab === 'orders' ? '#f3e5ab' : '#64748b',
                  boxShadow: activeTab === 'orders' ? '0 4px 12px rgba(15, 23, 42, 0.2)' : 'none'
                }}
              >
                <Package size={15} color={activeTab === 'orders' ? '#d4af37' : '#94a3b8'} />
                <span>My Orders</span>
                {userOrders.length > 0 && (
                  <span style={{
                    backgroundColor: activeTab === 'orders' ? '#d4af37' : '#cbd5e1',
                    color: '#0f172a',
                    padding: '1px 7px',
                    borderRadius: '10px',
                    fontSize: '0.7rem',
                    fontWeight: 800
                  }}>
                    {userOrders.length}
                  </span>
                )}
              </button>

              <button
                onClick={() => setActiveTab('search')}
                style={{
                  padding: '9px 20px',
                  borderRadius: '30px',
                  fontSize: '0.82rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  border: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  backgroundColor: activeTab === 'search' ? '#0f172a' : '#f1f5f9',
                  color: activeTab === 'search' ? '#f3e5ab' : '#64748b',
                  boxShadow: activeTab === 'search' ? '0 4px 12px rgba(15, 23, 42, 0.2)' : 'none'
                }}
              >
                <Search size={15} color={activeTab === 'search' ? '#d4af37' : '#94a3b8'} />
                <span>Search by Order ID / Email</span>
              </button>
            </div>
          </div>

          {/* TAB 1: MY ORDERS CATALOG */}
          {activeTab === 'orders' && (
            <div>
              {loadingOrders ? (
                <div style={{ textAlign: 'center', padding: '3rem 0', color: '#8a6709' }}>
                  <Clock size={32} className="animate-spin" style={{ margin: '0 auto 1rem' }} />
                  <p style={{ fontSize: '0.9rem', color: '#64748b' }}>Retrieving your acquisition records from secure ledger...</p>
                </div>
              ) : userOrders.length === 0 ? (
                <div style={{
                  textAlign: 'center',
                  padding: '3rem 1.5rem',
                  backgroundColor: '#f8fafc',
                  borderRadius: '8px',
                  border: '1px dashed #cbd5e1'
                }}>
                  <ShoppingBag size={42} color="#94a3b8" style={{ margin: '0 auto 1rem' }} />
                  <h3 style={{ fontSize: '1.1rem', color: '#0f172a', fontWeight: 700, marginBottom: '0.4rem' }}>No Consignments Found</h3>
                  <p style={{ color: '#64748b', fontSize: '0.85rem', maxWidth: '420px', margin: '0 auto 1.5rem' }}>
                    {isAuthenticated
                      ? "You haven't completed any acquisitions yet under this patron account."
                      : "No local purchase receipts detected on this device. Sign in to sync your orders or search using your reference ID."}
                  </p>
                  <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
                    {!isAuthenticated && (
                      <button
                        onClick={() => openAuthModal('signin')}
                        className="btn-gold"
                        style={{ padding: '8px 18px', fontSize: '0.8rem' }}
                      >
                        Sign In with Email
                      </button>
                    )}
                    <button
                      onClick={() => setActiveTab('search')}
                      className="btn-outline-gold"
                      style={{ padding: '8px 18px', fontSize: '0.8rem' }}
                    >
                      Locate by Reference ID
                    </button>
                  </div>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                  {userOrders.map((ord) => {
                    const isExpanded = expandedOrderId === ord.id;
                    const stage = getStageIndex(ord.orderStatus || 'Confirmed');

                    return (
                      <div
                        key={ord.id}
                        style={{
                          border: isExpanded ? '1px solid #d4af37' : '1px solid rgba(0,0,0,0.08)',
                          borderRadius: '8px',
                          backgroundColor: '#ffffff',
                          overflow: 'hidden',
                          boxShadow: isExpanded ? '0 10px 30px rgba(180, 140, 30, 0.08)' : '0 2px 8px rgba(0,0,0,0.03)',
                          transition: 'all 0.2s ease'
                        }}
                      >
                        {/* Order Summary Bar */}
                        <div
                          onClick={() => setExpandedOrderId(isExpanded ? null : ord.id)}
                          style={{
                            padding: '1.25rem 1.5rem',
                            backgroundColor: isExpanded ? 'rgba(212, 175, 55, 0.04)' : '#ffffff',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            flexWrap: 'wrap',
                            gap: '1rem',
                            borderBottom: isExpanded ? '1px solid rgba(180, 140, 30, 0.15)' : 'none'
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <div style={{
                              width: '40px',
                              height: '40px',
                              borderRadius: '50%',
                              backgroundColor: '#f8fafc',
                              border: '1px solid #e2e8f0',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              color: '#8a6709',
                              flexShrink: 0
                            }}>
                              <Watch size={20} />
                            </div>
                            <div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <span style={{ fontFamily: 'monospace', fontWeight: 800, fontSize: '0.95rem', color: '#0f172a' }}>
                                  #{ord.id || ord.orderNumber}
                                </span>
                                <span style={{
                                  backgroundColor: ord.orderStatus === 'Delivered' ? '#dcfce7' : '#fef9c3',
                                  color: ord.orderStatus === 'Delivered' ? '#166534' : '#854d0e',
                                  fontSize: '0.68rem',
                                  fontWeight: 800,
                                  padding: '2px 8px',
                                  borderRadius: '12px',
                                  textTransform: 'uppercase'
                                }}>
                                  {ord.orderStatus || 'Confirmed'}
                                </span>
                              </div>
                              <div style={{ fontSize: '0.75rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '8px', marginTop: '3px' }}>
                                <span>{new Date(ord.createdAt || Date.now()).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                                <span>•</span>
                                <span>{ord.items?.length || 1} Timepiece{ord.items?.length > 1 ? 's' : ''}</span>
                                <span>•</span>
                                <span style={{ color: '#059669', fontWeight: 600 }}>Razorpay Paid</span>
                              </div>
                            </div>
                          </div>

                          <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                            <div style={{ textAlign: 'right' }}>
                              <div style={{ fontSize: '0.68rem', color: '#64748b', textTransform: 'uppercase' }}>Amount Paid</div>
                              <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a', fontFamily: 'var(--font-brand)' }}>
                                {formatCurrency(ord.total || ord.amount || 0, currency)}
                              </div>
                            </div>
                            {isExpanded ? <ChevronUp size={18} color="#8a6709" /> : <ChevronDown size={18} color="#94a3b8" />}
                          </div>
                        </div>

                        {/* Order Detailed Breakdown (When Expanded) */}
                        {isExpanded && (
                          <div style={{ padding: '1.5rem', backgroundColor: '#ffffff' }}>
                            {/* Live Delivery Milestones */}
                            <div style={{ marginBottom: '2rem', padding: '1rem', backgroundColor: '#f8f7f4', borderRadius: '8px', border: '1px solid rgba(180, 140, 30, 0.15)' }}>
                              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#8a6709', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '1.2rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <Truck size={14} /> Concierge Dispatch Milestones
                              </div>
                              <div style={{ position: 'relative', padding: '0 0.5rem' }}>
                                <div style={{ position: 'absolute', top: '14px', left: '1.5rem', right: '1.5rem', height: '2px', background: '#cbd5e1', zIndex: 0 }} />
                                <div style={{ position: 'absolute', top: '14px', left: '1.5rem', width: `${(stage - 1) * 33.33}%`, height: '2px', background: '#d4af37', zIndex: 1, transition: 'width 0.5s ease' }} />

                                <div style={{ display: 'flex', justifyContent: 'space-between', position: 'relative', zIndex: 2 }}>
                                  {stages.map((stg, sIdx) => {
                                    const stepNum = sIdx + 1;
                                    const isDone = stepNum <= stage;
                                    const isCurrent = stepNum === stage;
                                    return (
                                      <div key={sIdx} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '25%', textAlign: 'center' }}>
                                        <div style={{
                                          width: '28px',
                                          height: '28px',
                                          borderRadius: '50%',
                                          backgroundColor: isDone ? '#ffffff' : '#f8fafc',
                                          border: isDone ? '2px solid #d4af37' : '2px solid #cbd5e1',
                                          display: 'flex',
                                          alignItems: 'center',
                                          justifyContent: 'center',
                                          color: isDone ? '#d4af37' : '#94a3b8',
                                          boxShadow: isCurrent ? '0 0 0 3px rgba(212, 175, 55, 0.2)' : 'none',
                                          marginBottom: '6px',
                                          transition: 'all 0.3s'
                                        }}>
                                          {isDone ? <CheckCircle2 size={15} /> : <Clock size={13} />}
                                        </div>
                                        <span style={{ fontSize: '0.7rem', fontWeight: isDone ? 700 : 500, color: isDone ? '#0f172a' : '#64748b' }}>
                                          {stg.title}
                                        </span>
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>
                            </div>

                            {/* Allocated Items List */}
                            <div style={{ marginBottom: '1.5rem' }}>
                              <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#0f172a', textTransform: 'uppercase', marginBottom: '0.8rem' }}>
                                Allocated Timepieces
                              </div>
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                {(ord.items || []).map((item, iIdx) => (
                                  <div
                                    key={iIdx}
                                    style={{
                                      display: 'flex',
                                      alignItems: 'center',
                                      gap: '1rem',
                                      padding: '0.75rem',
                                      borderRadius: '6px',
                                      backgroundColor: '#f8fafc',
                                      border: '1px solid rgba(0,0,0,0.04)'
                                    }}
                                  >
                                    <img
                                      src={getImageUrl(item.image || item.product?.images?.[0] || '/images/watches/rolex_submariner.jpg')}
                                      alt={item.name}
                                      style={{
                                        width: '54px',
                                        height: '54px',
                                        borderRadius: '4px',
                                        objectFit: 'cover',
                                        backgroundColor: '#ffffff',
                                        border: '1px solid rgba(0,0,0,0.08)'
                                      }}
                                    />
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                      <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0f172a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                        {item.name}
                                      </div>
                                      <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '2px' }}>
                                        Brand: <strong style={{ color: '#8a6709' }}>{item.brand || 'Exclusive'}</strong> • Qty: {item.quantity}
                                        {item.selectedColor ? ` • ${item.selectedColor}` : ''}
                                      </div>
                                    </div>
                                    <div style={{ textAlign: 'right', fontWeight: 700, color: '#0f172a', fontSize: '0.9rem' }}>
                                      {formatCurrency((item.price || 0) * (item.quantity || 1), currency)}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>

                            {/* Shipping Destination & Action Buttons */}
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '1rem', paddingTop: '1rem', borderTop: '1px solid rgba(0,0,0,0.06)' }}>
                              <div style={{ fontSize: '0.75rem', color: '#64748b', maxWidth: '350px' }}>
                                <span style={{ fontWeight: 700, color: '#0f172a' }}>Delivery Destination: </span>
                                <span>
                                  {ord.customer?.address ? `${ord.customer.address}, ${ord.customer.city || ''}, ${ord.customer.state || ''} ${ord.customer.postalCode || ''}` : 'Secured diplomatic courier transit'}
                                </span>
                              </div>

                              <div style={{ display: 'flex', gap: '8px' }}>
                                <button
                                  onClick={() => {
                                    onBack();
                                    setTimeout(() => onOpenReturnForOrder(ord.id), 100);
                                  }}
                                  style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '6px',
                                    padding: '8px 14px',
                                    backgroundColor: '#ffffff',
                                    border: '1px solid #cbd5e1',
                                    color: '#475569',
                                    borderRadius: '4px',
                                    fontSize: '0.75rem',
                                    fontWeight: 600,
                                    cursor: 'pointer'
                                  }}
                                >
                                  <RotateCcw size={14} /> Request Concierge Return
                                </button>
                                <button
                                  onClick={() => window.print()}
                                  style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '6px',
                                    padding: '8px 14px',
                                    backgroundColor: '#f8fafc',
                                    border: '1px solid #d4af37',
                                    color: '#8a6709',
                                    borderRadius: '4px',
                                    fontSize: '0.75rem',
                                    fontWeight: 600,
                                    cursor: 'pointer'
                                  }}
                                >
                                  <ExternalLink size={14} /> Print Invoice
                                </button>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: MANUAL SEARCH BY ID OR EMAIL */}
          {activeTab === 'search' && (
            <div>
              {/* Search Bar */}
              <form onSubmit={handleSearch} style={{ display: 'flex', gap: '0.5rem', marginBottom: '2rem' }}>
                <div style={{ position: 'relative', flex: 1 }}>
                  <Search size={18} color="#94a3b8" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }} />
                  <input
                    type="text"
                    placeholder="Enter Order Reference (e.g., order_LW_...) or Email"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '12px 16px 12px 42px',
                      borderRadius: '4px',
                      border: '1px solid #cbd5e1',
                      fontSize: '0.9rem',
                      outline: 'none'
                    }}
                  />
                </div>
                <button
                  type="submit"
                  className="btn-gold"
                  style={{ padding: '0 24px', fontWeight: 600, whiteSpace: 'nowrap' }}
                  disabled={!searchQuery.trim() || searchLoading}
                >
                  {searchLoading ? 'Locating...' : 'Locate Order'}
                </button>
              </form>

              {errorMessage && (
                <div style={{ backgroundColor: '#fef2f2', border: '1px solid #fecaca', padding: '1rem', borderRadius: '4px', color: '#991b1b', fontSize: '0.88rem', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '2rem' }}>
                  <AlertCircle size={18} />
                  {errorMessage}
                </div>
              )}

              {/* Searched Order Result */}
              {searchedOrder && (
                <div className="animate-fade-in" style={{ backgroundColor: '#f8f7f4', borderRadius: '8px', padding: '1.75rem', border: '1px solid rgba(180, 140, 30, 0.25)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', paddingBottom: '1.25rem', borderBottom: '1px solid rgba(0,0,0,0.06)', marginBottom: '1.5rem' }}>
                    <div>
                      <div style={{ fontSize: '0.72rem', color: '#64748b', textTransform: 'uppercase' }}>Consignment Reference</div>
                      <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a', fontFamily: 'monospace' }}>#{searchedOrder.id || searchedOrder.orderNumber}</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '0.72rem', color: '#64748b', textTransform: 'uppercase' }}>Status</div>
                      <span style={{
                        backgroundColor: searchedOrder.orderStatus === 'Delivered' ? '#dcfce7' : '#fef9c3',
                        color: searchedOrder.orderStatus === 'Delivered' ? '#166534' : '#854d0e',
                        fontSize: '0.72rem',
                        fontWeight: 800,
                        padding: '3px 10px',
                        borderRadius: '12px',
                        textTransform: 'uppercase'
                      }}>
                        {searchedOrder.orderStatus || 'Confirmed'}
                      </span>
                    </div>
                  </div>

                  {/* 4-Stage Progress Line */}
                  <div style={{ position: 'relative', marginBottom: '2rem', padding: '0 0.5rem' }}>
                    <div style={{ position: 'absolute', top: '14px', left: '1.5rem', right: '1.5rem', height: '2px', background: '#cbd5e1', zIndex: 0 }} />
                    <div style={{ position: 'absolute', top: '14px', left: '1.5rem', width: `${(getStageIndex(searchedOrder.orderStatus) - 1) * 33.33}%`, height: '2px', background: '#d4af37', zIndex: 1 }} />

                    <div style={{ display: 'flex', justifyContent: 'space-between', position: 'relative', zIndex: 2 }}>
                      {stages.map((stg, sIdx) => {
                        const stepNum = sIdx + 1;
                        const isDone = stepNum <= getStageIndex(searchedOrder.orderStatus);
                        return (
                          <div key={sIdx} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '25%', textAlign: 'center' }}>
                            <div style={{
                              width: '28px',
                              height: '28px',
                              borderRadius: '50%',
                              backgroundColor: isDone ? '#ffffff' : '#f8fafc',
                              border: isDone ? '2px solid #d4af37' : '2px solid #cbd5e1',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              color: isDone ? '#d4af37' : '#94a3b8',
                              marginBottom: '6px'
                            }}>
                              {isDone ? <CheckCircle2 size={15} /> : <Clock size={13} />}
                            </div>
                            <span style={{ fontSize: '0.7rem', fontWeight: isDone ? 700 : 500, color: isDone ? '#0f172a' : '#64748b' }}>
                              {stg.title}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Items */}
                  {searchedOrder.items && searchedOrder.items.length > 0 && (
                    <div style={{ backgroundColor: '#ffffff', borderRadius: '6px', padding: '1rem', border: '1px solid rgba(0,0,0,0.06)', marginBottom: '1.5rem' }}>
                      <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#0f172a', textTransform: 'uppercase', marginBottom: '0.6rem' }}>Items in this Consignment</div>
                      {searchedOrder.items.map((item, idx) => (
                        <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '6px 0', borderBottom: idx !== searchedOrder.items.length - 1 ? '1px solid rgba(0,0,0,0.04)' : 'none' }}>
                          <img
                            src={getImageUrl(item.image || '/images/watches/rolex_submariner.jpg')}
                            alt={item.name}
                            style={{ width: '40px', height: '40px', borderRadius: '4px', objectFit: 'cover' }}
                          />
                          <div style={{ flex: 1 }}>
                            <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#0f172a' }}>{item.name}</div>
                            <div style={{ fontSize: '0.7rem', color: '#64748b' }}>Qty: {item.quantity} {item.price ? `• ${formatCurrency(item.price, currency)}` : ''}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                    <button
                      onClick={() => {
                        onBack();
                        setTimeout(() => onOpenReturnForOrder(searchedOrder.id), 100);
                      }}
                      style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 14px', backgroundColor: '#ffffff', border: '1px solid #cbd5e1', color: '#475569', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer' }}
                    >
                      <RotateCcw size={14} /> Request Concierge Return
                    </button>
                    <button
                      onClick={() => window.print()}
                      style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 14px', backgroundColor: '#f8fafc', border: '1px solid #d4af37', color: '#8a6709', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer' }}
                    >
                      <ExternalLink size={14} /> Print Invoice
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TrackConsignmentPage;

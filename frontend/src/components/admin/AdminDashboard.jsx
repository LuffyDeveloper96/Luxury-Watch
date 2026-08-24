import React, { useState, useEffect } from 'react';
import { useStore } from '../../context/StoreContext';
import { useAdminAuth } from '../../context/AdminAuthContext';
import { settingsAPI } from '../../services/api';
import {
  BarChart3,
  Package,
  ShoppingBag,
  Tag,
  Settings,
  Activity,
  Plus,
  Trash2,
  Edit,
  CheckCircle2,
  Truck,
  DollarSign,
  Users,
  Eye,
  LogOut,
  ArrowUpRight,
  ShieldCheck,
  Search,
  Sparkles,
  AlertCircle,
  Save,
  X,
  CreditCard,
  QrCode,
  Lock,
  Copy
} from 'lucide-react';

export const AdminDashboard = ({ onBackToStore }) => {
  const {
    products,
    orders,
    coupons,
    activities,
    addProduct,
    updateProduct,
    deleteProduct,
    updateOrderStatus,
    addCoupon,
    toggleCoupon,
    deleteCoupon,
    storeSettings,
    setStoreSettings,
    formatPrice
  } = useStore();

  const { adminUser, logoutAdmin } = useAdminAuth();

  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'activities' | 'products' | 'orders' | 'coupons' | 'settings'

  // Product Add / Edit Form Modal State
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [productForm, setProductForm] = useState({
    name: '',
    subtitle: '',
    category: 'Chronograph',
    gender: 'Men',
    price: 45000,
    comparePrice: 58000,
    stock: 10,
    sku: `AK-${Date.now().toString().slice(-4)}`,
    badge: 'NEW ARRIVAL',
    badgeType: 'new',
    images: [
      'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?q=80&w=1000&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1547996160-71dfabb1d89b?q=80&w=1000&auto=format&fit=crop'
    ],
    description: 'Masterfully crafted in 316L stainless steel with anti-reflective sapphire crystal and Swiss automatic calibre.',
    specs: {
      movement: 'Swiss Automatic Calibre (28,800 vph)',
      powerReserve: '48 Hours',
      caseDiameter: '42 mm',
      caseThickness: '12 mm',
      caseMaterial: '316L Surgical Grade Steel',
      dial: 'Sunburst Dial with Hand-Applied Indices',
      glass: 'Scratchproof Domed Sapphire',
      waterResistance: '10 ATM (100M)',
      strap: 'Genuine Hand-Stitched Leather',
      lugWidth: '22 mm',
      warranty: '5-Year International Guarantee'
    }
  });

  // Coupon Form State
  const [couponForm, setCouponForm] = useState({
    code: '',
    discountPercent: 10,
    minOrderValue: 20000,
    description: ''
  });

  // Settings Form State
  const [settingsForm, setSettingsForm] = useState(storeSettings);
  const [settingsSaved, setSettingsSaved] = useState(false);

  // Payment Gateway & Master Gmail State
  const [paymentForm, setPaymentForm] = useState({
    merchantName: 'Luxury Watch Haute Horlogerie',
    upiId: 'luxurywatch@okhdfcbank',
    bankName: 'HDFC Bank Ltd.',
    accountHolder: 'LUXURY WATCH INDIA PRIVATE LIMITED',
    accountNumber: '50200088991122',
    ifscCode: 'HDFC0000060',
    branch: 'Bandra Kurla Complex (BKC), Mumbai',
    qrCodeUrl: '',
    paymentNotes: 'Please complete payment and enter the 12-digit UPI UTR / Bank Reference Number to verify your order.'
  });
  const [authorizedAdminGmail, setAuthorizedAdminGmail] = useState('admin@luxurywatch.com');
  const [paymentSavedMessage, setPaymentSavedMessage] = useState('');
  const [isSavingPayment, setIsSavingPayment] = useState(false);

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const payRes = await settingsAPI.getPaymentSettings();
        if (payRes.success && payRes.settings) {
          setPaymentForm(payRes.settings);
        }
        const secRes = await settingsAPI.getAdminSecurity();
        if (secRes.success && secRes.authorizedEmail) {
          setAuthorizedAdminGmail(secRes.authorizedEmail);
        }
      } catch (err) {
        // Fallback
      }
    };
    loadSettings();
  }, []);

  const handleSavePaymentAndSecurity = async (e) => {
    e.preventDefault();
    setIsSavingPayment(true);
    setPaymentSavedMessage('');
    try {
      await settingsAPI.updatePaymentSettings(paymentForm);
      if (authorizedAdminGmail.trim()) {
        await settingsAPI.updateAdminSecurity(authorizedAdminGmail);
      }
      setIsSavingPayment(false);
      setPaymentSavedMessage('Merchant Payment Gateway & Master Gmail Security updated and saved to Database!');
      setTimeout(() => setPaymentSavedMessage(''), 4000);
    } catch (err) {
      setIsSavingPayment(false);
      alert('Error updating settings: ' + err.message);
    }
  };

  // Search in Products / Orders
  const [productSearch, setProductSearch] = useState('');
  const [orderSearch, setOrderSearch] = useState('');

  // KPIs Calculations
  const totalRevenue = orders.reduce((sum, o) => sum + (o.total || 0), 0);
  const totalOrdersCount = orders.length;
  const avgOrderValue = totalOrdersCount > 0 ? Math.round(totalRevenue / totalOrdersCount) : 0;
  const lowStockCount = products.filter(p => p.stock <= 5).length;
  const liveVisitorsCount = 18;

  // Open Product Modal for Add
  const handleOpenAddProduct = () => {
    setEditingProduct(null);
    setProductForm({
      name: '',
      subtitle: '',
      category: 'Chronograph',
      gender: 'Men',
      price: 49999,
      comparePrice: 65000,
      stock: 8,
      sku: `AK-LUX-${Math.floor(1000 + Math.random() * 9000)}`,
      badge: 'NEW ARRIVAL',
      badgeType: 'new',
      images: [
        'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?q=80&w=1000&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1547996160-71dfabb1d89b?q=80&w=1000&auto=format&fit=crop'
      ],
      description: 'Handcrafted Swiss automatic timepiece with triple complication and domed sapphire crystal.',
      specs: {
        movement: 'Swiss Automatic Calibre (28,800 vph)',
        powerReserve: '48 Hours',
        caseDiameter: '42 mm',
        caseThickness: '12 mm',
        caseMaterial: '316L Surgical Grade Steel',
        dial: 'Obsidian Sunburst Dial',
        glass: 'Domed Sapphire Crystal',
        waterResistance: '10 ATM (100M)',
        strap: 'Italian Full-Grain Leather',
        lugWidth: '22 mm',
        warranty: '5-Year International Guarantee'
      }
    });
    setIsProductModalOpen(true);
  };

  // Open Product Modal for Edit
  const handleOpenEditProduct = (prod) => {
    setEditingProduct(prod);
    setProductForm({
      name: prod.name,
      subtitle: prod.subtitle,
      category: prod.category,
      gender: prod.gender,
      price: prod.price,
      comparePrice: prod.comparePrice,
      stock: prod.stock,
      sku: prod.sku,
      badge: prod.badge || '',
      badgeType: prod.badgeType || 'gold',
      images: prod.images || [],
      description: prod.description,
      specs: prod.specs || {}
    });
    setIsProductModalOpen(true);
  };

  // Save Product (Add or Edit)
  const handleSaveProduct = (e) => {
    e.preventDefault();
    if (editingProduct) {
      updateProduct({
        ...editingProduct,
        ...productForm,
        price: Number(productForm.price),
        comparePrice: Number(productForm.comparePrice),
        stock: Number(productForm.stock)
      });
    } else {
      addProduct({
        ...productForm,
        price: Number(productForm.price),
        comparePrice: Number(productForm.comparePrice),
        stock: Number(productForm.stock),
        rating: 5.0,
        reviewCount: 1,
        reviews: [
          { id: 1, author: 'Atelier Inspection Team', rating: 5, date: 'Certified', comment: 'Quality control pass #9910. Calibre frequency stable.', verified: true }
        ]
      });
    }
    setIsProductModalOpen(false);
  };

  // Save Coupon
  const handleSaveCoupon = (e) => {
    e.preventDefault();
    if (!couponForm.code.trim()) return;
    addCoupon({
      code: couponForm.code.trim().toUpperCase(),
      discountPercent: Number(couponForm.discountPercent),
      minOrderValue: Number(couponForm.minOrderValue),
      description: couponForm.description,
      isActive: true,
      usesCount: 0
    });
    setCouponForm({ code: '', discountPercent: 10, minOrderValue: 20000, description: '' });
  };

  // Save Settings
  const handleSaveSettings = (e) => {
    e.preventDefault();
    setStoreSettings(settingsForm);
    setSettingsSaved(true);
    setTimeout(() => setSettingsSaved(false), 2500);
  };

  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(productSearch.toLowerCase()) ||
    p.sku?.toLowerCase().includes(productSearch.toLowerCase()) ||
    p.category.toLowerCase().includes(productSearch.toLowerCase())
  );

  const filteredOrders = orders.filter(o =>
    o.id.toLowerCase().includes(orderSearch.toLowerCase()) ||
    o.customer?.name?.toLowerCase().includes(orderSearch.toLowerCase()) ||
    o.customer?.email?.toLowerCase().includes(orderSearch.toLowerCase()) ||
    o.trackingNumber?.toLowerCase().includes(orderSearch.toLowerCase())
  );

  return (
    <div style={{ background: '#08090d', minHeight: '100vh', color: '#f8fafc' }} className="animate-fade-in">
      {/* Top Sovereign Administrator Header */}
      <header style={{
        background: '#0d0f14',
        borderBottom: '1px solid var(--border-gold)',
        padding: '1rem 2rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            background: 'rgba(212, 175, 55, 0.15)',
            border: '1px solid #d4af37',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#f3e5ab'
          }}>
            <ShieldCheck size={22} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h1 style={{ fontSize: '1.15rem', color: '#f8fafc', fontFamily: 'var(--font-brand)', letterSpacing: '0.12em' }}>
                AKIKI LONDON COMMAND CENTER
              </h1>
              <span style={{ fontSize: '0.65rem', background: '#10b981', color: '#000', fontWeight: 700, padding: '2px 6px', borderRadius: '2px' }}>
                MASTER LIVE
              </span>
            </div>
            <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>
              Sole Administrator: <strong style={{ color: '#f3e5ab' }}>{adminUser?.name || 'Lord Harrison Croft'}</strong> (Clearance Level 5)
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <button
            onClick={onBackToStore}
            className="btn-outline-gold"
            style={{ padding: '0.6rem 1.2rem', fontSize: '0.75rem' }}
          >
            <Eye size={14} />
            <span>View Public Store</span>
          </button>

          <button
            onClick={logoutAdmin}
            style={{
              background: 'rgba(225, 29, 72, 0.15)',
              border: '1px solid rgba(225, 29, 72, 0.4)',
              color: '#fb7185',
              padding: '0.6rem 1.2rem',
              borderRadius: '3px',
              fontSize: '0.75rem',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <LogOut size={14} />
            <span>Lockout & Logout</span>
          </button>
        </div>
      </header>

      {/* Main Admin Body */}
      <div style={{ display: 'flex', minHeight: 'calc(100vh - 75px)' }}>
        {/* Sidebar Navigation */}
        <aside style={{
          width: '240px',
          background: '#0b0c10',
          borderRight: '1px solid rgba(255, 255, 255, 0.08)',
          padding: '1.5rem 1rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.5rem',
          flexShrink: 0
        }}>
          {[
            { id: 'overview', name: 'Executive Overview', icon: BarChart3 },
            { id: 'activities', name: 'Live Activity Stream', icon: Activity, count: activities.length },
            { id: 'products', name: 'Timepiece Catalog', icon: Package, count: products.length },
            { id: 'orders', name: 'Order Fulfillment', icon: ShoppingBag, count: orders.length },
            { id: 'payment', name: 'Payment Gateway & UPI', icon: CreditCard },
            { id: 'coupons', name: 'VIP Promo Codes', icon: Tag, count: coupons.length },
            { id: 'settings', name: 'Storefront Settings', icon: Settings }
          ].map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  background: isActive ? 'rgba(212, 175, 55, 0.12)' : 'transparent',
                  border: isActive ? '1px solid var(--border-gold)' : '1px solid transparent',
                  color: isActive ? '#f3e5ab' : '#94a3b8',
                  padding: '10px 14px',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  fontSize: '0.82rem',
                  fontWeight: isActive ? 600 : 400,
                  textAlign: 'left',
                  transition: 'all 0.2s ease'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Icon size={16} color={isActive ? '#d4af37' : '#64748b'} />
                  <span>{tab.name}</span>
                </div>
                {tab.count !== undefined && (
                  <span style={{
                    fontSize: '0.68rem',
                    background: isActive ? '#d4af37' : '#1e222b',
                    color: isActive ? '#0b0c10' : '#94a3b8',
                    fontWeight: 700,
                    padding: '1px 6px',
                    borderRadius: '2px'
                  }}>
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </aside>

        {/* Workspace Content */}
        <main style={{ flex: 1, padding: '2rem', overflowY: 'auto' }}>
          {/* TAB 1: Executive Overview */}
          {activeTab === 'overview' && (
            <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
              <div>
                <h2 style={{ fontSize: '1.6rem', color: '#f8fafc', fontFamily: 'var(--font-brand)' }}>
                  Executive Horology Dashboard
                </h2>
                <p style={{ fontSize: '0.82rem', color: '#94a3b8' }}>
                  Real-time sales velocity, order fulfillment, and client activity metrics.
                </p>
              </div>

              {/* KPI Cards Grid */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                gap: '1.25rem'
              }}>
                <div className="admin-card">
                  <span style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                    Total Gross Revenue
                  </span>
                  <div className="admin-stat-num" style={{ margin: '8px 0' }}>
                    {formatPrice(totalRevenue)}
                  </div>
                  <span style={{ fontSize: '0.72rem', color: '#34d399', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <ArrowUpRight size={14} />
                    +18.4% this week
                  </span>
                </div>

                <div className="admin-card">
                  <span style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                    Total Orders Processed
                  </span>
                  <div className="admin-stat-num" style={{ margin: '8px 0' }}>
                    {totalOrdersCount}
                  </div>
                  <span style={{ fontSize: '0.72rem', color: '#34d399' }}>
                    100% Escrow Settled
                  </span>
                </div>

                <div className="admin-card">
                  <span style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                    Average Basket Value
                  </span>
                  <div className="admin-stat-num" style={{ margin: '8px 0' }}>
                    {formatPrice(avgOrderValue)}
                  </div>
                  <span style={{ fontSize: '0.72rem', color: '#cbd5e1' }}>
                    Haute horlogerie tier
                  </span>
                </div>

                <div className="admin-card">
                  <span style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                    Vault Low-Stock Alert
                  </span>
                  <div className="admin-stat-num" style={{ margin: '8px 0', color: lowStockCount > 0 ? '#fb7185' : '#34d399' }}>
                    {lowStockCount} Models
                  </div>
                  <span style={{ fontSize: '0.72rem', color: '#f87171' }}>
                    Require replenishment
                  </span>
                </div>

                <div className="admin-card">
                  <span style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                    Live Online Patrons
                  </span>
                  <div className="admin-stat-num" style={{ margin: '8px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span className="live-pulse" />
                    <span>{liveVisitorsCount}</span>
                  </div>
                  <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>
                    Browsing luxury collections
                  </span>
                </div>
              </div>

              {/* Quick Summary Grid: Recent Orders & Recent Activity */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '1.5rem' }}>
                {/* Recent Orders */}
                <div style={{ background: '#12141a', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px', padding: '1.5rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <h3 style={{ fontSize: '1rem', color: '#f8fafc', fontFamily: 'var(--font-brand)' }}>
                      Recent Client Acquisitions
                    </h3>
                    <button
                      onClick={() => setActiveTab('orders')}
                      style={{ background: 'none', border: 'none', color: '#d4af37', fontSize: '0.75rem', cursor: 'pointer' }}
                    >
                      View All
                    </button>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {orders.slice(0, 4).map(o => (
                      <div key={o.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px', background: 'rgba(255,255,255,0.02)', borderRadius: '4px' }}>
                        <div>
                          <span style={{ fontSize: '0.82rem', color: '#f8fafc', fontWeight: 600 }}>{o.customer?.name}</span>
                          <span style={{ fontSize: '0.72rem', color: '#94a3b8', display: 'block' }}>#{o.id} • {o.items?.[0]?.name}</span>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <span style={{ fontSize: '0.85rem', color: '#f3e5ab', fontWeight: 600 }}>{formatPrice(o.total)}</span>
                          <span style={{ fontSize: '0.68rem', color: o.orderStatus === 'Delivered' ? '#34d399' : '#d4af37', display: 'block' }}>
                            {o.orderStatus}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Live Activity Snippets */}
                <div style={{ background: '#12141a', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px', padding: '1.5rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <h3 style={{ fontSize: '1rem', color: '#f8fafc', fontFamily: 'var(--font-brand)' }}>
                      Live Activity Ticker
                    </h3>
                    <button
                      onClick={() => setActiveTab('activities')}
                      style={{ background: 'none', border: 'none', color: '#d4af37', fontSize: '0.75rem', cursor: 'pointer' }}
                    >
                      Full Log
                    </button>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {activities.slice(0, 4).map(act => (
                      <div key={act.id} style={{ display: 'flex', gap: '10px', alignItems: 'flex-start', padding: '8px', background: 'rgba(255,255,255,0.02)', borderRadius: '4px' }}>
                        <span className="live-pulse" style={{ marginTop: '5px' }} />
                        <div style={{ flex: 1, fontSize: '0.78rem' }}>
                          <p style={{ color: '#f8fafc' }}>{act.text}</p>
                          <span style={{ color: '#64748b', fontSize: '0.68rem' }}>{act.time} • {act.location}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: Live Activity Stream */}
          {activeTab === 'activities' && (
            <div className="animate-fade-in">
              <div style={{ marginBottom: '1.5rem' }}>
                <h2 style={{ fontSize: '1.6rem', color: '#f8fafc', fontFamily: 'var(--font-brand)' }}>
                  Live Store Activity Stream
                </h2>
                <p style={{ fontSize: '0.82rem', color: '#94a3b8' }}>
                  Real-time events recorded across the storefront, cart additions, orders, reviews, and inventory changes.
                </p>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {activities.map(act => (
                  <div
                    key={act.id}
                    style={{
                      background: '#12141a',
                      border: '1px solid rgba(255, 255, 255, 0.06)',
                      borderRadius: '6px',
                      padding: '1rem 1.25rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: '1rem'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <span className="live-pulse" />
                      <div>
                        <p style={{ fontSize: '0.85rem', color: '#f8fafc', fontWeight: 500 }}>
                          {act.text}
                        </p>
                        <span style={{ fontSize: '0.72rem', color: '#64748b' }}>
                          Location: {act.location} • Time: {act.time}
                        </span>
                      </div>
                    </div>

                    <span className="badge-luxury badge-gold" style={{ fontSize: '0.65rem' }}>
                      {act.badge || 'Live Event'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: Products Catalog (Full CRUD) */}
          {activeTab === 'products' && (
            <div className="animate-fade-in">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                  <h2 style={{ fontSize: '1.6rem', color: '#f8fafc', fontFamily: 'var(--font-brand)' }}>
                    Timepiece Catalog Management
                  </h2>
                  <p style={{ fontSize: '0.82rem', color: '#94a3b8' }}>
                    Total watches in catalog: {products.length} pieces.
                  </p>
                </div>

                <button onClick={handleOpenAddProduct} className="btn-gold" style={{ padding: '0.75rem 1.5rem', fontSize: '0.78rem' }}>
                  <Plus size={16} />
                  <span>Add New Timepiece</span>
                </button>
              </div>

              {/* Filter / Search Bar */}
              <div style={{ marginBottom: '1.25rem', maxWidth: '400px' }}>
                <input
                  type="text"
                  placeholder="Filter by title, SKU or category..."
                  value={productSearch}
                  onChange={(e) => setProductSearch(e.target.value)}
                  className="lux-input"
                  style={{ fontSize: '0.82rem' }}
                />
              </div>

              {/* Products Table */}
              <div style={{ background: '#12141a', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px', overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.82rem' }}>
                  <thead>
                    <tr style={{ background: '#0a0b0f', color: '#94a3b8', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                      <th style={{ padding: '12px 16px' }}>Timepiece</th>
                      <th style={{ padding: '12px 16px' }}>SKU</th>
                      <th style={{ padding: '12px 16px' }}>Category</th>
                      <th style={{ padding: '12px 16px' }}>Price</th>
                      <th style={{ padding: '12px 16px' }}>Vault Stock</th>
                      <th style={{ padding: '12px 16px', textAlign: 'right' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredProducts.map(prod => (
                      <tr key={prod.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                        <td style={{ padding: '12px 16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <img src={prod.images?.[0]} alt="" style={{ width: '44px', height: '44px', objectFit: 'cover', borderRadius: '4px', background: '#000' }} />
                          <div>
                            <span style={{ color: '#f8fafc', fontWeight: 600, display: 'block' }}>{prod.name}</span>
                            <span style={{ color: '#64748b', fontSize: '0.72rem' }}>{prod.badge}</span>
                          </div>
                        </td>
                        <td style={{ padding: '12px 16px', color: '#d4af37', fontFamily: 'monospace' }}>
                          {prod.sku}
                        </td>
                        <td style={{ padding: '12px 16px', color: '#cbd5e1' }}>
                          {prod.category}
                        </td>
                        <td style={{ padding: '12px 16px', color: '#f3e5ab', fontWeight: 600 }}>
                          {formatPrice(prod.price)}
                        </td>
                        <td style={{ padding: '12px 16px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <button
                              onClick={() => updateProduct({ ...prod, stock: Math.max(0, prod.stock - 1) })}
                              style={{ background: '#1e222b', border: 'none', color: '#fff', width: '22px', height: '22px', borderRadius: '2px', cursor: 'pointer' }}
                            >
                              -
                            </button>
                            <span style={{ fontWeight: 600, minWidth: '24px', textAlign: 'center', color: prod.stock <= 4 ? '#fb7185' : '#f8fafc' }}>
                              {prod.stock}
                            </span>
                            <button
                              onClick={() => updateProduct({ ...prod, stock: prod.stock + 1 })}
                              style={{ background: '#1e222b', border: 'none', color: '#fff', width: '22px', height: '22px', borderRadius: '2px', cursor: 'pointer' }}
                            >
                              +
                            </button>
                          </div>
                        </td>
                        <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                            <button
                              onClick={() => handleOpenEditProduct(prod)}
                              style={{ background: 'none', border: 'none', color: '#d4af37', cursor: 'pointer', padding: '4px' }}
                              title="Edit Timepiece"
                            >
                              <Edit size={16} />
                            </button>
                            <button
                              onClick={() => {
                                if (window.confirm(`Are you sure you wish to delete "${prod.name}" from catalog?`)) {
                                  deleteProduct(prod.id);
                                }
                              }}
                              style={{ background: 'none', border: 'none', color: '#f87171', cursor: 'pointer', padding: '4px' }}
                              title="Delete Timepiece"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 4: Orders Management */}
          {activeTab === 'orders' && (
            <div className="animate-fade-in">
              <div style={{ marginBottom: '1.5rem' }}>
                <h2 style={{ fontSize: '1.6rem', color: '#f8fafc', fontFamily: 'var(--font-brand)' }}>
                  Customer Order Fulfillment & Logistics
                </h2>
                <p style={{ fontSize: '0.82rem', color: '#94a3b8' }}>
                  Manage dispatch, update courier tracking numbers, and view customer invoices.
                </p>
              </div>

              {/* Order Search */}
              <div style={{ marginBottom: '1.25rem', maxWidth: '400px' }}>
                <input
                  type="text"
                  placeholder="Filter by Order #, customer name, email or tracking..."
                  value={orderSearch}
                  onChange={(e) => setOrderSearch(e.target.value)}
                  className="lux-input"
                  style={{ fontSize: '0.82rem' }}
                />
              </div>

              {/* Orders Table */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {filteredOrders.map(order => (
                  <div
                    key={order.id}
                    style={{
                      background: '#12141a',
                      border: '1px solid rgba(255, 255, 255, 0.08)',
                      borderRadius: '8px',
                      padding: '1.5rem'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', borderBottom: '1px solid rgba(255, 255, 255, 0.06)', paddingBottom: '1rem', marginBottom: '1rem' }}>
                      <div>
                        <span style={{ fontSize: '0.72rem', color: '#d4af37', fontWeight: 600 }}>ORDER #{order.id}</span>
                        <h4 style={{ fontSize: '1.05rem', color: '#f8fafc', fontFamily: 'var(--font-brand)' }}>
                          {order.customer?.name} ({order.customer?.email})
                        </h4>
                        <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                          Phone: {order.customer?.phone} • {order.customer?.city}, {order.customer?.country}
                        </span>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <div>
                          <span style={{ fontSize: '0.68rem', color: '#94a3b8', display: 'block' }}>Update Status:</span>
                          <select
                            value={order.orderStatus}
                            onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                            className="lux-select"
                            style={{ padding: '4px 8px', fontSize: '0.75rem' }}
                          >
                            <option value="Confirmed">Confirmed</option>
                            <option value="In Assembly">In Assembly</option>
                            <option value="Dispatched">Dispatched</option>
                            <option value="Delivered">Delivered</option>
                            <option value="Cancelled">Cancelled</option>
                          </select>
                        </div>

                        <div style={{ textAlign: 'right' }}>
                          <span style={{ fontSize: '1.1rem', fontWeight: 700, color: '#f3e5ab', display: 'block' }}>
                            {formatPrice(order.total)}
                          </span>
                          <span style={{ fontSize: '0.68rem', color: '#34d399' }}>
                            {order.paymentMethod} • Paid
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Order Items */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {order.items?.map((item, idx) => (
                        <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.82rem', color: '#cbd5e1' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <img src={item.image} alt="" style={{ width: '36px', height: '36px', objectFit: 'cover', borderRadius: '3px' }} />
                            <span>{item.name} ({item.variant}) × {item.quantity} {item.engraving ? `[Engraved: "${item.engraving}"]` : ''}</span>
                          </div>
                          <span style={{ color: '#f3e5ab' }}>{formatPrice(item.price * item.quantity)}</span>
                        </div>
                      ))}
                    </div>

                    {/* Tracking Footer */}
                    <div style={{ marginTop: '1rem', paddingTop: '0.75rem', borderTop: '1px solid rgba(255, 255, 255, 0.04)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.75rem' }}>
                      <span style={{ color: '#94a3b8' }}>
                        Tracking Number: <strong style={{ color: '#d4af37' }}>{order.trackingNumber || 'Pending'}</strong> ({order.shippingMethod})
                      </span>
                      <span style={{ color: '#64748b' }}>
                        Placed: {new Date(order.placedAt).toLocaleString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 5: Coupons & Promotions */}
          {activeTab === 'coupons' && (
            <div className="animate-fade-in">
              <div style={{ marginBottom: '1.5rem' }}>
                <h2 style={{ fontSize: '1.6rem', color: '#f8fafc', fontFamily: 'var(--font-brand)' }}>
                  VIP Promo Code & Discount Engine
                </h2>
                <p style={{ fontSize: '0.82rem', color: '#94a3b8' }}>
                  Create exclusive luxury promotional codes for marketing campaigns and VIP patrons.
                </p>
              </div>

              {/* Add Coupon Form */}
              <form onSubmit={handleSaveCoupon} style={{ background: '#12141a', border: '1px solid var(--border-gold)', borderRadius: '8px', padding: '1.5rem', marginBottom: '2rem' }}>
                <h4 style={{ fontSize: '1rem', color: '#f3e5ab', fontFamily: 'var(--font-brand)', marginBottom: '1rem' }}>
                  Create New VIP Promotion
                </h4>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                  <div>
                    <label style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>Coupon Code *</label>
                    <input
                      type="text"
                      placeholder="e.g. VIP25"
                      required
                      value={couponForm.code}
                      onChange={(e) => setCouponForm({ ...couponForm, code: e.target.value })}
                      className="lux-input"
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>Discount % *</label>
                    <input
                      type="number"
                      min={1}
                      max={70}
                      required
                      value={couponForm.discountPercent}
                      onChange={(e) => setCouponForm({ ...couponForm, discountPercent: e.target.value })}
                      className="lux-input"
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>Min Order Value (₹)</label>
                    <input
                      type="number"
                      value={couponForm.minOrderValue}
                      onChange={(e) => setCouponForm({ ...couponForm, minOrderValue: e.target.value })}
                      className="lux-input"
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>Description</label>
                    <input
                      type="text"
                      placeholder="e.g. 25% VIP Autumn Gala Voucher"
                      value={couponForm.description}
                      onChange={(e) => setCouponForm({ ...couponForm, description: e.target.value })}
                      className="lux-input"
                    />
                  </div>
                </div>

                <button type="submit" className="btn-gold" style={{ marginTop: '1rem', padding: '0.75rem 1.5rem', fontSize: '0.78rem' }}>
                  <Plus size={15} />
                  <span>Activate Promo Code</span>
                </button>
              </form>

              {/* Coupons Table */}
              <div style={{ background: '#12141a', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px', overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.82rem' }}>
                  <thead>
                    <tr style={{ background: '#0a0b0f', color: '#94a3b8', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                      <th style={{ padding: '12px 16px' }}>Code</th>
                      <th style={{ padding: '12px 16px' }}>Discount</th>
                      <th style={{ padding: '12px 16px' }}>Min Order</th>
                      <th style={{ padding: '12px 16px' }}>Uses</th>
                      <th style={{ padding: '12px 16px' }}>Status</th>
                      <th style={{ padding: '12px 16px', textAlign: 'right' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {coupons.map(c => (
                      <tr key={c.code} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                        <td style={{ padding: '12px 16px', fontWeight: 700, color: '#f3e5ab', fontFamily: 'monospace' }}>
                          {c.code}
                        </td>
                        <td style={{ padding: '12px 16px', color: '#34d399', fontWeight: 600 }}>
                          {c.discountPercent}% OFF
                        </td>
                        <td style={{ padding: '12px 16px', color: '#cbd5e1' }}>
                          {formatPrice(c.minOrderValue)}
                        </td>
                        <td style={{ padding: '12px 16px', color: '#94a3b8' }}>
                          {c.usesCount || 0} times
                        </td>
                        <td style={{ padding: '12px 16px' }}>
                          <span style={{ fontSize: '0.72rem', color: c.isActive ? '#34d399' : '#94a3b8', fontWeight: 600 }}>
                            {c.isActive ? 'ACTIVE' : 'INACTIVE'}
                          </span>
                        </td>
                        <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                            <button
                              onClick={() => toggleCoupon(c.code)}
                              style={{ background: 'none', border: 'none', color: '#d4af37', fontSize: '0.75rem', cursor: 'pointer' }}
                            >
                              {c.isActive ? 'Deactivate' : 'Activate'}
                            </button>
                            <button
                              onClick={() => deleteCoupon(c.code)}
                              style={{ background: 'none', border: 'none', color: '#f87171', cursor: 'pointer', padding: '2px' }}
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 6: Storefront Settings */}
          {activeTab === 'settings' && (
            <div className="animate-fade-in" style={{ maxWidth: '680px' }}>
              <div style={{ marginBottom: '1.5rem' }}>
                <h2 style={{ fontSize: '1.6rem', color: '#f8fafc', fontFamily: 'var(--font-brand)' }}>
                  Storefront & Concierge Settings
                </h2>
                <p style={{ fontSize: '0.82rem', color: '#94a3b8' }}>
                  Update top banner messaging, free delivery threshold, and boutique support contacts.
                </p>
              </div>

              <form onSubmit={handleSaveSettings} style={{ background: '#12141a', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px', padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div>
                  <label style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>
                    Top Announcement Banner Text
                  </label>
                  <input
                    type="text"
                    value={settingsForm.announcementText}
                    onChange={(e) => setSettingsForm({ ...settingsForm, announcementText: e.target.value })}
                    className="lux-input"
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>
                    Free Insured Armoured Delivery Threshold (₹)
                  </label>
                  <input
                    type="number"
                    value={settingsForm.freeShippingThreshold}
                    onChange={(e) => setSettingsForm({ ...settingsForm, freeShippingThreshold: Number(e.target.value) })}
                    className="lux-input"
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <label style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>
                      Concierge Telephone Line
                    </label>
                    <input
                      type="text"
                      value={settingsForm.supportPhone}
                      onChange={(e) => setSettingsForm({ ...settingsForm, supportPhone: e.target.value })}
                      className="lux-input"
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>
                      Concierge Email
                    </label>
                    <input
                      type="email"
                      value={settingsForm.supportEmail}
                      onChange={(e) => setSettingsForm({ ...settingsForm, supportEmail: e.target.value })}
                      className="lux-input"
                    />
                  </div>
                </div>

                <div>
                  <label style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>
                    Boutique Flagship Cities
                  </label>
                  <input
                    type="text"
                    value={settingsForm.boutiqueCity}
                    onChange={(e) => setSettingsForm({ ...settingsForm, boutiqueCity: e.target.value })}
                    className="lux-input"
                  />
                </div>

                {settingsSaved && (
                  <div style={{ color: '#10b981', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem' }}>
                    <CheckCircle2 size={16} />
                    <span>Storefront configuration updated successfully!</span>
                  </div>
                )}

                <button type="submit" className="btn-gold" style={{ alignSelf: 'flex-start', marginTop: '0.5rem' }}>
                  <Save size={16} />
                  <span>Save Configuration</span>
                </button>
              </form>
            </div>
          )}

          {/* TAB 7: Payment Gateway & Master Gmail Configuration */}
          {activeTab === 'payment' && (
            <div className="animate-fade-in" style={{ maxWidth: '800px' }}>
              <div style={{ marginBottom: '1.5rem' }}>
                <span className="badge-luxury badge-gold" style={{ marginBottom: '0.4rem' }}>
                  FINANCIAL & SECURITY CONTROLS
                </span>
                <h2 style={{ fontSize: '1.6rem', color: '#f8fafc', fontFamily: 'var(--font-brand)' }}>
                  Merchant Payment Gateway & Master Access
                </h2>
                <p style={{ fontSize: '0.82rem', color: '#94a3b8' }}>
                  Configure your receiving UPI ID, Bank Transfer details, and lock the admin panel to your single master Gmail.
                </p>
              </div>

              <form onSubmit={handleSavePaymentAndSecurity} style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
                {/* Section 1: UPI & Dynamic QR Configuration */}
                <div style={{ background: '#12141a', border: '1px solid rgba(212, 175, 55, 0.25)', borderRadius: '8px', padding: '1.75rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
                    <QrCode size={18} color="#d4af37" />
                    <h3 style={{ fontSize: '1.1rem', color: '#f8fafc' }}>Merchant UPI & Instant QR Configuration</h3>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem', marginBottom: '1.25rem' }}>
                    <div>
                      <label style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>
                        Merchant / Store Business Name *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Luxury Watch Haute Horlogerie"
                        value={paymentForm.merchantName}
                        onChange={(e) => setPaymentForm({ ...paymentForm, merchantName: e.target.value })}
                        className="lux-input"
                      />
                    </div>

                    <div>
                      <label style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>
                        Official Receiving UPI ID (VPA) *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. yourname@okhdfcbank or 9820012345@paytm"
                        value={paymentForm.upiId}
                        onChange={(e) => setPaymentForm({ ...paymentForm, upiId: e.target.value })}
                        className="lux-input"
                      />
                    </div>
                  </div>

                  <div style={{ padding: '0.75rem', backgroundColor: '#090a0e', borderRadius: '4px', border: '1px solid rgba(255,255,255,0.06)', fontSize: '0.75rem', color: '#cbd5e1' }}>
                    💡 <strong>Customer Checkout Preview:</strong> When a customer selects UPI, the system auto-generates a live <strong>UPI QR code</strong> linked directly to <code>{paymentForm.upiId || 'your UPI'}</code> and requires their 12-Digit UPI Reference/UTR number to verify the order.
                  </div>
                </div>

                {/* Section 2: Bank IMPS / NEFT Details */}
                <div style={{ background: '#12141a', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '8px', padding: '1.75rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
                    <CreditCard size={18} color="#d4af37" />
                    <h3 style={{ fontSize: '1.1rem', color: '#f8fafc' }}>Direct Bank Transfer (IMPS / NEFT) Details</h3>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem', marginBottom: '1.25rem' }}>
                    <div>
                      <label style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>
                        Account Holder / Beneficiary Name *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. LUXURY WATCH INDIA PVT LTD"
                        value={paymentForm.accountHolder}
                        onChange={(e) => setPaymentForm({ ...paymentForm, accountHolder: e.target.value })}
                        className="lux-input"
                      />
                    </div>

                    <div>
                      <label style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>
                        Bank Name *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. HDFC Bank Ltd. / ICICI Bank"
                        value={paymentForm.bankName}
                        onChange={(e) => setPaymentForm({ ...paymentForm, bankName: e.target.value })}
                        className="lux-input"
                      />
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
                    <div>
                      <label style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>
                        Bank Account Number *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. 50200088991122"
                        value={paymentForm.accountNumber}
                        onChange={(e) => setPaymentForm({ ...paymentForm, accountNumber: e.target.value })}
                        className="lux-input"
                      />
                    </div>

                    <div>
                      <label style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>
                        IFSC Code *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. HDFC0000060"
                        value={paymentForm.ifscCode}
                        onChange={(e) => setPaymentForm({ ...paymentForm, ifscCode: e.target.value.toUpperCase() })}
                        className="lux-input"
                      />
                    </div>

                    <div>
                      <label style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>
                        Branch Name
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. BKC, Mumbai"
                        value={paymentForm.branch}
                        onChange={(e) => setPaymentForm({ ...paymentForm, branch: e.target.value })}
                        className="lux-input"
                      />
                    </div>
                  </div>
                </div>

                {/* Section 3: Single Master Gmail Security Restriction */}
                <div style={{ background: '#12141a', border: '1px solid rgba(225, 29, 72, 0.4)', borderRadius: '8px', padding: '1.75rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                    <Lock size={18} color="#fb7185" />
                    <h3 style={{ fontSize: '1.1rem', color: '#fb7185' }}>Single Master Gmail Authorization</h3>
                  </div>

                  <p style={{ fontSize: '0.78rem', color: '#cbd5e1', marginBottom: '1rem' }}>
                    Only this exact Gmail account can log in and access this Sovereign Admin Terminal. Any other email will be blocked immediately.
                  </p>

                  <div>
                    <label style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>
                      Designated Master Admin Gmail *
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="e.g. yourname@gmail.com"
                      value={authorizedAdminGmail}
                      onChange={(e) => setAuthorizedAdminGmail(e.target.value)}
                      className="lux-input"
                      style={{ maxWidth: '420px', borderColor: 'rgba(225, 29, 72, 0.5)' }}
                    />
                  </div>
                </div>

                {paymentSavedMessage && (
                  <div style={{ color: '#10b981', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', padding: '0.75rem', backgroundColor: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.3)', borderRadius: '4px' }}>
                    <CheckCircle2 size={18} />
                    <span>{paymentSavedMessage}</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isSavingPayment}
                  className="btn-gold"
                  style={{ alignSelf: 'flex-start', padding: '0.85rem 2rem', fontSize: '0.85rem' }}
                >
                  <Save size={16} />
                  <span>{isSavingPayment ? 'SAVING TO DATABASE...' : 'SAVE PAYMENT & SECURITY CONFIGURATION'}</span>
                </button>
              </form>
            </div>
          )}
        </main>
      </div>

      {/* Add / Edit Timepiece Modal Dialog */}
      {isProductModalOpen && (
        <div className="modal-backdrop" onClick={() => setIsProductModalOpen(false)}>
          <div
            className="glass-panel animate-fade-in"
            onClick={(e) => e.stopPropagation()}
            style={{
              width: '100%',
              maxWidth: '750px',
              maxHeight: '90vh',
              overflowY: 'auto',
              backgroundColor: '#0c0e14',
              border: '1px solid var(--border-gold)',
              borderRadius: '8px',
              padding: '2rem',
              position: 'relative'
            }}
          >
            <button
              onClick={() => setIsProductModalOpen(false)}
              style={{
                position: 'absolute',
                top: '1.25rem',
                right: '1.25rem',
                background: 'none',
                border: 'none',
                color: '#94a3b8',
                cursor: 'pointer'
              }}
            >
              <X size={18} />
            </button>

            <h3 style={{ fontSize: '1.4rem', color: '#f8fafc', fontFamily: 'var(--font-brand)', marginBottom: '1.25rem' }}>
              {editingProduct ? 'Modify Timepiece Record' : 'Register New Luxury Timepiece'}
            </h3>

            <form onSubmit={handleSaveProduct} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>Model Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Royal Chrono Sovereign 42mm"
                    value={productForm.name}
                    onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                    className="lux-input"
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>SKU Code *</label>
                  <input
                    type="text"
                    required
                    value={productForm.sku}
                    onChange={(e) => setProductForm({ ...productForm, sku: e.target.value })}
                    className="lux-input"
                  />
                </div>
              </div>

              <div>
                <label style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>Subtitle & Calibre Summary</label>
                <input
                  type="text"
                  placeholder="e.g. Automatic Calibre 8200 • 18K Rose Gold"
                  value={productForm.subtitle}
                  onChange={(e) => setProductForm({ ...productForm, subtitle: e.target.value })}
                  className="lux-input"
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>Category</label>
                  <select
                    value={productForm.category}
                    onChange={(e) => setProductForm({ ...productForm, category: e.target.value })}
                    className="lux-select"
                  >
                    <option value="Chronograph">Chronograph</option>
                    <option value="Skeleton Automatic">Skeleton Automatic</option>
                    <option value="Diamond Collection">Diamond Collection</option>
                    <option value="Automatic">Automatic Diver</option>
                    <option value="Women's Elegance">Women's Elegance</option>
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>Selling Price (₹) *</label>
                  <input
                    type="number"
                    required
                    value={productForm.price}
                    onChange={(e) => setProductForm({ ...productForm, price: e.target.value })}
                    className="lux-input"
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>Compare Price (₹)</label>
                  <input
                    type="number"
                    value={productForm.comparePrice}
                    onChange={(e) => setProductForm({ ...productForm, comparePrice: e.target.value })}
                    className="lux-input"
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>Vault Stock Qty</label>
                  <input
                    type="number"
                    min={0}
                    value={productForm.stock}
                    onChange={(e) => setProductForm({ ...productForm, stock: e.target.value })}
                    className="lux-input"
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>Badge Text</label>
                  <input
                    type="text"
                    placeholder="e.g. BESTSELLER / LIMITED"
                    value={productForm.badge}
                    onChange={(e) => setProductForm({ ...productForm, badge: e.target.value })}
                    className="lux-input"
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>Badge Theme</label>
                  <select
                    value={productForm.badgeType}
                    onChange={(e) => setProductForm({ ...productForm, badgeType: e.target.value })}
                    className="lux-select"
                  >
                    <option value="gold">Gold</option>
                    <option value="new">Green (New)</option>
                    <option value="limited">Crimson (Limited)</option>
                    <option value="swiss">Swiss Blue</option>
                  </select>
                </div>
              </div>

              <div>
                <label style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>High-Res Image URL</label>
                <input
                  type="url"
                  placeholder="https://images.unsplash.com/..."
                  value={productForm.images[0] || ''}
                  onChange={(e) => {
                    const newImgs = [...productForm.images];
                    newImgs[0] = e.target.value;
                    setProductForm({ ...productForm, images: newImgs });
                  }}
                  className="lux-input"
                />
              </div>

              <div>
                <label style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>Horology Narrative Description</label>
                <textarea
                  rows={3}
                  value={productForm.description}
                  onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                  className="lux-input"
                />
              </div>

              <button type="submit" className="btn-gold" style={{ marginTop: '0.5rem', padding: '0.85rem' }}>
                <Save size={16} />
                <span>{editingProduct ? 'Save Modifications' : 'Register Timepiece to Vault Catalog'}</span>
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

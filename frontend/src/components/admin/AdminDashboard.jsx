import React, { useState, useEffect } from 'react';
import { useStore } from '../../context/StoreContext';
import { useAdminAuth } from '../../context/AdminAuthContext';
import {
  productsAPI, brandsAPI, categoriesAPI, ordersAPI,
  couponsAPI, reviewsAPI, analyticsAPI, homepageAPI, settingsAPI, getImageUrl
} from '../../services/api';
import {
  BarChart3, Package, ShoppingBag, Tag, Settings, Activity,
  Plus, Trash2, Edit, CheckCircle2, Truck, DollarSign, Users,
  Eye, LogOut, ArrowUpRight, ShieldCheck, Search, Sparkles,
  AlertCircle, Save, X, CreditCard, QrCode, Lock, Copy, RotateCcw,
  SlidersHorizontal, Layout, Check, ChevronDown, MessageSquare
} from 'lucide-react';

export const AdminDashboard = ({ onBackToStore }) => {
  const { refreshStoreData } = useStore();
  const { adminUser, logoutAdmin } = useAdminAuth();

  const [activeTab, setActiveTab] = useState('overview'); // overview, products, brands, categories, inventory, orders, customers, reviews, cms, settings
  const [loading, setLoading] = useState(false);
  const [metrics, setMetrics] = useState(null);
  const [productsList, setProductsList] = useState([]);
  const [brandsList, setBrandsList] = useState([]);
  const [categoriesList, setCategoriesList] = useState([]);
  const [ordersList, setOrdersList] = useState([]);
  const [customersList, setCustomersList] = useState([]);
  const [couponsList, setCouponsList] = useState([]);
  const [reviewsList, setReviewsList] = useState([]);
  const [activityList, setActivityList] = useState([]);
  const [cmsContent, setCmsContent] = useState(null);
  const [paymentConfig, setPaymentConfig] = useState(null);
  const [storeConfig, setStoreConfig] = useState(null);

  // Search & Filters in Admin
  const [searchTerm, setSearchTerm] = useState('');
  const [orderStatusFilter, setOrderStatusFilter] = useState('All');

  // Product Modal State
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [productForm, setProductForm] = useState({
    name: '',
    brand: 'Rolex',
    category: 'Dive & Sport',
    gender: 'Men',
    price: 5499,
    comparePrice: 6499,
    stock: 10,
    sku: `LW-${Date.now().toString().slice(-4)}`,
    badge: 'NEW ARRIVAL',
    badgeType: 'gold',
    images: ['/images/watches/rolex_submariner.jpg'],
    description: 'Masterfully crafted in 904L steel with sapphire crystal and Swiss automatic calibre.',
    specs: {
      movement: 'Swiss Automatic Calibre',
      powerReserve: '70 Hours',
      caseDiameter: '41 mm',
      caseMaterial: '904L Oystersteel',
      dialColor: 'Black',
      strapMaterial: 'Stainless Steel',
      waterResistance: '300 Meters / 30 ATM',
      crystal: 'Scratch-Resistant Sapphire',
      origin: 'Geneva, Switzerland'
    }
  });

  // Brand Modal & Management State
  const [isBrandModalOpen, setIsBrandModalOpen] = useState(false);
  const [editingBrand, setEditingBrand] = useState(null);
  const [brandToDelete, setBrandToDelete] = useState(null);
  const [isDeleteBrandModalOpen, setIsDeleteBrandModalOpen] = useState(false);
  const [isSavingBrand, setIsSavingBrand] = useState(false);
  const [brandForm, setBrandForm] = useState({
    name: '',
    slug: '',
    badge: 'OFFICIAL ICON',
    location: 'Geneva, Switzerland',
    established: '1905',
    featuredCollection: '',
    description: '',
    image: '/images/watches/rolex_submariner.jpg',
    imageAlt: '',
    filterTarget: '',
    displayOrder: 1,
    isActive: true
  });

  // Coupon Modal State
  const [isCouponModalOpen, setIsCouponModalOpen] = useState(false);
  const [couponForm, setCouponForm] = useState({
    code: '',
    discountPercent: 10,
    minSpend: 4000,
    description: ''
  });

  // Fetch all admin data
  const loadAdminData = async () => {
    setLoading(true);
    try {
      const results = await Promise.allSettled([
        analyticsAPI.getSummary(),
        productsAPI.getAll(),
        brandsAPI.getAll({ all: 'true' }),
        categoriesAPI.getAll(),
        ordersAPI.getAll(),
        couponsAPI.getAll(),
        reviewsAPI.getAll(),
        analyticsAPI.getActivity(),
        homepageAPI.getContent(),
        settingsAPI.getPaymentSettings(),
        settingsAPI.getStoreSettings(),
        settingsAPI.getAdminSecurity()
      ]);

      const [mRes, pRes, bRes, cRes, oRes, cpnRes, rRes, aRes, hpRes, payRes, setRes] = results;

      if (mRes.status === 'fulfilled' && mRes.value?.metrics) setMetrics(mRes.value);
      if (pRes.status === 'fulfilled' && pRes.value?.products) setProductsList(pRes.value.products);
      if (bRes.status === 'fulfilled' && bRes.value?.brands) setBrandsList(bRes.value.brands);
      if (cRes.status === 'fulfilled' && cRes.value?.categories) setCategoriesList(cRes.value.categories);
      if (oRes.status === 'fulfilled' && oRes.value?.orders) setOrdersList(oRes.value.orders);
      if (cpnRes.status === 'fulfilled' && cpnRes.value?.coupons) setCouponsList(cpnRes.value.coupons);
      if (rRes.status === 'fulfilled' && rRes.value?.reviews) setReviewsList(rRes.value.reviews);
      if (aRes.status === 'fulfilled' && aRes.value?.activities) setActivityList(aRes.value.activities);
      if (hpRes.status === 'fulfilled' && hpRes.value?.content) setCmsContent(hpRes.value.content);
      if (payRes.status === 'fulfilled' && payRes.value?.settings) setPaymentConfig(payRes.value.settings);
      if (setRes.status === 'fulfilled' && setRes.value?.settings) setStoreConfig(setRes.value.settings);
    } catch (err) {
      console.warn('[Admin] Sync error:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAdminData();
  }, []);

  // Product CRUD Handlers
  const handleSaveProduct = async (e) => {
    e.preventDefault();
    try {
      if (editingProduct) {
        await productsAPI.update(editingProduct.id, productForm);
      } else {
        await productsAPI.create(productForm);
      }
      setIsProductModalOpen(false);
      setEditingProduct(null);
      loadAdminData();
      refreshStoreData();
    } catch (err) {
      alert(err.message || 'Failed to save product');
    }
  };

  const handleDeleteProduct = async (id) => {
    if (!window.confirm('Are you sure you want to delete this timepiece from the vault catalog?')) return;
    try {
      await productsAPI.delete(id);
      loadAdminData();
      refreshStoreData();
    } catch (err) {
      alert(err.message || 'Failed to delete product');
    }
  };

  const handleUpdateStock = async (id, delta) => {
    try {
      await productsAPI.updateStock(id, { delta });
      loadAdminData();
      refreshStoreData();
    } catch (err) {
      alert(err.message || 'Failed to update stock');
    }
  };

  // Brand CRUD Handlers
  const handleOpenAddBrand = () => {
    setEditingBrand(null);
    setBrandForm({
      name: '',
      slug: '',
      badge: 'OFFICIAL ICON',
      location: 'Geneva, Switzerland',
      established: '1905',
      featuredCollection: '',
      description: '',
      image: '/images/watches/rolex_submariner.jpg',
      imageAlt: '',
      filterTarget: '',
      displayOrder: brandsList.length + 1,
      isActive: true
    });
    setIsBrandModalOpen(true);
  };

  const handleOpenEditBrand = (brand) => {
    setEditingBrand(brand);
    setBrandForm({
      name: brand.name || '',
      slug: brand.slug || '',
      badge: brand.badge || brand.tag || 'OFFICIAL ICON',
      location: brand.location || (brand.origin ? brand.origin.split('•')[0].trim() : ''),
      established: brand.established || brand.founded || '',
      featuredCollection: brand.featuredCollection || brand.model || brand.hallmark || '',
      description: brand.description || brand.subtitle || brand.tagline || '',
      image: brand.image || brand.bannerUrl || '/images/watches/rolex_submariner.jpg',
      imageAlt: brand.imageAlt || '',
      filterTarget: brand.filterTarget || brand.name || '',
      displayOrder: typeof brand.displayOrder === 'number' ? brand.displayOrder : 1,
      isActive: brand.isActive !== false && brand.active !== false
    });
    setIsBrandModalOpen(true);
  };

  const handleSaveBrand = async (e) => {
    e.preventDefault();
    if (!brandForm.name || !brandForm.name.trim()) {
      alert('Brand name is required');
      return;
    }
    setIsSavingBrand(true);
    try {
      const cleanName = brandForm.name.trim();
      const generatedSlug = brandForm.slug
        ? brandForm.slug.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
        : cleanName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

      const payload = {
        ...brandForm,
        name: cleanName,
        slug: generatedSlug,
        badge: brandForm.badge || 'OFFICIAL ICON',
        tag: brandForm.badge || 'OFFICIAL ICON',
        location: brandForm.location || 'Geneva, Switzerland',
        established: brandForm.established || '',
        founded: brandForm.established || '',
        origin: brandForm.established ? `${brandForm.location || 'Geneva, Switzerland'} • Est. ${brandForm.established}` : (brandForm.location || 'Geneva, Switzerland'),
        featuredCollection: brandForm.featuredCollection || '',
        model: brandForm.featuredCollection || '',
        description: brandForm.description || '',
        subtitle: brandForm.description || '',
        image: brandForm.image || '/images/watches/rolex_submariner.jpg',
        imageAlt: brandForm.imageAlt || `${cleanName} Watch Collection`,
        filterTarget: brandForm.filterTarget || cleanName,
        displayOrder: Number(brandForm.displayOrder) || 1,
        active: Boolean(brandForm.isActive),
        isActive: Boolean(brandForm.isActive)
      };

      if (editingBrand) {
        await brandsAPI.update(editingBrand.id, payload);
      } else {
        await brandsAPI.create(payload);
      }
      setIsBrandModalOpen(false);
      setEditingBrand(null);
      await loadAdminData();
      refreshStoreData();
    } catch (err) {
      alert(err.message || 'Failed to save brand');
    } finally {
      setIsSavingBrand(false);
    }
  };

  const handlePromptDeleteBrand = (brand) => {
    setBrandToDelete(brand);
    setIsDeleteBrandModalOpen(true);
  };

  const handleConfirmDeleteBrand = async () => {
    if (!brandToDelete) return;
    try {
      await brandsAPI.delete(brandToDelete.id);
      setIsDeleteBrandModalOpen(false);
      setBrandToDelete(null);
      await loadAdminData();
      refreshStoreData();
    } catch (err) {
      alert(err.message || 'Failed to delete brand');
    }
  };

  const handleToggleBrandStatus = async (brand) => {
    try {
      const currentActive = brand.isActive !== false && brand.active !== false;
      await brandsAPI.update(brand.id, { isActive: !currentActive, active: !currentActive });
      await loadAdminData();
      refreshStoreData();
    } catch (err) {
      alert(err.message || 'Failed to toggle brand status');
    }
  };

  const handleAdjustBrandOrder = async (brand, delta) => {
    try {
      const currentOrder = typeof brand.displayOrder === 'number' ? brand.displayOrder : 1;
      const newOrder = Math.max(1, currentOrder + delta);
      await brandsAPI.update(brand.id, { displayOrder: newOrder });
      await loadAdminData();
      refreshStoreData();
    } catch (err) {
      alert(err.message || 'Failed to update display order');
    }
  };

  // Order Status Handler
  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    try {
      await ordersAPI.updateStatus(orderId, newStatus);
      loadAdminData();
      refreshStoreData();
    } catch (err) {
      alert(err.message || 'Failed to update order status');
    }
  };

  // Coupon CRUD Handlers
  const handleSaveCoupon = async (e) => {
    e.preventDefault();
    try {
      await couponsAPI.create(couponForm);
      setIsCouponModalOpen(false);
      loadAdminData();
      refreshStoreData();
    } catch (err) {
      alert(err.message || 'Failed to create coupon');
    }
  };

  const handleDeleteCoupon = async (code) => {
    if (!window.confirm(`Delete coupon code "${code}"?`)) return;
    try {
      await couponsAPI.delete(code);
      loadAdminData();
      refreshStoreData();
    } catch (err) {
      alert(err.message || 'Failed to delete coupon');
    }
  };

  // CMS Update Handler
  const handleSaveCms = async (e) => {
    e.preventDefault();
    try {
      await homepageAPI.updateContent(cmsContent);
      alert('Homepage CMS content updated successfully!');
      refreshStoreData();
    } catch (err) {
      alert(err.message || 'Failed to update CMS content');
    }
  };

  // Settings Update Handler
  const handleSaveSettings = async (e) => {
    e.preventDefault();
    try {
      await settingsAPI.updatePaymentSettings(paymentConfig);
      await settingsAPI.updateStoreSettings(storeConfig);
      alert('Store and payment gateway settings updated successfully!');
      refreshStoreData();
    } catch (err) {
      alert(err.message || 'Failed to update settings');
    }
  };

  const filteredOrders = ordersList.filter(o => {
    if (orderStatusFilter !== 'All' && o.orderStatus !== orderStatusFilter) return false;
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      return (
        o.id?.toLowerCase().includes(q) ||
        o.customer?.fullName?.toLowerCase().includes(q) ||
        o.customer?.email?.toLowerCase().includes(q) ||
        o.trackingNumber?.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div style={{ minHeight: '100vh', background: '#0b0f19', color: '#f8fafc', display: 'flex', flexDirection: 'column' }}>
      {/* Top Admin Navigation Bar */}
      <header style={{
        background: '#111827',
        borderBottom: '1px solid #1f2937',
        padding: '0.85rem 1.5rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '36px',
            height: '36px',
            borderRadius: '6px',
            background: 'rgba(212, 175, 55, 0.15)',
            border: '1px solid #d4af37',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <ShieldCheck size={20} color="#f3e5ab" />
          </div>
          <div>
            <div style={{ fontSize: '0.65rem', letterSpacing: '0.15em', color: '#d4af37', fontWeight: 700, textTransform: 'uppercase' }}>
              HAUTE HORLOGERIE MASTER ATELIER
            </div>
            <h1 style={{ fontFamily: 'var(--font-brand)', fontSize: '1.1rem', margin: 0, color: '#ffffff', letterSpacing: '0.04em' }}>
              LUXURY WATCH ADMIN CONTROL SUITE
            </h1>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ fontSize: '0.78rem', color: '#94a3b8' }}>
            Authenticated: <strong style={{ color: '#f3e5ab' }}>{adminUser?.email || 'admin@luxurywatch.com'}</strong>
          </div>
          <button
            onClick={onBackToStore}
            className="btn-outline-gold"
            style={{ padding: '6px 14px', fontSize: '0.75rem', background: '#1f2937' }}
          >
            <Eye size={14} />
            <span>Storefront</span>
          </button>
          <button
            onClick={logoutAdmin}
            style={{
              background: 'none',
              border: '1px solid #dc2626',
              color: '#f87171',
              padding: '6px 12px',
              borderRadius: '4px',
              fontSize: '0.75rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <LogOut size={13} />
            <span>Log Out</span>
          </button>
        </div>
      </header>

      {/* Main Admin Layout */}
      <div className="admin-layout" style={{ display: 'flex', flex: 1 }}>
        {/* Sidebar Navigation */}
        <aside className="admin-sidebar">
          {[
            { id: 'overview', label: 'Dashboard Overview', icon: BarChart3 },
            { id: 'products', label: 'Products Vault', icon: Package },
            { id: 'brands', label: 'Brands & Collections', icon: Sparkles },
            { id: 'inventory', label: 'Stock & Inventory', icon: SlidersHorizontal },
            { id: 'orders', label: 'Consignments & Orders', icon: ShoppingBag },
            { id: 'coupons', label: 'VIP Promotion Codes', icon: Tag },
            { id: 'reviews', label: 'Review Moderation', icon: MessageSquare },
            { id: 'cms', label: 'Homepage CMS', icon: Layout },
            { id: 'settings', label: 'Store & Payment Settings', icon: Settings }
          ].map(tab => {
            const Icon = tab.icon;
            const isSelected = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '9px 12px',
                  borderRadius: '6px',
                  border: isSelected ? '1px solid #d4af37' : '1px solid transparent',
                  background: isSelected ? 'rgba(212, 175, 55, 0.12)' : 'transparent',
                  color: isSelected ? '#f3e5ab' : '#94a3b8',
                  fontSize: '0.8rem',
                  fontWeight: isSelected ? 700 : 500,
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'all 0.15s ease'
                }}
              >
                <Icon size={16} color={isSelected ? '#d4af37' : '#94a3b8'} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </aside>

        {/* Content Area */}
        <main className="admin-content">
          {/* TAB 1: Overview */}
          {activeTab === 'overview' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <div>
                  <h2 style={{ fontFamily: 'var(--font-brand)', fontSize: '1.4rem', margin: 0, color: '#ffffff' }}>
                    FINANCIAL & CONSIGNMENT METRICS
                  </h2>
                  <p style={{ fontSize: '0.78rem', color: '#94a3b8', margin: '4px 0 0 0' }}>
                    Live atelier statistics synchronized with Geneva database engine.
                  </p>
                </div>
                <button onClick={loadAdminData} className="btn-outline-gold" style={{ padding: '6px 14px', fontSize: '0.75rem' }}>
                  <RotateCcw size={13} />
                  <span>Refresh Metrics</span>
                </button>
              </div>

              {/* KPI Cards */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1.75rem' }}>
                <div style={{ background: '#111827', border: '1px solid #1f2937', padding: '1.25rem', borderRadius: '8px' }}>
                  <div style={{ fontSize: '0.72rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Total Revenue</div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#f3e5ab', marginTop: '6px' }}>
                    ₹{(metrics?.metrics?.totalRevenue || 0).toLocaleString('en-IN')}
                  </div>
                  <div style={{ fontSize: '0.7rem', color: '#16a34a', marginTop: '4px' }}>Insured allocations</div>
                </div>

                <div style={{ background: '#111827', border: '1px solid #1f2937', padding: '1.25rem', borderRadius: '8px' }}>
                  <div style={{ fontSize: '0.72rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Total Orders</div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#ffffff', marginTop: '6px' }}>
                    {metrics?.metrics?.totalOrders || ordersList.length}
                  </div>
                  <div style={{ fontSize: '0.7rem', color: '#d4af37', marginTop: '4px' }}>{metrics?.metrics?.pendingOrders || 0} pending dispatch</div>
                </div>

                <div style={{ background: '#111827', border: '1px solid #1f2937', padding: '1.25rem', borderRadius: '8px' }}>
                  <div style={{ fontSize: '0.72rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Vault Catalog</div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#ffffff', marginTop: '6px' }}>
                    {productsList.length} Timepieces
                  </div>
                  <div style={{ fontSize: '0.7rem', color: '#94a3b8', marginTop: '4px' }}>Across {brandsList.length} prestige brands</div>
                </div>

                <div style={{ background: '#111827', border: '1px solid #1f2937', padding: '1.25rem', borderRadius: '8px' }}>
                  <div style={{ fontSize: '0.72rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Low Stock Alerts</div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 700, color: metrics?.metrics?.lowStockCount > 0 ? '#f43f5e' : '#16a34a', marginTop: '6px' }}>
                    {metrics?.metrics?.lowStockCount || 0}
                  </div>
                  <div style={{ fontSize: '0.7rem', color: '#94a3b8', marginTop: '4px' }}>Stock ≤ 5 units</div>
                </div>
              </div>

              {/* Recent Orders & Activity Table */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '1.5rem' }}>
                <div style={{ background: '#111827', border: '1px solid #1f2937', borderRadius: '8px', padding: '1.25rem' }}>
                  <h3 style={{ fontSize: '0.92rem', color: '#ffffff', marginBottom: '1rem', fontWeight: 600 }}>Recent Consignments</h3>
                  {ordersList.slice(0, 5).map(o => (
                    <div key={o.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid #1f2937', fontSize: '0.8rem' }}>
                      <div>
                        <div style={{ fontWeight: 600, color: '#f3e5ab' }}>#{o.id}</div>
                        <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>{o.customer?.fullName} • {o.customer?.city}</div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontWeight: 700, color: '#ffffff' }}>₹{(o.total || 0).toLocaleString('en-IN')}</div>
                        <span style={{ fontSize: '0.65rem', padding: '2px 6px', borderRadius: '4px', background: 'rgba(212, 175, 55, 0.15)', color: '#d4af37' }}>
                          {o.orderStatus}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                <div style={{ background: '#111827', border: '1px solid #1f2937', borderRadius: '8px', padding: '1.25rem' }}>
                  <h3 style={{ fontSize: '0.92rem', color: '#ffffff', marginBottom: '1rem', fontWeight: 600 }}>Live Activity Feed</h3>
                  {activityList.slice(0, 6).map(act => (
                    <div key={act.id} style={{ display: 'flex', gap: '10px', padding: '8px 0', borderBottom: '1px solid #1f2937', fontSize: '0.78rem' }}>
                      <Activity size={15} color="#d4af37" style={{ flexShrink: 0, marginTop: '2px' }} />
                      <div>
                        <div style={{ color: '#e2e8f0' }}>{act.text}</div>
                        <div style={{ fontSize: '0.68rem', color: '#64748b' }}>{act.time}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: Products Vault */}
          {activeTab === 'products' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                <h2 style={{ fontFamily: 'var(--font-brand)', fontSize: '1.3rem', margin: 0, color: '#ffffff' }}>
                  MASTERPIECE CATALOG MANAGEMENT ({productsList.length})
                </h2>
                <button
                  onClick={() => {
                    setEditingProduct(null);
                    setProductForm({
                      name: '',
                      brand: 'Rolex',
                      category: 'Dive & Sport',
                      gender: 'Men',
                      price: 4999,
                      comparePrice: 5999,
                      stock: 5,
                      sku: `LW-${Date.now().toString().slice(-4)}`,
                      images: ['/images/watches/rolex_submariner.jpg'],
                      description: 'Swiss certified automatic chronometer.'
                    });
                    setIsProductModalOpen(true);
                  }}
                  className="btn-gold"
                  style={{ padding: '8px 16px', fontSize: '0.8rem' }}
                >
                  <Plus size={15} />
                  <span>ADD TIMEPIECE</span>
                </button>
              </div>

              <div className="admin-table-container" style={{ background: '#111827', border: '1px solid #1f2937', borderRadius: '8px', overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem', textAlign: 'left' }}>
                  <thead>
                    <tr style={{ background: '#1f2937', color: '#94a3b8', borderBottom: '1px solid #374151' }}>
                      <th style={{ padding: '10px 14px' }}>Product</th>
                      <th style={{ padding: '10px 14px' }}>Brand</th>
                      <th style={{ padding: '10px 14px' }}>SKU</th>
                      <th style={{ padding: '10px 14px' }}>Price</th>
                      <th style={{ padding: '10px 14px' }}>Stock</th>
                      <th style={{ padding: '10px 14px', textAlign: 'right' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {productsList.map(prod => (
                      <tr key={prod.id} style={{ borderBottom: '1px solid #1f2937' }}>
                        <td style={{ padding: '10px 14px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <img src={getImageUrl(prod.images?.[0])} alt={prod.name} style={{ width: '36px', height: '36px', borderRadius: '4px', objectFit: 'cover' }} />
                          <div>
                            <div style={{ fontWeight: 600, color: '#ffffff' }}>{prod.name}</div>
                            <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>{prod.category}</div>
                          </div>
                        </td>
                        <td style={{ padding: '10px 14px', color: '#f3e5ab' }}>{prod.brand}</td>
                        <td style={{ padding: '10px 14px', color: '#94a3b8' }}>{prod.sku}</td>
                        <td style={{ padding: '10px 14px', fontWeight: 700, color: '#ffffff' }}>₹{prod.price?.toLocaleString('en-IN')}</td>
                        <td style={{ padding: '10px 14px' }}>
                          <span style={{ color: prod.stock <= 3 ? '#f43f5e' : '#16a34a', fontWeight: 600 }}>{prod.stock} units</span>
                        </td>
                        <td style={{ padding: '10px 14px', textAlign: 'right' }}>
                          <button
                            onClick={() => {
                              setEditingProduct(prod);
                              setProductForm(prod);
                              setIsProductModalOpen(true);
                            }}
                            style={{ background: 'none', border: 'none', color: '#d4af37', cursor: 'pointer', marginRight: '8px' }}
                          >
                            <Edit size={15} />
                          </button>
                          <button
                            onClick={() => handleDeleteProduct(prod.id)}
                            style={{ background: 'none', border: 'none', color: '#f43f5e', cursor: 'pointer' }}
                          >
                            <Trash2 size={15} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 3: Brands & Collections Management */}
          {activeTab === 'brands' && (
            <div>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '1rem',
                marginBottom: '1.5rem'
              }}>
                <div>
                  <h2 style={{ fontFamily: 'var(--font-brand)', fontSize: '1.4rem', margin: 0, color: '#ffffff' }}>
                    BRANDS & COLLECTIONS
                  </h2>
                  <p style={{ fontSize: '0.78rem', color: '#94a3b8', margin: '4px 0 0 0' }}>
                    Manage luxury brand cards, collections, badges, and storefront display ordering.
                  </p>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ display: 'flex', gap: '6px', fontSize: '0.72rem' }}>
                    <span style={{ background: '#1f2937', color: '#94a3b8', padding: '5px 10px', borderRadius: '4px' }}>
                      Total: <strong style={{ color: '#ffffff' }}>{brandsList.length}</strong>
                    </span>
                    <span style={{ background: 'rgba(22, 163, 74, 0.15)', color: '#4ade80', padding: '5px 10px', borderRadius: '4px', border: '1px solid rgba(22, 163, 74, 0.3)' }}>
                      Active: <strong>{brandsList.filter(b => b.isActive !== false && b.active !== false).length}</strong>
                    </span>
                  </div>

                  <button
                    onClick={handleOpenAddBrand}
                    className="btn-gold"
                    style={{ padding: '8px 16px', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '6px' }}
                  >
                    <Plus size={15} />
                    <span>+ Add New Brand</span>
                  </button>
                </div>
              </div>

              {/* Brands Table */}
              <div className="admin-table-container" style={{ background: '#111827', border: '1px solid #1f2937', borderRadius: '8px', overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem', textAlign: 'left' }}>
                  <thead>
                    <tr style={{ background: '#1f2937', color: '#94a3b8' }}>
                      <th style={{ padding: '12px 16px' }}>Brand</th>
                      <th style={{ padding: '12px 16px' }}>Badge / Tag</th>
                      <th style={{ padding: '12px 16px' }}>Featured Collection</th>
                      <th style={{ padding: '12px 16px', textAlign: 'center' }}>Order</th>
                      <th style={{ padding: '12px 16px', textAlign: 'center' }}>Status</th>
                      <th style={{ padding: '12px 16px', textAlign: 'right' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {brandsList.length === 0 ? (
                      <tr>
                        <td colSpan={6} style={{ padding: '2.5rem', textAlign: 'center', color: '#64748b' }}>
                          No brands found. Click "+ Add New Brand" to add your first watch brand.
                        </td>
                      </tr>
                    ) : (
                      brandsList
                        .slice()
                        .sort((a, b) => (Number(a.displayOrder) || 0) - (Number(b.displayOrder) || 0))
                        .map(brand => {
                          const isAct = brand.isActive !== false && brand.active !== false;
                          const bgImg = brand.image || brand.bannerUrl || '/images/watches/rolex_submariner.jpg';
                          const locText = brand.origin || (brand.established ? `${brand.location || 'Switzerland'} • Est. ${brand.established}` : brand.location);

                          return (
                            <tr key={brand.id || brand.slug} style={{ borderBottom: '1px solid #1f2937' }}>
                              {/* Brand info */}
                              <td style={{ padding: '12px 16px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                  <img
                                    src={getImageUrl(bgImg)}
                                    alt={brand.name}
                                    onError={(e) => { e.target.src = '/images/watches/rolex_submariner.jpg'; }}
                                    style={{
                                      width: '42px',
                                      height: '42px',
                                      borderRadius: '6px',
                                      objectFit: 'cover',
                                      border: '1px solid rgba(212, 175, 55, 0.3)',
                                      background: '#0b0f19'
                                    }}
                                  />
                                  <div>
                                    <div style={{ fontWeight: 700, color: '#ffffff', fontSize: '0.88rem' }}>
                                      {brand.name}
                                    </div>
                                    <div style={{ fontSize: '0.7rem', color: '#94a3b8', marginTop: '2px' }}>
                                      {locText}
                                    </div>
                                  </div>
                                </div>
                              </td>

                              {/* Badge */}
                              <td style={{ padding: '12px 16px' }}>
                                <span style={{
                                  fontSize: '0.68rem',
                                  fontWeight: 700,
                                  background: 'rgba(212, 175, 55, 0.15)',
                                  color: '#f3e5ab',
                                  padding: '3px 8px',
                                  borderRadius: '4px',
                                  border: '1px solid rgba(212, 175, 55, 0.3)',
                                  letterSpacing: '0.05em'
                                }}>
                                  {brand.badge || brand.tag || 'ICON'}
                                </span>
                              </td>

                              {/* Featured Collection */}
                              <td style={{ padding: '12px 16px', maxWidth: '240px' }}>
                                <div style={{ color: '#cbd5e1', fontWeight: 600, fontSize: '0.78rem' }}>
                                  {brand.featuredCollection || brand.model || '—'}
                                </div>
                                <div style={{
                                  color: '#64748b',
                                  fontSize: '0.68rem',
                                  marginTop: '2px',
                                  whiteSpace: 'nowrap',
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis'
                                }}>
                                  {brand.description || brand.subtitle || ''}
                                </div>
                              </td>

                              {/* Order */}
                              <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                                  <button
                                    onClick={() => handleAdjustBrandOrder(brand, -1)}
                                    title="Move up"
                                    style={{
                                      background: '#1f2937',
                                      border: '1px solid #374151',
                                      color: '#94a3b8',
                                      borderRadius: '3px',
                                      width: '20px',
                                      height: '20px',
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'center',
                                      cursor: 'pointer',
                                      fontSize: '0.7rem'
                                    }}
                                  >
                                    ▲
                                  </button>
                                  <span style={{
                                    display: 'inline-block',
                                    minWidth: '28px',
                                    fontWeight: 700,
                                    color: '#f3e5ab',
                                    textAlign: 'center'
                                  }}>
                                    {brand.displayOrder}
                                  </span>
                                  <button
                                    onClick={() => handleAdjustBrandOrder(brand, 1)}
                                    title="Move down"
                                    style={{
                                      background: '#1f2937',
                                      border: '1px solid #374151',
                                      color: '#94a3b8',
                                      borderRadius: '3px',
                                      width: '20px',
                                      height: '20px',
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'center',
                                      cursor: 'pointer',
                                      fontSize: '0.7rem'
                                    }}
                                  >
                                    ▼
                                  </button>
                                </div>
                              </td>

                              {/* Status Toggle */}
                              <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                                <button
                                  onClick={() => handleToggleBrandStatus(brand)}
                                  style={{
                                    background: isAct ? 'rgba(22, 163, 74, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                                    border: isAct ? '1px solid rgba(22, 163, 74, 0.4)' : '1px solid rgba(239, 68, 68, 0.4)',
                                    color: isAct ? '#4ade80' : '#f87171',
                                    padding: '4px 10px',
                                    borderRadius: '50px',
                                    fontSize: '0.7rem',
                                    fontWeight: 700,
                                    cursor: 'pointer',
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '5px'
                                  }}
                                  title={isAct ? "Click to deactivate brand" : "Click to activate brand"}
                                >
                                  <span style={{
                                    width: '6px',
                                    height: '6px',
                                    borderRadius: '50%',
                                    background: isAct ? '#4ade80' : '#f87171'
                                  }} />
                                  <span>{isAct ? 'Active' : 'Inactive'}</span>
                                </button>
                              </td>

                              {/* Actions */}
                              <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                                <div style={{ display: 'inline-flex', gap: '8px' }}>
                                  <button
                                    onClick={() => handleOpenEditBrand(brand)}
                                    title="Edit Brand"
                                    style={{
                                      background: 'rgba(212, 175, 55, 0.1)',
                                      border: '1px solid rgba(212, 175, 55, 0.3)',
                                      color: '#d4af37',
                                      borderRadius: '4px',
                                      padding: '6px 10px',
                                      cursor: 'pointer',
                                      display: 'flex',
                                      alignItems: 'center',
                                      gap: '4px',
                                      fontSize: '0.72rem'
                                    }}
                                  >
                                    <Edit size={13} />
                                    <span>Edit</span>
                                  </button>

                                  <button
                                    onClick={() => handlePromptDeleteBrand(brand)}
                                    title="Delete Brand"
                                    style={{
                                      background: 'rgba(239, 68, 68, 0.1)',
                                      border: '1px solid rgba(239, 68, 68, 0.3)',
                                      color: '#f87171',
                                      borderRadius: '4px',
                                      padding: '6px 10px',
                                      cursor: 'pointer',
                                      display: 'flex',
                                      alignItems: 'center',
                                      gap: '4px',
                                      fontSize: '0.72rem'
                                    }}
                                  >
                                    <Trash2 size={13} />
                                    <span>Delete</span>
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 4: Inventory & Stock */}
          {activeTab === 'inventory' && (
            <div>
              <h2 style={{ fontFamily: 'var(--font-brand)', fontSize: '1.3rem', margin: '0 0 1.25rem 0', color: '#ffffff' }}>
                LIVE VAULT INVENTORY & STOCK CONTROLLER
              </h2>

              <div className="admin-table-container" style={{ background: '#111827', border: '1px solid #1f2937', borderRadius: '8px', overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem', textAlign: 'left' }}>
                  <thead>
                    <tr style={{ background: '#1f2937', color: '#94a3b8' }}>
                      <th style={{ padding: '10px 14px' }}>Timepiece</th>
                      <th style={{ padding: '10px 14px' }}>SKU</th>
                      <th style={{ padding: '10px 14px' }}>Current Stock</th>
                      <th style={{ padding: '10px 14px' }}>Quick Adjust</th>
                    </tr>
                  </thead>
                  <tbody>
                    {productsList.map(prod => (
                      <tr key={prod.id} style={{ borderBottom: '1px solid #1f2937' }}>
                        <td style={{ padding: '10px 14px', fontWeight: 600, color: '#ffffff' }}>{prod.name}</td>
                        <td style={{ padding: '10px 14px', color: '#94a3b8' }}>{prod.sku}</td>
                        <td style={{ padding: '10px 14px' }}>
                          <span style={{
                            padding: '3px 8px',
                            borderRadius: '4px',
                            background: prod.stock <= 3 ? 'rgba(244, 63, 94, 0.2)' : 'rgba(22, 163, 74, 0.2)',
                            color: prod.stock <= 3 ? '#f43f5e' : '#86efac',
                            fontWeight: 700
                          }}>
                            {prod.stock} Available
                          </span>
                        </td>
                        <td style={{ padding: '10px 14px', display: 'flex', gap: '6px' }}>
                          <button
                            onClick={() => handleUpdateStock(prod.id, 1)}
                            style={{ background: '#1f2937', border: '1px solid #374151', color: '#ffffff', padding: '4px 10px', borderRadius: '4px', cursor: 'pointer' }}
                          >
                            +1
                          </button>
                          <button
                            onClick={() => handleUpdateStock(prod.id, 5)}
                            style={{ background: '#1f2937', border: '1px solid #374151', color: '#ffffff', padding: '4px 10px', borderRadius: '4px', cursor: 'pointer' }}
                          >
                            +5
                          </button>
                          <button
                            onClick={() => handleUpdateStock(prod.id, -1)}
                            style={{ background: '#1f2937', border: '1px solid #374151', color: '#ffffff', padding: '4px 10px', borderRadius: '4px', cursor: 'pointer' }}
                          >
                            -1
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 5: Consignments & Orders */}
          {activeTab === 'orders' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                <h2 style={{ fontFamily: 'var(--font-brand)', fontSize: '1.3rem', margin: 0, color: '#ffffff' }}>
                  CONSIGNMENT ORDERS ({ordersList.length})
                </h2>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <input
                    type="text"
                    placeholder="Search order ID / client..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    style={{ background: '#111827', border: '1px solid #374151', color: '#ffffff', padding: '6px 12px', borderRadius: '4px', fontSize: '0.78rem' }}
                  />
                  <select
                    value={orderStatusFilter}
                    onChange={(e) => setOrderStatusFilter(e.target.value)}
                    style={{ background: '#111827', border: '1px solid #374151', color: '#ffffff', padding: '6px 12px', borderRadius: '4px', fontSize: '0.78rem' }}
                  >
                    <option value="All">All Statuses</option>
                    <option value="Confirmed">Confirmed</option>
                    <option value="Processing">Processing</option>
                    <option value="Packed">Packed</option>
                    <option value="Shipped">Shipped</option>
                    <option value="Out for Delivery">Out for Delivery</option>
                    <option value="Delivered">Delivered</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                </div>
              </div>

              <div className="admin-table-container" style={{ background: '#111827', border: '1px solid #1f2937', borderRadius: '8px', overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem', textAlign: 'left' }}>
                  <thead>
                    <tr style={{ background: '#1f2937', color: '#94a3b8' }}>
                      <th style={{ padding: '10px 14px' }}>Order ID</th>
                      <th style={{ padding: '10px 14px' }}>Customer</th>
                      <th style={{ padding: '10px 14px' }}>Timepieces</th>
                      <th style={{ padding: '10px 14px' }}>Amount</th>
                      <th style={{ padding: '10px 14px' }}>Tracking Number</th>
                      <th style={{ padding: '10px 14px' }}>Status Update</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredOrders.map(o => (
                      <tr key={o.id} style={{ borderBottom: '1px solid #1f2937' }}>
                        <td style={{ padding: '10px 14px', fontWeight: 700, color: '#f3e5ab' }}>#{o.id}</td>
                        <td style={{ padding: '10px 14px' }}>
                          <div style={{ fontWeight: 600, color: '#ffffff' }}>{o.customer?.fullName}</div>
                          <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>{o.customer?.email} • {o.customer?.city}</div>
                        </td>
                        <td style={{ padding: '10px 14px' }}>
                          {(o.items || []).map((it, i) => (
                            <div key={i} style={{ fontSize: '0.72rem', color: '#cbd5e1' }}>{it.name} (x{it.quantity})</div>
                          ))}
                        </td>
                        <td style={{ padding: '10px 14px', fontWeight: 700, color: '#ffffff' }}>₹{(o.total || 0).toLocaleString('en-IN')}</td>
                        <td style={{ padding: '10px 14px', color: '#d4af37', fontSize: '0.72rem' }}>{o.trackingNumber}</td>
                        <td style={{ padding: '10px 14px' }}>
                          <select
                            value={o.orderStatus}
                            onChange={(e) => handleUpdateOrderStatus(o.id, e.target.value)}
                            style={{ background: '#1f2937', border: '1px solid #374151', color: '#f3e5ab', padding: '4px 8px', borderRadius: '4px', fontSize: '0.72rem' }}
                          >
                            <option value="Confirmed">Confirmed</option>
                            <option value="Processing">Processing</option>
                            <option value="Packed">Packed</option>
                            <option value="Shipped">Shipped</option>
                            <option value="Out for Delivery">Out for Delivery</option>
                            <option value="Delivered">Delivered</option>
                            <option value="Cancelled">Cancelled</option>
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 6: VIP Coupons */}
          {activeTab === 'coupons' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                <h2 style={{ fontFamily: 'var(--font-brand)', fontSize: '1.3rem', margin: 0, color: '#ffffff' }}>
                  VIP PROMOTION CODES ({couponsList.length})
                </h2>
                <button
                  onClick={() => {
                    setCouponForm({ code: '', discountPercent: 10, minSpend: 4000, description: '' });
                    setIsCouponModalOpen(true);
                  }}
                  className="btn-gold"
                  style={{ padding: '8px 16px', fontSize: '0.8rem' }}
                >
                  <Plus size={15} />
                  <span>CREATE COUPON</span>
                </button>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
                {couponsList.map(cpn => (
                  <div key={cpn.code} style={{ background: '#111827', border: '1px solid #1f2937', borderRadius: '8px', padding: '1.25rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '1.1rem', fontWeight: 700, color: '#f3e5ab', letterSpacing: '0.05em' }}>{cpn.code}</span>
                      <button onClick={() => handleDeleteCoupon(cpn.code)} style={{ background: 'none', border: 'none', color: '#f43f5e', cursor: 'pointer' }}>
                        <Trash2 size={15} />
                      </button>
                    </div>
                    <div style={{ fontSize: '0.85rem', color: '#ffffff', fontWeight: 600, marginTop: '4px' }}>{cpn.discountPercent}% Discount</div>
                    <div style={{ fontSize: '0.72rem', color: '#94a3b8', marginTop: '4px' }}>Min. Spend: ₹{(cpn.minSpend || 0).toLocaleString('en-IN')}</div>
                    <div style={{ fontSize: '0.7rem', color: '#cbd5e1', marginTop: '6px' }}>{cpn.description}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 7: Homepage CMS */}
          {activeTab === 'cms' && cmsContent && (
            <form onSubmit={handleSaveCms} style={{ maxWidth: '640px' }}>
              <h2 style={{ fontFamily: 'var(--font-brand)', fontSize: '1.3rem', margin: '0 0 1.25rem 0', color: '#ffffff' }}>
                HOMEPAGE CMS & ANNOUNCEMENT BAR
              </h2>

              <div style={{ background: '#111827', border: '1px solid #1f2937', padding: '1.5rem', borderRadius: '8px', marginBottom: '1.5rem' }}>
                <h3 style={{ fontSize: '0.9rem', color: '#f3e5ab', marginBottom: '1rem', fontWeight: 600 }}>Top Announcement Bar</h3>
                <div style={{ marginBottom: '1rem' }}>
                  <label className="lux-label" style={{ color: '#94a3b8' }}>Announcement Text</label>
                  <input
                    type="text"
                    value={cmsContent.announcementBar?.text || ''}
                    onChange={(e) => setCmsContent({
                      ...cmsContent,
                      announcementBar: { ...cmsContent.announcementBar, text: e.target.value }
                    })}
                    className="lux-input"
                    style={{ background: '#0b0f19', color: '#ffffff', borderColor: '#374151' }}
                  />
                </div>
              </div>

              <div style={{ background: '#111827', border: '1px solid #1f2937', padding: '1.5rem', borderRadius: '8px', marginBottom: '1.5rem' }}>
                <h3 style={{ fontSize: '0.9rem', color: '#f3e5ab', marginBottom: '1rem', fontWeight: 600 }}>Cinematic Hero Banner</h3>
                <div style={{ marginBottom: '1rem' }}>
                  <label className="lux-label" style={{ color: '#94a3b8' }}>Hero Heading</label>
                  <textarea
                    rows={2}
                    value={cmsContent.hero?.heading || ''}
                    onChange={(e) => setCmsContent({
                      ...cmsContent,
                      hero: { ...cmsContent.hero, heading: e.target.value }
                    })}
                    className="lux-input"
                    style={{ background: '#0b0f19', color: '#ffffff', borderColor: '#374151' }}
                  />
                </div>
                <div style={{ marginBottom: '1rem' }}>
                  <label className="lux-label" style={{ color: '#94a3b8' }}>Hero Subheading</label>
                  <input
                    type="text"
                    value={cmsContent.hero?.subheading || ''}
                    onChange={(e) => setCmsContent({
                      ...cmsContent,
                      hero: { ...cmsContent.hero, subheading: e.target.value }
                    })}
                    className="lux-input"
                    style={{ background: '#0b0f19', color: '#ffffff', borderColor: '#374151' }}
                  />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <label className="lux-label" style={{ color: '#94a3b8' }}>Primary CTA Text</label>
                    <input
                      type="text"
                      value={cmsContent.hero?.ctaPrimaryText || ''}
                      onChange={(e) => setCmsContent({
                        ...cmsContent,
                        hero: { ...cmsContent.hero, ctaPrimaryText: e.target.value }
                      })}
                      className="lux-input"
                      style={{ background: '#0b0f19', color: '#ffffff', borderColor: '#374151' }}
                    />
                  </div>
                  <div>
                    <label className="lux-label" style={{ color: '#94a3b8' }}>Secondary CTA Text</label>
                    <input
                      type="text"
                      value={cmsContent.hero?.ctaSecondaryText || ''}
                      onChange={(e) => setCmsContent({
                        ...cmsContent,
                        hero: { ...cmsContent.hero, ctaSecondaryText: e.target.value }
                      })}
                      className="lux-input"
                      style={{ background: '#0b0f19', color: '#ffffff', borderColor: '#374151' }}
                    />
                  </div>
                </div>
              </div>

              <button type="submit" className="btn-gold" style={{ padding: '10px 24px' }}>
                <Save size={16} />
                <span>SAVE HOMEPAGE CMS</span>
              </button>
            </form>
          )}

          {/* TAB 8: Settings */}
          {activeTab === 'settings' && paymentConfig && storeConfig && (
            <form onSubmit={handleSaveSettings} style={{ maxWidth: '640px' }}>
              <h2 style={{ fontFamily: 'var(--font-brand)', fontSize: '1.3rem', margin: '0 0 1.25rem 0', color: '#ffffff' }}>
                STORE POLICY & RAZORPAY GATEWAY CONFIGURATION
              </h2>

              <div style={{ background: '#111827', border: '1px solid #1f2937', padding: '1.5rem', borderRadius: '8px', marginBottom: '1.5rem' }}>
                <h3 style={{ fontSize: '0.9rem', color: '#f3e5ab', marginBottom: '1rem', fontWeight: 600 }}>Payment Gateway (Razorpay)</h3>
                <div style={{ marginBottom: '1rem' }}>
                  <label className="lux-label" style={{ color: '#94a3b8' }}>Payment Mode</label>
                  <select
                    value={paymentConfig.paymentGatewayMode || 'test'}
                    onChange={(e) => setPaymentConfig({ ...paymentConfig, paymentGatewayMode: e.target.value })}
                    className="lux-input"
                    style={{ background: '#0b0f19', color: '#ffffff', borderColor: '#374151' }}
                  >
                    <option value="test">Test / Sandbox Mode</option>
                    <option value="live">Production / Live Mode</option>
                  </select>
                </div>
                <div style={{ marginBottom: '1rem' }}>
                  <label className="lux-label" style={{ color: '#94a3b8' }}>Razorpay Key ID</label>
                  <input
                    type="text"
                    value={paymentConfig.razorpayKeyId || ''}
                    onChange={(e) => setPaymentConfig({ ...paymentConfig, razorpayKeyId: e.target.value })}
                    className="lux-input"
                    style={{ background: '#0b0f19', color: '#ffffff', borderColor: '#374151' }}
                  />
                </div>
                <div style={{ marginBottom: '1rem' }}>
                  <label className="lux-label" style={{ color: '#94a3b8' }}>Razorpay Secret Key (Encrypted at rest)</label>
                  <input
                    type="password"
                    placeholder="••••••••••••••••"
                    value={paymentConfig.razorpayKeySecret || ''}
                    onChange={(e) => setPaymentConfig({ ...paymentConfig, razorpayKeySecret: e.target.value })}
                    className="lux-input"
                    style={{ background: '#0b0f19', color: '#ffffff', borderColor: '#374151' }}
                  />
                </div>
              </div>

              <button type="submit" className="btn-gold" style={{ padding: '10px 24px' }}>
                <Save size={16} />
                <span>SAVE CONFIGURATION</span>
              </button>
            </form>
          )}
        </main>
      </div>

      {/* Product Add/Edit Modal */}
      {isProductModalOpen && (
        <div style={{
          position: 'fixed',
          inset: 0,
          zIndex: 1200,
          background: 'rgba(0, 0, 0, 0.8)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '1rem'
        }}>
          <div style={{ background: '#111827', border: '1px solid #d4af37', borderRadius: '8px', padding: '1.5rem', width: '100%', maxWidth: '580px', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 style={{ fontFamily: 'var(--font-brand)', fontSize: '1.1rem', color: '#f3e5ab', margin: 0 }}>
                {editingProduct ? 'EDIT TIMEPIECE' : 'ADD NEW TIMEPIECE'}
              </h3>
              <button onClick={() => setIsProductModalOpen(false)} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveProduct}>
              <div style={{ marginBottom: '1rem' }}>
                <label className="lux-label" style={{ color: '#94a3b8' }}>Product Name *</label>
                <input
                  type="text"
                  required
                  value={productForm.name}
                  onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                  className="lux-input"
                  style={{ background: '#0b0f19', color: '#ffffff', borderColor: '#374151' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div>
                  <label className="lux-label" style={{ color: '#94a3b8' }}>Brand *</label>
                  <input
                    list="brands-datalist"
                    required
                    value={productForm.brand}
                    onChange={(e) => setProductForm({ ...productForm, brand: e.target.value })}
                    className="lux-input"
                    style={{ background: '#0b0f19', color: '#ffffff', borderColor: '#374151' }}
                    placeholder="e.g. Rolex"
                  />
                  <datalist id="brands-datalist">
                    {brandsList.map(b => (
                      <option key={b.id} value={b.name} />
                    ))}
                  </datalist>
                </div>
                <div>
                  <label className="lux-label" style={{ color: '#94a3b8' }}>Category *</label>
                  <input
                    list="category-datalist"
                    required
                    value={productForm.category}
                    onChange={(e) => setProductForm({ ...productForm, category: e.target.value })}
                    className="lux-input"
                    style={{ background: '#0b0f19', color: '#ffffff', borderColor: '#374151' }}
                    placeholder="e.g. Dive & Sport"
                  />
                  <datalist id="category-datalist">
                    <option value="Dive & Sport" />
                    <option value="Chronographs" />
                    <option value="Skeletons" />
                    <option value="Luxury" />
                    <option value="Automatic" />
                    <option value="Diamond Editions" />
                  </datalist>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div>
                  <label className="lux-label" style={{ color: '#94a3b8' }}>Selling Price (₹) *</label>
                  <input
                    type="number"
                    required
                    value={productForm.price}
                    onChange={(e) => setProductForm({ ...productForm, price: Number(e.target.value) })}
                    className="lux-input"
                    style={{ background: '#0b0f19', color: '#ffffff', borderColor: '#374151' }}
                  />
                </div>
                <div>
                  <label className="lux-label" style={{ color: '#94a3b8' }}>Compare MRP (₹)</label>
                  <input
                    type="number"
                    value={productForm.comparePrice || ''}
                    onChange={(e) => setProductForm({ ...productForm, comparePrice: Number(e.target.value) })}
                    className="lux-input"
                    style={{ background: '#0b0f19', color: '#ffffff', borderColor: '#374151' }}
                  />
                </div>
                <div>
                  <label className="lux-label" style={{ color: '#94a3b8' }}>Vault Stock *</label>
                  <input
                    type="number"
                    required
                    value={productForm.stock}
                    onChange={(e) => setProductForm({ ...productForm, stock: Number(e.target.value) })}
                    className="lux-input"
                    style={{ background: '#0b0f19', color: '#ffffff', borderColor: '#374151' }}
                  />
                </div>
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label className="lux-label" style={{ color: '#94a3b8' }}>Product Image *</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={async (e) => {
                      const file = e.target.files[0];
                      if (!file) return;
                      try {
                        const res = await productsAPI.uploadImage(file);
                        if (res.success && res.url) {
                          setProductForm({ ...productForm, images: [res.url] });
                        }
                      } catch (err) {
                        alert('Image upload failed: ' + err.message);
                      }
                    }}
                    className="lux-input"
                    style={{ background: '#0b0f19', color: '#ffffff', borderColor: '#374151', flex: 1 }}
                  />
                  {productForm.images?.[0] && (
                    <img src={getImageUrl(productForm.images[0])} alt="Preview" style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '4px' }} />
                  )}
                </div>
                {productForm.images?.[0] && (
                   <div style={{ fontSize: '0.7rem', color: '#64748b', marginTop: '4px' }}>
                     Current Image: {productForm.images[0]}
                   </div>
                )}
              </div>

              <div style={{ marginBottom: '1.25rem' }}>
                <label className="lux-label" style={{ color: '#94a3b8' }}>Description</label>
                <textarea
                  rows={3}
                  value={productForm.description || ''}
                  onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                  className="lux-input"
                  style={{ background: '#0b0f19', color: '#ffffff', borderColor: '#374151' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button type="button" onClick={() => setIsProductModalOpen(false)} style={{ background: '#1f2937', border: '1px solid #374151', color: '#ffffff', padding: '8px 16px', borderRadius: '4px', cursor: 'pointer' }}>
                  Cancel
                </button>
                <button type="submit" className="btn-gold" style={{ padding: '8px 20px' }}>
                  <span>SAVE TIMEPIECE</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Brand Create / Edit Modal */}
      {isBrandModalOpen && (
        <div style={{
          position: 'fixed',
          inset: 0,
          zIndex: 1200,
          background: 'rgba(0, 0, 0, 0.85)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '1rem',
          overflowY: 'auto'
        }}>
          <div style={{
            background: '#111827',
            border: '1px solid rgba(212, 175, 55, 0.5)',
            borderRadius: '10px',
            padding: '1.75rem',
            width: '100%',
            maxWidth: '560px',
            maxHeight: '90vh',
            overflowY: 'auto',
            boxShadow: '0 20px 50px rgba(0,0,0,0.6)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', paddingBottom: '0.75rem', borderBottom: '1px solid #1f2937' }}>
              <div>
                <h3 style={{ fontFamily: 'var(--font-brand)', fontSize: '1.2rem', color: '#f3e5ab', margin: 0 }}>
                  {editingBrand ? `EDIT BRAND: ${editingBrand.name}` : 'ADD NEW BRAND & COLLECTION'}
                </h3>
                <p style={{ fontSize: '0.72rem', color: '#94a3b8', margin: '3px 0 0 0' }}>
                  Changes will automatically reflect in the customer storefront.
                </p>
              </div>
              <button onClick={() => setIsBrandModalOpen(false)} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveBrand}>
              {/* SECTION 1: BASIC INFORMATION */}
              <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#d4af37', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.75rem' }}>
                1. Basic Brand Information
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem', marginBottom: '0.85rem' }}>
                <div>
                  <label className="lux-label" style={{ color: '#94a3b8' }}>Brand Name *</label>
                  <input
                    type="text"
                    required
                    value={brandForm.name}
                    onChange={(e) => setBrandForm({ ...brandForm, name: e.target.value })}
                    placeholder="e.g. Rolex, Titan, Casio"
                    className="lux-input"
                    style={{ background: '#0b0f19', color: '#ffffff', borderColor: '#374151' }}
                  />
                </div>

                <div>
                  <label className="lux-label" style={{ color: '#94a3b8' }}>Slug (URL / Key)</label>
                  <input
                    type="text"
                    value={brandForm.slug}
                    onChange={(e) => setBrandForm({ ...brandForm, slug: e.target.value })}
                    placeholder="e.g. rolex, titan"
                    className="lux-input"
                    style={{ background: '#0b0f19', color: '#ffffff', borderColor: '#374151' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr 1fr', gap: '0.85rem', marginBottom: '1.25rem' }}>
                <div>
                  <label className="lux-label" style={{ color: '#94a3b8' }}>Badge / Tag *</label>
                  <input
                    type="text"
                    value={brandForm.badge}
                    onChange={(e) => setBrandForm({ ...brandForm, badge: e.target.value })}
                    placeholder="e.g. OFFICIAL ICON, INDIAN ICON"
                    className="lux-input"
                    style={{ background: '#0b0f19', color: '#ffffff', borderColor: '#374151' }}
                  />
                </div>

                <div>
                  <label className="lux-label" style={{ color: '#94a3b8' }}>Location</label>
                  <input
                    type="text"
                    value={brandForm.location}
                    onChange={(e) => setBrandForm({ ...brandForm, location: e.target.value })}
                    placeholder="e.g. Geneva, Switzerland"
                    className="lux-input"
                    style={{ background: '#0b0f19', color: '#ffffff', borderColor: '#374151' }}
                  />
                </div>

                <div>
                  <label className="lux-label" style={{ color: '#94a3b8' }}>Established</label>
                  <input
                    type="text"
                    value={brandForm.established}
                    onChange={(e) => setBrandForm({ ...brandForm, established: e.target.value })}
                    placeholder="e.g. 1905, 1984"
                    className="lux-input"
                    style={{ background: '#0b0f19', color: '#ffffff', borderColor: '#374151' }}
                  />
                </div>
              </div>

              {/* SECTION 2: COLLECTION INFORMATION */}
              <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#d4af37', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.75rem', paddingTop: '0.5rem', borderTop: '1px solid #1f2937' }}>
                2. Featured Collection Information
              </div>

              <div style={{ marginBottom: '0.85rem' }}>
                <label className="lux-label" style={{ color: '#94a3b8' }}>Featured Collection / Title</label>
                <input
                  type="text"
                  value={brandForm.featuredCollection}
                  onChange={(e) => setBrandForm({ ...brandForm, featuredCollection: e.target.value })}
                  placeholder="e.g. Submariner & Daytona Panda"
                  className="lux-input"
                  style={{ background: '#0b0f19', color: '#ffffff', borderColor: '#374151' }}
                />
              </div>

              <div style={{ marginBottom: '0.85rem' }}>
                <label className="lux-label" style={{ color: '#94a3b8' }}>Description / Card Subtitle</label>
                <textarea
                  rows={2}
                  value={brandForm.description}
                  onChange={(e) => setBrandForm({ ...brandForm, description: e.target.value })}
                  placeholder="e.g. Legendary 904L Oystersteel architecture with Cerachrom ceramic bezel..."
                  className="lux-input"
                  style={{ background: '#0b0f19', color: '#ffffff', borderColor: '#374151', resize: 'vertical' }}
                />
              </div>

              <div style={{ marginBottom: '1.25rem' }}>
                <label className="lux-label" style={{ color: '#94a3b8' }}>Collection Filter Target</label>
                <input
                  type="text"
                  value={brandForm.filterTarget}
                  onChange={(e) => setBrandForm({ ...brandForm, filterTarget: e.target.value })}
                  placeholder="Defaults to Brand Name (e.g. Rolex, Titan)"
                  className="lux-input"
                  style={{ background: '#0b0f19', color: '#ffffff', borderColor: '#374151' }}
                />
                <div style={{ fontSize: '0.68rem', color: '#64748b', marginTop: '3px' }}>
                  Identifier used when customer clicks "Explore [Brand] Collection →" to filter products in catalog.
                </div>
              </div>

              {/* SECTION 3: VISUAL INFORMATION & IMAGE UPLOAD */}
              <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#d4af37', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.75rem', paddingTop: '0.5rem', borderTop: '1px solid #1f2937' }}>
                3. Brand Card Image & Visuals
              </div>

              <div style={{ marginBottom: '0.85rem' }}>
                <label className="lux-label" style={{ color: '#94a3b8' }}>Brand Card Image (Upload File or Enter URL)</label>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '6px' }}>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={async (e) => {
                      const file = e.target.files[0];
                      if (!file) return;
                      try {
                        const res = await brandsAPI.uploadImage(file);
                        if (res.success && res.url) {
                          setBrandForm({ ...brandForm, image: res.url });
                        }
                      } catch (err) {
                        alert('Image upload failed: ' + err.message);
                      }
                    }}
                    className="lux-input"
                    style={{ background: '#0b0f19', color: '#ffffff', borderColor: '#374151', flex: 1 }}
                  />
                  {brandForm.image && (
                    <img
                      src={getImageUrl(brandForm.image)}
                      alt="Brand Preview"
                      onError={(e) => { e.target.src = '/images/watches/rolex_submariner.jpg'; }}
                      style={{
                        width: '46px',
                        height: '46px',
                        objectFit: 'cover',
                        borderRadius: '6px',
                        border: '1px solid rgba(212, 175, 55, 0.4)'
                      }}
                    />
                  )}
                </div>

                <input
                  type="text"
                  value={brandForm.image}
                  onChange={(e) => setBrandForm({ ...brandForm, image: e.target.value })}
                  placeholder="Or paste image URL (e.g. /images/watches/rolex_submariner.jpg)"
                  className="lux-input"
                  style={{ background: '#0b0f19', color: '#ffffff', borderColor: '#374151', fontSize: '0.75rem' }}
                />
              </div>

              <div style={{ marginBottom: '1.25rem' }}>
                <label className="lux-label" style={{ color: '#94a3b8' }}>Image Alt Text</label>
                <input
                  type="text"
                  value={brandForm.imageAlt || ''}
                  onChange={(e) => setBrandForm({ ...brandForm, imageAlt: e.target.value })}
                  placeholder="e.g. Rolex Submariner & Daytona Panda Luxury Watch"
                  className="lux-input"
                  style={{ background: '#0b0f19', color: '#ffffff', borderColor: '#374151' }}
                />
              </div>

              {/* SECTION 4: DISPLAY SETTINGS & STATUS */}
              <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#d4af37', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.75rem', paddingTop: '0.5rem', borderTop: '1px solid #1f2937' }}>
                4. Display Settings & Status
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
                <div>
                  <label className="lux-label" style={{ color: '#94a3b8' }}>Display Order (Sequence)</label>
                  <input
                    type="number"
                    min="1"
                    value={brandForm.displayOrder}
                    onChange={(e) => setBrandForm({ ...brandForm, displayOrder: Number(e.target.value) })}
                    className="lux-input"
                    style={{ background: '#0b0f19', color: '#ffffff', borderColor: '#374151' }}
                  />
                  <div style={{ fontSize: '0.68rem', color: '#64748b', marginTop: '3px' }}>
                    Controls position in the storefront brand grid (e.g. 1 = first card).
                  </div>
                </div>

                <div>
                  <label className="lux-label" style={{ color: '#94a3b8' }}>Active Status</label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', height: '38px' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.82rem', color: '#ffffff' }}>
                      <input
                        type="checkbox"
                        checked={Boolean(brandForm.isActive)}
                        onChange={(e) => setBrandForm({ ...brandForm, isActive: e.target.checked })}
                        style={{ width: '16px', height: '16px', accentColor: '#d4af37', cursor: 'pointer' }}
                      />
                      <span>{brandForm.isActive ? 'Active (Visible on Website)' : 'Inactive (Hidden from Website)'}</span>
                    </label>
                  </div>
                </div>
              </div>

              {/* Buttons */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', paddingTop: '0.75rem', borderTop: '1px solid #1f2937' }}>
                <button
                  type="button"
                  onClick={() => setIsBrandModalOpen(false)}
                  style={{
                    background: '#1f2937',
                    border: '1px solid #374151',
                    color: '#ffffff',
                    padding: '8px 18px',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '0.8rem'
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSavingBrand}
                  className="btn-gold"
                  style={{ padding: '8px 22px', fontSize: '0.8rem', opacity: isSavingBrand ? 0.7 : 1 }}
                >
                  <span>{isSavingBrand ? 'SAVING...' : (editingBrand ? 'SAVE CHANGES' : 'CREATE BRAND')}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteBrandModalOpen && brandToDelete && (
        <div style={{
          position: 'fixed',
          inset: 0,
          zIndex: 1300,
          background: 'rgba(0, 0, 0, 0.85)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '1rem'
        }}>
          <div style={{
            background: '#111827',
            border: '1px solid #ef4444',
            borderRadius: '8px',
            padding: '1.5rem',
            width: '100%',
            maxWidth: '420px',
            boxShadow: '0 20px 40px rgba(0,0,0,0.7)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1rem', color: '#ef4444' }}>
              <AlertCircle size={24} />
              <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, color: '#ffffff' }}>
                Delete Brand?
              </h3>
            </div>
            <p style={{ fontSize: '0.84rem', color: '#cbd5e1', lineHeight: 1.5, margin: '0 0 1.25rem 0' }}>
              Delete <strong>{brandToDelete.name}</strong>? This will remove the brand from the website.
            </p>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button
                type="button"
                onClick={() => { setIsDeleteBrandModalOpen(false); setBrandToDelete(null); }}
                style={{
                  background: '#1f2937',
                  border: '1px solid #374151',
                  color: '#ffffff',
                  padding: '8px 16px',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '0.8rem'
                }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDeleteBrand}
                style={{
                  background: '#ef4444',
                  border: 'none',
                  color: '#ffffff',
                  padding: '8px 18px',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '0.8rem',
                  fontWeight: 700
                }}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Coupon Modal */}
      {isCouponModalOpen && (
        <div style={{
          position: 'fixed',
          inset: 0,
          zIndex: 1200,
          background: 'rgba(0, 0, 0, 0.8)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '1rem'
        }}>
          <div style={{ background: '#111827', border: '1px solid #d4af37', borderRadius: '8px', padding: '1.5rem', width: '100%', maxWidth: '440px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 style={{ fontFamily: 'var(--font-brand)', fontSize: '1.1rem', color: '#f3e5ab', margin: 0 }}>
                CREATE PROMOTION CODE
              </h3>
              <button onClick={() => setIsCouponModalOpen(false)} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveCoupon}>
              <div style={{ marginBottom: '1rem' }}>
                <label className="lux-label" style={{ color: '#94a3b8' }}>Coupon Code *</label>
                <input
                  type="text"
                  required
                  value={couponForm.code}
                  onChange={(e) => setCouponForm({ ...couponForm, code: e.target.value.toUpperCase() })}
                  placeholder="e.g. ROYAL25"
                  className="lux-input"
                  style={{ background: '#0b0f19', color: '#ffffff', borderColor: '#374151' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div>
                  <label className="lux-label" style={{ color: '#94a3b8' }}>Discount (%) *</label>
                  <input
                    type="number"
                    required
                    value={couponForm.discountPercent}
                    onChange={(e) => setCouponForm({ ...couponForm, discountPercent: Number(e.target.value) })}
                    className="lux-input"
                    style={{ background: '#0b0f19', color: '#ffffff', borderColor: '#374151' }}
                  />
                </div>
                <div>
                  <label className="lux-label" style={{ color: '#94a3b8' }}>Min. Spend (₹)</label>
                  <input
                    type="number"
                    value={couponForm.minSpend}
                    onChange={(e) => setCouponForm({ ...couponForm, minSpend: Number(e.target.value) })}
                    className="lux-input"
                    style={{ background: '#0b0f19', color: '#ffffff', borderColor: '#374151' }}
                  />
                </div>
              </div>

              <div style={{ marginBottom: '1.25rem' }}>
                <label className="lux-label" style={{ color: '#94a3b8' }}>Description</label>
                <input
                  type="text"
                  value={couponForm.description}
                  onChange={(e) => setCouponForm({ ...couponForm, description: e.target.value })}
                  placeholder="e.g. VIP Connoisseur Discount"
                  className="lux-input"
                  style={{ background: '#0b0f19', color: '#ffffff', borderColor: '#374151' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button type="button" onClick={() => setIsCouponModalOpen(false)} style={{ background: '#1f2937', border: '1px solid #374151', color: '#ffffff', padding: '8px 16px', borderRadius: '4px', cursor: 'pointer' }}>
                  Cancel
                </button>
                <button type="submit" className="btn-gold" style={{ padding: '8px 20px' }}>
                  <span>CREATE CODE</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;

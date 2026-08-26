import React, { useState, useEffect } from 'react';
import {
  X, RotateCcw, Package, CheckCircle2, ShieldCheck, ArrowRight,
  Truck, ArrowLeft, Clock, CreditCard, Sparkles, AlertCircle, FileText, Check
} from 'lucide-react';
import { useUserAuth } from '../context/UserAuthContext';
import { useStore } from '../context/StoreContext';
import { returnsAPI, ordersAPI } from '../services/api';
import { formatCurrency } from '../utils/currency';

const RETURN_REASONS = [
  { id: 'fit', label: 'Wrist Fit & Bracelet Dimension Adjustment', desc: 'Need additional link removal or bespoke strap sizing.' },
  { id: 'exchange', label: 'Exchange for Different Horology Model', desc: 'Desire another calibre, dial color, or bezel complication.' },
  { id: 'calibre', label: 'Calibre Accuracy / Mechanical Fine-Tuning', desc: 'Request official master chronometer inspection.' },
  { id: 'transit', label: 'Transit Box or Caseback Imperfection', desc: 'Packaging or seal showed signs of courier wear.' },
  { id: 'preference', label: 'Client Discretion / Changed Preference', desc: 'Exercising 7-day complimentary luxury return privilege.' }
];

const RESOLUTION_OPTIONS = [
  {
    id: 'Refund',
    title: 'Full Original Method Refund',
    badge: '100% Value',
    desc: 'Credited directly to your original UPI / Bank Account within 48h of atelier reception.',
    icon: CreditCard
  },
  {
    id: 'Exchange',
    title: 'Bespoke Timepiece Exchange',
    badge: 'Concierge Priority',
    desc: 'Exchange for another timepiece from our vault. Complimentary expedited dispatch.',
    icon: RotateCcw
  },
  {
    id: 'StoreCredit',
    title: 'Vault Store Credit + 5% VIP Bonus',
    badge: '+5% Extra Value',
    desc: 'Receive immediate store credit with an additional 5% bonus credit for future acquisitions.',
    icon: Sparkles
  }
];

const ReturnRequestModal = ({ isOpen, onClose, initialOrderId = '' }) => {
  const { user, userOrders, refreshUserProfile } = useUserAuth();
  const { orders: storeOrders, showToast } = useStore();

  const [step, setStep] = useState(1); // 1: Lookup, 2: Select Items, 3: Reason & Resolution, 4: Pickup Details, 5: Confirmation
  const [orderInput, setOrderInput] = useState(initialOrderId);
  const [emailInput, setEmailInput] = useState(user?.email || '');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [selectedItems, setSelectedItems] = useState([]);
  const [returnReason, setReturnReason] = useState(RETURN_REASONS[0].label);
  const [resolutionType, setResolutionType] = useState('Refund');
  const [exchangeModelPreference, setExchangeModelPreference] = useState('');
  const [pickupForm, setPickupForm] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    address: '',
    city: '',
    state: 'Maharashtra',
    pincode: '',
    pickupNotes: ''
  });
  const [createdReturn, setCreatedReturn] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Auto initialize if initialOrderId is provided
  useEffect(() => {
    if (isOpen) {
      setErrorMsg('');
      if (initialOrderId) {
        setOrderInput(initialOrderId);
        handleLookupOrder(initialOrderId);
      } else if (user) {
        setEmailInput(user.email || '');
        setPickupForm(prev => ({
          ...prev,
          name: user.name || prev.name,
          phone: user.phone || prev.phone
        }));
      }
    }
  }, [isOpen, initialOrderId, user]);

  if (!isOpen) return null;

  // Handle Order Lookup
  const handleLookupOrder = async (searchId = orderInput) => {
    if (!searchId && !emailInput) {
      setErrorMsg('Please enter an Order ID or your registered Gmail address.');
      return;
    }

    setIsLoading(true);
    setErrorMsg('');

    try {
      // Look in storeOrders first
      const idUpper = searchId.trim().toUpperCase();
      let match = storeOrders.find(
        o => o.id?.toUpperCase() === idUpper ||
             o.trackingNumber?.toUpperCase() === idUpper ||
             (emailInput && o.customer?.email?.toLowerCase() === emailInput.trim().toLowerCase())
      );

      if (!match) {
        // Fetch from API
        const res = await ordersAPI.getById(searchId.trim() || emailInput.trim());
        if (res.success && res.order) {
          match = res.order;
        }
      }

      if (!match) {
        setErrorMsg(`No consignment order found for "${searchId || emailInput}". Please verify details.`);
        setIsLoading(false);
        return;
      }

      setSelectedOrder(match);
      // Preselect first item
      if (match.items && match.items.length > 0) {
        setSelectedItems([match.items[0]]);
        if (match.shippingAddress) {
          setPickupForm(prev => ({
            ...prev,
            name: match.customer?.name || prev.name,
            phone: match.customer?.phone || prev.phone,
            address: match.shippingAddress?.address || match.shippingAddress?.street || prev.address,
            city: match.shippingAddress?.city || prev.city,
            state: match.shippingAddress?.state || prev.state,
            pincode: match.shippingAddress?.pincode || prev.pincode
          }));
        }
      }
      setStep(2);
    } catch (err) {
      setErrorMsg(err.message || 'Unable to locate order. Please check order number.');
    } finally {
      setIsLoading(false);
    }
  };

  // Toggle Item Selection
  const toggleItemSelection = (item) => {
    const exists = selectedItems.find(i => i.id === item.id || i.sku === item.sku);
    if (exists) {
      if (selectedItems.length === 1) {
        setErrorMsg('At least one timepiece item must be selected for return/exchange.');
        return;
      }
      setSelectedItems(selectedItems.filter(i => (i.id || i.sku) !== (item.id || item.sku)));
    } else {
      setSelectedItems([...selectedItems, item]);
      setErrorMsg('');
    }
  };

  // Submit Final Return Request
  const handleSubmitReturn = async (e) => {
    e.preventDefault();
    if (!pickupForm.address || !pickupForm.pincode) {
      setErrorMsg('Please provide complete pickup address and pincode for the courier.');
      return;
    }

    setIsLoading(true);
    setErrorMsg('');

    try {
      const payload = {
        orderId: selectedOrder.id,
        customerName: pickupForm.name || selectedOrder.customer?.name || user?.name || 'Valued Patron',
        customerEmail: selectedOrder.customer?.email || emailInput || user?.email,
        customerPhone: pickupForm.phone || selectedOrder.customer?.phone,
        items: selectedItems,
        returnReason,
        resolutionType,
        exchangeModelPreference: resolutionType === 'Exchange' ? exchangeModelPreference : undefined,
        pickupAddress: `${pickupForm.address}, ${pickupForm.city}, ${pickupForm.state} - ${pickupForm.pincode}`,
        notes: pickupForm.pickupNotes
      };

      const res = await returnsAPI.create(payload);

      if (res.success && res.returnRequest) {
        setCreatedReturn(res.returnRequest);
        setStep(5);
        if (refreshUserProfile) refreshUserProfile();
        if (showToast) showToast('Return request logged. Armoured pickup scheduled.', 'success');
      } else {
        setErrorMsg(res.message || 'Failed to submit return request.');
      }
    } catch (err) {
      setErrorMsg(err.message || 'An error occurred while scheduling return.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setStep(1);
    setSelectedOrder(null);
    setSelectedItems([]);
    setCreatedReturn(null);
    setErrorMsg('');
    onClose();
  };

  return (
    <div
      className="modal-backdrop animate-fade-in"
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.65)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
        padding: '1rem'
      }}
      onClick={onClose}
    >
      <div
        className="modal-panel animate-scale-up"
        style={{
          width: '100%',
          maxWidth: '640px',
          background: '#ffffff',
          borderRadius: '8px',
          border: '1px solid rgba(180, 140, 30, 0.35)',
          boxShadow: '0 25px 60px rgba(15, 23, 42, 0.2), 0 0 35px rgba(180, 140, 30, 0.15)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          maxHeight: '90vh'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header */}
        <div style={{
          padding: '1.25rem 1.75rem',
          background: 'linear-gradient(180deg, #fbfbf9 0%, #ffffff 100%)',
          borderBottom: '1px solid rgba(0, 0, 0, 0.08)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '2px' }}>
              <RotateCcw size={16} color="#8a6709" />
              <span style={{
                fontFamily: 'var(--font-brand)',
                fontSize: '0.72rem',
                letterSpacing: '0.2em',
                textTransform: 'uppercase',
                color: '#8a6709',
                fontWeight: 700
              }}>
                Concierge Horology Returns & Exchange
              </span>
            </div>
            <h3 style={{
              fontFamily: 'var(--font-brand)',
              fontSize: '1.2rem',
              fontWeight: 800,
              color: '#0f172a',
              letterSpacing: '0.04em'
            }}>
              {step === 5 ? 'Return Consignment Confirmed' : 'Initiate Return / Exchange Request'}
            </h3>
          </div>

          <button
            onClick={onClose}
            style={{
              background: 'rgba(0, 0, 0, 0.04)',
              border: 'none',
              borderRadius: '50%',
              width: '32px',
              height: '32px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: '#64748b'
            }}
          >
            <X size={16} />
          </button>
        </div>

        {/* Multi-step progress tracker */}
        {step < 5 && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0.75rem clamp(0.75rem, 3vw, 1.75rem)',
            background: '#f8f7f4',
            borderBottom: '1px solid rgba(0, 0, 0, 0.06)',
            fontSize: 'clamp(0.65rem, 2vw, 0.72rem)',
            fontWeight: 700
          }}>
            {[
              { num: 1, label: 'Order' },
              { num: 2, label: 'Pieces' },
              { num: 3, label: 'Resolution' },
              { num: 4, label: 'Pickup' }
            ].map((s) => (
              <div
                key={s.num}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  color: step >= s.num ? '#8a6709' : '#94a3b8'
                }}
              >
                <div style={{
                  width: '18px',
                  height: '18px',
                  borderRadius: '50%',
                  background: step >= s.num ? '#8a6709' : '#e2e8f0',
                  color: step >= s.num ? '#ffffff' : '#64748b',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.62rem',
                  fontWeight: 800
                }}>
                  {step > s.num ? <Check size={11} /> : s.num}
                </div>
                <span>{s.label}</span>
              </div>
            ))}
          </div>
        )}

        {/* Modal Body Content */}
        <div style={{ padding: 'clamp(1rem, 3vw, 1.75rem)', overflowY: 'auto', flex: 1 }}>
          {errorMsg && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.6rem',
              padding: '0.75rem 1rem',
              background: '#fef2f2',
              border: '1px solid #fecaca',
              borderRadius: '6px',
              color: '#b91c1c',
              fontSize: '0.8rem',
              marginBottom: '1.25rem'
            }}>
              <AlertCircle size={16} style={{ flexShrink: 0 }} />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* STEP 1: ORDER LOOKUP */}
          {step === 1 && (
            <div>
              <p style={{ fontSize: '0.82rem', color: '#475569', marginBottom: '1.25rem' }}>
                All certified timepieces acquired from Luxury Watch include a <strong>7-day complimentary insured return and bespoke exchange privilege</strong>.
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div>
                  <label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#334155', display: 'block', marginBottom: '4px' }}>
                    Order ID / Consignment Waybill
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. ORD-AK-98421 or ORD-LW-..."
                    value={orderInput}
                    onChange={(e) => setOrderInput(e.target.value)}
                    className="lux-input"
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#334155', display: 'block', marginBottom: '4px' }}>
                    Patron Registered Gmail / Email
                  </label>
                  <input
                    type="email"
                    placeholder="patron@gmail.com"
                    value={emailInput}
                    onChange={(e) => setEmailInput(e.target.value)}
                    className="lux-input"
                  />
                </div>

                <button
                  type="button"
                  onClick={() => handleLookupOrder(orderInput)}
                  disabled={isLoading}
                  className="btn-gold"
                  style={{ marginTop: '0.5rem', padding: '0.85rem', width: '100%', fontWeight: 700 }}
                >
                  <Package size={16} />
                  <span>{isLoading ? 'Locating Consignment...' : 'Locate Order & Proceed'}</span>
                </button>
              </div>

              {/* If user has order history, show quick select chips */}
              {userOrders && userOrders.length > 0 && (
                <div style={{ marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid #f1f5f9' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#0f172a', display: 'block', marginBottom: '0.5rem' }}>
                    Your Recent Orders:
                  </span>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {userOrders.slice(0, 3).map((ord) => (
                      <div
                        key={ord.id}
                        onClick={() => {
                          setOrderInput(ord.id);
                          handleLookupOrder(ord.id);
                        }}
                        style={{
                          padding: '0.6rem 0.85rem',
                          background: '#f8f7f4',
                          border: '1px solid rgba(180, 140, 30, 0.25)',
                          borderRadius: '6px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          cursor: 'pointer',
                          transition: 'all 0.2s'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.borderColor = '#8a6709'}
                        onMouseLeave={(e) => e.currentTarget.style.borderColor = 'rgba(180, 140, 30, 0.25)'}
                      >
                        <div>
                          <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#0f172a' }}>#{ord.id}</span>
                          <span style={{ fontSize: '0.72rem', color: '#64748b', marginLeft: '0.5rem' }}>
                            {ord.items?.length || 1} item(s) • {formatCurrency(ord.totalAmount || ord.total || 5499)}
                          </span>
                        </div>
                        <ArrowRight size={14} color="#8a6709" />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* STEP 2: SELECT PIECES TO RETURN */}
          {step === 2 && selectedOrder && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <div>
                  <span style={{ fontSize: '0.72rem', color: '#8a6709', fontWeight: 700 }}>ORDER #{selectedOrder.id}</span>
                  <h4 style={{ fontSize: '0.95rem', color: '#0f172a', fontWeight: 700 }}>Select Timepieces for Return / Exchange</h4>
                </div>
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  style={{ background: 'none', border: 'none', color: '#64748b', fontSize: '0.75rem', cursor: 'pointer', textDecoration: 'underline' }}
                >
                  Change Order
                </button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.5rem' }}>
                {(selectedOrder.items || []).map((item, idx) => {
                  const isSelected = selectedItems.some(i => (i.id || i.sku) === (item.id || item.sku));
                  return (
                    <div
                      key={idx}
                      onClick={() => toggleItemSelection(item)}
                      style={{
                        padding: '0.85rem',
                        background: isSelected ? '#ffffff' : '#f8f7f4',
                        border: isSelected ? '2px solid #8a6709' : '1px solid rgba(0,0,0,0.1)',
                        borderRadius: '6px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '1rem',
                        cursor: 'pointer',
                        boxShadow: isSelected ? '0 4px 15px rgba(180,140,30,0.15)' : 'none',
                        transition: 'all 0.2s'
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => {}}
                        style={{ accentColor: '#8a6709', width: '18px', height: '18px', cursor: 'pointer' }}
                      />
                      <img
                        src={item.image || item.images?.[0] || '/images/watches/rolex_submariner.jpg'}
                        alt={item.name}
                        style={{ width: '48px', height: '48px', objectFit: 'contain', background: '#ffffff', borderRadius: '4px', border: '1px solid #e2e8f0' }}
                      />
                      <div style={{ flex: 1 }}>
                        <h5 style={{ fontSize: '0.85rem', color: '#0f172a', fontWeight: 700, margin: 0 }}>{item.name}</h5>
                        <span style={{ fontSize: '0.72rem', color: '#64748b' }}>Qty: {item.quantity || 1} • {formatCurrency(item.price)}</span>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#0f172a' }}>
                          {formatCurrency((item.price || 0) * (item.quantity || 1))}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="btn-dark"
                  style={{ flex: 1, padding: '0.75rem' }}
                >
                  <ArrowLeft size={14} />
                  <span>Back</span>
                </button>
                <button
                  type="button"
                  onClick={() => setStep(3)}
                  disabled={selectedItems.length === 0}
                  className="btn-gold"
                  style={{ flex: 2, padding: '0.75rem', fontWeight: 700 }}
                >
                  <span>Continue to Reason & Resolution</span>
                  <ArrowRight size={14} />
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: REASON & RESOLUTION */}
          {step === 3 && (
            <div>
              <div style={{ marginBottom: '1.25rem' }}>
                <label style={{ fontSize: '0.78rem', fontWeight: 700, color: '#0f172a', display: 'block', marginBottom: '6px' }}>
                  1. Reason for Return or Exchange
                </label>
                <select
                  value={returnReason}
                  onChange={(e) => setReturnReason(e.target.value)}
                  className="lux-select"
                  style={{ width: '100%', fontSize: '0.82rem' }}
                >
                  {RETURN_REASONS.map((r) => (
                    <option key={r.id} value={r.label}>
                      {r.label}
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ fontSize: '0.78rem', fontWeight: 700, color: '#0f172a', display: 'block', marginBottom: '8px' }}>
                  2. Choose Resolution Preference
                </label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                  {RESOLUTION_OPTIONS.map((opt) => {
                    const isSelected = resolutionType === opt.id;
                    const IconComponent = opt.icon;
                    return (
                      <div
                        key={opt.id}
                        onClick={() => setResolutionType(opt.id)}
                        style={{
                          padding: '0.85rem 1rem',
                          background: isSelected ? '#ffffff' : '#f8f7f4',
                          border: isSelected ? '2px solid #8a6709' : '1px solid rgba(0,0,0,0.1)',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          transition: 'all 0.2s',
                          boxShadow: isSelected ? '0 4px 15px rgba(180,140,30,0.15)' : 'none'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <IconComponent size={16} color="#8a6709" />
                            <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0f172a' }}>{opt.title}</span>
                          </div>
                          <span style={{
                            fontSize: '0.68rem',
                            padding: '2px 8px',
                            borderRadius: '50px',
                            background: isSelected ? '#8a6709' : '#e2e8f0',
                            color: isSelected ? '#ffffff' : '#475569',
                            fontWeight: 700
                          }}>
                            {opt.badge}
                          </span>
                        </div>
                        <p style={{ fontSize: '0.75rem', color: '#475569', margin: 0, paddingLeft: '1.5rem' }}>
                          {opt.desc}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* If Exchange is selected, show preference input */}
              {resolutionType === 'Exchange' && (
                <div style={{ marginBottom: '1.25rem', padding: '0.85rem', background: '#f8f7f4', borderRadius: '6px', border: '1px dashed #8a6709' }}>
                  <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#0f172a', display: 'block', marginBottom: '4px' }}>
                    Desired Replacement Model / Calibre:
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Titan Grandmaster Automatic or Rolex Submariner"
                    value={exchangeModelPreference}
                    onChange={(e) => setExchangeModelPreference(e.target.value)}
                    className="lux-input"
                  />
                </div>
              )}

              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="btn-dark"
                  style={{ flex: 1, padding: '0.75rem' }}
                >
                  <ArrowLeft size={14} />
                  <span>Back</span>
                </button>
                <button
                  type="button"
                  onClick={() => setStep(4)}
                  className="btn-gold"
                  style={{ flex: 2, padding: '0.75rem', fontWeight: 700 }}
                >
                  <span>Confirm Armoured Pickup</span>
                  <ArrowRight size={14} />
                </button>
              </div>
            </div>
          )}

          {/* STEP 4: ARMOURED PICKUP DETAILS */}
          {step === 4 && (
            <form onSubmit={handleSubmitReturn}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', padding: '0.75rem 1rem', background: '#f8f7f4', borderRadius: '6px', border: '1px solid rgba(180, 140, 30, 0.25)', marginBottom: '1.25rem' }}>
                <Truck size={18} color="#8a6709" />
                <span style={{ fontSize: '0.78rem', color: '#475569' }}>
                  Securitas Armoured Courier will arrive with security seals and tamper-proof vault box.
                </span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem', marginBottom: '0.85rem' }}>
                <div>
                  <label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#334155', display: 'block', marginBottom: '4px' }}>Contact Patron</label>
                  <input
                    type="text"
                    required
                    value={pickupForm.name}
                    onChange={(e) => setPickupForm({ ...pickupForm, name: e.target.value })}
                    className="lux-input"
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#334155', display: 'block', marginBottom: '4px' }}>Contact Phone</label>
                  <input
                    type="tel"
                    required
                    value={pickupForm.phone}
                    onChange={(e) => setPickupForm({ ...pickupForm, phone: e.target.value })}
                    className="lux-input"
                  />
                </div>
              </div>

              <div style={{ marginBottom: '0.85rem' }}>
                <label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#334155', display: 'block', marginBottom: '4px' }}>Pickup Street Address</label>
                <input
                  type="text"
                  required
                  placeholder="Residence / Office address"
                  value={pickupForm.address}
                  onChange={(e) => setPickupForm({ ...pickupForm, address: e.target.value })}
                  className="lux-input"
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.85rem', marginBottom: '1.25rem' }}>
                <div>
                  <label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#334155', display: 'block', marginBottom: '4px' }}>City</label>
                  <input
                    type="text"
                    required
                    value={pickupForm.city}
                    onChange={(e) => setPickupForm({ ...pickupForm, city: e.target.value })}
                    className="lux-input"
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#334155', display: 'block', marginBottom: '4px' }}>State</label>
                  <input
                    type="text"
                    required
                    value={pickupForm.state}
                    onChange={(e) => setPickupForm({ ...pickupForm, state: e.target.value })}
                    className="lux-input"
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#334155', display: 'block', marginBottom: '4px' }}>Pincode</label>
                  <input
                    type="text"
                    required
                    value={pickupForm.pincode}
                    onChange={(e) => setPickupForm({ ...pickupForm, pincode: e.target.value })}
                    className="lux-input"
                  />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button
                  type="button"
                  onClick={() => setStep(3)}
                  className="btn-dark"
                  style={{ flex: 1, padding: '0.75rem' }}
                >
                  <ArrowLeft size={14} />
                  <span>Back</span>
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="btn-gold"
                  style={{ flex: 2, padding: '0.75rem', fontWeight: 700 }}
                >
                  <CheckCircle2 size={16} />
                  <span>{isLoading ? 'Booking Armoured Courier...' : 'Submit & Generate Waybill'}</span>
                </button>
              </div>
            </form>
          )}

          {/* STEP 5: CONFIRMATION CERTIFICATE & WAYBILL */}
          {step === 5 && createdReturn && (
            <div style={{ textAlign: 'center', padding: '0.5rem 0' }}>
              <div style={{
                width: '60px',
                height: '60px',
                borderRadius: '50%',
                background: 'rgba(180, 140, 30, 0.12)',
                border: '2px solid #8a6709',
                color: '#8a6709',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1rem auto'
              }}>
                <CheckCircle2 size={32} />
              </div>

              <span style={{ fontSize: '0.72rem', color: '#8a6709', fontWeight: 800, letterSpacing: '0.2em', textTransform: 'uppercase' }}>
                GENEVA ATELIER CONSIGNMENT CONFIRMED
              </span>
              <h3 style={{ fontFamily: 'var(--font-brand)', fontSize: '1.35rem', color: '#0f172a', fontWeight: 800, marginTop: '0.25rem' }}>
                Return Waybill #{createdReturn.id}
              </h3>
              <p style={{ fontSize: '0.8rem', color: '#475569', maxWidth: '480px', margin: '0.5rem auto 1.5rem auto' }}>
                Your return consignment has been registered. An insured courier will arrive at your address within 24-48 hours.
              </p>

              {/* Waybill Card */}
              <div style={{
                background: '#f8f7f4',
                borderRadius: '6px',
                border: '1px solid rgba(180, 140, 30, 0.35)',
                padding: '1.25rem',
                textAlign: 'left',
                marginBottom: '1.5rem'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem', borderBottom: '1px solid rgba(0,0,0,0.06)', paddingBottom: '0.5rem' }}>
                  <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Insured Tracking Waybill:</span>
                  <strong style={{ fontSize: '0.82rem', color: '#8a6709' }}>{createdReturn.waybillNumber}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem', borderBottom: '1px solid rgba(0,0,0,0.06)', paddingBottom: '0.5rem' }}>
                  <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Resolution Type:</span>
                  <strong style={{ fontSize: '0.82rem', color: '#0f172a' }}>{createdReturn.resolutionType}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem', borderBottom: '1px solid rgba(0,0,0,0.06)', paddingBottom: '0.5rem' }}>
                  <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Pickup Address:</span>
                  <span style={{ fontSize: '0.78rem', color: '#0f172a', maxWidth: '60%', textAlign: 'right' }}>{createdReturn.pickupAddress}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Status:</span>
                  <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#8a6709', background: 'rgba(180,140,30,0.12)', padding: '2px 8px', borderRadius: '4px' }}>
                    {createdReturn.status}
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={handleReset}
                className="btn-gold"
                style={{ width: '100%', padding: '0.85rem', fontWeight: 700 }}
              >
                <span>Done & Return to Maison</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export { ReturnRequestModal };
export default ReturnRequestModal;

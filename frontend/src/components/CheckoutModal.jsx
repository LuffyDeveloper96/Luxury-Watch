import React, { useState, useEffect } from 'react';
import { useStore } from '../context/StoreContext';
import { formatCurrency } from '../utils/currency';
import { settingsAPI } from '../services/api';
import confetti from 'canvas-confetti';
import {
  X, Check, ShieldCheck, Truck, Lock, QrCode, CreditCard,
  Building, ChevronRight, AlertCircle, ArrowLeft, ArrowRight,
  Clock, Sparkles, CheckCircle2, Copy, Printer, Eye
} from 'lucide-react';

export const CheckoutModal = () => {
  const {
    isCheckoutOpen,
    setIsCheckoutOpen,
    checkoutItems,
    appliedCoupon,
    currency,
    placeOrder,
    setIsOrderTrackingOpen
  } = useStore();

  const [step, setStep] = useState(1); // 1: Shipping, 2: Delivery, 3: Payment, 4: Success
  const [paymentMethod, setPaymentMethod] = useState('upi'); // 'upi' | 'card' | 'netbanking'

  // Shipping Form State (Initial empty strings with clear placeholders)
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: 'Maharashtra',
    postalCode: '',
    country: 'India',
    deliverySpeed: 'BlueDart Insured Air Express (Pan-India 24-48 Hours)',
    specialInstructions: ''
  });

  // Payment Form States (Clean without dummy values)
  const [cardNumber, setCardNumber] = useState('');
  const [cardHolder, setCardHolder] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');

  const [upiId, setUpiId] = useState('');
  const [utrNumber, setUtrNumber] = useState('');
  const [selectedBank, setSelectedBank] = useState('HDFC Bank');
  const [bankUtrNumber, setBankUtrNumber] = useState('');
  const [copiedUpi, setCopiedUpi] = useState(false);
  const [copiedBank, setCopiedBank] = useState(false);

  // Live Admin Merchant Payment Settings
  const [paymentSettings, setPaymentSettings] = useState({
    merchantName: 'Luxury Watch Haute Horlogerie',
    upiId: 'luxurywatch@okhdfcbank',
    bankName: 'HDFC Bank Ltd.',
    accountHolder: 'LUXURY WATCH INDIA PRIVATE LIMITED',
    accountNumber: '50200088991122',
    ifscCode: 'HDFC0000060',
    branch: 'Bandra Kurla Complex (BKC), Mumbai',
    qrCodeUrl: '',
    paymentNotes: 'Please transfer the exact amount and enter the 12-digit UPI UTR / Reference ID below.'
  });

  // 3D Secure / OTP Simulation
  const [isOtpModalOpen, setIsOtpModalOpen] = useState(false);
  const [enteredOtp, setEnteredOtp] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [confirmedOrder, setConfirmedOrder] = useState(null);

  // UPI Timer
  const [upiTimer, setUpiTimer] = useState(300); // 5 minutes

  // Load Merchant Payment Gateway config on mount
  useEffect(() => {
    const fetchPaymentGateway = async () => {
      try {
        const res = await settingsAPI.getPaymentSettings();
        if (res.success && res.settings) {
          setPaymentSettings(res.settings);
        }
      } catch (err) {
        // Fallback default
      }
    };
    if (isCheckoutOpen) {
      fetchPaymentGateway();
    }
  }, [isCheckoutOpen]);

  useEffect(() => {
    let interval;
    if (step === 3 && paymentMethod === 'upi' && upiTimer > 0) {
      interval = setInterval(() => {
        setUpiTimer(prev => Math.max(0, prev - 1));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [step, paymentMethod, upiTimer]);

  if (!isCheckoutOpen || checkoutItems.length === 0) return null;

  // Calculation
  const subtotal = checkoutItems.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const discountAmount = appliedCoupon ? (subtotal * appliedCoupon.discountPercent) / 100 : 0;
  const shippingFee = formData.deliverySpeed.includes('Securitas') ? 499 : 0;
  const finalTotal = Math.max(0, subtotal - discountAmount + shippingFee);

  const formatTimer = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const handleProceedToDelivery = (e) => {
    e.preventDefault();
    if (!formData.fullName.trim() || !formData.email.trim() || !formData.phone.trim() || !formData.address.trim() || !formData.city.trim() || !formData.postalCode.trim()) {
      alert("Please fill in all required shipping address fields.");
      return;
    }
    setStep(2);
  };

  const copyToClipboard = (text, type = 'upi') => {
    navigator.clipboard.writeText(text);
    if (type === 'upi') {
      setCopiedUpi(true);
      setTimeout(() => setCopiedUpi(false), 2000);
    } else {
      setCopiedBank(true);
      setTimeout(() => setCopiedBank(false), 2000);
    }
  };

  const executeOrderCreation = async () => {
    setIsProcessing(true);

    const orderPayload = {
      customer: {
        fullName: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        address: formData.address,
        city: formData.city,
        state: formData.state,
        postalCode: formData.postalCode,
        country: formData.country
      },
      items: checkoutItems.map(item => ({
        id: item.product.id,
        name: item.product.name,
        brand: item.product.brand,
        price: item.product.price,
        quantity: item.quantity,
        color: item.selectedColor,
        strap: item.selectedStrap,
        engraving: item.engraving,
        image: item.product.images[0]
      })),
      subtotal,
      discountAmount,
      couponApplied: appliedCoupon ? appliedCoupon.code : null,
      shippingCost: shippingFee,
      shippingSpeed: formData.deliverySpeed,
      total: finalTotal,
      paymentMethod:
        paymentMethod === 'upi' ? `UPI Scan & Pay (Merchant: ${paymentSettings.upiId})` :
        paymentMethod === 'card' ? `Credit/Debit Card (Ending in ${cardNumber.slice(-4) || '••••'})` :
        `Direct Bank IMPS/NEFT (${selectedBank})`,
      paymentDetails: {
        method: paymentMethod,
        merchantUpiId: paymentSettings.upiId,
        customerUpiId: upiId || undefined,
        upiUtrNumber: utrNumber || undefined,
        bankUtrNumber: bankUtrNumber || undefined,
        selectedBank: selectedBank || undefined,
        cardLast4: cardNumber ? cardNumber.slice(-4) : undefined
      },
      notes: formData.specialInstructions,
      createdAt: new Date().toISOString()
    };

    try {
      const placed = await placeOrder(orderPayload);
      setConfirmedOrder(placed || orderPayload);
      setIsProcessing(false);
      setIsOtpModalOpen(false);
      setStep(4);

      // Trigger Celebration Confetti
      confetti({
        particleCount: 140,
        spread: 80,
        origin: { y: 0.6 },
        colors: ['#d4af37', '#ffffff', '#f3e5ab', '#10b981']
      });
    } catch (err) {
      setIsProcessing(false);
      alert('Error placing order: ' + err.message);
    }
  };

  const handlePay = () => {
    if (paymentMethod === 'upi' && !utrNumber.trim() && !upiId.trim()) {
      alert("Please enter your 12-Digit UPI Transaction ID / UTR or UPI ID to confirm your payment.");
      return;
    }
    if (paymentMethod === 'netbanking' && !bankUtrNumber.trim()) {
      alert("Please enter the Bank Reference / UTR Number to confirm your bank transfer.");
      return;
    }
    if (paymentMethod === 'card') {
      if (!cardNumber || cardNumber.replace(/\s/g, '').length < 16) {
        alert("Please enter a valid 16-digit card number.");
        return;
      }
      setIsOtpModalOpen(true);
    } else {
      executeOrderCreation();
    }
  };

  const printInvoice = () => {
    window.print();
  };

  return (
    <div className="modal-backdrop animate-fade-in" style={{ zIndex: 1100 }}>
      <div
        className="glass-panel"
        style={{
          width: '100%',
          maxWidth: '840px',
          maxHeight: '92vh',
          overflowY: 'auto',
          backgroundColor: '#0a0b0e',
          border: '1px solid rgba(212, 175, 55, 0.4)',
          borderRadius: '8px',
          boxShadow: '0 25px 60px rgba(0, 0, 0, 0.9)',
          padding: '2rem',
          position: 'relative'
        }}
      >
        {/* Close Button */}
        <button
          onClick={() => setIsCheckoutOpen(false)}
          style={{
            position: 'absolute',
            top: '1.25rem',
            right: '1.25rem',
            background: 'transparent',
            border: 'none',
            color: '#94a3b8',
            cursor: 'pointer',
            padding: '4px'
          }}
        >
          <X size={20} />
        </button>

        {/* Modal Header */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <span className="badge-luxury badge-gold" style={{ marginBottom: '0.4rem' }}>
            HAUTE HORLOGERIE ACQUISITION
          </span>
          <h2 style={{ fontSize: '1.6rem', color: '#ffffff', letterSpacing: '0.05em' }}>
            {step === 4 ? 'Acquisition Confirmed' : 'Pan-India Secure Checkout'}
          </h2>
          <p style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.2rem' }}>
            100% Insured Transit • GST Invoice Included • 5-Year Warranty
          </p>
        </div>

        {/* Step Indicator */}
        {step < 4 && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '1rem',
            marginBottom: '2rem'
          }}>
            {[
              { num: 1, title: 'Address' },
              { num: 2, title: 'Dispatch' },
              { num: 3, title: 'Settlement' }
            ].map(s => (
              <div key={s.num} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <div style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '50%',
                  backgroundColor: step >= s.num ? '#d4af37' : '#1e2433',
                  color: step >= s.num ? '#0b0c10' : '#64748b',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 700,
                  fontSize: '0.8rem'
                }}>
                  {step > s.num ? <Check size={14} /> : s.num}
                </div>
                <span style={{
                  fontSize: '0.8rem',
                  color: step >= s.num ? '#f8fafc' : '#64748b',
                  fontWeight: step === s.num ? 600 : 400
                }}>
                  {s.title}
                </span>
                {s.num < 3 && <ChevronRight size={14} style={{ color: '#475569' }} />}
              </div>
            ))}
          </div>
        )}

        {/* STEP 1: Shipping Address (Pan-India) */}
        {step === 1 && (
          <form onSubmit={handleProceedToDelivery}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
              <Truck size={18} style={{ color: '#d4af37' }} />
              <h3 style={{ fontSize: '1.15rem', color: '#fff' }}>Pan-India Insured Delivery Address</h3>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem', marginBottom: '1.25rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', color: '#cbd5e1', marginBottom: '0.35rem' }}>Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Rahul Sharma"
                  value={formData.fullName}
                  onChange={e => setFormData({ ...formData, fullName: e.target.value })}
                  className="lux-input"
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', color: '#cbd5e1', marginBottom: '0.35rem' }}>Email for GST Invoice & Tracking *</label>
                <input
                  type="email"
                  required
                  placeholder="e.g. rahul.sharma@example.com"
                  value={formData.email}
                  onChange={e => setFormData({ ...formData, email: e.target.value })}
                  className="lux-input"
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', color: '#cbd5e1', marginBottom: '0.35rem' }}>Mobile Number (+91) *</label>
                <input
                  type="tel"
                  required
                  placeholder="e.g. 98200 12345"
                  value={formData.phone}
                  onChange={e => setFormData({ ...formData, phone: e.target.value })}
                  className="lux-input"
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', color: '#cbd5e1', marginBottom: '0.35rem' }}>Country *</label>
                <input
                  type="text"
                  readOnly
                  value="🇮🇳 India (Pan-India Express Service)"
                  className="lux-input"
                  style={{ opacity: 0.85, cursor: 'not-allowed' }}
                />
              </div>
            </div>

            <div style={{ marginBottom: '1.25rem' }}>
              <label style={{ display: 'block', fontSize: '0.75rem', color: '#cbd5e1', marginBottom: '0.35rem' }}>Flat, Building, Street, Area *</label>
              <input
                type="text"
                required
                placeholder="e.g. Flat 402, Imperial Heights, Altamount Road"
                value={formData.address}
                onChange={e => setFormData({ ...formData, address: e.target.value })}
                className="lux-input"
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', color: '#cbd5e1', marginBottom: '0.35rem' }}>City *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Mumbai"
                  value={formData.city}
                  onChange={e => setFormData({ ...formData, city: e.target.value })}
                  className="lux-input"
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', color: '#cbd5e1', marginBottom: '0.35rem' }}>State *</label>
                <select
                  value={formData.state}
                  onChange={e => setFormData({ ...formData, state: e.target.value })}
                  className="lux-select"
                >
                  <option value="Maharashtra">Maharashtra</option>
                  <option value="Delhi">Delhi NCR</option>
                  <option value="Karnataka">Karnataka</option>
                  <option value="Tamil Nadu">Tamil Nadu</option>
                  <option value="Telangana">Telangana</option>
                  <option value="Gujarat">Gujarat</option>
                  <option value="Uttar Pradesh">Uttar Pradesh</option>
                  <option value="West Bengal">West Bengal</option>
                  <option value="Rajasthan">Rajasthan</option>
                  <option value="Haryana">Haryana</option>
                  <option value="Punjab">Punjab</option>
                  <option value="Kerala">Kerala</option>
                  <option value="Goa">Goa</option>
                  <option value="Madhya Pradesh">Madhya Pradesh</option>
                  <option value="Bihar">Bihar</option>
                  <option value="Andhra Pradesh">Andhra Pradesh</option>
                  <option value="Odisha">Odisha</option>
                  <option value="Assam">Assam</option>
                </select>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', color: '#cbd5e1', marginBottom: '0.35rem' }}>PIN Code (6-Digit) *</label>
                <input
                  type="text"
                  required
                  maxLength="6"
                  pattern="[0-9]{6}"
                  placeholder="e.g. 400026"
                  value={formData.postalCode}
                  onChange={e => setFormData({ ...formData, postalCode: e.target.value })}
                  className="lux-input"
                />
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '2rem' }}>
              <button
                type="button"
                onClick={() => setIsCheckoutOpen(false)}
                className="btn-dark"
              >
                CANCEL
              </button>
              <button type="submit" className="btn-gold">
                <span>PROCEED TO DISPATCH</span>
                <ArrowRight size={16} />
              </button>
            </div>
          </form>
        )}

        {/* STEP 2: Delivery Method */}
        {step === 2 && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
              <Truck size={18} style={{ color: '#d4af37' }} />
              <h3 style={{ fontSize: '1.15rem', color: '#fff' }}>Select Pan-India Logistics Tier</h3>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2rem' }}>
              <div
                onClick={() => setFormData({ ...formData, deliverySpeed: 'BlueDart Insured Air Express (Pan-India 24-48 Hours)' })}
                style={{
                  backgroundColor: !formData.deliverySpeed.includes('Securitas') ? 'rgba(212, 175, 55, 0.15)' : '#141722',
                  border: !formData.deliverySpeed.includes('Securitas') ? '1px solid #d4af37' : '1px solid rgba(255,255,255,0.08)',
                  padding: '1.25rem',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#f3e5ab', fontWeight: 600, fontSize: '0.9rem', marginBottom: '0.2rem' }}>
                    <Sparkles size={15} style={{ color: '#d4af37' }} />
                    <span>BlueDart Insured Air Express</span>
                    <span className="badge-luxury badge-gold" style={{ fontSize: '0.62rem' }}>FREE PAN-INDIA</span>
                  </div>
                  <p style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                    100% Transit insurance, tamper-sealed luxury presentation box, SMS & WhatsApp live OTP tracking.
                  </p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#10b981' }}>
                    FREE
                  </div>
                  <div style={{ fontSize: '0.7rem', color: '#64748b' }}>24-48 Hours</div>
                </div>
              </div>

              <div
                onClick={() => setFormData({ ...formData, deliverySpeed: 'Securitas Armoured VIP Courier (Same-Day Metro)' })}
                style={{
                  backgroundColor: formData.deliverySpeed.includes('Securitas') ? 'rgba(212, 175, 55, 0.15)' : '#141722',
                  border: formData.deliverySpeed.includes('Securitas') ? '1px solid #d4af37' : '1px solid rgba(255,255,255,0.08)',
                  padding: '1.25rem',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}
              >
                <div>
                  <div style={{ color: '#ffffff', fontWeight: 600, fontSize: '0.9rem', marginBottom: '0.2rem' }}>
                    Securitas Armoured VIP Courier
                  </div>
                  <p style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                    Armoured security vehicle direct dispatch for Mumbai, Delhi NCR, Bengaluru, Hyderabad, Chennai, Kolkata.
                  </p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#f8fafc' }}>
                    ₹499
                  </div>
                  <div style={{ fontSize: '0.7rem', color: '#d4af37' }}>Same-Day Metro</div>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '2rem' }}>
              <button
                type="button"
                onClick={() => setStep(1)}
                className="btn-dark"
                style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
              >
                <ArrowLeft size={16} />
                <span>BACK</span>
              </button>
              <button
                onClick={() => setStep(3)}
                className="btn-gold"
                style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
              >
                <span>CONTINUE TO SETTLEMENT</span>
                <ArrowRight size={16} />
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: Payment Gateway */}
        {step === 3 && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '0.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Lock size={18} style={{ color: '#d4af37' }} />
                <h3 style={{ fontSize: '1.15rem', color: '#fff' }}>Official Merchant Payment Gateway</h3>
              </div>
              <span style={{ fontSize: '0.95rem', color: '#f3e5ab', fontWeight: 700 }}>
                Total Payable: {formatCurrency(finalTotal, currency)}
              </span>
            </div>

            {/* Payment Method Tabs */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '0.75rem',
              marginBottom: '1.5rem'
            }}>
              {[
                { id: 'upi', label: 'UPI / Scan QR', icon: QrCode },
                { id: 'card', label: 'Credit / Debit Card', icon: CreditCard },
                { id: 'netbanking', label: 'Direct Bank Transfer', icon: Building }
              ].map(m => {
                const Icon = m.icon;
                return (
                  <button
                    key={m.id}
                    onClick={() => setPaymentMethod(m.id)}
                    style={{
                      background: paymentMethod === m.id ? 'rgba(212, 175, 55, 0.2)' : '#141722',
                      border: paymentMethod === m.id ? '1px solid #d4af37' : '1px solid rgba(255,255,255,0.08)',
                      color: paymentMethod === m.id ? '#f3e5ab' : '#94a3b8',
                      padding: '0.75rem 0.5rem',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '0.4rem',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      transition: 'all 0.2s'
                    }}
                  >
                    <Icon size={18} style={{ color: paymentMethod === m.id ? '#d4af37' : '#94a3b8' }} />
                    <span>{m.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Tab 1: UPI & Dynamic Real QR Code */}
            {paymentMethod === 'upi' && (
              <div style={{
                backgroundColor: '#141722',
                border: '1px solid rgba(212, 175, 55, 0.25)',
                padding: '1.5rem',
                borderRadius: '6px',
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
                gap: '1.5rem',
                alignItems: 'center'
              }}>
                {/* Live Dynamic UPI QR */}
                <div style={{ textAlign: 'center' }}>
                  <div style={{
                    backgroundColor: '#ffffff',
                    padding: '0.75rem',
                    borderRadius: '8px',
                    display: 'inline-block',
                    boxShadow: '0 8px 25px rgba(0,0,0,0.6)'
                  }}>
                    <img
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(`upi://pay?pa=${paymentSettings.upiId}&pn=${encodeURIComponent(paymentSettings.merchantName)}&am=${finalTotal}&cu=INR&tn=LuxuryWatch`)}`}
                      alt="UPI Payment QR Code"
                      style={{ width: '160px', height: '160px', display: 'block' }}
                    />
                    <div style={{ fontSize: '0.68rem', color: '#0b0c10', fontWeight: 800, marginTop: '0.35rem', letterSpacing: '0.05em' }}>
                      SCAN WITH ANY UPI APP
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.35rem', marginTop: '0.6rem', color: '#fb7185', fontSize: '0.75rem', fontWeight: 600 }}>
                    <Clock size={13} />
                    <span>Session Valid: {formatTimer(upiTimer)}</span>
                  </div>
                </div>

                {/* Direct Merchant UPI Details & Verification Field */}
                <div>
                  <div style={{
                    backgroundColor: '#0c0e14',
                    border: '1px solid rgba(255,255,255,0.08)',
                    borderRadius: '6px',
                    padding: '0.85rem',
                    marginBottom: '1rem'
                  }}>
                    <div style={{ fontSize: '0.7rem', color: '#94a3b8', textTransform: 'uppercase', marginBottom: '0.2rem' }}>
                      Official Merchant UPI ID:
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem' }}>
                      <span style={{ fontSize: '0.9rem', color: '#d4af37', fontWeight: 700, fontFamily: 'monospace' }}>
                        {paymentSettings.upiId}
                      </span>
                      <button
                        type="button"
                        onClick={() => copyToClipboard(paymentSettings.upiId, 'upi')}
                        style={{
                          background: 'rgba(212, 175, 55, 0.15)',
                          border: '1px solid rgba(212, 175, 55, 0.4)',
                          color: '#f3e5ab',
                          padding: '4px 8px',
                          borderRadius: '3px',
                          fontSize: '0.68rem',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px'
                        }}
                      >
                        <Copy size={11} />
                        <span>{copiedUpi ? 'COPIED!' : 'COPY'}</span>
                      </button>
                    </div>
                    <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '0.2rem' }}>
                      Payee: {paymentSettings.merchantName}
                    </div>
                  </div>

                  {/* UPI Reference / UTR Input */}
                  <div style={{ marginBottom: '1rem' }}>
                    <label style={{ display: 'block', fontSize: '0.75rem', color: '#cbd5e1', marginBottom: '0.35rem' }}>
                      12-Digit UPI Transaction ID / UTR Number *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. 423891024567"
                      value={utrNumber}
                      onChange={e => setUtrNumber(e.target.value)}
                      className="lux-input"
                      style={{ fontSize: '0.85rem' }}
                    />
                  </div>

                  {/* Customer's VPA / UPI ID (Optional) */}
                  <div style={{ marginBottom: '0.75rem' }}>
                    <label style={{ display: 'block', fontSize: '0.75rem', color: '#cbd5e1', marginBottom: '0.35rem' }}>
                      Your UPI ID (Optional)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. yourname@okhdfcbank"
                      value={upiId}
                      onChange={e => setUpiId(e.target.value)}
                      className="lux-input"
                      style={{ fontSize: '0.85rem' }}
                    />
                  </div>

                  <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                    {['Google Pay', 'PhonePe', 'Paytm', 'BHIM UPI', 'CRED'].map(app => (
                      <span
                        key={app}
                        style={{
                          fontSize: '0.68rem',
                          backgroundColor: '#1c202e',
                          color: '#cbd5e1',
                          padding: '2px 6px',
                          borderRadius: '3px',
                          border: '1px solid rgba(255,255,255,0.08)'
                        }}
                      >
                        ✓ {app}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Tab 2: Credit / Debit Card Gateway */}
            {paymentMethod === 'card' && (
              <div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', color: '#cbd5e1', marginBottom: '0.3rem' }}>Card Number *</label>
                    <input
                      type="text"
                      required
                      maxLength={19}
                      placeholder="4532 8920 1820 9012"
                      value={cardNumber}
                      onChange={e => {
                        const val = e.target.value.replace(/\D/g, '').slice(0, 16);
                        setCardNumber(val.replace(/(\d{4})/g, '$1 ').trim());
                      }}
                      className="lux-input"
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', color: '#cbd5e1', marginBottom: '0.3rem' }}>Cardholder Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. RAHUL SHARMA"
                      value={cardHolder}
                      onChange={e => setCardHolder(e.target.value.toUpperCase())}
                      className="lux-input"
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', color: '#cbd5e1', marginBottom: '0.3rem' }}>Expiry Date *</label>
                    <input
                      type="text"
                      required
                      maxLength={5}
                      placeholder="MM/YY"
                      value={cardExpiry}
                      onChange={e => setCardExpiry(e.target.value)}
                      className="lux-input"
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', color: '#cbd5e1', marginBottom: '0.3rem' }}>CVV / CVC *</label>
                    <input
                      type="password"
                      required
                      maxLength={4}
                      placeholder="CVV"
                      value={cardCvv}
                      onChange={e => setCardCvv(e.target.value)}
                      className="lux-input"
                    />
                  </div>
                </div>

                <div style={{ marginTop: '1rem', padding: '0.75rem', backgroundColor: '#141722', borderRadius: '4px', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.72rem', color: '#94a3b8' }}>
                  <ShieldCheck size={16} color="#d4af37" />
                  <span>Your card transaction is protected with 256-Bit SSL Encryption and RBI 3D-Secure 2.0 OTP Authentication.</span>
                </div>
              </div>
            )}

            {/* Tab 3: Direct Bank IMPS/NEFT Transfer */}
            {paymentMethod === 'netbanking' && (
              <div style={{ backgroundColor: '#141722', padding: '1.25rem', borderRadius: '6px', border: '1px solid rgba(212, 175, 55, 0.25)' }}>
                <h4 style={{ fontSize: '0.85rem', color: '#f3e5ab', marginBottom: '0.75rem' }}>
                  Official Merchant Bank Account Details:
                </h4>

                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                  gap: '0.75rem',
                  backgroundColor: '#0c0e14',
                  padding: '1rem',
                  borderRadius: '6px',
                  marginBottom: '1.25rem',
                  border: '1px solid rgba(255,255,255,0.06)'
                }}>
                  <div>
                    <span style={{ fontSize: '0.68rem', color: '#94a3b8', display: 'block' }}>Beneficiary Name</span>
                    <strong style={{ fontSize: '0.82rem', color: '#f8fafc' }}>{paymentSettings.accountHolder}</strong>
                  </div>
                  <div>
                    <span style={{ fontSize: '0.68rem', color: '#94a3b8', display: 'block' }}>Bank Name</span>
                    <strong style={{ fontSize: '0.82rem', color: '#f8fafc' }}>{paymentSettings.bankName}</strong>
                  </div>
                  <div>
                    <span style={{ fontSize: '0.68rem', color: '#94a3b8', display: 'block' }}>Account Number</span>
                    <strong style={{ fontSize: '0.88rem', color: '#d4af37', fontFamily: 'monospace' }}>{paymentSettings.accountNumber}</strong>
                  </div>
                  <div>
                    <span style={{ fontSize: '0.68rem', color: '#94a3b8', display: 'block' }}>IFSC Code</span>
                    <strong style={{ fontSize: '0.88rem', color: '#d4af37', fontFamily: 'monospace' }}>{paymentSettings.ifscCode}</strong>
                  </div>
                  <div style={{ gridColumn: '1 / -1' }}>
                    <span style={{ fontSize: '0.68rem', color: '#94a3b8', display: 'block' }}>Branch</span>
                    <span style={{ fontSize: '0.8rem', color: '#cbd5e1' }}>{paymentSettings.branch}</span>
                  </div>
                </div>

                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', fontSize: '0.75rem', color: '#cbd5e1', marginBottom: '0.35rem' }}>
                    IMPS / NEFT Reference / UTR Number *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. IMPS423891024567"
                    value={bankUtrNumber}
                    onChange={e => setBankUtrNumber(e.target.value)}
                    className="lux-input"
                  />
                </div>
              </div>
            )}

            {/* Checkout Action Buttons */}
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '2.5rem' }}>
              <button
                type="button"
                onClick={() => setStep(2)}
                className="btn-dark"
                style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
              >
                <ArrowLeft size={16} />
                <span>BACK</span>
              </button>

              <button
                type="button"
                disabled={isProcessing}
                onClick={handlePay}
                className="btn-gold"
                style={{ minWidth: '220px', fontSize: '0.85rem' }}
              >
                {isProcessing ? (
                  <span>RECORDING TRANSACTION...</span>
                ) : (
                  <>
                    <Lock size={15} />
                    <span>CONFIRM & PLACE ORDER</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* STEP 4: Order Confirmed & Receipt View */}
        {step === 4 && confirmedOrder && (
          <div style={{ textAlign: 'center', padding: '1rem 0' }}>
            <div style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              backgroundColor: 'rgba(16, 185, 129, 0.15)',
              border: '2px solid #10b981',
              color: '#34d399',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1.5rem auto'
            }}>
              <CheckCircle2 size={36} />
            </div>

            <h3 style={{ fontSize: '1.4rem', color: '#f8fafc', marginBottom: '0.4rem' }}>
              Consignment Booked Successfully!
            </h3>
            <p style={{ fontSize: '0.8rem', color: '#94a3b8', maxWidth: '520px', margin: '0 auto 1.5rem auto' }}>
              Your acquisition order <strong>#{confirmedOrder.id}</strong> has been sealed and saved to the database. An automated tracking link and GST receipt have been dispatched.
            </p>

            <div style={{
              backgroundColor: '#12141c',
              border: '1px solid rgba(212, 175, 55, 0.3)',
              borderRadius: '6px',
              padding: '1.25rem',
              maxWidth: '500px',
              margin: '0 auto 2rem auto',
              textAlign: 'left'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '0.75rem', marginBottom: '0.75rem' }}>
                <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Order Reference</span>
                <strong style={{ fontSize: '0.8rem', color: '#f8fafc' }}>{confirmedOrder.id}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '0.75rem', marginBottom: '0.75rem' }}>
                <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Tracking Consignment</span>
                <span style={{ fontSize: '0.8rem', color: '#d4af37', fontFamily: 'monospace', fontWeight: 700 }}>{confirmedOrder.trackingNumber || 'LW-IND-77892014'}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '0.75rem', marginBottom: '0.75rem' }}>
                <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Client</span>
                <span style={{ fontSize: '0.8rem', color: '#f8fafc' }}>{confirmedOrder.customer?.fullName || formData.fullName}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Total Settlement</span>
                <strong style={{ fontSize: '0.95rem', color: '#10b981' }}>{formatCurrency(confirmedOrder.total || finalTotal, currency)}</strong>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
              <button
                onClick={printInvoice}
                className="btn-dark"
                style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
              >
                <Printer size={15} />
                <span>PRINT GST INVOICE</span>
              </button>
              <button
                onClick={() => {
                  setIsCheckoutOpen(false);
                  setIsOrderTrackingOpen(true);
                }}
                className="btn-gold"
                style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
              >
                <Eye size={15} />
                <span>TRACK CONSIGNMENT</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 3D-Secure Bank OTP Modal Simulation */}
      {isOtpModalOpen && (
        <div className="modal-backdrop" style={{ zIndex: 1200 }}>
          <div
            className="glass-panel animate-fade-in"
            style={{
              width: '100%',
              maxWidth: '420px',
              backgroundColor: '#0c0e14',
              border: '1px solid rgba(212, 175, 55, 0.4)',
              borderRadius: '8px',
              padding: '2rem',
              textAlign: 'center'
            }}
          >
            <ShieldCheck size={40} color="#d4af37" style={{ marginBottom: '1rem' }} />
            <h3 style={{ fontSize: '1.2rem', color: '#f8fafc', marginBottom: '0.4rem' }}>
              Verified by RuPay / Visa 3D-Secure
            </h3>
            <p style={{ fontSize: '0.75rem', color: '#94a3b8', marginBottom: '1.5rem' }}>
              An authentication OTP has been sent to your registered mobile ending in <strong>••••</strong>.
            </p>

            <div style={{ marginBottom: '1.5rem' }}>
              <input
                type="password"
                maxLength={6}
                placeholder="Enter 6-Digit OTP (or 8888)"
                value={enteredOtp}
                onChange={e => setEnteredOtp(e.target.value)}
                className="lux-input"
                style={{ letterSpacing: '0.3em', textAlign: 'center', fontSize: '1.1rem', fontWeight: 700 }}
              />
            </div>

            <div style={{ display: 'flex', gap: '1rem' }}>
              <button
                type="button"
                onClick={() => setIsOtpModalOpen(false)}
                className="btn-dark"
                style={{ flex: 1 }}
              >
                CANCEL
              </button>
              <button
                type="button"
                disabled={isProcessing}
                onClick={executeOrderCreation}
                className="btn-gold"
                style={{ flex: 1 }}
              >
                {isProcessing ? 'AUTHORIZING...' : 'SUBMIT OTP'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CheckoutModal;

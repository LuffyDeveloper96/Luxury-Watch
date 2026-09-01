import React, { useState, useEffect } from 'react';
import { useStore } from '../context/StoreContext';
import { formatCurrency } from '../utils/currency';
import {
  Search, Package, CheckCircle2, Clock, Truck, ShieldCheck,
  AlertCircle, Sparkles, MapPin, ExternalLink, RotateCcw, ArrowLeft, Watch
} from 'lucide-react';

export const TrackConsignmentPage = ({ onBack, onOpenReturnForOrder }) => {
  const { orders, currency } = useStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [searchedOrder, setSearchedOrder] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');

  // Automatically scroll to top on mount
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    setErrorMessage('');
    const clean = searchQuery.trim().toUpperCase();

    const found = orders.find(
      o => o.id.toUpperCase() === clean || o.customer?.email?.toLowerCase() === searchQuery.trim().toLowerCase()
    );

    if (found) {
      setSearchedOrder(found);
    } else {
      setErrorMessage(`No consignment record found for "${searchQuery}". Please check your order ID.`);
      setSearchedOrder(null);
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

  const currentStage = searchedOrder ? getStageIndex(searchedOrder.orderStatus) : 1;

  const stages = [
    { title: "Reservation Confirmed", desc: "Order validated & movement selected" },
    { title: "Atelier Assembly & Engraving", desc: "Regulation & laser caseback personalized" },
    { title: "Armoured Dispatch", desc: "Sealed & handed to diplomatic courier" },
    { title: "White-Glove Delivery", desc: "Insured recipient hand-off" }
  ];

  return (
    <div style={{ backgroundColor: '#fbfbf9', minHeight: '100vh', padding: '6rem 1rem 4rem 1rem' }}>
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        
        <button
          onClick={onBack}
          className="btn-outline-gold"
          style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', marginBottom: '2rem' }}
        >
          <ArrowLeft size={16} /> Return to Store
        </button>

        <div style={{ 
          backgroundColor: '#ffffff',
          borderRadius: '8px',
          border: '1px solid rgba(180, 140, 30, 0.2)',
          padding: 'clamp(2rem, 5vw, 4rem)',
          boxShadow: '0 25px 60px rgba(15, 23, 42, 0.05)'
        }}>
          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', color: '#8a6709', marginBottom: '0.5rem' }}>
              <Package size={24} />
              <span style={{ fontSize: '0.85rem', letterSpacing: '0.2em', textTransform: 'uppercase', fontWeight: 700 }}>
                CONCIERGE TRACKING
              </span>
            </div>
            <h1 style={{ fontSize: 'clamp(1.8rem, 4vw, 2.5rem)', color: '#0f172a', fontFamily: 'var(--font-brand)', margin: '0' }}>Track Your Consignment</h1>
            <p style={{ color: '#64748b', marginTop: '1rem' }}>Enter your order ID or email address to view the current status of your timepiece.</p>
          </div>

          {/* Search Bar */}
          <form onSubmit={handleSearch} style={{ display: 'flex', gap: '0.5rem', marginBottom: '2rem' }}>
            <div style={{ position: 'relative', flex: 1 }}>
              <Search size={18} color="#94a3b8" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }} />
              <input
                type="text"
                placeholder="Enter Order ID (e.g., order_LW_...) or Email"
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
              disabled={!searchQuery.trim()}
            >
              Locate Order
            </button>
          </form>

          {errorMessage && (
            <div style={{ backgroundColor: '#fef2f2', border: '1px solid #fecaca', padding: '1rem', borderRadius: '4px', color: '#991b1b', fontSize: '0.88rem', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '2rem' }}>
              <AlertCircle size={18} />
              {errorMessage}
            </div>
          )}

          {/* Result View */}
          {searchedOrder && (
            <div className="animate-fade-in">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', paddingBottom: '1.5rem', borderBottom: '1px solid rgba(0,0,0,0.06)', marginBottom: '2rem' }}>
                <div>
                  <div style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>Consignment ID</div>
                  <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0f172a', fontFamily: 'monospace' }}>{searchedOrder.id}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>Estimated Delivery</div>
                  <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#16a34a' }}>
                    {new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </div>
                </div>
              </div>

              {/* Progress Tracker */}
              <div style={{ position: 'relative', marginBottom: '3rem', padding: '0 1rem' }}>
                <div style={{ position: 'absolute', top: '16px', left: '2rem', right: '2rem', height: '3px', background: '#e2e8f0', zIndex: 0 }} />
                <div style={{ position: 'absolute', top: '16px', left: '2rem', width: `${(currentStage - 1) * 33.33}%`, height: '3px', background: 'linear-gradient(90deg, #d4af37, #b48c1e)', zIndex: 1, transition: 'width 0.8s ease' }} />

                <div style={{ display: 'flex', justifyContent: 'space-between', position: 'relative', zIndex: 2 }}>
                  {stages.map((stage, idx) => {
                    const step = idx + 1;
                    const isActive = step <= currentStage;
                    const isCurrent = step === currentStage;
                    return (
                      <div key={idx} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '25%', textAlign: 'center' }}>
                        <div style={{
                          width: '34px', height: '34px', borderRadius: '50%',
                          backgroundColor: isActive ? '#ffffff' : '#f8fafc',
                          border: isActive ? '2px solid #d4af37' : '2px solid #cbd5e1',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          color: isActive ? '#d4af37' : '#94a3b8',
                          boxShadow: isCurrent ? '0 0 0 4px rgba(212, 175, 55, 0.15)' : 'none',
                          marginBottom: '0.75rem',
                          transition: 'all 0.3s ease'
                        }}>
                          {isActive ? <CheckCircle2 size={18} /> : <Clock size={16} />}
                        </div>
                        <span style={{ fontSize: '0.75rem', fontWeight: isActive ? 700 : 500, color: isActive ? '#0f172a' : '#64748b', marginBottom: '4px' }}>{stage.title}</span>
                        <span style={{ fontSize: '0.65rem', color: '#94a3b8', maxWidth: '120px', lineHeight: 1.3 }}>{stage.desc}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Order Items */}
              <div style={{ backgroundColor: '#f8fafc', borderRadius: '8px', padding: '1.5rem', marginBottom: '1.5rem', border: '1px solid rgba(0,0,0,0.05)' }}>
                <h4 style={{ fontSize: '0.9rem', color: '#0f172a', fontWeight: 700, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Package size={16} color="#8a6709" /> Allocated Timepieces
                </h4>
                {searchedOrder.items.map((item, idx) => (
                  <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '1rem', paddingBottom: idx !== searchedOrder.items.length - 1 ? '1rem' : 0, borderBottom: idx !== searchedOrder.items.length - 1 ? '1px solid rgba(0,0,0,0.06)' : 'none', marginBottom: idx !== searchedOrder.items.length - 1 ? '1rem' : 0 }}>
                    <div style={{ width: '48px', height: '48px', borderRadius: '4px', backgroundColor: '#ffffff', border: '1px solid rgba(0,0,0,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Watch size={24} color="#d4af37" />
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0f172a' }}>{item.name}</div>
                      <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Qty: {item.quantity} • {item.selectedColor} • {item.selectedStrap}</div>
                    </div>
                    <div style={{ fontSize: '0.9rem', fontWeight: 600, color: '#0f172a' }}>
                      {formatCurrency(item.price, currency)}
                    </div>
                  </div>
                ))}
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
                <button
                  onClick={() => {
                    onBack();
                    setTimeout(() => onOpenReturnForOrder(searchedOrder.id), 100);
                  }}
                  style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 16px', backgroundColor: '#ffffff', border: '1px solid #cbd5e1', color: '#475569', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer' }}
                >
                  <RotateCcw size={16} /> Request Return
                </button>
                <button
                  style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 16px', backgroundColor: '#f8fafc', border: '1px solid #d4af37', color: '#8a6709', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer' }}
                >
                  <ExternalLink size={16} /> Download Invoice
                </button>
              </div>

            </div>
          )}
        </div>
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { formatCurrency } from '../utils/currency';
import {
  X, Search, Package, CheckCircle2, Clock, Truck, ShieldCheck,
  AlertCircle, Sparkles, MapPin, PhoneCall, ExternalLink
} from 'lucide-react';

export const OrderTrackingModal = () => {
  const { isOrderTrackingOpen, setIsOrderTrackingOpen, orders, currency } = useStore();

  const [searchQuery, setSearchQuery] = useState('ORD-AK-98421');
  const [searchedOrder, setSearchedOrder] = useState(() => orders[0] || null);
  const [errorMessage, setErrorMessage] = useState('');

  if (!isOrderTrackingOpen) return null;

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
    <div className="modal-backdrop animate-fade-in" style={{ zIndex: 1100 }}>
      <div
        className="glass-panel"
        style={{
          maxWidth: '720px',
          width: '100%',
          maxHeight: '90vh',
          overflowY: 'auto',
          backgroundColor: '#0c0e14',
          border: '1px solid rgba(212, 175, 55, 0.4)',
          padding: '2rem',
          position: 'relative'
        }}
      >
        <button
          onClick={() => setIsOrderTrackingOpen(false)}
          style={{
            position: 'absolute',
            top: '1.25rem',
            right: '1.25rem',
            background: 'rgba(255,255,255,0.06)',
            border: 'none',
            color: '#94a3b8',
            borderRadius: '50%',
            width: '34px',
            height: '34px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <X size={18} />
        </button>

        {/* Modal Title */}
        <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', color: '#d4af37', marginBottom: '0.3rem' }}>
            <Package size={20} />
            <span style={{ fontSize: '0.72rem', letterSpacing: '0.2em', textTransform: 'uppercase', fontWeight: 600 }}>
              CONCIERGE TRACKING
            </span>
          </div>
          <h2 style={{ fontSize: '1.5rem', color: '#ffffff' }}>Track Your Timepiece Consignment</h2>
        </div>

        {/* Search Bar */}
        <form onSubmit={handleSearch} style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.75rem' }}>
          <input
            type="text"
            placeholder="Enter Order ID (e.g. ORD-AK-98421) or Email..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="lux-input"
            style={{ fontSize: '0.85rem' }}
          />
          <button type="submit" className="btn-gold" style={{ fontSize: '0.8rem', padding: '0.6rem 1.25rem' }}>
            <Search size={14} />
            <span>TRACK</span>
          </button>
        </form>

        {errorMessage && (
          <div style={{
            backgroundColor: 'rgba(225, 29, 72, 0.12)',
            border: '1px solid rgba(225, 29, 72, 0.3)',
            color: '#fb7185',
            padding: '0.75rem',
            borderRadius: '4px',
            fontSize: '0.78rem',
            marginBottom: '1.5rem',
            textAlign: 'center'
          }}>
            {errorMessage}
          </div>
        )}

        {searchedOrder && (
          <div className="animate-fade-in">
            {/* Header info */}
            <div style={{
              backgroundColor: '#12151e',
              border: '1px solid rgba(212, 175, 55, 0.25)',
              padding: '1.25rem',
              borderRadius: '6px',
              marginBottom: '2rem',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '1rem'
            }}>
              <div>
                <div style={{ fontSize: '0.7rem', color: '#94a3b8', textTransform: 'uppercase' }}>Consignment ID</div>
                <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#f3e5ab' }}>{searchedOrder.id}</div>
                <div style={{ fontSize: '0.75rem', color: '#cbd5e1' }}>Tracking: {searchedOrder.trackingNumber}</div>
              </div>

              <div style={{ textAlign: 'right' }}>
                <span className="badge-luxury badge-gold" style={{ fontSize: '0.72rem' }}>
                  {searchedOrder.orderStatus.toUpperCase()}
                </span>
                <div style={{ fontSize: '0.7rem', color: '#94a3b8', marginTop: '0.3rem' }}>
                  Carrier: {searchedOrder.shippingSpeed}
                </div>
              </div>
            </div>

            {/* Timeline progression */}
            <div style={{ marginBottom: '2.5rem', position: 'relative' }}>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(4, 1fr)',
                gap: '0.75rem',
                position: 'relative'
              }}>
                {stages.map((stg, i) => {
                  const stageNum = i + 1;
                  const isDone = stageNum <= currentStage;
                  const isCurrent = stageNum === currentStage;

                  return (
                    <div key={i} style={{ textAlign: 'center', position: 'relative' }}>
                      <div style={{
                        width: '36px',
                        height: '36px',
                        borderRadius: '50%',
                        backgroundColor: isDone ? '#d4af37' : '#1a1d26',
                        color: isDone ? '#000' : '#64748b',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto 0.75rem auto',
                        fontWeight: 700,
                        fontSize: '0.8rem',
                        boxShadow: isCurrent ? '0 0 15px rgba(212,175,55,0.6)' : 'none',
                        border: isCurrent ? '2px solid #fff' : 'none'
                      }}>
                        {isDone ? '✓' : stageNum}
                      </div>
                      <div style={{ fontSize: '0.75rem', fontWeight: 600, color: isDone ? '#f8fafc' : '#64748b', marginBottom: '0.2rem' }}>
                        {stg.title}
                      </div>
                      <div style={{ fontSize: '0.65rem', color: '#94a3b8', lineHeight: 1.3 }}>
                        {stg.desc}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Items inside consignment */}
            <div style={{
              backgroundColor: '#12141c',
              padding: '1.25rem',
              borderRadius: '6px',
              border: '1px solid rgba(255,255,255,0.06)'
            }}>
              <div style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.75rem' }}>
                Included Pieces & Bespoke Specifications
              </div>
              {searchedOrder.items.map((it, idx) => (
                <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.6rem' }}>
                  <img src={it.image} alt={it.name} style={{ width: '48px', height: '48px', objectFit: 'cover', borderRadius: '4px' }} />
                  <div>
                    <div style={{ fontWeight: 600, color: '#f8fafc', fontSize: '0.85rem' }}>{it.name} (x{it.quantity})</div>
                    <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>{it.color} • {it.strap}</div>
                    {it.engraving && (
                      <div style={{ fontSize: '0.68rem', color: '#10b981' }}>Engraving Inscription: "{it.engraving}"</div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

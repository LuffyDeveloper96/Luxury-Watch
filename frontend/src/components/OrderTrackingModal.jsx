import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { formatCurrency } from '../utils/currency';
import {
  X, Search, Package, CheckCircle2, Clock, Truck, ShieldCheck,
  AlertCircle, Sparkles, MapPin, PhoneCall, ExternalLink, RotateCcw
} from 'lucide-react';

export const OrderTrackingModal = ({ onOpenReturnForOrder }) => {
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
          backgroundColor: '#ffffff',
          border: '1px solid rgba(180, 140, 30, 0.35)',
          padding: '2rem',
          position: 'relative',
          boxShadow: '0 25px 60px rgba(15, 23, 42, 0.15)'
        }}
      >
        <button
          onClick={() => setIsOrderTrackingOpen(false)}
          style={{
            position: 'absolute',
            top: '1.25rem',
            right: '1.25rem',
            background: 'rgba(0, 0, 0, 0.05)',
            border: 'none',
            color: '#64748b',
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
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', color: '#8a6709', marginBottom: '0.3rem' }}>
            <Package size={20} />
            <span style={{ fontSize: '0.72rem', letterSpacing: '0.2em', textTransform: 'uppercase', fontWeight: 700 }}>
              CONCIERGE TRACKING
            </span>
          </div>
          <h2 style={{ fontSize: '1.5rem', color: '#0f172a', fontWeight: 700 }}>Track Your Timepiece Consignment</h2>
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
            color: '#e11d48',
            padding: '0.75rem',
            borderRadius: '4px',
            fontSize: '0.78rem',
            marginBottom: '1.5rem',
            textAlign: 'center',
            fontWeight: 600
          }}>
            {errorMessage}
          </div>
        )}

        {searchedOrder && (
          <div className="animate-fade-in">
            {/* Header info */}
            <div style={{
              backgroundColor: '#fbfbf9',
              border: '1px solid rgba(180, 140, 30, 0.25)',
              padding: '1.25rem',
              borderRadius: '6px',
              marginBottom: '2rem',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '1rem',
              boxShadow: 'var(--shadow-sm)'
            }}>
              <div>
                <div style={{ fontSize: '0.7rem', color: '#64748b', textTransform: 'uppercase' }}>Consignment ID</div>
                <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0f172a' }}>{searchedOrder.id}</div>
                <div style={{ fontSize: '0.75rem', color: '#8a6709', fontWeight: 600 }}>Tracking: {searchedOrder.trackingNumber}</div>
              </div>

              <div style={{ textAlign: 'right' }}>
                <span className="badge-luxury badge-gold" style={{ fontSize: '0.72rem' }}>
                  {searchedOrder.orderStatus.toUpperCase()}
                </span>
                <div style={{ fontSize: '0.7rem', color: '#64748b', marginTop: '0.3rem' }}>
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
                        backgroundColor: isDone ? '#8a6709' : '#f1f5f9',
                        color: isDone ? '#ffffff' : '#64748b',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto 0.75rem auto',
                        fontWeight: 700,
                        fontSize: '0.8rem',
                        boxShadow: isCurrent ? '0 0 15px rgba(180,140,30,0.4)' : 'none',
                        border: isCurrent ? '2px solid #8a6709' : 'none'
                      }}>
                        {isDone ? '✓' : stageNum}
                      </div>
                      <div style={{ fontSize: '0.75rem', fontWeight: isDone ? 700 : 500, color: isDone ? '#0f172a' : '#64748b', marginBottom: '0.2rem' }}>
                        {stg.title}
                      </div>
                      <div style={{ fontSize: '0.65rem', color: '#64748b', lineHeight: 1.3 }}>
                        {stg.desc}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Items inside consignment */}
            <div style={{
              backgroundColor: '#fbfbf9',
              padding: '1.25rem',
              borderRadius: '6px',
              border: '1px solid rgba(0, 0, 0, 0.08)',
              boxShadow: 'var(--shadow-sm)',
              marginBottom: '1.25rem'
            }}>
              <div style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.75rem', fontWeight: 700 }}>
                Included Pieces & Bespoke Specifications
              </div>
              {searchedOrder.items.map((it, idx) => (
                <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.6rem' }}>
                  <img src={it.image} alt={it.name} style={{ width: '48px', height: '48px', objectFit: 'cover', borderRadius: '4px', backgroundColor: '#f8f7f4' }} />
                  <div>
                    <div style={{ fontWeight: 700, color: '#0f172a', fontSize: '0.85rem' }}>{it.name} (x{it.quantity})</div>
                    <div style={{ fontSize: '0.72rem', color: '#64748b' }}>{it.color} • {it.strap}</div>
                    {it.engraving && (
                      <div style={{ fontSize: '0.68rem', color: '#059669', fontWeight: 600 }}>Engraving Inscription: "{it.engraving}"</div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Return / Exchange Privilege Banner & Action */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '1rem 1.25rem',
              background: '#ffffff',
              border: '1.5px dashed rgba(180, 140, 30, 0.5)',
              borderRadius: '6px',
              flexWrap: 'wrap',
              gap: '1rem'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'rgba(180, 140, 30, 0.1)', color: '#8a6709', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <RotateCcw size={18} />
                </div>
                <div>
                  <h5 style={{ fontSize: '0.85rem', color: '#0f172a', fontWeight: 700, margin: 0 }}>7-Day Complimentary Return Privilege</h5>
                  <p style={{ fontSize: '0.72rem', color: '#64748b', margin: '2px 0 0 0' }}>Exchange for another timepiece model or receive a 100% full refund.</p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  setIsOrderTrackingOpen(false);
                  if (onOpenReturnForOrder) onOpenReturnForOrder(searchedOrder.id);
                }}
                className="btn-outline-gold"
                style={{ padding: '0.5rem 1.2rem', fontSize: '0.75rem' }}
              >
                <span>Initiate Return / Exchange</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

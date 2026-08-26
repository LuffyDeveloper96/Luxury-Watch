import React from 'react';
import { useStore } from '../context/StoreContext';
import { CheckCircle2, Award, Printer, Compass, X, Sparkles, ShieldCheck } from 'lucide-react';

export const OrderConfirmationModal = ({ onOpenTracking }) => {
  const { completedOrder, setCompletedOrder, formatPrice } = useStore();

  if (!completedOrder) return null;

  const order = completedOrder;

  const handlePrintInvoice = () => {
    window.print();
  };

  return (
    <div className="modal-backdrop" onClick={() => setCompletedOrder(null)}>
      <div
        className="glass-panel animate-fade-in"
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: '750px',
          maxHeight: '92vh',
          overflowY: 'auto',
          backgroundColor: '#ffffff',
          border: '1px solid var(--border-gold)',
          borderRadius: '8px',
          padding: '2.5rem',
          position: 'relative',
          boxShadow: '0 25px 60px rgba(15, 23, 42, 0.15)'
        }}
      >
        {/* Close */}
        <button
          onClick={() => setCompletedOrder(null)}
          style={{
            position: 'absolute',
            top: '1.25rem',
            right: '1.25rem',
            background: 'rgba(0, 0, 0, 0.05)',
            border: '1px solid rgba(0, 0, 0, 0.08)',
            color: '#64748b',
            width: '36px',
            height: '36px',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer'
          }}
          aria-label="Close confirmation"
        >
          <X size={18} />
        </button>

        {/* Celebration Header */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            background: 'rgba(180, 140, 30, 0.12)',
            border: '2px solid #d4af37',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1.25rem',
            color: '#8a6709'
          }}>
            <Sparkles size={32} />
          </div>

          <span style={{ fontSize: '0.75rem', letterSpacing: '0.2em', color: '#8a6709', textTransform: 'uppercase', fontWeight: 700 }}>
            ACQUISITION OFFICIALLY REGISTERED
          </span>

          <h2 style={{ fontSize: '1.8rem', color: '#0f172a', fontFamily: 'var(--font-brand)', margin: '6px 0', fontWeight: 700 }}>
            Thank You, {order.customer?.name}
          </h2>

          <p style={{ fontSize: '0.85rem', color: '#475569' }}>
            Order Reference: <strong style={{ color: '#8a6709', letterSpacing: '0.08em' }}>#{order.id}</strong>
          </p>
        </div>

        {/* Printable Haute Horlogerie Certificate / Invoice Section */}
        <div style={{
          background: '#fbfbf9',
          border: '1px solid rgba(180, 140, 30, 0.3)',
          borderRadius: '6px',
          padding: '1.75rem',
          marginBottom: '1.5rem',
          position: 'relative'
        }}>
          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(0, 0, 0, 0.08)', paddingBottom: '1rem', marginBottom: '1rem' }}>
            <div>
              <span style={{ fontFamily: 'var(--font-brand)', fontSize: '1.1rem', fontWeight: 700, color: '#0f172a' }}>
                LUXURY WATCH
              </span>
              <span style={{ fontSize: '0.65rem', color: '#64748b', display: 'block', letterSpacing: '0.15em', fontWeight: 600 }}>
                GENEVA VAULT CERTIFIED SETTLEMENT
              </span>
            </div>
            <div style={{ textAlign: 'right' }}>
              <span style={{ fontSize: '0.75rem', color: '#059669', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
                <CheckCircle2 size={14} />
                Payment Confirmed
              </span>
              <span style={{ fontSize: '0.68rem', color: '#64748b' }}>
                Tracking: {order.trackingNumber}
              </span>
            </div>
          </div>

          {/* Items */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '1.25rem' }}>
            {order.items?.map((item, idx) => (
              <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.85rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <img src={item.image} alt="" style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '3px', backgroundColor: '#f8f7f4' }} />
                  <div>
                    <span style={{ color: '#0f172a', fontWeight: 700 }}>{item.name}</span>
                    <span style={{ color: '#64748b', fontSize: '0.72rem', display: 'block' }}>
                      Edition: {item.variant} {item.engraving ? `• Engraved: "${item.engraving}"` : ''}
                    </span>
                  </div>
                </div>
                <span style={{ color: '#0f172a', fontWeight: 700 }}>
                  {formatPrice(item.price * item.quantity)}
                </span>
              </div>
            ))}
          </div>

          {/* Breakdown */}
          <div style={{ borderTop: '1px solid rgba(0, 0, 0, 0.08)', paddingTop: '0.75rem', display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '0.8rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748b' }}>
              <span>Method</span>
              <span style={{ color: '#0f172a', fontWeight: 600 }}>{order.paymentMethod}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748b' }}>
              <span>Insured Transit</span>
              <span style={{ color: '#059669', fontWeight: 700 }}>FREE ARMOURED COURIER</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.1rem', fontWeight: 700, color: '#0f172a', paddingTop: '6px', borderTop: '1px solid rgba(0, 0, 0, 0.08)' }}>
              <span>Total Settled</span>
              <span>{formatPrice(order.total)}</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <button
            onClick={handlePrintInvoice}
            className="btn-outline-gold"
            style={{ flex: 1, padding: '0.85rem' }}
          >
            <Printer size={16} />
            <span>Download / Print Tax Invoice</span>
          </button>

          <button
            onClick={() => {
              setCompletedOrder(null);
              onOpenTracking();
            }}
            className="btn-gold"
            style={{ flex: 1, padding: '0.85rem' }}
          >
            <Compass size={16} />
            <span>Track Order Delivery</span>
          </button>
        </div>
      </div>
    </div>
  );
};

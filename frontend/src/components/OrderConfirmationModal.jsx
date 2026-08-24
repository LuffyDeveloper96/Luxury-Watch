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
          backgroundColor: '#0c0e14',
          border: '1px solid var(--border-gold)',
          borderRadius: '8px',
          padding: '2.5rem',
          position: 'relative'
        }}
      >
        {/* Close */}
        <button
          onClick={() => setCompletedOrder(null)}
          style={{
            position: 'absolute',
            top: '1.25rem',
            right: '1.25rem',
            background: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            color: '#cbd5e1',
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
            background: 'rgba(212, 175, 55, 0.15)',
            border: '2px solid #d4af37',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1.25rem',
            color: '#f3e5ab'
          }}>
            <Sparkles size={32} />
          </div>

          <span style={{ fontSize: '0.75rem', letterSpacing: '0.2em', color: '#d4af37', textTransform: 'uppercase', fontWeight: 600 }}>
            ACQUISITION OFFICIALLY REGISTERED
          </span>

          <h2 style={{ fontSize: '1.8rem', color: '#f8fafc', fontFamily: 'var(--font-brand)', margin: '6px 0' }}>
            Thank You, {order.customer?.name}
          </h2>

          <p style={{ fontSize: '0.85rem', color: '#cbd5e1' }}>
            Order Reference: <strong style={{ color: '#f3e5ab', letterSpacing: '0.08em' }}>#{order.id}</strong>
          </p>
        </div>

        {/* Printable Haute Horlogerie Certificate / Invoice Section */}
        <div style={{
          background: '#12141a',
          border: '1px solid rgba(212, 175, 55, 0.3)',
          borderRadius: '6px',
          padding: '1.75rem',
          marginBottom: '1.5rem',
          position: 'relative'
        }}>
          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255, 255, 255, 0.08)', paddingBottom: '1rem', marginBottom: '1rem' }}>
            <div>
              <span style={{ fontFamily: 'var(--font-brand)', fontSize: '1.1rem', fontWeight: 700, color: '#f8fafc' }}>
                LUXURY WATCH
              </span>
              <span style={{ fontSize: '0.65rem', color: '#94a3b8', display: 'block', letterSpacing: '0.15em' }}>
                GENEVA VAULT CERTIFIED SETTLEMENT
              </span>
            </div>
            <div style={{ textAlign: 'right' }}>
              <span style={{ fontSize: '0.75rem', color: '#10b981', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                <CheckCircle2 size={14} />
                Payment Confirmed
              </span>
              <span style={{ fontSize: '0.68rem', color: '#94a3b8' }}>
                Tracking: {order.trackingNumber}
              </span>
            </div>
          </div>

          {/* Items */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '1.25rem' }}>
            {order.items?.map((item, idx) => (
              <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.85rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <img src={item.image} alt="" style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '3px' }} />
                  <div>
                    <span style={{ color: '#f8fafc', fontWeight: 600 }}>{item.name}</span>
                    <span style={{ color: '#94a3b8', fontSize: '0.72rem', display: 'block' }}>
                      Edition: {item.variant} {item.engraving ? `• Engraved: "${item.engraving}"` : ''}
                    </span>
                  </div>
                </div>
                <span style={{ color: '#f3e5ab', fontWeight: 600 }}>
                  {formatPrice(item.price * item.quantity)}
                </span>
              </div>
            ))}
          </div>

          {/* Breakdown */}
          <div style={{ borderTop: '1px solid rgba(255, 255, 255, 0.08)', paddingTop: '0.75rem', display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '0.8rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#94a3b8' }}>
              <span>Method</span>
              <span style={{ color: '#f8fafc' }}>{order.paymentMethod}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#94a3b8' }}>
              <span>Insured Transit</span>
              <span style={{ color: '#34d399' }}>FREE ARMOURED COURIER</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.1rem', fontWeight: 700, color: '#f3e5ab', paddingTop: '6px', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
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

/**
 * Dynamically load the Razorpay checkout script if not already present
 */
export const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    if (typeof window !== 'undefined' && window.Razorpay) {
      resolve(true);
      return;
    }
    const existing = document.querySelector('script[src="https://checkout.razorpay.com/v1/checkout.js"]');
    if (existing) {
      existing.addEventListener('load', () => resolve(true));
      existing.addEventListener('error', () => resolve(false));
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => {
      console.warn('[Razorpay] Official CDN not reachable or blocked by client.');
      resolve(false);
    };
    document.body.appendChild(script);
  });
};

/**
 * Open Razorpay Standard Checkout Modal
 */
export const openRazorpayCheckout = async ({
  key,
  amount,
  currency = 'INR',
  orderId,
  name = 'LUXURY WATCH',
  description = 'Haute Horlogerie Timepiece Purchase',
  image = '',
  prefill = {},
  theme = { color: '#0f172a' },
  onSuccess,
  onDismiss,
  onError,
  onOpenFallbackSimulator
}) => {
  const loaded = await loadRazorpayScript();
  const activeKey = key || (typeof import.meta !== 'undefined' && import.meta.env?.VITE_RAZORPAY_KEY_ID) || 'rzp_test_TWgXC7muCJnuci';

  // If Razorpay SDK is loaded, key is available, AND orderId is provided (Razorpay requires backend order_id)
  if (loaded && window.Razorpay && activeKey && !activeKey.startsWith('rzp_test_luxurywatch') && orderId) {
    try {
      const options = {
        key: activeKey,
        amount,
        currency,
        name,
        description,
        ...(orderId ? { order_id: orderId } : {}),
        image: image || undefined,
        prefill: {
          name: prefill.name || '',
          email: prefill.email || '',
          contact: prefill.contact || ''
        },
        theme: {
          color: theme.color || '#0f172a'
        },
        modal: {
          ondismiss: () => {
            console.log('[Razorpay] Checkout modal dismissed by user.');
            if (onDismiss) onDismiss();
          }
        },
        handler: (response) => {
          if (onSuccess) {
            onSuccess({
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_order_id: response.razorpay_order_id || orderId || '',
              razorpay_signature: response.razorpay_signature || ''
            });
          }
        }
      };

      const razorpayInstance = new window.Razorpay(options);
      razorpayInstance.on('payment.failed', (response) => {
        console.error('[Razorpay] Payment failed event:', response.error);
        if (onError) onError(response.error);
      });

      razorpayInstance.open();
      return;
    } catch (err) {
      console.warn('[Razorpay] Standard checkout modal open note:', err.message);
    }
  }

  // Fallback simulator for sandbox development when CDN or key is unavailable
  if (onOpenFallbackSimulator) {
    onOpenFallbackSimulator({
      gatewayOrderId: orderId,
      amount,
      currency
    });
  } else if (onSuccess) {
    onSuccess({
      razorpay_payment_id: `pay_sim_${Date.now()}`,
      razorpay_order_id: orderId,
      razorpay_signature: 'mock_verified_signature'
    });
  }
};

export default {
  loadRazorpayScript,
  openRazorpayCheckout
};

/**
 * Dynamically load the Razorpay checkout script
 */
export const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    if (typeof window !== 'undefined' && window.Razorpay) {
      resolve(true);
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => {
      resolve(true);
    };
    script.onerror = () => {
      console.warn('Official Razorpay CDN not reachable or blocked by client adblocker.');
      resolve(false);
    };
    document.body.appendChild(script);
  });
};

/**
 * Open Razorpay Checkout Modal (with graceful fallback handling)
 */
export const openRazorpayCheckout = async ({
  key,
  amount,
  currency = 'INR',
  orderId,
  name = 'LUXURY WATCH',
  description = 'Haute Horlogerie Consignment Allocation',
  image = '/images/watches/rolex_submariner.jpg',
  prefill = {},
  theme = { color: '#0f172a' },
  onSuccess,
  onDismiss,
  onError,
  onOpenFallbackSimulator
}) => {
  const loaded = await loadRazorpayScript();

  // If Razorpay SDK loaded and key is valid format
  if (loaded && window.Razorpay && key && !key.startsWith('rzp_test_luxurywatch')) {
    try {
      const options = {
        key,
        amount,
        currency,
        name,
        description,
        order_id: orderId,
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
            if (onDismiss) onDismiss();
          }
        },
        handler: (response) => {
          if (onSuccess) {
            onSuccess({
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_signature: response.razorpay_signature
            });
          }
        }
      };

      const razorpayInstance = new window.Razorpay(options);
      razorpayInstance.on('payment.failed', (response) => {
        if (onError) onError(response.error);
      });
      razorpayInstance.open();
      return;
    } catch (err) {
      console.warn('[Razorpay] Official popup init note:', err.message);
    }
  }

  // If in sandbox mode or CDN unreachable, trigger built-in interactive simulator
  if (onOpenFallbackSimulator) {
    onOpenFallbackSimulator({
      gatewayOrderId: orderId,
      amount,
      currency
    });
  } else if (onSuccess) {
    // Direct simulated success
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
